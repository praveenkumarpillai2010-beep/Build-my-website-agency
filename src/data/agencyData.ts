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
 * Real Websites Catalog (Managed dynamically via the Admin Dashboard)
 */
export const TEMPLATES: Template[] = [];

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
/**
 * Portfolio Projects (Real projects added via Admin Dashboard)
 */
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [];

/**
 * Real client testimonials (Only real testimonials added via Admin Dashboard)
 */
export const TESTIMONIALS: Testimonial[] = [];


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
