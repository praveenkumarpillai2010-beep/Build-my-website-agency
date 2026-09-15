import React from 'react';
import { Instagram, MessageCircle, ExternalLink } from 'lucide-react';
import { AGENCY_CONFIG, TEAM_MEMBERS, getWhatsAppUrl } from '../data/agencyData';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenCustomQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection, onOpenCustomQuote }) => {
  return (
    <footer className="bg-[#05070c] border-t border-white/10 text-slate-400 text-xs sm:text-sm relative overflow-hidden">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px]">
                <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center font-black text-xs text-blue-400">
                  BW
                </div>
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                {AGENCY_CONFIG.name}
              </span>
            </div>

            <p className="text-slate-200 font-semibold text-sm sm:text-base">
              {AGENCY_CONFIG.tagline}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              International website agency building modern, responsive, high-converting websites and ready-made templates for global businesses and creators.
            </p>

            <div className="pt-2">
              <a
                href={getWhatsAppUrl('Hi Build My Website team, I want to inquire about building a website.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: {AGENCY_CONFIG.displayPhone}</span>
              </a>
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">
              COMPANY
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onScrollToSection('hero')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('why-us')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('services')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('portfolio')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* WEBSITES */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">
              WEBSITES
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onScrollToSection('templates')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Business Websites
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('templates')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  E-Commerce
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('templates')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Restaurant
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('templates')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('custom-website')}
                  className="hover:text-white transition-colors cursor-pointer text-left text-blue-400"
                >
                  Custom Websites
                </button>
              </li>
            </ul>
          </div>

          {/* FOLLOW US */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span>FOLLOW US</span>
            </h4>
            <div className="space-y-3.5 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram</span>
              </div>
              <ul className="space-y-3">
                {TEAM_MEMBERS.map((member) => (
                  <li key={member.name}>
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-pink-500/30 hover:bg-white/[0.06] transition-all"
                    >
                      <span className="text-white font-semibold text-xs group-hover:text-pink-300 transition-colors">
                        {member.name}
                      </span>
                      <span className="text-[11px] text-pink-400 group-hover:text-pink-300 flex items-center gap-1 mt-0.5">
                        <span>{member.instagramHandle}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© 2026 Build My Website. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span>Modern Design • Mobile Responsive • Fast • SEO Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
