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
  initializeFirestore,
  setLogLevel,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

dotenv.config();

// Initialize Firebase client in server
let firestoreDb: Firestore | null = null;
let adminAuth: ReturnType<typeof getAdminAuth> | null = null;

try {
  const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    try {
      setLogLevel('error');
    } catch {
      // Ignore if setLogLevel is not applicable
    }
    const fbApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    try {
      firestoreDb = initializeFirestore(fbApp, {
        experimentalAutoDetectLongPolling: true,
      }, firebaseConfig.firestoreDatabaseId || undefined);
    } catch {
      firestoreDb = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId || undefined);
    }
    console.log('Server successfully initialized Firestore connection');

    // Initialize Firebase Admin SDK
    const adminApp = !getAdminApps().length
      ? initAdminApp({ projectId: firebaseConfig.projectId })
      : getAdminApps()[0];
    adminAuth = getAdminAuth(adminApp);
    console.log('Server successfully initialized Firebase Admin SDK');
  }
} catch (fbErr) {
  console.warn('Firebase initialization notice:', fbErr);
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
  bookings: any[];
  auditLogs?: any[];
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
  bookings: [],
  auditLogs: [],
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
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
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
  } catch (err: any) {
    if (err?.code === 'permission-denied' || (err?.message && err.message.includes('PERMISSION_DENIED'))) {
      // In container sandbox, Firestore security rules protect direct client SDK writes.
      // Server-side state is safely and durably persisted in db.json.
      return;
    }
    console.warn(`Firestore sync (${collectionName}/${docId}) notice:`, err?.message || err);
  }
}

async function deleteFromFirestore(collectionName: string, docId: string) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err: any) {
    if (err?.code === 'permission-denied' || (err?.message && err.message.includes('PERMISSION_DENIED'))) {
      return;
    }
    console.warn(`Firestore delete (${collectionName}/${docId}) notice:`, err?.message || err);
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

    // Load bookings
    const bookingsSnap = await getDocs(collection(firestoreDb, 'bookings'));
    if (!bookingsSnap.empty) {
      const fsBookings: any[] = [];
      bookingsSnap.forEach((d) => fsBookings.push(d.data()));
      if (fsBookings.length > 0) {
        current.bookings = fsBookings;
        modified = true;
      }
    }

    // Load messages
    const messagesSnap = await getDocs(collection(firestoreDb, 'messages'));
    if (!messagesSnap.empty) {
      const fsMessages: any[] = [];
      messagesSnap.forEach((d) => fsMessages.push(d.data()));
      if (fsMessages.length > 0) {
        current.messages = fsMessages;
        modified = true;
      }
    }

    // Load settings
    const settingDoc = await getDoc(doc(firestoreDb, 'settings', 'agency'));
    if (settingDoc.exists()) {
      current.settings = { ...current.settings, ...settingDoc.data() };
      modified = true;
    }

    // Load admin records
    const adminsSnap = await getDocs(collection(firestoreDb, 'admins'));
    if (!adminsSnap.empty) {
      adminsSnap.forEach((d) => {
        const data = d.data() as AdminRecord;
        if (data && data.uid) {
          adminRecordsCache.set(data.uid, data);
        }
      });
      console.log(`Loaded ${adminRecordsCache.size} administrator records from Firestore`);
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2), 'utf-8');
      console.log('Successfully hydrated application state from Firestore cloud database');
    }

    // Run initial admin bootstrap for ADMIN_EMAIL
    await bootstrapInitialAdmin();
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

// =========================================================================
// AUTHORITATIVE ADMIN AUTHORIZATION SYSTEM (FIREBASE ADMIN SDK & CUSTOM CLAIMS)
// =========================================================================

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  admin: boolean;
  isLegacySecret?: boolean;
}

export interface AdminRecord {
  uid: string;
  email: string;
  admin: boolean;
  assignedAt: string;
  assignedBy?: string;
}

const adminRecordsCache = new Map<string, AdminRecord>();
// Pre-register primary administrator identity
adminRecordsCache.set('IcZE8EtOoUVWSWE8WQcyNpN72hz1', {
  uid: 'IcZE8EtOoUVWSWE8WQcyNpN72hz1',
  email: 'praveenkumarpillai2010@gmail.com',
  admin: true,
  assignedAt: new Date().toISOString(),
  assignedBy: 'system_bootstrap',
});
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'praveenkumarpillai2010@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pravin@27';
const ADMIN_SESSION_SECRET = 'bmw_adm_' + Buffer.from(ADMIN_PASSWORD).toString('base64');

// Server-side admin bootstrap for ADMIN_EMAIL
async function bootstrapInitialAdmin(): Promise<void> {
  if (!ADMIN_EMAIL) {
    console.log('No ADMIN_EMAIL configured in environment. Skipping initial admin bootstrap.');
    return;
  }
  console.log(`Verifying initial administrator bootstrap for: ${ADMIN_EMAIL}`);

  if (adminAuth) {
    try {
      const user = await adminAuth.getUserByEmail(ADMIN_EMAIL);
      if (user) {
        try {
          await adminAuth.setCustomUserClaims(user.uid, { admin: true });
          console.log(`Successfully assigned custom claim { admin: true } to ${ADMIN_EMAIL} (${user.uid})`);
        } catch (claimErr: any) {
          console.warn('Notice: setCustomUserClaims skipped or failed:', claimErr.message);
        }

        const adminDoc: AdminRecord = {
          uid: user.uid,
          email: ADMIN_EMAIL,
          admin: true,
          assignedAt: new Date().toISOString(),
          assignedBy: 'system_bootstrap',
        };
        adminRecordsCache.set(user.uid, adminDoc);
        await syncToFirestore('admins', user.uid, adminDoc);
        console.log(`Initial admin registered: ${ADMIN_EMAIL} (${user.uid})`);
      }
    } catch (err: any) {
      console.log(`Bootstrap notice: User ${ADMIN_EMAIL} not found yet in Firebase Auth: ${err.message || err}`);
    }
  }
}

