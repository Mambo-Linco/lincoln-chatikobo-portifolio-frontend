import { useEffect } from 'react';
import ProtectedImage from './ProtectedImage.jsx';
import PdfViewer from './PdfViewer.jsx';
import { useAuth } from '../auth.jsx';
import { downloadFile } from '../api.js';

// Full-screen reader for one picture or PDF. Closes with Esc or the Close button.
export default function FileViewer({ file, onClose }) {
  const { canDownload } = useAuth();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={file.name}>
      <div className="viewer-bar">
        <strong>{file.name}</strong>
        <span className="viewer-actions">
          {canDownload && <button className="btn small" onClick={() => downloadFile(file).catch((e) => alert(e.message))}>Download</button>}
          <button className="btn small ghost" onClick={onClose} autoFocus>Close</button>
        </span>
      </div>
      <div className="viewer-body">
        {file.kind === 'image'
          ? <ProtectedImage id={file.id} alt={file.caption || file.name} className="viewer-img" />
          : <PdfViewer fileId={file.id} />}
        {file.caption && <p className="caption">{file.caption}</p>}
      </div>
    </div>
  );
}
