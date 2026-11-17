import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="py-12 text-center">
      <h1 className="mb-2 text-4xl font-bold text-content">404</h1>
      <p className="mb-4 text-content-muted">This screen does not exist.</p>
      <Link
        to="/"
        className="rounded font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Back to the overview
      </Link>
    </div>
  );
};
