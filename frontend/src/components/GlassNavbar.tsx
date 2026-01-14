import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User as UserIcon, LogOut, Settings, LayoutDashboard, Shield } from 'lucide-react';
import { User } from '../App';
import { authAPI } from '../utils/api';

interface GlassNavbarProps {
  user: User | null;
}

export default function GlassNavbar({ user }: GlassNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3 bg-black/90 backdrop-blur-xl border-b border-dark-border shadow-lg'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                src="/logo.png"
                alt="spite.lol"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-[#059669] hidden sm:block">
                spite.lol
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink href="/#features">Features</NavLink>
              <NavLink href="/#pricing">Pricing</NavLink>
              <a
                href="https://discord.gg/spite"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-gray-400 hover:text-[#059669] transition-colors rounded-lg hover:bg-[#059669]/5"
              >
                Discord
              </a>
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 glass-card rounded-full hover:border-[#059669]/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#059669]/20 flex items-center justify-center text-sm font-bold text-[#059669]">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-white">{user.username}</span>
                    {user.isAdmin && (
                      <Shield size={14} className="text-red-400" />
                    )}
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 glass-card rounded-xl overflow-hidden shadow-2xl"
                      >
                        <div className="p-2">
                          <DropdownItem
                            icon={LayoutDashboard}
                            label="Dashboard"
                            onClick={() => {
                              navigate('/dashboard');
                              setIsProfileMenuOpen(false);
                            }}
                          />
                          <DropdownItem
                            icon={UserIcon}
                            label="View Profile"
                            onClick={() => {
                              navigate(`/${user.username}`);
                              setIsProfileMenuOpen(false);
                            }}
                          />
                          {user.isAdmin && (
                            <DropdownItem
                              icon={Settings}
                              label="Admin Panel"
                              onClick={() => {
                                navigate('/admin');
                                setIsProfileMenuOpen(false);
                              }}
                            />
                          )}
                          <div className="h-px bg-dark-border my-2" />
                          <DropdownItem
                            icon={LogOut}
                            label="Sign Out"
                            onClick={handleLogout}
                            danger
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="btn-primary px-6 py-2.5"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 glass-card rounded-xl text-gray-400 hover:text-[#059669] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-dark-card border-l border-dark-border p-6 pt-24"
            >
              <div className="space-y-4">
                <MobileNavLink href="/#features" onClick={() => setIsMobileMenuOpen(false)}>
                  Features
                </MobileNavLink>
                <MobileNavLink href="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>
                  Pricing
                </MobileNavLink>
                <MobileNavLink href="https://discord.gg/spite" onClick={() => setIsMobileMenuOpen(false)}>
                  Discord
                </MobileNavLink>

                <div className="h-px bg-dark-border my-6" />

                {user ? (
                  <>
                    <MobileNavLink href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink href={`/${user.username}`} onClick={() => setIsMobileMenuOpen(false)}>
                      View Profile
                    </MobileNavLink>
                    {user.isAdmin && (
                      <MobileNavLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        Admin Panel
                      </MobileNavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 pt-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center px-6 py-3 glass-card rounded-xl font-medium hover:border-[#059669]/30 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-primary block w-full text-center px-6 py-3"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </>
  );
}

// Helper Components
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="px-4 py-2 text-gray-400 hover:text-[#059669] transition-colors rounded-lg hover:bg-[#059669]/5 font-medium"
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <a
    href={href}
    onClick={onClick}
    className="block px-4 py-3 text-lg text-gray-400 hover:text-[#059669] hover:bg-[#059669]/5 rounded-xl transition-colors"
  >
    {children}
  </a>
);

const DropdownItem = ({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      danger
        ? 'text-red-400 hover:bg-red-500/10'
        : 'text-gray-400 hover:text-[#059669] hover:bg-[#059669]/5'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium">{label}</span>
  </button>
);
