import React from 'react';
import { Eye, ShoppingCart, Check, Clock, FileText, ArrowRight } from 'lucide-react';
import { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  onLivePreview: (template: Template) => void;
  onBuyNow: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLivePreview,
  onBuyNow,
}) => {
  return (
    <div className="group relative rounded-3xl bg-[#0d111c]/80 border border-white/[0.08] hover:border-blue-500/40 transition-all duration-300 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
      {/* Visual Preview Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0d16] border-b border-white/[0.06]">
        {/* Sample Image Preview */}
        <img
          src={template.previewDetails.sampleImageUrl}
          alt={template.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d111c] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
            {template.category}
          </span>
          {template.tag && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/90 text-white shadow-lg shadow-blue-500/30">
              {template.tag}
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm p-4">
          <button
            onClick={() => onLivePreview(template)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Live Preview</span>
          </button>
          <button
            onClick={() => onBuyNow(template)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:from-blue-500 hover:to-purple-500 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Get Template</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              {template.name}
            </h3>
            <div className="text-right">
              <span className="text-xs text-slate-400">Starting from</span>
              <div className="text-lg font-extrabold text-white">
                {template.currency}
                {template.startingPrice.toLocaleString()}
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4">
            {template.description}
          </p>

          {/* Key Deliverables Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {template.features.slice(0, 3).map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-300"
              >
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-slate-400">
                +{template.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Delivery & Action buttons */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Ready in {template.deliveryDays} Days</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLivePreview(template)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => onBuyNow(template)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
