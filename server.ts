import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with large limit for image data URLs
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Analysis schema for structured Gemini 3.8 Flash response
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

// Health check endpoint for testing environment configuration
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasGoogleKey = Boolean(process.env.GOOGLE_API_KEY);
  const hasGenAiKey = Boolean(process.env.GOOGLE_GENAI_API_KEY);
  const hasApiKey = Boolean(process.env.API_KEY);
  const hasViteGeminiKey = Boolean(process.env.VITE_GEMINI_API_KEY);
  const hasViteGoogleKey = Boolean(process.env.VITE_GOOGLE_API_KEY);

  const isConfigured =
    hasGeminiKey || hasGoogleKey || hasGenAiKey || hasApiKey || hasViteGeminiKey || hasViteGoogleKey;

  let detectedVariable: string | null = null;
  if (hasGeminiKey) detectedVariable = 'GEMINI_API_KEY';
  else if (hasGoogleKey) detectedVariable = 'GOOGLE_API_KEY';
  else if (hasGenAiKey) detectedVariable = 'GOOGLE_GENAI_API_KEY';
  else if (hasApiKey) detectedVariable = 'API_KEY';
  else if (hasViteGeminiKey) detectedVariable = 'VITE_GEMINI_API_KEY';
  else if (hasViteGoogleKey) detectedVariable = 'VITE_GOOGLE_API_KEY';

  res.json({
    status: 'ok',
    apiKeyConfigured: isConfigured,
    detectedVariable,
    message: isConfigured
      ? `API key detected successfully under '${detectedVariable}'.`
      : 'No API key detected in environment variables. Add GEMINI_API_KEY or GOOGLE_API_KEY.',
  });
});

// API Endpoint to analyze lung scan
app.post('/api/analyze-lung-scan', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', scanContext } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided. Please upload a thoracic CT scan or chest X-ray image.' });
    }

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
          'GEMINI_API_KEY or GOOGLE_API_KEY is not configured in server environment. Please configure it in your environment variables.',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
      config: {
        systemInstruction:
          'You are a board-certified thoracic radiologist AI assistant specializing in pulmonary nodule characterization, Lung-RADS assessment, and chest imaging interpretation. Provide objective, precise, and structured diagnostic evaluations.',
        responseMimeType: 'application/json',
        responseSchema: lungCancerSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response returned from the model.');
    }

    const parsedData = JSON.parse(responseText);
    return res.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('Error analyzing lung scan:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process the scan. Please check your image format and try again.',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
