import React, { useState } from 'react';
import {
  Terminal, Sparkles, Send, CheckCircle2, AlertTriangle, X,
  ShoppingBag, FileText, PhoneCall, Globe, ArrowRight, CornerDownLeft, RefreshCw
} from 'lucide-react';
import { executeAdminCommand } from '../services/agencyApi';

interface AdminCommandCenterProps {
  adminToken: string;
  onDataChanged: () => void;
}

const SUGGESTIONS = [
  'Add a new modern Italian restaurant website',
  'Change price to $249',
  'Publish website',
  'Show today\'s orders',
  'Show pending customer requirements',
  'Show my upcoming calls',
  'Delete website',
];

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  adminToken,
  onDataChanged,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any | null>(null);
  const [history, setHistory] = useState<{ command: string; time: string; success: boolean }[]>([]);

  const handleRunCommand = async (cmdText?: string) => {
    const text = (cmdText || commandInput).trim();
    if (!text) return;

    try {
      setLoading(true);
      setError(null);
      const res = await executeAdminCommand(text, adminToken, false);
      setResponse(res);
      setHistory((prev) => [
        { command: text, time: new Date().toLocaleTimeString(), success: res.success },
        ...prev.slice(0, 7),
      ]);
      if (res.actionExecuted) {
        onDataChanged();
      }
    } catch (err: any) {
      setError(err.message || 'Command execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!response || !response.actionRequired) return;
    try {
      setLoading(true);
      setError(null);
      const res = await executeAdminCommand(
        commandInput,
        adminToken,
        true,
        response.preview || { targetWebsite: response.targetWebsite }
      );
      setResponse(res);
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to complete confirmed action.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAction = () => {
    setResponse(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/20 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Admin Natural-Language Command Center</h3>
            <p className="text-xs text-slate-300">
              Control websites, pricing, publishing, queries, and project statuses with conversational commands.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Quick Commands:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setCommandInput(s);
                handleRunCommand(s);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Command Input Box */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Terminal className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Add a restaurant website, Delete website Sunset Cafe, Show today's orders, Change price to $199..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !commandInput.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-blue-600/30"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Execute</span>
                <CornerDownLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Structured Confirmation Card (Requirement 4) */}
      {response?.actionRequired === 'confirm_add' && response.preview && (
        <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-500/40 space-y-4">
          <div className="flex items-center gap-2 text-blue-300">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Confirm New Website Addition</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block">Website Name:</span>
              <span className="font-bold text-white text-sm">{response.preview.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Category:</span>
              <span className="font-semibold text-slate-200">{response.preview.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Selling Price:</span>
              <span className="font-bold text-emerald-400 text-sm">${response.preview.price} {response.preview.currency}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Preview / Demo URL:</span>
              <span className="font-mono text-slate-300 truncate block">{response.preview.demoUrl}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Description:</span>
              <p className="text-slate-300">{response.preview.shortDescription}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelAction}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmAction}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Add to Catalog</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Prompt (Requirement 4) */}
      {response?.actionRequired === 'confirm_delete' && (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-4">
          <div className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Confirm Destructive Action</h4>
          </div>

          <p className="text-sm text-slate-200">
            Are you sure you want to permanently delete <strong className="text-white">"{response.targetWebsite?.name}"</strong> (ID: #{response.targetWebsite?.id}) from both local database and Firestore?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelAction}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmAction}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Permanent Deletion</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct Action Output / Query Results */}
      {response && !response.actionRequired && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{response.message}</span>
          </div>

          {/* If Query Result has Orders */}
          {response.data?.orders && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300">Matching Orders ({response.data.orders.length}):</span>
              <div className="space-y-1.5">
                {response.data.orders.map((o: any) => (
                  <div key={o.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-white">#{o.id}</span>
                      <span className="ml-2 font-semibold text-slate-300">{o.websiteName}</span>
                      <span className="ml-2 text-slate-400">({o.customerName} - {o.customerEmail})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">${o.amount}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If Query Result has Bookings */}
          {response.data?.bookings && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300">Upcoming Bookings ({response.data.bookings.length}):</span>
              <div className="space-y-1.5">
                {response.data.bookings.map((b: any) => (
                  <div key={b.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{b.callType}</span>
                      <span className="ml-2 text-slate-400">with {b.customerName} ({b.customerEmail})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>{b.date} at {b.time}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Command History */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Executed Commands</span>
          <div className="space-y-1">
            {history.map((h, i) => (
              <div key={i} className="px-3 py-2 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">{h.command}</span>
                <span className="text-[10px] text-slate-500">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
