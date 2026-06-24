'use client';
import { useEffect, useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, ClipboardList, CloudUpload, FileText, Trash2, Eye, Search, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserApplications, addApplication, UNIVERSITIES } from '@/lib/firestore';
import { uploadFile, deleteFile } from '@/lib/storage';

const STAGES = [
  'Waiting Approval','Ready for Application','Evaluation','Offer Letter',
  'Payment','Acceptance Letter','Pre-Registered','Registration',
  'Visa Accepted','Visa Rejected',
];

const DEGREE_TYPES = ['Bachelor', 'Master', 'PhD', 'Associate', 'Certificate'];
const TERMS = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027'];

const WIZARD_STEPS = ['Term & Type', 'Personal Info', 'Program Details', 'Documents', 'Review'];

const EMPTY = {
  term: TERMS[0], degreeType: 'Bachelor',
  firstName: '', lastName: '', dateOfBirth: '', nationality: '', passportNumber: '',
  email: '', phone: '', gpa: '',
  universityId: '', university: '', program: '',
  docNotes: '', documents: []
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState('');
  const [uniSearch, setUniSearch] = useState('');
  const [uniCity, setUniCity] = useState('');

  const locations = [...new Set(UNIVERSITIES.map(u => u.location))].filter(Boolean).sort();

  const load = async () => {
    if (!user) return;
    const data = await getUserApplications(user.uid);
    setApps(data);
  };

  useEffect(() => { load(); }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addApplication({
        ...form,
        ownerUid: user.uid,
        status: 'Pending',
        stage: 'Waiting Approval',
      });
      showToast('Application submitted successfully!');
      setShowWizard(false);
      setStep(0);
      setForm(EMPTY);
      await load();
    } finally { setLoading(false); }
  };

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true); setProgress(0);
    try {
      const newDocs = [];
      for (let i=0; i<files.length; i++) {
        const file = files[i];
        if (file.size > 5*1024*1024) { showToast(`File ${file.name} too large (max 5MB)`); continue; }
        const path = `applications/${user.uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const url = await uploadFile(file, path, setProgress);
        newDocs.push({
          fileName: file.name, fileSize: file.size, fileType: file.type,
          storagePath: path, downloadURL: url, uploadedAt: new Date().toISOString()
        });
      }
      setForm(p => ({ ...p, documents: [...(p.documents||[]), ...newDocs] }));
    } catch(err) {
      showToast(err.message || 'Upload failed');
    } finally {
      setUploading(false); setProgress(0);
    }
  };

  const removeDoc = async (idx) => {
    const doc = form.documents[idx];
    if (doc.storagePath) {
      try { await deleteFile(doc.storagePath); } catch (e) { console.error(e); }
    }
    setForm(p => ({ ...p, documents: p.documents.filter((_, i) => i !== idx) }));
  };

  const stageBadge = (stage) => {
    if (stage === 'Visa Accepted') return 'badge-success';
    if (stage === 'Visa Rejected') return 'badge-danger';
    if (['Offer Letter', 'Acceptance Letter'].includes(stage)) return 'badge-info';
    return 'badge-warning';
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Term *</label>
              <select className="form-select" value={form.term} onChange={set('term')}>
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Degree Type *</label>
              <select className="form-select" value={form.degreeType} onChange={set('degreeType')}>
                {DEGREE_TYPES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        );
      case 1:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['First Name','firstName','text'],['Last Name','lastName','text'],
              ['Date of Birth','dateOfBirth','date'],['Nationality','nationality','text'],
              ['Passport Number','passportNumber','text'],['Email','email','email'],
              ['Phone','phone','tel'],['GPA / Grade','gpa','text']].map(([label, field, type]) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" value={form[field]} onChange={set(field)} />
              </div>
            ))}
          </div>
        );
      case 2: {
        const filteredUnis = uniCity ? UNIVERSITIES.filter(u => {
          const matchSearch = u.name.toLowerCase().includes(uniSearch.toLowerCase()) || (u.location && u.location.toLowerCase().includes(uniSearch.toLowerCase()));
          const matchCity = u.location === uniCity;
          return matchSearch && matchCity;
        }) : [];
        return (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', marginBottom:12 }}>Select a city first, then choose a university to apply to:</p>
            
            <div style={{ display:'flex', gap:10, marginBottom: 16 }}>
              <div className="search-box" style={{ flex: 1 }}>
                <Search size={15} />
                <input type="text" className="form-input" placeholder="Search for a university..."
                  value={uniSearch} onChange={e => setUniSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: 200 }} value={uniCity} onChange={e => setUniCity(e.target.value)}>
                <option value="" disabled>Select a City...</option>
                {locations.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:360, overflowY:'auto', paddingRight:8 }}>
              {!uniCity && (
                <div style={{ padding:40, textAlign:'center', color:'var(--text-secondary)', background:'#f8f9fa', borderRadius:10, border:'2px dashed var(--border-light)' }}>
                  <Globe size={32} style={{ margin:'0 auto 12px', opacity:0.5 }} />
                  <p style={{ fontWeight:600 }}>No City Selected</p>
                  <p style={{ fontSize:'0.85rem', marginTop:4 }}>Please select a city from the dropdown above to view available universities.</p>
                </div>
              )}
              {uniCity && filteredUnis.length === 0 && (
                <div style={{ padding:24, textAlign:'center', color:'var(--text-secondary)' }}>No universities found matching your search.</div>
              )}
              {uniCity && filteredUnis.map(uni => (
                <div key={uni.id} style={{ border:`2px solid ${form.universityId===uni.id?'var(--primary)':'var(--border)'}`, borderRadius:10, padding:16, cursor:'pointer', background: form.universityId===uni.id?'var(--primary-light)':'#fff', transition:'all 0.15s' }}
                  onClick={() => setForm(p=>({...p, universityId:uni.id, university:uni.name, program: p.universityId===uni.id ? p.program : ''}))}>
                  
                  <div className="flex items-center gap-3">
                    <img src={uni.logo} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:'cover', border:'1px solid var(--border-light)' }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{uni.name}</p>
                      <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{uni.location}</p>
                    </div>
                  </div>
                  
                  {form.universityId === uni.id && (
                    <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border-light)' }}>
                      <p style={{ fontWeight:600, fontSize:'0.8125rem', marginBottom:10 }}>Choose a program to apply for:</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {uni.programs.map(prog => (
                          <button key={prog} onClick={e=>{e.stopPropagation(); setForm(p=>({...p,program:prog}));}}
                            style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${form.program===prog?'var(--primary)':'var(--border)'}`, background:form.program===prog?'var(--primary)':'#fff', color:form.program===prog?'#fff':'var(--text-primary)', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                            {prog}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 3:
        return (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Upload required documents (Passport, Transcript, etc.). Max 5MB per file.
            </p>
            
            <div
              onDragOver={e=>{e.preventDefault();}}
              onDrop={e=>{e.preventDefault();handleFiles(e.dataTransfer.files);}}
              style={{ border:'2px dashed var(--border)', borderRadius:'var(--radius)', padding:'24px', textAlign:'center', marginBottom:16 }}
            >
              <input id="wizard-upload" type="file" multiple style={{ display:'none' }} onChange={e=>handleFiles(e.target.files)} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              <CloudUpload size={32} style={{ color:'var(--primary)', margin:'0 auto 8px' }} />
              <p style={{ fontWeight:600, fontSize:'0.9rem' }}>Drag files here or <span style={{color:'var(--primary)', cursor:'pointer'}} onClick={()=>document.getElementById('wizard-upload').click()}>browse</span></p>
              {uploading && (
                <div style={{ marginTop:12 }}>
                  <div style={{ background:'#e5e7eb', borderRadius:99, height:6, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'var(--primary)', width:`${progress}%`, transition:'width 0.3s' }} />
                  </div>
                  <p style={{ marginTop:4, fontSize:'0.75rem', color:'var(--text-secondary)' }}>Uploading... {progress}%</p>
                </div>
              )}
            </div>

            {(form.documents?.length > 0) && (
              <div style={{ marginBottom:16 }}>
                {form.documents.map((doc, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#f8f9fa', borderRadius:8, marginBottom:6 }}>
                    <div className="flex items-center gap-2" style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      <FileText size={14} style={{ color:'var(--primary)' }} flexShrink={0}/>
                      {doc.fileName}
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.downloadURL} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" style={{ padding:4 }}><Eye size={14}/></a>
                      <button className="btn btn-ghost btn-icon" style={{ padding:4, color:'var(--danger)' }} onClick={()=>removeDoc(idx)}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Document Notes</label>
              <textarea className="form-input" rows={3} value={form.docNotes} onChange={set('docNotes')}
                placeholder="Any additional notes about your documents..." />
            </div>
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Review Your Application</h3>
            {[
              ['Term', form.term], ['Degree', form.degreeType],
              ['Name', `${form.firstName} ${form.lastName}`],
              ['Date of Birth', form.dateOfBirth], ['Nationality', form.nationality],
              ['Passport', form.passportNumber], ['Email', form.email], ['Phone', form.phone],
              ['University', form.university], ['Program', form.program], ['GPA', form.gpa],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="new-application-btn" className="btn btn-primary" onClick={() => setShowWizard(true)}>
          <Plus size={16} /> New Application
        </button>
      </div>

      {/* Applications table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>University</th>
                <th>Program</th>
                <th>Term</th>
                <th>Degree</th>
                <th>Stage</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state" style={{ padding: 40 }}>
                    <ClipboardList size={40} />
                    <p>No applications yet. Submit your first application above.</p>
                  </div>
                </td></tr>
              )}
              {apps.map((app, i) => (
                <tr key={app.id}>
                  <td className="muted">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</td>
                  <td className="muted">{app.university || '—'}</td>
                  <td className="muted">{app.program || '—'}</td>
                  <td className="muted">{app.term}</td>
                  <td className="muted">{app.degreeType}</td>
                  <td>
                    <span className={`badge ${stageBadge(app.stage)}`}>{app.stage}</span>
                  </td>
                  <td className="muted">{app.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Wizard Modal */}
      {showWizard && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowWizard(false)}>
          <div className="modal-box" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <span className="modal-title">New Application — Step {step + 1} of {WIZARD_STEPS.length}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowWizard(false)}>✕</button>
            </div>

            {/* Step indicators */}
            <div style={{ padding: '16px 24px 0', display: 'flex', gap: 8 }}>
              {WIZARD_STEPS.map((label, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: 4, borderRadius: 99,
                    background: i <= step ? 'var(--primary)' : 'var(--border)',
                    marginBottom: 6, transition: 'background 0.2s',
                  }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: i === step ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-body" style={{ minHeight: 260 }}>
              {renderStep()}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-outline" onClick={() => step === 0 ? setShowWizard(false) : setStep(s => s - 1)}>
                <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
              </button>
              {step < WIZARD_STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? <span className="spinner" /> : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast success">{toast}</div>
        </div>
      )}
    </div>
  );
}
