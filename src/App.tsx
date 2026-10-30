import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScanUploader } from './components/ScanUploader';
import { ScanViewer } from './components/ScanViewer';
import { AnalysisReport } from './components/AnalysisReport';
import { GuidelinesModal } from './components/GuidelinesModal';
import { SAMPLE_SCANS } from './data/sampleScans';
import { LungAnalysisResult, SampleScan } from './types';
import { prepareImageForAnalysis } from './utils/imageUtils';
import {
  Activity,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileSearch,
  Upload,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [scanFilename, setScanFilename] = useState<string>('');
  const [patientContext, setPatientContext] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<LungAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  // Auto-load benchmark sample 1 on first launch so user immediately sees a working scanner
  useEffect(() => {
    const defaultSample = SAMPLE_SCANS[0];
    setSelectedImage(defaultSample.previewUrl);
    setSelectedMimeType('image/svg+xml');
    setScanFilename(defaultSample.name);
    setSelectedSampleId(defaultSample.id);
    setPatientContext(defaultSample.defaultContext || '');
  }, []);

  const handleSelectSample = (sample: SampleScan) => {
    setSelectedImage(sample.previewUrl);
    setSelectedMimeType('image/svg+xml');
    setScanFilename(sample.name);
    setSelectedSampleId(sample.id);
    setPatientContext(sample.defaultContext || '');
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleCustomImage = (
    base64Data: string,
    mimeType: string,
    filename: string,
    context?: string
  ) => {
    setSelectedImage(base64Data);
    setSelectedMimeType(mimeType);
    setScanFilename(filename);
    setSelectedSampleId(null);
    if (context) setPatientContext(context);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);

    const steps = [
      'Normalizing lung window contrast...',
      'Segmenting lung parenchyma & mediastinum...',
      'Screening for solitary pulmonary nodules & GGOs...',
      'Evaluating margin spiculation & attenuation...',
      'Synthesizing ACR Lung-RADS malignancy likelihood...',
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 900);

    try {
      const prepared = await prepareImageForAnalysis(selectedImage, selectedMimeType);

      const response = await fetch('/api/analyze-lung-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: prepared.base64,
          mimeType: prepared.mimeType,
          scanContext: patientContext,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          response.status === 404
            ? 'API endpoint /api/analyze-lung-scan was not found. Please verify that your Vercel deployment includes the api/ folder.'
            : `Server returned HTTP ${response.status}: ${text.slice(0, 160)}`
        );
      }

      clearInterval(stepInterval);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Server error (HTTP ${response.status}) occurred during scan analysis.`);
      }

      setAnalysisResult(data.result);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Scan evaluation failed:', err);
      setErrorMessage(
        err?.message ||
          'Failed to complete lung scan analysis. Please check your image format or verify your Gemini API connection.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Header onOpenGuidelines={() => setIsGuidelinesOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deep-Learning Thoracic Malignancy Screener</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Simple Lung Cancer Malignancy Detection
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Upload a thoracic CT scan or chest radiograph. PulmoScan analyzes pulmonary nodules,
              margin spiculation, attenuation density, and computes the ACR Lung-RADS malignancy likelihood.
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-800 bg-rose-950/40 p-4 flex items-start space-x-3 text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="font-semibold block text-sm text-rose-300">Analysis Error</strong>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Viewer & Actions (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSearch className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Active Thoracic Scan
                </h2>
              </div>
              {selectedSampleId && (
                <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                  Clinical Benchmark
                </span>
              )}
            </div>

            {selectedImage ? (
              <div className="space-y-4">
                <ScanViewer
                  imageUrl={selectedImage}
                  altText={scanFilename || 'Chest Scan'}
                  modality={scanFilename || 'Thoracic Scan Slice'}
                />

                {/* Primary Action Button */}
                <div className="space-y-2">
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span className="text-slate-950">{loadingStep || 'Evaluating Malignancy...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>Process Scan & Detect Malignancy</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    Runs on Gemini 3.8 Flash multimodal vision with ACR Lung-RADS prompt reasoning
                  </p>
                </div>
              </div>
            ) : null}

            {/* Quick Upload or Switch Scan Card */}
            <div className="pt-2">
              <ScanUploader
                onImageSelected={handleCustomImage}
                isLoading={isLoading}
                selectedSampleId={selectedSampleId}
                onSelectSample={handleSelectSample}
              />
            </div>
          </div>

          {/* Right Column: Diagnostic Results (7 cols on lg) */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center flex flex-col items-center justify-center min-h-[460px] space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center">
                    <Activity className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/20" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Analyzing Thoracic Morphology</h3>
                  <p className="text-xs text-cyan-400 font-mono tracking-wide">{loadingStep}</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-3">
                    Evaluating nodule dimensions, spiculation, internal density, and Lung-RADS score.
                  </p>
                </div>
              </div>
            ) : analysisResult ? (
              <AnalysisReport
                result={analysisResult}
                onReset={handleReset}
                imageUrl={selectedImage || undefined}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Activity className="w-8 h-8 text-slate-600" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-semibold text-slate-300 mb-1">
                    Ready for Malignancy Evaluation
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Click <strong>&quot;Process Scan & Detect Malignancy&quot;</strong> to examine the active
                    CT/X-ray slice, or choose a benchmark case from the left panel.
                  </p>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={!selectedImage || isLoading}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-slate-950 transition shadow-lg shadow-cyan-600/20 inline-flex items-center space-x-2"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Run Analysis Now</span>
                  </button>
                </div>

                <div className="w-full max-w-sm pt-6 mt-4 border-t border-slate-900 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
                  <div className="p-2 rounded bg-slate-900/40">
                    <span className="block text-slate-400 font-semibold">Fleischner</span>
                    Criteria
                  </div>
                  <div className="p-2 rounded bg-slate-900/40">
                    <span className="block text-slate-400 font-semibold">Lung-RADS</span>
                    v2022
                  </div>
                  <div className="p-2 rounded bg-slate-900/40">
                    <span className="block text-slate-400 font-semibold">0 - 100%</span>
                    Probability
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Guidelines Modal */}
      <GuidelinesModal isOpen={isGuidelinesOpen} onClose={() => setIsGuidelinesOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">PulmoScan AI</span>
            <span>• Thoracic Oncology Screening</span>
          </div>
          <p className="text-[11px] text-slate-400">
            For clinical investigative & educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
