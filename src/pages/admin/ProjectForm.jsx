import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatSize } from '../../api.js';
import ProtectedImage from '../../components/ProtectedImage.jsx';
import FileViewer from '../../components/FileViewer.jsx';
import { canPreview, isCertificate } from '../../utils/files.js';

const blank = { title: '', summary: '', description: '', category: '', year: new Date().getFullYear(), tags: '', githubUrl: '', liveUrl: '', featured: false };

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const fileUpdates = useRef(new Map());
  const pendingUpdates = useRef(0);

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

  async function upload(e, purpose) {
    const input = e.currentTarget;
    const chosen = [...input.files];
    if (!chosen.length) return;
    const data = new FormData();
    data.append('purpose', purpose);
    chosen.forEach((f) => data.append('files', f));
    setBusy(true); setError(''); setNote('');
    try {
      const added = await api.upload(`/api/projects/${id}/files`, data);
      setFiles((cur) => [...cur, ...added]);
      setNote(`${added.length} ${purpose === 'certificate' ? 'certificate' : 'file'}${added.length === 1 ? '' : 's'} uploaded.`);
    } catch (err) { setError(err.message); } finally { setBusy(false); input.value = ''; }
  }

  async function removeFile(f) {
    if (!confirm(`Delete "${f.name}"?`)) return;
    try { await api.del(`/api/files/${f.id}`); setFiles((cur) => cur.filter((x) => x.id !== f.id)); }
    catch (err) { setError(err.message); }
  }

  async function updateFile(f, changes) {
    // A caption blur and section change may happen together. Preserve their
    // order for this file, including the state returned by each PATCH.
    pendingUpdates.current += 1;
    setBusy(true); setError(''); setNote('');
    const previous = fileUpdates.current.get(f.id) || Promise.resolve();
    const task = previous.catch(() => {}).then(() => api.patch(`/api/files/${f.id}`, changes));
    fileUpdates.current.set(f.id, task);
    try {
      const updated = await task;
      setFiles((cur) => cur.map((x) => x.id === f.id ? { ...x, ...updated } : x));
      setNote(changes.purpose === 'certificate' ? 'Certificate now appears in the Certificates section for signed-in users.' : 'File details saved.');
    }
    catch (err) { setError(err.message); }
    finally {
      if (fileUpdates.current.get(f.id) === task) fileUpdates.current.delete(f.id);
      pendingUpdates.current -= 1;
      if (pendingUpdates.current === 0) setBusy(false);
    }
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
          <h2>Certificates, pictures and documents</h2>
          <p className="meta">Upload certificates as PDF, JPG, PNG, WEBP or GIF files. Signed-in users can read them; downloads still require permission. Other document types are kept for users with download access.</p>
          <div className="row-actions">
            <label className={`btn${busy ? ' upload-disabled' : ''}`}>
              Upload certificates
              <input type="file" multiple hidden disabled={busy} onChange={(e) => upload(e, 'certificate')}
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf" />
            </label>
            <label className={`btn ghost${busy ? ' upload-disabled' : ''}`}>
              Upload other files
              <input type="file" multiple hidden disabled={busy} onChange={(e) => upload(e, 'attachment')}
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip" />
            </label>
          </div>
          <p className="meta">Already uploaded a certificate? Change its display section below. No re-upload is needed.</p>
          {files.length === 0 && <p className="empty">No files yet.</p>}
          <ul className="doc-list">
            {files.map((f) => (
              <li key={f.id} className="file-row">
                <div className="file-main">
                  {f.kind === 'image' && <ProtectedImage id={f.id} className="mini" alt={f.name} />}
                  <div className="file-details">
                    <strong>{f.name}</strong>
                    <span className="meta">{isCertificate(f) ? 'Certificate · ' : ''}{formatSize(f.size)}</span>
                    {canPreview(f) && (
                      <label className="field file-purpose"><span>Display section</span>
                        <select value={isCertificate(f) ? 'certificate' : 'attachment'} disabled={busy}
                          onChange={(e) => updateFile(f, { purpose: e.target.value })}>
                          <option value="attachment">Pictures / documents</option>
                          <option value="certificate">Certificates</option>
                        </select>
                      </label>
                    )}
                    <input className="caption-input" disabled={busy} defaultValue={f.caption} placeholder="Caption (optional)"
                      onBlur={(e) => e.target.value !== f.caption && updateFile(f, { caption: e.target.value })} aria-label={`Caption for ${f.name}`} />
                  </div>
                </div>
                <div className="row-actions">
                  {canPreview(f) && <button type="button" className="btn small ghost" onClick={() => setOpen(f)}>Preview</button>}
                  <button type="button" className="btn small danger" disabled={busy} onClick={() => removeFile(f)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : <p className="meta">Create the project first, then you can upload certificates, pictures and documents.</p>}
      {open && <FileViewer file={open} onClose={() => setOpen(null)} />}
    </>
  );
}
