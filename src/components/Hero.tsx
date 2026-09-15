import React, { useState } from 'react';
import { ArrowRight, Sparkles, Layout, ShieldCheck, Zap, Smartphone, Search, CheckCircle2 } from 'lucide-react';
import { AGENCY_CONFIG } from '../data/agencyData';

interface HeroProps {
  onOpenCustomQuote: () => void;
  onExploreTemplates: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCustomQuote, onExploreTemplates }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#07090e]"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[550px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-full blur-[130px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Small badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner mb-6 sm:mb-8 animate-in fade-in duration-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            WE BUILD DIGITAL EXPERIENCES
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Your Business Deserves a{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Website That Works.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Build, launch and grow your online presence with a professionally designed website built for your business.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-12">
          <button
            onClick={onOpenCustomQuote}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Build My Website</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreTemplates}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layout className="w-5 h-5 text-blue-400" />
            <span>Explore Templates</span>
          </button>
        </div>

        {/* Small trust line */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-slate-400 mb-16">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400" /> Modern Design
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Smartphone className="w-4 h-4 text-indigo-400" /> Mobile Responsive
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" /> Fast
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Search className="w-4 h-4 text-purple-400" /> SEO Ready
          </span>
        </div>

        {/* Floating Website Mockups with 3D Mouse Movement */}
        <div
          className="relative max-w-5xl mx-auto transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${-mousePos.y * 6}deg) rotateY(${mousePos.x * 8}deg)`,
          }}
        >
          {/* Main Central Laptop Mockup */}
          <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* Laptop Window Chrome */}
            <div className="bg-[#0b0f19] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10">
              {/* Browser bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0d1220] border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[11px] text-slate-400 w-64 sm:w-80 justify-center">
                  <span className="text-emerald-400">🔒</span>
                  <span className="truncate">https://yourbusiness.com</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="hidden sm:inline">99.9% Uptime</span>
                </div>
              </div>

              {/* Mockup Screen Content */}
              <div className="relative aspect-[16/9] sm:aspect-[16/8.5] w-full bg-[#090d16] p-4 sm:p-8 overflow-hidden text-left flex flex-col justify-between">
                {/* Background glow inside screen */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                      B
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-white">Apex Luxury Auto</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                    <span className="text-white font-medium">Inventory</span>
                    <span>Financing</span>
                    <span>Test Drive</span>
                    <span>Contact</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-500/30">
                    Book Viewing
                  </span>
                </div>

                {/* Simulated Hero Body */}
                <div className="py-6 sm:py-10 max-w-xl">
                  <div className="inline-block px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] sm:text-xs text-blue-300 mb-2 font-mono">
                    ✦ PRESTIGE VEHICLE SHOWROOM
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                    Engineered For Pure Performance.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                    Discover handpicked luxury sedans, supercars, and certified pre-owned inventory with 160-point inspection.
                  </p>
                </div>

                {/* Simulated Feature Cards Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/5">
                  <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Inventory Available</div>
                    <div className="text-xs sm:text-base font-bold text-white">48+ Exotic Cars</div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Google Rating</div>
                    <div className="text-xs sm:text-base font-bold text-amber-400">4.9 ★★★★★</div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400">Financing APR</div>
                    <div className="text-xs sm:text-base font-bold text-emerald-400">From 7.9% EMI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Left Mobile Mockup (Visual Depth) */}
          <div
            className="hidden md:block absolute -left-12 -bottom-10 w-52 rounded-2xl p-2 bg-gradient-to-b from-white/20 to-white/5 border border-white/20 shadow-2xl backdrop-blur-2xl transition-transform duration-300"
            style={{
              transform: `translateY(${mousePos.y * 14}px) rotate(-6deg)`,
            }}
          >
            <div className="bg-[#0b0f19] rounded-xl p-3 border border-white/10 text-left">
              <div className="flex items-center justify-between text-[9px] text-slate-400 pb-2 border-b border-white/5 mb-2">
                <span>9:41</span>
                <span>📶 5G</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px]">☕</div>
                <span className="text-[11px] font-bold text-white">Bistro Artisanal</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-200 mb-1">Today's Special Menu</div>
              <div className="h-16 rounded-lg bg-cover bg-center mb-2" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop')` }} />
              <div className="text-[10px] text-emerald-400 font-semibold">Table Booked • 7:30 PM</div>
            </div>
          </div>

          {/* Floating Right Card Badge 1: 48h Delivery */}
          <div
            className="hidden sm:flex absolute -right-6 top-8 px-4 py-3 rounded-2xl bg-[#0d1322]/90 border border-blue-500/30 shadow-2xl backdrop-blur-xl items-center gap-3 transition-transform duration-300"
            style={{
              transform: `translateY(${-mousePos.y * 12}px) rotate(3deg)`,
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Fast 48-Hour Delivery</div>
              <div className="text-[11px] text-slate-400">Ready-to-launch templates</div>
            </div>
          </div>

          {/* Floating Right Card Badge 2: All-inclusive Starting Price */}
          <div
            className="hidden sm:flex absolute -right-8 -bottom-6 px-4 py-3 rounded-2xl bg-[#0d1322]/90 border border-emerald-500/30 shadow-2xl backdrop-blur-xl items-center gap-3 transition-transform duration-300"
            style={{
              transform: `translateY(${mousePos.y * 10}px) rotate(-2deg)`,
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-base">
              $
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">Starting from $39</div>
              <div className="text-[11px] text-emerald-400 font-medium">Domain & SEO Assistance</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
