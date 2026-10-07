import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-2 text-h1 font-bold text-primary">Page not found</h1>
      <p className="mt-3 text-text-secondary">That placement workspace does not exist. Return to your dashboard to continue.</p>
      <Link to="/" className="mt-6 rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
        Return to dashboard
      </Link>
    </div>
  );
}