import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Save, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AddVideo() {
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [requiresUnlock, setRequiresUnlock] = useState(false);
  const [targetLink, setTargetLink] = useState('');
  const [requiredAdsCount, setRequiredAdsCount] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'adminProfiles'), (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setAdminProfiles(data);
      if (data.length > 0 && !selectedProfileId) {
        setSelectedProfileId(data[0].id);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title || !thumbnail || !videoUrl || !duration || !selectedProfileId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (requiresUnlock && (!targetLink || !requiredAdsCount)) {
      toast.error('Please fill in all unlock requirements.');
      return;
    }

    const selectedProfile = adminProfiles.find(p => p.id === selectedProfileId);
    if (!selectedProfile) {
      toast.error('Invalid admin profile selected.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Adding video...');

    try {
      const newVideo = {
        title,
        thumbnail,
        videoUrl,
        duration,
        adminName: selectedProfile.name,
        adminProfilePic: selectedProfile.profilePic,
        requiresUnlock,
        ...(requiresUnlock && {
          targetLink,
          requiredAdsCount: parseInt(requiredAdsCount, 10) || 3,
        }),
        createdAt: Date.now(),
        views: Math.floor(Math.random() * 500) + 50, // Seed with random views
        likes: 0
      };

      await addDoc(collection(db, 'videos'), newVideo);
      
      toast.success('Video added successfully!', { id: toastId });
      
      // Reset form
      setTitle('');
      setThumbnail('');
      setVideoUrl('');
      setDuration('');
      // selectedProfileId remains explicitly so they don't have to reselect
      setRequiresUnlock(false);
      setTargetLink('');
      setRequiredAdsCount('3');
      
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video. Check console for details.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm w-full max-w-full">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-4">
        <h2 className="text-sm font-bold text-slate-700">Add New Video to Collection</h2>
        <span className="text-[10px] text-slate-400 hidden sm:inline">Collection: /videos</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Video Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
              placeholder="e.g. Cinematic Nature 4K"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Thumbnail URL *</label>
            <input
              type="url"
              required
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
              placeholder="https://..."
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Video URL (m3u8/mp4) *</label>
            <input
              type="url"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
              placeholder="https://..."
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration *</label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm"
              placeholder="00:00"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Select Admin Profile *</label>
            {adminProfiles.length === 0 ? (
              <div className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No admin profiles found. Please create one in Admin Profiles first.
              </div>
            ) : (
              <select
                required
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors shadow-sm appearance-none"
              >
                {adminProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 flex items-center justify-between py-2 border-t border-slate-100 mt-2">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-slate-700">Require Unlock</label>
              <p className="text-[10px] text-slate-500">Force users to complete ad steps</p>
            </div>
            <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={requiresUnlock}
                onChange={(e) => setRequiresUnlock(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {requiresUnlock && (
            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-indigo-50/50 p-4 border border-indigo-100">
              <div className="col-span-1 sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-indigo-700">Target Link (Secret Destination) *</label>
                <input
                  type="url"
                  required={requiresUnlock}
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  className="w-full rounded-lg border border-indigo-200 bg-white px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm transition-colors"
                  placeholder="https://mega.nz/..."
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-indigo-700">Number of Ads to Watch *</label>
                <input
                  type="number"
                  min="1"
                  required={requiresUnlock}
                  value={requiredAdsCount}
                  onChange={(e) => setRequiredAdsCount(e.target.value)}
                  className="w-full sm:w-32 rounded-lg border border-indigo-200 bg-white px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm transition-colors"
                  placeholder="3"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors focus:ring-4 focus:ring-indigo-200"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Save Video to Database'}
        </button>
      </form>
    </section>
  );
}
