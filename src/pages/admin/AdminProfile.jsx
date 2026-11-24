import { useEffect, useRef, useState } from 'react';
import { api, photoUrl } from '../../api.js';

export default function AdminProfile() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const picker = useRef(null);

  useEffect(() => { api.get('/api/profile').then(setForm).catch((e) => setError(e.message)); }, []);
  if (!form) return <p className="page-note">{error || 'Loading…'}</p>;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault(); setError(''); setNote('');
    try { setForm(await api.put('/api/profile', form)); setNote('Profile saved.'); } catch (err) { setError(err.message); }
  }

  async function uploadPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData(); data.append('photo', file);
    setError(''); setNote('');
    try { setForm(await api.upload('/api/profile/photo', data)); setNote('Photo updated. Everyone can now see it on the home page.'); }
    catch (err) { setError(err.message); } finally { if (picker.current) picker.current.value = ''; }
  }

  return (
    <>
      <h2>My profile and photo</h2>
      <div className="profile-edit">
        <div>
          <div className="portrait small">
            {form.hasPhoto ? <img src={photoUrl(form.photoVersion)} alt="Your current photo" /> : <div className="portrait-empty">No photo yet</div>}
          </div>
          <label className="btn ghost">
            {form.hasPhoto ? 'Replace photo' : 'Upload photo'}
            <input ref={picker} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={uploadPhoto} />
          </label>
        </div>
        <form onSubmit={save} className="form wide">
          <label className="field"><span>Full name</span><input required value={form.name} onChange={set('name')} /></label>
          <label className="field"><span>Headline (for example: BSc Computer Science graduate, 2026)</span><input value={form.headline} onChange={set('headline')} /></label>
          <label className="field"><span>About me</span><textarea rows={6} value={form.bio} onChange={set('bio')} /></label>
          <label className="field"><span>Contact email</span><input type="email" value={form.email} onChange={set('email')} /></label>
          <label className="field"><span>GitHub link</span><input type="url" value={form.github} onChange={set('github')} /></label>
          <label className="field"><span>LinkedIn link</span><input type="url" value={form.linkedin} onChange={set('linkedin')} /></label>
          {error && <p className="error" role="alert">{error}</p>}
          {note && <p className="ok" role="status">{note}</p>}
          <button className="btn">Save profile</button>
        </form>
      </div>
    </>
  );
}
