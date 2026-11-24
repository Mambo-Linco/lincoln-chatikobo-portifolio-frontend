import { fileViewUrl } from '../api.js';

/**
 * Shows a picture for viewing only: no dragging, no right-click menu.
 * (A determined person can still screenshot anything shown on a screen.)
 */
export default function ProtectedImage({ id, alt = '', className = '', onClick }) {
  return (
    <span className={`protected ${className}`} onContextMenu={(e) => e.preventDefault()} onClick={onClick}>
      <img src={fileViewUrl(id)} alt={alt} draggable="false" loading="lazy" />
    </span>
  );
}
