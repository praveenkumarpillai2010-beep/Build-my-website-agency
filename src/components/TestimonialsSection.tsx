import React from 'react';
import { Star, MessageSquareQuote, CheckCircle, ShieldCheck } from 'lucide-react';
import { TESTIMONIALS } from '../data/agencyData';
import { Testimonial } from '../types';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-[#090d16] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Client Feedback</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Loved by Businesses
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-3">
            Read how businesses and founders accelerated their growth with custom websites and templates from BUILD MY WEBSITE.
          </p>

          <span className="text-[11px] text-slate-500 font-mono">
            * Clearly marked editable client reviews — update easily in agencyData.ts
          </span>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-6 sm:p-8 rounded-3xl bg-[#0d121f]/90 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between hover:shadow-xl"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                  "{t.review}"
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{t.name}</span>
                    {t.verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" title="Verified Client" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                  <div className="text-[11px] text-blue-400/90 font-medium">{t.business}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
