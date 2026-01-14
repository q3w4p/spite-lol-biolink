import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { authAPI } from '../utils/api';

// Discord Icon SVG
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      navigate('/verify-email', { 
        state: { 
          userId: response.data.userId,
          email: formData.email 
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    window.location.href = '/api/auth/discord';
  };

  const features = [
    'Unlimited links',
    'Custom themes & effects',
    'Analytics dashboard',
    'Music player widget',
    'Custom cursors',
    'No watermarks',
  ];

  return (
    <div className="min-h-screen bg-black grid-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%)',
            top: '-20%',
            right: '-10%',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.04) 0%, transparent 70%)',
            bottom: '-10%',
            left: '-10%',
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center"
      >
        {/* Left side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block flex-1 max-w-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-[#059669]" />
            <span className="text-lg font-semibold text-white">All Premium Features Free</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Everything you need to <span className="text-[#059669]">stand out</span>
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#059669]/20 flex items-center justify-center">
                  <CheckCircle size={14} className="text-[#059669]" />
                </div>
                <span className="text-gray-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Form */}
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <motion.div
              className="w-12 h-12 rounded-xl bg-[#059669] flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-black font-bold text-xl">&gt;_</span>
            </motion.div>
            <span className="text-3xl font-bold text-[#059669]">spite.lol</span>
          </Link>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Page</h1>
              <p className="text-gray-400">Join thousands of creators</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
              >
                <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Discord Login Button */}
            <button
              onClick={handleDiscordLogin}
              className="btn-discord w-full mb-5"
            >
              <DiscordIcon />
              Continue with Discord
            </button>

            <div className="divider">or</div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    placeholder="yourname"
                    className="glass-input rounded-xl"
                    required
                    pattern="[a-zA-Z0-9_-]{3,50}"
                    title="3-50 characters, letters, numbers, underscores, and hyphens only"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  <span className="text-[#059669]">spite.lol/</span>
                  <span className="text-white">{formData.username || 'yourname'}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="glass-input rounded-xl"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 ml-1">We'll send a 6-digit verification code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="glass-input rounded-xl"
                    style={{ paddingRight: '48px' }}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-right"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="spinner w-5 h-5 border-2" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-[#059669] hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#059669] hover:underline">Privacy Policy</Link>
              </p>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-[#059669] hover:underline font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Features reminder - mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm lg:hidden"
          >
            <Sparkles size={16} className="text-[#059669]" />
            <span>All premium features included free</span>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Need help? <a href="mailto:contact@spite.lol" className="text-[#059669] hover:underline">contact@spite.lol</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
