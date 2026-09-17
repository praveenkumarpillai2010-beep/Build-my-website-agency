export type TemplateCategory =
  | 'All'
  | 'Business'
  | 'Restaurant'
  | 'Hotel'
  | 'E-commerce'
  | 'Portfolio'
  | 'Medical'
  | 'Education'
  | 'Fitness'
  | 'Construction'
  | 'Automobile';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  startingPrice: number;
  currency: string;
  featured?: boolean;
  tag?: string;
  features: string[];
  primaryColor: string;
  accentColor: string;
  pagesIncluded: number;
  deliveryDays: number;
  previewDetails: {
    heroTitle: string;
    heroSubtitle: string;
    badgeText: string;
    servicesPreview: string[];
    sampleImageUrl: string;
  };
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  details: string;
  iconName: string;
  features: string[];
  deliverable: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  subtitle: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
  badge?: string;
}

export interface TimelineStep {
  step: string;
  title: string;
  description: string;
  detail: string;
  iconName: string;
}

export interface AgencyStats {
  websitesCount: string;
  websitesLabel: string;
  clientsCount: string;
  clientsLabel: string;
  supportAvailability: string;
  supportLabel: string;
  deliverySpeed: string;
  deliveryLabel: string;
}

export interface Benefit {
  title: string;
  description: string;
  iconName: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  industry: string;
  category: 'Business' | 'E-commerce' | 'Hospitality' | 'Healthcare' | 'Automotive';
  description: string;
  metrics: string;
  tags: string[];
  color: string;
  previewUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  handle: string;
  instagramHandle?: string;
  platform: 'Instagram';
  url: string;
  instagramUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  business: string;
  rating: number;
  review: string;
  location: string;
  verified: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CustomWebsiteQuoteForm {
  fullName: string;
  businessName: string;
  whatsappNumber: string;
  email: string;
  businessCategory: string;
  websiteType: string;
  requiredFeatures: string[];
  budget: string;
  message: string;
}

export interface RealWebsite {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number; // In USD
  currency: string; // 'USD'
  liveUrl: string; // The real live website URL entered by admin
  thumbnailUrl: string; // Website thumbnail/preview image
  screenshots?: string[]; // Optional screenshots
  features?: string[];
  featured: boolean;
  published: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Payment Pending'
  | 'Payment Confirmed'
  | 'Requirements Needed'
  | 'In Progress'
  | 'Preview Ready'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface CustomerRequirements {
  businessName: string;
  logoUrl?: string;
  businessDescription: string;
  phone: string;
  email: string;
  address?: string;
  whatsapp?: string;
  socialLinks?: string;
  services?: string;
  aboutBusiness?: string;
  uploadedImages?: string[];
  specialRequirements?: string;
  submittedAt?: string;
}

export interface Order {
  id: string; // e.g. 'BMW-1024'
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName?: string;
  websiteId?: string;
  websiteName: string;
  amount: number;
  currency: string; // 'USD'
  paymentStatus: PaymentStatus;
  paymentProvider?: 'stripe' | 'paypal' | 'verified_gateway';
  paymentTransactionId?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  requirements?: CustomerRequirements;
  adminNotes?: string;
  previewUrl?: string;
}

export interface RealTestimonial {
  id: string;
  clientName: string;
  clientRole: string;
  companyName: string;
  rating: number;
  reviewText: string;
  websiteUrl?: string;
  date: string;
}

export interface AgencySettings {
  agencyName: string;
  whatsappNumber: string;
  displayPhone: string;
  email: string;
  showStats: boolean;
  statsWebsitesCount?: string;
  statsClientsCount?: string;
  statsSupportAvailability?: string;
  statsDeliverySpeed?: string;
  stripeEnabled: boolean;
  stripePublishableKey?: string;
  paypalEnabled: boolean;
  paypalClientId?: string;
  testimonials: RealTestimonial[];
}

export interface AIWebsiteConcept {
  userQuery: string;
  websiteHeadline: string;
  subheadline: string;
  suggestedStyle: string;
  typographyArchetype: string;
  colorPalette: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  recommendedSections: string[];
  features: string[];
  callToAction: {
    primary: string;
    secondary: string;
    strategy: string;
  };
  suggestedStructure: {
    page: string;
    purpose: string;
  }[];
  marketInsights?: string;
  generatedAt: string;
}
