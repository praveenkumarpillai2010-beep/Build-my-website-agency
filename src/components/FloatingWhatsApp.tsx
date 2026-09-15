import React from 'react';
import { MessageCircle } from 'lucide-react';
import { AGENCY_CONFIG, getWhatsAppUrl } from '../data/agencyData';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <a
        href={getWhatsAppUrl('Hi Build My Website team, I have an inquiry regarding your web agency services.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/40 hover:shadow-emerald-600/60 transition-all hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="font-bold text-xs sm:text-sm tracking-tight hidden sm:inline-block">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
};