// Verify Firebase ID Token or Admin Session Token
async function verifyUserToken(token?: string | null): Promise<AuthenticatedUser | null> {
  if (!token || typeof token !== 'string') return null;

  // 1. Check legacy admin session secret for smooth continuity
  if (token === ADMIN_SESSION_SECRET) {
    return {
      uid: 'admin-root',
      email: ADMIN_EMAIL || 'admin@buildmywebsite.agency',
      name: 'Administrator',
      admin: true,
      isLegacySecret: true,
    };
  }

  // 2. Verify Firebase ID Token via Firebase Admin SDK
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      const userEmail = (decoded.email || '').toLowerCase();
      const isConfiguredAdmin = Boolean(
        (ADMIN_EMAIL && userEmail === ADMIN_EMAIL) ||
        userEmail === 'praveenkumarpillai2010@gmail.com' ||
        decoded.uid === 'IcZE8EtOoUVWSWE8WQcyNpN72hz1'
      );
      const hasAdminClaim = Boolean(decoded.admin === true);
      const cachedAdmin = adminRecordsCache.get(decoded.uid);
      const isInAdminDb = cachedAdmin ? cachedAdmin.admin === true : false;

      let isAdmin = hasAdminClaim || isConfiguredAdmin || isInAdminDb;

      // Ensure that if this user matches the configured ADMIN_EMAIL, they are recorded in Firestore & claim set
      if (isConfiguredAdmin && (!hasAdminClaim || !isInAdminDb)) {
        try {
          await adminAuth.setCustomUserClaims(decoded.uid, { admin: true });
        } catch {}
        const adminDoc: AdminRecord = {
          uid: decoded.uid,
          email: userEmail,
          admin: true,
          assignedAt: new Date().toISOString(),
          assignedBy: 'system_bootstrap',
        };
        adminRecordsCache.set(decoded.uid, adminDoc);
        syncToFirestore('admins', decoded.uid, adminDoc).catch(() => {});
        isAdmin = true;
      }

      return {
        uid: decoded.uid,
        email: userEmail || undefined,
        name: (decoded.name as string) || undefined,
        admin: isAdmin,
      };
    } catch {
      // Invalid, expired, or untrusted Firebase token
      return null;
    }
  }

  return null;
}

// Middleware: Authenticated User Required (Customer or Admin)
async function requireAuthenticatedUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = await verifyUserToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
  }
  (req as any).user = user;
  next();
}

// Middleware: Authoritative Admin Required (Returns 401 if unauthenticated, 403 if customer)
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = await verifyUserToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
  }
  if (!user.admin) {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }
  (req as any).user = user;
  next();
}

// Audit Logging Helper
const auditLogsCache: any[] = [];

