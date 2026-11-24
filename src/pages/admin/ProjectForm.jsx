import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatSize } from '../../api.js';
import ProtectedImage from '../../components/ProtectedImage.jsx';

const blank = { title: '', summary: '', description: '', category: '', year: new Date().getFullYear(), tags: '', githubUrl: '', liveUrl: '', featured: false };

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const picker = useRef(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/projects/${id}`)
      .then((p) => { setForm({ ...p, tags: p.tags.join(', ') }); setFiles(p.files); })
      .catch((e) => setError(e.message));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError(''); setNote('');
    try {
      if (id) { await api.put(`/api/projects/${id}`, form); setNote('Changes saved.'); }
      else {
        const created = await api.post('/api/projects', form);
        navigate(`/admin/projects/${created.id}`, { replace: true });
      }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function upload(e) {
    const chosen = [...e.target.files];
    if (!chosen.length) return;
    const data = new FormData();
    chosen.forEach((f) => data.append('files', f));
    setBusy(true); setError(''); setNote('');
    try {
      const added = await api.upload(`/api/projects/${id}/files`, data);
      setFiles((cur) => [...cur, ...added]);
      setNote(`${added.length} file${added.length === 1 ? '' : 's'} uploaded.`);
    } catch (err) { setError(err.message); } finally { setBusy(false); if (picker.current) picker.current.value = ''; }
  }

  async function removeFile(f) {
    if (!confirm(`Delete "${f.name}"?`)) return;
    try { await api.del(`/api/files/${f.id}`); setFiles((cur) => cur.filter((x) => x.id !== f.id)); }
    catch (err) { setError(err.message); }
  }

  async function saveCaption(f, caption) {
    try { await api.patch(`/api/files/${f.id}`, { caption }); setNote('Caption saved.'); }
    catch (err) { setError(err.message); }
  }

  return (
    <>
      <h2>{id ? 'Edit project' : 'Add project'}</h2>
      <form onSubmit={save} className="form wide">
        <label className="field"><span>Title</span><input required value={form.title} onChange={set('title')} /></label>
        <label className="field"><span>Short summary (shown on the project card)</span><input maxLength={300} value={form.summary} onChange={set('summary')} /></label>
        <label className="field"><span>Full description (press Enter for a new paragraph)</span><textarea rows={8} value={form.description} onChange={set('description')} /></label>
        <div className="two">
          <label className="field"><span>Category (for example: Web, Research, Mobile)</span><input value={form.category} onChange={set('category')} /></label>
          <label className="field"><span>Year</span><input type="number" min="1990" max="2100" value={form.year} onChange={set('year')} /></label>
        </div>
        <label className="field"><span>Technologies, separated by commas</span><input value={form.tags} onChange={set('tags')} placeholder="React, Python, MySQL" /></label>
        <div className="two">
          <label className="field"><span>Code link (GitHub)</span><input type="url" value={form.githubUrl} onChange={set('githubUrl')} /></label>
          <label className="field"><span>Live project link</span><input type="url" value={form.liveUrl} onChange={set('liveUrl')} /></label>
        </div>
        <label className="check"><input type="checkbox" checked={!!form.featured} onChange={set('featured')} /> Show on the home page</label>
        {error && <p className="error" role="alert">{error}</p>}
        {note && <p className="ok" role="status">{note}</p>}
        <button className="btn" disabled={busy}>{id ? 'Save changes' : 'Create project'}</button>
      </form>

      {id ? (
        <section>
          <h2>Pictures and documents</h2>
          <p className="meta">Pictures (JPG, PNG, WEBP, GIF) and PDFs can be read on the site. Word, PowerPoint, Excel, text and zip files are kept for users with download access.</p>
          <label className="btn ghost">
            Choose files to upload
            <input ref={picker} type="file" multiple hidden onChange={upload}
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip" />
          </label>
          {files.length === 0 && <p className="empty">No files yet.</p>}
          <ul className="doc-list">
            {files.map((f) => (
              <li key={f.id} className="file-row">
                <div className="file-main">
                  {f.kind === 'image' && <ProtectedImage id={f.id} className="mini" alt="" />}
                  <div>
                    <strong>{f.name}</strong>
                    <span className="meta">{formatSize(f.size)}</span>
                    <input className="caption-input" defaultValue={f.caption} placeholder="Caption (optional)"
                      onBlur={(e) => e.target.value !== f.caption && saveCaption(f, e.target.value)} aria-label={`Caption for ${f.name}`} />
                  </div>
                </div>
                <button className="btn small danger" onClick={() => removeFile(f)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>
      ) : <p className="meta">Create the project first, then you can upload pictures and documents.</p>}
    </>
  );
}
