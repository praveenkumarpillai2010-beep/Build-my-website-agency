import React, { useState, useEffect, useRef } from 'react';
import { Instagram, MessageCircle, X, ArrowUpRight } from 'lucide-react';
import {
  TEAM_MEMBERS,
  getWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
} from '../data/agencyData';

export const FloatingSocialContact: React.FC = () => {
  const [isInstagramOpen, setIsInstagramOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const instagramButtonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        instagramButtonRef.current &&
        !instagramButtonRef.current.contains(event.target as Node)
      ) {
        setIsInstagramOpen(false);
      }
    }

    // Close on Escape key
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isInstagramOpen) {
        setIsInstagramOpen(false);
        instagramButtonRef.current?.focus();
      }
    }

    if (isInstagramOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInstagramOpen]);

  const whatsappUrl = getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE);

  return (
    <aside
      aria-label="Social contact widget"
      className="fixed bottom-[18px] right-[18px] sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Instagram Profile Selector Popup */}
      {isInstagramOpen && (
        <div
          ref={popupRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="instagram-popup-title"
          className="w-[320px] max-w-[calc(100vw-36px)] rounded-2xl sm:rounded-3xl bg-[#090d16]/95 backdrop-blur-2xl border border-white/15 p-4 sm:p-5 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-3 duration-200 mb-1"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shadow-sm shadow-pink-500/30 flex-shrink-0">
                <div className="w-full h-full bg-[#0c101a] rounded-[10px] flex items-center justify-center text-pink-400">
                  <Instagram className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3
                  id="instagram-popup-title"
                  className="font-bold text-xs sm:text-sm text-white tracking-tight"
                >
                  Follow Us on Instagram
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Choose a profile
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsInstagramOpen(false)}
              aria-label="Close Instagram profile selector"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Cards List */}
          <div className="space-y-3">
            {TEAM_MEMBERS.map((member) => (
              <a
                key={member.id || member.name}
                href={member.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsInstagramOpen(false)}
                className="group relative flex flex-col p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-pink-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 text-left cursor-pointer"
              >
                {/* Instagram tiny badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-pink-400 mb-1.5">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </div>

                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] flex-shrink-0 group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-[9px] bg-[#0c101a] flex items-center justify-center text-xs font-bold text-transparent bg-clip-text bg-gradient-to-tr from-pink-400 to-purple-200">
                        {member.name
                          .replace(/[^a-zA-Z]/g, ' ')
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-100 transition-colors truncate">
                        {member.name}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 group-hover:text-pink-300 transition-colors truncate">
                        {member.instagramHandle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Profile Button */}
                <div className="inline-flex items-center justify-center gap-1 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 group-hover:from-pink-500 group-hover:to-purple-500 text-white font-bold text-xs shadow-sm shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all">
                  <span>Open Instagram ↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Vertical Floating Buttons Container */}
      <div className="flex flex-col items-end gap-3">
        {/* WhatsApp Button */}
        <div className="relative group flex items-center">
          {/* Desktop Tooltip */}
          <div
            role="tooltip"
            className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#090d16]/95 border border-white/10 text-white text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden sm:flex items-center gap-1.5"
          >
            <span>Chat with us</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#0c101a]/90 hover:bg-emerald-600/90 text-emerald-400 hover:text-white border border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-950/50 hover:shadow-2xl hover:shadow-emerald-500/40 backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090e]"
          >
            {/* Ambient pulsating ring */}
            <span className="absolute -inset-0.5 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/40 blur-[4px] -z-10 transition-colors" />
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform duration-300 group-hover:scale-105" />
          </a>
        </div>

        {/* Instagram Button */}
        <div className="relative group flex items-center">
          {/* Desktop Tooltip */}
          <div
            role="tooltip"
            className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#090d16]/95 border border-white/10 text-white text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden sm:flex items-center gap-1.5"
          >
            <span>Follow us</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          </div>

          <button
            ref={instagramButtonRef}
            type="button"
            onClick={() => setIsInstagramOpen((prev) => !prev)}
            aria-label="Follow us on Instagram"
            aria-haspopup="dialog"
            aria-expanded={isInstagramOpen}
            className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl shadow-pink-950/50 hover:shadow-2xl hover:shadow-pink-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090e] cursor-pointer ${
              isInstagramOpen
                ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white border border-pink-400 shadow-pink-500/40 scale-105'
                : 'bg-[#0c101a]/90 hover:bg-gradient-to-tr hover:from-amber-500/80 hover:via-rose-500/80 hover:to-purple-600/80 text-pink-400 hover:text-white border border-pink-500/40 hover:border-pink-400'
            }`}
          >
            {/* Ambient soft glow ring */}
            <span className="absolute -inset-0.5 rounded-full bg-pink-500/20 group-hover:bg-pink-500/40 blur-[4px] -z-10 transition-colors" />
            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6" />
          </button>
        </div>
      </div>
    </aside>
  );
};
