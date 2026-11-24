import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import ProjectCard from '../components/ProjectCard.jsx';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => { api.get('/api/projects').then(setProjects).catch((e) => setError(e.message)); }, []);

  const categories = useMemo(
    () => ['All', ...new Set((projects || []).map((p) => p.category).filter(Boolean))], [projects]);

  const list = (projects || []).filter((p) => {
    const text = `${p.title} ${p.summary} ${p.tags.join(' ')}`.toLowerCase();
    return (category === 'All' || p.category === category) && text.includes(query.toLowerCase());
  });

  return (
    <div className="wrap section">
      <h1 className="page-title">Projects</h1>
      <div className="filters">
        <label className="field grow">
          <span>Search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title or technology" />
        </label>
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      {!projects && !error && <p className="page-note">Loading…</p>}
      {projects && list.length === 0 && <p className="empty">No projects match your search.</p>}
      <div className="grid">{list.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
    </div>
  );
}
