import React, { useState, useEffect } from 'react';
import {
  X, User, ShoppingBag, CheckCircle, Clock, FileText, ExternalLink,
  MessageCircle, LogOut, ArrowRight, ShieldCheck, AlertCircle, Sparkles,
  PhoneCall, Calendar, Send, Check, RefreshCw, ThumbsUp, RotateCcw,
  Video, HelpCircle, Layers, Link as LinkIcon
} from 'lucide-react';
import { Order, CustomerRequirements, CallBooking, ProjectMessage, OrderStatus } from '../types';
import {
  customerLogin, fetchOrders, getStoredCustomerSession, setStoredCustomerSession,
  fetchAvailableSlots, fetchBookings, createBooking,
  fetchMessages, sendMessage, updateOrderStatus
} from '../services/agencyApi';
import { getWhatsAppUrl } from '../data/agencyData';
import { useAuth } from '../context/AuthContext';

interface CustomerDashboardModalProps {
  onClose: () => void;
  onOpenRequirements: (order: Order) => void;
  onOpenCatalog: () => void;
  initialOrderId?: string;
  refreshTrigger?: number;
}

type CustomerTab = 'orders' | 'messages' | 'calls';

const TRACKING_STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'Payment Confirmed', label: 'Payment Confirmed', desc: 'Order placed & payment verified' },
  { key: 'Requirements Needed', label: 'Requirements Needed', desc: 'Awaiting your brand assets' },
  { key: 'Requirements Received', label: 'Requirements Received', desc: 'Assets & brief reviewed' },
  { key: 'In Progress', label: 'Development', desc: 'Custom build underway' },
  { key: 'Preview Ready', label: 'Preview Ready', desc: 'Staging preview ready' },
  { key: 'Client Review', label: 'Client Review', desc: 'Your feedback requested' },
  { key: 'Revisions', label: 'Revisions', desc: 'Refinements in progress' },
  { key: 'Completed', label: 'Completed', desc: 'Launched & live on web' },
];

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  onClose,
  onOpenRequirements,
  onOpenCatalog,
  initialOrderId,
  refreshTrigger = 0,
}) => {
  const [session, setSession] = useState<{ email: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerTab>('orders');
  const [emailInput, setEmailInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Revision state
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Call Booking State
  const [bookedCalls, setBookedCalls] = useState<CallBooking[]>([]);
  const [callType, setCallType] = useState('Website Consultation');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Project Messages State
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [messageType, setMessageType] = useState<'general' | 'revision' | 'approval' | 'support'>('general');
  const [sendingMessage, setSendingMessage] = useState(false);

  const { user: firebaseUser, signInWithGoogle, getIdToken, logout: fbLogout } = useAuth();

  useEffect(() => {
    const saved = getStoredCustomerSession();
    if (saved && saved.email) {
      setSession(saved);
      setBookingEmail(saved.email);
      setBookingName(saved.name);
      loadCustomerOrders(saved.email);
    } else if (firebaseUser && firebaseUser.email) {
      const s = { email: firebaseUser.email, name: firebaseUser.displayName || 'Customer' };
      setSession(s);
      setBookingEmail(s.email);
      setBookingName(s.name);
      loadCustomerOrders(firebaseUser.email);
    }
  }, [refreshTrigger, firebaseUser]);

  // Load available call slots when date changes
  useEffect(() => {
    if (bookingDate) {
      setLoadingSlots(true);
      fetchAvailableSlots(bookingDate)
        .then((res) => {
          setAvailableSlots(res.availableSlots || []);
          if (res.availableSlots?.length > 0) {
            setSelectedSlot(res.availableSlots[0]);
          } else {
            setSelectedSlot('');
          }
        })
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [bookingDate]);

  // Load bookings and messages when customer is authenticated
  useEffect(() => {
    if (session?.email) {
      loadCustomerBookings();
      loadProjectMessages();
    }
  }, [session, selectedOrder]);

  const loadCustomerBookings = async () => {
    try {
      const token = await getIdToken();
      if (token) {
        const list = await fetchBookings(token);
        setBookedCalls(list);
      }
    } catch {
      // ignore
    }
  };

  const loadProjectMessages = async () => {
    try {
      const token = await getIdToken();
      if (token) {
        const list = await fetchMessages(token, selectedOrder?.id);
        setMessages(list);
      }
    } catch {
      // ignore
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      if (user && user.email) {
        setEmailInput(user.email);
        const res = await customerLogin(user.email, undefined, true);
        const profile = res?.customer || {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
        };
        setSession(profile);
        setBookingEmail(profile.email);
        setBookingName(profile.name);
        const orderList = res?.orders || [];
        setOrders(orderList);
        if (orderList.length > 0) {
          setSelectedOrder(orderList[0]);
        }
      }
    } catch (err: any) {
      console.error('Google Sign-in notice:', err);
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (email: string) => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const list = await fetchOrders({ email, token: token || undefined });
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
      setBookingEmail(res.customer.email);
      setBookingName(res.customer.name);
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
    fbLogout();
  };

  // Website Approval
  const handleApproveWebsite = async () => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const token = await getIdToken();
      const updated = await updateOrderStatus(
        selectedOrder.id,
        'Completed',
        token || '',
        { adminNotes: 'Approved by customer via Customer Portal.' }
      );
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSuccessNotice('Congratulations! You approved your website design. Our team is now completing the final launch!');
      
      // Auto-send an approval message
      if (token) {
        sendMessage(
          {
            orderId: selectedOrder.id,
            message: '🎉 I have reviewed and approved the website design! Ready for final deployment.',
            type: 'approval',
          },
          token
        ).then(() => loadProjectMessages()).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve website');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Request Revisions
  const handleRequestRevisions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !revisionNotes.trim()) return;

    try {
      setUpdatingStatus(true);
      const token = await getIdToken();
      const updated = await updateOrderStatus(
        selectedOrder.id,
        'Revisions',
        token || '',
        { adminNotes: `Customer Revision Request: ${revisionNotes.trim()}` }
      );
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setShowRevisionForm(false);
      setSuccessNotice('Your revision notes have been submitted to the engineering team.');

      // Also post as a project message
      if (token) {
        await sendMessage(
          {
            orderId: selectedOrder.id,
            message: `Revision Request: ${revisionNotes.trim()}`,
            type: 'revision',
          },
          token
        );
        loadProjectMessages();
      }
      setRevisionNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit revisions');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Submit Call Booking
  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingDate || !bookingName.trim() || !bookingEmail.trim()) {
      setError('Please select an available slot and enter your name and email.');
      return;
    }

    try {
      setSubmittingBooking(true);
      setError(null);
      const token = await getIdToken();
      const res = await createBooking(
        {
          callType,
          date: bookingDate,
          time: selectedSlot,
          customerName: bookingName.trim(),
          customerEmail: bookingEmail.trim(),
          customerPhone: bookingPhone.trim(),
          reason: bookingReason.trim() || `${callType} for website project`,
        },
        token || undefined
      );

      setBookedCalls((prev) => [res.booking, ...prev]);
      setSuccessNotice(`Your call has been scheduled for ${res.booking.date} at ${res.booking.time}! Check your email for confirmation.`);
      setBookingReason('');
    } catch (err: any) {
      setError(err.message || 'Could not schedule call.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newMessageText.trim()) return;

    try {
      setSendingMessage(true);
      setError(null);
      const token = await getIdToken();
      if (!token) throw new Error('Please sign in to send messages.');

      const res = await sendMessage(
        {
          orderId: selectedOrder.id,
          message: newMessageText.trim(),
          type: messageType,
        },
        token
      );

      setMessages((prev) => [...prev, res.message]);
      setNewMessageText('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Preview Ready':
      case 'Client Review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'In Progress':
      case 'Requirements Received':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Revisions':
      case 'Requirements Needed':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  // Find active index in 8-stage tracker
  const getStageIndex = (status: OrderStatus) => {
    const idx = TRACKING_STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div id="customer-dashboard-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0c101c] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1322] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Customer Portal</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Verified Client
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {session ? `Signed in as ${session.email}` : 'Track Projects, Chat with Agency Team & Book Calls'}
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

        {/* Global Alert Notices */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successNotice && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        {!session ? (
          /* Sign In Screen */
          <div className="p-8 sm:p-12 max-w-md mx-auto space-y-6 overflow-y-auto">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Access Your Customer Portal</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Sign in with Google or enter your checkout email to view your website development status, chat directly with developers, and book consultation calls.
              </p>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">or with order email</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

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
                    <span>Enter Customer Portal</span>
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
                Browse Websites Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard with Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/10 bg-white/[0.01] shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>My Projects & Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'messages'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Project Messages {messages.length > 0 && `(${messages.length})`}</span>
              </button>

              <button
                onClick={() => setActiveTab('calls')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'calls'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Book a Call {bookedCalls.length > 0 && `(${bookedCalls.length})`}</span>
              </button>
            </div>

            {/* TAB 1: PROJECTS & ORDERS */}
            {activeTab === 'orders' && (
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
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
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors inline-flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Explore Websites Catalog</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders List Sidebar */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Your Purchased Websites
                        </h3>
                        <span className="text-[11px] text-blue-400 font-medium">{orders.length} Total</span>
                      </div>

                      <div className="space-y-2.5">
                        {orders.map((ord) => {
                          const isSelected = selectedOrder?.id === ord.id;
                          return (
                            <div
                              key={ord.id}
                              onClick={() => {
                                setSelectedOrder(ord);
                                setShowRevisionForm(false);
                              }}
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
                        {/* Order Header Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-bold text-white">PROJECT #{selectedOrder.id}</span>
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

                        {/* 8-STAGE CUSTOMER PROJECT TRACKING (Requirement 10) */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              Order Status Tracker (8 Milestone Stages)
                            </span>
                            <span className="text-[11px] text-blue-400 font-mono">
                              Step {getStageIndex(selectedOrder.orderStatus) + 1} of 8
                            </span>
                          </div>

                          {/* Stepper Pipeline */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {TRACKING_STAGES.map((st, i) => {
                              const activeIdx = getStageIndex(selectedOrder.orderStatus);
                              const isCompleted = i < activeIdx;
                              const isCurrent = i === activeIdx;

                              return (
                                <div
                                  key={st.key}
                                  className={`p-3 rounded-xl border text-center transition-all ${
                                    isCurrent
                                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                                      : isCompleted
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                      : 'bg-white/[0.01] border-white/5 text-slate-500'
                                  }`}
                                >
                                  <div className="text-[11px] font-bold flex items-center justify-center gap-1">
                                    {isCompleted ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <span className="text-[10px] text-slate-400">{i + 1}.</span>
                                    )}
                                    <span>{st.label}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                    {st.desc}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* WEBSITE PREVIEW & APPROVAL SECTION (Requirement 12) */}
                        {selectedOrder.previewUrl ? (
                          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm font-bold text-white">Website Preview Ready for Review!</span>
                                </div>
                                <p className="text-xs text-slate-300">
                                  Our team has prepared your staging preview. Review design, copy, images, and mobile responsiveness.
                                </p>
                              </div>

                              <a
                                href={selectedOrder.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shrink-0 shadow-lg shadow-blue-600/30"
                              >
                                <span>Open Live Preview</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Approval Action Buttons */}
                            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-white/10">
                              <button
                                type="button"
                                disabled={updatingStatus || selectedOrder.orderStatus === 'Completed'}
                                onClick={handleApproveWebsite}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{selectedOrder.orderStatus === 'Completed' ? 'Website Approved & Live' : 'Approve Website'}</span>
                              </button>

                              <button
                                type="button"
                                disabled={updatingStatus}
                                onClick={() => setShowRevisionForm(!showRevisionForm)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Request Revisions</span>
                              </button>
                            </div>

                            {/* Revision Form Toggle */}
                            {showRevisionForm && (
                              <form onSubmit={handleRequestRevisions} className="pt-3 border-t border-white/10 space-y-3">
                                <label className="block text-xs font-semibold text-slate-200">
                                  Describe the changes or adjustments you'd like made:
                                </label>
                                <textarea
                                  required
                                  rows={3}
                                  placeholder="e.g. Change hero headline to '...', swap second banner image, adjust contact phone number..."
                                  value={revisionNotes}
                                  onChange={(e) => setRevisionNotes(e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowRevisionForm(false)}
                                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={updatingStatus}
                                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors"
                                  >
                                    {updatingStatus ? 'Submitting...' : 'Submit Revisions'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        ) : null}

                        {/* Final Website Live Link */}
                        {selectedOrder.finalWebsiteUrl && (
                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-emerald-300">Official Website is Live!</span>
                              <p className="text-xs text-slate-300 font-mono">{selectedOrder.finalWebsiteUrl}</p>
                            </div>
                            <a
                              href={selectedOrder.finalWebsiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shrink-0"
                            >
                              <span>Visit Website</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}

                        {/* Submitted Requirements Card */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-bold text-white">Project Requirements & Branding Assets</span>
                            </div>
                            <p className="text-xs text-slate-300">
                              {selectedOrder.requirements?.submittedAt
                                ? `Submitted on ${new Date(selectedOrder.requirements.submittedAt).toLocaleDateString()}. You can update your business details anytime.`
                                : 'Awaiting your submission. Please provide your brand assets, logo, and copy.'}
                            </p>
                          </div>

                          <button
                            onClick={() => onOpenRequirements(selectedOrder)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <span>{selectedOrder.requirements?.submittedAt ? 'Update Requirements' : 'Submit Requirements'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Action Footer */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setActiveTab('messages')}
                              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Message Project Team</span>
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              onClick={() => setActiveTab('calls')}
                              className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Schedule Call</span>
                            </button>
                          </div>

                          <a
                            href={getWhatsAppUrl(`Hi Build My Website! I'm checking in on Order #${selectedOrder.id} for "${selectedOrder.websiteName}".`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Hotline</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PROJECT MESSAGES (Requirement 9) */}
            {activeTab === 'messages' && (
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg font-bold text-white">Project Messaging & Collaboration</h3>
                    <p className="text-xs text-slate-400">
                      Direct, real-time communication with the engineering & design team regarding your website.
                    </p>
                  </div>

                  {orders.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Filter by Order:</span>
                      <select
                        value={selectedOrder?.id || ''}
                        onChange={(e) => {
                          const o = orders.find((ord) => ord.id === e.target.value);
                          if (o) setSelectedOrder(o);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
                      >
                        {orders.map((ord) => (
                          <option key={ord.id} value={ord.id}>
                            #{ord.id} - {ord.websiteName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Message Thread History */}
                <div className="space-y-3 min-h-[220px] max-h-[350px] overflow-y-auto p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 space-y-2 text-slate-500">
                      <MessageCircle className="w-8 h-8 mx-auto opacity-50" />
                      <p className="text-xs">No messages yet for this project. Send a question or revision note below!</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isAdminMsg = m.senderRole === 'admin';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isAdminMsg ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">{m.senderName}</span>
                            <span>•</span>
                            <span className="text-[10px]">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {m.type && m.type !== 'general' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300">
                                {m.type}
                              </span>
                            )}
                          </div>
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isAdminMsg
                                ? 'bg-white/[0.07] border border-white/10 text-slate-100 rounded-tl-sm'
                                : 'bg-blue-600 text-white rounded-tr-sm'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Composer */}
                {selectedOrder ? (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-slate-300">Message Type:</label>
                      <select
                        value={messageType}
                        onChange={(e) => setMessageType(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
                      >
                        <option value="general">General Question</option>
                        <option value="revision">Revision Request</option>
                        <option value="approval">Approval Note</option>
                        <option value="support">Technical Support</option>
                      </select>
                      <span className="text-[11px] text-slate-400 ml-auto">
                        Posting to Order #{selectedOrder.id} ({selectedOrder.websiteName})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Type your message to the agency engineering team..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessageText.trim()}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400">Select an order above to start messaging.</p>
                )}
              </div>
            )}

            {/* TAB 3: BOOK A CALL (Requirement 7) */}
            {activeTab === 'calls' && (
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Book a Strategy or Review Call</h3>
                  <p className="text-xs text-slate-400">
                    Schedule a 1-on-1 video or audio meeting with our lead developers and strategy team.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Booking Form */}
                  <form onSubmit={handleScheduleCall} className="space-y-4 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>Select Call Date & Available Slot</span>
                    </h4>

                    {/* Call Type Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Call Type
                      </label>
                      <select
                        value={callType}
                        onChange={(e) => setCallType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Website Consultation">Website Consultation (General Discovery)</option>
                        <option value="Requirements Discussion">Requirements Discussion (Assets & Features)</option>
                        <option value="Project Review">Project Review (Staging Walkthrough)</option>
                        <option value="Support Call">Support Call (Post-launch & DNS Assistance)</option>
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Desired Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Available Time Slots
                        </label>
                        {loadingSlots && <span className="text-[10px] text-blue-400">Loading slots...</span>}
                      </div>

                      {availableSlots.length === 0 ? (
                        <p className="text-xs text-amber-300 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          All standard slots for {bookingDate} are booked. Please select another date.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                                selectedSlot === slot
                                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                  : 'bg-white/[0.03] text-slate-300 border-white/10 hover:border-white/20'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Discuss ecommerce payment gateway"
                          value={bookingReason}
                          onChange={(e) => setBookingReason(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingBooking || !selectedSlot}
                      className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{submittingBooking ? 'Reserving Slot...' : 'Confirm Call Booking'}</span>
                    </button>
                  </form>

                  {/* Existing Bookings List */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-400" />
                      <span>Your Scheduled Bookings ({bookedCalls.length})</span>
                    </h4>

                    {bookedCalls.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                        <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">You don't have any booked calls scheduled yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookedCalls.map((b) => (
                          <div
                            key={b.id}
                            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-white">#{b.id}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  b.status === 'Confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : b.status === 'Cancelled'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-slate-200">
                              {b.callType}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Calendar className="w-3 h-3 text-blue-400" />
                                {b.date} at {b.time}
                              </span>
                            </div>

                            {b.meetingLink ? (
                              <div className="pt-2">
                                <a
                                  href={b.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Join Video Call</span>
                                </a>
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 italic">
                                Meeting link will be activated once confirmed by team.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
