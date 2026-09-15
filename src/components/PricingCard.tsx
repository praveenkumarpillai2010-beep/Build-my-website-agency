import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { PricingPlan } from '../types';

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelectPlan }) => {
  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
        plan.popular
          ? 'bg-gradient-to-b from-[#131a30] to-[#0c101d] border-2 border-blue-500/60 shadow-2xl shadow-blue-500/20 md:-translate-y-2'
          : 'bg-[#0d111c]/80 border border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 tracking-wider uppercase">
          {plan.badge || 'Most Popular'}
        </div>
      )}

      <div>
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
          <p className="text-xs text-slate-400 min-h-[32px] mt-1">{plan.subtitle}</p>
        </div>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              $
            </span>
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {plan.price.replace('$', '')}
            </span>
            <span className="text-xs text-slate-400 font-semibold ml-1">USD</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            One-time project fee • No hidden monthly charges
          </span>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-8">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            What's Included:
          </span>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => onSelectPlan(plan)}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
          plan.popular
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10'
        }`}
      >
        <span>{plan.buttonText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
