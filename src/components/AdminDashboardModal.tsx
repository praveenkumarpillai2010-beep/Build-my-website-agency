import React, { useState, useEffect } from 'react';
import {
  X, LayoutDashboard, Globe, ShoppingBag, Users, CreditCard, MessageSquare,
  Settings, Plus, Edit, Trash2, Check, AlertCircle, ExternalLink, Eye, EyeOff,
  LogOut, Upload, Star, Send, ShieldAlert, CheckCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { RealWebsite, Order, OrderStatus, PaymentStatus, AgencySettings, RealTestimonial } from '../types';
import {
  adminLogin, verifyAdmin, getStoredAdminToken, setStoredAdminToken,
  fetchWebsites, createWebsite, updateWebsite, deleteWebsite,
  fetchOrders, updateOrderStatus, fetchSettings, updateSettings, uploadImage
} from '../services/agencyApi';

interface AdminDashboardModalProps {
  onClose: () => void;
  onDataChanged?: () => void;
}

type AdminTab = 'dashboard' | 'websites' | 'orders' | 'customers' | 'payments' | 'settings';

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
      const [wList, oList, sData] = await Promise.all([
        fetchWebsites(token),
        fetchOrders({ adminToken: token }),
        fetchSettings(),
      ]);
      setWebsites(wList);
      setOrders(oList);
      setSettings(sData);
    } catch (err) {
      console.error('Error loading admin data:', err);
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
  };

  const showSuccessBanner = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // --- Website Management Handlers ---
  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebsite || !adminToken) return;

    try {
      setLoading(true);
      if (editingWebsite.id) {
        await updateWebsite(editingWebsite.id, editingWebsite, adminToken);
        showSuccessBanner(`Updated website "${editingWebsite.name}"`);
      } else {
        await createWebsite(editingWebsite, adminToken);
        showSuccessBanner(`Created new website "${editingWebsite.name}"`);
      }
      setEditingWebsite(null);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to save website');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = async (id: string, name: string) => {
    if (!adminToken) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      setLoading(true);
      await deleteWebsite(id, adminToken);
      showSuccessBanner(`Deleted "${name}"`);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to delete website');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (website: RealWebsite) => {
    if (!adminToken) return;
    try {
      await updateWebsite(website.id, { published: !website.published }, adminToken);
      await loadAllData(adminToken);
      onDataChanged?.();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication');
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
          setEditingWebsite((prev) => prev ? { ...prev, thumbnailUrl: res.url } : null);
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
              <h3 className="text-2xl font-black text-white tracking-tight">Admin Authentication</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Enter your agency master password to access website management, orders, customer records, and settings.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                placeholder="Enter admin password (default: admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Unlock Admin Dashboard'}
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
                        setEditingWebsite({
                          name: '',
                          category: 'Business',
                          description: '',
                          price: 199,
                          currency: 'USD',
                          liveUrl: 'https://',
                          thumbnailUrl: '',
                          features: ['Responsive Design', 'Speed Optimized', 'WhatsApp Integration'],
                          featured: false,
                          published: true,
                          displayOrder: websites.length + 1,
                        });
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

              {/* TAB 2: WEBSITES MANAGEMENT */}
              {activeTab === 'websites' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Real Websites Catalog</h3>
                      <p className="text-xs sm:text-sm text-slate-400">Add, edit, reorder, or publish real websites created by your agency.</p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingWebsite({
                          name: '',
                          category: 'Business',
                          description: '',
                          price: 199,
                          currency: 'USD',
                          liveUrl: 'https://',
                          thumbnailUrl: '',
                          features: ['Responsive Layout', 'WhatsApp Contact', 'Fast Load Time'],
                          featured: false,
                          published: true,
                          displayOrder: websites.length + 1,
                        })
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Website</span>
                    </button>
                  </div>

                  {/* Add / Edit Website Form Modal */}
                  {editingWebsite && (
                    <div className="p-6 rounded-2xl bg-[#0e1322] border border-blue-500/40 space-y-6 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-base font-bold text-white">
                          {editingWebsite.id ? `Edit "${editingWebsite.name}"` : 'Add New Real Website'}
                        </h4>
                        <button
                          onClick={() => setEditingWebsite(null)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveWebsite} className="space-y-4">
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
                              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Category / Business Type *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Business, Restaurant, Hotel, E-commerce, Medical"
                              value={editingWebsite.category || ''}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, category: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Live URL & Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Real Live Website URL *
                            </label>
                            <input
                              type="url"
                              required
                              placeholder="https://clientwebsite.com"
                              value={editingWebsite.liveUrl || ''}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, liveUrl: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Price in USD *
                            </label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={editingWebsite.price || 199}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, price: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Thumbnail Upload or URL */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Thumbnail / Preview Image (Upload or URL)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="https://example.com/image.jpg"
                              value={editingWebsite.thumbnailUrl || ''}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, thumbnailUrl: e.target.value })}
                              className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <label className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5 shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                              <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Short Description *
                          </label>
                          <textarea
                            rows={2}
                            required
                            placeholder="Concise overview of what this website delivers..."
                            value={editingWebsite.description || ''}
                            onChange={(e) => setEditingWebsite({ ...editingWebsite, description: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Featured, Published, Display Order */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editingWebsite.featured)}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, featured: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <span>Featured on Homepage</span>
                          </label>

                          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingWebsite.published !== false}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, published: e.target.checked })}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <span>Published (Publicly Visible)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Display Order:</span>
                            <input
                              type="number"
                              value={editingWebsite.displayOrder ?? 1}
                              onChange={(e) => setEditingWebsite({ ...editingWebsite, displayOrder: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setEditingWebsite(null)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
                          >
                            Save Website
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Websites Table / Cards */}
                  {websites.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                      <Globe className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-white">No websites added yet</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Click "Add Website" above to add the first real website you've built.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {websites.map((w) => (
                        <div
                          key={w.id}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg bg-slate-900 overflow-hidden border border-white/10 shrink-0">
                              {w.thumbnailUrl ? (
                                <img src={w.thumbnailUrl} alt={w.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No img</div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{w.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300">
                                  {w.category}
                                </span>
                                {w.featured && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <a
                                href={w.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span>{w.liveUrl}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                            <div className="text-right">
                              <span className="text-sm font-bold text-white">${w.price} USD</span>
                              <div className="text-[10px] text-slate-400">Order: {w.displayOrder || 1}</div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTogglePublish(w)}
                                className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                                  w.published
                                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                                    : 'text-slate-500 hover:bg-white/5'
                                }`}
                                title={w.published ? 'Published (Click to unpublish)' : 'Unpublished (Click to publish)'}
                              >
                                {w.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={() => setEditingWebsite(w)}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteWebsite(w.id, w.name)}
                                className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                                <option value="In Progress" className="bg-[#0e1322]">In Progress</option>
                                <option value="Preview Ready" className="bg-[#0e1322]">Preview Ready</option>
                                <option value="Completed" className="bg-[#0e1322]">Completed</option>
                                <option value="Cancelled" className="bg-[#0e1322]">Cancelled</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const url = prompt('Enter live staging/preview URL for customer review:', ord.previewUrl || '');
                                  if (url !== null) {
                                    handleUpdateOrderStatus(ord.id, 'Preview Ready', { previewUrl: url });
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-1.5"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{ord.previewUrl ? 'Update Preview Link' : 'Set Preview Link'}</span>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
