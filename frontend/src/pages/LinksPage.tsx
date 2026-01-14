import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Globe, Plus, X, GripVertical, ExternalLink } from 'lucide-react';
import api from '../utils/api';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  color: string;
}

interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

const socialPlatforms = [
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: '#FFFC00', placeholder: 'username' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', placeholder: 'channel URL' },
  { id: 'discord', name: 'Discord', icon: '🎮', color: '#5865F2', placeholder: 'invite or user ID' },
  { id: 'spotify', name: 'Spotify', icon: '🎵', color: '#1DB954', placeholder: 'profile URL' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F', placeholder: 'username' },
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000', placeholder: 'username' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000', placeholder: 'username' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088CC', placeholder: 'username' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '☁️', color: '#FF5500', placeholder: 'profile URL' },
  { id: 'paypal', name: 'PayPal', icon: '💳', color: '#00457C', placeholder: 'paypal.me link' },
  { id: 'github', name: 'GitHub', icon: '🐙', color: '#181717', placeholder: 'username' },
  { id: 'cashapp', name: 'Cash App', icon: '💵', color: '#00D632', placeholder: '$cashtag' },
  { id: 'applemusic', name: 'Apple Music', icon: '🎵', color: '#FA243C', placeholder: 'profile URL' },
  { id: 'steam', name: 'Steam', icon: '🎮', color: '#171A21', placeholder: 'profile URL' },
  { id: 'twitch', name: 'Twitch', icon: '📺', color: '#9146FF', placeholder: 'username' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', color: '#FF4500', placeholder: 'u/username' },
  { id: 'vk', name: 'VK', icon: '🔵', color: '#4680C2', placeholder: 'profile URL' },
  { id: 'notion', name: 'Notion', icon: '📝', color: '#000000', placeholder: 'page URL' },
  { id: 'onlyfans', name: 'OnlyFans', icon: '💙', color: '#00AFF0', placeholder: 'username' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', placeholder: 'profile URL' },
  { id: 'kick', name: 'Kick', icon: '🎬', color: '#53FC18', placeholder: 'username' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023', placeholder: 'username' },
  { id: 'lastfm', name: 'Last.fm', icon: '🎧', color: '#D51007', placeholder: 'username' },
  { id: 'kofi', name: 'Ko-fi', icon: '☕', color: '#FF5E5B', placeholder: 'username' },
  { id: 'buymeacoffee', name: 'Buy Me a Coffee', icon: '☕', color: '#FFDD00', placeholder: 'username' },
  { id: 'mastodon', name: 'Mastodon', icon: '🐘', color: '#6364FF', placeholder: '@user@instance' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2', placeholder: 'profile URL' },
  { id: 'threads', name: 'Threads', icon: '@', color: '#000000', placeholder: 'username' },
  { id: 'patreon', name: 'Patreon', icon: '🎨', color: '#FF424D', placeholder: 'username' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', color: '#F7931A', placeholder: 'wallet address' },
  { id: 'ethereum', name: 'Ethereum', icon: '◊', color: '#627EEA', placeholder: 'wallet address' },
  { id: 'litecoin', name: 'Litecoin', icon: 'Ł', color: '#BFBBBB', placeholder: 'wallet address' },
  { id: 'monero', name: 'Monero', icon: 'ɱ', color: '#FF6600', placeholder: 'wallet address' },
  { id: 'email', name: 'Email', icon: '✉️', color: '#EA4335', placeholder: 'email@example.com' },
  { id: 'roblox', name: 'Roblox', icon: '🎮', color: '#E2231A', placeholder: 'profile URL' },
];

export default function LinksPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof socialPlatforms[0] | null>(null);
  const [linkValue, setLinkValue] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/profile/links');
      setSocialLinks(response.data.socialLinks || []);
      setCustomLinks(response.data.customLinks || []);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocialLink = async () => {
    if (!selectedPlatform || !linkValue) return;
    
    try {
      const newLink: SocialLink = {
        id: Date.now().toString(),
        platform: selectedPlatform.id,
        url: linkValue,
        icon: selectedPlatform.icon,
        color: selectedPlatform.color
      };
      
      await api.post('/profile/links/social', newLink);
      setSocialLinks([...socialLinks, newLink]);
      setShowAddModal(false);
      setSelectedPlatform(null);
      setLinkValue('');
    } catch (error) {
      console.error('Failed to add link:', error);
      alert('Failed to add link');
    }
  };

  const handleAddCustomLink = async () => {
    if (!customTitle || !customUrl) return;
    
    try {
      const newLink: CustomLink = {
        id: Date.now().toString(),
        title: customTitle,
        url: customUrl,
        icon: '🔗'
      };
      
      await api.post('/profile/links/custom', newLink);
      setCustomLinks([...customLinks, newLink]);
      setShowCustomModal(false);
      setCustomTitle('');
      setCustomUrl('');
    } catch (error) {
      console.error('Failed to add custom link:', error);
      alert('Failed to add custom link');
    }
  };

  const handleRemoveLink = async (id: string, type: 'social' | 'custom') => {
    try {
      await api.delete(`/profile/links/${type}/${id}`);
      if (type === 'social') {
        setSocialLinks(socialLinks.filter(l => l.id !== id));
      } else {
        setCustomLinks(customLinks.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove link:', error);
    }
  };

  const isLinked = (platformId: string) => {
    return socialLinks.some(l => l.platform === platformId);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Link2 className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">Link your social media profiles.</h1>
          </div>
          <p className="text-gray-400">Pick a social media to add to your profile.</p>
        </motion.div>

        {/* Social Media Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-3">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => {
                  if (!isLinked(platform.id)) {
                    setSelectedPlatform(platform);
                    setShowAddModal(true);
                  }
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                  isLinked(platform.id)
                    ? 'bg-emerald-600/20 border border-emerald-500/50'
                    : 'bg-[#1a1a1a] border border-white/5 hover:border-white/20'
                }`}
                style={{ 
                  backgroundColor: isLinked(platform.id) ? `${platform.color}20` : undefined,
                  borderColor: isLinked(platform.id) ? `${platform.color}50` : undefined
                }}
                title={platform.name}
              >
                <span style={{ filter: isLinked(platform.id) ? 'none' : 'grayscale(100%)' }}>
                  {platform.icon}
                </span>
              </button>
            ))}
            
            {/* Add Custom URL */}
            <button
              onClick={() => setShowCustomModal(true)}
              className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#1a1a1a] border border-white/5 hover:border-emerald-500/50 transition-all hover:scale-110 col-span-2"
              title="Add Custom URL"
            >
              <Globe className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Globe className="w-4 h-4" />
            <span>Add Custom URL</span>
            <span className="text-gray-600">- Use your own URL and choose an icon to match.</span>
          </div>
        </motion.div>

        {/* Current Links */}
        {(socialLinks.length > 0 || customLinks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Your Links</h2>
            <div className="space-y-3">
              {socialLinks.map((link) => {
                const platform = socialPlatforms.find(p => p.id === link.platform);
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-3 border border-white/5"
                  >
                    <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                    <span className="text-xl">{link.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{platform?.name}</p>
                      <p className="text-sm text-gray-500">{link.url}</p>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleRemoveLink(link.id, 'social')}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              
              {customLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-3 border border-white/5"
                >
                  <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                  <span className="text-xl">{link.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{link.title}</p>
                    <p className="text-sm text-gray-500">{link.url}</p>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRemoveLink(link.id, 'custom')}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Social Link Modal */}
        {showAddModal && selectedPlatform && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add {selectedPlatform.name}</h2>
                <button
                  onClick={() => { setShowAddModal(false); setSelectedPlatform(null); }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Enter your {selectedPlatform.name} {selectedPlatform.placeholder}
                </label>
                <input
                  type="text"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder={selectedPlatform.placeholder}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAddModal(false); setSelectedPlatform(null); }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSocialLink}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Custom Link Modal */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add Custom URL</h2>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="My Website"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">URL</label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomLink}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Need help? <a href="mailto:contact@spite.lol" className="text-emerald-500 hover:underline">contact@spite.lol</a>
        </p>
      </div>
    </div>
  );
}
