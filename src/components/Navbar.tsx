import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sparkles, MessageCircle, User, ShieldCheck, Lock } from 'lucide-react';
import { AGENCY_CONFIG, getWhatsAppUrl } from '../data/agencyData';

interface NavbarProps {
  onOpenCustomQuote: () => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenCustomerDashboard: () => void;
  onOpenAdminDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCustomQuote,
  onScrollToSection,
  onOpenCustomerDashboard,
  onOpenAdminDashboard,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'Our Websites', id: 'templates' },
    { label: 'Services', id: 'services' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'About', id: 'why-us' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onScrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07090e]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/60 py-3 sm:py-3.5'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          aria-label="Build My Website Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BW
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
              {AGENCY_CONFIG.name}
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 uppercase hidden sm:inline-block">
              Web Development Agency
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="px-3.5 py-1.5 text-xs xl:text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06] cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href={getWhatsAppUrl('Hi Build My Website team, I want to discuss building a website for my business.')}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Client Portal Button */}
          <button
            onClick={onOpenCustomerDashboard}
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Client Portal & Order Tracking"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Client Portal</span>
          </button>

          {/* Admin Dashboard Quick Access Button */}
          <button
            onClick={onOpenAdminDashboard}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
            title="Admin Dashboard"
            aria-label="Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          {/* Build My Website CTA */}
          <button
            onClick={onOpenCustomQuote}
            className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Build My Website</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenCustomerDashboard}
            className="p-2 text-slate-300 hover:text-white bg-white/[0.05] border border-white/10 rounded-xl"
            title="Client Portal"
          >
            <User className="w-4 h-4 text-blue-400" />
          </button>

          <button
            onClick={onOpenCustomQuote}
            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
          >
            Build
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-white/[0.05] border border-white/10 rounded-xl focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0a0d16] border-b border-white/10 px-5 pt-3 pb-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{link.label}</span>
                <span className="text-xs text-slate-500">→</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCustomerDashboard();
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Customer Portal & Tracking</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminDashboard();
              }}
              className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCustomQuote();
              }}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Build My Website</span>
            </button>

            <a
              href={getWhatsAppUrl('Hi Build My Website team, I want to discuss building a website.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 text-center text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us: {AGENCY_CONFIG.displayPhone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
