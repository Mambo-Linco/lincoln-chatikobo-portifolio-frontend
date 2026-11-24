import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="wrap narrow section">
      <h1 className="page-title">Create an account</h1>
      <form onSubmit={submit} className="form">
        <label className="field"><span>Name</span><input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label className="field"><span>Password (8 or more characters)</span><input type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="meta">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
