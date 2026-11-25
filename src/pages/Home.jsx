import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, photoUrl } from '../api.js';
import ProjectCard from '../components/ProjectCard.jsx';
import { useAuth } from '../auth.jsx';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return undefined;
    const requests = [api.get('/api/profile')];
    if (user) requests.push(api.get('/api/projects'));
    Promise.all(requests)
      .then(([p, list = []]) => { setProfile(p); setProjects(list); })
      .catch((e) => setError(e.message));
    return undefined;
  }, [authLoading, user]);

  if (error) return <p className="page-note error">{error}</p>;
  if (!profile) return <p className="page-note">Loading…</p>;

  const featured = projects.filter((p) => p.featured);
  const shown = (featured.length ? featured : projects).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-text">
            <p className="hero-kicker">{profile.headline}</p>
            <h1>{profile.name}</h1>
            <p className="lead">{profile.bio}</p>
            <div className="hero-actions">
              <Link className="btn" to="/projects">See my projects</Link>
              {profile.email && <a className="btn ghost" href={`mailto:${profile.email}`}>Email me</a>}
            </div>
            <ul className="social">
              {profile.github && <li><a href={profile.github} target="_blank" rel="noreferrer">GitHub</a></li>}
              {profile.linkedin && <li><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
            </ul>
          </div>
          <div className="portrait" aria-hidden={!profile.hasPhoto}>
            {profile.hasPhoto
              ? <img src={photoUrl(profile.photoVersion)} alt={`Portrait of ${profile.name}`} />
              : <div className="portrait-empty">Your photo appears here</div>}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>{featured.length ? 'Featured projects' : 'Recent projects'}</h2>
          <Link to="/projects">All projects</Link>
        </div>
        {shown.length === 0
          ? <div className="empty"><p>Sign in to view my projects and read the certificates attached to them.</p><Link className="btn small" to="/login">Sign in to view projects</Link></div>
          : <div className="grid">{shown.map((p) => <ProjectCard key={p.id} project={p} />)}</div>}
      </section>
    </>
  );
}
