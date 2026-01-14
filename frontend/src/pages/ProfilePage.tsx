import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ExternalLink, Eye, Music, Pause, Play, Volume2, VolumeX,
  Globe, Mail, MessageCircle, Share2, Copy, Check,
  Sparkles, CheckCircle, Shield, Wrench, X
} from 'lucide-react';
import { profileAPI } from '../utils/api';

// Cursor effect component
function CursorEffect({ effect, color, density }: { effect: string; color: string; density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    if (effect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const particleCount = Math.floor(density / 20);
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: effect === 'rain' ? Math.random() * 3 + 1 : (Math.random() - 0.5) * 2,
          life: 1,
          size: Math.random() * 3 + 1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        ctx.beginPath();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = color;

        if (effect === 'snowflakes') {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        } else if (effect === 'rain') {
          ctx.fillRect(p.x, p.y, 1, p.size * 3);
        } else if (effect === 'stars') {
          const spikes = 5;
          const outerRadius = p.size;
          const innerRadius = p.size / 2;
          let rot = Math.PI / 2 * 3;
          let step = Math.PI / spikes;
          ctx.moveTo(p.x, p.y - outerRadius);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(p.x + Math.cos(rot) * outerRadius, p.y + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(p.x + Math.cos(rot) * innerRadius, p.y + Math.sin(rot) * innerRadius);
            rot += step;
          }
          ctx.lineTo(p.x, p.y - outerRadius);
          ctx.closePath();
        }
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [effect, color, density]);

  if (effect === 'none') return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

// Typewriter text component
function TypewriterText({ text, speed = 50, enabled = true }: { text: string; speed?: number; enabled?: boolean }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    setDisplayText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return (
    <span>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
}

// 3D Tilt Card
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Music Player
const MusicPlayer = ({ audioUrl, songTitle }: { audioUrl?: string; songTitle?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  if (!audioUrl) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-xl mb-6">
      <audio ref={audioRef} src={audioUrl} loop muted={isMuted} />
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#059669] hover:bg-[#059669]/30 transition-colors">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Music size={14} className="text-[#059669]" />
            <span className="text-sm text-white font-medium">{songTitle || 'Now Playing'}</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`w-1 rounded-full bg-[#059669] transition-all ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: isPlaying ? `${Math.random() * 16 + 4}px` : '4px', animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-400 hover:text-[#059669] transition-colors">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </motion.div>
  );
};

// Badge component
function Badge({ type, name, monochrome }: { type: string; name: string; monochrome?: boolean }) {
  const badges: Record<string, { icon: any; color: string; bg: string }> = {
    verified: { icon: CheckCircle, color: monochrome ? 'text-gray-400' : 'text-blue-400', bg: 'bg-blue-400/10' },
    staff: { icon: Wrench, color: monochrome ? 'text-gray-400' : 'text-blue-400', bg: 'bg-blue-400/10' },
    admin: { icon: Shield, color: monochrome ? 'text-gray-400' : 'text-red-400', bg: 'bg-red-400/10' },
  };
  const badge = badges[type] || badges.verified;
  const Icon = badge.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bg}`} title={name}>
      <Icon size={14} className={badge.color} />
      <span className={`text-xs font-medium ${badge.color}`}>{name}</span>
    </div>
  );
}

// Share Modal
const ShareModal = ({ isOpen, onClose, username }: { isOpen: boolean; onClose: () => void; username: string }) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = `https://spite.lol/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card p-6 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Profile</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-dark-surface rounded-xl mb-4">
              <input type="text" value={profileUrl} readOnly className="flex-1 bg-transparent text-gray-300 text-sm outline-none" />
              <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                {copied ? <Check size={18} className="text-[#059669]" /> : <Copy size={18} className="text-gray-400" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Link Card
const LinkCard = ({ link, index, onClick }: { link: any; index: number; onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full relative group"
    >
      <TiltCard className="w-full">
        <div className="link-card relative overflow-hidden">
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(90deg, rgba(0,255,0,0.1), rgba(0,255,0,0.2), rgba(0,255,0,0.1))', backgroundSize: '200% 100%' }}
            animate={isHovered ? { backgroundPosition: ['0% 0%', '200% 0%'] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {link.icon && <motion.span className="text-2xl" animate={isHovered ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }}>{link.icon}</motion.span>}
              <div className="text-left">
                <span className="text-lg font-semibold text-white block">{link.title}</span>
                {link.description && <span className="text-sm text-gray-400">{link.description}</span>}
              </div>
            </div>
            <motion.div animate={isHovered ? { x: 5 } : { x: 0 }} transition={{ duration: 0.3 }}>
              <ExternalLink className="text-gray-400 group-hover:text-[#059669] transition-colors" size={20} />
            </motion.div>
          </div>
        </div>
      </TiltCard>
    </motion.button>
  );
};

// Main Profile Page
export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getPublicProfile(username!);
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId: number, url: string) => {
    try {
      await profileAPI.trackClick(username!, linkId);
      window.open(url, '_blank');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black grid-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.h1 className="text-8xl font-black mb-4 text-[#059669]" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>404</motion.h1>
          <p className="text-xl text-gray-400 mb-8">{error}</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </motion.div>
      </div>
    );
  }

  const settings = profile?.settings || {};
  const badges = profile?.badges || [];
  const links = profile?.links || [];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cursor Effect */}
      <CursorEffect effect={settings.cursorEffect || 'none'} color={settings.cursorColor || '#00FF00'} density={settings.cursorDensity || 50} />

      {/* Background */}
      {profile?.backgroundImage ? (
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${profile.backgroundImage})` }}>
          <div className="absolute inset-0 bg-black/70" />
        </div>
      ) : profile?.backgroundVideo ? (
        <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover">
          <source src={profile.backgroundVideo} type="video/mp4" />
        </video>
      ) : (
        <div className="fixed inset-0 grid-background" />
      )}

      {/* Glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#059669]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#059669]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-2xl">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-10">
          {/* Avatar */}
          <motion.div className="relative inline-block mb-6" whileHover={{ scale: 1.05 }}>
            <div className="absolute inset-0 bg-[#059669]/30 rounded-full blur-xl" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#059669]/50">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#059669]/20 flex items-center justify-center text-4xl font-bold text-[#059669]">
                  {profile?.displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {badges.length > 0 && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center">
                <Sparkles size={16} className="text-black" />
              </div>
            )}
          </motion.div>

          {/* Name */}
          <h1 className="text-3xl font-bold text-white mb-1">{profile?.displayName || username}</h1>
          <p className="text-xs text-gray-500 font-mono mb-3">UID: {profile?.uid || 'ABC123XY'}</p>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {badges.map((badge: any, index: number) => (
                <Badge key={index} type={badge.type} name={badge.name} monochrome={settings.monochromeIcons} />
              ))}
            </div>
          )}

          {/* Bio */}
          {profile?.bio && (
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              <TypewriterText text={profile.bio} speed={50} enabled={settings.typewriterEffect} />
            </p>
          )}

          {/* Share Button */}
          <button onClick={() => setShowShare(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/20 transition-colors">
            <Share2 size={16} />
            Share
          </button>
        </motion.div>

        {/* Music Player */}
        {profile?.audioUrl && <MusicPlayer audioUrl={profile.audioUrl} songTitle={profile.songTitle} />}

        {/* Links */}
        <div className="space-y-4">
          {links.length > 0 ? (
            links.map((link: any, index: number) => (
              <LinkCard key={link.id || index} link={link} index={index} onClick={() => handleLinkClick(link.id, link.url)} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 text-sm">No links added yet</p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#059669] transition-colors text-sm">
            <div className="w-5 h-5 rounded bg-[#059669]/20 flex items-center justify-center">
              <span className="text-[#059669] text-xs font-bold">&gt;_</span>
            </div>
            spite.lol
          </Link>
        </motion.div>
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} username={username || ''} />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-4 text-gray-500 text-sm">
        Need help? <a href="mailto:contact@spite.lol" className="text-[#059669] hover:underline">contact@spite.lol</a>
      </footer>
    </div>
  );
}
