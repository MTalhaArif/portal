'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, Power } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getClients, addClient, updateClient, deleteClient } from '@/lib/firestore';

const EMPTY_FORM = { fullName: '', email: '', phone: '', company: '', country: '', status: 'Active' };

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    if (!user) return;
    const data = await getClients(user.uid);
    setClients(data);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    let list = [...clients];
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter);
    if (search) list = list.filter(c =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    );
    setFiltered(list);
  }, [clients, search, statusFilter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (c) => { setSelected(c); setForm({ ...c }); setModal('edit'); };
  const openView = (c) => { setSelected(c); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') {
        await addClient({ ...form, ownerUid: user.uid });
        showToast('Client added successfully');
      } else {
        await updateClient(selected.id, form);
        showToast('Client updated');
      }
      await load();
      closeModal();
    } finally { setLoading(false); }
  };

  const toggleStatus = async (c) => {
    const next = c.status === 'Active' ? 'Inactive' : 'Active';
    await updateClient(c.id, { status: next });
    showToast(`Client ${next.toLowerCase()}`);
    await load();
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete ${c.fullName}?`)) return;
    await deleteClient(c.id);
    showToast('Client deleted');
    await load();
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="add-client-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={15} />
            <input
              id="client-search"
              type="text"
              className="form-input"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 140 }} value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)} id="status-filter">
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Country</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state" style={{ padding: 40 }}>
                    <p>No clients found</p>
                  </div>
                </td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                  <td className="muted">{c.email}</td>
                  <td className="muted">{c.phone}</td>
                  <td className="muted">{c.company || '—'}</td>
                  <td className="muted">{c.country || '—'}</td>
                  <td>
                    <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon" title="View" onClick={() => openView(c)}>
                        <Eye size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => openEdit(c)}>
                        <Pencil size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Toggle Status" onClick={() => toggleStatus(c)}>
                        <Power size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Delete"
                        style={{ color: 'var(--danger)' }} onClick={() => handleDelete(c)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">{modal === 'add' ? 'Add Client' : 'Edit Client'}</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" value={form.fullName} onChange={set('fullName')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input type="text" className="form-input" value={form.company} onChange={set('company')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-input" value={form.country} onChange={set('country')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={set('status')}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : (modal === 'add' ? 'Add Client' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Client Details</span>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {[['Full Name', selected.fullName], ['Email', selected.email],
                ['Phone', selected.phone], ['Company', selected.company],
                ['Country', selected.country], ['Status', selected.status]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{k}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
              <button className="btn btn-primary" onClick={() => openEdit(selected)}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast success">{toast}</div>
        </div>
      )}
    </div>
  );
}
