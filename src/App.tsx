/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Settings, PlaySquare, PlusCircle, ListVideo, Menu, X, Users } from 'lucide-react';
import AddVideo from './pages/AddVideo';
import ManageAds from './pages/ManageAds';
import VideoLibrary from './pages/VideoLibrary';
import ManageProfiles from './pages/ManageProfiles';

type Page = 'video-library' | 'add-video' | 'manage-ads' | 'manage-profiles';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('video-library');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 flex h-full w-64 md:w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex h-16 items-center px-6 justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">V</div>
            <span className="text-lg font-bold tracking-tight text-slate-800 uppercase">StreamAdmin</span>
          </div>
          <button 
            className="md:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Menu</div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleNavClick('video-library')}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-sm font-medium transition-colors ${
                  currentPage === 'video-library'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListVideo className="h-5 w-5 md:h-4 md:w-4" />
                Video Library
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('add-video')}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-sm font-medium transition-colors ${
                  currentPage === 'add-video'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="h-5 w-5 md:h-4 md:w-4" />
                Add New Video
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('manage-ads')}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-sm font-medium transition-colors ${
                  currentPage === 'manage-ads'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings className="h-5 w-5 md:h-4 md:w-4" />
                Manage Ads
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('manage-profiles')}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-sm font-medium transition-colors ${
                  currentPage === 'manage-profiles'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="h-5 w-5 md:h-4 md:w-4" />
                Admin Profiles
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="h-8 w-8 rounded-full bg-slate-300 flex-shrink-0"></div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-700">Administrator</p>
              <p className="truncate text-[10px] text-slate-500">Firebase Firestore</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 min-h-[4rem] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-bold text-slate-800 line-clamp-1">
                {currentPage === 'video-library' ? 'Video Library' : currentPage === 'add-video' ? 'Video Management Dashboard' : currentPage === 'manage-profiles' ? 'Admin Profiles' : 'Global Ads Configuration'}
              </h1>
              <p className="hidden md:block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Direct Firestore Connectivity Enabled</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-emerald-600 border border-emerald-100 uppercase whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span className="hidden sm:inline">Firestore Connected</span>
              <span className="sm:hidden">Connected</span>
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 -webkit-overflow-scrolling-touch">
          <div className="mx-auto max-w-5xl">
            {currentPage === 'video-library' ? <VideoLibrary /> : currentPage === 'add-video' ? <AddVideo /> : currentPage === 'manage-profiles' ? <ManageProfiles /> : <ManageAds />}
          </div>
        </div>
      </main>
    </div>
  );
}
