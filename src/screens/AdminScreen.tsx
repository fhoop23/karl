import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useFoundationData } from '../context/FoundationDataContext';
import {
  ProgramItem,
  NewsArticle,
  TeamMember,
  GalleryPhoto,
  FAQItem,
  TestimonialItem,
  SiteSettings,
  ScreenType
} from '../types';

type AdminTab =
  | 'overview'
  | 'settings'
  | 'programs'
  | 'news'
  | 'leaders'
  | 'gallery'
  | 'subscribers'
  | 'faqs'
  | 'php';

interface AdminScreenProps {
  onNavigate?: (screen: ScreenType) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onNavigate }) => {
  const {
    user,
    isAdmin,
    isSuperAdmin,
    authError,
    phpApiUrl,
    setPhpApiUrl,
    loginWithCredentials,
    loginWithGoogle,
    logout,
    clearAuthError
  } = useAuth();

  const {
    settings,
    programs,
    news,
    leaders,
    gallery,
    testimonials,
    faqs,
    subscribers,
    inquiries,
    isFirestoreConnected,
    updateSettings,
    saveProgram,
    deleteProgram,
    saveNewsArticle,
    deleteNewsArticle,
    saveLeader,
    deleteLeader,
    saveGalleryPhoto,
    deleteGalleryPhoto,
    saveFaq,
    deleteFaq,
    saveTestimonial,
    deleteTestimonial,
    updateInquiryStatus,
    deleteInquiry,
    deleteSubscriber,
    seedDefaultData
  } = useFoundationData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Authentication form state for PHP backend
  const [loginEmail, setLoginEmail] = useState('admin@karlpeacelegacy.org');
  const [loginPassword, setLoginPassword] = useState('admin');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(phpApiUrl || '/api');
  const [phpTestResult, setPhpTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string; ms?: number }>({
    status: 'idle',
    message: ''
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Program edit modal state
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // News edit modal state
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  // Leader edit modal state
  const [editingLeader, setEditingLeader] = useState<TeamMember | null>(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);

  // Gallery edit modal state
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // FAQ edit modal state
  const [editingFaq, setEditingFaq] = useState<{ item: FAQItem; originalQuestion?: string } | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // Testimonial edit modal state
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Show status toast helper
  const showToast = (message: string) => {
    setSaveStatus(message);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleSeed = async () => {
    if (!window.confirm('Populate/refresh Firestore with full foundation content? This will sync all default programs, articles, and profiles.')) {
      return;
    }
    setIsSeeding(true);
    const res = await seedDefaultData();
    setIsSeeding(false);
    showToast(res.message);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
      showToast('Site settings updated successfully!');
    } catch {
      showToast('Error saving settings. Please check permissions.');
    }
  };

  // Export subscribers to CSV
  const handleExportSubscribersCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export yet.');
      return;
    }
    const headers = ['Name', 'Email', 'Institution', 'Course', 'Date', 'Status'];
    const rows = subscribers.map(s => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${(s.institution || '').replace(/"/g, '""')}"`,
      `"${(s.course || '').replace(/"/g, '""')}"`,
      `"${s.createdAt}"`,
      `"${s.status || 'new'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `karl_peace_scholarship_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Not signed in state
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl border border-[#E8E4DA] p-8 shadow-xl flex flex-col items-center text-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1E1B4B] text-[#F59E0B] flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mx-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>PHP Backend Engine Active</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
              Foundation Admin Portal
            </h1>
            <p className="text-xs text-[#4B485A]">
              Sign in with your administrative credentials to update website content, banner announcements, leaders, and review student scholarship leads.
            </p>
          </div>

          {authError && (
            <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between text-left">
              <span>{authError}</span>
              <button onClick={clearAuthError} className="text-red-500 hover:text-red-800">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoggingIn(true);
              try {
                await loginWithCredentials(loginEmail, loginPassword);
              } finally {
                setIsLoggingIn(false);
              }
            }}
            className="w-full flex flex-col gap-4 text-left"
          >
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] mb-1">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@karlpeacelegacy.org"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E8E4DA] text-xs focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="admin"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E8E4DA] text-xs focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@karlpeacelegacy.org');
                setLoginPassword('admin');
              }}
              className="text-left text-[11px] text-[#D97706] hover:text-[#904d00] font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              <span>Click to auto-fill default admin credentials</span>
            </button>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50 mt-1"
            >
              {isLoggingIn ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>

            <div className="pt-2 flex flex-col gap-2 border-t border-[#E8E4DA]">
              <a
                href="/admin.php"
                target="_blank"
                rel="noreferrer"
                className="w-full h-10 rounded-xl bg-[#F8F7F4] hover:bg-[#E8E4DA] text-[#1E1B4B] font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-[#E8E4DA]"
              >
                <span className="material-symbols-outlined text-[16px]">php</span>
                <span>Open Standalone PHP Portal (admin.php) &nearr;</span>
              </a>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="w-full h-10 rounded-xl bg-white hover:bg-[#F8F7F4] text-[#6E6B7E] hover:text-[#1E1B4B] font-medium text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Return to Public Website</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-[#F8F7F4] rounded-xl text-left border border-[#E8E4DA] text-[11px] text-[#6E6B7E] space-y-1">
              <div className="font-bold text-[#1E1B4B] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                <span>PHP Backend Ready</span>
              </div>
              <div>Default credentials: <code className="text-[#D97706] font-mono">admin@karlpeacelegacy.org</code> / <code className="text-[#D97706] font-mono">admin</code>. Super admin access also granted to <code className="text-[#D97706] font-mono">gtech.websites@gmail.com</code>.</div>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // User is logged in, but not an admin or editor
  if (!isAdmin) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-3xl border border-[#E8E4DA] p-8 shadow-xl flex flex-col items-center text-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#D97706] border border-amber-200 flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[32px]">lock</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-bold text-[#D97706] tracking-wider">
              Access Restricted
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#1E1B4B]">
              Administrator Permissions Required
            </h1>
            <p className="text-sm text-[#4B485A]">
              You are signed in as <strong className="text-[#1E1B4B]">{user.email}</strong>.
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              onClick={logout}
              className="flex-1 h-11 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out / Switch Account</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="flex-1 h-11 rounded-xl bg-white hover:bg-[#F8F7F4] text-[#1E1B4B] font-semibold text-xs transition-all border border-[#E8E4DA] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Return to Website</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Toast notification */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#1E1B4B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">check_circle</span>
            <span className="text-sm font-semibold">{saveStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header Bar */}
      <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Admin'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D97706] shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#1E1B4B] text-[#F59E0B] font-bold text-xl flex items-center justify-center shadow-sm">
              {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#1E1B4B]">
                {user.displayName || 'Foundation Administrator'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isSuperAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900'
              }`}>
                {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Administrator' : 'Viewer'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6E6B7E] flex items-center gap-1.5 mt-0.5">
              <span>{user.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PHP API Active</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8F7F4] text-[#1E1B4B] text-xs font-bold transition-all border border-[#E8E4DA] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>View Public Site</span>
            </button>
          )}

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            title="Populate/re-sync Firestore with rich foundation data"
            className="px-4 py-2.5 rounded-xl bg-[#F8F7F4] hover:bg-[#E8E4DA] text-[#1E1B4B] text-xs font-bold transition-all border border-[#E8E4DA] flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSeeding ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSeeding ? 'Seeding...' : 'Seed / Sync Defaults'}</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all border border-red-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#E8E4DA]">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          { id: 'settings', label: 'Site & Alerts', icon: 'tune' },
          { id: 'programs', label: `Programs (${programs.length})`, icon: 'school' },
          { id: 'news', label: `News (${news.length})`, icon: 'newspaper' },
          { id: 'leaders', label: `Leadership (${leaders.length})`, icon: 'groups' },
          { id: 'gallery', label: `Gallery (${gallery.length})`, icon: 'photo_library' },
          { id: 'subscribers', label: `Leads & Inquiries (${subscribers.length + inquiries.length})`, icon: 'mark_email_unread' },
          { id: 'faqs', label: 'FAQs & Testimonials', icon: 'help_outline' },
          { id: 'php', label: 'PHP Backend', icon: 'terminal' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1E1B4B] text-white shadow-md'
                  : 'bg-white text-[#4B485A] hover:bg-[#F8F7F4] border border-[#E8E4DA]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Programs', count: programs.length, icon: 'school', color: 'text-amber-600 bg-amber-50' },
              { label: 'Dispatches', count: news.length, icon: 'campaign', color: 'text-blue-600 bg-blue-50' },
              { label: 'Leaders', count: leaders.length, icon: 'groups', color: 'text-purple-600 bg-purple-50' },
              { label: 'Gallery Photos', count: gallery.length, icon: 'photo_library', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Subscribers', count: subscribers.length, icon: 'notifications_active', color: 'text-orange-600 bg-orange-50' },
              { label: 'Inquiries', count: inquiries.length, icon: 'mail', color: 'text-teal-600 bg-teal-50' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#E8E4DA] p-4 flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-[#1E1B4B]">{stat.count}</div>
                  <div className="text-xs text-[#6E6B7E]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Scholarship Alert Banner Card */}
          <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDF1E7] border border-[#F59E0B]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/80 text-[#904d00] text-xs font-bold self-start">
                <span className="material-symbols-outlined text-[15px]">campaign</span>
                <span>Active Homepage Banner Status</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">
                {settings.scholarshipAlertTitle || '2025/2026 Tertiary Scholarship Framework'}
              </h2>
              <p className="text-sm text-[#4B485A]">
                {settings.scholarshipAlertText || 'Review verified eligibility requirements.'}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#1E1B4B] mt-1">
                <span>Cycle: {settings.scholarshipAlertCycle}</span>
                <span>•</span>
                <span>Status: {settings.scholarshipAlertDeadline}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={async () => {
                  const newActive = !settings.scholarshipAlertActive;
                  await updateSettings({ scholarshipAlertActive: newActive });
                  setSettingsForm(prev => ({ ...prev, scholarshipAlertActive: newActive }));
                  showToast(`Scholarship alert ${newActive ? 'enabled' : 'disabled'}`);
                }}
                className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                  settings.scholarshipAlertActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {settings.scholarshipAlertActive ? 'toggle_on' : 'toggle_off'}
                </span>
                <span>{settings.scholarshipAlertActive ? 'Banner Active' : 'Banner Hidden'}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-white/80 text-[#1E1B4B] font-bold text-sm transition-all border border-[#E8E4DA]"
              >
                Configure Text
              </button>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">post_add</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Post New Dispatch</h3>
                <p className="text-xs text-[#6E6B7E]">
                  Broadcast an academic cycle notice, press release, or campus scholarship update.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingArticle({
                    id: `dispatch-${Date.now()}`,
                    title: '',
                    category: 'Official Bulletin',
                    categoryType: 'scholarship',
                    cycle: 'Academic Cycle 2025/2026',
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    location: 'Abuja & Lagos, Nigeria',
                    summary: '',
                    fullContent: '',
                    isUrgent: false
                  });
                  setIsNewsModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#1E1B4B] text-white text-xs font-bold hover:bg-[#312E81] transition-all text-center"
              >
                Create Announcement
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Upload Impact Photo</h3>
                <p className="text-xs text-[#6E6B7E]">
                  Add pictures of community outreach, health workshops, or university scholars.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPhoto({
                    id: `photo-${Date.now()}`,
                    title: '',
                    caption: '',
                    category: 'scholarships',
                    image: '',
                    location: 'Abuja, Nigeria',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  });
                  setIsGalleryModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#1E1B4B] text-white text-xs font-bold hover:bg-[#312E81] transition-all text-center"
              >
                Add Photo to Gallery
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">download</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Export Scholarship Leads</h3>
                <p className="text-xs text-[#6E6B7E]">
                  Download verified CSV of Nigerian students who signed up for scholarship opening updates.
                </p>
              </div>
              <button
                onClick={handleExportSubscribersCSV}
                className="w-full py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-all text-center"
              >
                Download CSV ({subscribers.length} Students)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Site Settings & Alerts */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm flex flex-col gap-8">
          <div className="border-b border-[#E8E4DA] pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">Global Site Settings</h2>
            <p className="text-xs text-[#6E6B7E]">
              Control the hero titles, official contact channels, and scholarship alert banner without touching code.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#D97706]">web</span>
              <span>Hero Section Content</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#1E1B4B]">Hero Headline</label>
                <input
                  type="text"
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-[#1E1B4B]">Hero Subtitle Narrative</label>
                <textarea
                  rows={3}
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  className="w-full p-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1E1B4B]">Hero Eyebrow Badge</label>
                <input
                  type="text"
                  value={settingsForm.heroBadge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="border-t border-[#E8E4DA] pt-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#D97706]">contact_mail</span>
                <span>Official Contact &amp; Secretariat</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E1B4B]">Contact Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E1B4B]">Official Phone / Desk</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E1B4B]">Secretariat Location / Address</label>
                  <input
                    type="text"
                    value={settingsForm.officeAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, officeAddress: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8E4DA] pt-6 flex flex-col gap-6">
              <h3 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#D97706]">campaign</span>
                <span>Scholarship Callout Banner</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    id="scholarshipAlertActive"
                    checked={settingsForm.scholarshipAlertActive}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scholarshipAlertActive: e.target.checked })}
                    className="w-5 h-5 rounded text-[#D97706] focus:ring-[#D97706]"
                  />
                  <label htmlFor="scholarshipAlertActive" className="text-sm font-bold text-[#1E1B4B] cursor-pointer">
                    Display Scholarship Alert Banner on Homepage and Announcements
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E1B4B]">Banner Headline</label>
                  <input
                    type="text"
                    value={settingsForm.scholarshipAlertTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scholarshipAlertTitle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E1B4B]">Academic Cycle Tag</label>
                  <input
                    type="text"
                    value={settingsForm.scholarshipAlertCycle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scholarshipAlertCycle: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-[#1E1B4B]">Banner Description Text</label>
                  <textarea
                    rows={2}
                    value={settingsForm.scholarshipAlertText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scholarshipAlertText: e.target.value })}
                    className="w-full p-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1E1B4B]">Status / Deadline Snippet</label>
                  <input
                    type="text"
                    value={settingsForm.scholarshipAlertDeadline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scholarshipAlertDeadline: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-[#E8E4DA] text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E8E4DA] pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Settings to Database</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Programs Manager */}
      {activeTab === 'programs' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">Foundation Programs</h2>
              <p className="text-xs text-[#6E6B7E]">Add or edit programs offered to Nigerian undergraduates and youth.</p>
            </div>
            <button
              onClick={() => {
                setEditingProgram({
                  id: `program-${Date.now()}`,
                  title: '',
                  category: 'scholarships',
                  badge: 'Program',
                  badgeColor: 'bg-[#FEF3C7] text-[#904d00]',
                  image: '',
                  description: '',
                  keyPoints: ['Point 1', 'Point 2'],
                  detailedNarrative: '',
                  eligibilitySnippet: '',
                  timeline: ''
                });
                setIsProgramModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Program</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-3xl border border-[#E8E4DA] p-6 flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${program.badgeColor || 'bg-amber-100 text-amber-800'}`}>
                      {program.badge}
                    </span>
                    <span className="text-xs uppercase font-semibold text-[#6E6B7E]">
                      {program.category}
                    </span>
                  </div>

                  {program.image && (
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-40 object-cover rounded-2xl border border-[#E8E4DA]"
                    />
                  )}

                  <h3 className="font-serif text-xl font-bold text-[#1E1B4B]">{program.title}</h3>
                  <p className="text-xs text-[#4B485A] line-clamp-3 leading-relaxed">{program.description}</p>

                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[11px] font-bold text-[#1E1B4B] uppercase">Key Highlights:</span>
                    <ul className="text-xs text-[#6E6B7E] list-disc list-inside space-y-0.5">
                      {program.keyPoints?.slice(0, 3).map((pt, i) => (
                        <li key={i} className="line-clamp-1">{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#E8E4DA] pt-3">
                  <button
                    onClick={() => {
                      setEditingProgram(program);
                      setIsProgramModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#1E1B4B] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete program "${program.title}"?`)) {
                        await deleteProgram(program.id);
                        showToast('Program deleted');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: News & Dispatches */}
      {activeTab === 'news' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">News &amp; Official Dispatches</h2>
              <p className="text-xs text-[#6E6B7E]">Publish board decisions, scholarship cycles, and community announcements.</p>
            </div>
            <button
              onClick={() => {
                setEditingArticle({
                  id: `dispatch-${Date.now()}`,
                  title: '',
                  category: 'Official Bulletin',
                  categoryType: 'scholarship',
                  cycle: 'Academic Cycle 2025/2026',
                  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                  location: 'Abuja & Lagos, Nigeria',
                  summary: '',
                  fullContent: '',
                  isUrgent: false
                });
                setIsNewsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Publish Article</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-[#E8E4DA] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
              >
                <div className="flex flex-col gap-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {article.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                        Urgent Announcement
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                      {article.category}
                    </span>
                    <span className="text-xs text-[#6E6B7E]">{article.date}</span>
                    <span className="text-xs text-[#6E6B7E]">• {article.location}</span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E1B4B]">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#4B485A] line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingArticle(article);
                      setIsNewsModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#1E1B4B] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete article "${article.title}"?`)) {
                        await deleteNewsArticle(article.id);
                        showToast('Article deleted');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Leadership & Governance */}
      {activeTab === 'leaders' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">Leadership &amp; Governance</h2>
              <p className="text-xs text-[#6E6B7E]">Manage founders, executive directors, patrons, and trustees.</p>
            </div>
            <button
              onClick={() => {
                setEditingLeader({
                  id: `leader-${Date.now()}`,
                  name: '',
                  role: '',
                  category: 'executive',
                  badge: 'Leadership',
                  tagline: '',
                  shortBio: '',
                  fullBio: '',
                  image: '',
                  department: 'Executive Office',
                  linkedin: 'https://linkedin.com',
                  twitter: 'https://x.com/karlpeacelegacy',
                  email: 'contact@karlpeacelegacy.org',
                  quote: '',
                  keyContributions: ['Contribution 1', 'Contribution 2']
                });
                setIsLeaderModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Add Leader</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((leader) => (
              <div
                key={leader.id}
                className="bg-white rounded-3xl border border-[#E8E4DA] p-6 flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-20 rounded-2xl overflow-hidden bg-[#F4F1EA] border border-[#E8E4DA] shrink-0 flex items-center justify-center">
                    <img
                      src={leader.image || 'https://via.placeholder.com/150'}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30 scale-110 select-none pointer-events-none"
                    />
                    <img
                      src={leader.image || 'https://via.placeholder.com/150'}
                      alt={leader.name}
                      className="relative z-10 w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#D97706] tracking-wider">
                      {leader.category}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#1E1B4B]">{leader.name}</h3>
                    <p className="text-xs text-[#6E6B7E] font-medium">{leader.role}</p>
                    <p className="text-[11px] text-[#4B485A] mt-1 line-clamp-2">{leader.shortBio}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#E8E4DA] pt-3">
                  <button
                    onClick={() => {
                      setEditingLeader(leader);
                      setIsLeaderModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#1E1B4B] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete profile for "${leader.name}"?`)) {
                        await deleteLeader(leader.id);
                        showToast('Leader removed');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Photo Gallery */}
      {activeTab === 'gallery' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">Impact Photo Gallery</h2>
              <p className="text-xs text-[#6E6B7E]">Add photos from community health campaigns, university visits, and workshops.</p>
            </div>
            <button
              onClick={() => {
                setEditingPhoto({
                  id: `photo-${Date.now()}`,
                  title: '',
                  caption: '',
                  category: 'scholarships',
                  image: '',
                  location: 'Abuja, Nigeria',
                  date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                });
                setIsGalleryModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              <span>Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((photo) => (
              <div key={photo.id} className="bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden flex flex-col group shadow-2xs">
                <div className="relative aspect-4/3 bg-stone-100">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                    {photo.category}
                  </span>
                </div>
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <h4 className="font-serif text-xs font-bold text-[#1E1B4B] line-clamp-1">{photo.title}</h4>
                    <p className="text-[11px] text-[#6E6B7E] line-clamp-2">{photo.caption}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DA] text-[10px] text-[#6E6B7E]">
                    <span>{photo.location}</span>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete photo "${photo.title}"?`)) {
                          await deleteGalleryPhoto(photo.id);
                          showToast('Photo deleted');
                        }
                      }}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Leads & Inquiries (CRM) */}
      {activeTab === 'subscribers' && (
        <div className="flex flex-col gap-8">
          {/* Subscribers Table */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4DA] pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1E1B4B]">
                  Scholarship Alert Subscribers ({subscribers.length})
                </h2>
                <p className="text-xs text-[#6E6B7E]">
                  Students who registered on the site to be notified for the next scholarship cycle.
                </p>
              </div>

              <button
                onClick={handleExportSubscribersCSV}
                className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[17px]">download</span>
                <span>Export CSV</span>
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#6E6B7E]">
                No student subscribers registered yet. Submissions via the Scholarship Alert modal will appear here in real time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#4B485A]">
                  <thead className="bg-[#F8F7F4] text-[#1E1B4B] uppercase font-bold text-[11px] border-y border-[#E8E4DA]">
                    <tr>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Institution</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DA]">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#FDFBF7]">
                        <td className="py-3 px-4 font-bold text-[#1E1B4B]">{sub.name}</td>
                        <td className="py-3 px-4">
                          <a href={`mailto:${sub.email}`} className="text-[#D97706] hover:underline">
                            {sub.email}
                          </a>
                        </td>
                        <td className="py-3 px-4">{sub.institution || '—'}</td>
                        <td className="py-3 px-4">{sub.course || '—'}</td>
                        <td className="py-3 px-4 text-[#6E6B7E]">
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete subscriber ${sub.name}?`)) {
                                await deleteSubscriber(sub.id);
                                showToast('Subscriber record deleted');
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inquiries Table */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <div className="border-b border-[#E8E4DA] pb-4">
              <h2 className="font-serif text-xl font-bold text-[#1E1B4B]">
                Public Contact Inquiries ({inquiries.length})
              </h2>
              <p className="text-xs text-[#6E6B7E]">
                Direct messages submitted via the Contact form desk.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#6E6B7E]">
                No public contact inquiries submitted yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-2xl border border-[#E8E4DA] bg-[#FDFBF7] flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1E1B4B] text-sm">{inq.name}</span>
                        <span className="text-xs text-[#6E6B7E]">({inq.email})</span>
                        <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                          {inq.role || 'Visitor'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <select
                          value={inq.status || 'unread'}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as 'unread' | 'replied' | 'archived')}
                          className="h-7 px-2 rounded-lg border border-[#E8E4DA] bg-white text-xs font-medium"
                        >
                          <option value="unread">Unread</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this inquiry?')) {
                              await deleteInquiry(inq.id);
                              showToast('Inquiry removed');
                            }
                          }}
                          className="text-red-600 hover:text-red-800 font-bold ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#D97706]">{inq.subject}</p>
                    <p className="text-xs text-[#4B485A] whitespace-pre-wrap leading-relaxed">{inq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 8: FAQs & Testimonials */}
      {activeTab === 'faqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQs section */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Frequently Asked Questions</h3>
                <p className="text-xs text-[#6E6B7E]">Official guidance for applicants</p>
              </div>
              <button
                onClick={() => {
                  setEditingFaq({
                    item: { question: '', answer: '', category: 'scholarships' }
                  });
                  setIsFaqModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1E1B4B] text-white text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <div key={i} className="p-3 rounded-xl border border-[#E8E4DA] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-[#1E1B4B]">{faq.question}</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingFaq({ item: faq, originalQuestion: faq.question });
                          setIsFaqModalOpen(true);
                        }}
                        className="text-stone-600 hover:text-stone-900 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <span>•</span>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete FAQ: "${faq.question}"?`)) {
                            await deleteFaq(faq.question);
                            showToast('FAQ deleted');
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#6E6B7E] line-clamp-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials section */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Student Testimonials</h3>
                <p className="text-xs text-[#6E6B7E]">Quotes from verified Nigerian scholars</p>
              </div>
              <button
                onClick={() => {
                  setEditingTestimonial({
                    id: `testimonial-${Date.now()}`,
                    name: '',
                    institution: '',
                    field: '',
                    quote: '',
                    year: 'Class of 2025'
                  });
                  setIsTestimonialModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1E1B4B] text-white text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                <span>Add Quote</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {testimonials.map((test) => (
                <div key={test.id} className="p-3 rounded-xl border border-[#E8E4DA] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-[#1E1B4B]">{test.name} ({test.institution})</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTestimonial(test);
                          setIsTestimonialModalOpen(true);
                        }}
                        className="text-stone-600 hover:text-stone-900 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <span>•</span>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete testimonial from "${test.name}"?`)) {
                            await deleteTestimonial(test.id);
                            showToast('Testimonial removed');
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#4B485A] italic line-clamp-2">"{test.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: PHP Backend & Hosting Architecture */}
      {activeTab === 'php' && (
        <div className="flex flex-col gap-8">
          {/* Status Banner */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold self-start border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PHP Architecture Active • Zero Firebase Requirement</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1E1B4B]">
                PHP Backend & Server Deployment
              </h2>
              <p className="text-xs sm:text-sm text-[#4B485A]">
                The administrative portal is completely decoupled from Firebase. All operations can run through standard PHP API endpoints on any Apache, cPanel, or Nginx server.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/admin.php"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>Open Standalone admin.php</span>
              </a>

              <a
                href="/api/export.php"
                download="karl_peace_backup.json"
                className="px-4 py-2.5 rounded-xl bg-[#F8F7F4] hover:bg-[#E8E4DA] text-[#1E1B4B] text-xs font-bold transition-all border border-[#E8E4DA] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export JSON Backup</span>
              </a>
            </div>
          </div>

          {/* PHP API Endpoint & Live Ping Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-serif text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D97706]">link</span>
                <span>Active PHP API Endpoint</span>
              </h3>
              <p className="text-xs text-[#6E6B7E]">
                Set the base URL for the PHP API. By default, it uses the local <code className="text-[#D97706] font-mono">/api</code> folder. If you deploy the PHP scripts to a dedicated domain (e.g., <code className="text-[#D97706] font-mono">https://karlpeacelegacy.org/api</code>), enter it below:
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="/api"
                  className="flex-1 h-11 px-3.5 rounded-xl border border-[#E8E4DA] text-xs font-mono focus:outline-none focus:border-[#D97706]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhpApiUrl(customApiUrl);
                    showToast('PHP API endpoint updated!');
                  }}
                  className="px-4 h-11 rounded-xl bg-[#1E1B4B] text-white font-bold text-xs hover:bg-[#312E81] transition-all"
                >
                  Save URL
                </button>
              </div>

              {/* Ping Tester */}
              <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#E8E4DA] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E1B4B]">Endpoint Diagnostic</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setPhpTestResult({ status: 'testing', message: 'Pinging PHP endpoint...' });
                      const start = performance.now();
                      try {
                        const res = await fetch(`${customApiUrl}/data.php`);
                        const time = Math.round(performance.now() - start);
                        if (res.ok) {
                          const json = await res.json();
                          setPhpTestResult({
                            status: 'success',
                            message: `Connected successfully! HTTP 200 OK (${json.source || 'PHP backend'}).`,
                            ms: time
                          });
                        } else {
                          setPhpTestResult({
                            status: 'error',
                            message: `Returned HTTP ${res.status}: ${res.statusText}`,
                            ms: time
                          });
                        }
                      } catch (err) {
                        setPhpTestResult({
                          status: 'error',
                          message: err instanceof Error ? err.message : 'Network request failed'
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E8E4DA] text-xs font-bold text-[#1E1B4B] hover:bg-stone-50 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    <span>Test Ping</span>
                  </button>
                </div>

                {phpTestResult.status !== 'idle' && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    phpTestResult.status === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : phpTestResult.status === 'testing'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>{phpTestResult.message}</span>
                      {phpTestResult.ms && <span>{phpTestResult.ms}ms</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PHP Backend Files Overview */}
            <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-serif text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D97706]">folder_zip</span>
                <span>PHP Backend Files Created</span>
              </h3>
              <p className="text-xs text-[#6E6B7E]">
                All files are located in <code className="text-[#D97706] font-mono">/public/api/</code> and ready for Apache / cPanel:
              </p>

              <div className="space-y-2 text-xs font-mono">
                {[
                  { file: 'public/admin.php', desc: 'Standalone single-file Admin CMS with pure PHP' },
                  { file: 'public/api/config.php', desc: 'CORS, token verification & JSON data engine' },
                  { file: 'public/api/login.php', desc: 'POST authentication endpoint' },
                  { file: 'public/api/data.php', desc: 'GET/POST full foundation content' },
                  { file: 'public/api/subscribers.php', desc: 'Scholarship applicant registration & listing' },
                  { file: 'public/api/inquiries.php', desc: 'Contact inquiries intake & status tracker' },
                  { file: 'public/api/export.php', desc: 'JSON database backup stream' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA] flex items-center justify-between gap-2">
                    <div className="font-bold text-[#1E1B4B] truncate">{item.file}</div>
                    <div className="text-[11px] text-[#6E6B7E] shrink-0">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* cPanel / Shared Hosting Instructions */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] p-6 sm:p-8 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D97706]">cloud_upload</span>
              <span>How to Host on cPanel / Apache / Shared Hosting</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#4B485A]">
              <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E4DA] flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1E1B4B] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-sm text-[#1E1B4B]">Upload Build Files</h4>
                <p>
                  Run <code className="font-mono text-[#D97706]">npm run build</code> and upload the contents of the <code className="font-mono text-[#D97706]">dist/</code> directory into your cPanel <code className="font-mono text-[#D97706]">public_html/</code> directory via File Manager or FTP.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E4DA] flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1E1B4B] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-sm text-[#1E1B4B]">Set Permissions</h4>
                <p>
                  Ensure the <code className="font-mono text-[#D97706]">data/</code> directory in <code className="font-mono text-[#D97706]">public_html/</code> has write permissions (<code className="font-mono text-[#D97706]">chmod 755</code> or <code className="font-mono text-[#D97706]">775</code>) so PHP can write <code className="font-mono text-[#D97706]">foundation_data.json</code>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#E8E4DA] flex flex-col gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1E1B4B] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-sm text-[#1E1B4B]">Access Admin Portal</h4>
                <p>
                  Navigate to <code className="font-mono text-[#D97706]">https://yourdomain.com/admin.php</code> or the in-app Admin Portal. Login using <code className="font-mono text-[#D97706]">admin@karlpeacelegacy.org</code> and password <code className="font-mono text-[#D97706]">admin</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Edit Modal */}
      {isProgramModalOpen && editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl border border-[#E8E4DA]">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B4B]">
                {editingProgram.id.startsWith('program-') && !programs.find(p => p.id === editingProgram.id) ? 'Add Program' : 'Edit Program'}
              </h3>
              <button onClick={() => setIsProgramModalOpen(false)} className="text-[#6E6B7E] hover:text-[#1E1B4B]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveProgram(editingProgram);
                setIsProgramModalOpen(false);
                showToast('Program saved to database!');
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProgram.title}
                    onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Category</label>
                  <select
                    value={editingProgram.category}
                    onChange={(e) => setEditingProgram({ ...editingProgram, category: e.target.value as ProgramItem['category'] })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  >
                    <option value="scholarships">Scholarships</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="health">Public Health</option>
                    <option value="opportunities">Opportunities</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Badge Text</label>
                  <input
                    type="text"
                    value={editingProgram.badge}
                    onChange={(e) => setEditingProgram({ ...editingProgram, badge: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Image URL</label>
                  <input
                    type="text"
                    value={editingProgram.image}
                    onChange={(e) => setEditingProgram({ ...editingProgram, image: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Short Summary</label>
                <textarea
                  rows={2}
                  required
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Detailed Narrative (Long Overview)</label>
                <textarea
                  rows={4}
                  value={editingProgram.detailedNarrative || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, detailedNarrative: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Eligibility Snippet</label>
                  <input
                    type="text"
                    value={editingProgram.eligibilitySnippet || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, eligibilitySnippet: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Timeline / Cycle</label>
                  <input
                    type="text"
                    value={editingProgram.timeline || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, timeline: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Key Highlights (comma-separated or one per line)</label>
                <textarea
                  rows={3}
                  value={editingProgram.keyPoints?.join('\n') || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, keyPoints: e.target.value.split('\n').filter(Boolean) })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                  placeholder="Tuition Assistance&#10;Textbook grants&#10;Mentorship access"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B4B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News Article Edit Modal */}
      {isNewsModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl border border-[#E8E4DA]">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B4B]">
                {editingArticle.id.startsWith('dispatch-') && !news.find(n => n.id === editingArticle.id) ? 'Create Announcement' : 'Edit Dispatch'}
              </h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="text-[#6E6B7E] hover:text-[#1E1B4B]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveNewsArticle(editingArticle);
                setIsNewsModalOpen(false);
                showToast('Article published to database!');
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isUrgentArticle"
                  checked={editingArticle.isUrgent || false}
                  onChange={(e) => setEditingArticle({ ...editingArticle, isUrgent: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isUrgentArticle" className="font-bold text-red-700 cursor-pointer">
                  Mark as Urgent Alert / Breaking Bulletin
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Article Headline</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Category Label</label>
                  <input
                    type="text"
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                    placeholder="e.g. Official Bulletin"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Category Type</label>
                  <select
                    value={editingArticle.categoryType}
                    onChange={(e) => setEditingArticle({ ...editingArticle, categoryType: e.target.value as NewsArticle['categoryType'] })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="health">Health Initiative</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="bulletin">General Bulletin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Academic Cycle</label>
                  <input
                    type="text"
                    value={editingArticle.cycle}
                    onChange={(e) => setEditingArticle({ ...editingArticle, cycle: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Publish Date</label>
                  <input
                    type="text"
                    value={editingArticle.date}
                    onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Location</label>
                  <input
                    type="text"
                    value={editingArticle.location}
                    onChange={(e) => setEditingArticle({ ...editingArticle, location: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Summary Teaser (appears on card)</label>
                <textarea
                  rows={2}
                  required
                  value={editingArticle.summary}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Full Dispatch Content</label>
                <textarea
                  rows={8}
                  required
                  value={editingArticle.fullContent}
                  onChange={(e) => setEditingArticle({ ...editingArticle, fullContent: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B4B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold"
                >
                  Publish Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leader Edit Modal */}
      {isLeaderModalOpen && editingLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-2xl border border-[#E8E4DA]">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B4B]">
                {editingLeader.id.startsWith('leader-') && !leaders.find(l => l.id === editingLeader.id) ? 'Add Leader' : 'Edit Leader Profile'}
              </h3>
              <button onClick={() => setIsLeaderModalOpen(false)} className="text-[#6E6B7E] hover:text-[#1E1B4B]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveLeader(editingLeader);
                setIsLeaderModalOpen(false);
                showToast('Leader profile updated in database!');
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingLeader.name}
                    onChange={(e) => setEditingLeader({ ...editingLeader, name: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Role / Title</label>
                  <input
                    type="text"
                    required
                    value={editingLeader.role}
                    onChange={(e) => setEditingLeader({ ...editingLeader, role: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Governance Category</label>
                  <select
                    value={editingLeader.category}
                    onChange={(e) => setEditingLeader({ ...editingLeader, category: e.target.value as TeamMember['category'] })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  >
                    <option value="founder">Founder & President</option>
                    <option value="executive">Executive Director / Officer</option>
                    <option value="operations">Field Operations</option>
                    <option value="patron">Patron & Inspiration</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Photo URL</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editingLeader.image}
                      onChange={(e) => setEditingLeader({ ...editingLeader, image: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs font-mono"
                    />
                    {editingLeader.image && (
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#F4F1EA] border border-[#E8E4DA] shrink-0 flex items-center justify-center" title="Photo Preview">
                        <img
                          src={editingLeader.image}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Short Summary Bio</label>
                <textarea
                  rows={2}
                  required
                  value={editingLeader.shortBio}
                  onChange={(e) => setEditingLeader({ ...editingLeader, shortBio: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Full Narrative Bio</label>
                <textarea
                  rows={5}
                  value={editingLeader.fullBio}
                  onChange={(e) => setEditingLeader({ ...editingLeader, fullBio: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editingLeader.linkedin || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, linkedin: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Twitter / X URL</label>
                  <input
                    type="text"
                    value={editingLeader.twitter || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, twitter: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Contact Email</label>
                  <input
                    type="text"
                    value={editingLeader.email || ''}
                    onChange={(e) => setEditingLeader({ ...editingLeader, email: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setIsLeaderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B4B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Photo Modal */}
      {isGalleryModalOpen && editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl border border-[#E8E4DA]">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B4B]">Add / Edit Photo</h3>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-[#6E6B7E] hover:text-[#1E1B4B]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveGalleryPhoto(editingPhoto);
                setIsGalleryModalOpen(false);
                showToast('Gallery photo saved!');
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Photo Title</label>
                <input
                  type="text"
                  required
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Image Direct URL</label>
                <input
                  type="url"
                  required
                  value={editingPhoto.image}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, image: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Category</label>
                  <select
                    value={editingPhoto.category}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value as GalleryPhoto['category'] })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  >
                    <option value="scholarships">Scholarships</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="health">Public Health</option>
                    <option value="community">Community</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Location</label>
                  <input
                    type="text"
                    value={editingPhoto.location}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, location: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Caption / Narrative</label>
                <textarea
                  rows={2}
                  value={editingPhoto.caption}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, caption: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B4B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border border-[#E8E4DA]">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Edit FAQ</h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-[#6E6B7E]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveFaq(editingFaq.item, editingFaq.originalQuestion);
                setIsFaqModalOpen(false);
                showToast('FAQ updated!');
              }}
              className="flex flex-col gap-3 text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.item.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, item: { ...editingFaq.item, question: e.target.value } })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Category</label>
                <select
                  value={editingFaq.item.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, item: { ...editingFaq.item, category: e.target.value as FAQItem['category'] } })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                >
                  <option value="scholarships">Scholarships</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.item.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, item: { ...editingFaq.item, answer: e.target.value } })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B4B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 flex flex-col gap-4 shadow-2xl border border-[#E8E4DA]">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#1E1B4B]">Edit Testimonial</h3>
              <button onClick={() => setIsTestimonialModalOpen(false)} className="text-[#6E6B7E]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveTestimonial(editingTestimonial);
                setIsTestimonialModalOpen(false);
                showToast('Testimonial saved!');
              }}
              className="flex flex-col gap-3 text-xs"
            >
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Scholar Name</label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.name}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Institution</label>
                  <input
                    type="text"
                    value={editingTestimonial.institution}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, institution: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1E1B4B]">Field / Degree</label>
                  <input
                    type="text"
                    value={editingTestimonial.field}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, field: e.target.value })}
                    className="h-10 px-3 rounded-xl border border-[#E8E4DA] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#1E1B4B]">Quote</label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  className="p-3 rounded-xl border border-[#E8E4DA] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E4DA]">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B4B] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white font-bold"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
