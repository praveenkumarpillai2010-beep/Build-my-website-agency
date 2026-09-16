import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Sparkles, ShoppingBag, Search, Eye, ArrowRight, ShieldCheck, RefreshCw, MessageCircle } from 'lucide-react';
import { RealWebsite } from '../types';
import { fetchWebsites } from '../services/agencyApi';
import { getWhatsAppUrl } from '../data/agencyData';

interface RealWebsitesSectionProps {
  onSelectWebsiteDetails: (website: RealWebsite) => void;
  onBuyWebsite: (website: RealWebsite) => void;
  onOpenCustomQuote: () => void;
  refreshTrigger?: number;
}

export const RealWebsitesSection: React.FC<RealWebsitesSectionProps> = ({
  onSelectWebsiteDetails,
  onBuyWebsite,
  onOpenCustomQuote,
  refreshTrigger = 0,
}) => {
  const [websites, setWebsites] = useState<RealWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadWebsites = async () => {
    setLoading(true);
    try {
      const data = await fetchWebsites();
      // Ensure only published ones are shown to the public
      const published = data.filter((w) => w.published !== false);
      // Sort by displayOrder ascending, then createdAt descending
      published.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setWebsites(published);
    } catch (err) {
      console.error('Failed to load published websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, [refreshTrigger]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    websites.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return ['All', ...Array.from(set)];
  }, [websites]);

  // Filtered list
  const filteredWebsites = useMemo(() => {
    return websites.filter((w) => {
      const matchCat = selectedCategory === 'All' || w.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        (w.description && w.description.toLowerCase().includes(q)) ||
        (w.category && w.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [websites, selectedCategory, searchQuery]);

  return (
    <section id="templates" className="py-20 md:py-32 bg-[#07090e] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Our Real Websites</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Real Websites We've Created
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Browse our live, production websites. Test drive each website with a live interactive preview or purchase it customized with your brand and assets.
          </p>
        </div>

        {/* Search & Categories Bar */}
        {websites.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search websites by name or industry..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Count */}
            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredWebsites.length}</span> of {websites.length} live websites
            </div>
          </div>
        )}

        {/* Category Pills */}
        {websites.length > 0 && categories.length > 2 && (
          <div className="relative mb-10 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400">Loading live websites...</p>
          </div>
        ) : websites.length === 0 ? (
          /* Clean Empty State as explicitly mandated by user */
          <div className="py-20 px-6 max-w-2xl mx-auto text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/10">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              No websites added yet
            </h3>

            <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto mb-8 leading-relaxed">
              Check back soon or contact us to build your custom website! Our team designs bespoke digital platforms tailored to your business goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenCustomQuote}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Request Custom Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={getWhatsAppUrl("Hi Build My Website! I'd like to get a custom website built for my business.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : filteredWebsites.length === 0 ? (
          /* Filter Empty State */
          <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/5 p-8">
            <h3 className="text-lg font-bold text-white mb-2">No matching websites found</h3>
            <p className="text-sm text-slate-400 mb-6">Try clearing your search query or selecting a different category.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Real Websites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredWebsites.map((website) => (
              <div
                key={website.id}
                className="group relative rounded-3xl bg-[#0d121f]/95 border border-white/[0.08] hover:border-blue-500/40 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Image Preview Container */}
                <div
                  onClick={() => onSelectWebsiteDetails(website)}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-white/10 cursor-pointer"
                >
                  {website.thumbnailUrl ? (
                    <img
                      src={website.thumbnailUrl}
                      alt={website.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-center">
                      <Sparkles className="w-10 h-10 text-blue-400 mb-2 opacity-60" />
                      <span className="text-sm font-semibold text-white">{website.name}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/15">
                      {website.category}
                    </span>

                    {website.featured && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <div className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-sm font-extrabold text-white">
                      ${website.price} <span className="text-xs font-normal text-slate-300">{website.currency || 'USD'}</span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => onSelectWebsiteDetails(website)}
                      className="text-xl font-bold text-white mb-2 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {website.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {website.description}
                    </p>

                    {website.features && website.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {website.features.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] font-medium text-slate-300 border border-white/5"
                          >
                            {feat}
                          </span>
                        ))}
                        {website.features.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] text-slate-400">
                            +{website.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2 Prominent Required Action Buttons */}
                  <div className="pt-4 border-t border-white/[0.06] space-y-2">
                    {/* Button 1: VIEW LIVE WEBSITE (opens real live website URL in a new tab) */}
                    <a
                      href={website.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-blue-400/40 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <span>VIEW LIVE WEBSITE</span>
                      <ExternalLink className="w-4 h-4 text-blue-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>

                    {/* Button 2: BUY WEBSITE / BUY NOW */}
                    <button
                      onClick={() => onBuyWebsite(website)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>BUY WEBSITE • ${website.price} USD</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
