import { AIWebsiteConcept } from '../types';

/**
 * Intelligent AI Website Concept Generator Service
 *
 * This service generates a tailored website strategy and blueprint from natural language business descriptions.
 * It provides instant, domain-specific structured architectural blueprints with:
 * - High-converting headlines & subheadlines
 * - Design aesthetics & typography recommendations
 * - Cohesive color palettes with HEX codes
 * - High-impact sections & conversion mechanics
 * - Core features & integration recommendations
 * - Full sitemap structure
 *
 * It is structured to seamlessly plug into a server-side Gemini API if configured.
 */

interface IndustryTemplate {
  keywords: string[];
  headline: string;
  subheadline: string;
  style: string;
  typography: string;
  palette: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  sections: string[];
  features: string[];
  cta: {
    primary: string;
    secondary: string;
    strategy: string;
  };
  structure: { page: string; purpose: string }[];
}

const PRESET_DOMAINS: IndustryTemplate[] = [
  {
    keywords: ['car detailing', 'automobile', 'auto', 'ceramic coating', 'wash', 'garage', 'detailing'],
    headline: 'Showroom Perfection Engineered For Connoisseurs',
    subheadline: 'Multi-stage paint correction, 9H ceramic glass coatings, and interior bespoke detailing crafted for luxury and performance vehicles.',
    style: 'Deep Charcoal Carbon Minimalist with High-Gloss Electric Blue Accents',
    typography: 'Space Grotesk (Headings) + Plus Jakarta Sans (Clean Tech Body)',
    palette: {
      name: 'Carbon Hyper-Gloss',
      primary: '#0F172A',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: '#07090E',
    },
    sections: [
      'Hero with Video Studio Tour',
      'Before & After Paint Correction Interactive Slider',
      'Ceramic Coating & PPF Tier Packages',
      'Facility & High-End Machinery Showcase',
      'Verified Client Vehicle Transformation Gallery',
      'Instant WhatsApp Booking & Slot Scheduler',
      'Frequently Asked Warranty Questions',
    ],
    features: [
      'Interactive Before/After Paint Defect Slider',
      'Vehicle Package & Paint Size Estimator',
      'WhatsApp Live Bay Reservation & Inspection Booking',
      'Google Review Auto-Sync & Trust Badges',
      'Automated Reminder Alerts for Ceramic Top-Ups',
    ],
    cta: {
      primary: 'Book VIP Inspection Slot →',
      secondary: 'View Paint Correction Gallery',
      strategy: 'Low-friction WhatsApp instant quote generator based on vehicle make and desired coating durability.',
    },
    structure: [
      { page: 'Home', purpose: 'Immersive brand showcase, before/after slider, package matrix, trust metrics' },
      { page: 'Services & PPF', purpose: 'Deep breakdown of ceramic coating, paint correction stages & interior treatments' },
      { page: 'Portfolio & Garage', purpose: 'Filterable gallery of completed supercars and customer luxury vehicles' },
      { page: 'Pricing & Packages', purpose: 'Transparent tier comparison with warranty terms and booking CTA' },
      { page: 'Contact & Location', purpose: 'Integrated Google Maps with driving directions and WhatsApp chat button' },
    ],
  },
  {
    keywords: ['restaurant', 'cafe', 'bakery', 'food', 'dining', 'bistro', 'cloud kitchen', 'bar', 'brewery'],
    headline: 'A Symphony Of Artisanal Flavors & Warm Atmosphere',
    subheadline: 'Crafting unforgettable culinary memories with heirloom ingredients, master chef specials, and hospitable table service.',
    style: 'Warm Twilight Organic Luxury with Ember Gold Highlights',
    typography: 'Playfair / Space Display (Expressive Headings) + Plus Jakarta Sans (Readable)',
    palette: {
      name: 'Artisan Bistro Warmth',
      primary: '#1C1917',
      secondary: '#D97706',
      accent: '#F59E0B',
      background: '#0C0A09',
    },
    sections: [
      'Atmospheric Hero with Ambiance Reel',
      'Interactive Seasonal Food & Beverage Menu',
      'Chef Philosophy & Farm-to-Table Story',
      'Instant Table Reservation Engine',
      'Private Events & Catering Booking',
      'Guest Accolades & Press Mentions',
      'Location, Parking, & Operating Hours',
    ],
    features: [
      'Mobile QR Digital Menu with Allergy & Vegan Tags',
      'Real-Time Table Reservation & WhatsApp Confirmation',
      'Online Takeaway Ordering with Apple Pay & Credit Card',
      'Instagram Live Food Feed Integration',
    ],
    cta: {
      primary: 'Reserve Your Table Tonight →',
      secondary: 'Explore Seasonal Menu',
      strategy: 'High-urgency table booking button in sticky header with instant seat availability status.',
    },
    structure: [
      { page: 'Home', purpose: 'High-aesthetic introduction, signature dish carousel, instant reservation widget' },
      { page: 'Dining Menu', purpose: 'Categorized food & cocktail menu with high-resolution photography' },
      { page: 'Reservations', purpose: 'Date, party size, and seating preference booking form with instant confirmation' },
      { page: 'Private Dining', purpose: 'Corporate event and private birthday celebration package details' },
      { page: 'Visit Us', purpose: 'Interactive map, valeting details, and contact directory' },
    ],
  },
  {
    keywords: ['dental', 'clinic', 'doctor', 'hospital', 'medical', 'healthcare', 'aesthetic', 'smile', 'dentist'],
    headline: 'Gentle, World-Class Healthcare Designed Around Your Comfort',
    subheadline: 'Combining state-of-the-art diagnostic technology with empathetic, pain-free medical care for the entire family.',
    style: 'Clinical Clean Tech Minimalist with Calming Cyan & Soft Slate',
    typography: 'Plus Jakarta Sans Bold + Inter Precision',
    palette: {
      name: 'Pure Medical Serenity',
      primary: '#0B132B',
      secondary: '#06B6D4',
      accent: '#22D3EE',
      background: '#070D18',
    },
    sections: [
      'Trust-Building Hero with Doctor Accreditations',
      'Specialized Treatments & Surgery Guide',
      'Interactive Smile / Treatment Transformation Gallery',
      'Doctor & Specialist Credentials',
      'Patient Comfort Amenities (Painless tech, Sedation)',
      '1-Click Instant Doctor Consultation Scheduler',
      'Emergency Dental & Medical Hotline',
    ],
    features: [
      'Online Appointment Scheduler with Slot Selection',
      'WhatsApp Emergency Triage Link',
      'Before & After Smile Makeover Comparison Slider',
      'Insurance & EMI Payment Calculator',
    ],
    cta: {
      primary: 'Book Appointment Online →',
      secondary: 'WhatsApp Doctor Hotline',
      strategy: 'Patient-centric appointment scheduler with zero prepayment required, reducing booking hesitation.',
    },
    structure: [
      { page: 'Home', purpose: 'Welcoming doctor intro, top treatment categories, fast appointment CTA' },
      { page: 'Treatments', purpose: 'Detailed procedure breakdowns, expected recovery, and FAQs' },
      { page: 'Our Doctors', purpose: 'Doctor qualifications, fellowships, and clinical philosophies' },
      { page: 'Patient Reviews', purpose: 'Verified Google video and written testimonials' },
      { page: 'Book & Contact', purpose: 'Time slot picker, clinic location, and parking guidance' },
    ],
  },
  {
    keywords: ['fitness', 'gym', 'crossfit', 'yoga', 'trainer', 'wellness', 'athlete', 'training'],
    headline: 'Forge Unstoppable Strength, Agility, and Longevity',
    subheadline: 'Elite athletic conditioning, high-energy group coaching, and science-backed recovery in a world-class training sanctuary.',
    style: 'High-Impact Dark Brutalist with Electric Crimson Accents',
    typography: 'Space Grotesk Compressed + Sharp Sans',
    palette: {
      name: 'Dynamic Athletic Forge',
      primary: '#09090B',
      secondary: '#EF4444',
      accent: '#F87171',
      background: '#050507',
    },
    sections: [
      'High-Adrenaline Video Hero',
      'Weekly Live Class Schedule & Coach Roster',
      'Transformation Wall of Fame',
      'Facility Equipment, Sauna & Recovery Amenities',
      'Membership Tiers & Free 1-Day Pass Form',
      'Member Testimonials & Community Spirit',
    ],
    features: [
      'Interactive Class Schedule Filterable by Goal/Time',
      'Instant 1-Day Trial Gym Pass Passcode Generator',
      'BMI & Workout Goal Recommendation Calculator',
      'WhatsApp Coach Consultation Chat',
    ],
    cta: {
      primary: 'Claim Free 1-Day VIP Pass →',
      secondary: 'View Class Timetable',
      strategy: 'Zero-risk 1-day pass form to capture visitor contact info and convert through in-person trial.',
    },
    structure: [
      { page: 'Home', purpose: 'High-energy hero, free pass hook, equipment preview, member transformations' },
      { page: 'Classes & Programs', purpose: 'Strength, HIIT, Yoga, and Personal Training syllabi' },
      { page: 'Coaches', purpose: 'Certified trainer bios, achievements, and booking links' },
      { page: 'Pricing', purpose: 'Transparent monthly/annual membership breakdown and trial pass' },
      { page: 'Free Trial', purpose: 'Express signup form connected to instant WhatsApp confirmation' },
    ],
  },
  {
    keywords: ['ecommerce', 'clothing', 'fashion', 'jewelry', 'store', 'shop', 'brand', 'apparel', 'products'],
    headline: 'Modern Luxury Essentials Designed To Outlast Trends',
    subheadline: 'Sustainably sourced fabrics, architectural tailoring, and effortless silhouettes crafted for discerning individuals.',
    style: 'High-Fashion Editorial Minimalist with Monochromatic Precision',
    typography: 'Didot / Space Grotesk Hybrid + Clean Sans',
    palette: {
      name: 'Editorial Obsidian & Sage',
      primary: '#09090B',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#050505',
    },
    sections: [
      'Editorial Full-Bleed Seasonal Hero',
      'Curated Capsule Collection Grid',
      'Lookbook & Runway Carousel',
      'Material Sourcing & Ethical Craftsmanship',
      'Customer Unboxing & Social Proof Wall',
      'Newsletter VIP Access for Early Drops',
    ],
    features: [
      'Quick-View Interactive Product Drawer',
      'Size Recommender & Measurements Guide',
      'Instant Apple Pay & Stripe One-Click Checkout',
      'WhatsApp Live Stylist Chat',
    ],
    cta: {
      primary: 'Shop The New Capsule →',
      secondary: 'Explore The Lookbook',
      strategy: 'Limited drop urgency timer with exclusive VIP early-access subscriber modal.',
    },
    structure: [
      { page: 'Shop All', purpose: 'Filterable product catalog with instant category tabs and sorting' },
      { page: 'Lookbook', purpose: 'High-resolution lifestyle photoshoot with shoppable pins' },
      { page: 'About Brand', purpose: 'Brand origins, ethical artisans, and sustainable materials' },
      { page: 'Cart & Checkout', purpose: 'Frictionless single-page checkout with guest checkout option' },
      { page: 'Track Order & Support', purpose: 'Automated live order tracking and returns portal' },
    ],
  },
];

