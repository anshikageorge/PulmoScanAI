import React, { useState } from 'react';
import {
  LungAnalysisResult,
} from '../types';
import { MalignancyGauge } from './MalignancyGauge';
import {
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Info,
  CheckCircle,
  FileCheck2,
  Printer,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AnalysisReportProps {
  result: LungAnalysisResult;
  onReset: () => void;
  imageUrl?: string;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  result,
  onReset,
  imageUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'nodule' | 'recommendations'>('overview');

  const handlePrint = () => {
    window.print();
  };

  if (!result.isMedicalLungScan) {
    return (
      <div className="rounded-2xl border border-amber-800/80 bg-amber-950/30 p-6 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-900/60 border border-amber-700 flex items-center justify-center text-amber-300">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Non-Thoracic Image Detected</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          {result.nonMedicalExplanation ||
            'The uploaded image does not appear to be a medical chest CT scan or chest radiograph. Please upload a thoracic imaging file.'}
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          Try Another Scan
        </button>
      </div>
    );
  }

  const nodule = result.primaryNoduleOrLesion;

  return (
    <div className="space-y-6">
      {/* Top Malignancy & Modality Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Likelihood Gauge */}
        <div className="md:col-span-1">
          <MalignancyGauge
            score={result.malignancyLikelihoodPercent}
            category={result.riskCategory}
            lungRads={result.lungRadsCategory}
          />
        </div>

        {/* Executive Radiologic Impression */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Thoracic Diagnostic Impression
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/60">
                {result.imageModality}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-1.5 flex items-center space-x-1.5">
                <span>Summary Findings</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {result.detailedFindingsSummary}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800/60">
              <span className="block text-[10px] uppercase text-slate-400">Nodule Status</span>
              <span className="text-xs font-bold text-slate-200">
                {nodule.detected ? 'Detected' : 'No Mass Seen'}
              </span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800/60">
              <span className="block text-[10px] uppercase text-slate-400">Estimated Size</span>
              <span className="text-xs font-bold text-cyan-300">
                {nodule.estimatedSizeMm || 'N/A'}
              </span>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800/60">
              <span className="block text-[10px] uppercase text-slate-400">Attenuation</span>
              <span className="text-xs font-bold text-slate-200 truncate block">
                {nodule.attenuationType || 'Standard'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for detailed breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex border-b border-slate-800 mb-6 space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Risk Indicators</span>
          </button>
          <button
            onClick={() => setActiveTab('nodule')}
            className={`pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'nodule'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Nodule Morphometry</span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 px-3 text-xs font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'recommendations'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Next Steps</span>
          </button>
        </div>

        {/* Tab 1: Risk Indicators */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suspicious Malignancy Factors */}
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Malignancy Suspicion Factors ({result.malignancyRiskFactors?.length || 0})
                </h4>
              </div>

              {result.malignancyRiskFactors && result.malignancyRiskFactors.length > 0 ? (
                <ul className="space-y-2">
                  {result.malignancyRiskFactors.map((factor, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-rose-200 flex items-start space-x-2 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40"
                    >
                      <span className="text-rose-400 font-bold shrink-0">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No overt high-risk features detected.</p>
              )}
            </div>

            {/* Reassuring Benign Factors */}
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Reassuring / Benign Hallmarks ({result.benignOrReassuringFactors?.length || 0})
                </h4>
              </div>

              {result.benignOrReassuringFactors && result.benignOrReassuringFactors.length > 0 ? (
                <ul className="space-y-2">
                  {result.benignOrReassuringFactors.map((factor, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-emerald-200 flex items-start space-x-2 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/40"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No specific benign hallmarks identified.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Nodule Morphometry */}
        {activeTab === 'nodule' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Anatomical Location
              </span>
              <span className="text-xs font-medium text-slate-200">
                {nodule.anatomicalLocation || 'Not specified'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Estimated Dimensions
              </span>
              <span className="text-xs font-medium text-cyan-300 font-mono">
                {nodule.estimatedSizeMm || 'None detected'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Attenuation & Density
              </span>
              <span className="text-xs font-medium text-slate-200">
                {nodule.attenuationType || 'Homogeneous'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Margin / Border Outline
              </span>
              <span className="text-xs font-medium text-slate-200">
                {nodule.marginCharacteristics || 'Smooth'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Calcification Pattern
              </span>
              <span className="text-xs font-medium text-slate-200">
                {nodule.calcificationPattern || 'Non-calcified'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Lung-RADS Assessment
              </span>
              <span className="text-xs font-medium text-cyan-400 font-semibold">
                {result.lungRadsCategory}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="bg-cyan-950/30 border border-cyan-800/80 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider mb-2">
                <Stethoscope className="w-4 h-4" />
                <span>Evidence-Based Guideline Action</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {result.recommendedAction}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">Standard Follow-Up Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-300">Lung-RADS 1 & 2:</strong> Continue routine annual low-dose CT (LDCT) screening.</li>
                <li><strong className="text-slate-300">Lung-RADS 3:</strong> 6-month low-dose CT follow-up to assess stability.</li>
                <li><strong className="text-slate-300">Lung-RADS 4A:</strong> 3-month LDCT or PET-CT scan if solid component &gt; 8mm.</li>
                <li><strong className="text-slate-300">Lung-RADS 4B/4X:</strong> Chest CT with contrast, PET-CT avidity, and/or tissue biopsy with pulmonology consultation.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center space-x-2"
          >
            <span>Analyze Another Scan</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 transition flex items-center space-x-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save Assessment</span>
          </button>
        </div>
      </div>

      {/* Safety & Clinical Disclaimer */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 flex items-start space-x-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Investigative Medical Disclaimer: </strong>
          {result.clinicalDisclaimer ||
            'This application utilizes artificial intelligence for assistive screening and research purposes. It does not replace definitive medical diagnosis by a board-certified radiologist or oncologist. Clinical management decisions must be guided by verified physician consultation.'}
        </p>
      </div>
    </div>
  );
};
