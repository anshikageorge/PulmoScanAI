import React from 'react';
import { X, BookOpen, ShieldCheck, AlertCircle, AlertTriangle, Activity } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = [
    {
      rads: 'Category 1: Negative',
      risk: '< 1% Malignancy',
      color: 'border-emerald-800 bg-emerald-950/40 text-emerald-300',
      description: 'No pulmonary nodules or presence of definitively benign nodules (e.g., complete or central calcification).',
      management: 'Continue routine annual low-dose CT (LDCT) in 12 months.',
    },
    {
      rads: 'Category 2: Benign Appearance',
      risk: '< 1% Malignancy',
      color: 'border-emerald-800 bg-emerald-950/40 text-emerald-300',
      description: 'Solid nodule < 6 mm, new solid nodule < 4 mm, non-solid nodule (GGO) < 30 mm, or category 3/4 nodule stable for ≥ 3 months.',
      management: 'Continue routine annual LDCT in 12 months.',
    },
    {
      rads: 'Category 3: Probably Benign',
      risk: '1 - 2% Malignancy',
      color: 'border-amber-800 bg-amber-950/40 text-amber-300',
      description: 'Solid nodule ≥ 6 to < 8 mm at baseline, or new solid nodule 4 to < 6 mm; part-solid nodule ≥ 6 mm with solid component < 6 mm.',
      management: '6-month low-dose CT follow-up.',
    },
    {
      rads: 'Category 4A: Suspicious',
      risk: '5 - 15% Malignancy',
      color: 'border-orange-800 bg-orange-950/40 text-orange-300',
      description: 'Solid nodule ≥ 8 to < 15 mm at baseline, or new 6 to < 8 mm; part-solid nodule with solid component ≥ 6 to < 8 mm.',
      management: '3-month LDCT or PET-CT scan if solid component ≥ 8 mm.',
    },
    {
      rads: 'Category 4B / 4X: Very Suspicious',
      risk: '> 15% Malignancy',
      color: 'border-rose-800 bg-rose-950/40 text-rose-300',
      description: 'Solid nodule ≥ 15 mm, or new/growing ≥ 8 mm; category 3/4 nodules with additional suspicious features (spiculation, adenopathy).',
      management: 'Diagnostic chest CT with IV contrast, PET-CT, and/or tissue biopsy with multidisciplinary oncology consult.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">ACR Lung-RADS® v2022 Reference</h3>
              <p className="text-[11px] text-slate-400">Lung CT Screening Reporting and Data System Standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            The American College of Radiology (ACR) Lung-RADS classification standardizes pulmonary nodule evaluation and follow-up recommendations to minimize unnecessary invasive procedures while identifying malignancies early.
          </p>

          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${cat.color}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs">{cat.rads}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/80 border border-current">
                    {cat.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-1.5 leading-relaxed">{cat.description}</p>
                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <strong className="text-slate-300">Action:</strong>
                  <span>{cat.management}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
