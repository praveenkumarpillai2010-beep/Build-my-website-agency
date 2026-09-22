import React, { useState, useEffect } from 'react';
import {
  X, LayoutDashboard, Globe, ShoppingBag, Users, CreditCard, MessageSquare,
  Settings, Plus, Edit, Trash2, Check, AlertCircle, ExternalLink, Eye, EyeOff,
  LogOut, Upload, Star, Send, ShieldAlert, CheckCircle, RefreshCw, Smartphone,
  Search, Tag, Code, DollarSign, Sparkles, Filter, ShieldCheck, UserCheck, Key,
  Terminal, PhoneCall
} from 'lucide-react';
import { RealWebsite, Order, OrderStatus, PaymentStatus, AgencySettings, RealTestimonial, WebsiteAvailabilityStatus } from '../types';
import {
  adminLogin, verifyAdmin, getStoredAdminToken, setStoredAdminToken,
  fetchWebsites, createWebsite, updateWebsite, quickUpdateWebsite, deleteWebsite,
  fetchOrders, updateOrderStatus, fetchSettings, updateSettings, uploadImage,
  fetchAdminUsers, grantAdminUser, revokeAdminUser, fetchAuditLogs
} from '../services/agencyApi';
import { useAuth } from '../context/AuthContext';
import { AdminCommandCenter } from './AdminCommandCenter';
import { AdminBookedCalls } from './AdminBookedCalls';

interface AdminDashboardModalProps {
  onClose: () => void;
  onDataChanged?: () => void;
}

