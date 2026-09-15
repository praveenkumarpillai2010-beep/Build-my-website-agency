import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, MessageCircle, ShieldCheck, ArrowRight, Layers, FileSpreadsheet } from 'lucide-react';
import { CustomWebsiteQuoteForm } from '../types';
import { AGENCY_CONFIG, getWhatsAppUrl } from '../data/agencyData';

const BUSINESS_CATEGORIES = [
  'Retail & E-Commerce',
  'Restaurant, Cafe & Cloud Kitchen',
  'Real Estate & Construction',
  'Healthcare, Dental & Clinic',
  'Automobile Showroom / Garage',
  'Consulting, Legal & Corporate',
  'Hospitality, Hotel & Travel',
  'Fitness, Gym & Wellness',
  'Education, School & EdTech',
  'Manufacturing & Industrial',
  'Other / Custom Niche',
];

const WEBSITE_TYPES = [
  'Single Page High-Converting Landing Page',
  'Multi-Page Corporate / Business Website',
  'Full-Featured E-Commerce Store',
  'Booking / Appointment Platform',
  'Custom Web Application / Portal',
];

const AVAILABLE_FEATURES = [
  'Online Booking & Appointments',
  'E-Commerce & Product Catalog',
  'Payment Gateway (Stripe / PayPal / Cards)',
  'WhatsApp 1-Click Chat Integration',
  'Custom Admin Panel / CMS',
  'Multi-Language Support',
  'Advanced Motion & Micro-Interactions',
  'Google Analytics & Meta Pixel',
  'SEO Schema & Google Search Setup',
  'Customer Inquiry CRM Sync',
];

const BUDGET_RANGES = [
  '$50 - $150',
  '$150 - $350',
  '$350 - $800',
  '$800+ (Custom Enterprise)',
];

interface CustomWebsiteSectionProps {
  initialPlan?: string;
}

export const CustomWebsiteSection: React.FC<CustomWebsiteSectionProps> = ({ initialPlan }) => {
  const [formData, setFormData] = useState<CustomWebsiteQuoteForm>({
    fullName: '',
    businessName: '',
    whatsappNumber: '',
    email: '',
    businessCategory: BUSINESS_CATEGORIES[0],
    websiteType: WEBSITE_TYPES[1],
    requiredFeatures: ['WhatsApp 1-Click Chat Integration', 'SEO Schema & Google Search Setup'],
    budget: BUDGET_RANGES[1],
    message: initialPlan ? `I am interested in the ${initialPlan} plan.` : '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.requiredFeatures.includes(feature);
      if (exists) {
        return {
          ...prev,
          requiredFeatures: prev.requiredFeatures.filter((f) => f !== feature),
        };
      } else {
        return {
          ...prev,
          requiredFeatures: [...prev.requiredFeatures, feature],
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.whatsappNumber) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleWhatsAppForward = () => {
    const text = `Hi Build My Website! 🛠️
I want to request a custom website quote:

*Client Info:*
- Name: ${formData.fullName}
- Business: ${formData.businessName}
- WhatsApp: ${formData.whatsappNumber}
- Email: ${formData.email || 'N/A'}

*Project Scope:*
- Category: ${formData.businessCategory}
- Type: ${formData.websiteType}
- Budget: ${formData.budget}
- Features: ${formData.requiredFeatures.join(', ')}

*Requirements:*
${formData.message || 'Custom scope as detailed above.'}

Looking forward to your proposal!`;

    window.open(getWhatsAppUrl(text), '_blank');
  };

  return (
    <section id="custom-website" className="py-20 md:py-32 bg-[#090d16] relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-5 text-left lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Bespoke Engineering</span>
            </div>

            <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-2">
              Don't See What You Need?
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              We'll Build It{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                From Scratch.
              </span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed mb-8">
              Tell us about your business, your goals and the features you need. Our team will create a website designed specifically for you.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">100% Tailored UI/UX</div>
                  <div className="text-xs text-slate-400">
                    No recycled templates. Hand-crafted layouts matching your exact competitive positioning.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Transparent Scope & Milestones</div>
                  <div className="text-xs text-slate-400">
                    Clear milestones, private staging previews, and guaranteed delivery schedule.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Fast Turnaround</div>
                  <div className="text-xs text-slate-400">
                    5 to 14 days full delivery with continuous WhatsApp communication.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={getWhatsAppUrl('Hi Build My Website team, I would like to discuss a custom website from scratch.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Prefer discussing directly on WhatsApp? Click here</span>
              </a>
            </div>
          </div>

          {/* Right Column: Modern Custom Website Request Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0c101d]/90 border border-white/15 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative">
              {submitted ? (
                /* Success Confirmation State */
                <div className="py-12 text-center space-y-5 animate-in fade-in duration-300">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Quote Request Received!
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-bold">{formData.fullName}</span>! We have captured your specifications for{' '}
                    <span className="text-blue-400 font-semibold">{formData.businessName || 'your business'}</span>.
                    Our technical lead will review your scope and provide a detailed estimate within 4 hours.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <button
                      onClick={handleWhatsAppForward}
                      className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Forward Scope via WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-sm border border-white/10 transition-colors"
                    >
                      Submit Another Project
                    </button>
                  </div>
                </div>
              ) : (
                /* The Custom Quote Form */
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Request Custom Website Quote
                    </h3>
                    <p className="text-xs text-slate-400">
                      Fill in the details below for a comprehensive proposal & timeline estimate.
                    </p>
                  </div>

                  {/* Name & Business */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Global Innovations"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* WhatsApp & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formData.whatsappNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappNumber: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. founder@apex.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Business Category & Website Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business Category
                      </label>
                      <select
                        value={formData.businessCategory}
                        onChange={(e) =>
                          setFormData({ ...formData, businessCategory: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#0e1322] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {BUSINESS_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#0e1322] text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Website Type
                      </label>
                      <select
                        value={formData.websiteType}
                        onChange={(e) =>
                          setFormData({ ...formData, websiteType: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#0e1322] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {WEBSITE_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[#0e1322] text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Required Features Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Required Features (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_FEATURES.map((feature) => {
                        const isSelected = formData.requiredFeatures.includes(feature);
                        return (
                          <button
                            type="button"
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                                : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:border-white/15'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-blue-400' : 'bg-slate-600'
                              }`}
                            />
                            <span>{feature}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Estimated Project Budget
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BUDGET_RANGES.map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setFormData({ ...formData, budget: b })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-center border ${
                            formData.budget === b
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                              : 'bg-white/[0.03] text-slate-400 border-white/5 hover:border-white/15'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Additional Details & Reference Websites (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe any particular design inspirations, specific competitors, or must-have functionality..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Get My Free Quote</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-slate-500 mt-2.5">
                      No spam. We respond with a tailored proposal & milestone schedule within 4 hours.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
