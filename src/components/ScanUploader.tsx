import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileText, Check, ChevronRight } from 'lucide-react';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { SampleScan } from '../types';

interface ScanUploaderProps {
  onImageSelected: (base64Data: string, mimeType: string, filename: string, context?: string) => void;
  isLoading: boolean;
  selectedSampleId: string | null;
  onSelectSample: (sample: SampleScan) => void;
}

export const ScanUploader: React.FC<ScanUploaderProps> = ({
  onImageSelected,
  isLoading,
  selectedSampleId,
  onSelectSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [patientContext, setPatientContext] = useState('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (e.g. PNG, JPG, WEBP, or DICOM screen capture).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type, file.name, patientContext);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30 ring-4 ring-cyan-500/20'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={isLoading}
        />

        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-lg shadow-cyan-950">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-slate-100 mb-1">
          Upload Chest CT Scan or Radiograph
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-3">
          Drag & drop your thoracic image slice or X-ray (PNG, JPG, DICOM snapshot), or click to browse files
        </p>

        <div className="inline-flex items-center space-x-2 text-[11px] font-medium text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
          <Sparkles className="w-3 h-3" />
          <span>Supports Axial CT Lung Windows & Chest X-Rays</span>
        </div>
      </div>

      {/* Preset Clinical Benchmark Scans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Or Try A Clinical Benchmark Scan
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">1-click test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_SCANS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  onSelectSample(sample);
                  if (sample.defaultContext) {
                    setPatientContext(sample.defaultContext);
                  }
                }}
                disabled={isLoading}
                className={`relative flex items-center p-3 rounded-xl border text-left transition-all group ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500 shadow-md shadow-cyan-950'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-black border border-slate-800 overflow-hidden shrink-0 mr-3 flex items-center justify-center p-0.5">
                  <img
                    src={sample.previewUrl}
                    alt={sample.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {sample.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-cyan-400 truncate mt-0.5">
                    {sample.subtitle}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {sample.modality}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Context / Patient Note Input (Optional) */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
        <label className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 mb-2">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Clinical Context or Indication (Optional)</span>
        </label>
        <input
          type="text"
          value={patientContext}
          onChange={(e) => setPatientContext(e.target.value)}
          placeholder="e.g. 62yo male, heavy smoker, persistent cough, screening CT"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          disabled={isLoading}
        />
        <p className="text-[11px] text-slate-500 mt-1.5">
          Providing patient age, smoking history, or screening type helps contextualize Lung-RADS risk calculations.
        </p>
      </div>
    </div>
  );
};
