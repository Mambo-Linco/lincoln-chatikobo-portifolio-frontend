import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth.jsx';

export default function AdminLayout() {
  const { isAdmin, user } = useAuth();
  return (
    <div className="wrap section">
      <h1 className="page-title">Manage portfolio</h1>
      <p className="meta">Signed in as {user.name} ({user.role})</p>
      <nav className="subnav" aria-label="Manage">
        <NavLink to="/admin" end>Projects</NavLink>
        {isAdmin && <NavLink to="/admin/profile">My profile and photo</NavLink>}
        {isAdmin && <NavLink to="/admin/users">Users and access</NavLink>}
      </nav>
      <Outlet />
    </div>
  );
}
