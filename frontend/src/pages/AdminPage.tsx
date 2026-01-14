import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../App';

interface AdminPageProps {
  user: User | null;
}

export default function AdminPage({ user }: AdminPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <nav className="border-b border-gray-800 bg-dark-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="text-2xl font-display font-bold gradient-text">
            spite.lol - Admin
          </Link>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-display font-bold mb-8 gradient-text">Admin Panel</h1>
        <div className="glass-effect p-8 rounded-2xl">
          <p className="text-gray-400">Admin functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
}