type AdminTab = 'dashboard' | 'command-center' | 'websites' | 'orders' | 'calls' | 'customers' | 'payments' | 'settings' | 'security';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  onDataChanged,
}) => {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Core Data
  const [websites, setWebsites] = useState<RealWebsite[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AgencySettings | null>(null);

  // Modals & Editors
  const [editingWebsite, setEditingWebsite] = useState<Partial<RealWebsite> | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Form tag inputs
  const [featureTagInput, setFeatureTagInput] = useState('');
  const [techTagInput, setTechTagInput] = useState('');

  // Modals for Delete Confirmation & Quick Price
  const [websiteToDelete, setWebsiteToDelete] = useState<RealWebsite | null>(null);
  const [quickPriceTarget, setQuickPriceTarget] = useState<RealWebsite | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');

  // Catalog search & filter
  const [websiteFilterQuery, setWebsiteFilterQuery] = useState('');
  const [websiteFilterStatus, setWebsiteFilterStatus] = useState<string>('all');

  // Security & Admin Management State
  const { user, isAdmin, getIdToken, signInWithGoogle, logout: authLogout } = useAuth();
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [securityActionLoading, setSecurityActionLoading] = useState(false);
  const [auditFilterAction, setAuditFilterAction] = useState('all');

  // Auto-authenticate with Firebase ID token if user is recognized as server admin
  useEffect(() => {
    if (user && isAdmin && !adminToken) {
      getIdToken().then((token) => {
        if (token) {
          setAdminToken(token);
          setStoredAdminToken(token);
          loadAllData(token);
        }
      });
    }
  }, [user, isAdmin, adminToken, getIdToken]);

  // Initialize and verify admin session
  useEffect(() => {
    const token = getStoredAdminToken();
    if (token) {
      verifyAdmin(token).then((valid) => {
        if (valid) {
          setAdminToken(token);
          loadAllData(token);
        } else {
          setStoredAdminToken(null);
          setAdminToken(null);
        }
      });
    }
  }, []);

  const loadAllData = async (token: string) => {
    setLoading(true);
    try {
      const [wList, oList, sData, aUsers, aLogs] = await Promise.all([
        fetchWebsites(token),
        fetchOrders({ adminToken: token }),
        fetchSettings(),
        fetchAdminUsers(token).catch(() => []),
        fetchAuditLogs(token).catch(() => []),
      ]);
      setWebsites(wList);
      setOrders(oList);
      setSettings(sData);
      setAdminsList(aUsers);
      setAuditLogs(aLogs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setLoginError(null);
      const googleUser = await signInWithGoogle();
      if (!googleUser) return;
      const token = await googleUser.getIdToken(true);
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.isAdmin) {
        setAdminToken(token);
        setStoredAdminToken(token);
        await loadAllData(token);
        showSuccessBanner(`Welcome, Administrator ${googleUser.displayName || googleUser.email}!`);
      } else {
        setLoginError(
          `Signed in as ${googleUser.email}, but this account is not registered as an authorized administrator. Please use the master admin credentials or request access.`
        );
      }
    } catch (err: any) {
      setLoginError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setLoginError(null);
      const res = await adminLogin(passwordInput);
      setAdminToken(res.token);
      await loadAllData(res.token);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStoredAdminToken(null);
    setAdminToken(null);
    if (user) {
      authLogout();
    }
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !adminToken) return;
    try {
      setSecurityActionLoading(true);
      await grantAdminUser({ email: newAdminEmail.trim() }, adminToken);
      showSuccessBanner(`Admin privileges granted to ${newAdminEmail.trim()}`);
      setNewAdminEmail('');
      const updatedAdmins = await fetchAdminUsers(adminToken);
      setAdminsList(updatedAdmins);
      const updatedLogs = await fetchAuditLogs(adminToken);
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      alert(err.message || 'Failed to grant admin access');
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const handleRevokeAdmin = async (adminAccount: any) => {
    if (!adminToken) return;
    const confirmRevoke = window.confirm(`Are you sure you want to revoke admin access for ${adminAccount.email || adminAccount.uid}?`);
    if (!confirmRevoke) return;
    try {
      setSecurityActionLoading(true);
      await revokeAdminUser({ email: adminAccount.email, uid: adminAccount.uid }, adminToken);
      showSuccessBanner(`Admin privileges revoked for ${adminAccount.email || adminAccount.uid}`);
      const updatedAdmins = await fetchAdminUsers(adminToken);
      setAdminsList(updatedAdmins);
      const updatedLogs = await fetchAuditLogs(adminToken);
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke admin access');
    } finally {
      setSecurityActionLoading(false);
    }
  };

  const showSuccessBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // --- Website Management Handlers ---
  const openAddWebsiteModal = () => {
    setFormValidationError(null);
    setFeatureTagInput('');
    setTechTagInput('');
    setEditingWebsite({
      name: '',
      category: 'Business',
      shortDescription: '',
      description: '',
      price: 199,
      currency: 'USD',
      demoUrl: 'https://',
      liveUrl: 'https://',
      imageUrl: '',
      thumbnailUrl: '',
      features: ['Mobile Responsive Layout', 'Fast Loading Speed', 'WhatsApp Lead Integration', 'Contact Form', 'SSL Security'],
      technologies: ['React', 'Tailwind CSS', 'Next.js'],
      status: 'available',
      featured: false,
      published: true,
      displayOrder: websites.length + 1,
    });
  };

  const openEditWebsiteModal = (w: RealWebsite) => {
    setFormValidationError(null);
    setFeatureTagInput('');
    setTechTagInput('');
    const demo = w.demoUrl || w.liveUrl || '';
    const img = w.imageUrl || w.thumbnailUrl || '';
    setEditingWebsite({
      ...w,
      demoUrl: demo,
      liveUrl: demo,
      imageUrl: img,
      thumbnailUrl: img,
      shortDescription: w.shortDescription || w.description || '',
      description: w.description || w.shortDescription || '',
      currency: w.currency || 'USD',
      status: w.status || 'available',
      features: Array.isArray(w.features) ? [...w.features] : [],
      technologies: Array.isArray(w.technologies) ? [...w.technologies] : [],
    });
  };

  const handleAddFeatureTag = (tagToAdd?: string) => {
    const text = (tagToAdd !== undefined ? tagToAdd : featureTagInput).trim();
    if (!text || !editingWebsite) return;
    const current = editingWebsite.features || [];
    if (!current.includes(text)) {
      setEditingWebsite({
        ...editingWebsite,
        features: [...current, text],
      });
    }
    setFeatureTagInput('');
  };

  const handleRemoveFeatureTag = (tagToRemove: string) => {
    if (!editingWebsite) return;
    setEditingWebsite({
      ...editingWebsite,
      features: (editingWebsite.features || []).filter((f) => f !== tagToRemove),
    });
  };

  const handleAddTechTag = (tagToAdd?: string) => {
    const text = (tagToAdd !== undefined ? tagToAdd : techTagInput).trim();
    if (!text || !editingWebsite) return;
    const current = editingWebsite.technologies || [];
    if (!current.includes(text)) {
      setEditingWebsite({
        ...editingWebsite,
        technologies: [...current, text],
      });
    }
    setTechTagInput('');
  };

  const handleRemoveTechTag = (tagToRemove: string) => {
    if (!editingWebsite) return;
    setEditingWebsite({
      ...editingWebsite,
      technologies: (editingWebsite.technologies || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebsite || !adminToken) return;

    setFormValidationError(null);

    // 1. Validation
    const name = editingWebsite.name?.trim();
    if (!name) {
      setFormValidationError('Website Name is required.');
      return;
    }

    const demoUrl = (editingWebsite.demoUrl || editingWebsite.liveUrl || '').trim();
    if (!demoUrl) {
      setFormValidationError('Preview / Demo URL is required.');
      return;
    }

    try {
      const parsed = new URL(demoUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setFormValidationError('Preview / Demo URL must start with http:// or https://');
        return;
      }
    } catch {
      setFormValidationError('Please enter a valid Preview / Demo URL (e.g. https://clientpreview.com)');
      return;
    }

    const rawPrice = editingWebsite.price;
    const numPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice));
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormValidationError('Selling Price must be a valid positive number greater than 0.');
      return;
    }

    const category = (editingWebsite.category || 'Business').trim();
    const currency = (editingWebsite.currency || 'USD').toUpperCase().trim();
    const shortDesc = (editingWebsite.shortDescription || editingWebsite.description || '').trim();
    const fullDesc = (editingWebsite.description || shortDesc || '').trim();
    const image = (editingWebsite.imageUrl || editingWebsite.thumbnailUrl || '').trim();
    const status = editingWebsite.status || 'available';

    const payload: Partial<RealWebsite> = {
      ...editingWebsite,
      name,
      category,
      shortDescription: shortDesc,
      description: fullDesc,
      price: Math.round(numPrice * 100) / 100,
      currency,
      demoUrl,
      liveUrl: demoUrl,
      imageUrl: image,
      thumbnailUrl: image,
      features: editingWebsite.features || [],
      technologies: editingWebsite.technologies || [],
      status,
      featured: Boolean(editingWebsite.featured),
      published: editingWebsite.published !== false,
      displayOrder: typeof editingWebsite.displayOrder === 'number' ? editingWebsite.displayOrder : (websites.length + 1),
    };

    try {
      setLoading(true);
      if (editingWebsite.id) {
        await updateWebsite(editingWebsite.id, payload, adminToken);
        showSuccessBanner(`Website "${name}" updated successfully!`);
      } else {
        await createWebsite(payload, adminToken);
        showSuccessBanner(`New website "${name}" saved to Firestore & catalog!`);
      }
      setEditingWebsite(null);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      setFormValidationError(err.message || 'Failed to save website');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (website: RealWebsite, newStatus: WebsiteAvailabilityStatus) => {
    if (!adminToken) return;
    try {
      await quickUpdateWebsite(website.id, { status: newStatus }, adminToken);
      showSuccessBanner(`Availability status for "${website.name}" updated to ${newStatus}`);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleQuickFeaturedToggle = async (website: RealWebsite) => {
    if (!adminToken) return;
    try {
      const nextFeatured = !website.featured;
      await quickUpdateWebsite(website.id, { featured: nextFeatured }, adminToken);
      showSuccessBanner(`${nextFeatured ? 'Marked' : 'Removed'} "${website.name}" as featured`);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured status');
    }
  };

  const handleTogglePublish = async (website: RealWebsite) => {
    if (!adminToken) return;
    try {
      const nextPublished = !website.published;
      await quickUpdateWebsite(website.id, { published: nextPublished }, adminToken);
      showSuccessBanner(`Website "${website.name}" is now ${nextPublished ? 'publicly visible' : 'hidden'}`);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication');
    }
  };

  const handleOpenQuickPrice = (website: RealWebsite) => {
    setQuickPriceTarget(website);
    setQuickPriceValue(String(website.price));
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceTarget || !adminToken) return;
    const p = parseFloat(quickPriceValue);
    if (isNaN(p) || p <= 0) {
      alert('Selling price must be a valid positive number');
      return;
    }
    try {
      setLoading(true);
      await quickUpdateWebsite(quickPriceTarget.id, { price: Math.round(p * 100) / 100 }, adminToken);
      showSuccessBanner(`Updated price of "${quickPriceTarget.name}" to $${p} ${quickPriceTarget.currency || 'USD'}`);
      setQuickPriceTarget(null);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = (website: RealWebsite) => {
    setWebsiteToDelete(website);
  };

  const handleConfirmDelete = async () => {
    if (!websiteToDelete || !adminToken) return;
    try {
      setLoading(true);
      await deleteWebsite(websiteToDelete.id, adminToken);
      showSuccessBanner(`Permanently deleted "${websiteToDelete.name}" from catalog and Firestore`);
      setWebsiteToDelete(null);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to delete website');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await uploadImage(reader.result as string, file.name);
          setEditingWebsite((prev) => prev ? { ...prev, thumbnailUrl: res.url, imageUrl: res.url } : null);
        } catch (err: any) {
          alert('Upload failed: ' + err.message);
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingImage(false);
    }
  };

  // --- Order Status Update Handler ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, extra?: any) => {
    if (!adminToken) return;
    try {
      const updated = await updateOrderStatus(orderId, status, adminToken, extra);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrderForDetails?.id === orderId) {
        setSelectedOrderForDetails(updated);
      }
      showSuccessBanner(`Order #${orderId} status set to ${status}`);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // --- Settings Update Handler ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !adminToken) return;
    try {
      setLoading(true);
      const updated = await updateSettings(settings, adminToken);
      setSettings(updated);
      showSuccessBanner('Settings saved successfully!');
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalOrdersCount = orders.length;
  const activeWebsitesCount = websites.filter((w) => w.published).length;
  const pendingRequirementsCount = orders.filter((o) => !o.requirements?.submittedAt).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#0a0d16] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1322] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-extrabold text-xs text-white">BMW</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Agency Admin Control Center</span>
                {adminToken && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && (
              <>
                <button
                  onClick={() => loadAllData(adminToken)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="px-6 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Content Body */}
        {!adminToken ? (
          /* Admin Login Gate */
          <div className="p-8 sm:p-16 max-w-md mx-auto space-y-6 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Admin Authorization</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Authenticate with your authorized Google Account or enter master administrator credentials.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {loginError}
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Verifying with Server...' : 'Sign In with Google (Admin)'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Or Master Password
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                placeholder="Enter master admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Unlock with Password'}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard Interface */
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-60 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0d111d] p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('command-center')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'command-center' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Terminal className="w-4 h-4 text-purple-300" />
                <span>Command Center</span>
              </button>

              <button
                onClick={() => setActiveTab('websites')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between whitespace-nowrap ${
                  activeTab === 'websites' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4" />
                  <span>Websites</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/15 text-white font-mono">
                  {websites.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between whitespace-nowrap ${
                  activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/15 text-white font-mono">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('calls')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'calls' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Booked Calls</span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'customers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'payments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payments</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === 'security' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admins & Security</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
              {/* TAB 1: DASHBOARD METRICS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Agency Executive Overview</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Live operational stats calculated strictly from real database records.</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                        ${totalRevenue} <span className="text-xs font-normal text-slate-400">USD</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Verified customer payments</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Orders</span>
                      <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
                        {totalOrdersCount}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Client projects created</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Published Sites</span>
                      <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-2">
                        {activeWebsitesCount}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Out of {websites.length} total added</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Requirements</span>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
                        {pendingRequirementsCount}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Awaiting client assets</div>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white">Add a Real Website You've Built</h4>
                      <p className="text-xs text-slate-300">Upload your thumbnail, add the real live URL, and publish it instantly to your catalog.</p>
                    </div>

                    <button
                      onClick={() => {
                        openAddWebsiteModal();
                        setActiveTab('websites');
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-blue-600/25"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Website</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: COMMAND CENTER (Requirement 4) */}
              {activeTab === 'command-center' && (
                <AdminCommandCenter
                  adminToken={adminToken}
                  onDataChanged={() => {
                    loadAllData(adminToken);
                    onDataChanged?.();
                  }}
                />
              )}

              {/* TAB: BOOKED CALLS (Requirement 7) */}
              {activeTab === 'calls' && (
                <AdminBookedCalls adminToken={adminToken} />
              )}

              {/* TAB 2: WEBSITES MANAGEMENT */}
              {activeTab === 'websites' && (
                <div className="space-y-6">
                  {/* Header & Primary Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span>Real Websites Catalog</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Add, edit, price, or manage availability for websites for sale. All data persists directly to Firestore.
                      </p>
                    </div>

                    <button
                      onClick={openAddWebsiteModal}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Website</span>
                    </button>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search websites by name, category, or features..."
                        value={websiteFilterQuery}
                        onChange={(e) => setWebsiteFilterQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <select
                        value={websiteFilterStatus}
                        onChange={(e) => setWebsiteFilterStatus(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="all" className="bg-[#0e1322]">All Statuses ({websites.length})</option>
                        <option value="available" className="bg-[#0e1322]">Available ({websites.filter(w => w.status === 'available' || (!w.status && w.published)).length})</option>
                        <option value="reserved" className="bg-[#0e1322]">Reserved ({websites.filter(w => w.status === 'reserved').length})</option>
                        <option value="sold" className="bg-[#0e1322]">Sold ({websites.filter(w => w.status === 'sold').length})</option>
                        <option value="in_development" className="bg-[#0e1322]">In Development ({websites.filter(w => w.status === 'in_development').length})</option>
                      </select>
                    </div>
                  </div>

                  {/* Add / Edit Website Form Modal */}
                  {editingWebsite && (
                    <div className="p-6 rounded-2xl bg-[#0e1322] border border-blue-500/40 space-y-6 shadow-2xl animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {editingWebsite.id ? 'EDIT WEBSITE' : 'NEW WEBSITE'}
                            </span>
                            <h4 className="text-base font-bold text-white">
                              {editingWebsite.id ? `Edit "${editingWebsite.name}"` : 'Add New Website for Sale'}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Fill in all required fields. Clicking Save will validate and persist changes directly to Firestore.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingWebsite(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {formValidationError && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                          <span>{formValidationError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSaveWebsite} className="space-y-5">
                        {/* 1. Website Name & Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Website Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Apex Strategic Partners"
                              value={editingWebsite.name || ''}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Category *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Business, Restaurant, Hotel, Real Estate, SaaS"
                              value={editingWebsite.category || ''}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, category: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            {/* Quick category presets */}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['Business', 'Restaurant', 'Hotel', 'Real Estate', 'E-commerce', 'Portfolio', 'Medical'].map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setEditingWebsite({ ...editingWebsite, category: cat })}
                                  className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/5 transition-colors"
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 2. Selling Price, Currency, & Availability Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Selling Price *
                            </label>
                            <div className="relative">
                              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                required
                                min={1}
                                step={1}
                                placeholder="199"
                                value={editingWebsite.price ?? 199}
                                onChange={(e) => setEditingWebsite({ ...editingWebsite, price: Number(e.target.value) })}
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Currency *
                            </label>
                            <select
                              value={editingWebsite.currency || 'USD'}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, currency: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="USD" className="bg-[#0e1322]">USD ($)</option>
                              <option value="EUR" className="bg-[#0e1322]">EUR (€)</option>
                              <option value="GBP" className="bg-[#0e1322]">GBP (£)</option>
                              <option value="INR" className="bg-[#0e1322]">INR (₹)</option>
                              <option value="CAD" className="bg-[#0e1322]">CAD ($)</option>
                              <option value="AUD" className="bg-[#0e1322]">AUD ($)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Availability Status *
                            </label>
                            <select
                              value={editingWebsite.status || 'available'}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, status: e.target.value as WebsiteAvailabilityStatus })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 font-semibold"
                            >
                              <option value="available" className="bg-[#0e1322] text-emerald-400">Available for Sale</option>
                              <option value="reserved" className="bg-[#0e1322] text-amber-400">Reserved / In Negotiation</option>
                              <option value="sold" className="bg-[#0e1322] text-red-400">Sold / Out of Stock</option>
                              <option value="in_development" className="bg-[#0e1322] text-purple-400">In Development / Preview</option>
                            </select>
                          </div>
                        </div>

                        {/* 3. Preview/Demo URL & Thumbnail/Image URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Preview / Demo URL *
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                required
                                placeholder="https://preview.clientwebsite.com"
                                value={editingWebsite.demoUrl || editingWebsite.liveUrl || ''}
                                onChange={(e) =>
                                  setEditingWebsite({
                                    ...editingWebsite,
                                    demoUrl: e.target.value,
                                    liveUrl: e.target.value,
                                  })
                                }
                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                              />
                              {(editingWebsite.demoUrl || editingWebsite.liveUrl) && (
                                <a
                                  href={editingWebsite.demoUrl || editingWebsite.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-blue-400 border border-white/10 transition-colors"
                                  title="Test Preview URL"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Website Thumbnail / Image URL
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="https://images.unsplash.com/... or upload"
                                value={editingWebsite.imageUrl || editingWebsite.thumbnailUrl || ''}
                                onChange={(e) =>
                                  setEditingWebsite({
                                    ...editingWebsite,
                                    imageUrl: e.target.value,
                                    thumbnailUrl: e.target.value,
                                  })
                                }
                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                              />
                              <label className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Thumbnail Preview Box */}
                        {(editingWebsite.imageUrl || editingWebsite.thumbnailUrl) && (
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
                            <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-slate-900">
                              <img
                                src={editingWebsite.imageUrl || editingWebsite.thumbnailUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="text-xs text-slate-400">
                              <span className="font-semibold text-slate-200">Thumbnail Preview</span>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                                {editingWebsite.imageUrl || editingWebsite.thumbnailUrl}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 4. Short Description & Full Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Short Description * (Used on catalog cards)
                            </label>
                            <textarea
                              rows={3}
                              required
                              placeholder="Concise 1-2 sentence overview of this website..."
                              value={editingWebsite.shortDescription || editingWebsite.description || ''}
                              onChange={(e) =>
                                setEditingWebsite({
                                  ...editingWebsite,
                                  shortDescription: e.target.value,
                                  description: editingWebsite.description || e.target.value,
                                })
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Full Description (Detailed deliverables & layout)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Detailed breakdown of pages, conversion elements, and target audience..."
                              value={editingWebsite.description || editingWebsite.shortDescription || ''}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, description: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* 5. Features Tag Manager */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              <span>Features List ({editingWebsite.features?.length || 0})</span>
                            </label>
                            <span className="text-[11px] text-slate-500">Press Enter or click Add</span>
                          </div>

                          {/* Chips */}
                          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                            {(editingWebsite.features || []).map((feat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-blue-500/15 border border-blue-500/30 text-blue-300"
                              >
                                <span>{feat}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeatureTag(feat)}
                                  className="hover:text-white p-0.5 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Type a feature and press Enter (e.g. Real-Time Booking Engine)..."
                              value={featureTagInput}
                              onChange={(e) => setFeatureTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddFeatureTag();
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddFeatureTag()}
                              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
                            >
                              Add
                            </button>
                          </div>

                          {/* Suggestions */}
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] text-slate-500 mr-1">Suggestions:</span>
                            {['Mobile Responsive', 'WhatsApp Integration', 'Contact Form', 'SEO Ready', 'Fast 95+ Speed', 'SSL Certificate', 'Payment Gateway'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleAddFeatureTag(s)}
                                className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 6. Technologies Tag Manager */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <Code className="w-3.5 h-3.5 text-purple-400" />
                              <span>Technologies ({editingWebsite.technologies?.length || 0})</span>
                            </label>
                            <span className="text-[11px] text-slate-500">Press Enter or click Add</span>
                          </div>

                          {/* Chips */}
                          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                            {(editingWebsite.technologies || []).map((tech, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300"
                              >
                                <span>{tech}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTechTag(tech)}
                                  className="hover:text-white p-0.5 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Input */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Type a technology (e.g. Next.js, Stripe)..."
                              value={techTagInput}
                              onChange={(e) => setTechTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTechTag();
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddTechTag()}
                              className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
                            >
                              Add
                            </button>
                          </div>

                          {/* Suggestions */}
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] text-slate-500 mr-1">Suggestions:</span>
                            {['React', 'Tailwind CSS', 'Next.js', 'TypeScript', 'Node.js', 'Stripe', 'HTML5/CSS3'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleAddTechTag(s)}
                                className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 7. Featured Toggle, Public Visibility, & Display Order */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                          <label className="flex items-center gap-3 text-xs font-semibold text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editingWebsite.featured)}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, featured: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600 bg-white/5 border-white/20 focus:ring-0"
                            />
                            <span className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-400" />
                              <span>Featured on Homepage</span>
                            </span>
                          </label>

                          <label className="flex items-center gap-3 text-xs font-semibold text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingWebsite.published !== false}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, published: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600 bg-white/5 border-white/20 focus:ring-0"
                            />
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Publicly Visible</span>
                            </span>
                          </label>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Order:</span>
                            <input
                              type="number"
                              value={editingWebsite.displayOrder ?? 1}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, displayOrder: Number(e.target.value) })}
                              className="w-20 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setEditingWebsite(null)}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                          >
                            {loading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>{editingWebsite.id ? 'Save Changes' : 'Save Website to Catalog'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Websites Table / Cards */}
                  {websites.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                      <Globe className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                      <h4 className="text-base font-bold text-white">No websites added yet</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Click "Add New Website" above to list real websites for sale with instant Firestore persistence.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {websites
                        .filter((w) => {
                          const q = websiteFilterQuery.toLowerCase();
                          const matchesQ =
                            !q ||
                            w.name.toLowerCase().includes(q) ||
                            w.category.toLowerCase().includes(q) ||
                            (w.features && w.features.some((f) => f.toLowerCase().includes(q))) ||
                            (w.technologies && w.technologies.some((t) => t.toLowerCase().includes(q)));
                          const matchesStatus =
                            websiteFilterStatus === 'all' || w.status === websiteFilterStatus;
                          return matchesQ && matchesStatus;
                        })
                        .map((w) => {
                          const status = w.status || 'available';
                          const statusColors = {
                            available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                            reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                            sold: 'bg-red-500/10 text-red-400 border-red-500/30',
                            in_development: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                          }[status] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';

                          return (
                            <div
                              key={w.id}
                              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
                            >
                              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                {/* Thumbnail */}
                                <div className="w-20 h-14 rounded-xl bg-slate-900 overflow-hidden border border-white/10 shrink-0 relative">
                                  {w.imageUrl || w.thumbnailUrl ? (
                                    <img
                                      src={w.imageUrl || w.thumbnailUrl}
                                      alt={w.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 bg-slate-800">
                                      No Image
                                    </div>
                                  )}
                                  {w.featured && (
                                    <div className="absolute top-1 left-1 p-0.5 rounded bg-amber-500 text-slate-950 shadow">
                                      <Star className="w-2.5 h-2.5 fill-current" />
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-white truncate">{w.name}</span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                                      {w.category}
                                    </span>
                                    {/* Availability Status Badge */}
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusColors}`}>
                                      {status.replace('_', ' ')}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                    {w.shortDescription || w.description}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]">
                                    <a
                                      href={w.demoUrl || w.liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 underline underline-offset-2"
                                    >
                                      <span>{w.demoUrl || w.liveUrl}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>

                                    {w.technologies && w.technologies.length > 0 && (
                                      <span className="text-slate-500 flex items-center gap-1">
                                        <Code className="w-3 h-3" />
                                        <span>{w.technologies.slice(0, 3).join(', ')}{w.technologies.length > 3 ? ` +${w.technologies.length - 3}` : ''}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Controls: Price, Status quick select, Actions */}
                              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                                {/* Price with quick edit trigger */}
                                <div className="text-left lg:text-right">
                                  <button
                                    onClick={() => handleOpenQuickPrice(w)}
                                    className="text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center lg:justify-end gap-1 group/price"
                                    title="Click to quickly change price"
                                  >
                                    <span>${w.price} {w.currency || 'USD'}</span>
                                    <Edit className="w-3 h-3 opacity-0 group-hover/price:opacity-100 text-slate-400" />
                                  </button>
                                  <div className="text-[10px] text-slate-500">Order: {w.displayOrder || 1}</div>
                                </div>

                                {/* Quick Status Selector */}
                                <select
                                  value={w.status || 'available'}
                                  onChange={(e) => handleQuickStatusChange(w, e.target.value as WebsiteAvailabilityStatus)}
                                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="available" className="bg-[#0e1322]">Available</option>
                                  <option value="reserved" className="bg-[#0e1322]">Reserved</option>
                                  <option value="sold" className="bg-[#0e1322]">Sold</option>
                                  <option value="in_development" className="bg-[#0e1322]">In Development</option>
                                </select>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1">
                                  {/* Featured Star Toggle */}
                                  <button
                                    onClick={() => handleQuickFeaturedToggle(w)}
                                    className={`p-2 rounded-xl text-xs transition-colors ${
                                      w.featured
                                        ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                                        : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'
                                    }`}
                                    title={w.featured ? 'Featured on Homepage (click to remove)' : 'Feature on Homepage (click to star)'}
                                  >
                                    <Star className={`w-4 h-4 ${w.featured ? 'fill-current' : ''}`} />
                                  </button>

                                  {/* Public Visibility Toggle */}
                                  <button
                                    onClick={() => handleTogglePublish(w)}
                                    className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                                      w.published !== false
                                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                                        : 'text-slate-500 hover:bg-white/5'
                                    }`}
                                    title={w.published !== false ? 'Published (Click to hide)' : 'Hidden (Click to publish)'}
                                  >
                                    {w.published !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>

                                  {/* Full Edit Modal */}
                                  <button
                                    onClick={() => openEditWebsiteModal(w)}
                                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Edit Website"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  {/* Delete Website Confirmation */}
                                  <button
                                    onClick={() => handleDeleteWebsite(w)}
                                    className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                    title="Delete Website"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Confirmation Modal: Delete Website */}
                  {websiteToDelete && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f1423] border border-red-500/30 space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-red-400">
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">Delete Website?</h4>
                            <p className="text-xs text-slate-400">This action is permanent and cannot be undone.</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 space-y-1">
                          <div className="font-bold text-white">{websiteToDelete.name}</div>
                          <div className="text-slate-400 font-mono text-[11px] truncate">{websiteToDelete.demoUrl || websiteToDelete.liveUrl}</div>
                          <div className="text-emerald-400 font-semibold">${websiteToDelete.price} {websiteToDelete.currency || 'USD'}</div>
                        </div>

                        <p className="text-xs text-slate-400">
                          Are you sure you want to permanently delete this website from the public catalog and Firestore database?
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setWebsiteToDelete(null)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleConfirmDelete}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
                          >
                            {loading ? 'Deleting...' : 'Permanently Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal: Quick Change Price */}
                  {quickPriceTarget && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0f1423] border border-blue-500/30 space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h4 className="text-sm font-bold text-white">Quick Price Change</h4>
                          <button
                            onClick={() => setQuickPriceTarget(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-400">
                          Update selling price for <span className="text-white font-semibold">{quickPriceTarget.name}</span>. The checkout system will immediately enforce this price.
                        </div>

                        <form onSubmit={handleSaveQuickPrice} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              New Price ({quickPriceTarget.currency || 'USD'})
                            </label>
                            <div className="relative">
                              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                required
                                min={1}
                                step={1}
                                value={quickPriceValue}
                                onChange={(e) => setQuickPriceValue(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setQuickPriceTarget(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
                            >
                              {loading ? 'Saving...' : 'Update Price'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Client Orders & Project Tracker</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Inspect client orders, review submitted assets, update milestones, and manage staging links.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                      <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-white">No orders yet</h4>
                      <p className="text-xs text-slate-400 mt-1">When visitors purchase a website or package, orders appear here automatically.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-white">#{ord.id}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  {ord.paymentStatus} (${ord.amount} {ord.currency})
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                  {ord.orderStatus}
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-white mt-1">{ord.websiteName}</h4>
                            </div>

                            <div className="text-xs text-slate-400">
                              Ordered {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Customer Details Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-slate-400 font-semibold block">Customer Name</span>
                              <span className="text-white font-medium">{ord.customerName}</span>
                              {ord.businessName && <span className="text-slate-400 block text-[11px]">({ord.businessName})</span>}
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-slate-400 font-semibold block">Contact Email</span>
                              <a href={`mailto:${ord.customerEmail}`} className="text-blue-400 hover:underline">
                                {ord.customerEmail}
                              </a>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                              <div>
                                <span className="text-slate-400 font-semibold block">WhatsApp / Phone</span>
                                <span className="text-white">{ord.customerPhone}</span>
                              </div>
                              <a
                                href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(ord.customerName)},%20this%20is%20Build%20My%20Website%20regarding%20Order%20%23${ord.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                title="Chat on WhatsApp"
                              >
                                <Smartphone className="w-4 h-4" />
                              </a>
                            </div>
                          </div>

                          {/* Requirements Inspection */}
                          {ord.requirements?.submittedAt ? (
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2 text-xs">
                              <div className="flex items-center justify-between text-blue-300 font-semibold">
                                <span>Customer Assets Submitted: {ord.requirements.businessName}</span>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(ord.requirements.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-300">{ord.requirements.businessDescription}</p>
                              {ord.requirements.logoUrl && (
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="text-slate-400">Logo:</span>
                                  <a href={ord.requirements.logoUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline truncate max-w-sm">
                                    {ord.requirements.logoUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Requirements pending from customer.</span>
                            </div>
                          )}

                          {/* Order Actions: Change Status & Staging Preview URL */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-semibold">Status:</span>
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none"
                              >
                                <option value="Payment Confirmed" className="bg-[#0e1322]">Payment Confirmed</option>
                                <option value="Requirements Needed" className="bg-[#0e1322]">Requirements Needed</option>
                                <option value="Requirements Received" className="bg-[#0e1322]">Requirements Received</option>
                                <option value="In Progress" className="bg-[#0e1322]">In Progress (Development)</option>
                                <option value="Preview Ready" className="bg-[#0e1322]">Preview Ready</option>
                                <option value="Client Review" className="bg-[#0e1322]">Client Review</option>
                                <option value="Revisions" className="bg-[#0e1322]">Revisions</option>
                                <option value="Completed" className="bg-[#0e1322]">Completed (Launched)</option>
                                <option value="Cancelled" className="bg-[#0e1322]">Cancelled</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const url = prompt('Enter live staging/preview URL for customer review:', ord.previewUrl || '');
                                  if (url !== null) {
                                    handleUpdateOrderStatus(ord.id, ord.orderStatus === 'In Progress' ? 'Preview Ready' : ord.orderStatus, { previewUrl: url });
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-1.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{ord.previewUrl ? 'Edit Preview Link' : 'Set Preview Link'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  const url = prompt('Enter final deployed live website URL (e.g. https://apexlaw.com):', ord.finalWebsiteUrl || '');
                                  if (url !== null) {
                                    handleUpdateOrderStatus(ord.id, 'Completed', { finalWebsiteUrl: url });
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-1.5"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>{ord.finalWebsiteUrl ? 'Edit Final URL' : 'Set Final Live URL'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CUSTOMERS DIRECTORY */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Customer Records</h3>
                    <p className="text-xs sm:text-sm text-slate-400">All registered clients from verified orders.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                      <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-white">No customer records yet</h4>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300 border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 uppercase font-semibold text-[11px]">
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Contact Email</th>
                            <th className="py-3 px-4">Phone / WhatsApp</th>
                            <th className="py-3 px-4">Business</th>
                            <th className="py-3 px-4">Orders</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-4 font-bold text-white">{ord.customerName}</td>
                              <td className="py-3 px-4">{ord.customerEmail}</td>
                              <td className="py-3 px-4">{ord.customerPhone}</td>
                              <td className="py-3 px-4">{ord.businessName || '—'}</td>
                              <td className="py-3 px-4 font-mono text-emerald-400">${ord.amount} USD</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PAYMENTS LOG */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Payment Transactions</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Auditable transaction history processed through server verification.</p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                      <CreditCard className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-white">No payment transactions yet</h4>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>${o.amount} {o.currency}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                {o.paymentStatus}
                              </span>
                            </div>
                            <div className="text-slate-400 mt-1">
                              Order #{o.id} • {o.customerName} ({o.customerEmail})
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-400 font-mono text-[11px] block">
                              Provider: {o.paymentProvider || 'Direct Server'}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              {new Date(o.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SETTINGS & STATS & TESTIMONIALS */}
              {activeTab === 'settings' && settings && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Agency & Platform Settings</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Control real verified stats, WhatsApp contact details, and payment providers.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    {/* Contact Config */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <h4 className="text-sm font-bold text-white">Contact & Support Channels</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            WhatsApp Number (No '+' or spaces)
                          </label>
                          <input
                            type="text"
                            value={settings.whatsappNumber || ''}
                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Display Phone
                          </label>
                          <input
                            type="text"
                            value={settings.displayPhone || ''}
                            onChange={(e) => setSettings({ ...settings, displayPhone: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Verified Real Statistics Switch */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">Verified Agency Statistics</h4>
                          <p className="text-xs text-slate-400">
                            As requested: keep statistics hidden unless you enter real verified counts.
                          </p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.showStats)}
                            onChange={(e) => setSettings({ ...settings, showStats: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          <span className="text-xs font-semibold text-white">Show Stats Strip</span>
                        </label>
                      </div>

                      {settings.showStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Websites Built Count</label>
                            <input
                              type="text"
                              placeholder="e.g. 24"
                              value={settings.statsWebsitesCount || ''}
                              onChange={(e) => setSettings({ ...settings, statsWebsitesCount: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Clients Served Count</label>
                            <input
                              type="text"
                              placeholder="e.g. 18"
                              value={settings.statsClientsCount || ''}
                              onChange={(e) => setSettings({ ...settings, statsClientsCount: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
                    >
                      Save Platform Settings
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: ADMINS & SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Admins & Access Control</h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        Server-authoritative role-based access control with Firebase Admin custom claims and immutable audit trail.
                      </p>
                    </div>

                    <button
                      onClick={() => loadAllData(adminToken)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 flex items-center gap-1.5 self-start"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Security Data</span>
                    </button>
                  </div>

                  {/* Active Admin Identity Badge */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Current Admin Session</div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{user?.email || 'Master Administrator'}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified Admin Claim
                          </span>
                        </div>
                        {user?.uid && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            UID: {user.uid}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Authorized Administrators */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Authorized Administrators</h4>
                        <p className="text-xs text-slate-400">Accounts with server-validated administrative privileges</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/[0.05] text-slate-300">
                        {adminsList.length} Active {adminsList.length === 1 ? 'Admin' : 'Admins'}
                      </span>
                    </div>

                    <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden">
                      {adminsList.map((adm, idx) => (
                        <div key={adm.uid || adm.email || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-300">
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                                <span>{adm.email || adm.uid}</span>
                                {adm.role === 'primary_admin' && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Primary Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Granted on {new Date(adm.createdAt || Date.now()).toLocaleDateString()}
                                {adm.grantedBy ? ` by ${adm.grantedBy}` : ''}
                              </div>
                            </div>
                          </div>

                          {adm.role !== 'primary_admin' && (
                            <button
                              onClick={() => handleRevokeAdmin(adm)}
                              disabled={securityActionLoading}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors self-start sm:self-auto disabled:opacity-50"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Grant New Admin Form */}
                    <form onSubmit={handleGrantAdmin} className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="email"
                        required
                        placeholder="Enter Google account email to grant admin..."
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={securityActionLoading || !newAdminEmail.trim()}
                        className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{securityActionLoading ? 'Granting...' : 'Grant Admin Access'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Section 2: Security Audit Trail */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">Security & Action Audit Log</h4>
                        <p className="text-xs text-slate-400">Chronological ledger of security and data mutations</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={auditFilterAction}
                          onChange={(e) => setAuditFilterAction(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
                        >
                          <option value="all" className="bg-[#0a0d16]">All Actions</option>
                          <option value="WEBSITE_CREATED" className="bg-[#0a0d16]">Website Created</option>
                          <option value="WEBSITE_UPDATED" className="bg-[#0a0d16]">Website Updated</option>
                          <option value="WEBSITE_DELETED" className="bg-[#0a0d16]">Website Deleted</option>
                          <option value="ADMIN_GRANTED" className="bg-[#0a0d16]">Admin Granted</option>
                          <option value="ADMIN_REVOKED" className="bg-[#0a0d16]">Admin Revoked</option>
                          <option value="ORDER_STATUS_CHANGED" className="bg-[#0a0d16]">Order Status</option>
                        </select>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl">
                      {auditLogs
                        .filter((log) => auditFilterAction === 'all' || log.action === auditFilterAction)
                        .slice(0, 50)
                        .map((log, idx) => (
                          <div key={log.id || idx} className="p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02]">
                            <div className="flex items-start sm:items-center gap-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                log.action.includes('DELETED') || log.action.includes('REVOKED')
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : log.action.includes('GRANTED') || log.action.includes('CREATED')
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {log.action}
                              </span>
                              <div>
                                <span className="text-white font-medium">{log.actorEmail || 'Admin'}</span>
                                {log.targetId && (
                                  <span className="text-slate-400 text-[11px] ml-1.5 font-mono">
                                    target: {log.targetId}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-slate-500 text-[11px] font-mono shrink-0">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}

                      {auditLogs.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No audit events recorded yet. Administrative actions will automatically populate here.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
