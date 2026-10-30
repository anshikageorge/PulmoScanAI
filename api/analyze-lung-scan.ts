import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

// Vercel serverless function configuration (max 15s on Hobby, up to 60s on Pro)
export const config = {
  maxDuration: 15,
};

// Analysis schema for structured Gemini response
const lungCancerSchema = {
  type: Type.OBJECT,
  properties: {
    isMedicalLungScan: {
      type: Type.BOOLEAN,
      description: 'True if the image is a medical chest CT scan, chest radiograph (X-ray), or related thoracic scan. False if not thoracic medical imaging.',
    },
    nonMedicalExplanation: {
      type: Type.STRING,
      description: 'If isMedicalLungScan is false, brief friendly explanation for why the image could not be evaluated as a lung scan.',
    },
    imageModality: {
      type: Type.STRING,
      description: "Modality: 'Chest CT (Axial Window)', 'Chest CT (Coronal/Sagittal)', 'Chest Radiograph (PA/AP X-ray)', 'Low-Dose CT (LDCT)', or 'Other/Unspecified'.",
    },
    malignancyLikelihoodPercent: {
      type: Type.INTEGER,
      description: 'Estimated probability of malignancy as an integer from 0 to 100 based on standard imaging criteria (Fleischner/Lung-RADS).',
    },
    riskCategory: {
      type: Type.STRING,
      description: "One of: 'Low Risk (<10%)', 'Intermediate Suspicion (10-50%)', 'High Suspicion (>50%)', or 'Benign / Negative'.",
    },
    lungRadsCategory: {
      type: Type.STRING,
      description: "ACR Lung-RADS or Fleischner equivalent (e.g. 'Lung-RADS 1 (Negative)', 'Lung-RADS 2 (Benign Appearance)', 'Lung-RADS 3 (Probably Benign)', 'Lung-RADS 4A (Suspicious)', 'Lung-RADS 4B/4X (Very Suspicious)', or 'Radiograph Triage - Inconclusive').",
    },
    primaryNoduleOrLesion: {
      type: Type.OBJECT,
      properties: {
        detected: {
          type: Type.BOOLEAN,
          description: 'Whether any pulmonary nodule, mass, consolidation, or focal opacity was identified.',
        },
        estimatedSizeMm: {
          type: Type.STRING,
          description: "Estimated dimensions or diameter, e.g. '12 x 10 mm', '< 5 mm', or 'No discrete nodule'.",
        },
        anatomicalLocation: {
          type: Type.STRING,
          description: "Anatomical zone: e.g. 'Right Upper Lobe (peripheral)', 'Left Lower Lobe', 'Apical', 'Perihilar', or 'Clear'.",
        },
        attenuationType: {
          type: Type.STRING,
          description: "Nodule composition: 'Solid', 'Part-solid / subsolid', 'Pure ground-glass (pGGO)', 'Cavitary', or 'Clear parenchyma'.",
        },
        marginCharacteristics: {
          type: Type.STRING,
          description: "Margins: 'Spiculated / corona radiata', 'Lobulated', 'Smooth & well-circumscribed', 'Ill-defined', or 'Normal'.",
        },
        calcificationPattern: {
          type: Type.STRING,
          description: "Pattern: 'Central/diffuse/popcorn (benign hallmark)', 'Eccentric / stippled (indeterminate)', 'Absent / non-calcified', or 'N/A'.",
        },
      },
      required: [
        'detected',
        'estimatedSizeMm',
        'anatomicalLocation',
        'attenuationType',
        'marginCharacteristics',
        'calcificationPattern',
      ],
    },
    malignancyRiskFactors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific high-suspicion radiologic findings that elevate malignancy probability.',
    },
    benignOrReassuringFactors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Reassuring findings consistent with benign etiologies (e.g., granuloma, hamartoma, resolving infection).',
    },
    detailedFindingsSummary: {
      type: Type.STRING,
      description: 'Comprehensive 2-4 sentence radiologic summary of findings, parenchyma state, and morphological impression.',
    },
    recommendedAction: {
      type: Type.STRING,
      description: 'Evidence-based next step: e.g. Annual low-dose CT screening, 3-6 month follow-up CT, PET-CT avidity scan, biopsy referral.',
    },
    clinicalDisclaimer: {
      type: Type.STRING,
      description: 'Medical safety statement clarifying this is an assistive AI tool, not a diagnostic pathology report.',
    },
  },
  required: [
    'isMedicalLungScan',
    'imageModality',
    'malignancyLikelihoodPercent',
    'riskCategory',
    'lungRadsCategory',
    'primaryNoduleOrLesion',
    'malignancyRiskFactors',
    'benignOrReassuringFactors',
    'detailedFindingsSummary',
    'recommendedAction',
    'clinicalDisclaimer',
  ],
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString('utf-8'));
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    } else if (!body) {
      body = {};
    }

    const { imageBase64, mimeType = 'image/jpeg', scanContext } = body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided. Please upload a thoracic CT scan or chest X-ray image.' });
    }

    // Check multiple common environment variable names for the API key
    const rawApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.VITE_GOOGLE_API_KEY;

    let cleanApiKey = (rawApiKey || '').trim();
    if (
      (cleanApiKey.startsWith('"') && cleanApiKey.endsWith('"')) ||
      (cleanApiKey.startsWith("'") && cleanApiKey.endsWith("'"))
    ) {
      cleanApiKey = cleanApiKey.slice(1, -1).trim();
    }

    if (!cleanApiKey) {
      return res.status(500).json({
        error:
          'No API key detected in Vercel environment. Please go to Vercel Project Settings > Environment Variables, add GEMINI_API_KEY or GOOGLE_API_KEY (with Production & Preview checked), and then click Deployments > Redeploy for the changes to take effect.',
      });
    }

    // Clean base64 if it has data URL prefix
    let cleanBase64 = imageBase64;
    let effectiveMime = mimeType;
    if (imageBase64.includes('base64,')) {
      const parts = imageBase64.split('base64,');
      cleanBase64 = parts[1];
      const match = parts[0].match(/data:(.*?);/);
      if (match && match[1]) {
        effectiveMime = match[1];
      }
    }

    // Ensure MIME type is acceptable for Gemini multimodal vision
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(effectiveMime)) {
      effectiveMime = 'image/jpeg';
    }

    const ai = new GoogleGenAI({
      apiKey: cleanApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are an expert thoracic radiologist and pulmonologist evaluating a lung medical image (Chest CT scan or Chest X-ray) for signs of pulmonary nodules, masses, or malignancy risk.
Analyze the image with careful clinical scrutiny adhering to ACR Lung-RADS v2022 and Fleischner Society guidelines.

Context provided by user/technician: ${scanContext || 'Routine screening / diagnostic evaluation'}.

Instructions:
1. Verify if the image is thoracic medical imaging (Chest CT, Chest X-ray, axial/coronal/sagittal slices). If it is not a medical lung scan (e.g., photo of a cat, car, random document), set isMedicalLungScan to false and provide a helpful message in nonMedicalExplanation.
2. If it is a thoracic medical scan:
   - Identify the modality and orientation.
   - Inspect lung fields systematically for solitary or multiple pulmonary nodules, ground-glass opacities (GGOs), spiculated masses, pleural tagging, cavitation, lymphadenopathy, or consolidation.
   - Evaluate size, attenuation (solid vs part-solid vs non-solid), border characteristics (smooth, lobulated, spiculated/corona radiata), and calcification pattern.
   - Compute estimated malignancy likelihood percentage (0-100%):
     * <10%: Typically Lung-RADS 1-2 (benign hallmarks, stable granuloma, smooth <6mm solid nodule, typical hamartoma).
     * 10-50%: Lung-RADS 3 or 4A (indeterminate 6-8mm solid nodule, growing subsolid nodule, lobulated borders).
     * >50%: Lung-RADS 4B/4X or clear suspicious mass (spiculated borders, part-solid with solid component >8mm, corona radiata, eccentric stippling).
   - List key malignancy risk factors and reassuring benign factors observed.
   - Provide standard clinical follow-up recommendations (e.g. 12mo screening, 3mo LDCT, PET-CT, tissue biopsy).
   - Include standard investigative medical disclaimer.
`;

    // Generate analysis with multi-model failover and automatic 503 retry
    const responseText = await generateAnalysisWithFallback(
      ai,
      effectiveMime,
      cleanBase64,
      promptText,
      lungCancerSchema
    );

    const parsedData = JSON.parse(responseText);
    return res.status(200).json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('Error analyzing lung scan:', error);
    let userMsg = error?.message || 'Failed to process the scan.';

    // Try parsing stringified JSON error messages from Google API
    try {
      const parsedErr = JSON.parse(userMsg);
      if (parsedErr?.error?.message) {
        userMsg = parsedErr.error.message;
      }
    } catch (_) {
      // not JSON string
    }

    if (
      userMsg.includes('503') ||
      userMsg.includes('high demand') ||
      userMsg.includes('UNAVAILABLE') ||
      userMsg.includes('temporarily')
    ) {
      userMsg =
        'Google Gemini servers are temporarily experiencing a high demand spike. Please wait a few seconds and click "Retry Scan".';
    } else if (userMsg.includes('API_KEY_INVALID') || userMsg.includes('API key not valid')) {
      userMsg =
        'Invalid Google API Key. Please verify the key in Vercel Environment Variables and ensure it has Gemini API enabled in Google AI Studio.';
    } else if (userMsg.includes('RESOURCE_EXHAUSTED') || userMsg.includes('Quota')) {
      userMsg = 'Gemini API quota exceeded for this key. Please check your rate limits or billing in Google AI Studio.';
    }

    return res.status(500).json({ error: userMsg });
  }
}

async function generateAnalysisWithFallback(
  ai: GoogleGenAI,
  effectiveMime: string,
  cleanBase64: string,
  promptText: string,
  schema: any
): Promise<string> {
  // Ordered models to try: high-capacity gemini-3.1-flash-lite first (immune to 3.8 demand spikes), then 3.8 flash with low thinking
  const attempts: Array<{ model: string; thinkingLevel?: ThinkingLevel }> = [
    { model: 'gemini-3.1-flash-lite' },
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    { model: 'gemini-flash-latest' },
  ];

  let lastError: any = null;

  for (let i = 0; i < attempts.length; i++) {
    const { model, thinkingLevel } = attempts[i];
    try {
      const config: any = {
        systemInstruction:
          'You are a board-certified thoracic radiologist AI assistant specializing in pulmonary nodule characterization, Lung-RADS assessment, and chest imaging interpretation. Provide objective, concise, and structured diagnostic evaluations.',
        responseMimeType: 'application/json',
        responseSchema: schema,
      };

      if (thinkingLevel) {
        config.thinkingConfig = { thinkingLevel };
      }

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: effectiveMime,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const is503 =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('high demand') ||
        err?.status === 503;

      console.warn(`Model ${model} attempt failed (transient 503=${is503}):`, err?.message);

      // If transient 503, pause briefly before trying next model
      if (is503 && i < attempts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  throw lastError || new Error('All model attempts failed to process scan.');
}
