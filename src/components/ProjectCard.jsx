import { Link } from 'react-router-dom';
import ProtectedImage from './ProtectedImage.jsx';

export default function ProjectCard({ project }) {
  const cover = project.files.find((f) => f.kind === 'image');
  return (
    <article className="card">
      <Link to={`/projects/${project.id}`} className="card-link">
        <div className="card-media">
          {cover ? <ProtectedImage id={cover.id} alt="" /> : <div className="card-empty">{project.title.slice(0, 1)}</div>}
        </div>
        <div className="card-body">
          <p className="meta">{[project.category, project.year].filter(Boolean).join(', ')}</p>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          {project.tags.length > 0 && (
            <ul className="tags">{project.tags.slice(0, 4).map((t) => <li key={t}>{t}</li>)}</ul>
          )}
        </div>
      </Link>
    </article>
  );
}
