import {
  Template,
  ServiceItem,
  PricingPlan,
  TimelineStep,
  AgencyStats,
  Benefit,
  PortfolioProject,
  Testimonial,
  FAQItem,
  TeamMember,
} from '../types';

/**
 * ============================================================================
 * AGENCY CONFIGURATION (EDITABLE)
 * You can customize phone number, WhatsApp, email and basic agency information here.
 * ============================================================================
 */
export const AGENCY_CONFIG = {
  name: 'BUILD MY WEBSITE',
  tagline: 'Your Business. Your Website. Your Digital Growth.',
  email: 'contact@buildmywebsite.agency',
// EDIT YOUR WHATSAPP NUMBER HERE (in international format without '+' or spaces for links):
  whatsappNumber: '15551234567',
  displayPhone: '+1 (555) 123-4567',
  address: 'Global Web Agency • Serving Businesses Worldwide',
  foundedYear: 2024,
  currencySymbol: '$',
};

/**
 * Configurable WhatsApp Phone Number (international format, no + or spaces)
 */
export const WHATSAPP_NUMBER: string = AGENCY_CONFIG.whatsappNumber;
export const DEFAULT_WHATSAPP_MESSAGE: string = "Hi! I'm interested in getting a website from Build My Website.";

/**
 * ============================================================================
 * INSTAGRAM & TEAM CONFIGURATION (EDITABLE)
 * ============================================================================
 */
/**
 * Editable configuration variable for Pravin Pillai's Instagram profile URL.
 * Update with the exact profile URL (e.g. 'https://www.instagram.com/PravinPillai').
 * Do NOT invent a fake URL if the exact profile URL has not been provided.
 */
export const instagramPravinUrl: string = 'https://www.instagram.com/pravin.0fficial/';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'nimesh-tak',
    name: 'Nimesh Tak',
    handle: '@nimesh_tak624',
    instagramHandle: '@nimesh_tak624',
    platform: 'Instagram',
    url: 'https://www.instagram.com/nimesh_tak624',
    instagramUrl: 'https://www.instagram.com/nimesh_tak624',
  },
  {
    id: 'pravin-pillai',
    name: 'Pravin Pillai 👻',
    handle: '@pravin.0fficial',
    instagramHandle: '@pravin.0fficial',
    platform: 'Instagram',
    url: 'https://www.instagram.com/pravin.0fficial/',
    instagramUrl: 'https://www.instagram.com/pravin.0fficial/',
  },
];

/**
 * Helper to construct WhatsApp link with custom encoded message
 */
