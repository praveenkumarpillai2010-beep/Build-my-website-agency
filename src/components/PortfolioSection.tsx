import React, { useState } from 'react';
import { ExternalLink, Layers, ArrowUpRight, Check, X, Shield } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/agencyData';
import { PortfolioProject } from '../types';

type PortfolioCategory = 'All' | 'Business' | 'E-commerce' | 'Hospitality' | 'Healthcare' | 'Automotive';

interface PortfolioSectionProps {
  onRequestSimilar: (project: PortfolioProject) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ onRequestSimilar }) => {
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('All');
  const [activeModalProject, setActiveModalProject] = useState<PortfolioProject | null>(null);

  const categories: PortfolioCategory[] = [
    'All',
    'Business',
    'E-commerce',
    'Hospitality',
    'Healthcare',
    'Automotive',
  ];

  const filteredProjects = PORTFOLIO_PROJECTS.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <section id="portfolio" className="py-20 md:py-32 bg-[#07090e] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Curated Case Studies</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Websites We've Built
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Explore our recent client implementations. Each website is meticulously engineered for brand distinction, blazing performance, and effortless customer conversions.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-3xl bg-[#0d121f]/90 border border-white/[0.08] hover:border-blue-500/40 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-white/10">
                <img
                  src={project.previewUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/15">
                    {project.industry}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                    {project.metrics}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-medium text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalProject(project)}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 py-1 cursor-pointer"
                  >
                    <span>View Project</span>
                    <ArrowUpRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => onRequestSimilar(project)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    Build Similar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1322] border border-white/15 overflow-hidden shadow-2xl">
            {/* Header Image */}
            <div className="relative aspect-[16/9] w-full">
              <img
                src={activeModalProject.previewUrl}
                alt={activeModalProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1322] via-transparent to-black/40" />

              <button
                onClick={() => setActiveModalProject(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white mb-2 inline-block">
                  {activeModalProject.industry}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalProject.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-4 text-left">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Project Overview & Results
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeModalProject.description} Designed with high-performance responsive engineering, custom photography layout, and lead capture systems.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Key Business Outcome:</span>
                  <div className="text-base font-bold text-emerald-400">
                    {activeModalProject.metrics}
                  </div>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  <span>Stack: </span>
                  <span className="text-slate-200 font-mono">
                    {activeModalProject.tags.join(', ')}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] border border-white/10"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const p = activeModalProject;
                    setActiveModalProject(null);
                    onRequestSimilar(p);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20"
                >
                  Build a Website Like This →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
