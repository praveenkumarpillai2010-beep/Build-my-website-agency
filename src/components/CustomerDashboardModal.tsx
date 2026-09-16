import React, { useState, useEffect } from 'react';
import { X, User, ShoppingBag, CheckCircle, Clock, FileText, ExternalLink, MessageCircle, LogOut, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Order, CustomerRequirements } from '../types';
import { customerLogin, fetchOrders, getStoredCustomerSession, setStoredCustomerSession } from '../services/agencyApi';
import { getWhatsAppUrl } from '../data/agencyData';

interface CustomerDashboardModalProps {
  onClose: () => void;
  onOpenRequirements: (order: Order) => void;
  onOpenCatalog: () => void;
  initialOrderId?: string;
  refreshTrigger?: number;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  onClose,
  onOpenRequirements,
  onOpenCatalog,
  initialOrderId,
  refreshTrigger = 0,
}) => {
  const [session, setSession] = useState<{ email: string; name: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const saved = getStoredCustomerSession();
    if (saved && saved.email) {
      setSession(saved);
      loadCustomerOrders(saved.email);
    }
  }, [refreshTrigger]);

  const loadCustomerOrders = async (email: string) => {
    setLoading(true);
    try {
      const list = await fetchOrders({ email });
      setOrders(list);
      if (list.length > 0 && !selectedOrder) {
        setSelectedOrder(list[0]);
      }
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await customerLogin(emailInput.trim(), orderIdInput.trim() || undefined);
      setSession(res.customer);
      setOrders(res.orders);
      if (res.orders.length > 0) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (err: any) {
      setError(err.message || 'No orders found matching this email. Please check the spelling or order ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStoredCustomerSession(null);
    setSession(null);
    setOrders([]);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Preview Ready':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'In Progress':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Requirements Needed':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c101c] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1322]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Customer Portal</h2>
              <p className="text-[11px] text-slate-400">
                {session ? `Signed in as ${session.email}` : 'Track Your Website Project & Submit Assets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/10 transition-colors flex items-center gap-1.5"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!session ? (
          /* Sign In Screen */
          <div className="p-8 sm:p-12 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Access Your Orders</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Enter the email address you used during checkout to view your website order progress and upload requirements.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Checkout Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BMW-1024"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Checking Orders...</span>
                ) : (
                  <>
                    <span>View My Orders</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-xs text-slate-400">Haven't ordered yet?</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenCatalog();
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 ml-1.5 underline"
              >
                Browse Websites
              </button>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No active orders found</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  We couldn't find any orders under {session.email}. If you used another email address, please sign out and enter it.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCatalog();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
                >
                  Explore Websites Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders List Sidebar */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    Your Orders ({orders.length})
                  </h3>

                  <div className="space-y-2.5">
                    {orders.map((ord) => {
                      const isSelected = selectedOrder?.id === ord.id;
                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/10 border-blue-500/50 shadow-md'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-bold text-white">#{ord.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(ord.orderStatus)}`}>
                              {ord.orderStatus}
                            </span>
                          </div>

                          <div className="text-sm font-semibold text-slate-200 truncate mb-1">
                            {ord.websiteName}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>${ord.amount} {ord.currency}</span>
                            <span className="text-[11px] text-emerald-400 font-medium">{ord.paymentStatus}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Order Deep-Dive View */}
                {selectedOrder && (
                  <div className="lg:col-span-2 space-y-6 bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8">
                    {/* Order Details Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-white">ORDER #{selectedOrder.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-white">{selectedOrder.websiteName}</h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400">Payment Status</span>
                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 sm:justify-end">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{selectedOrder.paymentStatus.toUpperCase()} (${selectedOrder.amount} {selectedOrder.currency})</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Project Status & Milestones
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/30 text-center">
                          <div className="text-[11px] font-bold text-emerald-400">1. Payment</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Verified</div>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          selectedOrder.requirements?.submittedAt
                            ? 'bg-white/[0.03] border-emerald-500/30'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                          <div className="text-[11px] font-bold">2. Requirements</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {selectedOrder.requirements?.submittedAt ? 'Submitted' : 'Pending'}
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          ['In Progress', 'Preview Ready', 'Completed'].includes(selectedOrder.orderStatus)
                            ? 'bg-white/[0.03] border-blue-500/30 text-blue-300'
                            : 'bg-white/[0.01] border-white/5 text-slate-500'
                        }`}>
                          <div className="text-[11px] font-bold">3. Building</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {['In Progress', 'Preview Ready', 'Completed'].includes(selectedOrder.orderStatus) ? 'Underway' : 'Queue'}
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl border text-center ${
                          selectedOrder.orderStatus === 'Completed'
                            ? 'bg-white/[0.03] border-emerald-500/30 text-emerald-300'
                            : selectedOrder.orderStatus === 'Preview Ready'
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                            : 'bg-white/[0.01] border-white/5 text-slate-500'
                        }`}>
                          <div className="text-[11px] font-bold">4. Launch</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {selectedOrder.orderStatus === 'Completed' ? 'Live' : 'Preview'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Ready Announcement (If live preview URL is set by admin) */}
                    {selectedOrder.previewUrl && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-blue-300">Your Preview is Ready for Review!</span>
                          <p className="text-xs text-slate-300">Review your customized website before final domain push.</p>
                        </div>
                        <a
                          href={selectedOrder.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <span>Open Live Preview</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Requirements Status & Button */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-white">Website Requirements & Assets</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {selectedOrder.requirements?.submittedAt
                            ? `Submitted on ${new Date(selectedOrder.requirements.submittedAt).toLocaleDateString()}. You can update your assets at any time.`
                            : 'Not submitted yet. Please upload your logo and business details.'}
                        </p>
                      </div>

                      <button
                        onClick={() => onOpenRequirements(selectedOrder)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <span>{selectedOrder.requirements?.submittedAt ? 'Edit Requirements' : 'Submit Requirements'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Contact Direct WhatsApp */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Need immediate assistance with this order?</span>
                      <a
                        href={getWhatsAppUrl(`Hi Build My Website! I'm checking in on Order #${selectedOrder.id} for "${selectedOrder.websiteName}".`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
