export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  return res.status(200).json({
    status: 'ok',
    apiKeyConfigured: isConfigured,
    detectedVariable,
    message: isConfigured
      ? `API key detected successfully under '${detectedVariable}'. The server is ready to evaluate scans.`
      : 'No API key detected in Vercel environment. Please add GEMINI_API_KEY or GOOGLE_API_KEY in Vercel Project Settings > Environment Variables, and ensure you redeploy.',
  });
}