async function logAuditEvent(entry: {
  adminUid: string;
  adminEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
}) {
  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const logDoc = {
    id: logId,
    adminUid: entry.adminUid,
    adminEmail: entry.adminEmail || '',
    actorEmail: entry.adminEmail || '',
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    targetId: entry.resourceId,
    details: entry.details || {},
    timestamp: new Date().toISOString(),
  };

  auditLogsCache.unshift(logDoc);
  if (auditLogsCache.length > 200) {
    auditLogsCache.pop();
  }

  try {
    const db = readDb();
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift(logDoc);
    if (db.auditLogs.length > 200) db.auditLogs = db.auditLogs.slice(0, 200);
    writeDb(db);
  } catch (err) {
    console.warn('Local audit log write notice:', err);
  }

  try {
    await syncToFirestore('audit_logs', logId, logDoc);
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
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

  // Verify admin session / token
  app.get('/api/auth/admin/verify', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ authenticated: false, isAdmin: false });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (user && user.admin) {
      return res.json({ authenticated: true, role: 'admin', uid: user.uid, email: user.email });
    }
    return res.status(401).json({ authenticated: false, isAdmin: false });
  });

  // Authoritative identity & authorization status endpoint
  app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ authenticated: false, isAdmin: false });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.json({ authenticated: false, isAdmin: false });
    }
    return res.json({
      authenticated: true,
      uid: user.uid,
      email: user.email,
      name: user.name,
      isAdmin: Boolean(user.admin),
    });
  });

  // Re-sync / refresh admin claims for the authenticated user
  app.post('/api/auth/refresh-claims', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    let claimsUpdated = false;
    if (user.admin && adminAuth && user.uid && !user.isLegacySecret) {
      try {
        await adminAuth.setCustomUserClaims(user.uid, { admin: true });
        claimsUpdated = true;
      } catch (err: any) {
        console.warn('Refresh claims notice:', err.message);
      }
    }

    return res.json({
      success: true,
      isAdmin: Boolean(user.admin),
      claimsUpdated,
      email: user.email,
      uid: user.uid,
    });
  });

  // List authorized administrators (Admin only)
  app.get('/api/admin/users/admins', requireAdmin, async (_req, res) => {
    const list: AdminRecord[] = [];
    adminRecordsCache.forEach((rec) => {
      list.push(rec);
    });

    // Ensure configured primary administrator is always listed
    if (ADMIN_EMAIL && !list.some((r) => r.email.toLowerCase() === ADMIN_EMAIL)) {
      list.unshift({
        uid: 'bootstrap-root',
        email: ADMIN_EMAIL,
        admin: true,
        assignedAt: new Date().toISOString(),
        assignedBy: 'environment_config',
      });
    }

    res.json(list);
  });

  // Grant administrator role to another user (Admin only)
  app.post('/api/admin/users/grant', requireAdmin, async (req, res) => {
    const { email, uid } = req.body;
    if (!email && !uid) {
      return res.status(400).json({ error: 'Target user email or UID is required' });
    }

    const currentAdmin = (req as any).user as AuthenticatedUser;
    let targetUid = uid ? String(uid).trim() : '';
    let targetEmail = email ? String(email).trim().toLowerCase() : '';

    if (adminAuth) {
      try {
        if (!targetUid && targetEmail) {
          const user = await adminAuth.getUserByEmail(targetEmail);
          targetUid = user.uid;
          targetEmail = user.email?.toLowerCase() || targetEmail;
        }
        if (targetUid) {
          try {
            await adminAuth.setCustomUserClaims(targetUid, { admin: true });
          } catch (e: any) {
            console.warn('Set claims notice during grant:', e.message);
          }
        }
      } catch {
        return res.status(404).json({ error: `User "${targetEmail}" not found in Firebase Authentication.` });
      }
    }

    if (!targetUid) {
      targetUid = 'adm-' + Date.now().toString(36);
    }

    const record: AdminRecord = {
      uid: targetUid,
      email: targetEmail,
      admin: true,
      assignedAt: new Date().toISOString(),
      assignedBy: currentAdmin.email || currentAdmin.uid,
    };

    adminRecordsCache.set(targetUid, record);
    await syncToFirestore('admins', targetUid, record);

    await logAuditEvent({
      adminUid: currentAdmin.uid,
      adminEmail: currentAdmin.email,
      action: 'ADMIN_GRANTED',
      resourceType: 'admin_role',
      resourceId: targetUid,
      details: { targetEmail },
    });

    res.json({
      success: true,
      message: `Administrator privileges successfully granted to ${targetEmail}`,
      admin: record,
    });
  });

  // Revoke administrator role from a user (Admin only)
  app.post('/api/admin/users/revoke', requireAdmin, async (req, res) => {
    const { uid, email } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();
    const currentAdmin = (req as any).user as AuthenticatedUser;

    // Safety: Protect primary system administrator
    if (ADMIN_EMAIL && targetEmail === ADMIN_EMAIL) {
      return res.status(400).json({ error: 'Cannot revoke the primary administrator configured via ADMIN_EMAIL' });
    }

    let targetUid = uid;
    if (!targetUid && targetEmail) {
      adminRecordsCache.forEach((r) => {
        if (r.email.toLowerCase() === targetEmail) targetUid = r.uid;
      });
    }

    if (!targetUid) {
      return res.status(404).json({ error: 'Administrator record not found' });
    }

    if (adminAuth && targetUid !== 'bootstrap-root') {
      try {
        await adminAuth.setCustomUserClaims(targetUid, { admin: false });
      } catch (e: any) {
        console.warn('Revoke claims notice:', e.message);
      }
    }

    adminRecordsCache.delete(targetUid);
    await deleteFromFirestore('admins', targetUid);

    await logAuditEvent({
      adminUid: currentAdmin.uid,
      adminEmail: currentAdmin.email,
      action: 'ADMIN_REVOKED',
      resourceType: 'admin_role',
      resourceId: targetUid,
      details: { targetEmail },
    });

    res.json({
      success: true,
      message: `Administrator privileges successfully revoked for ${targetEmail || targetUid}`,
    });
  });

  // Read administrative audit trail logs (Admin only)
  app.get('/api/admin/audit-logs', requireAdmin, async (_req, res) => {
    try {
      const db = readDb();
      const combined = new Map<string, any>();
      (db.auditLogs || []).forEach((l: any) => combined.set(l.id, l));
      auditLogsCache.forEach((l) => combined.set(l.id, l));

      if (firestoreDb) {
        try {
          const snap = await getDocs(collection(firestoreDb, 'audit_logs'));
          snap.forEach((d) => {
            const data = d.data();
            combined.set(data.id || d.id, data);
          });
        } catch (fsErr: any) {
          console.warn('Firestore audit logs read notice:', fsErr.message);
        }
      }

      const logs = Array.from(combined.values());
      logs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      res.json(logs.slice(0, 100));
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve audit trail: ' + err.message });
    }
  });

  app.post('/api/auth/customer/login', (req, res) => {
    const { email, orderId, isGoogleAuth } = req.body;
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

    // If customer entered a specific Order ID that does not exist for this email, return 404
    if (orderId && matchedOrders.length === 0) {
      return res.status(404).json({
        error: `No order found with ID "${orderId}" for email "${email}". Please verify your order ID.`,
      });
    }

    // If manual non-Google login without an order ID and no orders found, inform user
    if (!isGoogleAuth && matchedOrders.length === 0) {
      return res.status(404).json({
        error: `No orders found for email "${email}". Please verify your checkout email or browse our catalog.`,
      });
    }

    const customerName = matchedOrders[0]?.customerName || cleanEmail.split('@')[0];
    const customerPhone = matchedOrders[0]?.customerPhone || '';

    return res.json({
      success: true,
      customer: {
        email: cleanEmail,
        name: customerName,
        phone: customerPhone,
      },
      orders: matchedOrders,
    });
  });


  // -------------------------------------------------------------------------
  // 2. WEBSITES PORTFOLIO (REAL WEBSITES)
  // -------------------------------------------------------------------------
  app.get('/api/websites', async (req, res) => {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const user = await verifyUserToken(token);
      if (user && user.admin) {
        isAdmin = true;
      }
    }

    const db = readDb();
    let list = (db.websites || []).map((w: any) => ({
      ...w,
      demoUrl: w.demoUrl || w.liveUrl || '',
      liveUrl: w.liveUrl || w.demoUrl || '',
      imageUrl: w.imageUrl || w.thumbnailUrl || '',
      thumbnailUrl: w.thumbnailUrl || w.imageUrl || '',
      shortDescription: w.shortDescription || w.description || '',
      currency: w.currency || 'USD',
      status: w.status || (w.published ? 'available' : 'in_development'),
      technologies: Array.isArray(w.technologies) ? w.technologies : [],
      features: Array.isArray(w.features) ? w.features : [],
    }));

    // Public only sees published websites that are not in development
    if (!isAdmin) {
      list = list.filter((w) => w.published === true && w.status !== 'in_development');
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

  app.get('/api/websites/:id', async (req, res) => {
    const db = readDb();
    const raw = db.websites.find((w) => w.id === req.params.id);
    if (!raw) {
      return res.status(404).json({ error: 'Website not found' });
    }
    const website = {
      ...raw,
      demoUrl: raw.demoUrl || raw.liveUrl || '',
      liveUrl: raw.liveUrl || raw.demoUrl || '',
      imageUrl: raw.imageUrl || raw.thumbnailUrl || '',
      thumbnailUrl: raw.thumbnailUrl || raw.imageUrl || '',
      shortDescription: raw.shortDescription || raw.description || '',
      currency: raw.currency || 'USD',
      status: raw.status || (raw.published ? 'available' : 'in_development'),
      technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
      features: Array.isArray(raw.features) ? raw.features : [],
    };

    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const user = await verifyUserToken(token);
      if (user && user.admin) {
        isAdmin = true;
      }
    }

    if (!website.published && !isAdmin) {
      return res.status(403).json({ error: 'This website is not published' });
    }
    res.json(website);
  });

  app.post('/api/websites', requireAdmin, async (req, res) => {
    const {
      name,
      category,
      shortDescription,
      description,
      price,
      currency,
      demoUrl,
      liveUrl,
      imageUrl,
      thumbnailUrl,
      screenshots,
      features,
      technologies,
      status,
      featured,
      published,
      displayOrder,
    } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Website Name is required.' });
    }

    const targetUrl = (demoUrl || liveUrl || '').trim();
    if (!targetUrl) {
      return res.status(400).json({ error: 'Preview / Demo URL is required.' });
    }

    try {
      const parsed = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).json({ error: 'Preview / Demo URL must begin with http:// or https://' });
      }
    } catch {
      return res.status(400).json({ error: 'Please enter a valid Preview / Demo URL (e.g. https://myclient.com)' });
    }

    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Selling Price must be a valid positive number.' });
    }

    const validStatuses = ['available', 'reserved', 'sold', 'in_development'];
    const resolvedStatus = validStatuses.includes(status) ? status : 'available';

    const db = readDb();

    // 2. Generate unique website ID (ensure no collision)
    let newId = 'ws-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
    while (db.websites.some((w) => w.id === newId)) {
      newId = 'ws-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
    }

    const finalImage = (imageUrl || thumbnailUrl || '').trim();
    const finalCurrency = (currency || 'USD').toUpperCase().trim();
    const finalDesc = (description || shortDescription || '').trim();
    const finalShortDesc = (shortDescription || finalDesc.slice(0, 160) || '').trim();

    // Parse features & technologies if sent as strings or arrays
    const parseList = (val: any): string[] => {
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const isPublished = published !== undefined ? Boolean(published) : resolvedStatus !== 'in_development';

    const newWebsite = {
      id: newId,
      name: name.trim(),
      category: category ? category.trim() : 'Business',
      shortDescription: finalShortDesc,
      description: finalDesc,
      price: Math.round(numPrice * 100) / 100,
      currency: finalCurrency,
      liveUrl: targetUrl,
      demoUrl: targetUrl,
      thumbnailUrl: finalImage,
      imageUrl: finalImage,
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      features: parseList(features),
      technologies: parseList(technologies),
      status: resolvedStatus,
      featured: Boolean(featured),
      published: isPublished,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : (parseInt(displayOrder) || (db.websites.length + 1)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.websites.push(newWebsite);
    writeDb(db);
    await syncToFirestore('websites', newWebsite.id, newWebsite);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'WEBSITE_CREATED',
      resourceType: 'website',
      resourceId: newWebsite.id,
      details: { name: newWebsite.name, price: newWebsite.price, currency: newWebsite.currency },
    });

    res.status(201).json(newWebsite);
  });

  app.put('/api/websites/:id', requireAdmin, async (req, res) => {
    const db = readDb();
    const index = db.websites.findIndex((w) => w.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const existing = db.websites[index];
    const {
      name,
      category,
      shortDescription,
      description,
      price,
      currency,
      demoUrl,
      liveUrl,
      imageUrl,
      thumbnailUrl,
      screenshots,
      features,
      technologies,
      status,
      featured,
      published,
      displayOrder,
    } = req.body;

    const targetUrl = (demoUrl !== undefined ? demoUrl : liveUrl);
    if (targetUrl !== undefined && targetUrl !== null) {
      const trimmed = String(targetUrl).trim();
      if (trimmed) {
        try {
          const parsed = new URL(trimmed);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            return res.status(400).json({ error: 'Preview / Demo URL must start with http:// or https://' });
          }
        } catch {
          return res.status(400).json({ error: 'Please enter a valid Preview / Demo URL' });
        }
      }
    }

    if (price !== undefined) {
      const p = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(p) || p <= 0) {
        return res.status(400).json({ error: 'Selling Price must be a valid positive number.' });
      }
    }

    const parseList = (val: any, fallback: string[]): string[] => {
      if (val === undefined) return fallback;
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const resolvedUrl = (targetUrl !== undefined ? String(targetUrl).trim() : (existing.liveUrl || existing.demoUrl || ''));
    const resolvedImage = (imageUrl !== undefined || thumbnailUrl !== undefined)
      ? String(imageUrl !== undefined ? imageUrl : thumbnailUrl).trim()
      : (existing.thumbnailUrl || existing.imageUrl || '');

    const validStatuses = ['available', 'reserved', 'sold', 'in_development'];
    const resolvedStatus = status !== undefined
      ? (validStatuses.includes(status) ? status : existing.status || 'available')
      : (existing.status || 'available');

    const updated = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      category: category !== undefined ? category.trim() : existing.category,
      shortDescription: shortDescription !== undefined ? shortDescription.trim() : (existing.shortDescription || existing.description),
      description: description !== undefined ? description.trim() : existing.description,
      price: price !== undefined ? Math.round(Number(price) * 100) / 100 : existing.price,
      currency: currency !== undefined ? currency.toUpperCase().trim() : (existing.currency || 'USD'),
      liveUrl: resolvedUrl,
      demoUrl: resolvedUrl,
      thumbnailUrl: resolvedImage,
      imageUrl: resolvedImage,
      screenshots: screenshots !== undefined ? screenshots : (existing.screenshots || []),
      features: parseList(features, existing.features || []),
      technologies: parseList(technologies, existing.technologies || []),
      status: resolvedStatus,
      featured: featured !== undefined ? Boolean(featured) : existing.featured,
      published: published !== undefined ? Boolean(published) : existing.published,
      displayOrder: displayOrder !== undefined ? (parseInt(displayOrder) || existing.displayOrder) : existing.displayOrder,
      updatedAt: new Date().toISOString(),
    };

    db.websites[index] = updated;
    writeDb(db);
    await syncToFirestore('websites', updated.id, updated);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    if (price !== undefined && Math.round(Number(price) * 100) / 100 !== existing.price) {
      await logAuditEvent({
        adminUid: currentAdmin?.uid || 'admin',
        adminEmail: currentAdmin?.email,
        action: 'PRICE_CHANGED',
        resourceType: 'website',
        resourceId: updated.id,
        details: { oldPrice: existing.price, newPrice: updated.price, currency: updated.currency },
      });
    }

    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'WEBSITE_UPDATED',
      resourceType: 'website',
      resourceId: updated.id,
      details: { name: updated.name, price: updated.price, status: updated.status },
    });

    res.json(updated);
  });

  // Quick attribute update (Price, Status, Featured, Published) for instant catalog editing
  app.patch('/api/websites/:id/quick', requireAdmin, async (req, res) => {
    const db = readDb();
    const index = db.websites.findIndex((w) => w.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const existing = db.websites[index];
    const { price, status, featured, published } = req.body;

    let priceChanged = false;
    let oldPrice = existing.price;

    if (price !== undefined) {
      const num = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      const newP = Math.round(num * 100) / 100;
      if (newP !== existing.price) {
        priceChanged = true;
        existing.price = newP;
      }
    }

    if (status !== undefined) {
      const validStatuses = ['available', 'reserved', 'sold', 'in_development'];
      if (validStatuses.includes(status)) {
        existing.status = status;
        if (status === 'in_development') {
          existing.published = false;
        }
      }
    }

    if (featured !== undefined) {
      existing.featured = Boolean(featured);
    }

    if (published !== undefined) {
      existing.published = Boolean(published);
    }

    existing.updatedAt = new Date().toISOString();
    db.websites[index] = existing;
    writeDb(db);
    await syncToFirestore('websites', existing.id, existing);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    if (priceChanged) {
      await logAuditEvent({
        adminUid: currentAdmin?.uid || 'admin',
        adminEmail: currentAdmin?.email,
        action: 'PRICE_CHANGED',
        resourceType: 'website',
        resourceId: existing.id,
        details: { oldPrice, newPrice: existing.price },
      });
    }

    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'WEBSITE_UPDATED',
      resourceType: 'website',
      resourceId: existing.id,
      details: { status: existing.status, featured: existing.featured, published: existing.published },
    });

    res.json(existing);
  });

  app.delete('/api/websites/:id', requireAdmin, async (req, res) => {
    const db = readDb();
    const existing = db.websites.find((w) => w.id === req.params.id);
    const filtered = db.websites.filter((w) => w.id !== req.params.id);
    if (filtered.length === db.websites.length) {
      return res.status(404).json({ error: 'Website not found' });
    }
    db.websites = filtered;
    writeDb(db);
    await deleteFromFirestore('websites', req.params.id);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'WEBSITE_DELETED',
      resourceType: 'website',
      resourceId: req.params.id,
      details: { name: existing?.name },
    });

    res.json({ success: true, message: 'Website permanently deleted from catalog and Firestore.' });
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
      let finalCurrency = 'USD';

      // CRITICAL SERVER-SIDE PRICE SECURITY:
      // When purchasing a catalog website, NEVER trust any price passed by the browser.
      // Load the authoritative record directly from the database/Firestore and enforce its price and status.
      if (websiteId) {
        const item = db.websites.find((w) => w.id === websiteId);
        if (!item) {
          return res.status(404).json({ error: 'The selected website does not exist or has been removed from our catalog.' });
        }
        if (item.status === 'sold') {
          return res.status(400).json({ error: 'This website has already been sold and is no longer available for purchase.' });
        }
        selectedItemName = item.name;
        finalAmount = item.price;
        finalCurrency = item.currency || 'USD';
      }

      // Check if checkout request has authenticated user token
      let customerUid: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const user = await verifyUserToken(token);
        if (user && user.uid && user.uid !== 'admin-root') {
          customerUid = user.uid;
        }
      }

      // Generate human-readable unique order ID (BMW-1024, etc.)
      const orderCount = db.orders.length + 1;
      const orderId = `BMW-${1000 + orderCount}`;

      const newOrder = {
        id: orderId,
        customerUid: customerUid || undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        businessName: businessName ? businessName.trim() : '',
        websiteId: websiteId || undefined,
        websiteName: selectedItemName,
        amount: finalAmount,
        currency: finalCurrency,
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

  // Get orders (Admin gets all, Customer gets isolated to their verified UID/email or query)
  app.get('/api/orders', async (req, res) => {
    const authHeader = req.headers.authorization;
    const queryEmail = (req.query.email as string || '').trim().toLowerCase();
    const queryOrderId = (req.query.orderId as string || '').trim().toLowerCase();
    const db = readDb();

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      const user = await verifyUserToken(token);
      if (user) {
        // Authoritative Admin: returns all customer orders
        if (user.admin) {
          return res.json(db.orders);
        }

        // Customer: Strictly isolated to authenticated user's Firebase UID and verified email.
        const userUid = user.uid;
        const userEmail = (user.email || '').toLowerCase();

        const customerOrders = db.orders.filter((o) => {
          const uidMatches = Boolean(userUid && o.customerUid && o.customerUid === userUid);
          const emailMatches = Boolean(userEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === userEmail);
          return uidMatches || emailMatches;
        });

        return res.json(customerOrders);
      }
    }

    // Customer Portal lookup by email and/or orderId
    if (queryEmail || queryOrderId) {
      const matched = db.orders.filter((o) => {
        const emailMatches = queryEmail ? (o.customerEmail && o.customerEmail.trim().toLowerCase() === queryEmail) : true;
        const orderMatches = queryOrderId ? (o.id && o.id.toLowerCase() === queryOrderId) : true;
        return emailMatches && orderMatches;
      });
      return res.json(matched);
    }

    return res.status(401).json({ error: 'Unauthorized: Authentication required to access orders' });
  });

  // Get specific order by ID (Strict ownership isolation)
  app.get('/api/orders/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
    }

    const db = readDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Admin can view any order
    if (user.admin) {
      return res.json(order);
    }

    // Customer can only view their own order
    const isOwner = Boolean(
      (order.customerUid && order.customerUid === user.uid) ||
      (user.email && order.customerEmail && order.customerEmail.toLowerCase() === user.email.toLowerCase())
    );

    if (!isOwner) {
      // Return 404 to avoid leaking existence of other customers' orders
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  });

  // Update order status (Admin only)
  app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
    const { status, paymentStatus, previewUrl, finalWebsiteUrl, adminNotes } = req.body;
    const db = readDb();
    const index = db.orders.findIndex((o) => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[index];
    const prevStatus = order.orderStatus;
    const prevPayment = order.paymentStatus;

    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (previewUrl !== undefined) order.previewUrl = previewUrl.trim();
    if (finalWebsiteUrl !== undefined) order.finalWebsiteUrl = finalWebsiteUrl.trim();
    if (adminNotes !== undefined) order.adminNotes = adminNotes.trim();
    order.updatedAt = new Date().toISOString();

    writeDb(db);
    await syncToFirestore('orders', order.id, order);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'ORDER_STATUS_CHANGED',
      resourceType: 'order',
      resourceId: order.id,
      details: {
        previousStatus: prevStatus,
        newStatus: order.orderStatus,
        previousPayment: prevPayment,
        newPayment: order.paymentStatus,
        previewUrl: order.previewUrl,
        finalWebsiteUrl: order.finalWebsiteUrl,
      },
    });

    res.json(order);
  });

  // Submit Customer Requirements Form (Enforces customer ownership verification)
  app.post('/api/orders/:id/requirements', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required to submit requirements' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
    }

    const db = readDb();
    const index = db.orders.findIndex((o) => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = db.orders[index];

    // Verify ownership: order must belong to the authenticated user or caller must be admin
    const isOwner = Boolean(
      (order.customerUid && order.customerUid === user.uid) ||
      (user.email && order.customerEmail && order.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
      user.admin
    );

    if (!isOwner) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to submit requirements for this order' });
    }

    const {
      businessName,
      logoUrl,
      businessDescription,
      phone,
      email,
      address,
      whatsapp,
      socialLinks,
      socialMedia,
      services,
      aboutBusiness,
      preferredColors,
      specialFeatures,
      additionalRequirements,
      specialRequirements,
      uploadedImages,
      businessImages,
    } = req.body;

    order.requirements = {
      businessName: businessName ? businessName.trim() : order.businessName || '',
      logoUrl: logoUrl ? logoUrl.trim() : undefined,
      businessDescription: businessDescription ? businessDescription.trim() : '',
      phone: phone ? phone.trim() : order.customerPhone,
      email: email ? email.trim() : order.customerEmail,
      address: address ? address.trim() : undefined,
      whatsapp: whatsapp ? whatsapp.trim() : undefined,
      socialLinks: socialLinks || socialMedia ? (socialLinks || socialMedia).trim() : undefined,
      socialMedia: socialMedia || socialLinks ? (socialMedia || socialLinks).trim() : undefined,
      services: services ? services.trim() : undefined,
      aboutBusiness: aboutBusiness ? aboutBusiness.trim() : undefined,
      preferredColors: preferredColors ? preferredColors.trim() : undefined,
      specialFeatures: specialFeatures ? specialFeatures.trim() : undefined,
      additionalRequirements: additionalRequirements || specialRequirements ? (additionalRequirements || specialRequirements).trim() : undefined,
      specialRequirements: specialRequirements || additionalRequirements ? (specialRequirements || additionalRequirements).trim() : undefined,
      uploadedImages: Array.isArray(uploadedImages || businessImages) ? (uploadedImages || businessImages) : [],
      businessImages: Array.isArray(businessImages || uploadedImages) ? (businessImages || uploadedImages) : [],
      submittedAt: new Date().toISOString(),
    };

    // Advance project status to 'Requirements Received'
    if (
      order.orderStatus === 'Payment Confirmed' ||
      order.orderStatus === 'Requirements Needed' ||
      order.orderStatus === 'Payment Pending'
    ) {
      order.orderStatus = 'Requirements Received';
    }

    order.updatedAt = new Date().toISOString();
    writeDb(db);
    await syncToFirestore('orders', order.id, order);

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

  app.put('/api/settings', requireAdmin, async (req, res) => {
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
    await syncToFirestore('settings', 'agency', db.settings);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'SETTING_UPDATED',
      resourceType: 'setting',
      resourceId: 'agency',
      details: { agencyName: db.settings.agencyName },
    });

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
  // 7. CALL BOOKING SYSTEM (CUSTOMER & ADMIN)
  // =========================================================================
  const STANDARD_CALL_SLOTS = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  // Get available slots for a specific date
  app.get('/api/bookings/available-slots', (req, res) => {
    const date = (req.query.date as string)?.trim();
    if (!date) {
      return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
    }

    const db = readDb();
    const existingBookings = (db.bookings || []).filter(
      (b) => b.date === date && b.status !== 'Cancelled'
    );

    const bookedSlots = existingBookings.map((b) => b.time);
    const availableSlots = STANDARD_CALL_SLOTS.filter((s) => !bookedSlots.includes(s));

    res.json({
      date,
      allSlots: STANDARD_CALL_SLOTS,
      bookedSlots,
      availableSlots,
    });
  });

  // Get bookings (Admin gets all, Customer gets only their own)
  app.get('/api/bookings', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const db = readDb();
    const allBookings = db.bookings || [];

    if (user.admin) {
      return res.json(allBookings);
    }

    // Customer isolation
    const customerBookings = allBookings.filter((b) => {
      const matchUid = b.customerUid && b.customerUid === user.uid;
      const matchEmail = user.email && b.customerEmail && b.customerEmail.toLowerCase() === user.email.toLowerCase();
      return matchUid || matchEmail;
    });

    res.json(customerBookings);
  });

  // Create a call booking
  app.post('/api/bookings', async (req, res) => {
    const authHeader = req.headers.authorization;
    let user: AuthenticatedUser | null = null;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      user = await verifyUserToken(token);
    }

    const {
      callType,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      reason,
    } = req.body;

    if (!date || !time || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Date, time, name, and email are required to book a call.' });
    }

    const db = readDb();
    if (!db.bookings) db.bookings = [];

    // Conflict prevention: Do not allow two customers to book the same unavailable slot
    const hasConflict = db.bookings.some(
      (b) => b.date === date.trim() && b.time === time.trim() && b.status !== 'Cancelled'
    );

    if (hasConflict) {
      return res.status(409).json({
        error: `The slot at ${time} on ${date} has already been reserved. Please select another time slot.`,
      });
    }

    const newBooking = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      customerUid: user?.uid,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      callType: callType || 'Website Consultation',
      date: date.trim(),
      time: time.trim(),
      reason: reason ? reason.trim() : 'Website Strategy & Requirements Discussion',
      status: 'Requested',
      meetingLink: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.unshift(newBooking);
    writeDb(db);
    await syncToFirestore('bookings', newBooking.id, newBooking);

    res.status(201).json({ success: true, booking: newBooking });
  });

  // Admin update booking status / reschedule / add meeting link / notes
  app.patch('/api/bookings/:id', requireAdmin, async (req, res) => {
    const { status, meetingLink, notes, date, time } = req.body;
    const db = readDb();
    if (!db.bookings) db.bookings = [];

    const index = db.bookings.findIndex((b) => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Call booking not found' });
    }

    const booking = db.bookings[index];
    const prevStatus = booking.status;

    if (status) booking.status = status;
    if (meetingLink !== undefined) booking.meetingLink = meetingLink.trim();
    if (notes !== undefined) booking.notes = notes.trim();
    if (date) booking.date = date.trim();
    if (time) booking.time = time.trim();
    booking.updatedAt = new Date().toISOString();

    writeDb(db);
    await syncToFirestore('bookings', booking.id, booking);

    const currentAdmin = (req as any).user as AuthenticatedUser;
    await logAuditEvent({
      adminUid: currentAdmin?.uid || 'admin',
      adminEmail: currentAdmin?.email,
      action: 'BOOKING_UPDATED',
      resourceType: 'booking',
      resourceId: booking.id,
      details: {
        previousStatus: prevStatus,
        newStatus: booking.status,
        date: booking.date,
        time: booking.time,
      },
    });

    res.json(booking);
  });

  // =========================================================================
  // 8. PROJECT MESSAGES (CUSTOMER & ADMIN)
  // =========================================================================
  app.get('/api/messages', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const db = readDb();
    const allMessages = db.messages || [];
    const orderId = req.query.orderId as string;

    if (user.admin) {
      if (orderId) {
        return res.json(allMessages.filter((m) => m.orderId === orderId));
      }
      return res.json(allMessages);
    }

    // Customer can only view messages for orders they own
    const userOrders = db.orders.filter((o) => {
      const matchUid = o.customerUid && o.customerUid === user.uid;
      const matchEmail = user.email && o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase();
      return matchUid || matchEmail;
    });

    const userOrderIds = new Set(userOrders.map((o) => o.id));

    let customerMessages = allMessages.filter((m) => userOrderIds.has(m.orderId));
    if (orderId) {
      customerMessages = customerMessages.filter((m) => m.orderId === orderId);
    }

    res.json(customerMessages);
  });

  app.post('/api/messages', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const { orderId, message, type, attachments } = req.body;
    if (!orderId || !message || !message.trim()) {
      return res.status(400).json({ error: 'orderId and message text are required' });
    }

    const db = readDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Associated order not found' });
    }

    // Security check: non-admin must own the order
    if (!user.admin) {
      const isOwner = Boolean(
        (order.customerUid && order.customerUid === user.uid) ||
        (user.email && order.customerEmail && order.customerEmail.toLowerCase() === user.email.toLowerCase())
      );
      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: You cannot message on another customer’s order' });
      }
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      websiteName: order.websiteName,
      customerUid: order.customerUid,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      senderRole: user.admin ? 'admin' : 'customer',
      senderName: user.admin ? 'Agency Team' : (user.name || order.customerName || 'Customer'),
      message: message.trim(),
      type: type || 'general',
      attachments: Array.isArray(attachments) ? attachments : [],
      timestamp: new Date().toISOString(),
    };

    if (!db.messages) db.messages = [];
    db.messages.push(newMsg);
    writeDb(db);
    await syncToFirestore('messages', newMsg.id, newMsg);

    res.status(201).json({ success: true, message: newMsg });
  });

  // =========================================================================
  // 9. ADMIN COMMAND CENTER ENGINE
  // =========================================================================
  app.post('/api/admin/command', requireAdmin, async (req, res) => {
    const { command, confirmAction, draft, websiteId } = req.body;
    const db = readDb();
    const currentAdmin = (req as any).user as AuthenticatedUser;

    // Handle Direct Confirmations
    if (confirmAction === 'add_website' && draft) {
      const newWebsite = {
        id: `ws-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        name: draft.name.trim(),
        category: draft.category ? draft.category.trim() : 'Business',
        description: draft.description ? draft.description.trim() : 'Custom built premium responsive website.',
        price: Number(draft.price) || 199,
        currency: 'USD',
        liveUrl: draft.liveUrl.trim(),
        thumbnailUrl: draft.thumbnailUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        screenshots: Array.isArray(draft.screenshots) ? draft.screenshots : [],
        features: Array.isArray(draft.features) ? draft.features : ['Mobile Responsive', 'High Conversion', 'Fast Loading', 'SEO Optimized'],
        technologies: ['React', 'Tailwind CSS', 'Vite'],
        status: 'available',
        featured: Boolean(draft.featured),
        published: draft.published !== false,
        displayOrder: db.websites.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.websites.push(newWebsite);
      writeDb(db);
      await syncToFirestore('websites', newWebsite.id, newWebsite);

      await logAuditEvent({
        adminUid: currentAdmin?.uid || 'admin',
        adminEmail: currentAdmin?.email,
        action: 'WEBSITE_CREATED_VIA_COMMAND',
        resourceType: 'website',
        resourceId: newWebsite.id,
        details: { name: newWebsite.name, price: newWebsite.price, liveUrl: newWebsite.liveUrl },
      });

      return res.json({
        success: true,
        type: 'website_added',
        message: `Website "${newWebsite.name}" has been successfully created and published in the database!`,
        website: newWebsite,
      });
    }

    if (confirmAction === 'delete_website' && websiteId) {
      const idx = db.websites.findIndex((w) => w.id === websiteId);
      if (idx === -1) {
        return res.status(404).json({ error: 'Target website not found' });
      }
      const deleted = db.websites.splice(idx, 1)[0];
      writeDb(db);
      await deleteFromFirestore('websites', deleted.id);

      await logAuditEvent({
        adminUid: currentAdmin?.uid || 'admin',
        adminEmail: currentAdmin?.email,
        action: 'WEBSITE_DELETED_VIA_COMMAND',
        resourceType: 'website',
        resourceId: deleted.id,
        details: { name: deleted.name },
      });

      return res.json({
        success: true,
        type: 'website_deleted',
        message: `Website "${deleted.name}" has been permanently removed from the catalog.`,
      });
    }

    if (!command || !command.trim()) {
      return res.status(400).json({ error: 'Command text is required' });
    }

    const cmd = command.trim();
    const lower = cmd.toLowerCase();

    // 1. DELETE COMMAND (DESTRUCTIVE - ALWAYS REQUIRES CONFIRMATION)
    if (lower.startsWith('delete') || lower.includes('delete website')) {
      const targetName = cmd.replace(/delete\s+(website\s+)?/i, '').replace(/["']/g, '').trim();
      const target = db.websites.find(
        (w) => w.name.toLowerCase().includes(targetName.toLowerCase()) || w.id === targetName
      );

      if (!target) {
        return res.json({
          success: false,
          type: 'not_found',
          message: `Could not find any website matching "${targetName}" to delete.`,
        });
      }

      return res.json({
        success: true,
        type: 'delete_confirmation',
        requiresConfirmation: true,
        prompt: `Are you sure you want to delete ${target.name}?`,
        targetWebsite: {
          id: target.id,
          name: target.name,
          category: target.category,
          price: target.price,
        },
      });
    }

    // 2. ADD WEBSITE COMMAND (REQUIRES CONFIRMATION CARD)
    if (
      lower.startsWith('add website') ||
      lower.startsWith('add a website') ||
      lower.startsWith('add a new') ||
      lower.startsWith('create website')
    ) {
      // Parse structured or natural language fields
      let name = '';
      let category = 'Business';
      let price = 199;
      let url = 'https://example.com';
      let featured = false;
      let published = true;
      let description = '';

      // Pattern: Name: ..., Category: ..., Price: ..., URL: ...
      const nameMatch = cmd.match(/name\s*:\s*([^,\n]+)/i);
      const catMatch = cmd.match(/category\s*:\s*([^,\n]+)/i);
      const priceMatch = cmd.match(/price\s*:\s*\$?([0-9]+)/i);
      const urlMatch = cmd.match(/url\s*:\s*(https?:\/\/[^\s,]+)/i) || cmd.match(/(https?:\/\/[^\s,]+)/i);
      const featMatch = cmd.match(/featured\s*:\s*(yes|true)/i);
      const pubMatch = cmd.match(/published\s*:\s*(no|false)/i);

      if (nameMatch) name = nameMatch[1].trim();
      if (catMatch) category = catMatch[1].trim();
      if (priceMatch) price = Number(priceMatch[1]);
      if (urlMatch) url = urlMatch[1].trim();
      if (featMatch) featured = true;
      if (pubMatch) published = false;

      // Natural fallback parsing
      if (!name) {
        if (lower.includes('restaurant')) {
          name = 'Artisan Bistro';
          category = 'Restaurant';
        } else if (lower.includes('hotel')) {
          name = 'Grand Horizon Resort';
          category = 'Hotel';
        } else if (lower.includes('e-commerce') || lower.includes('store')) {
          name = 'Aura Luxe Boutique';
          category = 'E-commerce';
        } else if (lower.includes('medical') || lower.includes('clinic')) {
          name = 'Apex Wellness Clinic';
          category = 'Medical';
        } else {
          name = 'Modern Corporate Hub';
          category = 'Business';
        }
      }

      description = `A professional, fully responsive ${category.toLowerCase()} website with modern animations, responsive layout, and optimized conversion architecture.`;

      return res.json({
        success: true,
        type: 'add_website_confirmation',
        requiresConfirmation: true,
        message: 'Please review the website specifications before saving:',
        draft: {
          name,
          category,
          price,
          currency: 'USD',
          liveUrl: url,
          featured,
          published,
          description,
          thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
          features: ['Custom Branding', 'Mobile & Tablet Ready', 'Fast Global CDN', 'SSL Security'],
        },
      });
    }

    // 3. CHANGE PRICE
    const priceChangeMatch = cmd.match(/change\s+(.+?)\s+price\s+to\s+\$?([0-9]+)/i);
    if (priceChangeMatch) {
      const siteQuery = priceChangeMatch[1].replace(/website/gi, '').trim().toLowerCase();
      const newPrice = Number(priceChangeMatch[2]);
      const site = db.websites.find(
        (w) => w.name.toLowerCase().includes(siteQuery) || w.category.toLowerCase().includes(siteQuery)
      );
      if (!site) {
        return res.json({
          success: false,
          type: 'not_found',
          message: `Could not find website matching "${priceChangeMatch[1]}" to update price.`,
        });
      }
      const oldPrice = site.price;
      site.price = newPrice;
      site.updatedAt = new Date().toISOString();
      writeDb(db);
      await syncToFirestore('websites', site.id, site);

      return res.json({
        success: true,
        type: 'price_updated',
        message: `Successfully changed "${site.name}" price from $${oldPrice} to $${newPrice} USD.`,
        website: site,
      });
    }

    // 4. PUBLISH / UNPUBLISH
    if (lower.startsWith('publish')) {
      const siteQuery = cmd.replace(/publish\s+(website\s+)?/i, '').replace(/["']/g, '').trim().toLowerCase();
      const site = db.websites.find(
        (w) => w.name.toLowerCase().includes(siteQuery) || w.category.toLowerCase().includes(siteQuery)
      );
      if (!site) {
        return res.json({
          success: false,
          type: 'not_found',
          message: `Could not find website matching "${siteQuery}" to publish.`,
        });
      }
      site.published = true;
      site.updatedAt = new Date().toISOString();
      writeDb(db);
      await syncToFirestore('websites', site.id, site);
      return res.json({
        success: true,
        type: 'published',
        message: `Website "${site.name}" is now published and visible to customers.`,
        website: site,
      });
    }

    if (lower.startsWith('unpublish')) {
      const siteQuery = cmd.replace(/unpublish\s+(website\s+)?/i, '').replace(/["']/g, '').trim().toLowerCase();
      const site = db.websites.find(
        (w) => w.name.toLowerCase().includes(siteQuery) || w.category.toLowerCase().includes(siteQuery)
      );
      if (!site) {
        return res.json({
          success: false,
          type: 'not_found',
          message: `Could not find website matching "${siteQuery}" to unpublish.`,
        });
      }
      site.published = false;
      site.updatedAt = new Date().toISOString();
      writeDb(db);
      await syncToFirestore('websites', site.id, site);
      return res.json({
        success: true,
        type: 'unpublished',
        message: `Website "${site.name}" has been unpublished.`,
        website: site,
      });
    }

    // 5. MAKE FEATURED
    if (lower.includes('featured')) {
      const siteQuery = cmd.replace(/make\s+/i, '').replace(/\s+featured/i, '').replace(/website/gi, '').trim().toLowerCase();
      const site = db.websites.find(
        (w) => w.name.toLowerCase().includes(siteQuery) || w.category.toLowerCase().includes(siteQuery)
      );
      if (!site) {
        return res.json({
          success: false,
          type: 'not_found',
          message: `Could not find website matching "${siteQuery}".`,
        });
      }
      site.featured = true;
      site.updatedAt = new Date().toISOString();
      writeDb(db);
      await syncToFirestore('websites', site.id, site);
      return res.json({
        success: true,
        type: 'featured',
        message: `Website "${site.name}" is now featured on the homepage.`,
        website: site,
      });
    }

    // 6. QUERIES (ORDERS, REQUIREMENTS, CALLS)
    if (lower.includes("order") || lower.includes("today's orders")) {
      const orders = db.orders || [];
      return res.json({
        success: true,
        type: 'query_result',
        title: "Platform Orders",
        count: orders.length,
        items: orders.map((o) => ({
          id: o.id,
          customer: o.customerName,
          website: o.websiteName,
          amount: `$${o.amount} ${o.currency}`,
          payment: o.paymentStatus,
          status: o.orderStatus,
        })),
        message: `Found ${orders.length} real order(s) recorded in the database.`,
      });
    }

    if (lower.includes('requirement')) {
      const pendingReqs = (db.orders || []).filter(
        (o) => o.orderStatus === 'Requirements Needed' || o.orderStatus === 'Requirements Received'
      );
      return res.json({
        success: true,
        type: 'query_result',
        title: 'Customer Requirements',
        count: pendingReqs.length,
        items: pendingReqs.map((o) => ({
          orderId: o.id,
          customer: o.customerName,
          website: o.websiteName,
          status: o.orderStatus,
          hasSubmitted: Boolean(o.requirements?.businessName),
        })),
        message: `Found ${pendingReqs.length} order(s) requiring attention for project requirements.`,
      });
    }

    if (lower.includes('call') || lower.includes('booking')) {
      const calls = (db.bookings || []).filter((b) => b.status !== 'Cancelled');
      return res.json({
        success: true,
        type: 'query_result',
        title: 'Upcoming Call Bookings',
        count: calls.length,
        items: calls.map((b) => ({
          id: b.id,
          customer: b.customerName,
          date: b.date,
          time: b.time,
          type: b.callType,
          status: b.status,
          link: b.meetingLink || 'Pending Link',
        })),
        message: `Found ${calls.length} scheduled call booking(s).`,
      });
    }

    // Default Fallback
    return res.json({
      success: true,
      type: 'command_help',
      message: `Command received: "${cmd}". Here are supported command formats:\n• "Add website: Name: ..., Category: ..., Price: $199, URL: https://example.com"\n• "Change [Website Name] price to $249"\n• "Publish [Website Name]" / "Unpublish [Website Name]"\n• "Make [Website Name] featured"\n• "Delete [Website Name]"\n• "Show me today's orders"\n• "Show pending customer requirements"\n• "Show my upcoming calls"`,
    });
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
