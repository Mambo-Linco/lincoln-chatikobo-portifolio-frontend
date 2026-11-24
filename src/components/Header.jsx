import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Header() {
  const { user, logout, canUpload } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="brand">Portfolio</Link>
        <nav aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          {canUpload && <NavLink to="/admin">Manage</NavLink>}
          {user ? (
            <button className="link-btn" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
