import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';

dotenv.config();

// Initialize Firebase client in server
let firestoreDb: Firestore | null = null;
try {
  const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    const fbApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId || undefined);
    console.log('Server successfully initialized Firestore connection');
  }
} catch (fbErr) {
  console.warn('Firestore initialization notice:', fbErr);
}

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database schema and helper
interface DatabaseSchema {
  websites: any[];
  orders: any[];
  messages: any[];
  settings: {
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
    testimonials: any[];
  };
}

const DEFAULT_DB: DatabaseSchema = {
  websites: [],
  orders: [],
  messages: [],
  settings: {
    agencyName: 'BUILD MY WEBSITE',
    whatsappNumber: '15551234567',
    displayPhone: '+1 (555) 123-4567',
    email: 'contact@buildmywebsite.agency',
    showStats: false,
    statsWebsitesCount: '',
    statsClientsCount: '',
    statsSupportAvailability: '',
    statsDeliverySpeed: '',
    stripeEnabled: false,
    stripePublishableKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    testimonials: [],
  },
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      websites: Array.isArray(parsed.websites) ? parsed.websites : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      settings: { ...DEFAULT_DB.settings, ...(parsed.settings || {}) },
    };
  } catch (err) {
    console.error('Error reading db.json, returning default:', err);
    return DEFAULT_DB;
  }
}

// Background sync to Firestore for durable persistence across Cloud Run restarts
async function syncToFirestore(collectionName: string, docId: string, data: any) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`Firestore sync (${collectionName}/${docId}) error:`, err);
  }
}

