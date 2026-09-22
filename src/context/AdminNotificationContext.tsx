import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { AdminNotification } from '../types';
import {
  fetchAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  clearAdminNotification,
  clearAllAdminNotifications,
  getStoredAdminToken
} from '../services/agencyApi';

interface TargetOrderFocus {
  orderId: string;
  openRequirements: boolean;
}

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  unreadOrderCount: number;
  unreadRequirementsCount: number;
  latestNotification: AdminNotification | null;
  loading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
  activeToast: AdminNotification | null;
  dismissToast: () => void;
  focusOrder: (orderId: string, openRequirements?: boolean) => void;
  targetOrderToFocus: TargetOrderFocus | null;
  clearTargetOrderToFocus: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

// Web Audio API Chime Synthesizer
function playSubtleChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Note 1 (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2 (B5 - 987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.16, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // Autoplay restrictions or audio unsupported
  }
}

export const AdminNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, getIdToken } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bmw_admin_notif_sound') !== 'false';
    } catch {
      return true;
    }
  });
  const [activeToast, setActiveToast] = useState<AdminNotification | null>(null);
  const [targetOrderToFocus, setTargetOrderToFocus] = useState<TargetOrderFocus | null>(null);

  const initialLoadDoneRef = useRef(false);
  const previousIdsRef = useRef<Set<string>>(new Set());
  const toastTimeoutRef = useRef<any>(null);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('bmw_admin_notif_sound', String(enabled));
    } catch {}
  };

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const triggerToast = useCallback(
    (notif: AdminNotification) => {
      setActiveToast(notif);
      if (soundEnabled) {
        playSubtleChime();
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
    },
    [soundEnabled]
  );

  // Helper to load notifications via HTTP fallback
  const fetchFromApi = useCallback(async () => {
    try {
      const storedToken = getStoredAdminToken();
      let token = storedToken;
      if (!token) {
        token = await getIdToken();
      }
      if (!token) return;
      const data = await fetchAdminNotifications(token);
      if (Array.isArray(data)) {
        setNotifications((prev) => {
          // Detect newly arrived unread notifications
          if (initialLoadDoneRef.current) {
            for (const item of data) {
              if (!item.read && !previousIdsRef.current.has(item.id)) {
                triggerToast(item);
                break;
              }
            }
          }
          previousIdsRef.current = new Set(data.map((n) => n.id));
          return data;
        });
        initialLoadDoneRef.current = true;
      }
    } catch (err) {
      console.warn('Notification fetch fallback error:', err);
    }
  }, [getIdToken, triggerToast]);

  // Real-time Firestore Listener
  useEffect(() => {
    if (!isAdmin) {
      setNotifications([]);
      initialLoadDoneRef.current = false;
      return;
    }

    setLoading(true);
    let unsubscribe: (() => void) | null = null;

    try {
      const notifsCol = collection(db, 'admin_notifications');
      const q = query(notifsCol, limit(50));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: AdminNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              ...data,
            } as AdminNotification);
          });

          items.sort(
            (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
          );

          if (initialLoadDoneRef.current) {
            // Check for new items that were not seen before
            for (const item of items) {
              if (!item.read && !previousIdsRef.current.has(item.id)) {
                triggerToast(item);
                break;
              }
            }
          }

          previousIdsRef.current = new Set(items.map((n) => n.id));
          setNotifications(items);
          setLoading(false);
          initialLoadDoneRef.current = true;
        },
        (error) => {
          console.warn('Firestore notification listener notice, falling back to HTTP:', error.message);
          fetchFromApi();
          setLoading(false);
        }
      );
    } catch (e: any) {
      console.warn('Real-time setup notice:', e.message);
      fetchFromApi();
      setLoading(false);
    }

    // Secondary HTTP fallback poll every 8s to guarantee synchronization
    const interval = setInterval(() => {
      fetchFromApi();
    }, 8000);

    // Initial immediate load
    fetchFromApi();

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [isAdmin, fetchFromApi, triggerToast]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (activeToast?.id === id) {
      dismissToast();
    }
    const token = getStoredAdminToken() || (await getIdToken());
    if (token) {
      await markAdminNotificationAsRead(id, token);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    dismissToast();
    const token = getStoredAdminToken() || (await getIdToken());
    if (token) {
      await markAllAdminNotificationsAsRead(token);
    }
  };

  const clearNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (activeToast?.id === id) {
      dismissToast();
    }
    const token = getStoredAdminToken() || (await getIdToken());
    if (token) {
      await clearAdminNotification(id, token);
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    dismissToast();
    const token = getStoredAdminToken() || (await getIdToken());
    if (token) {
      await clearAllAdminNotifications(token);
    }
  };

  const refresh = async () => {
    await fetchFromApi();
  };

  const focusOrder = (orderId: string, openRequirements = false) => {
    setTargetOrderToFocus({ orderId, openRequirements });
  };

  const clearTargetOrderToFocus = () => {
    setTargetOrderToFocus(null);
  };

  // Derived counts
  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadOrderCount = notifications.filter((n) => !n.read && n.type === 'new_order').length;
  const unreadRequirementsCount = notifications.filter((n) => !n.read && n.type === 'requirements_submitted').length;
  const latestNotification = notifications[0] || null;

  return (
    <AdminNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadOrderCount,
        unreadRequirementsCount,
        latestNotification,
        loading,
        soundEnabled,
        setSoundEnabled,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        refresh,
        activeToast,
        dismissToast,
        focusOrder,
        targetOrderToFocus,
        clearTargetOrderToFocus,
      }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
};

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
}
