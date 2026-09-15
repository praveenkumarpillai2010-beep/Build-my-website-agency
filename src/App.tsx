import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TemplateStore } from './components/TemplateStore';
import { CustomWebsiteSection } from './components/CustomWebsiteSection';
import { AIConceptGenerator } from './components/AIConceptGenerator';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { HowItWorks } from './components/HowItWorks';
import { WhyUsSection } from './components/WhyUsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { MeetTheTeam } from './components/MeetTheTeam';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingSocialContact } from './components/FloatingSocialContact';
import { LivePreviewModal } from './components/LivePreviewModal';
import { TemplatePurchaseModal } from './components/TemplatePurchaseModal';
import { Template, PricingPlan, ServiceItem, PortfolioProject, AIWebsiteConcept } from './types';

export default function App() {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [orderTemplate, setOrderTemplate] = useState<Template | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | undefined>(undefined);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCustomQuote = () => {
    scrollToSection('custom-website');
  };

  const handleExploreTemplates = () => {
    scrollToSection('templates');
  };

  const handleSelectPricingPlan = (plan: PricingPlan) => {
    setSelectedPlanName(plan.name);
    scrollToSection('custom-website');
  };

  const handleSelectService = (service: ServiceItem) => {
    scrollToSection('contact');
  };

  const handleRequestSimilarPortfolio = (project: PortfolioProject) => {
    scrollToSection('custom-website');
  };

  const handleBuildConcept = (concept: AIWebsiteConcept) => {
    scrollToSection('custom-website');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] relative selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar
        onOpenCustomQuote={handleOpenCustomQuote}
        onScrollToSection={scrollToSection}
      />

      {/* Main Agency Sections */}
      <main>
        {/* 1. Powerful Hero */}
        <Hero
          onOpenCustomQuote={handleOpenCustomQuote}
          onExploreTemplates={handleExploreTemplates}
        />

        {/* 2. Ready-Made Website Template Store */}
        <TemplateStore
          onLivePreview={(t) => setPreviewTemplate(t)}
          onBuyNow={(t) => setOrderTemplate(t)}
        />

        {/* 3. Custom Website Section (From Scratch) */}
        <CustomWebsiteSection initialPlan={selectedPlanName} />

        {/* 4. Futuristic AI Website Concept Studio */}
        <AIConceptGenerator onBuildConcept={handleBuildConcept} />

        {/* 5. Professional Services */}
        <ServicesSection onSelectService={handleSelectService} />

        {/* 6. Transparent Pricing Plans */}
        <PricingSection onSelectPlan={handleSelectPricingPlan} />

        {/* 7. How It Works Timeline */}
        <HowItWorks onGetStarted={() => scrollToSection('templates')} />

        {/* 8. Why Build My Website (Statistics & Benefits) */}
        <WhyUsSection />

        {/* 9. Curated Portfolio Projects */}
        <PortfolioSection onRequestSimilar={handleRequestSimilarPortfolio} />

        {/* 10. Loved by Businesses (Testimonials) */}
        <TestimonialsSection />

        {/* 11. Meet The Team (Instagram Glassmorphism Profiles) */}
        <MeetTheTeam />

        {/* 12. FAQ Accordion */}
        <FAQSection />

        {/* 13. Contact & Quote Request */}
        <ContactSection onRequestQuoteClick={handleOpenCustomQuote} />
      </main>

      {/* Footer */}
      <Footer
        onScrollToSection={scrollToSection}
        onOpenCustomQuote={handleOpenCustomQuote}
      />

      {/* Floating Social Contact Widget (WhatsApp & Instagram Profile Selector) */}
      <FloatingSocialContact />

      {/* Interactive Fullscreen/Responsive Live Template Preview Modal */}
      {previewTemplate && (
        <LivePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onOrderTemplate={(t) => setOrderTemplate(t)}
        />
      )}

      {/* Template Purchase / Customization Order Modal */}
      {orderTemplate && (
        <TemplatePurchaseModal
          template={orderTemplate}
          onClose={() => setOrderTemplate(null)}
        />
      )}
    </div>
  );
}
