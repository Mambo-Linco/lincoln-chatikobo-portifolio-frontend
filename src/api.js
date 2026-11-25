// All talking to the backend happens here.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getToken = () => {
  try { return localStorage.getItem('token'); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); } catch { /* ignore */ }
};

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  let res;
  try {
    res = await fetch(API + path, { method, headers, body: payload });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  upload: (p, form) => request(p, { method: 'POST', form }),
};

export const photoUrl = (version) => `${API}/api/profile/photo?v=${version}`;

/** Fetch a protected file with the login token (used for PDFs and downloads). */
export async function fetchFileBlob(id, mode = 'view') {
  const token = getToken();
  const res = await fetch(`${API}/api/files/${id}/${mode}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not load the file.');
  }
  return res.blob();
}

export async function downloadFile(file) {
  const blob = await fetchFileBlob(file.id, 'download');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const formatSize = (n) =>
  n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
