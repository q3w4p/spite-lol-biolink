import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Award,
  Settings,
  Palette,
  Link2,
  Image,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowRight,
  Plus,
  MoreHorizontal,
  HelpCircle,
  LogOut,
  Eye,
  EyeOff,
  Mail,
  AtSign,
  TrendingUp,
  Hash,
  Zap,
  Edit3,
  Globe,
  Sparkles,
  Shield,
  Crown,
  Menu,
  X,
  MousePointer,
  Layers,
  Music,
  Brush,
  Type,
} from 'lucide-react';
import { authAPI, profileAPI } from '../utils/api';
import { SOCIAL_PLATFORMS, BADGES, SocialPlatform, BadgeDefinition } from '../config/socialLinks';
import { User as UserType } from '../App';

interface DashboardPageProps {
  user: UserType | null;
}

export default function DashboardPage({ user: propUser }: DashboardPageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(propUser);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [copied, setCopied] = useState(false);

  // Customization settings
  const [monochromeIcons, setMonochromeIcons] = useState(false);
  const [iconPreset, setIconPreset] = useState('minimalist');
  const [typewriterEffect, setTypewriterEffect] = useState(false);
  const [cursorEffect, setCursorEffect] = useState('none');
  const [cursorColor, setCursorColor] = useState('#059669');
  const [cursorDensity, setCursorDensity] = useState(50);

  useEffect(() => {
    // Check for token in URL (from Discord OAuth)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/dashboard');
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([
        authAPI.getMe(),
        profileAPI.getMyProfile().catch(() => ({ data: null })),
      ]);
      setUser(userRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    localStorage.removeItem('token');
    navigate('/login');
  };

  const copyProfileUrl = () => {
    if (user) {
      navigator.clipboard.writeText(`https://spite.lol/${user.username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', section: 'ACCOUNT' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', section: 'ACCOUNT' },
    { id: 'badges', icon: Award, label: 'Badges', section: 'ACCOUNT' },
    { id: 'settings', icon: Settings, label: 'Settings', section: 'ACCOUNT' },
    { id: 'customize', icon: Palette, label: 'Customize', section: 'CUSTOMIZE' },
    { id: 'themes', icon: Sparkles, label: 'Themes', section: 'CUSTOMIZE' },
    { id: 'links', icon: Link2, label: 'Links', section: 'CUSTOMIZE' },
    { id: 'images', icon: Image, label: 'Image Host', section: 'TOOLS' },
    { id: 'templates', icon: FileText, label: 'Templates', section: 'TOOLS' },
  ];

  const profileCompletion = [
    { label: 'Add a display name', done: !!user?.displayName, icon: Edit3 },
    { label: 'Add a description', done: !!profile?.bio, icon: FileText },
    { label: 'Pick a theme color', done: false, icon: Palette },
    { label: 'Link your socials', done: false, icon: Globe },
  ];

  const completedCount = profileCompletion.filter(item => item.done).length;
  const completionPercent = Math.round((completedCount / profileCompletion.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const totalClicks = profile?.links?.reduce((sum: number, link: any) => sum + (link.click_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar fixed left-0 top-0 h-screen z-40 hidden lg:flex flex-col"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="spite.lol" className="w-full h-full object-contain" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <span className="text-sm font-medium text-gray-400">SPITE.LOL</span>
                  <p className="text-xs text-[#059669]">Creator Hub</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {['ACCOUNT', 'CUSTOMIZE', 'TOOLS'].map(section => (
            <div key={section} className="mb-2">
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="sidebar-section-title"
                  >
                    {section}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="px-2 space-y-1">
                {sidebarItems
                  .filter(item => item.section === section)
                  .map(item => (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`sidebar-item w-full ${activeSection === item.id ? 'active' : ''}`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon size={20} />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {activeSection === item.id && !sidebarCollapsed && (
                        <ChevronRight size={16} className="ml-auto text-[#059669]" />
                      )}
                    </motion.button>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-3 rounded-xl"
              >
                <p className="text-xs text-gray-400 mb-2">Have a question or need support?</p>
                <button className="btn-ghost w-full text-sm py-2">
                  <HelpCircle size={16} />
                  Help Center
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={copyProfileUrl}
            className="btn-primary w-full text-sm py-3"
          >
            {copied ? <CheckCircle size={16} /> : <ExternalLink size={16} />}
            {!sidebarCollapsed && (copied ? 'Copied!' : 'Share Your Profile')}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center flex-shrink-0">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-black font-bold">{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden flex-1"
                >
                  <p className="text-sm font-medium text-white truncate">{user.displayName || user.username}</p>
                  <p className="text-xs text-gray-500 font-mono">UID {user.uid || 'ABC123XY'}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Sign Out">
                <LogOut size={16} className="text-gray-400 hover:text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center hover:border-[#059669] transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-[#059669]">
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="spite.lol" className="w-8 h-8" />
            <span className="text-lg font-bold text-[#059669]">spite.lol</span>
          </Link>
          <button className="p-2 text-gray-400 hover:text-[#059669] relative">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#059669] rounded-full" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 glass-sidebar z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/logo.png" alt="spite.lol" className="w-8 h-8" />
                  <span className="text-lg font-bold text-[#059669]">spite.lol</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                    className={`sidebar-item w-full ${activeSection === item.id ? 'active' : ''}`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300 pt-16 lg:pt-0"
        style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
      >
        {/* Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 items-center justify-between">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-80 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#059669] transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />
            </button>
            <button
              onClick={() => window.open(`/${user?.username}`, '_blank')}
              className="btn-ghost text-sm"
            >
              <Eye size={16} />
              View Profile
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6 space-y-6">
          {activeSection === 'overview' && (
            <OverviewSection
              user={user}
              profile={profile}
              totalClicks={totalClicks}
              profileCompletion={profileCompletion}
              completionPercent={completionPercent}
            />
          )}
          {activeSection === 'customize' && (
            <CustomizeSection
              monochromeIcons={monochromeIcons}
              setMonochromeIcons={setMonochromeIcons}
              iconPreset={iconPreset}
              setIconPreset={setIconPreset}
              typewriterEffect={typewriterEffect}
              setTypewriterEffect={setTypewriterEffect}
              cursorEffect={cursorEffect}
              setCursorEffect={setCursorEffect}
              cursorColor={cursorColor}
              setCursorColor={setCursorColor}
              cursorDensity={cursorDensity}
              setCursorDensity={setCursorDensity}
            />
          )}
          {activeSection === 'links' && <LinksSection profile={profile} onRefresh={fetchUserData} />}
          {activeSection === 'analytics' && <AnalyticsSection />}
          {activeSection === 'badges' && <BadgesSection />}
          {activeSection === 'settings' && <SettingsSection user={user} onLogout={handleLogout} />}
          {activeSection === 'themes' && <ThemesSection />}
          {activeSection === 'images' && <ImagesSection />}
          {activeSection === 'templates' && <TemplatesSection />}

          {/* Footer */}
          <div className="text-center pt-6 border-t border-white/5">
            <p className="text-sm text-gray-500">
              Need help? <a href="mailto:contact@spite.lol" className="text-[#059669] hover:underline">contact@spite.lol</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Overview Section
function OverviewSection({ user, profile, totalClicks, profileCompletion, completionPercent }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 mb-3">
            WELCOME BACK
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Your profile is waiting, <span className="text-[#059669]">{user?.displayName || user?.username}</span>
          </h1>
          <p className="text-gray-400 text-sm lg:text-base">
            Track performance, polish your profile, and keep tabs on every link—all from this glass dashboard.
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-[#059669]" />
            <span className="text-xs font-medium text-gray-400">LIVE STATUS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot" />
            <span className="text-sm text-white font-medium">ALL SYSTEMS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Username', value: user?.username, subtitle: 'Change available now', icon: User },
          { label: 'Alias', value: user?.displayName || 'Not Set', subtitle: 'Display name', icon: Crown },
          { label: 'UID', value: user?.uid || 'ABC123XY', subtitle: 'Unique identifier', icon: Hash, mono: true },
          { label: 'Profile Views', value: profile?.view_count || 0, subtitle: '+0 since last 7 days', icon: Eye, trend: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">{stat.label}</span>
              <stat.icon size={18} className="text-gray-500" />
            </div>
            <p className={`stat-value ${stat.mono ? 'font-mono text-xl lg:text-2xl' : ''}`}>{stat.value}</p>
            <p className="stat-subtitle flex items-center gap-1">
              {stat.trend && <TrendingUp size={12} className="text-[#059669]" />}
              {stat.subtitle}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Profile Completion & Account Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 lg:p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Profile completion</h2>
              <p className="text-sm text-gray-400">{completionPercent}% COMPLETED</p>
            </div>
            <button className="btn-secondary text-sm py-2 px-4">
              <Palette size={16} />
              Customize
            </button>
          </div>

          <div className="progress-bar mb-6">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Complete your profile to make it more discoverable and appealing.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {profileCompletion.map((item: any, index: number) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  item.done
                    ? 'bg-[#059669]/10 border-[#059669]/30 text-[#059669]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {item.done ? <CheckCircle size={18} /> : <item.icon size={18} />}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Manage Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:p-6 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Manage your account</h2>
          <p className="text-sm text-gray-400 mb-6">CHANGE ANYTHING, ANYTIME</p>

          <div className="space-y-3">
            {[
              { icon: User, label: 'Change Username', desc: 'Claim a new handle for your profile' },
              { icon: Edit3, label: 'Change Display Name', desc: 'Keep things fresh on your profile' },
              { icon: Sparkles, label: 'All Features Free', desc: 'Enjoy unlimited customization' },
              { icon: Settings, label: 'Account Settings', desc: 'Manage security and sign-in options' },
            ].map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#059669]/30 hover:bg-[#059669]/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#059669]/20 transition-colors">
                  <item.icon size={18} className="text-gray-400 group-hover:text-[#059669]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-500 group-hover:text-[#059669] transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Customize Section
function CustomizeSection({
  monochromeIcons, setMonochromeIcons,
  iconPreset, setIconPreset,
  typewriterEffect, setTypewriterEffect,
  cursorEffect, setCursorEffect,
  cursorColor, setCursorColor,
  cursorDensity, setCursorDensity,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Customize</h1>
        <p className="text-gray-400">Personalize your profile with effects and styles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Icon Settings */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brush size={20} className="text-[#059669]" />
            Icon Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">Monochrome Icons</p>
                <p className="text-sm text-gray-400">Single color override</p>
              </div>
              <button
                onClick={() => setMonochromeIcons(!monochromeIcons)}
                className={`w-12 h-6 rounded-full transition-colors ${monochromeIcons ? 'bg-[#059669]' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${monochromeIcons ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <p className="text-white font-medium mb-3">Icon Preset</p>
              <div className="grid grid-cols-3 gap-2">
                {['minimalist', 'cyber', 'fun'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setIconPreset(preset)}
                    className={`p-3 rounded-xl border capitalize transition-all ${
                      iconPreset === preset
                        ? 'bg-[#059669]/20 border-[#059669] text-[#059669]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text Effects */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Type size={20} className="text-[#059669]" />
            Text Effects
          </h3>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Typewriter Effect</p>
              <p className="text-sm text-gray-400">50ms per character</p>
            </div>
            <button
              onClick={() => setTypewriterEffect(!typewriterEffect)}
              className={`w-12 h-6 rounded-full transition-colors ${typewriterEffect ? 'bg-[#059669]' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${typewriterEffect ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Cursor Effects */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MousePointer size={20} className="text-[#059669]" />
            Cursor Effects
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {['none', 'snowflakes', 'rain', 'stars'].map(effect => (
              <button
                key={effect}
                onClick={() => setCursorEffect(effect)}
                className={`p-4 rounded-xl border capitalize transition-all ${
                  cursorEffect === effect
                    ? 'bg-[#059669]/20 border-[#059669] text-[#059669]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {effect === 'none' ? 'Off' : effect}
              </button>
            ))}
          </div>

          {cursorEffect !== 'none' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-white font-medium mb-2">Color</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cursorColor}
                    onChange={(e) => setCursorColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={cursorColor}
                    onChange={(e) => setCursorColor(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>
              <div>
                <p className="text-white font-medium mb-2">Density: {cursorDensity}%</p>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cursorDensity}
                  onChange={(e) => setCursorDensity(Number(e.target.value))}
                  className="w-full accent-[#059669]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Links Section
function LinksSection({ profile, onRefresh }: any) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddLink = async () => {
    if (!selectedPlatform || !linkUrl) return;
    setSaving(true);
    try {
      await profileAPI.addLink({
        platform: selectedPlatform.id,
        title: linkTitle || selectedPlatform.name,
        url: linkUrl,
      });
      setShowAddModal(false);
      setSelectedPlatform(null);
      setLinkUrl('');
      setLinkTitle('');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to add link:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      await profileAPI.deleteLink(linkId);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={20} className="text-[#059669]" />
          <h1 className="text-2xl font-bold text-white">Link your social media profiles.</h1>
        </div>
        <p className="text-gray-400">Pick a social media to add to your profile.</p>
      </div>

      {/* Social Links Grid */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
          {SOCIAL_PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => {
                setSelectedPlatform(platform);
                setShowAddModal(true);
              }}
              className="w-12 h-12 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center group"
              title={platform.name}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 transition-transform group-hover:scale-110"
                style={{ fill: platform.color }}
              >
                <path d={platform.icon} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Your Links */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Your Links</h3>
        {profile?.links?.length > 0 ? (
          <div className="space-y-3">
            {profile.links.map((link: any) => {
              const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
              return (
                <div
                  key={link.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  {platform ? (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: platform.color }}>
                      <path d={platform.icon} />
                    </svg>
                  ) : (
                    <Globe size={24} className="text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">{link.title}</p>
                    <p className="text-sm text-gray-400 truncate">{link.url}</p>
                  </div>
                  <span className="text-sm text-gray-500">{link.click_count || 0} clicks</span>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Link2 size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No links yet. Click a platform above to add your first link!</p>
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      <AnimatePresence>
        {showAddModal && selectedPlatform && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Add {selectedPlatform.name}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl">
                <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: selectedPlatform.color }}>
                  <path d={selectedPlatform.icon} />
                </svg>
                <div>
                  <p className="text-white font-medium">{selectedPlatform.name}</p>
                  <p className="text-sm text-gray-400">Social Link</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title (optional)</label>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={e => setLinkTitle(e.target.value)}
                    placeholder={selectedPlatform.name}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder={selectedPlatform.placeholder}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLink}
                  disabled={!linkUrl || saving}
                  className="flex-1 px-4 py-3 bg-[#059669] rounded-xl text-white font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Analytics Section
function AnalyticsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Track your profile performance.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl text-center py-16">
        <BarChart3 size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">Analytics coming soon...</p>
      </div>
    </motion.div>
  );
}

// Badges Section
function BadgesSection() {
  const [filter, setFilter] = useState('all');

  const filteredBadges = filter === 'all' 
    ? BADGES 
    : BADGES.filter(b => b.actionType === filter || (filter === 'earned' && b.actionType === 'none'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">All Badges</h1>
          <p className="text-gray-400">View all available badges and how to earn them.</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#059669] focus:outline-none"
        >
          <option value="all">All Badges</option>
          <option value="earned">Earned</option>
          <option value="purchase">Purchasable</option>
          <option value="unlock">Unlockable</option>
        </select>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map(badge => (
            <div
              key={badge.id}
              className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-start gap-4"
            >
              <div className="text-2xl">{badge.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{badge.name}</span>
                  {badge.actionLabel && (
                    <button className="px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-lg text-gray-300 hover:bg-white/20 transition-colors">
                      {badge.actionLabel}
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Badges Section */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-white">Custom Badges</h3>
          <span className="px-2 py-0.5 text-xs bg-[#059669]/20 text-[#059669] rounded-full flex items-center gap-1">
            <Sparkles size={12} /> New
          </span>
        </div>
        <p className="text-gray-400 mb-4">
          Custom badges allow you to create your own badges with a custom icon and name. 
          You can edit your custom badges by using edit credits.
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-[#059669] rounded-xl text-white font-medium hover:bg-[#047857] transition-colors">
            Purchase
          </button>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors">
            Preview Custom Badge
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Settings Section
function SettingsSection({ user, onLogout }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [discordLogin, setDiscordLogin] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
      </div>

      {/* General Information */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">General Information</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
            <Edit3 size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Username</p>
              <p className="text-white font-medium">{user?.username}</p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
            <User size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Display Name</p>
              <p className="text-white font-medium">{user?.display_name || user?.username}</p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
            <AtSign size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Alias</p>
              <p className="text-white font-medium">{user?.alias || 'None'}</p>
            </div>
            <span className="text-sm text-[#A855F7]">Want more? Unlock with Premium</span>
          </div>
          <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white font-medium">{'•'.repeat(10)}</p>
            </div>
            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Language Settings</h3>
        <p className="text-gray-400 text-sm mb-3">Choose the language you want to use on spite.lol.</p>
        <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#059669] focus:outline-none">
          <option value="en">🇺🇸 English (US)</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="fr">🇫🇷 French</option>
          <option value="de">🇩🇪 German</option>
        </select>
      </div>

      {/* Discord Settings */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Discord Settings</h3>
        <p className="text-gray-400 text-sm mb-3">Claim your spite.lol badges and perks as roles on the official Discord server</p>
        <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
          Claim Now
        </button>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Multi-factor authentication</p>
              <p className="text-sm text-gray-400">Multi-factor authentication adds a layer of security to your account</p>
            </div>
            <button
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${mfaEnabled ? 'bg-[#A855F7]' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${mfaEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Login with Discord</p>
              <p className="text-sm text-gray-400">Lets you sign in to your spite.lol account with Discord</p>
            </div>
            <button
              onClick={() => setDiscordLogin(!discordLogin)}
              className={`w-12 h-6 rounded-full transition-colors ${discordLogin ? 'bg-[#A855F7]' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${discordLogin ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Recovery codes are one-time use. Used codes can't be reused.</p>
          <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            Regenerate Recovery Codes
          </button>
          <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            Change Email
          </button>
          <p className="text-gray-400 text-sm">By changing your password, you will be logged out of every device.</p>
          <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            Change Password
          </button>
          <button className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            Unlink Discord
          </button>
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Themes Section
function ThemesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Themes</h1>
        <p className="text-gray-400">Choose a theme for your profile.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl text-center py-16">
        <Sparkles size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">Theme customization coming soon...</p>
      </div>
    </motion.div>
  );
}

// Images Section
function ImagesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Image Host</h1>
        <p className="text-gray-400">Upload and manage your images.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl text-center py-16">
        <Image size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">Image hosting coming soon...</p>
      </div>
    </motion.div>
  );
}

// Templates Section
function TemplatesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Templates</h1>
        <p className="text-gray-400">Save and share your profile templates.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl text-center py-16">
        <Layers size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">Templates coming soon...</p>
      </div>
    </motion.div>
  );
}
