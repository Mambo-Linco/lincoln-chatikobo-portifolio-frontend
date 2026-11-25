import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { fetchFileBlob } from '../api.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// Draw every page inside the site, without a browser PDF download toolbar.
export default function PdfViewer({ fileId }) {
  const box = useRef(null);
  const [status, setStatus] = useState('Loading document…');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let loadingTask;
    const controller = new AbortController();
    setStatus('Loading document…'); setFailed(false);
    if (box.current) box.current.innerHTML = '';

    (async () => {
      try {
        const blob = await fetchFileBlob(fileId, 'view');
        const data = await blob.arrayBuffer();
        if (cancelled) return;
        loadingTask = pdfjs.getDocument({ data });
        const doc = await loadingTask.promise;
        const host = box.current;
        if (!host || cancelled) return;
        const width = Math.min(host.clientWidth || 800, 1000);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          setStatus(`Loading page ${n} of ${doc.numPages}…`);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.style.width = `${width}px`;
          canvas.className = 'pdf-page';
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', `Document page ${n} of ${doc.numPages}`);
          host.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
        if (!cancelled) setStatus('');
      } catch (e) {
        if (!cancelled) {
          setFailed(true);
          setStatus(e.message || 'Could not open this document.');
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      if (loadingTask) void loadingTask.destroy().catch(() => {});
    };
  }, [fileId, attempt]);

  return (
    <div className="pdf" onContextMenu={(e) => e.preventDefault()}>
      {status && <p className="page-note" role={failed ? 'alert' : 'status'}>{status}</p>}
      {failed && <button type="button" className="btn small" onClick={() => setAttempt((n) => n + 1)}>Retry preview</button>}
      <div className="protected" ref={box} />
    </div>
  );
}
