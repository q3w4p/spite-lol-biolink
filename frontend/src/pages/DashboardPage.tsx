import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, profileAPI, templatesAPI } from '../utils/api';
import {
  Link as LinkIcon, Palette, Award, Layout, Settings, LogOut, ExternalLink, Save,
  Plus, X, Trash2, Eye, Star, Search, Users, ChevronDown, Globe, Type,
  Image as ImageIcon, Music, Folder, Crown, Sparkles, MapPin, HelpCircle,
  Pencil, MessageSquare, Hash, Mail, AlertTriangle
} from 'lucide-react';

interface UserType {
  id: number;
  username: string;
  email: string;
  uid: number;
  role: string;
  isVerified: boolean;
  isAdmin: boolean;
}

interface DashboardPageProps {
  user?: UserType | null;
}

// Social platform definitions
const socialPlatforms = [
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', icon: '👻', placeholder: 'username' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶️', placeholder: 'channel URL or @handle' },
  { id: 'discord', name: 'Discord', color: '#5865F2', icon: '💬', placeholder: 'username#0000 or server invite' },
  { id: 'spotify', name: 'Spotify', color: '#1DB954', icon: '🎵', placeholder: 'profile URL' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📷', placeholder: '@username' },
  { id: 'twitter', name: 'X (Twitter)', color: '#000000', icon: '𝕏', placeholder: '@username' },
  { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '♪', placeholder: '@username' },
  { id: 'telegram', name: 'Telegram', color: '#0088CC', icon: '✈️', placeholder: '@username or t.me link' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500', icon: '☁️', placeholder: 'profile URL' },
  { id: 'paypal', name: 'PayPal', color: '#00457C', icon: '💳', placeholder: 'paypal.me link' },
  { id: 'github', name: 'GitHub', color: '#181717', icon: '🐙', placeholder: 'username' },
  { id: 'cashapp', name: 'Cash App', color: '#00D632', icon: '💵', placeholder: '$cashtag' },
  { id: 'applemusic', name: 'Apple Music', color: '#FA243C', icon: '🍎', placeholder: 'profile URL' },
  { id: 'kofi', name: 'Ko-fi', color: '#FF5E5B', icon: '☕', placeholder: 'ko-fi.com/username' },
  { id: 'twitch', name: 'Twitch', color: '#9146FF', icon: '📺', placeholder: 'username' },
  { id: 'reddit', name: 'Reddit', color: '#FF4500', icon: '🤖', placeholder: 'u/username' },
  { id: 'vk', name: 'VK', color: '#4680C2', icon: '🔵', placeholder: 'profile URL' },
  { id: 'notion', name: 'Notion', color: '#000000', icon: '📝', placeholder: 'page URL' },
  { id: 'onlyfans', name: 'OnlyFans', color: '#00AFF0', icon: '💙', placeholder: 'profile URL' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼', placeholder: 'profile URL' },
  { id: 'steam', name: 'Steam', color: '#171A21', icon: '🎮', placeholder: 'profile URL' },
  { id: 'kick', name: 'Kick', color: '#53FC18', icon: '🦵', placeholder: 'username' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023', icon: '📌', placeholder: 'profile URL' },
  { id: 'lastfm', name: 'Last.fm', color: '#D51007', icon: '🎧', placeholder: 'username' },
  { id: 'buymeacoffee', name: 'Buy Me a Coffee', color: '#FFDD00', icon: '☕', placeholder: 'buymeacoffee.com/username' },
  { id: 'mastodon', name: 'Mastodon', color: '#6364FF', icon: '🐘', placeholder: '@user@instance' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '📘', placeholder: 'profile URL' },
  { id: 'threads', name: 'Threads', color: '#000000', icon: '@', placeholder: '@username' },
  { id: 'patreon', name: 'Patreon', color: '#FF424D', icon: '🎨', placeholder: 'patreon.com/username' },
  { id: 'discord_server', name: 'Discord Server', color: '#5865F2', icon: '🏠', placeholder: 'discord.gg/invite' },
  { id: 'bitcoin', name: 'Bitcoin', color: '#F7931A', icon: '₿', placeholder: 'wallet address' },
  { id: 'ethereum', name: 'Ethereum', color: '#627EEA', icon: 'Ξ', placeholder: 'wallet address' },
  { id: 'litecoin', name: 'Litecoin', color: '#BFBBBB', icon: 'Ł', placeholder: 'wallet address' },
  { id: 'beacons', name: 'Beacons', color: '#7B68EE', icon: '🔗', placeholder: 'beacons.ai/username' },
  { id: 'xrp', name: 'XRP', color: '#23292F', icon: '✕', placeholder: 'wallet address' },
  { id: 'monero', name: 'Monero', color: '#FF6600', icon: 'ɱ', placeholder: 'wallet address' },
  { id: 'email', name: 'Email', color: '#EA4335', icon: '✉️', placeholder: 'email@example.com' },
  { id: 'roblox', name: 'Roblox', color: '#E2231A', icon: '🎮', placeholder: 'profile URL or username' },
];

// Badge definitions
const BADGE_DEFINITIONS = [
  { id: 'staff', name: 'Staff', description: 'Be a part of the spite.lol staff team.', icon: '⚙️', hasAction: false },
  { id: 'helper', name: 'Helper', description: 'Be active and help users in the community.', icon: '🏆', hasAction: true, actionText: 'Join Discord' },
  { id: 'premium', name: 'Premium', description: 'Purchase the premium package.', icon: '💎', hasAction: true, actionText: 'Purchase' },
  { id: 'verified', name: 'Verified', description: 'Purchase or be a known content creator.', icon: '✓', hasAction: true, actionText: 'Unlock' },
  { id: 'donor', name: 'Donor', description: 'Donate at least 10€ to spite.lol.', icon: '💰', hasAction: true, actionText: 'Donate' },
  { id: 'gifter', name: 'Gifter', description: 'Gift a spite.lol product to another user.', icon: '🎁', hasAction: true, actionText: 'Gift' },
  { id: 'imagehost', name: 'Image Host', description: 'Purchase the Image Host.', icon: '⭐', hasAction: true, actionText: 'Purchase' },
  { id: 'domain', name: 'Domain Legend', description: 'Add a public custom domain to spite.lol Image Host.', icon: '🌐', hasAction: true, actionText: 'Add Domain' },
  { id: 'og', name: 'OG', description: 'Be an early supporter of spite.lol.', icon: '👑', hasAction: false },
  { id: 'booster', name: 'Server Booster', description: 'Boost the spite.lol discord server.', icon: '🔥', hasAction: true, actionText: 'Boost' },
  { id: 'partner', name: 'Partner', description: 'Earned by redeeming a partner reward.', icon: '🤝', hasAction: true, actionText: 'Unlock' },
  { id: 'bughunter', name: 'Bug Hunter', description: 'Report a bug to the spite.lol team.', icon: '🐛', hasAction: true, actionText: 'Report' },
  { id: 'christmas2025', name: 'Christmas 2025', description: 'Exclusive badge from the 2025 winter sale.', icon: '❄️', hasAction: false },
  { id: 'easter2025', name: 'Easter 2025', description: 'Exclusive badge from the 2025 easter sale.', icon: '🥚', hasAction: false },
  { id: 'christmas2024', name: 'Christmas 2024', description: 'Exclusive badge from the 2024 winter sale.', icon: '🎄', hasAction: false },
  { id: 'million', name: 'The Million', description: 'Celebration badge for 1M users.', icon: '🎉', hasAction: false },
  { id: 'winner', name: 'Winner', description: 'Win a spite.lol event.', icon: '🥇', hasAction: false },
  { id: 'second', name: 'Second Place', description: 'Get second place in a spite.lol event.', icon: '🥈', hasAction: false },
  { id: 'third', name: 'Third Place', description: 'Get third place in a spite.lol event.', icon: '🥉', hasAction: false },
];

export default function DashboardPage({ user: propUser }: DashboardPageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(propUser || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('links');
  
  // Profile state
  const [profile, setProfile] = useState<any>({});
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Modal state
  const [showCustomURLModal, setShowCustomURLModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [linkURL, setLinkURL] = useState('');
  const [customURL, setCustomURL] = useState('');
  const [customURLMode, setCustomURLMode] = useState<'link' | 'text'>('link');
  const [templateTab, setTemplateTab] = useState('Template Library');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Get user if not passed as prop
      if (!user) {
        try {
          const userRes = await authAPI.getMe();
          const userData = userRes.data.user || userRes.data;
          setUser(userData);
        } catch (userError: any) {
          console.error('Failed to get user:', userError);
          // Check if it's a verification issue
          if (userError.response?.status === 403) {
            navigate('/verify-email');
            return;
          }
          // Clear invalid token and redirect to login
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
      }
      
      // Get profile - this may fail if user just verified
      try {
        const profileRes = await profileAPI.getMyProfile();
        setProfile(profileRes.data || {});
        setUserLinks(profileRes.data?.links || []);
        setUserBadges(profileRes.data?.badges || []);
      } catch (profileError: any) {
        console.error('Failed to get profile:', profileError);
        // If verification required, redirect
        if (profileError.response?.status === 403) {
          navigate('/verify-email');
          return;
        }
        // Otherwise just use empty profile
        setProfile({});
        setUserLinks([]);
        setUserBadges([]);
      }
      
      // Get templates
      try {
        const templatesRes = await templatesAPI.getPublicTemplates();
        setTemplates(templatesRes.data || []);
      } catch (e) {
        console.log('Templates not available');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile(profile);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = async () => {
    if (!selectedPlatform || !linkURL) return;
    
    try {
      const platform = socialPlatforms.find(p => p.id === selectedPlatform);
      await profileAPI.addLink({
        platform: selectedPlatform,
        url: linkURL,
        title: platform?.name || selectedPlatform,
      });
      
      // Refresh links
      const profileRes = await profileAPI.getMyProfile();
      setUserLinks(profileRes.data?.links || []);
      
      setSelectedPlatform(null);
      setLinkURL('');
    } catch (error) {
      console.error('Add link error:', error);
      alert('Failed to add link');
    }
  };

  const handleAddCustomURL = async () => {
    if (!customURL) return;
    
    try {
      await profileAPI.addLink({
        platform: 'custom',
        url: customURL,
        title: 'Custom Link',
      });
      
      const profileRes = await profileAPI.getMyProfile();
      setUserLinks(profileRes.data?.links || []);
      
      setShowCustomURLModal(false);
      setCustomURL('');
    } catch (error) {
      console.error('Add custom link error:', error);
      alert('Failed to add link');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      await profileAPI.deleteLink(linkId);
      setUserLinks(userLinks.filter(l => l.id !== linkId));
    } catch (error) {
      console.error('Delete link error:', error);
      alert('Failed to delete link');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const res = await profileAPI.uploadMedia(formData);
      
      if (type === 'background') {
        setProfile({ ...profile, background_image: res.data.url });
      } else if (type === 'avatar') {
        setProfile({ ...profile, custom_pfp: res.data.url });
      } else if (type === 'audio') {
        setProfile({ ...profile, background_audio: res.data.url });
      } else if (type === 'cursor') {
        setProfile({ ...profile, custom_cursor: res.data.url });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    }
  };

  const handleRemoveAsset = (type: string) => {
    if (type === 'cursor') {
      setProfile({ ...profile, custom_cursor: null });
    }
  };

  const handleUseTemplate = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template?.share_code) {
        await templatesAPI.applyTemplate(template.share_code);
        loadData();
        alert('Template applied!');
      }
    } catch (error) {
      console.error('Apply template error:', error);
      alert('Failed to apply template');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#0f0f0f] border-r border-gray-800 p-4 flex flex-col z-40">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-white font-semibold">spite.lol</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {[
            { id: 'links', icon: <LinkIcon size={20} />, label: 'Links' },
            { id: 'appearance', icon: <Palette size={20} />, label: 'Appearance' },
            { id: 'badges', icon: <Award size={20} />, label: 'Badges' },
            { id: 'templates', icon: <Layout size={20} />, label: 'Templates' },
            { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* User info */}
        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {profile.custom_pfp ? (
                <img src={profile.custom_pfp} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.username}</p>
              <p className="text-gray-500 text-sm">UID: {user?.uid}</p>
            </div>
          </div>
          <a 
            href={`/${encodeURIComponent(user?.username || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} /> View Profile
          </a>
        </div>
      </div>
      
      {/* Main content */}
      <div className="ml-64 p-8">
        {/* Save button */}
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a]/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon size={20} className="text-white" />
                <h3 className="text-white font-semibold text-lg">Link your social media profiles.</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">Pick a social media to add to your profile.</p>
              
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {socialPlatforms.filter(p => p.id !== 'custom').map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className="w-12 h-12 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-all hover:scale-105"
                    title={platform.name}
                  >
                    <span style={{ color: platform.color }} className="text-xl">{platform.icon}</span>
                  </button>
                ))}
              </div>
              
              {/* Custom URL option */}
              <button 
                onClick={() => setShowCustomURLModal(true)}
                className="mt-4 flex items-center gap-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl p-4 w-full max-w-md transition-all"
              >
                <Globe size={24} className="text-gray-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Add Custom URL</p>
                  <p className="text-gray-500 text-sm">Use your own URL and choose an icon to match.</p>
                </div>
              </button>
            </div>
            
            {/* Added Links */}
            {userLinks.length > 0 && (
              <div className="bg-[#1a1a1a]/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Your Links</h3>
                <div className="space-y-3">
                  {userLinks.map((link) => {
                    const platform = socialPlatforms.find(p => p.id === link.platform);
                    return (
                      <div key={link.id} className="flex items-center justify-between bg-[#2a2a2a] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#3a3a3a]">
                            <span style={{ color: platform?.color || '#666' }} className="text-xl">
                              {platform?.icon || <Globe size={20} />}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{platform?.name || 'Custom'}</p>
                            <p className="text-gray-400 text-sm truncate max-w-xs">{link.url}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-8">
            {/* Assets Uploader */}
            <div className="space-y-6">
              <h2 className="text-white text-xl font-semibold">Assets Uploader</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Background */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">Background</h3>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500"
                    onClick={() => document.getElementById('bg-upload')?.click()}
                  >
                    {profile.background_image ? (
                      <img src={profile.background_image} alt="Background" className="w-full h-24 object-cover rounded" />
                    ) : (
                      <>
                        <ImageIcon className="mx-auto text-gray-500 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">Click to upload a file</p>
                      </>
                    )}
                    <input id="bg-upload" type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'background')} />
                  </div>
                </div>
                
                {/* Audio */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">Audio</h3>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500"
                    onClick={() => document.getElementById('audio-upload')?.click()}
                  >
                    {profile.background_audio ? (
                      <div className="flex items-center justify-center gap-2">
                        <Music className="text-purple-400" size={24} />
                        <span className="text-white text-sm">Audio uploaded</span>
                      </div>
                    ) : (
                      <>
                        <Folder className="mx-auto text-gray-500 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">Click to open audio manager</p>
                      </>
                    )}
                    <input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} />
                  </div>
                </div>
                
                {/* Profile Avatar */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">Profile Avatar</h3>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {profile.custom_pfp ? (
                      <img src={profile.custom_pfp} alt="Avatar" className="w-24 h-24 rounded-full mx-auto object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="mx-auto text-gray-500 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">Click to upload a file</p>
                      </>
                    )}
                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                  </div>
                </div>
                
                {/* Custom Cursor */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">Custom Cursor</h3>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 relative"
                    onClick={() => document.getElementById('cursor-upload')?.click()}
                  >
                    {profile.custom_cursor ? (
                      <>
                        <img src={profile.custom_cursor} alt="Cursor" className="w-16 h-16 mx-auto object-contain" />
                        <button 
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                          onClick={(e) => { e.stopPropagation(); handleRemoveAsset('cursor'); }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto text-gray-500 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">Click to upload a file</p>
                      </>
                    )}
                    <input id="cursor-upload" type="file" className="hidden" accept=".cur,.png,.gif" onChange={(e) => handleFileUpload(e, 'cursor')} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Premium Banner */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 flex items-center justify-center gap-2">
              <span className="text-purple-300">Want exclusive features? Unlock more with</span>
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <Crown size={16} /> Premium
              </span>
            </div>
            
            {/* General Customization */}
            <div className="space-y-6">
              <h2 className="text-white text-xl font-semibold">General Customization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Description */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Description</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <AlertTriangle size={16} className="text-gray-500" />
                    <input 
                      type="text"
                      placeholder="this is my description"
                      className="bg-transparent flex-1 text-white outline-none text-sm"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Discord Presence */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Discord Presence</label>
                  <div className="flex items-center gap-2">
                    <select 
                      className="flex-1 bg-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none text-sm"
                      value={profile.discord_presence || 'disabled'}
                      onChange={(e) => setProfile({...profile, discord_presence: e.target.value})}
                    >
                      <option value="disabled">Disabled</option>
                      <option value="enabled">Enabled</option>
                    </select>
                    <button className="p-2 bg-[#2a2a2a] rounded-lg text-gray-400 hover:text-white">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Profile Opacity */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block flex items-center gap-1">
                    Profile Opacity <HelpCircle size={14} />
                  </label>
                  <input 
                    type="range" min="20" max="100" 
                    value={profile.profile_opacity || 80}
                    onChange={(e) => setProfile({...profile, profile_opacity: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20%</span><span>50%</span><span>80%</span>
                  </div>
                </div>
                
                {/* Profile Blur */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block flex items-center gap-1">
                    Profile Blur <HelpCircle size={14} />
                  </label>
                  <input 
                    type="range" min="0" max="80" 
                    value={profile.profile_blur || 20}
                    onChange={(e) => setProfile({...profile, profile_blur: parseInt(e.target.value)})}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20px</span><span>50px</span><span>80px</span>
                  </div>
                </div>
                
                {/* Background Effects */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Background Effects</label>
                  <select 
                    className="w-full bg-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none text-sm"
                    value={profile.background_effect || 'none'}
                    onChange={(e) => setProfile({...profile, background_effect: e.target.value})}
                  >
                    <option value="none">None</option>
                    <option value="snowflakes">❄️ Snowflakes</option>
                    <option value="rain">🌧️ Rain</option>
                    <option value="stars">⭐ Stars</option>
                    <option value="hearts">❤️ Hearts</option>
                    <option value="confetti">🎉 Confetti</option>
                  </select>
                </div>
                
                {/* Username Effects */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Username Effects</label>
                  <button className="w-full bg-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm flex items-center justify-center gap-2 hover:bg-[#3a3a3a]">
                    <Sparkles size={16} /> Username Effects
                  </button>
                </div>
                
                {/* Location */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Location</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <MapPin size={16} className="text-gray-500" />
                    <input 
                      type="text"
                      placeholder="My Location"
                      className="bg-transparent flex-1 text-white outline-none text-sm"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Glow Settings */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block flex items-center gap-1">
                    Glow Settings <HelpCircle size={14} />
                  </label>
                  <div className="space-y-2">
                    <button 
                      className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${profile.glow_username ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-400'}`}
                      onClick={() => setProfile({...profile, glow_username: !profile.glow_username})}
                    >
                      <Sparkles size={14} /> Username
                    </button>
                    <div className="flex gap-2">
                      <button 
                        className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${profile.glow_socials ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-400'}`}
                        onClick={() => setProfile({...profile, glow_socials: !profile.glow_socials})}
                      >
                        <Sparkles size={14} /> Socials
                      </button>
                      <button 
                        className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${profile.glow_badges ? 'bg-purple-600 text-white' : 'bg-[#2a2a2a] text-gray-400'}`}
                        onClick={() => setProfile({...profile, glow_badges: !profile.glow_badges})}
                      >
                        <Sparkles size={14} /> Badges
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Color Customization */}
            <div className="space-y-6">
              <h2 className="text-white text-xl font-semibold">Color Customization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Accent Color */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Accent Color</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <input type="color" value={profile.accent_color || '#000000'} onChange={(e) => setProfile({...profile, accent_color: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                    <input type="text" value={profile.accent_color || '#000000'} onChange={(e) => setProfile({...profile, accent_color: e.target.value})} className="bg-transparent flex-1 text-white outline-none text-sm" />
                    <Pencil size={16} className="text-gray-500" />
                  </div>
                </div>
                
                {/* Text Color */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Text Color</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <input type="color" value={profile.text_color || '#ffffff'} onChange={(e) => setProfile({...profile, text_color: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                    <input type="text" value={profile.text_color || '#ffffff'} onChange={(e) => setProfile({...profile, text_color: e.target.value})} className="bg-transparent flex-1 text-white outline-none text-sm" />
                    <Pencil size={16} className="text-gray-500" />
                  </div>
                </div>
                
                {/* Enable Profile Gradient */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4 flex items-center">
                  <button 
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-red-900/50 to-green-900/50 text-white font-medium hover:opacity-80"
                    onClick={() => setProfile({...profile, enable_gradient: !profile.enable_gradient})}
                  >
                    {profile.enable_gradient ? 'Disable' : 'Enable'} Profile Gradient
                  </button>
                </div>
                
                {/* Background Color */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Background Color</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <input type="color" value={profile.background_color || '#000000'} onChange={(e) => setProfile({...profile, background_color: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                    <input type="text" value={profile.background_color || '#000000'} onChange={(e) => setProfile({...profile, background_color: e.target.value})} className="bg-transparent flex-1 text-white outline-none text-sm" />
                    <Pencil size={16} className="text-gray-500" />
                  </div>
                </div>
                
                {/* Icon Color */}
                <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                  <label className="text-gray-400 text-sm mb-2 block">Icon Color</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <input type="color" value={profile.icon_color || '#ffffff'} onChange={(e) => setProfile({...profile, icon_color: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                    <input type="text" value={profile.icon_color || '#ffffff'} onChange={(e) => setProfile({...profile, icon_color: e.target.value})} className="bg-transparent flex-1 text-white outline-none text-sm" />
                    <Pencil size={16} className="text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Other Customization */}
            <div className="space-y-6">
              <h2 className="text-white text-xl font-semibold">Other Customization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'monochrome_icons', label: 'Monochrome Icons', hasHelp: true },
                  { key: 'animated_title', label: 'Animated Title', hasHelp: false },
                  { key: 'swap_box_colors', label: 'Swap Box Colors', hasHelp: true },
                  { key: 'volume_control', label: 'Volume Control', hasHelp: false },
                  { key: 'use_discord_pfp', label: 'Use Discord Avatar', hasHelp: false },
                  { key: 'use_discord_decoration', label: 'Discord Avatar Decoration', hasHelp: false },
                ].map((item) => (
                  <div key={item.key} className="bg-[#1a1a1a]/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-gray-400 text-sm flex items-center gap-1">
                        {item.label} {item.hasHelp && <HelpCircle size={14} />}
                      </label>
                      <button 
                        className={`w-12 h-6 rounded-full transition-colors ${profile[item.key] ? 'bg-purple-600' : 'bg-gray-600'}`}
                        onClick={() => setProfile({...profile, [item.key]: !profile[item.key]})}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${profile[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold">All Badges</h2>
              <ChevronDown size={20} className="text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGE_DEFINITIONS.map((badge) => (
                <div key={badge.id} className="bg-[#1a1a1a]/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="text-white font-medium">{badge.name}</p>
                      <p className="text-gray-500 text-sm">{badge.description}</p>
                    </div>
                  </div>
                  {badge.hasAction && (
                    <button className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-4 py-2 rounded-lg text-sm">
                      {badge.actionText}
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Custom Badges Section */}
            <div className="bg-[#1a1a1a]/50 rounded-xl p-6 mt-8">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white text-lg font-semibold">Custom Badges</h3>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> New
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Custom badges allow you to create your own badges with a custom icon and name. You can edit your custom badges by using edit credits.
              </p>
              <div className="flex gap-3">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">Purchase</button>
                <button className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-6 py-2 rounded-lg">Preview Custom Badge</button>
              </div>
            </div>
            
            {/* User's Badges */}
            {userBadges.length > 0 && (
              <div className="bg-[#1a1a1a]/50 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Your Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {userBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                      <span>{badge.icon}</span>
                      <span className="text-white text-sm">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#1a1a1a]/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎨</span>
                <h2 className="text-white text-xl font-semibold">Discover the perfect spite.lol Template for your Profile</h2>
              </div>
              <p className="text-gray-400">Browse community-created templates, or design your own to share with the spite.lol community.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {['Template Library', 'Favorite Templates', 'Last Used Templates', 'My Uploads'].map((tab) => (
                  <button 
                    key={tab}
                    className={`text-sm ${templateTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    onClick={() => setTemplateTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Plus size={16} /> Create Template
              </button>
            </div>
            
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1 flex items-center gap-2 bg-[#1a1a1a]/50 rounded-lg px-4 py-2">
                <Search size={18} className="text-gray-500" />
                <input type="text" placeholder="Explore community-created templates" className="bg-transparent flex-1 text-white outline-none" />
              </div>
              <select className="bg-[#1a1a1a]/50 rounded-lg px-4 py-2 text-white outline-none">
                <option>Trending</option>
                <option>Newest</option>
                <option>Most Used</option>
              </select>
              <button className="bg-[#1a1a1a]/50 rounded-lg p-2 text-gray-400 hover:text-white">
                <Users size={20} />
              </button>
            </div>
            
            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.length > 0 ? templates.map((template) => (
                <div key={template.id} className="bg-[#1a1a1a]/50 rounded-xl overflow-hidden group">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                    {template.preview_url && (
                      <img src={template.preview_url} alt={template.name} className="w-full h-full object-cover" />
                    )}
                    <button className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-300">
                      <Star size={20} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700" />
                      <div>
                        <p className="text-white font-medium text-sm">{template.name}</p>
                        <p className="text-gray-500 text-xs">@{template.creator_username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Eye size={12} /> {template.uses_count || 0} uses</span>
                      <span className="flex items-center gap-1"><Star size={12} /> {template.stars_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUseTemplate(template.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm"
                      >
                        Use Template
                      </button>
                      <button className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-gray-400">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-4 text-center py-12 text-gray-500">
                  No templates available yet. Be the first to create one!
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-white text-2xl font-bold text-center">Account Settings</h1>
            
            {/* General Information */}
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">General Information</h2>
              <div className="bg-[#1a1a1a]/50 rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Username</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <Pencil size={16} className="text-gray-500" />
                    <span className="text-white">{user?.username}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Display Name</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <MessageSquare size={16} className="text-gray-500" />
                    <input 
                      type="text"
                      value={profile.display_name || user?.username || ''}
                      onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                      className="bg-transparent flex-1 text-white outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Alias</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <Hash size={16} className="text-gray-500" />
                    <input type="text" placeholder="Your alias" className="bg-transparent flex-1 text-white outline-none" />
                    <span className="text-purple-400 text-sm">Want more? Unlock with <span className="font-medium">Premium</span></span>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Email</label>
                  <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-white">{'•'.repeat(20)}</span>
                    <Eye size={16} className="text-gray-500 cursor-pointer ml-auto" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Language Settings */}
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">Language Settings</h2>
              <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Choose the language you want to use on spite.lol.</p>
                <select className="w-full bg-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none">
                  <option value="en">🇺🇸 English (US)</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                </select>
              </div>
            </div>
            
            {/* Discord Settings */}
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">Discord Settings</h2>
              <div className="bg-[#1a1a1a]/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Claim your spite.lol badges and perks as roles on the official Discord server</p>
                <button className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-2 rounded-lg">Claim Now</button>
              </div>
            </div>
            
            {/* Security Settings */}
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">Security Settings</h2>
              <div className="bg-[#1a1a1a]/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Multi-factor authentication</p>
                    <p className="text-gray-500 text-sm">Multi-factor authentication adds a layer of security to your account</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-colors bg-gray-600`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform translate-x-1`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Login with Discord</p>
                    <p className="text-gray-500 text-sm">Lets you sign in to your spite.lol account with Discord</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-colors bg-purple-600`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform translate-x-6`} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Account Actions */}
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">Account Actions</h2>
              <div className="bg-[#1a1a1a]/50 rounded-xl p-4 space-y-3">
                <p className="text-gray-400 text-sm">Recovery codes are one-time use. Used codes can't be reused.</p>
                <button className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-2 rounded-lg">Regenerate Recovery Codes</button>
                <button className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-2 rounded-lg">Change Email</button>
                <p className="text-gray-400 text-sm">By changing your password, you will be logged out of every device.</p>
                <button className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-2 rounded-lg">Change Password</button>
                <button className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white py-2 rounded-lg">Unlink Discord</button>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-900/50 hover:bg-red-900/70 text-red-400 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom URL Modal */}
      {showCustomURLModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCustomURLModal(false)}>
          <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Add Custom URL Social</h3>
              <button onClick={() => setShowCustomURLModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Icon</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500">
                  <ImageIcon className="mx-auto text-gray-500 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Click to upload a file</p>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-2 block flex items-center gap-1">
                  Social Mode <HelpCircle size={14} />
                </label>
                <div className="flex bg-[#2a2a2a] rounded-lg p-1">
                  <button 
                    className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${customURLMode === 'link' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
                    onClick={() => setCustomURLMode('link')}
                  >
                    <LinkIcon size={16} /> Link
                  </button>
                  <button 
                    className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${customURLMode === 'text' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
                    onClick={() => setCustomURLMode('text')}
                  >
                    <Type size={16} /> Text
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                <Globe size={20} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="https://..." 
                  className="bg-transparent flex-1 text-white outline-none"
                  value={customURL}
                  onChange={(e) => setCustomURL(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={handleAddCustomURL} className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-6 py-2 rounded-lg">Add</button>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Need help?</a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Social Link Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedPlatform(null)}>
          <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {(() => {
              const platform = socialPlatforms.find(p => p.id === selectedPlatform);
              if (!platform) return null;
              return (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#2a2a2a]">
                        <span style={{ color: platform.color }} className="text-xl">{platform.icon}</span>
                      </div>
                      <h3 className="text-white font-semibold">Add {platform.name}</h3>
                    </div>
                    <button onClick={() => setSelectedPlatform(null)} className="text-gray-400 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">{platform.name} URL or Username</label>
                      <input 
                        type="text" 
                        placeholder={platform.placeholder}
                        className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
                        value={linkURL}
                        onChange={(e) => setLinkURL(e.target.value)}
                      />
                    </div>
                    
                    <button 
                      onClick={handleAddSocialLink}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
                    >
                      Add Link
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
