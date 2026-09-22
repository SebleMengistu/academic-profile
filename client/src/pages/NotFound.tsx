import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEOHead from '../components/common/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" />
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl font-bold text-primary-200 mb-4" aria-hidden="true">404</div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Page not found</h1>
        <p className="text-secondary-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary btn-lg">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </>
  );
}
