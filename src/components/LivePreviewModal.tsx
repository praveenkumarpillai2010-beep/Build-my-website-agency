import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, ExternalLink, ShoppingCart, CheckCircle2, MessageSquare, PhoneCall, Star } from 'lucide-react';
import { Template } from '../types';
import { AGENCY_CONFIG, getWhatsAppUrl } from '../data/agencyData';

interface LivePreviewModalProps {
  template: Template | null;
  onClose: () => void;
  onOrderTemplate: (template: Template) => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  template,
  onClose,
  onOrderTemplate,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  if (!template) return null;

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'max-w-full';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="h-16 px-4 sm:px-6 bg-[#090d16] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
        {/* Template info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base truncate">
                {template.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {template.category}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Starting from {template.currency}
              {template.startingPrice.toLocaleString()} • Ready in {template.deliveryDays} Days
            </span>
          </div>
        </div>

        {/* Viewport switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewport === 'tablet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* CTA and Close */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOrderTemplate(template);
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Customize This ({template.currency}{template.startingPrice.toLocaleString()})</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewport Canvas Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-6 flex justify-center items-start bg-[#05070c]">
        <div
          className={`w-full ${getViewportWidth()} transition-all duration-300 rounded-2xl overflow-hidden bg-[#0d121f] border border-white/15 shadow-2xl min-h-full flex flex-col text-slate-100`}
        >
          {/* Simulated Browser Bar */}
          <div className="px-4 py-2.5 bg-[#090d16] border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="px-3 py-0.5 rounded-md bg-white/[0.04] text-[11px] text-slate-300 font-mono">
              demo.{template.id}.buildmywebsite.preview
            </div>
            <div className="text-[10px] text-emerald-400">● Live Prototype</div>
          </div>

          {/* Interactive Simulated Website Content */}
          <div className="flex-1 flex flex-col bg-[#0b0f19] text-white">
            {/* Template Header */}
            <nav className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0b0f19]/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: template.primaryColor }}
                >
                  {template.name.charAt(0)}
                </div>
                <span className="font-bold text-sm tracking-tight">{template.name}</span>
              </div>
              <div className="hidden md:flex items-center gap-5 text-xs text-slate-300">
                <span>Services</span>
                <span>About</span>
                <span>Showcase</span>
                <span>Testimonials</span>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: template.primaryColor }}
              >
                Contact Us
              </button>
            </nav>

            {/* Template Hero */}
            <div className="relative p-6 sm:p-12 overflow-hidden border-b border-white/10">
              <div
                className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: template.primaryColor }}
              />
              <div className="max-w-2xl">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 bg-white/[0.05] border border-white/10 text-slate-300">
                  ✦ {template.previewDetails.badgeText}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
                  {template.previewDetails.heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {template.previewDetails.heroSubtitle}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg"
                    style={{ backgroundColor: template.primaryColor }}
                  >
                    Get Free Consultation →
                  </button>
                  <button className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-white/[0.05] border border-white/10">
                    Explore Offerings
                  </button>
                </div>
              </div>
            </div>

            {/* Template Visual Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 border-b border-white/10">
              <img
                src={template.previewDetails.sampleImageUrl}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent" />
            </div>

            {/* Template Services Grid */}
            <div className="p-6 sm:p-10 border-b border-white/10">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-400">
                  OUR CAPABILITIES
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Crafted For Peak Performance
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {template.previewDetails.servicesPreview.map((serviceName, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: template.primaryColor }}
                      />
                      <h4 className="font-bold text-sm text-white">{serviceName}</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Standard customized workflow engineered for speed, conversion, and effortless customer engagement.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Social Proof / Trust */}
            <div className="p-6 sm:p-10 bg-white/[0.01] border-b border-white/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <div className="text-lg sm:text-2xl font-extrabold text-white">99.8%</div>
                  <div className="text-[11px] text-slate-400">Client Satisfaction</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <div className="text-lg sm:text-2xl font-extrabold text-white">48 Hours</div>
                  <div className="text-[11px] text-slate-400">Turnaround Time</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <div className="text-lg sm:text-2xl font-extrabold text-white">5-Star</div>
                  <div className="text-[11px] text-slate-400">Google Rating</div>
                </div>
              </div>
            </div>

            {/* Template Footer Banner */}
            <div className="p-6 sm:p-10 text-center bg-gradient-to-b from-transparent to-[#070a12]">
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                Ready to make this template yours?
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                We replace this sample content with your official brand logo, photography, copy, and WhatsApp links in 48 hours.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOrderTemplate(template);
                }}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: template.primaryColor }}
              >
                Order & Launch This Website ({template.currency}{template.startingPrice.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
