'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Power, Eye, EyeOff } from 'lucide-react';
import { getAllAgencies, updateDocument, removeDocument } from '@/lib/firestore';
import { createAgencyAccount } from '@/lib/auth';

const EMPTY_FORM = { fullName:'', email:'', password:'', company:'', phone:'' };

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => { const d = await getAllAgencies(); setAgencies(d); };
  useEffect(() => { load(); }, []);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(''),3000); };
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { showToast('Password must be at least 6 characters','error'); return; }
    setLoading(true);
    try {
      await createAgencyAccount({ email:form.email, password:form.password, fullName:form.fullName, company:form.company, phone:form.phone });
      showToast('Agency account created ✓');
      setShowModal(false);
      setForm(EMPTY_FORM);
      await load();
    } catch(err) {
      showToast(err.message || 'Failed to create account', 'error');
    } finally { setLoading(false); }
  };

  const toggleStatus = async (a) => {
    const next = a.status === 'active' ? 'inactive' : 'active';
    await updateDocument('users', a.uid || a.id, { status: next });
    showToast(`Agency ${next}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin:0 }}>
          <h1 className="page-title">Agencies</h1>
          <p className="page-subtitle">{agencies.length} agency account{agencies.length!==1?'s':''}</p>
        </div>
        <button id="create-agency-btn" className="btn btn-primary" onClick={()=>setShowModal(true)}>
          <Plus size={16} /> Create Agency Account
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Phone</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {agencies.length===0&&<tr><td colSpan={7}><div className="empty-state" style={{ padding:40 }}><p>No agencies yet. Create the first agency account above.</p></div></td></tr>}
              {agencies.map(a=>(
                <tr key={a.id}>
                  <td style={{ fontWeight:600 }}>{a.fullName}</td>
                  <td className="muted">{a.email}</td>
                  <td className="muted">{a.company||'—'}</td>
                  <td className="muted">{a.phone||'—'}</td>
                  <td><span className={`badge ${a.status==='active'?'badge-success':'badge-danger'}`}>{a.status}</span></td>
                  <td className="muted">{a.createdAt?.toDate?.().toLocaleDateString()||a.createdAt?.split?.('T')[0]||'—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-icon" title="Toggle Status" onClick={()=>toggleStatus(a)}>
                      <Power size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Agency Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <span className="modal-title">Create Agency Account</span>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', background:'var(--info-bg)', padding:'10px 14px', borderRadius:8, marginBottom:4 }}>
                  ℹ️ Agency accounts are created by admins only. Agencies can log in but cannot sign up themselves.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" value={form.fullName} onChange={set('fullName')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Agency Name</label>
                    <input type="text" className="form-input" value={form.company} onChange={set('company')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" value={form.phone} onChange={set('phone')} />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Password *</label>
                    <div style={{ position:'relative' }}>
                      <input type={showPass?'text':'password'} className="form-input" value={form.password} onChange={set('password')} required style={{ paddingRight:44 }} />
                      <button type="button" onClick={()=>setShowPass(!showPass)}
                        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex' }}>
                        {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading?<span className="spinner"/>:'Create Agency Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast&&<div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}
