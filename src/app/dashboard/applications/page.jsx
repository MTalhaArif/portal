'use client';
import { useEffect, useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserApplications, addApplication } from '@/lib/firestore';

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
  email: '', phone: '',
  university: '', program: '', gpa: '',
  docNotes: '',
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

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
              ['Phone','phone','tel']].map(([label, field, type]) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" value={form[field]} onChange={set(field)} />
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">University</label>
              <input type="text" className="form-input" value={form.university} onChange={set('university')} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Program / Major</label>
              <input type="text" className="form-input" value={form.program} onChange={set('program')} />
            </div>
            <div className="form-group">
              <label className="form-label">GPA / Grade</label>
              <input type="text" className="form-input" value={form.gpa} onChange={set('gpa')} />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Please upload your documents in the <a href="/dashboard/documents" style={{ color: 'var(--primary)' }}>Documents</a> section. Add any notes below.
            </p>
            <div className="form-group">
              <label className="form-label">Document Notes</label>
              <textarea className="form-input" rows={4} value={form.docNotes} onChange={set('docNotes')}
                placeholder="List the documents you have uploaded or any notes for the admin..." />
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
