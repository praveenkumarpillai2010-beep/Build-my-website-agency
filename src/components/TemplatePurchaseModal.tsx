import React, { useState } from 'react';
import { X, Check, ShoppingCart, MessageCircle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Template } from '../types';
import { AGENCY_CONFIG, getWhatsAppUrl } from '../data/agencyData';

interface TemplatePurchaseModalProps {
  template: Template | null;
  onClose: () => void;
}

export const TemplatePurchaseModal: React.FC<TemplatePurchaseModalProps> = ({
  template,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    whatsappNumber: '',
    email: '',
    notes: '',
    needDomainHosting: true,
    needPaymentGateway: false,
  });

  const [submitted, setSubmitted] = useState(false);

  if (!template) return null;

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.whatsappNumber) return;
    setSubmitted(true);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi Build My Website team! 🚀
I want to order and customize the "${template.name}" template (Starting from ${template.currency}${template.startingPrice.toLocaleString()}).

My Details:
- Name: ${formData.fullName || 'Client'}
- Business Name: ${formData.businessName || 'My Business'}
- Phone/WhatsApp: ${formData.whatsappNumber || 'Provided in chat'}
- Email: ${formData.email || 'N/A'}
- Domain/Hosting Needed: ${formData.needDomainHosting ? 'Yes' : 'No'}
- Payment Gateway Needed: ${formData.needPaymentGateway ? 'Yes' : 'No'}
- Notes: ${formData.notes || 'Ready to start!'}

Please share the next onboarding steps and project invoice!`;

    window.open(getWhatsAppUrl(message), '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1322] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Order & Customize Template
              </h3>
              <p className="text-xs text-slate-400">
                Ready in {template.deliveryDays} days with your branding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Template Badge Summary */}
        <div className="my-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="font-bold text-white text-sm">{template.name}</div>
            <div className="text-xs text-slate-400">{template.category} Edition</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Starting Price</div>
            <div className="text-base font-extrabold text-blue-400">
              {template.currency}
              {template.startingPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {submitted ? (
          /* Confirmation State */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Inquiry Received!</h4>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Thank you, <span className="text-white font-semibold">{formData.fullName}</span>! Our technical lead will contact you via WhatsApp at{' '}
              <span className="text-blue-400 font-semibold">{formData.whatsappNumber}</span> within 2 business hours.
            </p>
            <div className="pt-2">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Instantly on WhatsApp</span>
              </button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmitInquiry} className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Luxe Auto Works"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Optional checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needDomainHosting}
                  onChange={(e) =>
                    setFormData({ ...formData, needDomainHosting: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-white/10 border-white/20 focus:ring-0"
                />
                <span>I need assistance connecting my custom domain & hosting</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needPaymentGateway}
                  onChange={(e) =>
                    setFormData({ ...formData, needPaymentGateway: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-white/10 border-white/20 focus:ring-0"
                />
                <span>I need online payment gateway (Stripe, PayPal, Credit Cards)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Special Customizations / Questions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Mention any specific features, color changes, or page additions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
              />
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                100% Satisfaction Guarantee. Staging link preview included before final deployment.
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp Fast</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
