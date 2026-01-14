import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { authAPI } from '../utils/api';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit) && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verify({ email, code: verificationCode });
      // Store the token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await authAPI.resendCode({ email });
      setResendCooldown(60);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black grid-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 rounded-full bg-[#059669]/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} className="text-[#059669]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">Email Verified!</h1>
          <p className="text-gray-400 mb-6">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
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
            <div className="w-16 h-16 rounded-full bg-[#059669]/10 flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-[#059669]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-400 text-sm">
              We sent a 6-digit code to<br />
              <span className="text-[#059669] font-medium">{email}</span>
            </p>
            <p className="text-gray-500 text-xs mt-2">Code expires in 5 minutes</p>
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

          {/* Code Input */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:bg-[#059669]/10 outline-none transition-all" style={{ color: '#059669', caretColor: '#059669' }}
                disabled={loading}
              />
            ))}
          </div>

          <motion.button
            onClick={() => handleVerify(code.join(''))}
            disabled={loading || code.some(d => !d)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="spinner w-5 h-5 border-2" />
            ) : (
              <>
                Verify Email
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-2 text-[#059669] hover:underline font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help? <a href="mailto:contact@spite.lol" className="text-[#059669] hover:underline">contact@spite.lol</a>
        </p>
      </motion.div>
    </div>
  );
}
