import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../auth.jsx';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/api/users').then(setUsers).catch((e) => setError(e.message)); }, []);

  async function change(u, patch) {
    setError('');
    try {
      const updated = await api.patch(`/api/users/${u.id}`, patch);
      setUsers((cur) => cur.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) { setError(e.message); }
  }

  async function resetPassword(u) {
    const password = prompt(`New password for ${u.name} (8 or more characters):`);
    if (!password) return;
    try { await api.post(`/api/users/${u.id}/reset-password`, { password }); alert('Password changed.'); }
    catch (e) { setError(e.message); }
  }

  async function remove(u) {
    if (!confirm(`Delete the account for ${u.name}?`)) return;
    try { await api.del(`/api/users/${u.id}`); setUsers((cur) => cur.filter((x) => x.id !== u.id)); }
    catch (e) { setError(e.message); }
  }

  return (
    <>
      <h2>Users and access</h2>
      <p className="meta">Viewer: can read only. Editor: can add and change projects and files. Admin: full control, including this page. Download access is separate, so you can allow a viewer to download without letting them upload.</p>
      {error && <p className="error" role="alert">{error}</p>}
      {users?.length === 1 && <p className="empty">Nobody else has registered yet. Visitors can create accounts from the Log in page.</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Can upload</th><th>Can download</th><th></th></tr></thead>
          <tbody>
            {users?.map((u) => {
              const self = u.id === me.id;
              const full = u.role === 'admin';
              return (
                <tr key={u.id}>
                  <td data-label="Name">{u.name}{self && ' (you)'}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role">
                    <select value={u.role} disabled={self} onChange={(e) => change(u, { role: e.target.value })} aria-label={`Role for ${u.name}`}>
                      <option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td data-label="Can upload"><input type="checkbox" checked={u.canUpload} disabled={full} onChange={(e) => change(u, { canUpload: e.target.checked })} aria-label={`Upload access for ${u.name}`} /></td>
                  <td data-label="Can download"><input type="checkbox" checked={u.canDownload} disabled={full} onChange={(e) => change(u, { canDownload: e.target.checked })} aria-label={`Download access for ${u.name}`} /></td>
                  <td className="row-actions">
                    <button className="btn small ghost" onClick={() => resetPassword(u)}>Reset password</button>
                    {!self && <button className="btn small danger" onClick={() => remove(u)}>Delete</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
