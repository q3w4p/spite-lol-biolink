import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Image, Music, User, MousePointer2, X, Settings, MapPin, Sparkles, 
  HelpCircle, Pencil, Crown
} from 'lucide-react';
import api from '../utils/api';

interface CustomizationSettings {
  description: string;
  discordPresence: boolean;
  profileOpacity: number;
  profileBlur: number;
  backgroundEffect: string;
  usernameEffect: string;
  location: string;
  glowUsername: boolean;
  glowSocials: boolean;
  glowBadges: boolean;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  iconColor: string;
  enableGradient: boolean;
  monochromeIcons: boolean;
  animatedTitle: boolean;
  swapBoxColors: boolean;
  volumeControl: boolean;
  useDiscordAvatar: boolean;
  discordDecoration: boolean;
}

export default function CustomizePage() {
  const [settings, setSettings] = useState<CustomizationSettings>({
    description: '',
    discordPresence: false,
    profileOpacity: 80,
    profileBlur: 20,
    backgroundEffect: 'none',
    usernameEffect: 'none',
    location: '',
    glowUsername: false,
    glowSocials: false,
    glowBadges: false,
    accentColor: '#059669',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    iconColor: '#ffffff',
    enableGradient: false,
    monochromeIcons: false,
    animatedTitle: true,
    swapBoxColors: false,
    volumeControl: true,
    useDiscordAvatar: true,
    discordDecoration: true
  });

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cursorFile, setCursorFile] = useState<File | null>(null);
  const [cursorPreview, setCursorPreview] = useState<string | null>(null);

  const backgroundRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: string, file: File) => {
    switch (type) {
      case 'background':
        setBackgroundFile(file);
        break;
      case 'audio':
        setAudioFile(file);
        break;
      case 'avatar':
        setAvatarFile(file);
        break;
      case 'cursor':
        setCursorFile(file);
        setCursorPreview(URL.createObjectURL(file));
        break;
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/profile/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const Toggle = ({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label?: string }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  );

  const Slider = ({ value, onChange, min, max, marks }: { value: number; onChange: (v: number) => void; min: number; max: number; marks?: string[] }) => (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
      {marks && (
        <div className="flex justify-between mt-1">
          {marks.map((mark, i) => (
            <span key={i} className="text-xs text-gray-500">{mark}</span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Assets Uploader */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Assets Uploader</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Background */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Background</label>
                <div
                  onClick={() => backgroundRef.current?.click()}
                  className="aspect-video bg-[#1a1a1a] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <Image className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-500">Click to upload a file</span>
                </div>
                <input
                  ref={backgroundRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('background', e.target.files[0])}
                />
              </div>

              {/* Audio */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Audio</label>
                <div
                  onClick={() => audioRef.current?.click()}
                  className="aspect-video bg-[#1a1a1a] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <Music className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-500">Click to open audio manager</span>
                </div>
                <input
                  ref={audioRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('audio', e.target.files[0])}
                />
              </div>

              {/* Profile Avatar */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Profile Avatar</label>
                <div
                  onClick={() => avatarRef.current?.click()}
                  className="aspect-video bg-[#1a1a1a] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <Image className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-500">Click to upload a file</span>
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('avatar', e.target.files[0])}
                />
              </div>

              {/* Custom Cursor */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Custom Cursor</label>
                <div
                  onClick={() => cursorRef.current?.click()}
                  className="aspect-video bg-[#1a1a1a] border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors relative"
                >
                  {cursorPreview ? (
                    <>
                      <img src={cursorPreview} alt="Cursor preview" className="w-12 h-12 object-contain" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setCursorFile(null); setCursorPreview(null); }}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute top-2 left-2 text-xs text-gray-400">.CUR</span>
                    </>
                  ) : (
                    <>
                      <Image className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-xs text-gray-500">Click to upload a file</span>
                    </>
                  )}
                </div>
                <input
                  ref={cursorRef}
                  type="file"
                  accept=".cur,.png,.gif"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('cursor', e.target.files[0])}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl p-4 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">Want exclusive features? Unlock more with</span>
            <span className="text-purple-400 font-semibold">Premium</span>
          </div>
        </motion.div>

        {/* General Customization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">General Customization</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-gray-500">△</span>
                  <input
                    type="text"
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    placeholder="this is my description"
                    className="bg-transparent flex-1 outline-none text-white placeholder-gray-600 text-sm"
                  />
                </div>
              </div>

              {/* Discord Presence */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Discord Presence</label>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-gray-500">🎮</span>
                  <select
                    value={settings.discordPresence ? 'enabled' : 'disabled'}
                    onChange={(e) => setSettings({ ...settings, discordPresence: e.target.value === 'enabled' })}
                    className="bg-transparent flex-1 outline-none text-white text-sm"
                  >
                    <option value="disabled">Disabled</option>
                    <option value="enabled">Enabled</option>
                  </select>
                  <Settings className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Profile Opacity */}
              <div>
                <label className="flex items-center gap-1 text-sm text-gray-400 mb-2">
                  Profile Opacity
                  <HelpCircle className="w-3 h-3" />
                </label>
                <Slider
                  value={settings.profileOpacity}
                  onChange={(v) => setSettings({ ...settings, profileOpacity: v })}
                  min={0}
                  max={100}
                  marks={['20%', '50%', '80%']}
                />
              </div>

              {/* Profile Blur */}
              <div>
                <label className="flex items-center gap-1 text-sm text-gray-400 mb-2">
                  Profile Blur
                  <HelpCircle className="w-3 h-3" />
                </label>
                <Slider
                  value={settings.profileBlur}
                  onChange={(v) => setSettings({ ...settings, profileBlur: v })}
                  min={0}
                  max={100}
                  marks={['20px', '50px', '80px']}
                />
              </div>

              {/* Background Effects */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Background Effects</label>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                  <select
                    value={settings.backgroundEffect}
                    onChange={(e) => setSettings({ ...settings, backgroundEffect: e.target.value })}
                    className="bg-transparent flex-1 outline-none text-white text-sm"
                  >
                    <option value="none">None</option>
                    <option value="snowflakes">Snowflakes</option>
                    <option value="rain">Rain</option>
                    <option value="stars">Stars</option>
                    <option value="particles">Particles</option>
                  </select>
                </div>
              </div>

              {/* Username Effects */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username Effects</label>
                <button className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5 text-white hover:bg-[#252525] transition-colors">
                  <Sparkles className="w-4 h-4" />
                  Username Effects
                </button>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    placeholder="My Location"
                    className="bg-transparent flex-1 outline-none text-white placeholder-gray-600 text-sm"
                  />
                </div>
              </div>

              {/* Glow Settings */}
              <div>
                <label className="flex items-center gap-1 text-sm text-gray-400 mb-2">
                  Glow Settings
                  <HelpCircle className="w-3 h-3" />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettings({ ...settings, glowUsername: !settings.glowUsername })}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      settings.glowUsername ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#1a1a1a] border-white/5 text-gray-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    Username
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, glowSocials: !settings.glowSocials })}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      settings.glowSocials ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#1a1a1a] border-white/5 text-gray-400'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    Socials
                  </button>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, glowBadges: !settings.glowBadges })}
                  className={`w-full mt-2 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    settings.glowBadges ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#1a1a1a] border-white/5 text-gray-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Badges
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Color Customization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Color Customization</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                {/* Accent Color */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Accent Color</label>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-white text-sm"
                    />
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Background Color</label>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-white text-sm"
                    />
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Text Color */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Text Color</label>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.textColor}
                      onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-white text-sm"
                    />
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* Icon Color */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Icon Color</label>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-white/5">
                    <input
                      type="color"
                      value={settings.iconColor}
                      onChange={(e) => setSettings({ ...settings, iconColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.iconColor}
                      onChange={(e) => setSettings({ ...settings, iconColor: e.target.value })}
                      className="bg-transparent flex-1 outline-none text-white text-sm"
                    />
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Enable Gradient Button */}
              <div className="flex items-center">
                <button
                  onClick={() => setSettings({ ...settings, enableGradient: !settings.enableGradient })}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    settings.enableGradient
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/50'
                  }`}
                >
                  Enable Profile Gradient
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Customization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Other Customization</h2>
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center gap-1 text-sm text-white">
                    Monochrome Icons
                    <HelpCircle className="w-3 h-3 text-gray-500" />
                  </label>
                </div>
                <Toggle enabled={settings.monochromeIcons} onChange={() => setSettings({ ...settings, monochromeIcons: !settings.monochromeIcons })} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white">Animated Title</label>
                <Toggle enabled={settings.animatedTitle} onChange={() => setSettings({ ...settings, animatedTitle: !settings.animatedTitle })} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center gap-1 text-sm text-white">
                    Swap Box Colors
                    <HelpCircle className="w-3 h-3 text-gray-500" />
                  </label>
                </div>
                <Toggle enabled={settings.swapBoxColors} onChange={() => setSettings({ ...settings, swapBoxColors: !settings.swapBoxColors })} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white">Volume Control</label>
                <Toggle enabled={settings.volumeControl} onChange={() => setSettings({ ...settings, volumeControl: !settings.volumeControl })} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white">Use Discord Avatar</label>
                <Toggle enabled={settings.useDiscordAvatar} onChange={() => setSettings({ ...settings, useDiscordAvatar: !settings.useDiscordAvatar })} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-white">Discord Avatar Decoration</label>
                <Toggle enabled={settings.discordDecoration} onChange={() => setSettings({ ...settings, discordDecoration: !settings.discordDecoration })} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Need help? <a href="mailto:contact@spite.lol" className="text-emerald-500 hover:underline">contact@spite.lol</a>
        </p>
      </div>
    </div>
  );
}
