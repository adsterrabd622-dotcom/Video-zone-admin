import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Trash2, Edit, X, Save, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  adminName: string;
  adminProfilePic: string;
  requiresUnlock: boolean;
  targetLink?: string;
  requiredAdsCount?: number;
  adLinks?: string[];
  createdAt: number;
  views: number;
  likes: number;
}

export default function VideoLibrary() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<VideoData & { selectedProfileId?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribeVids = onSnapshot(q, (snapshot) => {
      const vids: VideoData[] = [];
      snapshot.forEach((doc) => {
        vids.push({ id: doc.id, ...doc.data() } as VideoData);
      });
      setVideos(vids);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos.");
      setIsLoading(false);
    });

    const unsubscribeProfiles = onSnapshot(collection(db, 'adminProfiles'), (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setAdminProfiles(data);
    });

    return () => {
      unsubscribeVids();
      unsubscribeProfiles();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    
    try {
      await deleteDoc(doc(db, 'videos', id));
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleEditClick = (video: VideoData) => {
    const matchingProfile = adminProfiles.find(p => p.name === video.adminName && p.profilePic === video.adminProfilePic);
    setEditingVideo({ 
      ...video, 
      selectedProfileId: matchingProfile ? matchingProfile.id : (adminProfiles[0]?.id || '')
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Updating video...");

    try {
      const { id, selectedProfileId, ...dataToUpdate } = editingVideo;
      
      const payload: any = { ...dataToUpdate };
      
      if (selectedProfileId) {
        const selectedProfile = adminProfiles.find(p => p.id === selectedProfileId);
        if (selectedProfile) {
          payload.adminName = selectedProfile.name;
          payload.adminProfilePic = selectedProfile.profilePic;
        }
      }
      
      // Ensure targetLink and requiredAdsCount are removed if requiresUnlock is false, or set properly
      if (!payload.requiresUnlock) {
        payload.targetLink = deleteField();
        payload.requiredAdsCount = deleteField();
        payload.adLinks = deleteField();
      } else {
        payload.requiredAdsCount = Number(payload.requiredAdsCount) || 3;
      }

      // Automatically migrate old fields by removing them
      if ('adsToWatch' in payload) {
        payload.adsToWatch = deleteField();
      }

      // Strip out any accidental explicit undefined values which crashes updateDoc
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      await updateDoc(doc(db, 'videos', id), payload);
      
      toast.success("Video updated successfully", { id: toastId });
      setEditingVideo(null); // Close modal
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("Failed to update video", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <Toaster position="top-right" />
      
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-w-full">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-4">
          <h2 className="text-sm font-bold text-slate-700">Video Collection ({videos.length})</h2>
          {videos.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete ALL videos? This action cannot be undone.")) {
                  setIsLoading(true);
                  try {
                    await Promise.all(videos.map(v => deleteDoc(doc(db, 'videos', v.id))));
                    toast.success("All videos deleted successfully");
                  } catch (error) {
                    console.error("Error deleting all videos:", error);
                    toast.error("Failed to delete all videos");
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete All
            </button>
          )}
          <span className="text-[10px] text-slate-400 hidden sm:inline">Collection: /videos</span>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {videos.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              No videos found. Click "Add New Video" to create one.
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-3">
                  <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-md bg-slate-200 shadow-sm border border-slate-200 relative">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">No Image</div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {video.duration || 'N/A'}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm line-clamp-2">{video.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{video.videoUrl}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono mt-auto">
                      <BarChart2 className="w-3 h-3 text-slate-400" /> {video.views?.toLocaleString() || 0} views
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex-1 min-w-0">
                    {video.requiresUnlock ? (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 border border-amber-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Unlock Req.
                        </span>
                        {video.requiredAdsCount && (
                          <div className="text-[9px] text-slate-500 font-mono truncate w-full">
                            {video.requiredAdsCount} Ads {'->'} {new URL(video.targetLink || 'https://').hostname}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Direct Access
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditClick(video)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">Thumbnail</th>
                <th className="px-6 py-3 whitespace-nowrap">Title & Info</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap">Stats</th>
                <th className="px-6 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No videos found. Click "Add New Video" to create one.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-24 overflow-hidden rounded-md bg-slate-200 shadow-sm border border-slate-200">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">No Image</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-[200px] lg:max-w-[250px]">{video.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[200px] lg:max-w-[250px]" title={video.videoUrl}>
                        {video.videoUrl}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                        Duration: {video.duration || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {video.requiresUnlock ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Unlock Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Direct Access
                          </span>
                        )}
                        {video.requiresUnlock && video.requiredAdsCount && (
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            {video.requiredAdsCount} Ads {'->'} {new URL(video.targetLink || 'https://').hostname}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                              <BarChart2 className="w-3.5 h-3.5 text-slate-400" /> {video.views?.toLocaleString() || 0} views
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(video)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit Video"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Modal Context Overlay */}
      {editingVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl my-8 mx-auto -webkit-overflow-scrolling-touch shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-xl">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Edit Video
              </h2>
              <button 
                onClick={() => setEditingVideo(null)} 
                className="rounded-lg p-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200 shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-4 md:p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Video Title *</label>
                  <input
                    type="text"
                    required
                    value={editingVideo.title || ''}
                    onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Thumbnail URL *</label>
                  <input
                    type="url"
                    required
                    value={editingVideo.thumbnail || ''}
                    onChange={(e) => setEditingVideo({...editingVideo, thumbnail: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Video URL (m3u8/mp4) *</label>
                  <input
                    type="url"
                    required
                    value={editingVideo.videoUrl || ''}
                    onChange={(e) => setEditingVideo({...editingVideo, videoUrl: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration *</label>
                  <input
                    type="text"
                    required
                    value={editingVideo.duration || ''}
                    onChange={(e) => setEditingVideo({...editingVideo, duration: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Select Admin Profile</label>
                  {adminProfiles.length === 0 ? (
                    <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                      No admin profiles available to select. Keeping existing author name.
                    </div>
                  ) : (
                    <select
                      required
                      value={editingVideo.selectedProfileId || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, selectedProfileId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select Profile</option>
                      {adminProfiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center justify-between py-3 border-t border-slate-100 mt-2">
                  <div>
                    <label className="text-sm font-bold tracking-tight text-slate-800">Require Unlock</label>
                    <p className="text-[11px] text-slate-500 font-medium">Force users to complete ad steps</p>
                  </div>
                  <label className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!editingVideo.requiresUnlock}
                      onChange={(e) => setEditingVideo({...editingVideo, requiresUnlock: e.target.checked})}
                    />
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-sm"></div>
                  </label>
                </div>

                {editingVideo.requiresUnlock && (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-indigo-50 border border-indigo-100 p-5 mt-1 shadow-inner">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-indigo-700">Unlock Link *</label>
                      <input
                        type="url"
                        required={editingVideo.requiresUnlock}
                        value={editingVideo.targetLink || ''}
                        onChange={(e) => setEditingVideo({...editingVideo, targetLink: e.target.value})}
                        className="w-full rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-indigo-700">Number of Ads to Watch *</label>
                      <input
                        type="number"
                        min="1"
                        required={editingVideo.requiresUnlock}
                        value={editingVideo.requiredAdsCount || ''}
                        onChange={(e) => setEditingVideo({...editingVideo, requiredAdsCount: parseInt(e.target.value) || 1})}
                        className="w-full sm:w-32 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-md shadow-indigo-200"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
