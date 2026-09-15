import React from 'react';
import { MousePointerClick, Wrench, CheckSquare, Rocket, ArrowRight } from 'lucide-react';
import { TIMELINE_STEPS } from '../data/agencyData';

const STEP_ICONS: Record<string, React.ReactNode> = {
  MousePointerClick: <MousePointerClick className="w-6 h-6 text-blue-400" />,
  Wrench: <Wrench className="w-6 h-6 text-indigo-400" />,
  CheckSquare: <CheckSquare className="w-6 h-6 text-purple-400" />,
  Rocket: <Rocket className="w-6 h-6 text-emerald-400" />,
};

interface HowItWorksProps {
  onGetStarted: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onGetStarted }) => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-[#07090e] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            <span>Simple 4-Step Process</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            How It Works
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            From initial concept to a live, high-converting website in four effortless steps. We handle the design, code, and technical hosting setup.
          </p>
        </div>

        {/* Timeline Grid with Connecting Line */}
        <div className="relative">
          {/* Subtle horizontal connecting bar (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 -translate-y-12 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {TIMELINE_STEPS.map((stepItem, idx) => (
              <div
                key={stepItem.step}
                className="group relative rounded-3xl bg-[#0d121f]/90 border border-white/[0.08] hover:border-blue-500/40 p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div>
                  {/* Step Number & Icon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-black font-display tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {stepItem.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                      {STEP_ICONS[stepItem.iconName] || <Rocket className="w-6 h-6 text-blue-400" />}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {stepItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-blue-400 mb-3">
                    {stepItem.description}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {stepItem.detail}
                  </p>
                </div>

                {/* Progress Pill indicator */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Phase {idx + 1} of 4</span>
                  <span className="text-slate-500">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA prompt */}
        <div className="mt-16 text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 transition-all cursor-pointer"
          >
            <span>Start Step 01 Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
