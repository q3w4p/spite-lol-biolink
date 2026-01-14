import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Ban, Award, FileText, Search, AlertTriangle,
  CheckCircle, X, ChevronRight, Eye, EyeOff, Trash2, RefreshCw,
  UserPlus, UserMinus, Image, Music, Sparkles, Clock
} from 'lucide-react';
import { User } from '../App';

interface OwnerPanelPageProps {
  user: User | null;
}

export default function OwnerPanelPage({ user }: OwnerPanelPageProps) {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showBanModal, setShowBanModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showStripModal, setShowStripModal] = useState(false);
  const [showGrantAdminModal, setShowGrantAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [badgeType, setBadgeType] = useState('verified');
  const [stripOptions, setStripOptions] = useState({ background: false, effects: false, audio: false });
  const [adminTarget, setAdminTarget] = useState({ uid: '', discordId: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Check if user is already owner/admin
    if (user.role === 'owner' || user.role === 'admin') {
      setIsOwner(true);
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || data);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (logsRes.ok) {
        setAuditLogs(await logsRes.json());
      }
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const verifyOwner = async () => {
    setVerifying(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/owner/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ secret: secretKey }),
      });

      if (res.ok) {
        setIsOwner(true);
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid secret key');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: selectedUser.uid, reason: banReason }),
      });

      if (res.ok) {
        setShowBanModal(false);
        setBanReason('');
        loadData();
      }
    } catch (err) {
      console.error('Ban failed');
    }
  };

  const handleUnban = async (uid: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid }),
      });
      loadData();
    } catch (err) {
      console.error('Unban failed');
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/assign-badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: selectedUser.uid, badgeType }),
      });
      setShowBadgeModal(false);
      loadData();
    } catch (err) {
      console.error('Badge assignment failed');
    }
  };

  const handleStripEffects = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/strip-effects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: selectedUser.uid,
          stripBackground: stripOptions.background,
          stripEffects: stripOptions.effects,
          stripAudio: stripOptions.audio,
        }),
      });
      setShowStripModal(false);
      setStripOptions({ background: false, effects: false, audio: false });
      loadData();
    } catch (err) {
      console.error('Strip effects failed');
    }
  };

  const handleGrantAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/owner/grant-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminTarget),
      });
      setShowGrantAdminModal(false);
      setAdminTarget({ uid: '', discordId: '' });
      loadData();
    } catch (err) {
      console.error('Grant admin failed');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.uid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black grid-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Owner Panel</h1>
              <p className="text-gray-400 text-sm">Enter the secret key to access</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={18} />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Secret Key"
                className="glass-input w-full"
              />
              <button
                onClick={verifyOwner}
                disabled={verifying || !secretKey}
                className="btn-primary w-full"
              >
                {verifying ? 'Verifying...' : 'Access Panel'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield className="text-red-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Owner Panel</h1>
              <p className="text-sm text-gray-400">Administrative Controls</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="widget-card">
              <div className="text-2xl font-bold text-[#059669]">{stats.total_users || 0}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="widget-card">
              <div className="text-2xl font-bold text-blue-400">{stats.verified_users || 0}</div>
              <div className="text-sm text-gray-400">Verified</div>
            </div>
            <div className="widget-card">
              <div className="text-2xl font-bold text-red-400">{stats.banned_users || 0}</div>
              <div className="text-sm text-gray-400">Banned</div>
            </div>
            <div className="widget-card">
              <div className="text-2xl font-bold text-purple-400">{stats.total_links || 0}</div>
              <div className="text-sm text-gray-400">Total Links</div>
            </div>
            <div className="widget-card">
              <div className="text-2xl font-bold text-yellow-400">{stats.total_views || 0}</div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'admins', icon: Shield, label: 'Admins' },
            { id: 'audit', icon: FileText, label: 'Audit Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#059669] text-black'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, email, or UID..."
                  className="glass-input w-full pl-12"
                />
              </div>
              <button onClick={loadData} className="btn-secondary">
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="widget-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="text-left p-4 text-gray-400 font-medium">User</th>
                      <th className="text-left p-4 text-gray-400 font-medium">UID</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                      <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#059669] font-bold">
                              {u.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white">{u.username}</div>
                              <div className="text-sm text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-[#059669] font-mono text-sm">{u.uid}</code>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === 'owner' ? 'bg-red-500/20 text-red-400' :
                            u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.is_banned ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">Banned</span>
                          ) : u.is_verified ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">Verified</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Unverified</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setSelectedUser(u); setShowBadgeModal(true); }}
                              className="p-2 rounded-lg hover:bg-[#059669]/10 text-gray-400 hover:text-[#059669] transition-colors"
                              title="Assign Badge"
                            >
                              <Award size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedUser(u); setShowStripModal(true); }}
                              className="p-2 rounded-lg hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 transition-colors"
                              title="Strip Effects"
                            >
                              <Sparkles size={16} />
                            </button>
                            {u.is_banned ? (
                              <button
                                onClick={() => handleUnban(u.uid)}
                                className="p-2 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors"
                                title="Unban"
                              >
                                <CheckCircle size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => { setSelectedUser(u); setShowBanModal(true); }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                title="Ban"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowGrantAdminModal(true)} className="btn-primary">
                <UserPlus size={18} />
                Grant Admin
              </button>
            </div>

            <div className="widget-card">
              <h3 className="text-lg font-bold text-white mb-4">Current Admins</h3>
              <div className="space-y-3">
                {users.filter(u => u.role === 'admin' || u.role === 'owner').map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-surface">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        admin.role === 'owner' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {admin.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{admin.username}</div>
                        <div className="text-sm text-gray-400">UID: {admin.uid}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      admin.role === 'owner' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {admin.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="widget-card">
            <h3 className="text-lg font-bold text-white mb-4">Audit Log</h3>
            <div className="space-y-3">
              {auditLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-dark-surface">
                  <div className="w-10 h-10 rounded-full bg-[#059669]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="text-[#059669]" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{log.admin_username}</span>
                      <span className="text-gray-400">performed</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.action.includes('BAN') ? 'bg-red-500/20 text-red-400' :
                        log.action.includes('ADMIN') ? 'bg-purple-500/20 text-purple-400' :
                        'bg-[#059669]/20 text-[#059669]'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    {log.target_username && (
                      <div className="text-sm text-gray-400">
                        Target: <span className="text-white">{log.target_username}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No audit logs yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setShowBanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Ban User</h3>
                <button onClick={() => setShowBanModal(false)} className="p-2 hover:bg-dark-surface rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-400 mb-4">
                Ban <span className="text-white font-medium">{selectedUser?.username}</span> (UID: {selectedUser?.uid})?
              </p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for ban..."
                className="glass-input w-full h-24 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowBanModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleBan} className="btn-primary flex-1 bg-red-500 hover:bg-red-600">Ban User</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Modal */}
      <AnimatePresence>
        {showBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setShowBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Assign Badge</h3>
                <button onClick={() => setShowBadgeModal(false)} className="p-2 hover:bg-dark-surface rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-400 mb-4">
                Assign badge to <span className="text-white font-medium">{selectedUser?.username}</span>
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['verified', 'staff', 'admin'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setBadgeType(type)}
                    className={`p-3 rounded-lg border transition-all ${
                      badgeType === type
                        ? 'border-[#059669] bg-[#059669]/10 text-[#059669]'
                        : 'border-dark-border text-gray-400 hover:border-[#059669]/30'
                    }`}
                  >
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowBadgeModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleAssignBadge} className="btn-primary flex-1">Assign Badge</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strip Effects Modal */}
      <AnimatePresence>
        {showStripModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setShowStripModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Strip Effects</h3>
                <button onClick={() => setShowStripModal(false)} className="p-2 hover:bg-dark-surface rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-400 mb-4">
                Remove effects from <span className="text-white font-medium">{selectedUser?.username}</span>'s profile
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { key: 'background', icon: Image, label: 'Background Image/Video' },
                  { key: 'effects', icon: Sparkles, label: 'Cursor Effects' },
                  { key: 'audio', icon: Music, label: 'Background Audio' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stripOptions[item.key as keyof typeof stripOptions]}
                      onChange={(e) => setStripOptions({ ...stripOptions, [item.key]: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#059669]"
                    />
                    <item.icon size={18} className="text-gray-400" />
                    <span className="text-white">{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStripModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleStripEffects} className="btn-primary flex-1 bg-yellow-500 hover:bg-yellow-600">Strip Effects</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grant Admin Modal */}
      <AnimatePresence>
        {showGrantAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setShowGrantAdminModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Grant Admin</h3>
                <button onClick={() => setShowGrantAdminModal(false)} className="p-2 hover:bg-dark-surface rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">User UID</label>
                  <input
                    type="text"
                    value={adminTarget.uid}
                    onChange={(e) => setAdminTarget({ ...adminTarget, uid: e.target.value })}
                    placeholder="ABC123XY"
                    className="glass-input w-full font-mono"
                  />
                </div>
                <div className="text-center text-gray-500">or</div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Discord ID</label>
                  <input
                    type="text"
                    value={adminTarget.discordId}
                    onChange={(e) => setAdminTarget({ ...adminTarget, discordId: e.target.value })}
                    placeholder="123456789012345678"
                    className="glass-input w-full font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowGrantAdminModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleGrantAdmin} className="btn-primary flex-1">Grant Admin</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
