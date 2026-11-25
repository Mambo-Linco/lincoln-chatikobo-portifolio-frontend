import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, downloadFile, formatSize } from '../api.js';
import { useAuth } from '../auth.jsx';
import ProtectedImage from '../components/ProtectedImage.jsx';
import FileViewer from '../components/FileViewer.jsx';
import { isCertificate } from '../utils/files.js';

export default function ProjectDetail() {
  const { id } = useParams();
  const { canDownload } = useAuth();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProject(null); setError(''); setOpen(null);
    api.get(`/api/projects/${id}`)
      .then((data) => { if (!cancelled) setProject(data); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <p className="page-note error" role="alert">{error}</p>;
  if (!project) return <p className="page-note">Loading…</p>;

  const files = project.files || [];
  const certificates = files.filter(isCertificate);
  const attachments = files.filter((f) => !isCertificate(f));
  const images = attachments.filter((f) => f.kind === 'image');
  const docs = attachments.filter((f) => f.kind !== 'image');

  return (
    <article className="wrap section detail">
      <Link to="/projects" className="back">Back to projects</Link>
      <p className="meta">{[project.category, project.year].filter(Boolean).join(', ')}</p>
      <h1 className="page-title">{project.title}</h1>
      <p className="lead">{project.summary}</p>
      <div className="hero-actions">
        {project.githubUrl && <a className="btn ghost" href={project.githubUrl} target="_blank" rel="noreferrer">View code</a>}
        {project.liveUrl && <a className="btn" href={project.liveUrl} target="_blank" rel="noreferrer">Open live project</a>}
      </div>
      {project.tags.length > 0 && <ul className="tags">{project.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
      {project.description && <div className="prose">{project.description.split('\n').filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}</div>}

      {certificates.length > 0 && (
        <section aria-labelledby="certificates-heading">
          <h2 id="certificates-heading">Certificates</h2>
          <p className="meta">You are signed in, so you can preview these PDF and image certificates here.</p>
          <div className="certificate-list">
            {certificates.map((f) => (
              <article key={f.id} className="certificate-card">
                <button type="button" className="certificate-preview" onClick={() => setOpen(f)} aria-label={`View certificate: ${f.name}`}>
                  {f.kind === 'image'
                    ? <ProtectedImage id={f.id} alt={f.caption || f.name} />
                    : <span className="certificate-pdf"><strong>PDF</strong><span>Certificate document</span><span>Open to read all pages</span></span>}
                </button>
                <div className="certificate-info">
                  <h3>{f.name}</h3>
                  {f.caption && <p>{f.caption}</p>}
                  <span className="meta">{f.kind === 'pdf' ? 'PDF certificate' : 'Image certificate'} · {formatSize(f.size)}</span>
                  <div className="row-actions">
                    <button type="button" className="btn small" onClick={() => setOpen(f)}>View certificate</button>
                    {canDownload && <button type="button" className="btn small ghost" onClick={() => downloadFile(f).catch((e) => alert(e.message))}>Download</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section>
          <h2>Pictures</h2>
          <div className="gallery">
            {images.map((f) => (
              <button key={f.id} className="thumb" onClick={() => setOpen(f)} aria-label={`Open ${f.name}`}>
                <ProtectedImage id={f.id} alt={f.caption || f.name} />
              </button>
            ))}
          </div>
        </section>
      )}

      {docs.length > 0 && (
        <section>
          <h2>Documents</h2>
          <ul className="doc-list">
            {docs.map((f) => (
              <li key={f.id}>
                <div>
                  <strong>{f.name}</strong>
                  {f.caption && <span className="meta">{f.caption}</span>}
                  <span className="meta">{formatSize(f.size)}</span>
                </div>
                <div className="row-actions">
                  {f.kind === 'pdf' && <button className="btn small" onClick={() => setOpen(f)}>Read PDF</button>}
                  {canDownload
                    ? <button className="btn small ghost" onClick={() => downloadFile(f).catch((e) => alert(e.message))}>Download</button>
                    : f.kind !== 'pdf' && <span className="meta">Preview not available</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {open && <FileViewer file={open} onClose={() => setOpen(null)} />}
    </article>
  );
}
