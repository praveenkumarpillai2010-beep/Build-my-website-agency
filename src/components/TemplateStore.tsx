import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import { Template, TemplateCategory } from '../types';
import { TEMPLATES } from '../data/agencyData';
import { TemplateCard } from './TemplateCard';

interface TemplateStoreProps {
  onLivePreview: (template: Template) => void;
  onBuyNow: (template: Template) => void;
}

const CATEGORIES: TemplateCategory[] = [
  'All',
  'Business',
  'Restaurant',
  'Hotel',
  'E-commerce',
  'Portfolio',
  'Medical',
  'Education',
  'Fitness',
  'Construction',
  'Automobile',
];

export const TemplateStore: React.FC<TemplateStoreProps> = ({
  onLivePreview,
  onBuyNow,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === 'All' || template.category === selectedCategory;

      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="templates" className="py-20 md:py-32 bg-[#07090e] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Ready-to-Launch Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Choose Your Website
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Start with a professionally designed website and make it yours. Every template is fully customized with your brand identity, photography, and copy.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates (e.g. gym, hotel)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Quick Counter */}
          <div className="text-xs text-slate-400 hidden sm:block">
            Showing <span className="text-white font-bold">{filteredTemplates.length}</span> templates
          </div>
        </div>

        {/* Category Filter Pills (Scrollable horizontally on mobile) */}
        <div className="relative mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onLivePreview={onLivePreview}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/5 p-8">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No templates found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-4">
              We couldn't find any ready template matching "{searchQuery}". But don't worry—our team can build it from scratch!
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
