import { useEffect, useState } from 'react';
import { fetchFileBlob } from '../api.js';

/**
 * Shows a picture for viewing only: no dragging, no right-click menu.
 * (A determined person can still screenshot anything shown on a screen.)
 */
export default function ProtectedImage({ id, alt = '', className = '', onClick }) {
  const [src, setSrc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl;
    setSrc('');
    setError('');
    fetchFileBlob(id, 'view')
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load this image.');
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  return (
    <span className={`protected ${className}`} onContextMenu={(e) => e.preventDefault()} onClick={onClick}>
      {src ? <img src={src} alt={alt} draggable="false" loading="lazy" /> : <span role={error ? 'alert' : 'status'}>{error || 'Loading image…'}</span>}
    </span>
  );
}
