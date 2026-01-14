import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, AtSign, Eye, EyeOff, Shield, LogOut, RefreshCw, 
  ChevronDown, Key, Unlink
} from 'lucide-react';
import api from '../utils/api';

interface UserData {
  username: string;
  displayName: string;
  email: string;
  discordId: string | null;
  discordUsername: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [discordLoginEnabled, setDiscordLoginEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser({
        username: userData.username,
        displayName: userData.displayName || '',
        email: userData.email,
        discordId: userData.discordId,
        discordUsername: userData.discordUsername
      });
      setNewUsername(userData.username);
      setNewDisplayName(userData.displayName || '');
      setNewEmail(userData.email);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername === user?.username) return;
    setSaving(true);
    try {
      await api.put('/profile/username', { username: newUsername });
      setUser(prev => prev ? { ...prev, username: newUsername } : null);
      alert('Username updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    setSaving(true);
    try {
      await api.put('/profile/display-name', { displayName: newDisplayName });
      setUser(prev => prev ? { ...prev, displayName: newDisplayName } : null);
      alert('Display name updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update display name');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;
    setSaving(true);
    try {
      await api.put('/profile/email', { email: newEmail });
      alert('Verification email sent to new address!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to change email');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in both password fields');
      return;
    }
    setSaving(true);
    try {
      await api.put('/profile/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      alert('Password changed successfully! You will be logged out of all devices.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkDiscord = async () => {
    if (!confirm('Are you sure you want to unlink your Discord account?')) return;
    try {
      await api.delete('/profile/discord');
      setUser(prev => prev ? { ...prev, discordId: null, discordUsername: null } : null);
      alert('Discord account unlinked!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unlink Discord');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}${'•'.repeat(local.length - 2)}@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Account Settings
        </motion.h1>

        {/* General Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">General Information</h2>
          <div className="glass-card rounded-xl p-6 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-3 border border-white/5">
                  <User className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-transparent flex-1 outline-none text-white"
                  />
                </div>
                <button
                  onClick={handleUpdateUsername}
                  disabled={saving || newUsername === user?.username}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Display Name</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-3 border border-white/5">
                  <AtSign className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="bg-transparent flex-1 outline-none text-white placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={handleUpdateDisplayName}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-3 border border-white/5">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-white">
                  {showEmail ? user?.email : maskEmail(user?.email || '')}
                </span>
                <button
                  onClick={() => setShowEmail(!showEmail)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showEmail ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Language Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Language Settings</h2>
          <div className="glass-card rounded-xl p-6">
            <p className="text-sm text-gray-400 mb-3">Choose the language you want to use on spite.lol.</p>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer"
              >
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="en-GB">🇬🇧 English (UK)</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="ja">🇯🇵 日本語</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Discord Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Discord Settings</h2>
          <div className="glass-card rounded-xl p-6 space-y-4">
            <p className="text-sm text-gray-400">Claim your spite.lol badges and perks as roles on the official Discord server</p>
            <button className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg px-4 py-3 text-white transition-colors">
              Claim Now
            </button>
            
            {user?.discordId && (
              <div className="flex items-center justify-between bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <span className="text-white">{user.discordUsername || 'Discord Connected'}</span>
                </div>
                <button
                  onClick={handleUnlinkDiscord}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Unlink className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Security Settings</h2>
          <div className="glass-card rounded-xl p-6 space-y-4">
            {/* MFA Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Multi-factor authentication</h3>
                <p className="text-sm text-gray-400">Multi-factor authentication adds a layer of security to your account.</p>
              </div>
              <button
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${mfaEnabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${mfaEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Discord Login Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Login with Discord</h3>
                <p className="text-sm text-gray-400">Lets you sign in to your spite.lol account with Discord.</p>
              </div>
              <button
                onClick={() => setDiscordLoginEnabled(!discordLoginEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${discordLoginEnabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${discordLoginEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Account Actions</h2>
          <div className="glass-card rounded-xl p-6 space-y-3">
            <p className="text-sm text-gray-400 mb-4">Recovery codes are one-time use. Used codes can't be reused.</p>
            
            <button className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg px-4 py-3 text-white transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate Recovery Codes
            </button>
            
            <button 
              onClick={handleChangeEmail}
              className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg px-4 py-3 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Change Email
            </button>
            
            <div className="pt-2">
              <p className="text-sm text-gray-400 mb-3">By changing your password, you will be logged out of every device.</p>
              <button 
                onClick={handleChangePassword}
                className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg px-4 py-3 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>
            
            {user?.discordId && (
              <button 
                onClick={handleUnlinkDiscord}
                className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 rounded-lg px-4 py-3 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Unlink className="w-4 h-4" />
                Unlink Discord
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          Need help? <a href="mailto:contact@spite.lol" className="text-emerald-500 hover:underline">contact@spite.lol</a>
        </p>
      </div>
    </div>
  );
}
