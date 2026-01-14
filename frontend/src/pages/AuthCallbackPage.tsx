import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { authAPI } from '../utils/api';
import { User } from '../App';

interface AuthCallbackPageProps {
  setUser: (user: User) => void;
}

export default function AuthCallbackPage({ setUser }: AuthCallbackPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(getErrorMessage(errorParam));
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Fetch user data
      authAPI.getMe()
        .then((response) => {
          setUser(response.data.user);
          setSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        })
        .catch((err) => {
          console.error('Failed to get user:', err);
          setError('Failed to authenticate. Please try again.');
          localStorage.removeItem('token');
        });
    } else {
      setError('No authentication token received.');
    }
  }, [searchParams, navigate, setUser]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'no_code':
        return 'Discord authorization was cancelled.';
      case 'token_failed':
        return 'Failed to get access token from Discord.';
      case 'user_failed':
        return 'Failed to get user information from Discord.';
      case 'oauth_failed':
        return 'OAuth authentication failed. Please try again.';
      default:
        return 'An unknown error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen bg-black grid-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-2xl text-center max-w-md"
      >
        {error ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="text-red-400" size={32} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Failed</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-6 py-3"
            >
              Back to Login
            </button>
          </>
        ) : success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-[#059669]/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="text-[#059669]" size={32} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-gray-400 mb-4">Successfully authenticated with Discord</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        ) : (
          <>
            <div className="spinner w-10 h-10 border-3 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Authenticating...</h1>
            <p className="text-gray-400">Please wait while we complete your login</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
