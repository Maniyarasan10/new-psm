import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <div className="display">404</div>
        <div className="line" />
        <h1 className="h2" style={{ marginTop: '1.5rem' }}>
          Looks Like This Problem Doesn't Have a Page Yet.
        </h1>
        <p className="body">
          The page you're looking for may have moved, changed or never existed. But that's okay. We're problem solvers.
        </p>
        <div className="not-found-cta">
          <Link className="btn btn-primary" to="/">
            Go Home
          </Link>
          <Link className="btn btn-ghost" to="/products">
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  );
}
