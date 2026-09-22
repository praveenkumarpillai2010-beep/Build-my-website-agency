import React, { useState, useEffect } from 'react';
import {
  PhoneCall, Calendar, Video, CheckCircle, XCircle, Clock,
  ExternalLink, Search, Filter, RefreshCw, Link as LinkIcon, User, Mail, Phone
} from 'lucide-react';
import { CallBooking } from '../types';
import { fetchBookings, updateBookingStatus } from '../services/agencyApi';

interface AdminBookedCallsProps {
  adminToken: string;
}

export const AdminBookedCalls: React.FC<AdminBookedCallsProps> = ({ adminToken }) => {
  const [calls, setCalls] = useState<CallBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Meeting Link update modal/state
  const [selectedCallForLink, setSelectedCallForLink] = useState<CallBooking | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => {
    loadCalls();
  }, [adminToken]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchBookings(adminToken);
      setCalls(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load booked calls');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (callId: string, newStatus: CallBooking['status']) => {
    try {
      setLoading(true);
      const updated = await updateBookingStatus(callId, newStatus, adminToken);
      setCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeetingLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCallForLink) return;

    try {
      setSavingLink(true);
      const updated = await updateBookingStatus(
        selectedCallForLink.id,
        'Confirmed',
        adminToken,
        meetingLinkInput.trim()
      );
      setCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCallForLink(null);
      setMeetingLinkInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to save meeting link');
    } finally {
      setSavingLink(false);
    }
  };

  const filteredCalls = calls.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerEmail.toLowerCase().includes(q) ||
        c.callType.toLowerCase().includes(q) ||
        c.date.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-400" />
            <span>Customer Call Bookings ({calls.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Manage incoming strategy consultations, requirement walkthroughs, and client review sessions.
          </p>
        </div>

        <button
          onClick={loadCalls}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Calls</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, or call type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
        >
          <option value="all">All Call Statuses</option>
          <option value="Requested">Requested (Pending)</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Calls Table / Cards */}
      {filteredCalls.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">No calls matching criteria</h4>
          <p className="text-xs text-slate-400">Incoming bookings from the customer portal will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-white/20 transition-all"
            >
              {/* Left Column: Client Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">#{call.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      call.status === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : call.status === 'Cancelled'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : call.status === 'Completed'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {call.status}
                  </span>
                  <span className="text-xs font-bold text-white">{call.callType}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {call.customerName}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    {call.customerEmail}
                  </span>
                  {call.customerPhone && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      {call.customerPhone}
                    </span>
                  )}
                </div>

                {call.reason && (
                  <p className="text-xs text-slate-400 italic">
                    Note: "{call.reason}"
                  </p>
                )}
              </div>

              {/* Right Column: Time & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{call.date}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{call.time}</span>
                  </div>
                </div>

                {/* Meeting link badge / trigger */}
                {call.meetingLink ? (
                  <a
                    href={call.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCallForLink(call);
                      setMeetingLinkInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Add Meeting Link</span>
                  </button>
                )}

                {/* Status Switcher Dropdown */}
                <select
                  value={call.status}
                  onChange={(e) => handleStatusChange(call.id, e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Requested">Requested</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meeting Link Modal */}
      {selectedCallForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveMeetingLink}
            className="w-full max-w-md bg-[#0c101c] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                <span>Set Video Meeting Link</span>
              </h4>
              <button
                type="button"
                onClick={() => setSelectedCallForLink(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide Google Meet, Zoom, or Teams URL for call with {selectedCallForLink.customerName} on {selectedCallForLink.date}.
            </p>

            <input
              type="url"
              required
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetingLinkInput}
              onChange={(e) => setMeetingLinkInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCallForLink(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingLink || !meetingLinkInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                {savingLink ? 'Saving...' : 'Save & Confirm Call'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
