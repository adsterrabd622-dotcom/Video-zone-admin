import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function ManageAds() {
  const [popunder, setPopunder] = useState('');
  const [socialBar, setSocialBar] = useState('');
  const [banner728x90, setBanner728x90] = useState('');
  const [globalAdLink, setGlobalAdLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'adSettings', 'global_settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPopunder(data.popunder || '');
        setSocialBar(data.socialBar || '');
        setBanner728x90(data.banner728x90 || '');
        setGlobalAdLink(data.globalAdLink || '');
      }
    } catch (error) {
      console.error("Error loading ads settings:", error);
      toast.error('Failed to load settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Saving ad settings...');

    try {
      // Write to adSettings / global_settings
      await setDoc(doc(db, 'adSettings', 'global_settings'), {
        popunder,
        socialBar,
        banner728x90,
        globalAdLink
      }, { merge: true });

      // Write to settings / ads (legacy/alternative path the frontend might be using)
      await setDoc(doc(db, 'settings', 'ads'), {
        popunderScript: popunder,
        socialBarScript: socialBar,
        bannerAdScript: banner728x90,
        directLinkUrl: globalAdLink,
        globalAdLink: globalAdLink
      }, { merge: true });
      
      toast.success('Ad settings updated successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving ad settings:', error);
      toast.error('Failed to update ad settings.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full max-w-full">
        <Toaster position="top-right" />
        
        <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-4">
          <h2 className="text-sm font-bold text-slate-700">Global Ads Configuration</h2>
          <p className="text-[10px] text-slate-400 hidden sm:block">Settings Collection ID: ads</p>
        </div>
  
        <div className="p-4 md:p-6 border-b border-amber-50">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Security Warning:</strong> Carefully paste ad scripts from your ad network (e.g. Monetag). Malicious scripts could affect layout.
            </div>
          </div>
        </div>
  
        <form onSubmit={handleSubmit} className="p-4 md:p-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex justify-between items-end">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Direct Link Ad URL *</span>
                <span className="text-[9px] text-slate-400 uppercase">For Unlock Step</span>
              </label>
              <input
                type="url"
                required
                value={globalAdLink}
                onChange={(e) => setGlobalAdLink(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
                placeholder="https://ads-site.com/direct/..."
              />
            </div>
  
            <div>
              <label className="mb-1.5 flex justify-between items-end">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Popunder Ad Script</span>
                <span className="text-[9px] text-slate-400 uppercase hidden sm:block">Placed before &lt;/body&gt;</span>
              </label>
              <textarea
                rows={3}
                value={popunder}
                onChange={(e) => setPopunder(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-base sm:text-xs text-slate-600 focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
                placeholder="<script src='https://ad-network.com/pop.js'></script>"
              />
            </div>
  
            <div>
              <label className="mb-1.5 flex justify-between items-end">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Social Bar Ad Script</span>
                <span className="text-[9px] text-slate-400 uppercase hidden sm:block">Sticky Format</span>
              </label>
              <textarea
                rows={3}
                value={socialBar}
                onChange={(e) => setSocialBar(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-base sm:text-xs text-slate-600 focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
                placeholder="<script>var _sb = 'xyz';</script>"
              />
            </div>
            
            <div>
              <label className="mb-1.5 flex justify-between items-end">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Banner Ad Script</span>
                <span className="text-[9px] text-slate-400 uppercase hidden sm:block">Placed in content</span>
              </label>
              <textarea
                rows={3}
                value={banner728x90}
                onChange={(e) => setBanner728x90(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-base sm:text-xs text-slate-600 focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
                placeholder="<script src='https://ad-network.com/banner.js'></script>"
              />
            </div>
          </div>
  
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-lg bg-indigo-600 py-3.5 text-base sm:text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-indigo-200"
          >
            <Save className="w-5 h-5 sm:w-4 sm:h-4" />
            {isSubmitting ? 'Saving...' : 'Update Ad Settings'}
          </button>
        </form>
      </section>
    </div>
  );
}
