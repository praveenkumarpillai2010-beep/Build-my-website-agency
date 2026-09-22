import React, { useState } from 'react';
import { X, Upload, CheckCircle, FileText, Image as ImageIcon, Sparkles, Send } from 'lucide-react';
import { CustomerRequirements } from '../types';
import { submitOrderRequirements, uploadImage } from '../services/agencyApi';
import { useAuth } from '../context/AuthContext';

interface RequirementsModalProps {
  orderId: string;
  websiteName?: string;
  initialRequirements?: CustomerRequirements;
  onClose: () => void;
  onSuccess: (updatedReq: CustomerRequirements) => void;
}

export const RequirementsModal: React.FC<RequirementsModalProps> = ({
  orderId,
  websiteName,
  initialRequirements,
  onClose,
  onSuccess,
}) => {
  const { getIdToken } = useAuth();
  const [formData, setFormData] = useState<CustomerRequirements>({
    businessName: initialRequirements?.businessName || '',
    logoUrl: initialRequirements?.logoUrl || '',
    businessDescription: initialRequirements?.businessDescription || '',
    phone: initialRequirements?.phone || '',
    email: initialRequirements?.email || '',
    address: initialRequirements?.address || '',
    whatsapp: initialRequirements?.whatsapp || '',
    socialLinks: initialRequirements?.socialLinks || '',
    services: initialRequirements?.services || '',
    aboutBusiness: initialRequirements?.aboutBusiness || '',
    specialRequirements: initialRequirements?.specialRequirements || '',
    uploadedImages: initialRequirements?.uploadedImages || [],
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = await uploadImage(reader.result as string, file.name);
          setFormData((prev) => ({ ...prev, logoUrl: result.url }));
        } catch (err: any) {
          setError(err.message || 'Failed to upload logo');
        } finally {
          setUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !formData.email.trim()) {
      setError('Please provide at least your Business Name and Email.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const token = await getIdToken();
      const res = await submitOrderRequirements(
        orderId,
        {
          ...formData,
          submittedAt: new Date().toISOString(),
        },
        token || undefined
      );
      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess(formData);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit requirements. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c101c] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e1322]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Submit Website Requirements</h2>
              <p className="text-xs text-slate-400">Order: #{orderId} {websiteName ? `• ${websiteName}` : ''}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Requirements Received!</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Our engineering team has received your project details and has begun customizing your website.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {error}
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-300">
              Provide as much detail as possible so our agency team can tailor the website precisely to your brand. You can update these anytime.
            </p>

            {/* Business Basics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Strategy Partners"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@yourbusiness.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="For instant chat button on website"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Business Logo Upload or URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Business Logo (Image file or URL)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />

                <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer transition-colors flex items-center justify-center gap-2 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>

              {formData.logoUrl && (
                <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="w-10 h-10 object-contain rounded-lg bg-black/40 p-1"
                  />
                  <span className="text-xs text-slate-400 truncate max-w-sm">{formData.logoUrl}</span>
                </div>
              )}
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Business Description & Tagline
              </label>
              <textarea
                rows={2}
                placeholder="What does your company do? What is your core value proposition?"
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Services / Products Offered
              </label>
              <textarea
                rows={2}
                placeholder="List your main services or product offerings to display on your site..."
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Social Media Links & Physical Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Social Media Links
                </label>
                <input
                  type="text"
                  placeholder="Instagram, LinkedIn, Facebook, X links..."
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Physical Address / Location
                </label>
                <input
                  type="text"
                  placeholder="City, State, Country or full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Special Preferences, Color Schemes or Requirements
              </label>
              <textarea
                rows={2}
                placeholder="Any preferred colors, domain names you already own, specific references, or sections..."
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <span>Saving Requirements...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Save & Submit Requirements</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
