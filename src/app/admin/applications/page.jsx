'use client';
import { useEffect, useState } from 'react';
import { Search, Edit, Eye, FileText } from 'lucide-react';
import { getAllApplications, updateApplication } from '@/lib/firestore';

const STAGES = ['Waiting Approval','Ready for Application','Evaluation','Offer Letter','Payment','Acceptance Letter','Pre-Registered','Registration','Visa Accepted','Visa Rejected'];
const DEGREE_TYPES = ['Bachelor', 'Master', 'PhD', 'Associate', 'Certificate'];
const TERMS = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027'];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [toast, setToast] = useState('');
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await getAllApplications();
    setApps(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = [...apps];
    if (stageFilter !== 'All') list = list.filter(a => a.stage === stageFilter);
    if (search) list = list.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.university?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [apps, search, stageFilter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEdit = (app) => {
    setSelectedApp(app);
    setForm({ ...app });
  };

  const setF = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplication(selectedApp.id, form);
      showToast('Application updated successfully');
      setSelectedApp(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const badgeClass = (stage) => {
    if (stage === 'Visa Accepted') return 'badge-success';
    if (stage === 'Visa Rejected') return 'badge-danger';
    if (['Offer Letter','Acceptance Letter'].includes(stage)) return 'badge-info';
    return 'badge-warning';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">All Applications</h1>
          <p className="page-subtitle">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={15} />
            <input type="text" className="form-input" placeholder="Search by name, email, university..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 200 }} value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}>
            <option>All</option>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Applicant</th><th>University</th><th>Program</th><th>Degree</th><th>Stage</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8}><div className="empty-state" style={{ padding: 40 }}><p>No applications found</p></div></td></tr>}
              {filtered.map((app, i) => (
                <tr key={app.id}>
                  <td className="muted">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</td>
                  <td className="muted">{app.university || '—'}</td>
                  <td className="muted">{app.program || '—'}</td>
                  <td className="muted">{app.degreeType}</td>
                  <td><span className={`badge ${badgeClass(app.stage)}`}>{app.stage}</span></td>
                  <td className="muted">{app.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(app)}>
                      <Edit size={14} /> Review / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedApp && form && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedApp(null)}>
          <div className="modal-box" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <span className="modal-title">Review Application: {form.firstName} {form.lastName}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedApp(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, padding:'24px' }}>
              
              {/* Left Column: Personal & Academic Info */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.03em' }}>Applicant Details</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-input" value={form.firstName} onChange={setF('firstName')} /></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-input" value={form.lastName} onChange={setF('lastName')} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={setF('email')} /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input type="text" className="form-input" value={form.phone} onChange={setF('phone')} /></div>
                  <div className="form-group"><label className="form-label">Passport No.</label><input type="text" className="form-input" value={form.passportNumber} onChange={setF('passportNumber')} /></div>
                  <div className="form-group"><label className="form-label">Nationality</label><input type="text" className="form-input" value={form.nationality} onChange={setF('nationality')} /></div>
                </div>

                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.03em', marginTop:8 }}>Academic Choices</h3>
                <div className="form-group"><label className="form-label">University</label><input type="text" className="form-input" value={form.university} onChange={setF('university')} /></div>
                <div className="form-group"><label className="form-label">Program</label><input type="text" className="form-input" value={form.program} onChange={setF('program')} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <select className="form-select" value={form.degreeType} onChange={setF('degreeType')}>{DEGREE_TYPES.map(d=><option key={d}>{d}</option>)}</select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Term</label>
                    <select className="form-select" value={form.term} onChange={setF('term')}>{TERMS.map(t=><option key={t}>{t}</option>)}</select>
                  </div>
                  <div className="form-group"><label className="form-label">GPA</label><input type="text" className="form-input" value={form.gpa} onChange={setF('gpa')} /></div>
                </div>
              </div>

              {/* Right Column: Processing & Documents */}
              <div style={{ display:'flex', flexDirection:'column', gap:16, borderLeft:'1px solid var(--border)', paddingLeft:24 }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.03em' }}>Application Status</h3>
                <div className="form-group">
                  <label className="form-label">Current Stage</label>
                  <select className="form-select" value={form.stage} onChange={setF('stage')} style={{ border:'2px solid var(--primary)', fontWeight:600 }}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.03em', marginTop:8 }}>Attached Documents</h3>
                {form.documents && form.documents.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {form.documents.map((doc, idx) => (
                      <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'#f8f9fa', borderRadius:8, border:'1px solid var(--border-light)' }}>
                        <div className="flex items-center gap-2" style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          <FileText size={14} style={{ color:'var(--primary)' }} flexShrink={0}/>
                          {doc.fileName}
                        </div>
                        <a href={doc.downloadURL} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ padding:'4px 8px' }}>
                          <Eye size={13} /> View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding:'24px', textAlign:'center', background:'#f8f9fa', borderRadius:8, color:'var(--text-secondary)' }}>
                    <p style={{ fontSize:'0.85rem' }}>No documents attached.</p>
                  </div>
                )}
                
                <div className="form-group" style={{ marginTop:8 }}>
                  <label className="form-label">Student Notes</label>
                  <textarea className="form-input" rows={4} readOnly value={form.docNotes || 'No notes provided.'} style={{ background:'#f8f9fa' }} />
                </div>
              </div>

            </div>
            
            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelectedApp(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className="toast success">{toast}</div></div>}
    </div>
  );
}