export function getWhatsAppUrl(customMessage: string = DEFAULT_WHATSAPP_MESSAGE): string {
  const cleanNumber = (WHATSAPP_NUMBER || AGENCY_CONFIG.whatsappNumber).replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(customMessage);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

/**
 * Statistics shown in the "Why Build My Website" section (Editable placeholder values)
 */
export const AGENCY_STATS: AgencyStats = {
  websitesCount: '100+',
  websitesLabel: 'Websites Built',
  clientsCount: '50+',
  clientsLabel: 'Happy Clients',
  supportAvailability: '24/7',
  supportLabel: 'Dedicated Support',
  deliverySpeed: 'Fast',
  deliveryLabel: 'Rapid Delivery (48h-7d)',
};

/**
 * Core Agency Benefits
 */
export const AGENCY_BENEFITS: Benefit[] = [
  {
    title: 'Modern Design',
    description: 'Clean aesthetics inspired by high-end tech products, balanced whitespace and striking typography.',
    iconName: 'Sparkles',
  },
  {
    title: 'Mobile Responsive',
    description: 'Pixel-perfect responsiveness across iPhones, Android devices, iPads, laptops, and ultra-wide screens.',
    iconName: 'Smartphone',
  },
  {
    title: 'Fast Performance',
    description: 'Lightning-fast load times with 95+ Google PageSpeed scores, optimized imagery and zero bloat.',
    iconName: 'Zap',
  },
  {
    title: 'SEO Ready',
    description: 'Engineered with clean semantic HTML, OpenGraph tags, schema markup, and meta tags for Google indexing.',
    iconName: 'Search',
  },
  {
    title: 'Business Focused',
    description: 'Conversion-driven layouts with high-visibility CTA buttons, WhatsApp integration, and lead capture forms.',
    iconName: 'TrendingUp',
  },
  {
    title: 'Professional Support',
    description: 'Friendly, responsive technical maintenance, hosting setup assistance, and continuous ongoing support.',
    iconName: 'Headphones',
  },
];

/**
 * Templates List (Includes all requested categories & starting prices)
 */
export const TEMPLATES: Template[] = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    category: 'Business',
    description: 'Sleek corporate identity website with service showcases, team grid, client proof, and lead capture.',
    startingPrice: 69,
    currency: '$',
    featured: true,
    tag: 'Best Seller',
    pagesIncluded: 5,
    deliveryDays: 2,
    primaryColor: '#3B82F6',
    accentColor: '#60A5FA',
    features: ['Service Grid', 'Client Proof Logos', 'Team Section', 'Lead Generation Form', 'WhatsApp Quick Contact'],
    previewDetails: {
      heroTitle: 'Accelerate Enterprise Growth With Modern Advisory',
      heroSubtitle: 'We help mid-market companies scale operations, reduce overheads, and capture untapped market share.',
      badgeText: 'CORPORATE & CONSULTING',
      servicesPreview: ['Strategic Advisory', 'Risk Auditing', 'Capital Structuring', 'Digital Transformation'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'restaurant-pro',
    name: 'Restaurant Pro',
    category: 'Restaurant',
    description: 'Appetizing food website featuring digital food menu, table reservations, chef specialities & WhatsApp orders.',
    startingPrice: 79,
    currency: '$',
    featured: true,
    tag: 'Popular',
    pagesIncluded: 5,
    deliveryDays: 3,
    primaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    features: ['Digital Food Menu', 'Table Reservation Booking', 'WhatsApp Order Link', 'Google Maps Location', 'Chef Showcase'],
    previewDetails: {
      heroTitle: 'Artisanal Flavors Crafted From Heritage Recipes',
      heroSubtitle: 'Experience dining reimagined with fresh farm-to-table ingredients, intimate ambience, and culinary mastery.',
      badgeText: 'FINE DINING & BISTRO',
      servicesPreview: ['Signature Tasting Menu', 'Private Dining Rooms', 'Catering Events', 'Chef Tasting Table'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'luxury-hotel',
    name: 'Luxury Hotel',
    category: 'Hotel',
    description: 'Breathtaking resort & boutique hotel template with room suites gallery, amenity cards and booking enquiry.',
    startingPrice: 99,
    currency: '$',
    featured: false,
    tag: 'Premium Luxury',
    pagesIncluded: 6,
    deliveryDays: 4,
    primaryColor: '#D97706',
    accentColor: '#F59E0B',
    features: ['Suites & Rooms Showcase', 'Amenities Virtual Tour', 'Direct Booking Enquiry', 'Guest Reviews', 'Airport Transfer Booking'],
    previewDetails: {
      heroTitle: 'An Oasis Of Serenity In The Heart Of The Hills',
      heroSubtitle: 'Wake up to panoramic valley views, heated infinity pools, spa therapies, and five-star hospitality.',
      badgeText: 'BOUTIQUE RESORT & SPA',
      servicesPreview: ['Presidential Suite', 'Ayurvedic Spa & Wellness', 'Infinity Pool Lounge', 'Concierge Excursions'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'ecommerce-pro',
    name: 'E-Commerce Pro',
    category: 'E-commerce',
    description: 'Full-featured online shop with product grid, category tabs, shopping cart UI, customer reviews and checkout flow.',
    startingPrice: 149,
    currency: '$',
    featured: true,
    tag: 'Top Rated',
    pagesIncluded: 8,
    deliveryDays: 5,
    primaryColor: '#10B981',
    accentColor: '#34D399',
    features: ['Product Catalog', 'Interactive Cart & Drawer', 'Stripe & PayPal Ready', 'Customer Reviews', 'Order Notification Alerts'],
    previewDetails: {
      heroTitle: 'Minimalist Essentials Designed For Everyday Living',
      heroSubtitle: 'Discover sustainably engineered apparel, handcrafted accessories, and timeless essentials made to last.',
      badgeText: 'FASHION & LIFESTYLE STORE',
      servicesPreview: ['New Season Arrivals', 'Limited Editions', 'Gift Bundles', 'Express 48h Shipping'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'construction-company',
    name: 'Construction Company',
    category: 'Construction',
    description: 'Robust industrial layout highlighting completed projects, heavy equipment, engineering expertise & tender estimates.',
    startingPrice: 79,
    currency: '$',
    featured: false,
    tag: 'Industrial',
    pagesIncluded: 5,
    deliveryDays: 3,
    primaryColor: '#EA580C',
    accentColor: '#FB923C',
    features: ['Completed Projects Gallery', 'Equipment & Fleet', 'Safety Certifications', 'Instant Tender/Quote Form', 'Client Testimonials'],
    previewDetails: {
      heroTitle: 'Building Solid Foundations For Modern Infrastructure',
      heroSubtitle: 'Over 25 years delivering civil engineering, commercial complexes, and industrial warehousing on schedule.',
      badgeText: 'CIVIL & INFRASTRUCTURE',
      servicesPreview: ['Commercial Construction', 'Architectural Planning', 'Industrial Warehousing', 'Retrofit & Renovation'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'personal-portfolio',
    name: 'Personal Portfolio',
    category: 'Portfolio',
    description: 'High-impact personal brand website for designers, engineers, photographers, consultants and creative directors.',
    startingPrice: 49,
    currency: '$',
    featured: false,
    tag: 'Creative',
    pagesIncluded: 4,
    deliveryDays: 2,
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    features: ['Curated Case Studies', 'Skills & Tech Stack', 'Interactive Resume', 'Contact & Booking', 'Social Proof'],
    previewDetails: {
      heroTitle: 'Crafting High-Converting Digital Interfaces & Brands',
      heroSubtitle: 'Senior product designer & strategist helping ambitious tech startups turn complex problems into intuitive experiences.',
      badgeText: 'DESIGNER & CREATIVE DIRECTOR',
      servicesPreview: ['UI/UX Product Design', 'Brand Identity Systems', 'Design Systems', 'Web Strategy'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'fitness-studio',
    name: 'Fitness Studio',
    category: 'Fitness',
    description: 'Energetic gym and wellness template with class schedules, trainer rosters, membership tiers and free trial booking.',
    startingPrice: 69,
    currency: '$',
    featured: false,
    tag: 'High Energy',
    pagesIncluded: 5,
    deliveryDays: 3,
    primaryColor: '#EF4444',
    accentColor: '#F87171',
    features: ['Live Class Timetable', 'Trainer Profiles', 'Membership Pricing Matrix', '1-Day Free Pass Sign-up', 'Transformation Gallery'],
    previewDetails: {
      heroTitle: 'Transform Your Body, Mind, And Everyday Performance',
      heroSubtitle: 'High-intensity functional training, Olympic lifting, and recovery sauna in a premium boutique athletic space.',
      badgeText: 'ATHLETIC CLUB & TRAINING',
      servicesPreview: ['Strength & Conditioning', 'HIIT Circuit Labs', 'Personal Coaching', 'Recovery & Cryo Sauna'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'automobile-dealer',
    name: 'Automobile Dealer',
    category: 'Automobile',
    description: 'Showroom-grade layout with inventory filters, vehicle specs, EMI monthly calculator and test drive scheduler.',
    startingPrice: 99,
    currency: '$',
    featured: true,
    tag: 'Showroom Grade',
    pagesIncluded: 6,
    deliveryDays: 4,
    primaryColor: '#0284C7',
    accentColor: '#38BDF8',
    features: ['Vehicle Fleet Showcase', 'Interactive EMI Calculator', 'Book Test Drive Modal', 'Trade-In Valuation Request', 'WhatsApp Sales Hotline'],
    previewDetails: {
      heroTitle: 'Discover Certified Pre-Owned & Luxury Supercars',
      heroSubtitle: 'Verified 160-point inspection, complete service histories, transparent financing, and home doorstep delivery.',
      badgeText: 'PREMIUM AUTO SHOWROOM',
      servicesPreview: ['Luxury Sedan Fleet', 'Performance SUVs', 'On-Site Trade-In Valuation', 'Low-Rate Auto Financing'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'medical-clinic',
    name: 'Dental & Medical Care',
    category: 'Medical',
    description: 'Clean healthcare website with doctor credentials, patient treatments, clinic hours and direct appointment booking.',
    startingPrice: 79,
    currency: '$',
    featured: false,
    tag: 'Healthcare',
    pagesIncluded: 5,
    deliveryDays: 3,
    primaryColor: '#06B6D4',
    accentColor: '#22D3EE',
    features: ['Doctor & Specialist Directory', 'Book Appointment Form', 'Treatment Guides', 'Patient Testimonials', 'Emergency Clinic Line'],
    previewDetails: {
      heroTitle: 'Comprehensive Healthcare With Compassion & Precision',
      heroSubtitle: 'Advanced multi-specialty care, painless treatments, and patient-first medical technology.',
      badgeText: 'SPECIALTY CLINIC & DIAGNOSTICS',
      servicesPreview: ['Preventative Diagnostics', 'Cosmetic Dentistry', 'Pediatric Wellness', 'Teleconsultation'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop',
    },
  },
  {
    id: 'education-academy',
    name: 'EduLearn Academy',
    category: 'Education',
    description: 'Modern educational portal for coaching centers, schools, skill bootcamps with syllabus downloads and admissions.',
    startingPrice: 79,
    currency: '$',
    featured: false,
    tag: 'EdTech',
    pagesIncluded: 6,
    deliveryDays: 3,
    primaryColor: '#6366F1',
    accentColor: '#818CF8',
    features: ['Course Catalog & Syllabus', 'Faculty Credentials', 'Online Admissions Application', 'Batch Timetable', 'Student FAQ'],
    previewDetails: {
      heroTitle: 'Master Future-Ready Skills With Industry Mentors',
      heroSubtitle: 'Hands-on practical learning, live project mentoring, and 100% placement assistance programs.',
      badgeText: 'TRAINING & COACHING INSTITUTE',
      servicesPreview: ['Full-Stack Development', 'Data Science & AI', 'Executive Leadership', 'Career Placement Lab'],
      sampleImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
    },
  },
];

/**
 * All 8 Agency Services
 */
export const SERVICES: ServiceItem[] = [
  {
    id: 'website-design',
    title: 'Website Design',
    shortDesc: 'Beautiful, modern and conversion-focused designs.',
    details: 'Custom tailored layouts crafted with Apple-level visual polish, strategic typography, and high-impact visual rhythm that turns passive visitors into paying customers.',
    iconName: 'Layout',
    features: ['Custom Figma Prototyping', 'Modern Dark/Light Themes', 'Micro-Interactions & Motion', 'Mobile-First Layouts'],
    deliverable: 'Bespoke UI Design & Design System',
  },
  {
    id: 'website-development',
    title: 'Website Development',
    shortDesc: 'Fast and responsive websites built for modern businesses.',
    details: 'Clean, robust code engineered with React, Next.js, and modern toolchains. Rock-solid performance, ultra-fast loading, and zero technical bloat.',
    iconName: 'Code',
    features: ['React & Next.js Architecture', 'Sub-second Page Load', 'Cross-browser Compatibility', 'Clean Semantic Code'],
    deliverable: 'Production-ready Web Platform',
  },
  {
    id: 'e-commerce',
    title: 'E-Commerce',
    shortDesc: 'Online stores with product catalogs and shopping functionality.',
    details: 'High-converting digital storefronts complete with seamless product catalogs, smart filtering, interactive shopping carts, and effortless payment gateways.',
    iconName: 'ShoppingBag',
    features: ['Product Inventory Management', 'Secure Checkout & Payment', 'Automated Order Alerts', 'Discount Codes & Bundles'],
    deliverable: 'Complete Ready-to-Sell Online Store',
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    shortDesc: 'High-converting landing pages for products and campaigns.',
    details: 'Laser-focused single-page funnels engineered specifically for Google Ads, Meta campaigns, product launches, or lead generation initiatives.',
    iconName: 'Sparkle',
    features: ['A/B Test Optimized Layout', 'Speed Optimized (<1.2s)', 'Sticky Call-to-Actions', 'Analytics & Pixel Integration'],
    deliverable: 'High-Converting Campaign Funnel',
  },
  {
    id: 'website-redesign',
    title: 'Website Redesign',
    shortDesc: 'Transform outdated websites into modern experiences.',
    details: 'Breathe new life into sluggish, dated legacy websites. We preserve your existing SEO rankings while totally overhauling the visual identity and user experience.',
    iconName: 'RefreshCw',
    features: ['SEO Migration Protection', 'Contemporary Visual Facelift', 'Information Architecture Audit', 'Mobile UX Overhaul'],
    deliverable: 'Modernized Brand Digital Experience',
  },
  {
    id: 'seo-ready',
    title: 'SEO Ready',
    shortDesc: 'Build websites with search-engine-friendly structure.',
    details: 'Engineered from day one for top Google search visibility with semantic schema markup, open graph metadata, optimized image formats, and lightning crawlability.',
    iconName: 'SearchCheck',
    features: ['Schema.org JSON-LD Markup', 'Robots.txt & XML Sitemaps', 'Speed & Core Web Vitals', 'Local Business Geo Tags'],
    deliverable: 'Search-Engine Indexed Structure',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    shortDesc: 'Ongoing updates, improvements and technical support.',
    details: 'Sleep peacefully knowing your web platform is kept up-to-date with regular security patches, automated backups, content updates, and priority bug fixes.',
    iconName: 'ShieldCheck',
    features: ['Automated Cloud Backups', 'Security Vulnerability Audits', 'Monthly Content Revisions', 'Fast Incident Response'],
    deliverable: 'Worry-Free Ongoing Support',
  },
  {
    id: 'domain-hosting',
    title: 'Domain & Hosting Assistance',
    shortDesc: 'Help customers get their domain and hosting online.',
    details: 'Zero headaches. We configure your DNS records, link your custom domain, set up free SSL encryption certificates, and connect high-speed global CDN hosting.',
    iconName: 'Globe',
    features: ['DNS & Nameserver Setup', 'Free Wildcard SSL (HTTPS)', 'Global CDN Edge Delivery', 'Custom Professional Emails'],
    deliverable: 'Fully Live Hosted Domain',
  },
];

/**
 * Transparent Pricing Plans
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '$39',
    priceNumber: 39,
    subtitle: 'For individuals and small businesses.',
    features: [
      'Professional design',
      'Responsive website',
      'Up to 5 sections',
      'Contact form',
      'Basic SEO',
      'WhatsApp integration',
    ],
    buttonText: 'Choose Starter',
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: '$89',
    priceNumber: 89,
    subtitle: 'For growing businesses.',
    popular: true,
    badge: 'MOST POPULAR',
    features: [
      'Premium design',
      'Responsive website',
      'Multiple pages',
      'Contact forms',
      'WhatsApp integration',
      'Basic SEO',
      'Animations',
      'Google Maps',
    ],
    buttonText: 'Choose Professional',
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '$169',
    priceNumber: 169,
    subtitle: 'For businesses wanting a premium online presence.',
    features: [
      'Custom UI/UX',
      'Multiple pages',
      'Advanced animations',
      'SEO setup',
      'Forms',
      'WhatsApp',
      'Analytics',
      'Priority support',
    ],
    buttonText: 'Choose Premium',
  },
  {
    id: 'ecommerce',
    name: 'E-COMMERCE',
    price: '$249+',
    priceNumber: 249,
    subtitle: 'For businesses selling products online.',
    badge: 'Online Store',
    features: [
      'Product catalog',
      'Shopping cart',
      'Checkout integration',
      'Admin-ready structure',
      'Responsive design',
      'Payment integration support',
      'SEO-ready structure',
    ],
    buttonText: 'Build My Store',
  },
];

/**
 * 4-Step Timeline Flow
 */
export const TIMELINE_STEPS: TimelineStep[] = [
  {
    step: '01',
    title: 'Choose',
    description: 'Choose a template or tell us what you want.',
    detail: 'Pick from our curated template library or share your vision for a custom-built website via our simple quote form.',
    iconName: 'MousePointerClick',
  },
  {
    step: '02',
    title: 'Customize',
    description: 'We customize the website for your business.',
    detail: 'Our engineering team injects your logo, brand colors, real copywriting, services, and photography with precision craftsmanship.',
    iconName: 'Wrench',
  },
  {
    step: '03',
    title: 'Review',
    description: 'Review your website and request changes.',
    detail: 'We provide a private live preview link. Test everything on your phone and laptop, and request any tweaks until you are 100% delighted.',
    iconName: 'CheckSquare',
  },
  {
    step: '04',
    title: 'Launch',
    description: 'Your website goes live.',
    detail: 'We hook up your domain, configure free HTTPS security, connect Google indexing, and hand over the keys to your new online home.',
    iconName: 'Rocket',
  },
];

/**
 * Placeholder Portfolio Projects (Can easily be replaced with real agency projects)
 */
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'project-apex-consulting',
    title: 'Apex Strategy Partners',
    industry: 'Financial Advisory & Law',
    category: 'Business',
    description: 'High-conversion corporate platform with custom client booking and case study archives.',
    metrics: '+240% Inbound Consultations',
    tags: ['Next.js', 'Corporate', 'Fintech', 'Lead Generation'],
    color: 'from-blue-600 to-indigo-900',
    previewUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'project-lumina-store',
    title: 'Lumina Home Living',
    industry: 'Minimalist Interior Products',
    category: 'E-commerce',
    description: 'Fast modern storefront featuring dynamic product filtering, Apple Pay, and Stripe checkout.',
    metrics: '99/100 Mobile Speed • 3.2x Sales',
    tags: ['E-Commerce', 'Shopify UI', 'Cart System', 'Payment Gateway'],
    color: 'from-emerald-600 to-teal-900',
    previewUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'project-aurora-resort',
    title: 'Aurora Hillside Sanctuary',
    industry: 'Luxury Eco-Resort & Spa',
    category: 'Hospitality',
    description: 'Visual storytelling website with interactive 360 villa tours and direct room reservation flow.',
    metrics: '78% Direct Bookings vs OTAs',
    tags: ['Hospitality', 'Booking Engine', 'Photo Gallery', 'Multi-Language'],
    color: 'from-amber-600 to-orange-950',
    previewUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'project-veloce-motors',
    title: 'Veloce Prestige Motors',
    industry: 'Exotic & Sports Automobile',
    category: 'Automotive',
    description: 'High-end automobile showroom with real-time inventory filters, EMI calculator and VIP test drives.',
    metrics: '42 Test Drives Booked First Month',
    tags: ['Showroom', 'EMI Calculator', 'WhatsApp Direct', 'Video Integration'],
    color: 'from-cyan-600 to-blue-950',
    previewUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'project-dentacare-plus',
    title: 'Dr. Smile Dental Studio',
    industry: 'Aesthetic Dentistry & Implants',
    category: 'Healthcare',
    description: 'Patient-friendly clinic portal featuring treatment guides, smile transformation sliders and instant booking.',
    metrics: '4.9★ from 180+ Reviews',
    tags: ['Medical', 'Appointment Booking', 'Smile Simulator', 'SEO Ready'],
    color: 'from-sky-600 to-indigo-950',
    previewUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'project-elevate-craft',
    title: 'CraftBrew Social House',
    industry: 'Microbrewery & Kitchen',
    category: 'Hospitality',
    description: 'Vibrant dining website with interactive taproom beer menu, live event calendar and table booking.',
    metrics: '+65% Weekend Footfall',
    tags: ['Restaurant', 'QR Menu', 'Table Booking', 'Events Calendar'],
    color: 'from-purple-600 to-violet-950',
    previewUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop',
  },
];

/**
 * Clearly marked placeholder customer testimonials (Easily replaceable)
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Rajesh Sharma',
    role: 'Founder & CEO',
    business: 'Sharma Logistics Solutions',
    rating: 5,
    review:
      'We needed a corporate website ready in 3 days for an upcoming investor pitch. BUILD MY WEBSITE delivered the Modern Business template customized with our fleet info in under 48 hours. Absolute lifesaver.',
    location: 'Mumbai, India',
    verified: true,
  },
  {
    id: 'test-2',
    name: 'Priya Mehra',
    role: 'Managing Director',
    business: 'Vanilla Bean Patisserie',
    rating: 5,
    review:
      'The Restaurant Pro template transformed our bakery. Customers now browse our weekend cake menu online and order via WhatsApp with one click. Our direct cake orders jumped by 40% in week one.',
    location: 'Bangalore, India',
    verified: true,
  },
  {
    id: 'test-3',
    name: 'Vikramaditya Rao',
    role: 'Principal Architect',
    business: 'V-Studio Design Lab',
    rating: 5,
    review:
      'I was tired of cookie-cutter agency templates. The dark luxury theme and smooth animations look like an international Apple product page. Clients constantly ask who designed our website.',
    location: 'Hyderabad, India',
    verified: true,
  },
  {
    id: 'test-4',
    name: 'Ananya Deshmukh',
    role: 'Co-Founder',
    business: 'Kensho Apparel',
    rating: 5,
    review:
      'From domain setup to online Stripe payment integration, everything was handled flawlessly. Clean code, ultra-fast loading on phones, and their WhatsApp support is always on point.',
    location: 'Austin, TX',
    verified: true,
  },
];

/**
 * All 8 requested FAQ questions & answers
 */
export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How long does it take to build a website?',
    answer:
      'Ready-made templates are customized and ready within 48 to 72 hours once we receive your content and logo. For custom-built websites, timelines typically range from 5 to 14 days depending on custom feature requirements, pages, and integrations.',
  },
  {
    id: 'faq-2',
    question: 'Can I customize a template?',
    answer:
      'Yes, absolutely! Every template is fully adaptable. We customize brand colors, typography, logos, images, section layouts, copy, contact forms, and WhatsApp links to match your brand identity 100%.',
  },
  {
    id: 'faq-3',
    question: 'Do you provide hosting?',
    answer:
      'Yes. We provide guidance and setup for ultra-fast cloud hosting (including SSL certificates, global CDN edge caching, and daily backups) or we can deploy your website directly onto your own existing hosting provider.',
  },
  {
    id: 'faq-4',
    question: 'Can you connect my domain?',
    answer:
      'Yes, 100%! Whether your domain is registered on GoDaddy, Namecheap, Hostinger, Google Domains, or anywhere else, our technical team will configure DNS records, verify ownership, and make your site live seamlessly.',
  },
  {
    id: 'faq-5',
    question: 'Do you build e-commerce websites?',
    answer:
      'Yes! We build complete e-commerce stores equipped with product catalogs, category filtering, cart systems, Stripe / PayPal / Apple Pay payment gateways, order notifications, and customer management.',
  },
  {
    id: 'faq-6',
    question: 'Can I request changes?',
    answer:
      'Yes, every package includes revision rounds. We provide a private staging link before launch so you can review every page, click every button, test forms, and request any modifications until you are completely satisfied.',
  },
  {
    id: 'faq-7',
    question: 'Do you provide maintenance?',
    answer:
      'Yes! We offer ongoing technical maintenance plans covering security patches, speed optimization, content revisions, regular cloud backups, and on-demand tech support via WhatsApp and email.',
  },
  {
    id: 'faq-8',
    question: 'Can I see my website before launch?',
    answer:
      'Always! You will receive a private, interactive staging link to review and test-drive your website on both mobile and desktop before we hook up your official domain and push it live.',
  },
];
