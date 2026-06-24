'use client';
import { useEffect, useState } from 'react';
import { Search, Eye, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getAllDocumentsAdmin, updateFileRecord, deleteFileRecord } from '@/lib/firestore';
import { deleteFile } from '@/lib/storage';

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState('');

  const load = async () => {
    const data = await getAllDocumentsAdmin();
    setDocs(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...docs];
    if (statusFilter !== 'All') list = list.filter(d => d.status === statusFilter);
    if (search) list = list.filter(d =>
      d.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      d.ownerUid?.includes(search)
    );
    setFiltered(list);
  }, [docs, search, statusFilter]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000); };

  const updateStatus = async (doc, status) => {
    await updateFileRecord(doc.id, { status });
    showToast(`Document ${status}`);
    await load();
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.fileName}"?`)) return;
    try {
      if (doc.storagePath) await deleteFile(doc.storagePath);
      await deleteFileRecord(doc.id);
      showToast('Document deleted');
      await load();
    } catch { showToast('Delete failed', 'error'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">All Documents</h1>
          <p className="page-subtitle">{docs.length} document{docs.length !== 1 ? 's' : ''} across all users</p>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={15} />
            <input type="text" className="form-input" placeholder="Search by file name..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Pending Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>File Name</th><th>Category</th><th>Size</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6}><div className="empty-state" style={{ padding: 40 }}><p>No documents found</p></div></td></tr>}
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 500 }}>{doc.fileName}</td>
                  <td className="muted">{doc.category}</td>
                  <td className="muted">{formatSize(doc.fileSize)}</td>
                  <td className="muted">{doc.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  <td>
                    <span className={`badge ${doc.status === 'Approved' ? 'badge-success' : doc.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {doc.downloadURL && (
                        <a href={doc.downloadURL} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" title="View">
                          <Eye size={15} />
                        </a>
                      )}
                      {doc.status !== 'Approved' && (
                        <button className="btn btn-ghost btn-icon" title="Approve"
                          style={{ color: 'var(--success)' }} onClick={() => updateStatus(doc, 'Approved')}>
                          <CheckCircle size={15} />
                        </button>
                      )}
                      {doc.status !== 'Rejected' && (
                        <button className="btn btn-ghost btn-icon" title="Reject"
                          style={{ color: 'var(--danger)' }} onClick={() => updateStatus(doc, 'Rejected')}>
                          <XCircle size={15} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon" title="Delete"
                        style={{ color: 'var(--danger)' }} onClick={() => handleDelete(doc)}>
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

      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}
