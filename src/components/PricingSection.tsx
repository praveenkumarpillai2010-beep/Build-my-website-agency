import React from 'react';
import { PRICING_PLANS } from '../data/agencyData';
import { PricingCard } from './PricingCard';
import { PricingPlan } from '../types';
import { ShieldCheck, HelpCircle } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-[#090d16] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            <span>Transparent Investment</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Simple Pricing. Powerful Websites.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-4">
            Clear, honest pricing with zero surprise charges. All plans include mobile responsiveness, free SSL encryption setup, and WhatsApp integration.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 bg-white/[0.02] inline-block px-4 py-1.5 rounded-full border border-white/5">
            ✦ Note: Prices shown are starting estimates and can vary based on exact custom page count and advanced integration requirements.
          </p>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} onSelectPlan={onSelectPlan} />
          ))}
        </div>

        {/* Value Guarantees Banner */}
        <div className="mt-16 p-6 rounded-3xl bg-white/[0.02] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="text-emerald-400 font-bold text-sm mb-1">✓ 100% Code & Asset Ownership</div>
            <div className="text-xs text-slate-400">You retain full IP rights and complete administrative access to your website.</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-blue-400 font-bold text-sm mb-1">✓ Private Staging Link Included</div>
            <div className="text-xs text-slate-400">Test every page on your smartphone and computer before pushing live.</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-purple-400 font-bold text-sm mb-1">✓ Dedicated WhatsApp Assistance</div>
            <div className="text-xs text-slate-400">Direct technical line with our development team for immediate questions.</div>
          </div>
        </div>
      </div>
    </section>
  );
};
