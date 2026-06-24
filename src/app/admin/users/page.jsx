'use client';
import { useEffect, useState } from 'react';
import { Search, Pencil, Power } from 'lucide-react';
import { getAllUsers, updateDocument } from '@/lib/firestore';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [toast, setToast] = useState('');

  const load = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...users];
    if (roleFilter !== 'All') list = list.filter(u => u.role === roleFilter);
    if (search) list = list.filter(u =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [users, search, roleFilter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    await updateDocument('users', u.uid, { status: next });
    showToast(`User ${next}`);
    await load();
  };

  const makeAdmin = async (u) => {
    if (!confirm(`Make ${u.fullName} an admin?`)) return;
    await updateDocument('users', u.uid, { role: 'admin' });
    showToast('Role updated to Admin');
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={15} />
            <input type="text" className="form-input" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} id="user-search" />
          </div>
          <select className="form-select" style={{ width: 140 }} value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}>
            <option>All</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8}><div className="empty-state" style={{ padding: 40 }}><p>No users found</p></div></td></tr>}
              {filtered.map(u => (
                <tr key={u.uid}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td className="muted">{u.email}</td>
                  <td className="muted">{u.company || '—'}</td>
                  <td className="muted">{u.phone || '—'}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-gray'}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span></td>
                  <td className="muted">{u.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      {u.role !== 'admin' && (
                        <button className="btn btn-ghost btn-icon" title="Make Admin" onClick={() => makeAdmin(u)}>
                          <Pencil size={15} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon" title="Toggle Status" onClick={() => toggleStatus(u)}>
                        <Power size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast-container"><div className="toast success">{toast}</div></div>}
    </div>
  );
}
