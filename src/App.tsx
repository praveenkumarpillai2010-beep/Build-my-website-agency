import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RealWebsitesSection } from './components/RealWebsitesSection';
import { CustomWebsiteSection } from './components/CustomWebsiteSection';
import { AIConceptGenerator } from './components/AIConceptGenerator';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { HowItWorks } from './components/HowItWorks';
import { WhyUsSection } from './components/WhyUsSection';
import { MeetTheTeam } from './components/MeetTheTeam';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingSocialContact } from './components/FloatingSocialContact';

// Modals
import { WebsiteDetailsModal } from './components/WebsiteDetailsModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { RequirementsModal } from './components/RequirementsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';

import { RealWebsite, Order, PricingPlan, ServiceItem, AIWebsiteConcept } from './types';

export default function App() {
  // Modal states
  const [selectedWebsiteForDetails, setSelectedWebsiteForDetails] = useState<RealWebsite | null>(null);
  const [selectedWebsiteForBuy, setSelectedWebsiteForBuy] = useState<RealWebsite | null>(null);
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<PricingPlan | null>(null);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [orderForRequirements, setOrderForRequirements] = useState<Order | null>(null);

  // Sync state trigger
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCustomQuote = () => {
    scrollToSection('custom-website');
  };

  const handleExploreWebsites = () => {
    scrollToSection('templates');
  };

  const handleSelectPricingPlan = (plan: PricingPlan) => {
    // Open direct checkout with selected plan details
    setSelectedPlanForBuy(plan);
  };

  const handleSelectService = (service: ServiceItem) => {
    scrollToSection('contact');
  };

  const handleBuildConcept = (concept: AIWebsiteConcept) => {
    scrollToSection('custom-website');
  };

  const handleCheckoutSuccess = (order: Order) => {
    setDataRefreshTrigger((prev) => prev + 1);
  };

  const handleDataChanged = () => {
    setDataRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] relative selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar
        onOpenCustomQuote={handleOpenCustomQuote}
        onScrollToSection={scrollToSection}
        onOpenCustomerDashboard={() => setIsCustomerDashboardOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Main Agency Content */}
      <main>
        {/* 1. Hero */}
        <Hero
          onOpenCustomQuote={handleOpenCustomQuote}
          onExploreTemplates={handleExploreWebsites}
        />

        {/* 2. Real Websites / Our Websites Section (Admin-Controlled System) */}
        <RealWebsitesSection
          onSelectWebsiteDetails={(w) => setSelectedWebsiteForDetails(w)}
          onBuyWebsite={(w) => setSelectedWebsiteForBuy(w)}
          onOpenCustomQuote={handleOpenCustomQuote}
          refreshTrigger={dataRefreshTrigger}
        />

        {/* 3. Custom Website Section (From Scratch) */}
        <CustomWebsiteSection initialPlan={selectedPlanForBuy?.name} />

        {/* 4. AI Website Concept Studio */}
        <AIConceptGenerator onBuildConcept={handleBuildConcept} />

        {/* 5. Professional Agency Services */}
        <ServicesSection onSelectService={handleSelectService} />

        {/* 6. Transparent Pricing Plans */}
        <PricingSection onSelectPlan={handleSelectPricingPlan} />

        {/* 7. How It Works Timeline */}
        <HowItWorks onGetStarted={handleExploreWebsites} />

        {/* 8. Why Build My Website (Benefits & Real Direct Support) */}
        <WhyUsSection />

        {/* 9. Meet The Team (Nimesh Tak & Pravin Pillai 👻 with clickable Instagram profiles) */}
        <MeetTheTeam />

        {/* 10. FAQ Accordion */}
        <FAQSection />

        {/* 11. Contact & Inquiries Form */}
        <ContactSection onRequestQuoteClick={handleOpenCustomQuote} />
      </main>

      {/* Footer */}
      <Footer
        onScrollToSection={scrollToSection}
        onOpenCustomQuote={handleOpenCustomQuote}
        onOpenCustomerDashboard={() => setIsCustomerDashboardOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Fixed Floating Social Contact Button (Instagram & WhatsApp) */}
      <FloatingSocialContact />

      {/* --- MODALS --- */}

      {/* 1. Website Details Modal */}
      {selectedWebsiteForDetails && (
        <WebsiteDetailsModal
          website={selectedWebsiteForDetails}
          onClose={() => setSelectedWebsiteForDetails(null)}
          onBuyWebsite={(w) => {
            setSelectedWebsiteForDetails(null);
            setSelectedWebsiteForBuy(w);
          }}
        />
      )}

      {/* 2. Checkout Modal (For Real Website or Pricing Plan) */}
      {(selectedWebsiteForBuy || selectedPlanForBuy) && (
        <CheckoutModal
          website={selectedWebsiteForBuy}
          customPackageName={selectedPlanForBuy?.name}
          customAmount={
            selectedPlanForBuy
              ? Number(selectedPlanForBuy.price.replace(/[^0-9.]/g, ''))
              : undefined
          }
          onClose={() => {
            setSelectedWebsiteForBuy(null);
            setSelectedPlanForBuy(null);
          }}
          onSuccess={handleCheckoutSuccess}
          onOpenRequirements={(order) => setOrderForRequirements(order)}
        />
      )}

      {/* 3. Customer Dashboard Modal */}
      {isCustomerDashboardOpen && (
        <CustomerDashboardModal
          onClose={() => setIsCustomerDashboardOpen(false)}
          onOpenRequirements={(order) => setOrderForRequirements(order)}
          onOpenCatalog={() => {
            setIsCustomerDashboardOpen(false);
            scrollToSection('templates');
          }}
          refreshTrigger={dataRefreshTrigger}
        />
      )}

      {/* 4. Customer Requirements Form Modal */}
      {orderForRequirements && (
        <RequirementsModal
          orderId={orderForRequirements.id}
          websiteName={orderForRequirements.websiteName}
          initialRequirements={orderForRequirements.requirements}
          onClose={() => setOrderForRequirements(null)}
          onSuccess={() => {
            setOrderForRequirements(null);
            setIsCustomerDashboardOpen(true);
            setDataRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {/* 5. Agency Admin Control Center Modal */}
      {isAdminDashboardOpen && (
        <AdminDashboardModal
          onClose={() => setIsAdminDashboardOpen(false)}
          onDataChanged={handleDataChanged}
        />
      )}
    </div>
  );
}