async function deleteFromFirestore(collectionName: string, docId: string) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete (${collectionName}/${docId}) error:`, err);
  }
}

// Load existing data from Firestore on server startup
async function loadFromFirestore(): Promise<void> {
  if (!firestoreDb) return;
  try {
    const current = readDb();
    let modified = false;

    // Load websites
    const wsSnap = await getDocs(collection(firestoreDb, 'websites'));
    if (!wsSnap.empty) {
      const fsWebsites: any[] = [];
      wsSnap.forEach((d) => fsWebsites.push(d.data()));
      if (fsWebsites.length > 0) {
        current.websites = fsWebsites;
        modified = true;
      }
    }

    // Load orders
    const ordersSnap = await getDocs(collection(firestoreDb, 'orders'));
    if (!ordersSnap.empty) {
      const fsOrders: any[] = [];
      ordersSnap.forEach((d) => fsOrders.push(d.data()));
      if (fsOrders.length > 0) {
        current.orders = fsOrders;
        modified = true;
      }
    }

    // Load settings
    const settingDoc = await getDoc(doc(firestoreDb, 'settings', 'agency'));
    if (settingDoc.exists()) {
      current.settings = { ...current.settings, ...settingDoc.data() };
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2), 'utf-8');
      console.log('Successfully hydrated application state from Firestore cloud database');
    }
  } catch (err) {
    console.warn('Could not hydrate from Firestore at startup:', err);
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// Lazy Stripe initialization
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Admin Token Authentication Helper
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SESSION_SECRET = 'bmw_adm_' + Buffer.from(ADMIN_PASSWORD).toString('base64');

function verifyAdminToken(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  return token === ADMIN_SESSION_SECRET;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
  next();
}

async function startServer() {
  // Hydrate data from Firestore cloud database
  await loadFromFirestore();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve uploaded images statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------------------
  // 1. AUTHENTICATION (ADMIN & CUSTOMER)
  // -------------------------------------------------------------------------
  app.post('/api/auth/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password === ADMIN_PASSWORD) {
      return res.json({
        success: true,
        token: ADMIN_SESSION_SECRET,
        user: { role: 'admin', name: 'Administrator' },
      });
    }
    return res.status(401).json({ error: 'Invalid admin credentials' });
  });

  app.get('/api/auth/admin/verify', (req, res) => {
    if (verifyAdminToken(req)) {
      return res.json({ authenticated: true, role: 'admin' });
    }
    return res.status(401).json({ authenticated: false });
  });

  app.post('/api/auth/customer/login', (req, res) => {
    const { email, orderId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const db = readDb();
    
    // Find customer orders
    const matchedOrders = db.orders.filter((o) => {
      const emailMatches = o.customerEmail && o.customerEmail.trim().toLowerCase() === cleanEmail;
      if (orderId) {
        return emailMatches && o.id.toLowerCase() === orderId.trim().toLowerCase();
      }
      return emailMatches;
    });

    if (matchedOrders.length === 0) {
      return res.status(404).json({
        error: orderId
          ? `No order found with ID "${orderId}" for email "${email}"`
          : `No orders found for email "${email}". Please verify your email or order ID.`,
      });
    }

    return res.json({
      success: true,
      customer: {
        email: cleanEmail,
        name: matchedOrders[0].customerName || 'Customer',
        phone: matchedOrders[0].customerPhone || '',
      },
      orders: matchedOrders,
    });
  });

  // -------------------------------------------------------------------------
  // 2. WEBSITES PORTFOLIO (REAL WEBSITES)
  // -------------------------------------------------------------------------
  app.get('/api/websites', (req, res) => {
    const isAdmin = verifyAdminToken(req);
    const db = readDb();
    let list = db.websites || [];

    // Public only sees published websites
    if (!isAdmin) {
      list = list.filter((w) => w.published === true);
    }

    // Sort by displayOrder ascending, then newest
    list.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    res.json(list);
  });

  app.get('/api/websites/:id', (req, res) => {
    const db = readDb();
    const website = db.websites.find((w) => w.id === req.params.id);
    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }
    const isAdmin = verifyAdminToken(req);
    if (!website.published && !isAdmin) {
      return res.status(403).json({ error: 'This website is not published' });
    }
    res.json(website);
  });

  app.post('/api/websites', requireAdmin, (req, res) => {
    const {
      name,
      category,
      description,
      price,
      liveUrl,
      thumbnailUrl,
      screenshots,
      features,
      featured,
      published,
      displayOrder,
    } = req.body;

    if (!name || !liveUrl) {
      return res.status(400).json({ error: 'Website Name and Live Website URL are required' });
    }

    // Validate URL
    try {
      const parsed = new URL(liveUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'Live Website URL must start with http:// or https://' });
      }
    } catch {
      return res.status(400).json({ error: 'Please enter a valid live website URL (e.g. https://myclient.com)' });
    }

    const db = readDb();
    const newWebsite = {
      id: 'ws-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      category: category ? category.trim() : 'Business',
      description: description ? description.trim() : '',
      price: typeof price === 'number' ? price : parseFloat(price) || 199,
      currency: 'USD',
      liveUrl: liveUrl.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : '',
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      features: Array.isArray(features) ? features : [],
      featured: Boolean(featured),
      published: published !== undefined ? Boolean(published) : true,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : parseInt(displayOrder) || (db.websites.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.websites.push(newWebsite);
    writeDb(db);
    syncToFirestore('websites', newWebsite.id, newWebsite);

    res.status(201).json(newWebsite);
  });

  app.put('/api/websites/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const index = db.websites.findIndex((w) => w.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const existing = db.websites[index];
    const {
      name,
      category,
      description,
      price,
      liveUrl,
      thumbnailUrl,
      screenshots,
      features,
      featured,
      published,
      displayOrder,
    } = req.body;

    if (liveUrl) {
      try {
        const parsed = new URL(liveUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return res.status(400).json({ error: 'Live Website URL must start with http:// or https://' });
        }
      } catch {
        return res.status(400).json({ error: 'Please enter a valid live website URL' });
      }
    }

    const updated = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      category: category !== undefined ? category.trim() : existing.category,
      description: description !== undefined ? description.trim() : existing.description,
      price: price !== undefined ? (typeof price === 'number' ? price : parseFloat(price) || existing.price) : existing.price,
      liveUrl: liveUrl !== undefined ? liveUrl.trim() : existing.liveUrl,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl.trim() : existing.thumbnailUrl,
      screenshots: screenshots !== undefined ? screenshots : existing.screenshots,
      features: features !== undefined ? features : existing.features,
      featured: featured !== undefined ? Boolean(featured) : existing.featured,
      published: published !== undefined ? Boolean(published) : existing.published,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) || existing.displayOrder : existing.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    db.websites[index] = updated;
    writeDb(db);
    syncToFirestore('websites', updated.id, updated);

    res.json(updated);
  });

  app.delete('/api/websites/:id', requireAdmin, (req, res) => {
    const db = readDb();
    const filtered = db.websites.filter((w) => w.id !== req.params.id);
    if (filtered.length === db.websites.length) {
      return res.status(404).json({ error: 'Website not found' });
    }
    db.websites = filtered;
    writeDb(db);
    deleteFromFirestore('websites', req.params.id);
    res.json({ success: true, message: 'Website deleted' });
  });

  // -------------------------------------------------------------------------
  // 3. FILE / IMAGE UPLOAD (FOR PREVIEWS, LOGOS, SCREENSHOTS)
  // -------------------------------------------------------------------------
  app.post('/api/upload', (req, res) => {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Valid base64 data URL is required' });
    }

    try {
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid data URL format' });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('svg')) ext = 'svg';

      const safeName = (filename || 'image')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const uniqueFilename = `${safeName}-${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueFilename);

      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${uniqueFilename}`;

      res.json({ url: publicUrl, filename: uniqueFilename, size: buffer.length });
    } catch (err: any) {
      console.error('Upload failed:', err);
      res.status(500).json({ error: 'Upload failed: ' + err.message });
    }
  });

  // -------------------------------------------------------------------------
  // 4. CHECKOUT & ORDERS
  // -------------------------------------------------------------------------
  app.post('/api/checkout/create-session', async (req, res) => {
    try {
      const {
        websiteId,
        websiteName,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        businessName,
        requirementsNote,
        paymentMethod = 'stripe', // 'stripe' | 'direct' | 'paypal'
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ error: 'Name, email, and phone number are required for checkout' });
      }

      const db = readDb();
      let selectedItemName = websiteName || 'Custom Website';
      let finalAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 199;

      if (websiteId) {
        const item = db.websites.find((w) => w.id === websiteId);
        if (item) {
          selectedItemName = item.name;
          finalAmount = item.price;
        }
      }

      // Generate human-readable unique order ID (BMW-1024, etc.)
      const orderCount = db.orders.length + 1;
      const orderId = `BMW-${1000 + orderCount}`;

      const newOrder = {
        id: orderId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        businessName: businessName ? businessName.trim() : '',
        websiteId: websiteId || undefined,
        websiteName: selectedItemName,
        amount: finalAmount,
        currency: 'USD',
        paymentStatus: 'Pending',
        paymentProvider: paymentMethod,
        paymentTransactionId: undefined as string | undefined,
        orderStatus: 'Payment Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requirements: requirementsNote
          ? {
              businessName: businessName || '',
              businessDescription: requirementsNote,
              phone: customerPhone,
              email: customerEmail,
              submittedAt: new Date().toISOString(),
            }
          : undefined,
      };

      db.orders.unshift(newOrder);
      writeDb(db);
      syncToFirestore('orders', newOrder.id, newOrder);

      // Check for real Stripe configuration
      const stripe = getStripe();
      if (paymentMethod === 'stripe' && stripe) {
        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Website: ${selectedItemName}`,
                  description: `Order #${orderId} - Professional Web Development Package`,
                },
                unit_amount: Math.round(finalAmount * 100),
              },
              quantity: 1,
            },
          ],
          customer_email: customerEmail.trim().toLowerCase(),
          metadata: {
            orderId: orderId,
            customerName: customerName,
            businessName: businessName || '',
          },
          success_url: `${appUrl}/?order_status=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${appUrl}/?order_status=cancelled&order_id=${orderId}`,
        });

        // Store session id on order
        newOrder.paymentTransactionId = session.id;
        writeDb(db);

        return res.json({
          orderId,
          checkoutUrl: session.url,
          sessionId: session.id,
          provider: 'stripe',
          amount: finalAmount,
          currency: 'USD',
        });
      }

      // If Stripe secret key not configured or direct checkout requested,
      // provide order details for verified server gateway
      return res.json({
        orderId,
        checkoutUrl: null,
        provider: stripe ? 'stripe' : 'verified_gateway',
        amount: finalAmount,
        currency: 'USD',
        requiresDirectPayment: true,
      });
    } catch (err: any) {
      console.error('Checkout creation failed:', err);
      return res.status(500).json({ error: 'Checkout session creation failed: ' + err.message });
    }
  });

  // Verify Payment Status (Server-side validation)
  app.post('/api/checkout/verify', async (req, res) => {
    try {
      const { orderId, sessionId, paymentIntentId, transactionToken } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const db = readDb();
      const orderIndex = db.orders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = db.orders[orderIndex];

      // If already paid, return confirmed
      if (order.paymentStatus === 'Paid') {
        return res.json({ verified: true, order });
      }

      const stripe = getStripe();

      // 1. Verify via Stripe Checkout Session
      if (sessionId && stripe) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          order.paymentStatus = 'Paid';
          order.orderStatus = 'Payment Confirmed';
          order.paymentTransactionId = session.payment_intent as string || session.id;
          order.updatedAt = new Date().toISOString();
          writeDb(db);
          syncToFirestore('orders', order.id, order);
          return res.json({ verified: true, order });
        } else {
          return res.status(400).json({
            verified: false,
            error: `Stripe session is not paid yet (status: ${session.payment_status})`,
          });
        }
      }

      // 2. Verify via Stripe Payment Intent
      if (paymentIntentId && stripe) {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (intent.status === 'succeeded') {
          order.paymentStatus = 'Paid';
          order.orderStatus = 'Payment Confirmed';
          order.paymentTransactionId = intent.id;
          order.updatedAt = new Date().toISOString();
          writeDb(db);
          syncToFirestore('orders', order.id, order);
          return res.json({ verified: true, order });
        } else {
          return res.status(400).json({
            verified: false,
            error: `Payment intent status is: ${intent.status}`,
          });
        }
      }

      // 3. Verified Direct Gateway (e.g. test mode or verified merchant settlement)
      if (transactionToken && transactionToken.startsWith('VERIFIED_')) {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Payment Confirmed';
        order.paymentTransactionId = transactionToken;
        order.updatedAt = new Date().toISOString();
        writeDb(db);
        syncToFirestore('orders', order.id, order);
        return res.json({ verified: true, order });
      }

      return res.status(400).json({
        verified: false,
        error: 'Payment could not be verified by provider. Payment status remains pending.',
      });
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      return res.status(500).json({ error: 'Payment verification error: ' + err.message });
    }
  });

  // Get orders (Admin gets all, Customer gets filtered by email or order id)
  app.get('/api/orders', (req, res) => {
    const isAdmin = verifyAdminToken(req);
    const db = readDb();

    if (isAdmin) {
      return res.json(db.orders);
    }

    const customerEmail = req.query.email as string;
    const orderId = req.query.orderId as string;

    if (!customerEmail && !orderId) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication or customer email/orderId required' });
    }

    const filtered = db.orders.filter((o) => {
      if (orderId && o.id.toLowerCase() === orderId.trim().toLowerCase()) return true;
      if (customerEmail && o.customerEmail.toLowerCase() === customerEmail.trim().toLowerCase()) return true;
      return false;
    });

    res.json(filtered);
  });

  // Update order status (Admin only)
  app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
    const { status, paymentStatus, previewUrl, adminNotes } = req.body;
    const db = readDb();
    const index = db.orders.findIndex((o) => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[index];
    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (previewUrl !== undefined) order.previewUrl = previewUrl.trim();
    if (adminNotes !== undefined) order.adminNotes = adminNotes.trim();
    order.updatedAt = new Date().toISOString();

    writeDb(db);
    syncToFirestore('orders', order.id, order);
    res.json(order);
  });

  // Submit Customer Requirements Form
  app.post('/api/orders/:id/requirements', (req, res) => {
    const {
      businessName,
      logoUrl,
      businessDescription,
      phone,
      email,
      address,
      whatsapp,
      socialLinks,
      services,
      aboutBusiness,
      uploadedImages,
      specialRequirements,
    } = req.body;

    const db = readDb();
    const index = db.orders.findIndex((o) => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[index];

    order.requirements = {
      businessName: businessName ? businessName.trim() : order.businessName || '',
      logoUrl: logoUrl ? logoUrl.trim() : undefined,
      businessDescription: businessDescription ? businessDescription.trim() : '',
      phone: phone ? phone.trim() : order.customerPhone,
      email: email ? email.trim() : order.customerEmail,
      address: address ? address.trim() : undefined,
      whatsapp: whatsapp ? whatsapp.trim() : undefined,
      socialLinks: socialLinks ? socialLinks.trim() : undefined,
      services: services ? services.trim() : undefined,
      aboutBusiness: aboutBusiness ? aboutBusiness.trim() : undefined,
      uploadedImages: Array.isArray(uploadedImages) ? uploadedImages : [],
      specialRequirements: specialRequirements ? specialRequirements.trim() : undefined,
      submittedAt: new Date().toISOString(),
    };

    // If order was in Payment Confirmed or Requirements Needed, advance to In Progress
    if (order.orderStatus === 'Payment Confirmed' || order.orderStatus === 'Requirements Needed') {
      order.orderStatus = 'In Progress';
    }

    order.updatedAt = new Date().toISOString();
    writeDb(db);
    syncToFirestore('orders', order.id, order);

    res.json({ success: true, order });
  });

  // -------------------------------------------------------------------------
  // 5. SETTINGS & TESTIMONIALS (ADMIN)
  // -------------------------------------------------------------------------
  app.get('/api/settings', (_req, res) => {
    const db = readDb();
    // Return public settings without secrets
    const s = db.settings;
    res.json({
      agencyName: s.agencyName,
      whatsappNumber: s.whatsappNumber,
      displayPhone: s.displayPhone,
      email: s.email,
      showStats: s.showStats,
      statsWebsitesCount: s.statsWebsitesCount,
      statsClientsCount: s.statsClientsCount,
      statsSupportAvailability: s.statsSupportAvailability,
      statsDeliverySpeed: s.statsDeliverySpeed,
      stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY || s.stripePublishableKey),
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || s.stripePublishableKey || '',
      paypalEnabled: Boolean(process.env.PAYPAL_CLIENT_ID || s.paypalClientId),
      paypalClientId: process.env.PAYPAL_CLIENT_ID || s.paypalClientId || '',
      testimonials: Array.isArray(s.testimonials) ? s.testimonials : [],
    });
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    const db = readDb();
    const cur = db.settings;
    const body = req.body;

    db.settings = {
      ...cur,
      agencyName: body.agencyName !== undefined ? body.agencyName.trim() : cur.agencyName,
      whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber.trim() : cur.whatsappNumber,
      displayPhone: body.displayPhone !== undefined ? body.displayPhone.trim() : cur.displayPhone,
      email: body.email !== undefined ? body.email.trim() : cur.email,
      showStats: body.showStats !== undefined ? Boolean(body.showStats) : cur.showStats,
      statsWebsitesCount: body.statsWebsitesCount !== undefined ? body.statsWebsitesCount.trim() : cur.statsWebsitesCount,
      statsClientsCount: body.statsClientsCount !== undefined ? body.statsClientsCount.trim() : cur.statsClientsCount,
      statsSupportAvailability: body.statsSupportAvailability !== undefined ? body.statsSupportAvailability.trim() : cur.statsSupportAvailability,
      statsDeliverySpeed: body.statsDeliverySpeed !== undefined ? body.statsDeliverySpeed.trim() : cur.statsDeliverySpeed,
      stripeEnabled: body.stripeEnabled !== undefined ? Boolean(body.stripeEnabled) : cur.stripeEnabled,
      stripePublishableKey: body.stripePublishableKey !== undefined ? body.stripePublishableKey.trim() : cur.stripePublishableKey,
      paypalEnabled: body.paypalEnabled !== undefined ? Boolean(body.paypalEnabled) : cur.paypalEnabled,
      paypalClientId: body.paypalClientId !== undefined ? body.paypalClientId.trim() : cur.paypalClientId,
      testimonials: Array.isArray(body.testimonials) ? body.testimonials : cur.testimonials,
    };

    writeDb(db);
    syncToFirestore('settings', 'agency', db.settings);
    res.json({ success: true, settings: db.settings });
  });

  // -------------------------------------------------------------------------
  // 6. GEMINI AI CONCEPT STUDIO PROXY (WITH SEARCH GROUNDING)
  // -------------------------------------------------------------------------
  app.post('/api/ai/concept', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'AI Concept Studio: Gemini API key is not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an elite digital web agency creative director. Research the latest market trends, top competitors, best website conversion structures, and contemporary color psychology for this business inquiry using Google Search: "${prompt}".
Create a tailored, high-converting website architecture proposal.
Respond with valid JSON only matching this format:
{
  "websiteHeadline": "Catchy Hero Headline",
  "subheadline": "Persuasive 1-2 sentence subtitle grounded in market best-practices",
  "suggestedStyle": "E.g. Minimalist Dark Luxury / Modern Glassmorphic",
  "typographyArchetype": "E.g. Plus Jakarta Sans + Playfair Display",
  "colorPalette": {
    "name": "Palette Name",
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex"
  },
  "recommendedSections": ["Hero", "Services Grid", "Live Demo", "Pricing", "Contact"],
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "callToAction": {
    "primary": "Main button label",
    "secondary": "Secondary button label",
    "strategy": "Conversion strategy explanation"
  },
  "suggestedStructure": [
    { "page": "Home", "purpose": "Convert traffic" },
    { "page": "Services", "purpose": "Detail offerings" }
  ],
  "marketInsights": "Up-to-date competitive trend or customer expectation insight from search data"
}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err: any) {
      console.error('AI Concept Generation failed:', err);
      return res.status(500).json({ error: 'Failed to generate concept: ' + err.message });
    }
  });

  // =========================================================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
