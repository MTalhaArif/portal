'use client';
import { useEffect, useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, ClipboardList, Globe, CloudUpload, FileText, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserApplications, addApplication, UNIVERSITIES } from '@/lib/firestore';
import { uploadFile, deleteFile } from '@/lib/storage';

const STAGES = ['Waiting Approval','Ready for Application','Evaluation','Offer Letter','Payment','Acceptance Letter','Pre-Registered','Registration','Visa Accepted','Visa Rejected'];
const DEGREE_TYPES = ['Bachelor','Master','PhD','Associate','Certificate'];
const TERMS = ['Fall 2025','Spring 2026','Fall 2026','Spring 2027'];
const WIZARD_STEPS = ['University','Term & Degree','Personal Info','Documents','Review & Submit'];

const EMPTY = {
  universityId:'', university:'', program:'',
  term: TERMS[0], degreeType:'Bachelor',
  firstName:'', lastName:'', dateOfBirth:'', nationality:'', passportNumber:'',
  email:'', phone:'', gpa:'', docNotes:'', documents: []
};

export default function StudentApplicationsPage() {
  const { user, profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState('');

  const load = async () => { if (!user) return; const d = await getUserApplications(user.uid); setApps(d); };
  useEffect(() => { load(); }, [user]);

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        firstName: profile.fullName?.split(' ')[0] || '',
        lastName: profile.fullName?.split(' ').slice(1).join(' ') || '',
        nationality: profile.nationality || '',
        dateOfBirth: profile.dateOfBirth || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const selectUniversity = (uni, program) => {
    setForm(p => ({ ...p, universityId: uni.id, university: uni.name, program }));
  };

  const handleSubmit = async () => {
    if (!form.university) { showToast('Please select a university first'); return; }
    setLoading(true);
    try {
      await addApplication({ ...form, ownerUid: user.uid, ownerName: profile?.fullName, ownerEmail: profile?.email, status:'Pending', stage:'Waiting Approval' });
      showToast('Application submitted successfully! 🎉');
      setShowWizard(false); setStep(0); setForm(EMPTY);
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

  const badgeClass = (stage) => {
    if (stage === 'Visa Accepted') return 'badge-success';
    if (stage === 'Visa Rejected') return 'badge-danger';
    if (['Offer Letter','Acceptance Letter'].includes(stage)) return 'badge-info';
    return 'badge-warning';
  };

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div>
          <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', marginBottom:16 }}>Select a university and program to apply to:</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:400, overflowY:'auto' }}>
            {UNIVERSITIES.map(uni => (
              <div key={uni.id} style={{ border:`2px solid ${form.universityId===uni.id?'var(--primary)':'var(--border)'}`, borderRadius:10, padding:16, cursor:'pointer', background: form.universityId===uni.id?'var(--primary-light)':'#fff', transition:'all 0.15s' }}
                onClick={() => setForm(p=>({...p, universityId:uni.id, university:uni.name, program: p.universityId===uni.id ? p.program : ''}))}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontWeight:700, marginBottom:4 }}>{uni.logo} {uni.name}</p>
                    <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{uni.city}, {uni.country}</p>
                  </div>
                </div>
                {form.universityId === uni.id && (
                  <div style={{ marginTop:12 }}>
                    <p style={{ fontWeight:600, fontSize:'0.8125rem', marginBottom:8 }}>Choose a program:</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {uni.programs.map(prog => (
                        <button key={prog} onClick={e=>{e.stopPropagation(); setForm(p=>({...p,program:prog}));}}
                          style={{ padding:'4px 12px', borderRadius:99, border:`1.5px solid ${form.program===prog?'var(--primary)':'var(--border)'}`, background:form.program===prog?'var(--primary)':'#fff', color:form.program===prog?'#fff':'var(--text-primary)', fontSize:'0.8rem', fontWeight:500, cursor:'pointer' }}>
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
      case 1: return (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Term *</label>
            <select className="form-select" value={form.term} onChange={set('term')}>
              {TERMS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Degree Type *</label>
            <select className="form-select" value={form.degreeType} onChange={set('degreeType')}>
              {DEGREE_TYPES.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          {form.university && (
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <div style={{ background:'var(--primary-light)', borderRadius:8, padding:'12px 16px', fontSize:'0.875rem' }}>
                ✅ Applying to: <strong>{form.university}</strong> — {form.program}
              </div>
            </div>
          )}
        </div>
      );
      case 2: return (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[['First Name','firstName','text'],['Last Name','lastName','text'],['Date of Birth','dateOfBirth','date'],['Nationality','nationality','text'],['Passport Number','passportNumber','text'],['Email','email','email'],['Phone','phone','tel'],['GPA / Grade','gpa','text']].map(([label,field,type])=>(
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input type={type} className="form-input" value={form[field]} onChange={set(field)} />
            </div>
          ))}
        </div>
      );
      case 3: return (
        <div>
          <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', marginBottom:16 }}>
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
      case 4: return (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>Review Your Application</h3>
          <div style={{ background:'var(--primary-light)', borderRadius:10, padding:16, marginBottom:8 }}>
            <p style={{ fontWeight:700 }}>🎓 {form.university}</p>
            <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)' }}>{form.program} · {form.degreeType} · {form.term}</p>
          </div>
          {[['Applicant',`${form.firstName} ${form.lastName}`],['Date of Birth',form.dateOfBirth],['Nationality',form.nationality],['Passport',form.passportNumber],['Email',form.email],['Phone',form.phone],['GPA',form.gpa]].map(([k,v])=>v&&(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-light)', fontSize:'0.875rem' }}>
              <span style={{ fontWeight:600, color:'var(--text-secondary)' }}>{k}</span><span>{v}</span>
            </div>
          ))}
        </div>
      );
      default: return null;
    }
  };

  const canNext = () => {
    if (step === 0) return form.university && form.program;
    return true;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin:0 }}>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">{apps.length} application{apps.length!==1?'s':''}</p>
        </div>
        <button id="new-application-btn" className="btn btn-primary" onClick={()=>setShowWizard(true)}>
          <Plus size={16} /> New Application
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>#</th><th>University</th><th>Program</th><th>Degree</th><th>Term</th><th>Stage</th><th>Submitted</th></tr></thead>
            <tbody>
              {apps.length===0 && <tr><td colSpan={7}><div className="empty-state" style={{ padding:40 }}><ClipboardList size={40} /><p>No applications yet. Click <strong>New Application</strong> to get started.</p></div></td></tr>}
              {apps.map((app,i)=>(
                <tr key={app.id}>
                  <td className="muted">{i+1}</td>
                  <td style={{ fontWeight:600 }}>{app.university}</td>
                  <td className="muted">{app.program}</td>
                  <td className="muted">{app.degreeType}</td>
                  <td className="muted">{app.term}</td>
                  <td><span className={`badge ${badgeClass(app.stage)}`}>{app.stage}</span></td>
                  <td className="muted">{app.createdAt?.toDate?.().toLocaleDateString()||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wizard */}
      {showWizard && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowWizard(false)}>
          <div className="modal-box" style={{ maxWidth:680 }}>
            <div className="modal-header">
              <span className="modal-title">New Application — {WIZARD_STEPS[step]}</span>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowWizard(false)}>✕</button>
            </div>
            <div style={{ padding:'16px 24px 0', display:'flex', gap:6 }}>
              {WIZARD_STEPS.map((label,i)=>(
                <div key={i} style={{ flex:1, textAlign:'center' }}>
                  <div style={{ height:4, borderRadius:99, background: i<=step?'var(--primary)':'var(--border)', marginBottom:4, transition:'background 0.2s' }} />
                  <span style={{ fontSize:'0.6rem', fontWeight:600, color:i===step?'var(--primary)':'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.03em' }}>{label}</span>
                </div>
              ))}
            </div>
            <div className="modal-body" style={{ minHeight:300 }}>{renderStep()}</div>
            <div className="modal-footer" style={{ justifyContent:'space-between' }}>
              <button className="btn btn-outline" onClick={()=>step===0?setShowWizard(false):setStep(s=>s-1)}>
                <ChevronLeft size={16} />{step===0?'Cancel':'Back'}
              </button>
              {step < WIZARD_STEPS.length-1 ? (
                <button className="btn btn-primary" onClick={()=>setStep(s=>s+1)} disabled={!canNext()}>
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading?<span className="spinner"/>:'Submit Application 🎓'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="toast-container"><div className="toast success">{toast}</div></div>}
    </div>
  );
}
