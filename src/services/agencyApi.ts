import { RealWebsite, Order, CustomerRequirements, AgencySettings, OrderStatus, PaymentStatus } from '../types';

export const ADMIN_TOKEN_KEY = 'bmw_admin_token';
export const CUSTOMER_SESSION_KEY = 'bmw_customer_session';

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null) {
  try {
    if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
    else localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
}

export function getStoredCustomerSession(): { email: string; name: string; phone?: string } | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredCustomerSession(session: { email: string; name: string; phone?: string } | null) {
  try {
    if (session) localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(CUSTOMER_SESSION_KEY);
  } catch {}
}

export async function fetchWebsites(adminToken?: string): Promise<RealWebsite[]> {
  try {
    const headers: Record<string, string> = {};
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    const res = await fetch('/api/websites', { headers });
    if (!res.ok) throw new Error('Failed to load websites');
    return await res.json();
  } catch (err) {
    console.error('fetchWebsites error:', err);
    return [];
  }
}

export async function fetchWebsiteById(id: string): Promise<RealWebsite | null> {
  try {
    const res = await fetch(`/api/websites/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createWebsite(data: Partial<RealWebsite>, token: string): Promise<RealWebsite> {
  const res = await fetch('/api/websites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create website');
  }
  return await res.json();
}

export async function updateWebsite(id: string, data: Partial<RealWebsite>, token: string): Promise<RealWebsite> {
  const res = await fetch(`/api/websites/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update website');
  }
  return await res.json();
}

export async function deleteWebsite(id: string, token: string): Promise<boolean> {
  const res = await fetch(`/api/websites/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
}

export async function adminLogin(password: string): Promise<{ token: string; user: any }> {
  const res = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Invalid credentials');
  }
  const data = await res.json();
  setStoredAdminToken(data.token);
  return data;
}

export async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function customerLogin(email: string, orderId?: string): Promise<{ customer: any; orders: Order[] }> {
  const res = await fetch('/api/auth/customer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, orderId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to sign in');
  }
  const data = await res.json();
  setStoredCustomerSession(data.customer);
  return data;
}

export async function fetchOrders(options?: { adminToken?: string; email?: string; orderId?: string }): Promise<Order[]> {
  try {
    const headers: Record<string, string> = {};
    let query = '';

    if (options?.adminToken) {
      headers['Authorization'] = `Bearer ${options.adminToken}`;
    } else if (options?.email || options?.orderId) {
      const params = new URLSearchParams();
      if (options.email) params.set('email', options.email);
      if (options.orderId) params.set('orderId', options.orderId);
      query = `?${params.toString()}`;
    } else {
      return [];
    }

    const res = await fetch(`/api/orders${query}`, { headers });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('fetchOrders error:', err);
    return [];
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  token: string,
  extra?: { paymentStatus?: PaymentStatus; previewUrl?: string; adminNotes?: string }
): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, ...extra }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update order');
  }
  return await res.json();
}

export async function submitOrderRequirements(
  orderId: string,
  requirements: CustomerRequirements
): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requirements),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit requirements');
  }
  return await res.json();
}

export async function createCheckoutSession(payload: {
  websiteId?: string;
  websiteName?: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName?: string;
  requirementsNote?: string;
  paymentMethod?: 'stripe' | 'direct' | 'paypal';
}): Promise<{
  orderId: string;
  checkoutUrl: string | null;
  sessionId?: string;
  provider: string;
  amount: number;
  currency: string;
  requiresDirectPayment?: boolean;
}> {
  const res = await fetch('/api/checkout/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Checkout initialization failed');
  }
  return await res.json();
}

export async function verifyPayment(payload: {
  orderId: string;
  sessionId?: string;
  paymentIntentId?: string;
  transactionToken?: string;
}): Promise<{ verified: boolean; order: Order }> {
  const res = await fetch('/api/checkout/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Payment verification failed');
  }
  return await res.json();
}

export async function fetchSettings(): Promise<AgencySettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  } catch (err) {
    return {
      agencyName: 'BUILD MY WEBSITE',
      whatsappNumber: '15551234567',
      displayPhone: '+1 (555) 123-4567',
      email: 'contact@buildmywebsite.agency',
      showStats: false,
      stripeEnabled: false,
      paypalEnabled: false,
      testimonials: [],
    };
  }
}

export async function updateSettings(settings: Partial<AgencySettings>, token: string): Promise<AgencySettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update settings');
  }
  const data = await res.json();
  return data.settings;
}

export async function uploadImage(dataUrl: string, filename?: string): Promise<{ url: string }> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, filename }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload image');
  }
  return await res.json();
}
