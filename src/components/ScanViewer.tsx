import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Contrast, Crosshair } from 'lucide-react';

interface ScanViewerProps {
  imageUrl: string;
  altText?: string;
  modality?: string;
}

export const ScanViewer: React.FC<ScanViewerProps> = ({
  imageUrl,
  altText = 'Thoracic Medical Scan',
  modality = 'Thoracic Imaging',
}) => {
  const [filterMode, setFilterMode] = useState<'standard' | 'high-contrast' | 'inverted' | 'bone'>('standard');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(false);

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'high-contrast':
        return 'contrast(160%) brightness(95%)';
      case 'inverted':
        return 'invert(100%) contrast(120%)';
      case 'bone':
        return 'contrast(200%) brightness(130%) grayscale(100%)';
      default:
        return 'none';
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const handleReset = () => {
    setZoomLevel(1);
    setFilterMode('standard');
    setShowCrosshair(false);
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col shadow-xl">
      {/* Viewer Top Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">{modality}</span>
          <span className="text-slate-500 text-[10px]">({Math.round(zoomLevel * 100)}%)</span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Contrast Mode Selector */}
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setFilterMode('standard')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                filterMode === 'standard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard Radiologic Lung Window"
            >
              Lung
            </button>
            <button
              onClick={() => setFilterMode('high-contrast')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                filterMode === 'high-contrast' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Enhanced Soft-Tissue Contrast"
            >
              Contrast+
            </button>
            <button
              onClick={() => setFilterMode('inverted')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                filterMode === 'inverted' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Inverted Grayscale Negative"
            >
              Invert
            </button>
          </div>

          {/* Crosshair Toggle */}
          <button
            onClick={() => setShowCrosshair(!showCrosshair)}
            className={`p-1.5 rounded-lg border transition ${
              showCrosshair ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle Inspection Reticle / Crosshair"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative w-full aspect-square max-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden p-4 select-none">
        <div
          className="relative transition-transform duration-200 ease-out origin-center flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-[420px] max-w-full object-contain rounded-lg transition-all duration-300"
            style={{ filter: getFilterStyle() }}
          />

          {/* Crosshair Overlay */}
          {showCrosshair && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-cyan-400/40" />
              <div className="absolute h-full w-[1px] bg-cyan-400/40" />
              <div className="absolute w-12 h-12 rounded-full border border-cyan-400/60" />
              <div className="absolute w-2 h-2 rounded-full bg-cyan-400/80" />
            </div>
          )}
        </div>

        {/* HUD Info Stamps */}
        <div className="pointer-events-none absolute bottom-3 left-3 text-[10px] font-mono text-cyan-400/80 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
          MODE: {filterMode.toUpperCase()} | MAG: {Math.round(zoomLevel * 100)}%
        </div>
      </div>
    </div>
  );
};
