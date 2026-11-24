import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.canUpload ? '/admin' : '/');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="wrap narrow section">
      <h1 className="page-title">Log in</h1>
      <form onSubmit={submit} className="form">
        <label className="field"><span>Email</span>
          <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="field"><span>Password</span>
          <input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="meta">No account? <Link to="/register">Create one</Link>. New accounts can read only, until the admin gives more access.</p>
      </form>
    </div>
  );
}
