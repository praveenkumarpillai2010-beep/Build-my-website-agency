import { RealWebsite, Order, CustomerRequirements, AgencySettings, OrderStatus, PaymentStatus, CallBooking, ProjectMessage } from '../types';

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

export async function quickUpdateWebsite(
  id: string,
  updates: { price?: number; status?: string; featured?: boolean; published?: boolean },
  token: string
): Promise<RealWebsite> {
  const res = await fetch(`/api/websites/${encodeURIComponent(id)}/quick`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
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

export async function customerLogin(
  email: string,
  orderId?: string,
  isGoogleAuth?: boolean
): Promise<{ customer: any; orders: Order[] }> {
  const res = await fetch('/api/auth/customer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, orderId, isGoogleAuth }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to sign in');
  }
  const data = await res.json();
  if (data?.customer) {
    setStoredCustomerSession(data.customer);
  }
  return data;
}

export async function fetchOrders(options?: {
  adminToken?: string;
  token?: string;
  email?: string;
  orderId?: string;
}): Promise<Order[]> {
  try {
    const headers: Record<string, string> = {};
    let query = '';

    const authToken = options?.adminToken || options?.token;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (options?.email || options?.orderId) {
      const params = new URLSearchParams();
      if (options.email) params.set('email', options.email);
      if (options.orderId) params.set('orderId', options.orderId);
      query = `?${params.toString()}`;
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
  extra?: { paymentStatus?: PaymentStatus; previewUrl?: string; finalWebsiteUrl?: string; adminNotes?: string }
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
  requirements: CustomerRequirements,
  token?: string
): Promise<{ success: boolean; order: Order }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const effectiveToken = token || getStoredAdminToken();
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/requirements`, {
    method: 'POST',
    headers,
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

export async function fetchAdminUsers(token: string): Promise<any[]> {
  const res = await fetch('/api/admin/users/admins', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load administrator accounts');
  return await res.json();
}

export async function grantAdminUser(emailOrUid: { email?: string; uid?: string }, token: string): Promise<any> {
  const res = await fetch('/api/admin/users/grant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(emailOrUid),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to grant admin access');
  }
  return await res.json();
}

export async function revokeAdminUser(emailOrUid: { email?: string; uid?: string }, token: string): Promise<any> {
  const res = await fetch('/api/admin/users/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(emailOrUid),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to revoke admin access');
  }
  return await res.json();
}

export async function fetchAuditLogs(token: string): Promise<any[]> {
  const res = await fetch('/api/admin/audit-logs', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load security audit logs');
  return await res.json();
}

// ---------------------------------------------------------------------------
// CALL BOOKINGS API
// ---------------------------------------------------------------------------
export async function fetchAvailableSlots(date: string): Promise<{
  date: string;
  allSlots: string[];
  bookedSlots: string[];
  availableSlots: string[];
}> {
  const res = await fetch(`/api/bookings/available-slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error('Failed to fetch available slots');
  return await res.json();
}

export async function fetchBookings(token: string): Promise<CallBooking[]> {
  const res = await fetch('/api/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load call bookings');
  return await res.json();
}

export async function createBooking(
  bookingData: {
    callType?: string;
    date: string;
    time: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    reason?: string;
  },
  token?: string
): Promise<{ success: boolean; booking: CallBooking }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers,
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to schedule booking');
  }
  return await res.json();
}

export async function updateBooking(
  id: string,
  updates: Partial<CallBooking>,
  token: string
): Promise<CallBooking> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update booking');
  }
  return await res.json();
}

export async function updateBookingStatus(
  id: string,
  status: CallBooking['status'],
  token: string,
  meetingLink?: string
): Promise<CallBooking> {
  const updates: Partial<CallBooking> = { status };
  if (meetingLink) updates.meetingLink = meetingLink;
  return updateBooking(id, updates, token);
}

// ---------------------------------------------------------------------------
// PROJECT MESSAGES API
// ---------------------------------------------------------------------------
export async function fetchMessages(token: string, orderId?: string): Promise<ProjectMessage[]> {
  const url = orderId ? `/api/messages?orderId=${encodeURIComponent(orderId)}` : '/api/messages';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load messages');
  return await res.json();
}

export async function sendMessage(
  payload: {
    orderId: string;
    message: string;
    type?: 'general' | 'revision' | 'approval' | 'support';
    attachments?: string[];
  },
  token: string
): Promise<{ success: boolean; message: ProjectMessage }> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message');
  }
  return await res.json();
}

// ---------------------------------------------------------------------------
// ADMIN COMMAND CENTER API
// ---------------------------------------------------------------------------
export async function executeAdminCommand(
  payloadOrCommand:
    | string
    | {
        command?: string;
        confirmAction?: string;
        draft?: any;
        websiteId?: string;
      },
  token: string,
  confirmed?: boolean,
  extra?: any
): Promise<any> {
  const body =
    typeof payloadOrCommand === 'string'
      ? {
          command: payloadOrCommand,
          confirmAction: confirmed ? 'CONFIRMED' : undefined,
          draft: extra?.draft || extra,
          websiteId: extra?.websiteId || extra?.targetWebsite?.id,
        }
      : payloadOrCommand;

  const res = await fetch('/api/admin/command', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Command execution failed');
  }
  return await res.json();
}

