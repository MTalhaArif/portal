'use client';
import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Trash2, Download, Eye, X, CloudUpload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserDocuments, addFileRecord, updateFileRecord, deleteFileRecord } from '@/lib/firestore';
import { uploadFile, deleteFile } from '@/lib/storage';

const CATEGORIES = [
  'Passport', 'National ID', 'Academic Transcript', 'Diploma/Certificate',
  'Recommendation Letter', 'CV / Resume', 'Bank Statement', 'Motivation Letter',
  'Photo', 'Other',
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState('All');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState('Passport');
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const load = async () => {
    if (!user) return;
    const data = await getUserDocuments(user.uid);
    setDocs(data);
  };

  useEffect(() => { load(); }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const handleFiles = async (files) => {
    if (!files.length) return;
    const file = files[0];
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) { showToast('File too large (max 20MB)', 'error'); return; }

    setUploading(true);
    setProgress(0);
    try {
      const path = `documents/${user.uid}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path, setProgress);
      await addFileRecord({
        ownerUid: user.uid,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category,
        storagePath: path,
        downloadURL: url,
        status: 'Pending Review',
      });
      showToast('Document uploaded successfully');
      await load();
    } catch (err) {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.fileName}"?`)) return;
    try {
      await deleteFile(doc.storagePath);
      await deleteFileRecord(doc.id);
      showToast('Document deleted');
      await load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const filtered = filter === 'All' ? docs : docs.filter(d => d.category === filter);

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">{docs.length} file{docs.length !== 1 ? 's' : ''} uploaded</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          background: dragging ? 'var(--primary-light)' : '#fafafa',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 20,
          transition: 'all 0.2s',
        }}
      >
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
        />
        <CloudUpload size={40} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600, marginBottom: 6 }}>Drop your file here, or <span style={{ color: 'var(--primary)' }}>browse</span></p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Supports: PDF, DOC, DOCX, JPG, PNG, XLSX · Max 20MB</p>

        {/* Category select */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
          <select className="form-select" style={{ maxWidth: 220 }} value={category}
            onChange={e => setCategory(e.target.value)} id="upload-category">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Progress */}
        {uploading && (
          <div style={{ marginTop: 16, maxWidth: 300, margin: '16px auto 0' }}>
            <div style={{ background: '#e5e7eb', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.3s', borderRadius: 99 }} />
            </div>
            <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uploading… {progress}%</p>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} className={`tab-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Documents table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state" style={{ padding: 40 }}>
                    <FileText size={40} />
                    <p>No documents found. Upload your first document above.</p>
                  </div>
                </td></tr>
              )}
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <FileText size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="muted">{doc.category}</td>
                  <td className="muted">{formatSize(doc.fileSize)}</td>
                  <td className="muted">{doc.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  <td>
                    <span className={`badge ${
                      doc.status === 'Approved' ? 'badge-success'
                      : doc.status === 'Rejected' ? 'badge-danger'
                      : 'badge-warning'
                    }`}>{doc.status}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {doc.downloadURL && (
                        <a href={doc.downloadURL} target="_blank" rel="noreferrer"
                          className="btn btn-ghost btn-icon" title="View">
                          <Eye size={15} />
                        </a>
                      )}
                      {doc.downloadURL && (
                        <a href={doc.downloadURL} download={doc.fileName}
                          className="btn btn-ghost btn-icon" title="Download">
                          <Download size={15} />
                        </a>
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

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
