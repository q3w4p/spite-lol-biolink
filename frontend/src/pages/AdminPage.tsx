import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  Award,
  Mail,
  BarChart3,
  Settings,
  Search,
  Ban,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  AlertTriangle,
  Clock,
  Activity,
  UserX,
  UserCheck,
  Send,
  FileText,
  Sparkles,
  Home,
  RefreshCw,
} from 'lucide-react';
import { User } from '../App';
import { adminAPI } from '../utils/api';

interface AdminPageProps {
  user: User | null;
}

interface Stats {
  total_users: number;
  verified_users: number;
  total_profiles: number;
  total_links: number;
  total_views: number;
  total_clicks: number;
  banned_users: number;
  total_badges: number;
  assigned_badges: number;
  new_users_today: number;
  new_users_week: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  uid: number;
  role: string;
  is_verified: boolean;
  is_admin: boolean;
  discord_id: string | null;
  discord_username: string | null;
  created_at: string;
  view_count: number;
  link_count: number;
  badge_count: number;
  is_banned: boolean;
  ban_reason: string | null;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  assigned_count: number;
}

interface AuditLog {
  id: number;
  action: string;
  admin_username: string;
  target_username: string | null;
  target_uid: number | null;
  details: any;
  created_at: string;
}

export default function AdminPage({ user }: AdminPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [showAssignBadgeModal, setShowAssignBadgeModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  
  // Form states
  const [banReason, setBanReason] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeDescription, setNewBadgeDescription] = useState('');
  const [newBadgeIcon, setNewBadgeIcon] = useState('Award');
  const [newBadgeColor, setNewBadgeColor] = useState('#059669');
  const [assignUserId, setAssignUserId] = useState('');
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user || (!user.isAdmin && !user.isOwner)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, badgesRes, bannedRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(1, 50),
        adminAPI.getBadges(),
        adminAPI.getBannedUsers(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setTotalPages(usersRes.data.pagination.pages);
      setBadges(badgesRes.data);
      setBannedUsers(bannedRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page: number = 1, search?: string) => {
    try {
      const res = await adminAPI.getUsers(page, 50, search);
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await adminAPI.getAuditLogs(1, 100);
      setAuditLogs(res.data.logs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const handleSearch = () => {
    fetchUsers(1, searchQuery);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    try {
      await adminAPI.banUser(selectedUser.id, banReason);
      setMessage({ type: 'success', text: `User ${selectedUser.username} has been banned` });
      setShowBanModal(false);
      setBanReason('');
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to ban user' });
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      await adminAPI.unbanUser(userId);
      setMessage({ type: 'success', text: 'User has been unbanned' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to unban user' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      setMessage({ type: 'success', text: 'User has been deleted' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete user' });
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser) return;
    try {
      await adminAPI.sendEmail(selectedUser.id, emailSubject, emailMessage, 'spite.lol Support');
      setMessage({ type: 'success', text: `Email sent to ${selectedUser.email}` });
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to send email' });
    }
  };

  const handleCreateBadge = async () => {
    try {
      await adminAPI.createBadge({
        name: newBadgeName,
        description: newBadgeDescription,
        icon: newBadgeIcon,
        color: newBadgeColor,
      });
      setMessage({ type: 'success', text: `Badge "${newBadgeName}" created` });
      setShowCreateBadgeModal(false);
      setNewBadgeName('');
      setNewBadgeDescription('');
      setNewBadgeIcon('Award');
      setNewBadgeColor('#059669');
      const badgesRes = await adminAPI.getBadges();
      setBadges(badgesRes.data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create badge' });
    }
  };

  const handleDeleteBadge = async (badgeId: number) => {
    if (!confirm('Are you sure you want to delete this badge? It will be removed from all users.')) return;
    try {
      await adminAPI.deleteBadge(badgeId);
      setMessage({ type: 'success', text: 'Badge deleted' });
      const badgesRes = await adminAPI.getBadges();
      setBadges(badgesRes.data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete badge' });
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedBadge || !assignUserId) return;
    try {
      await adminAPI.assignBadge(parseInt(assignUserId), selectedBadge.id);
      setMessage({ type: 'success', text: `Badge assigned to user ID ${assignUserId}` });
      setShowAssignBadgeModal(false);
      setAssignUserId('');
      const badgesRes = await adminAPI.getBadges();
      setBadges(badgesRes.data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to assign badge' });
    }
  };

  const handleRemoveBadge = async (userId: number, badgeId: number) => {
    try {
      await adminAPI.removeBadge(userId, badgeId);
      setMessage({ type: 'success', text: 'Badge removed from user' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to remove badge' });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'banned', label: 'Banned', icon: Ban },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const iconOptions = [
    'Award', 'Star', 'Crown', 'Shield', 'Heart', 'Zap', 'Trophy', 'Medal',
    'Gift', 'Bug', 'Users', 'Globe', 'Image', 'Wrench', 'HelpCircle', 'BadgeCheck',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <Home size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="text-[#059669]" size={24} />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw size={18} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#059669]/10 border border-[#059669]/30">
              <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span className="text-sm text-[#059669]">
                {user?.isOwner ? 'Owner' : 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'audit') fetchAuditLogs();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#059669] text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats.total_users} icon={Users} />
              <StatCard label="Verified Users" value={stats.verified_users} icon={UserCheck} />
              <StatCard label="New Today" value={stats.new_users_today} icon={Activity} color="green" />
              <StatCard label="New This Week" value={stats.new_users_week} icon={Clock} color="blue" />
              <StatCard label="Total Views" value={stats.total_views} icon={Eye} />
              <StatCard label="Total Clicks" value={stats.total_clicks} icon={Sparkles} />
              <StatCard label="Banned Users" value={stats.banned_users} icon={Ban} color="red" />
              <StatCard label="Badges Assigned" value={stats.assigned_badges} icon={Award} color="yellow" />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by username, email, or UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-[#059669] text-black font-semibold rounded-xl hover:bg-[#059669]/90 transition-colors"
              >
                Search
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">UID</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Username</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-[#059669] font-mono">{u.uid}</td>
                      <td className="px-4 py-3 text-white">{u.username}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'owner' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {u.is_verified && (
                            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Verified</span>
                          )}
                          {u.is_banned && (
                            <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">Banned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowUserDetailModal(true);
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowEmailModal(true);
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400"
                            title="Send Email"
                          >
                            <Mail size={16} />
                          </button>
                          {!u.is_banned ? (
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowBanModal(true);
                              }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400"
                              title="Ban User"
                              disabled={u.role === 'admin' || u.role === 'owner'}
                            >
                              <Ban size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnbanUser(u.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-green-400"
                              title="Unban User"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400"
                            title="Delete User"
                            disabled={u.role === 'admin' || u.role === 'owner'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => fetchUsers(currentPage - 1, searchQuery)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-4 py-2 text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchUsers(currentPage + 1, searchQuery)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Badge Management</h2>
              <button
                onClick={() => setShowCreateBadgeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-black font-semibold rounded-xl hover:bg-[#059669]/90"
              >
                <Plus size={18} />
                Create Badge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        <Award size={20} style={{ color: badge.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{badge.name}</h3>
                        <p className="text-sm text-gray-500">{badge.assigned_count} users</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedBadge(badge);
                          setShowAssignBadgeModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#059669]"
                        title="Assign to User"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400"
                        title="Delete Badge"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{badge.description || 'No description'}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Icon: {badge.icon}</span>
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: badge.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banned Users Tab */}
        {activeTab === 'banned' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Banned Users</h2>
            {bannedUsers.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <UserX className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400">No banned users</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">UID</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Username</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Reason</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Banned By</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedUsers.map((ban) => (
                      <tr key={ban.user_id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-[#059669] font-mono">{ban.uid}</td>
                        <td className="px-4 py-3 text-white">{ban.username}</td>
                        <td className="px-4 py-3 text-gray-400">{ban.reason || 'No reason'}</td>
                        <td className="px-4 py-3 text-gray-400">{ban.banned_by_username || 'Unknown'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(ban.banned_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleUnbanUser(ban.user_id)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm"
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Audit Log</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Admin</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Target</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Details</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action.includes('BAN') ? 'bg-red-500/20 text-red-400' :
                          log.action.includes('DELETE') ? 'bg-red-500/20 text-red-400' :
                          log.action.includes('ASSIGN') ? 'bg-green-500/20 text-green-400' :
                          log.action.includes('CREATE') ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{log.admin_username}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {log.target_username ? `${log.target_username} (UID: ${log.target_uid})` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {log.details ? JSON.stringify(log.details).slice(0, 50) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Admin Settings</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-gray-400">Admin settings and configuration options will be available here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <Modal onClose={() => setShowBanModal(false)}>
            <h3 className="text-xl font-bold text-white mb-4">Ban User</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to ban <span className="text-white font-medium">{selectedUser.username}</span> (UID: {selectedUser.uid})?
            </p>
            <textarea
              placeholder="Reason for ban..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none resize-none h-24 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Ban User
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && selectedUser && (
          <Modal onClose={() => setShowEmailModal(false)}>
            <h3 className="text-xl font-bold text-white mb-4">Send Email</h3>
            <p className="text-gray-400 mb-4">
              Send email to <span className="text-white font-medium">{selectedUser.email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">From: help@spite.lol</p>
            <input
              type="text"
              placeholder="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none mb-3"
            />
            <textarea
              placeholder="Message..."
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none resize-none h-32 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailSubject || !emailMessage}
                className="flex-1 py-3 bg-[#059669] text-black rounded-xl hover:bg-[#059669]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send Email
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Create Badge Modal */}
      <AnimatePresence>
        {showCreateBadgeModal && (
          <Modal onClose={() => setShowCreateBadgeModal(false)}>
            <h3 className="text-xl font-bold text-white mb-4">Create Badge</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Badge Name"
                value={newBadgeName}
                onChange={(e) => setNewBadgeName(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none"
              />
              <textarea
                placeholder="Description (optional)"
                value={newBadgeDescription}
                onChange={(e) => setNewBadgeDescription(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none resize-none h-20"
              />
              <div>
                <label className="block text-sm text-gray-400 mb-2">Icon</label>
                <select
                  value={newBadgeIcon}
                  onChange={(e) => setNewBadgeIcon(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#059669] focus:outline-none"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={newBadgeColor}
                    onChange={(e) => setNewBadgeColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newBadgeColor}
                    onChange={(e) => setNewBadgeColor(e.target.value)}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#059669] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateBadgeModal(false)}
                className="flex-1 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBadge}
                disabled={!newBadgeName}
                className="flex-1 py-3 bg-[#059669] text-black rounded-xl hover:bg-[#059669]/90 disabled:opacity-50"
              >
                Create Badge
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Assign Badge Modal */}
      <AnimatePresence>
        {showAssignBadgeModal && selectedBadge && (
          <Modal onClose={() => setShowAssignBadgeModal(false)}>
            <h3 className="text-xl font-bold text-white mb-4">Assign Badge</h3>
            <p className="text-gray-400 mb-4">
              Assign <span className="text-[#059669] font-medium">{selectedBadge.name}</span> badge to a user
            </p>
            <input
              type="number"
              placeholder="Enter User ID"
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#059669] focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignBadgeModal(false)}
                className="flex-1 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBadge}
                disabled={!assignUserId}
                className="flex-1 py-3 bg-[#059669] text-black rounded-xl hover:bg-[#059669]/90 disabled:opacity-50"
              >
                Assign Badge
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserDetailModal && selectedUser && (
          <Modal onClose={() => setShowUserDetailModal(false)}>
            <h3 className="text-xl font-bold text-white mb-4">User Details</h3>
            <div className="space-y-3">
              <DetailRow label="ID" value={selectedUser.id.toString()} />
              <DetailRow label="UID" value={selectedUser.uid.toString()} />
              <DetailRow label="Username" value={selectedUser.username} />
              <DetailRow label="Email" value={selectedUser.email} />
              <DetailRow label="Role" value={selectedUser.role} />
              <DetailRow label="Verified" value={selectedUser.is_verified ? 'Yes' : 'No'} />
              <DetailRow label="Banned" value={selectedUser.is_banned ? 'Yes' : 'No'} />
              {selectedUser.ban_reason && (
                <DetailRow label="Ban Reason" value={selectedUser.ban_reason} />
              )}
              <DetailRow label="Discord" value={selectedUser.discord_username || 'Not linked'} />
              <DetailRow label="Views" value={selectedUser.view_count?.toString() || '0'} />
              <DetailRow label="Links" value={selectedUser.link_count?.toString() || '0'} />
              <DetailRow label="Badges" value={selectedUser.badge_count?.toString() || '0'} />
              <DetailRow label="Joined" value={new Date(selectedUser.created_at).toLocaleDateString()} />
            </div>
            <button
              onClick={() => setShowUserDetailModal(false)}
              className="w-full mt-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10"
            >
              Close
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'default' }: { 
  label: string; 
  value: number; 
  icon: any; 
  color?: string;
}) {
  const colorClasses = {
    default: 'text-[#059669] bg-[#059669]/10',
    green: 'text-green-400 bg-green-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value?.toLocaleString() || 0}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
