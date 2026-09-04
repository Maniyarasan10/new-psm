import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.webp';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="logo" aria-label="Problem Solving Mind — home">
      <img src={logoImg} alt="PSM Logo" className="logo-img" />
      <span className="logo-word">
        <span className="logo-psm">PSM</span>
        {!compact && <span className="logo-name">Problem Solving Mind</span>}
      </span>
    </Link>
  );
}
