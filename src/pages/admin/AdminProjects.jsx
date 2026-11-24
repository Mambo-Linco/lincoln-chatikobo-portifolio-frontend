import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';

export default function AdminProjects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/api/projects').then(setProjects).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function remove(p) {
    if (!confirm(`Delete "${p.title}" and all its files? This cannot be undone.`)) return;
    try { await api.del(`/api/projects/${p.id}`); load(); } catch (e) { setError(e.message); }
  }

  return (
    <>
      <div className="section-head">
        <h2>Projects</h2>
        <Link className="btn" to="/admin/projects/new">Add project</Link>
      </div>
      {error && <p className="error">{error}</p>}
      {projects?.length === 0 && <p className="empty">No projects yet. Choose Add project to create the first one.</p>}
      <ul className="doc-list">
        {projects?.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.title}</strong>
              <span className="meta">{[p.category, p.year].filter(Boolean).join(', ')} · {p.files.length} file{p.files.length === 1 ? '' : 's'}{p.featured ? ' · Featured' : ''}</span>
            </div>
            <div className="row-actions">
              <Link className="btn small ghost" to={`/projects/${p.id}`}>View</Link>
              <Link className="btn small" to={`/admin/projects/${p.id}`}>Edit</Link>
              <button className="btn small danger" onClick={() => remove(p)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
