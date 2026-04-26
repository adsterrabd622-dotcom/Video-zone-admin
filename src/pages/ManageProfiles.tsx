import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Users, Trash2, Edit, Save, Plus, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function ManageProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [adminName, setAdminName] = useState('');
  const [adminProfilePic, setAdminProfilePic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'adminProfiles'), (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setProfiles(data);
    }, (error) => {
      console.error('Error fetching admin profiles:', error);
      toast.error('Failed to load profiles');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminProfilePic) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving profile...');

    try {
      if (editingId) {
        await setDoc(doc(db, 'adminProfiles', editingId), {
          name: adminName,
          profilePic: adminProfilePic,
          updatedAt: Date.now()
        }, { merge: true });
        toast.success("Profile updated successfully", { id: toastId });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'adminProfiles'), {
          name: adminName,
          profilePic: adminProfilePic,
          createdAt: Date.now()
        });
        toast.success("Profile created successfully", { id: toastId });
      }
      setAdminName('');
      setAdminProfilePic('');
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to save profile", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (profile: any) => {
    setAdminName(profile.name);
    setAdminProfilePic(profile.profilePic);
    setEditingId(profile.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      const toastId = toast.loading('Deleting profile...');
      try {
        await deleteDoc(doc(db, 'adminProfiles', id));
        toast.success('Profile deleted', { id: toastId });
      } catch (error: any) {
        console.error("Error deleting profile:", error);
        toast.error("Failed to delete profile", { id: toastId });
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAdminName('');
    setAdminProfilePic('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <Toaster position="top-right" />
      
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full max-w-full">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-4 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            {editingId ? 'Edit Profile' : 'Add New Admin Profile'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="col-span-1">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Admin Name *</label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Profile Pic URL *</label>
              <input
                type="url"
                required
                value={adminProfilePic}
                onChange={(e) => setAdminProfilePic(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base sm:text-sm focus:border-indigo-500 focus:outline-none transition-colors shadow-sm"
                placeholder="https://..."
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 mt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 md:py-2.5 text-base md:text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-colors focus:ring-4 focus:ring-indigo-200"
              >
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Profile' : 'Save Profile')}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col max-w-full">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-4">
          <h2 className="text-sm font-bold text-slate-700">Saved Admin Profiles ({profiles.length})</h2>
        </div>
        
        {profiles.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">
            No admin profiles found. Create one above to easily select them when adding videos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 md:p-6 bg-slate-50/50">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white border text-sm font-medium border-slate-200 rounded-xl p-4 flex flex-col items-center shadow-sm relative hover:shadow-md transition-shadow">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-indigo-100 mb-3 bg-slate-100">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl text-indigo-400">
                      <Users className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-center line-clamp-1">{profile.name}</h3>
                
                <div className="flex gap-2 mt-4 w-full">
                  <button
                    onClick={() => handleEdit(profile)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors border border-indigo-100"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
