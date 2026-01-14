import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-display font-bold mb-4 gradient-text">404</h1>
        <p className="text-2xl text-gray-400 mb-8">Page not found</p>
        <Link to="/" className="px-8 py-4 animated-gradient rounded-full font-bold text-lg">
          Go Home
        </Link>
      </div>
    </div>
  );
}
