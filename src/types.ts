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

export type WebsiteAvailabilityStatus = 'available' | 'reserved' | 'sold' | 'in_development';

export interface RealWebsite {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  description: string;
  price: number; // Selling price
  currency: string; // e.g. 'USD', 'EUR', 'GBP', 'INR'
  liveUrl: string; // The real live / preview website URL
  demoUrl?: string; // Preview/demo URL alias
  thumbnailUrl: string; // Website thumbnail / image URL
  imageUrl?: string; // Website image URL alias
  screenshots?: string[]; // Optional screenshots
  features?: string[];
  technologies?: string[];
  status?: WebsiteAvailabilityStatus;
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
  | 'Requirements Received'
  | 'Development'
  | 'In Progress'
  | 'Preview Ready'
  | 'Client Review'
  | 'Revisions'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface CustomerRequirements {
  businessName: string;
  businessDescription: string;
  logoUrl?: string;
  businessImages?: string[];
  uploadedImages?: string[];
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  socialMedia?: string;
  socialLinks?: string;
  services?: string;
  aboutBusiness?: string;
  preferredColors?: string;
  specialFeatures?: string;
  additionalRequirements?: string;
  specialRequirements?: string;
  submittedAt?: string;
}

export type CallBookingStatus = 'Requested' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled';

export interface CallBooking {
  id: string;
  customerUid?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  callType: string;
  date: string;
  time: string;
  reason: string;
  status: CallBookingStatus;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMessage {
  id: string;
  orderId: string;
  websiteName?: string;
  customerUid?: string;
  customerEmail: string;
  customerName?: string;
  senderRole: 'customer' | 'admin';
  senderName: string;
  message: string;
  type?: 'general' | 'requirement' | 'revision';
  attachments?: string[];
  timestamp: string;
}

export interface Order {
  id: string; // e.g. 'BMW-1024'
  customerUid?: string; // Authoritative Firebase User UID
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
  finalWebsiteUrl?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  admin: boolean;
  assignedAt: string;
  assignedBy?: string;
}

export interface AuditLogEntry {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details?: Record<string, any>;
}

export type AdminNotificationType = 'new_order' | 'requirements_submitted';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  websiteName?: string;
  amount?: number;
  timestamp: string;
  read: boolean;
  priority?: 'high' | 'normal';
  details?: {
    requirementsSummary?: string;
    hasLogo?: boolean;
    hasImages?: boolean;
    businessName?: string;
    status?: string;
  };
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
