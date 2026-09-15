import React from 'react';
import { Sparkles, Smartphone, Zap, Search, TrendingUp, Headphones, CheckCircle2 } from 'lucide-react';
import { AGENCY_STATS, AGENCY_BENEFITS } from '../data/agencyData';

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-blue-400" />,
  Smartphone: <Smartphone className="w-5 h-5 text-indigo-400" />,
  Zap: <Zap className="w-5 h-5 text-amber-400" />,
  Search: <Search className="w-5 h-5 text-purple-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  Headphones: <Headphones className="w-5 h-5 text-cyan-400" />,
};

export const WhyUsSection: React.FC = () => {
  return (
    <section id="why-us" className="py-20 md:py-32 bg-[#090d16] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            <span>The Agency Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            More Than Just a Website.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            We don't just write code—we engineer an online asset that establishes instant authority, builds trust, and consistently captures high-value inquiries for your brand.
          </p>
        </div>

        {/* Animated Statistics Strip (Editable Placeholder Metrics) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d121f]/90 border border-white/10 text-center hover:border-blue-500/40 transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-5xl font-black text-white font-display mb-1 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {AGENCY_STATS.websitesCount}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              {AGENCY_STATS.websitesLabel}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Across 12+ industries</div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d121f]/90 border border-white/10 text-center hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-5xl font-black text-white font-display mb-1 bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              {AGENCY_STATS.clientsCount}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              {AGENCY_STATS.clientsLabel}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Founders & businesses</div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d121f]/90 border border-white/10 text-center hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-5xl font-black text-white font-display mb-1 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {AGENCY_STATS.supportAvailability}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              {AGENCY_STATS.supportLabel}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Direct WhatsApp channel</div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d121f]/90 border border-white/10 text-center hover:border-amber-500/40 transition-all hover:-translate-y-1">
            <div className="text-3xl sm:text-5xl font-black text-white font-display mb-1 bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              {AGENCY_STATS.deliverySpeed}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              {AGENCY_STATS.deliveryLabel}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Guaranteed milestone delivery</div>
          </div>
        </div>

        {/* 6 Key Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {AGENCY_BENEFITS.map((benefit, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.07] hover:border-white/20 transition-all hover:bg-white/[0.04] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5">
                  {BENEFIT_ICONS[benefit.iconName] || <Sparkles className="w-5 h-5 text-blue-400" />}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {benefit.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-blue-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Standard across all projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
