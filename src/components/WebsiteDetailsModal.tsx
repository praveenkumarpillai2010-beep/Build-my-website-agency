import React, { useState } from 'react';
import { X, ExternalLink, ShoppingBag, CheckCircle, ArrowUpRight, Copy, Check, Sparkles } from 'lucide-react';
import { RealWebsite } from '../types';

interface WebsiteDetailsModalProps {
  website: RealWebsite;
  onClose: () => void;
  onBuyWebsite: (website: RealWebsite) => void;
}

export const WebsiteDetailsModal: React.FC<WebsiteDetailsModalProps> = ({
  website,
  onClose,
  onBuyWebsite,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = [
    website.thumbnailUrl,
    ...(website.screenshots || []),
  ].filter(Boolean);

  const handleCopyUrl = () => {
    if (!website.liveUrl) return;
    navigator.clipboard.writeText(website.liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c101c] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1322]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {website.category}
            </span>
            {website.featured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Featured
              </span>
            )}
            <h2 className="text-lg font-bold text-white tracking-tight">{website.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Main Visual Display */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImageIndex] || website.thumbnailUrl}
                  alt={website.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-500">
                  No preview screenshot provided
                </div>
              )}

              {/* Floating Price Pill */}
              <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white font-extrabold text-lg shadow-xl">
                ${website.price} <span className="text-xs font-medium text-slate-300">USD</span>
              </div>
            </div>

            {/* Screenshots Gallery Thumbnails (if multiple exist) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About This Website
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {website.description}
                </p>
              </div>

              {/* Included Features */}
              {website.features && website.features.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Key Features Included
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {website.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5 text-xs sm:text-sm text-slate-300"
                      >
                        <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Website Verification Banner */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real Live Website URL</span>
                  </div>
                  <div className="text-sm font-mono text-white truncate max-w-md">
                    {website.liveUrl}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors text-xs flex items-center gap-1"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={website.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar Pricing & Action */}
            <div className="space-y-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Total Purchase Price</span>
                  <div className="text-3xl font-black text-white mt-1">
                    ${website.price} <span className="text-sm font-normal text-slate-400">USD</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Customized with your logo & content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Domain & hosting setup included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Mobile responsive & SEO configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Dedicated WhatsApp support</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    onClose();
                    onBuyWebsite(website);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy This Website</span>
                </button>

                <a
                  href={website.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open Live Website In New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
