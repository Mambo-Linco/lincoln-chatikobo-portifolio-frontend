import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { fetchFileBlob } from '../api.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// Draws each PDF page onto a canvas, so there is no browser PDF toolbar with a download button.
export default function PdfViewer({ fileId }) {
  const box = useRef(null);
  const [status, setStatus] = useState('Loading document…');

  useEffect(() => {
    let cancelled = false;
    let doc;
    (async () => {
      try {
        const blob = await fetchFileBlob(fileId, 'view');
        doc = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
        const host = box.current;
        if (!host || cancelled) return;
        host.innerHTML = '';
        const width = Math.min(host.clientWidth || 800, 1000);
        const ratio = window.devicePixelRatio || 1;
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${width}px`;
          canvas.className = 'pdf-page';
          host.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
        setStatus('');
      } catch (e) {
        if (!cancelled) setStatus(e.message || 'Could not open this document.');
      }
    })();
    return () => { cancelled = true; doc?.destroy?.(); };
  }, [fileId]);

  return (
    <div className="pdf protected" onContextMenu={(e) => e.preventDefault()}>
      {status && <p className="page-note">{status}</p>}
      <div ref={box} />
    </div>
  );
}
