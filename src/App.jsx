import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminProjects from './pages/admin/AdminProjects.jsx';
import ProjectForm from './pages/admin/ProjectForm.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import { useAuth } from './auth.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {window.scrollTo(0, 0);}, [pathname]);
  return null;
}

function Guard({ allow, children }) {
  const { user, loading, isAdmin, canUpload } = useAuth();
  if (loading) return <p className="page-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (allow === 'admin' && !isAdmin) return <p className="page-note">Only the admin can open this page.</p>;
  if (allow === 'upload' && !canUpload) return <p className="page-note">You do not have permission to manage projects.</p>;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Guard allow="upload"><AdminLayout /></Guard>}>
            <Route index element={<AdminProjects />} />
            <Route path="projects/new" element={<ProjectForm />} />
            <Route path="projects/:id" element={<ProjectForm />} />
            <Route path="profile" element={<Guard allow="admin"><AdminProfile /></Guard>} />
            <Route path="users" element={<Guard allow="admin"><AdminUsers /></Guard>} />
          </Route>
          <Route path="*" element={<p className="page-note">Page not found.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