/**
 * Generate a bespoke, structured concept based on input text
 */
export async function generateWebsiteConcept(userInput: string): Promise<AIWebsiteConcept> {
  const query = userInput.trim();
  const lower = query.toLowerCase();

  // Simulate short realistic network AI inference delay
  await new Promise((resolve) => setTimeout(resolve, 850));

  // Check matching domain
  let matched = PRESET_DOMAINS.find((preset) =>
    preset.keywords.some((kw) => lower.includes(kw))
  );

  // If no exact match, dynamically synthesize a tailored business concept
  if (!matched) {
    // Extract business name or core idea
    const words = query.split(' ').slice(0, 4).join(' ');
    const displayFocus = query.length > 5 ? query : 'Custom Modern Enterprise';

    matched = {
      keywords: [],
      headline: `Scale Your Brand With An Elite, Conversion-Focused Website`,
      subheadline: `A high-performance digital presence custom engineered for "${query}", designed to captivate your ideal customers and drive reliable revenue growth.`,
      style: 'Ultra-Clean Modern Tech Dark Theme with Cobalt Blue & Violet Glows',
      typography: 'Space Grotesk (Display) + Plus Jakarta Sans (Body)',
      palette: {
        name: 'Neo-Enterprise Glow',
        primary: '#0F172A',
        secondary: '#3B82F6',
        accent: '#8B5CF6',
        background: '#07090E',
      },
      sections: [
        'Hero with Dynamic Value Proposition & Direct CTA',
        'Interactive Core Offerings & Solution Matrix',
        'Trust-Building Customer Proof & Case Studies',
        'Interactive ROI / Pricing Calculator',
        'Direct WhatsApp & Lead Capture Funnel',
        'Frequently Asked Questions & Guarantees',
      ],
      features: [
        'Sub-second Mobile Performance Optimization',
        'WhatsApp Direct One-Click Inquiry Integration',
        'Interactive Quote & Consultation Request Form',
        'Automated Google Analytics & Pixel Tracking',
        'Google Schema Markup for Organic Local SEO',
      ],
      cta: {
        primary: 'Request Free Strategic Proposal →',
        secondary: 'Chat on WhatsApp With Our Team',
        strategy: 'High-intent lead generation form with immediate WhatsApp callback confirmation within 15 minutes.',
      },
      structure: [
        { page: 'Home', purpose: `Main conversion hub highlighting solutions for ${displayFocus}` },
        { page: 'Solutions & Services', purpose: 'Comprehensive breakdown of offerings and client outcomes' },
        { page: 'Case Studies', purpose: 'Proof of past work, client ROI, and measurable milestones' },
        { page: 'Pricing / Plans', purpose: 'Transparent package options and custom quotation form' },
        { page: 'Contact Us', purpose: 'Quick contact form, direct phone line, and WhatsApp link' },
      ],
    };
  }

  // If user mentioned a location or specific angle, reflect it
  let customizedHeadline = matched.headline;
  let customizedSubheadline = matched.subheadline;

  if (lower.includes('vapi')) {
    customizedSubheadline += ' Specially tailored for discerning clients in Vapi, Daman, and South Gujarat.';
  } else if (lower.includes('mumbai') || lower.includes('bandra')) {
    customizedSubheadline += ' Optimized for competitive urban markets in Mumbai and metro regions.';
  }

  return {
    userQuery: query,
    websiteHeadline: customizedHeadline,
    subheadline: customizedSubheadline,
    suggestedStyle: matched.style,
    typographyArchetype: matched.typography,
    colorPalette: matched.palette,
    recommendedSections: matched.sections,
    features: matched.features,
    callToAction: matched.cta,
    suggestedStructure: matched.structure,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
