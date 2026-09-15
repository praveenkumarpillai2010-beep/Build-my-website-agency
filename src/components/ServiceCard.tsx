import React from 'react';
import {
  Layout,
  Code,
  ShoppingBag,
  Sparkle,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Globe,
  ArrowRight,
  Check,
} from 'lucide-react';
import { ServiceItem } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-6 h-6 text-blue-400" />,
  Code: <Code className="w-6 h-6 text-indigo-400" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6 text-emerald-400" />,
  Sparkle: <Sparkle className="w-6 h-6 text-purple-400" />,
  RefreshCw: <RefreshCw className="w-6 h-6 text-amber-400" />,
  SearchCheck: <SearchCheck className="w-6 h-6 text-cyan-400" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-rose-400" />,
  Globe: <Globe className="w-6 h-6 text-sky-400" />,
};

interface ServiceCardProps {
  service: ServiceItem;
  onSelectService: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelectService }) => {
  return (
    <div className="group relative rounded-3xl bg-[#0c101d]/80 border border-white/[0.08] hover:border-blue-500/40 p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
      <div>
        {/* Icon & Glow */}
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
          {ICON_MAP[service.iconName] || <Layout className="w-6 h-6 text-blue-400" />}
        </div>

        {/* Title & Short Description */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {service.title}
        </h3>

        <p className="text-xs sm:text-sm font-medium text-blue-400/90 mb-3">
          {service.shortDesc}
        </p>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {service.details}
        </p>

        {/* Features list */}
        <div className="space-y-2 mb-6">
          {service.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable Footer */}
      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          {service.deliverable}
        </span>
        <button
          onClick={() => onSelectService(service)}
          className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Enquire</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
