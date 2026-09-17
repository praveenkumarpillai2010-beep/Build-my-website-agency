import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, RefreshCw, Layers, Palette, Layout, CheckCircle2, MessageCircle, Copy, Check, Globe } from 'lucide-react';
import { AIWebsiteConcept } from '../types';
import { generateWebsiteConcept } from '../services/aiConceptService';
import { AGENCY_CONFIG, getWhatsAppUrl } from '../data/agencyData';

interface AIConceptGeneratorProps {
  onBuildConcept: (concept: AIWebsiteConcept) => void;
}

const SAMPLE_PROMPTS = [
  'I run a premium car detailing business in Vapi with ceramic coating',
  'Artisanal sourdough bakery & cafe in Bandra with online cake orders',
  'Boutique dental clinic in Bangalore specializing in smile makeovers',
  'Modern architectural studio focused on sustainable eco-villas',
  'High-performance functional fitness gym & athletic conditioning club',
];

export const AIConceptGenerator: React.FC<AIConceptGeneratorProps> = ({ onBuildConcept }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<AIWebsiteConcept | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate initial concept on mount or button click
  const handleGenerate = async (queryText?: string) => {
    const textToUse = queryText || inputQuery;
    if (!textToUse.trim()) return;

    setLoading(true);
    try {
      const result = await generateWebsiteConcept(textToUse);
      setConcept(result);
    } catch (err) {
      console.error('Failed to generate concept:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyConcept = () => {
    if (!concept) return;
    const text = `Build My Website AI Concept:
Headline: ${concept.websiteHeadline}
Style: ${concept.suggestedStyle}
Sections: ${concept.recommendedSections.join(', ')}
CTA: ${concept.callToAction.primary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppInquiry = () => {
    if (!concept) return;
    const message = `Hi Build My Website team! 🤖
I just generated an AI website concept on your website:

*Concept Focus:* "${concept.userQuery}"
*Headline:* "${concept.websiteHeadline}"
*Design Style:* ${concept.suggestedStyle}
*Primary CTA:* ${concept.callToAction.primary}

I would like your team to build this concept into a live website!`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <section id="ai-concept" className="py-20 md:py-32 bg-[#06080d] relative overflow-hidden">
      {/* Background glow lines and halos */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive AI Concept Studio</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Your Idea. Our AI.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Your Website.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Describe your business and generate a website concept in seconds. Get instant recommendations on design styles, color palettes, sitemaps, and conversion mechanics.
          </p>
        </div>

        {/* Input Generator Box */}
        <div className="max-w-3xl mx-auto mb-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="relative p-2 rounded-2xl bg-[#0e1322] border border-white/15 shadow-2xl focus-within:border-blue-500/60 transition-all flex flex-col sm:flex-row items-stretch gap-2"
          >
            <input
              type="text"
              placeholder="Example: I run a premium car detailing business in Vapi..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Concept...</span>
                </>
              ) : (
                <>
                  <span>Generate Website Concept</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>

          {/* Sample Prompts Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Try an idea:</span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputQuery(sample);
                  handleGenerate(sample);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5 transition-colors truncate max-w-[280px] sm:max-w-none text-[11px]"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Concept Display Card */}
        {concept && (
          <div className="max-w-4xl mx-auto rounded-3xl bg-[#0e1322]/90 border border-white/15 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-400 relative">
            {/* Top Bar with concept details & actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs text-purple-400 font-mono mb-1">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI CONCEPT SPECIFICATION • Generated {concept.generatedAt}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Prompt: <span className="text-white italic">"{concept.userQuery}"</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyConcept}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Specs'}</span>
                </button>

                <button
                  onClick={() => onBuildConcept(concept)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <span>Build This Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 1. Headline & Subheadline */}
            <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 block mb-2">
                01 • RECOMMENDED HERO HEADLINE & HOOK
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                "{concept.websiteHeadline}"
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {concept.subheadline}
              </p>

              {concept.marketInsights && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-0.5">
                      Search-Grounded Market Intelligence
                    </span>
                    <p className="text-xs text-slate-200">
                      {concept.marketInsights}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Suggested Design Style & Color Palette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Style & Typography */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
                    <Layout className="w-3.5 h-3.5" />
                    <span>02 • VISUAL IDENTITY & STYLE</span>
                  </span>
                  <div className="font-bold text-white text-base mb-1">
                    {concept.suggestedStyle}
                  </div>
                  <div className="text-xs text-slate-400">
                    Typography: <span className="text-slate-200">{concept.typographyArchetype}</span>
                  </div>
                </div>
              </div>

              {/* Color Palette Swatches */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5" />
                  <span>03 • PALETTE: {concept.colorPalette.name}</span>
                </span>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div>
                    <div
                      className="h-10 rounded-lg border border-white/10 shadow-inner mb-1"
                      style={{ backgroundColor: concept.colorPalette.background }}
                    />
                    <div className="text-[10px] text-slate-400 truncate">Background</div>
                    <div className="text-[10px] text-slate-300 font-mono">{concept.colorPalette.background}</div>
                  </div>
                  <div>
                    <div
                      className="h-10 rounded-lg border border-white/10 shadow-inner mb-1"
                      style={{ backgroundColor: concept.colorPalette.primary }}
                    />
                    <div className="text-[10px] text-slate-400 truncate">Primary</div>
                    <div className="text-[10px] text-slate-300 font-mono">{concept.colorPalette.primary}</div>
                  </div>
                  <div>
                    <div
                      className="h-10 rounded-lg border border-white/10 shadow-inner mb-1"
                      style={{ backgroundColor: concept.colorPalette.secondary }}
                    />
                    <div className="text-[10px] text-slate-400 truncate">Secondary</div>
                    <div className="text-[10px] text-slate-300 font-mono">{concept.colorPalette.secondary}</div>
                  </div>
                  <div>
                    <div
                      className="h-10 rounded-lg border border-white/10 shadow-inner mb-1"
                      style={{ backgroundColor: concept.colorPalette.accent }}
                    />
                    <div className="text-[10px] text-slate-400 truncate">Accent</div>
                    <div className="text-[10px] text-slate-300 font-mono">{concept.colorPalette.accent}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Recommended Sections & Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Sections */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 block mb-3">
                  04 • RECOMMENDED SECTIONS
                </span>
                <ul className="space-y-2">
                  {concept.recommendedSections.map((sec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features & Integrations */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-3">
                  05 • RECOMMENDED FEATURES
                </span>
                <ul className="space-y-2">
                  {concept.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. CTA Strategy & Suggested Structure */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 block mb-3">
                06 • SUGGESTED WEBSITE SITEMAP & CONVERSION CTA
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-xs text-slate-400 mb-1">Primary Call-to-Action</div>
                  <div className="text-sm font-bold text-white mb-1">{concept.callToAction.primary}</div>
                  <div className="text-[11px] text-slate-400">{concept.callToAction.strategy}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-xs text-slate-400 mb-1">Secondary Call-to-Action</div>
                  <div className="text-sm font-bold text-slate-200 mb-1">{concept.callToAction.secondary}</div>
                  <div className="text-[11px] text-slate-400">Low-friction research and portfolio exploration.</div>
                </div>
              </div>

              {/* Sitemap table */}
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-400 mb-2">Recommended Sitemap:</div>
                {concept.suggestedStructure.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white/[0.02] border border-white/5 gap-1"
                  >
                    <span className="font-semibold text-blue-300">{item.page}</span>
                    <span className="text-slate-400">{item.purpose}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Final Action CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="text-left">
                <div className="text-sm font-bold text-white">Love this website blueprint?</div>
                <div className="text-xs text-slate-400">
                  Our team can customize and launch this exact architecture in 3 to 7 days.
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuss via WhatsApp</span>
                </button>

                <button
                  onClick={() => onBuildConcept(concept)}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <span>Build This Concept →</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
