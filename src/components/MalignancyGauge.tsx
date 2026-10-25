import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface MalignancyGaugeProps {
  score: number;
  category: string;
  lungRads: string;
}

export const MalignancyGauge: React.FC<MalignancyGaugeProps> = ({ score, category, lungRads }) => {
  // Determine color scheme based on score
  const isHigh = score >= 50;
  const isMedium = score >= 15 && score < 50;
  const isLow = score < 15;

  const colorConfig = isHigh
    ? {
        stroke: '#f43f5e', // rose-500
        bgGlow: 'from-rose-500/20 via-rose-500/5 to-transparent',
        badgeBg: 'bg-rose-950/80 border-rose-800 text-rose-300',
        textGradient: 'from-rose-400 to-rose-200',
        barColor: 'bg-rose-500',
        icon: AlertTriangle,
        iconColor: 'text-rose-400',
      }
    : isMedium
    ? {
        stroke: '#f59e0b', // amber-500
        bgGlow: 'from-amber-500/20 via-amber-500/5 to-transparent',
        badgeBg: 'bg-amber-950/80 border-amber-800 text-amber-300',
        textGradient: 'from-amber-400 to-amber-200',
        barColor: 'bg-amber-500',
        icon: AlertCircle,
        iconColor: 'text-amber-400',
      }
    : {
        stroke: '#10b981', // emerald-500
        bgGlow: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
        badgeBg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
        textGradient: 'from-emerald-400 to-emerald-200',
        barColor: 'bg-emerald-500',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
      };

  const Icon = colorConfig.icon;

  // Arc calculation for SVG gauge (semicircle or 220 degree arc)
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // 180 deg semicircle
  const boundedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (boundedScore / 100) * circumference;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b ${colorConfig.bgGlow} bg-slate-900/90 p-6 flex flex-col items-center text-center shadow-xl`}>
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Malignancy Assessment
        </span>
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorConfig.badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{category}</span>
        </div>
      </div>

      {/* Radial Gauge SVG */}
      <div className="relative w-52 h-32 flex items-center justify-center">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <path
            d="M 20 105 A 80 80 0 0 1 180 105"
            fill="none"
            stroke={colorConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <div className="flex items-baseline">
            <span className={`text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r ${colorConfig.textGradient} bg-clip-text text-transparent`}>
              {boundedScore}
            </span>
            <span className="text-xl font-bold text-slate-400 ml-1">%</span>
          </div>
          <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
            Likelihood
          </span>
        </div>
      </div>

      {/* Threshold Reference Indicator */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
          <span>0% Benign</span>
          <span>15% Low</span>
          <span>50% High</span>
          <span>100%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div className="w-[15%] bg-emerald-500/80 h-full border-r border-slate-900" title="Low Risk (<15%)" />
          <div className="w-[35%] bg-amber-500/80 h-full border-r border-slate-900" title="Intermediate Suspicion (15-50%)" />
          <div className="w-[50%] bg-rose-500/80 h-full" title="High Suspicion (>50%)" />
        </div>

        {/* Lung-RADS Tag */}
        <div className="mt-3 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">ACR Category:</span>
          <span className="text-xs font-semibold text-cyan-300">{lungRads}</span>
        </div>
      </div>
    </div>
  );
};
