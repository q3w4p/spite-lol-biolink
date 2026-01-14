import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Link2, Users, BarChart3, LogOut } from 'lucide-react';
import { User } from '../App';
import { authAPI } from '../utils/api';

interface HomePageProps {
  user: User | null;
}

export default function HomePage({ user }: HomePageProps) {
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-neon-purple/20 via-transparent to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-neon-pink/20 via-transparent to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-display font-bold"
        >
          <span className="gradient-text">spite.lol</span>
        </motion.div>

        <div className="flex gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-6 py-2 glass-effect rounded-full hover-glow font-medium transition-all"
              >
                Dashboard
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="px-6 py-2 glass-effect rounded-full hover-glow font-medium transition-all"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-6 py-2 glass-effect rounded-full hover-glow font-medium transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2 glass-effect rounded-full hover-glow font-medium transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 animated-gradient rounded-full font-bold transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-6 flex justify-center">
            <Sparkles className="text-neon-purple animate-glow" size={60} />
          </div>

          <h1 className="text-7xl md:text-8xl font-display font-bold mb-6 leading-tight">
            Your <span className="gradient-text animate-glow">personal</span>
            <br />
            link hub
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">
            Create a stunning biolink page in seconds. Share all your links,
            <br />
            social profiles, and content in one beautiful place.
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            {!user && (
              <Link
                to="/register"
                className="px-10 py-4 animated-gradient rounded-full font-bold text-lg transition-all hover:scale-110 shadow-lg"
              >
                Create Your Page
              </Link>
            )}
            {user && (
              <Link
                to={`/${user.username}`}
                className="px-10 py-4 animated-gradient rounded-full font-bold text-lg transition-all hover:scale-110 shadow-lg"
              >
                View Your Page
              </Link>
            )}
            <a
              href="#features"
              className="px-10 py-4 glass-effect rounded-full font-bold text-lg hover-glow transition-all"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-32 grid md:grid-cols-3 gap-8"
        >
          <div className="glass-effect p-8 rounded-2xl neon-border hover-glow">
            <Link2 className="text-neon-purple mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-3">One Link</h3>
            <p className="text-gray-400">
              Share one link that contains everything. Perfect for Instagram, TikTok, Twitter, and more.
            </p>
          </div>

          <div className="glass-effect p-8 rounded-2xl neon-border hover-glow">
            <Users className="text-neon-pink mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-3">Stand Out</h3>
            <p className="text-gray-400">
              Customize your page with themes, colors, and your own style. Make it uniquely yours.
            </p>
          </div>

          <div className="glass-effect p-8 rounded-2xl neon-border hover-glow">
            <BarChart3 className="text-neon-blue mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-3">Track Clicks</h3>
            <p className="text-gray-400">
              See how your audience engages. Track views and clicks on every link you share.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 container mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Built for <span className="gradient-text">creators</span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to showcase your online presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {[
            { title: 'Lightning Fast', desc: 'Optimized for speed. Your page loads instantly, every time.' },
            { title: 'Mobile First', desc: 'Looks perfect on every device. Responsive design guaranteed.' },
            { title: 'Easy Updates', desc: 'Add, edit, or remove links in seconds. No coding required.' },
            { title: 'Custom Themes', desc: 'Choose from beautiful themes or create your own with custom CSS.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-effect p-8 rounded-xl hover-glow"
            >
              <h3 className="text-2xl font-bold mb-3 gradient-text">{feature.title}</h3>
              <p className="text-gray-400 text-lg">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-effect p-16 rounded-3xl neon-border text-center max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of creators sharing their content with spite.lol
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-block px-12 py-5 animated-gradient rounded-full font-bold text-xl transition-all hover:scale-110 shadow-2xl"
            >
              Create Free Account
            </Link>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p className="font-display">© 2026 spite.lol - Your personal link hub</p>
          <p className="mt-2 text-sm">Built with 💜 for creators</p>
        </div>
      </footer>
    </div>
  );
}
