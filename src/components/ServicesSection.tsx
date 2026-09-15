import React from 'react';
import { Sparkles, Layers, ArrowRight } from 'lucide-react';
import { SERVICES } from '../data/agencyData';
import { ServiceCard } from './ServiceCard';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-20 md:py-32 bg-[#07090e] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>End-to-End Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Services Built For Modern Brands
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            From rapid turnkey ready-made templates to completely bespoke custom web applications, we engineer digital platforms that drive real business growth.
          </p>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelectService={onSelectService}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
