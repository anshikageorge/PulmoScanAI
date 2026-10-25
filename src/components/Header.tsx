import React from 'react';
import { Activity, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenGuidelines: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuidelines }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight">PulmoScan<span className="text-cyan-400">AI</span></span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                Oncology AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Lung Cancer Malignancy Risk & Nodule Analysis</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenGuidelines}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lung-RADS Guidelines</span>
            <span className="sm:hidden">Guidelines</span>
          </button>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs bg-slate-900/90 border border-slate-800 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini 3.8 Flash Multimodal</span>
          </div>
        </div>
      </div>
    </header>
  );
};
