import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, CheckCheck, Trash2, ShoppingBag, FileText, ExternalLink,
  Volume2, VolumeX, Sparkles, Clock, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { useAdminNotifications } from '../context/AdminNotificationContext';
import { AdminNotification, AdminNotificationType } from '../types';

interface AdminNotificationBellProps {
  onSelectOrder?: (orderId: string, openRequirements?: boolean) => void;
  className?: string;
}

export const AdminNotificationBell: React.FC<AdminNotificationBellProps> = ({
  onSelectOrder,
  className = '',
}) => {
  const {
    notifications,
    unreadCount,
    unreadOrderCount,
    unreadRequirementsCount,
    soundEnabled,
    setSoundEnabled,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useAdminNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new_order' | 'requirements_submitted' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'new_order') return item.type === 'new_order';
    if (filter === 'requirements_submitted') return item.type === 'requirements_submitted';
    return true;
  });

  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    const openReqs = notif.type === 'requirements_submitted';
    if (onSelectOrder) {
      onSelectOrder(notif.orderId, openReqs);
    }
    setIsOpen(false);
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-blue-600/30 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20'
            : unreadCount > 0
            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
        }`}
        title={`Notifications (${unreadCount} unread)`}
        aria-label="Admin Notifications"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce-subtle text-red-400' : ''}`} />

        {/* Live Pulsing Ping Dot */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-black text-white items-center justify-center shadow-md shadow-red-500/50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0d111d] border border-white/15 shadow-2xl shadow-black/80 z-50 overflow-hidden flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Admin Alerts</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Sync
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  soundEnabled
                    ? 'text-blue-300 hover:text-white bg-blue-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={soundEnabled ? 'Mute sound alerts' : 'Enable sound chime alerts'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3 text-blue-400" />
                  <span>Mark Read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Clear all alerts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 border-b border-white/5 bg-black/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('new_order')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filter === 'new_order'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>Orders</span>
              {unreadOrderCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
            <button
              onClick={() => setFilter('requirements_submitted')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filter === 'requirements_submitted'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>Requirements</span>
              {unreadRequirementsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              )}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                filter === 'unread'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-white">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Live notifications will trigger whenever a customer places an order or submits website requirements.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isOrder = notif.type === 'new_order';
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                      !notif.read
                        ? 'bg-blue-500/[0.07] hover:bg-blue-500/[0.12]'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isOrder
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                      }`}
                    >
                      {isOrder ? <ShoppingBag className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white">
                          #{notif.orderId}
                        </span>
                        {notif.amount !== undefined && (
                          <span className="text-[11px] font-bold text-emerald-400">
                            ${notif.amount}
                          </span>
                        )}
                        {notif.details?.businessName && (
                          <span className="text-[11px] text-purple-300 truncate max-w-[120px]">
                            {notif.details.businessName}
                          </span>
                        )}

                        <span className="ml-auto text-[10px] font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>{isOrder ? 'View Order' : 'Review Reqs'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Status */}
          <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-time Firestore & backend synchronization
            </span>
            <span>{notifications.length} Total</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Real-time Floating Alert Toast Banner
export const AdminNotificationToast: React.FC<{
  onOpenOrder?: (orderId: string, openRequirements?: boolean) => void;
}> = ({ onOpenOrder }) => {
  const { activeToast, dismissToast, markAsRead } = useAdminNotifications();

  if (!activeToast) return null;

  const isOrder = activeToast.type === 'new_order';

  const handleClick = async () => {
    await markAsRead(activeToast.id);
    if (onOpenOrder) {
      onOpenOrder(activeToast.orderId, activeToast.type === 'requirements_submitted');
    }
    dismissToast();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl bg-[#0f1422] border border-blue-500/40 p-4 shadow-2xl shadow-blue-500/20 backdrop-blur-xl flex items-start gap-3 relative overflow-hidden group">
        {/* Glow Accent */}
        <div
          className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 ${
            isOrder ? 'bg-emerald-500' : 'bg-purple-500'
          }`}
        />

        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isOrder
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          }`}
        >
          {isOrder ? <ShoppingBag className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isOrder
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {isOrder ? 'New Order' : 'Requirements Submitted'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              #{activeToast.orderId}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white leading-snug">
            {activeToast.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            {activeToast.message}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleClick}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isOrder ? 'Open Order' : 'Review Details'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={dismissToast}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Dismiss X */}
        <button
          onClick={dismissToast}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
