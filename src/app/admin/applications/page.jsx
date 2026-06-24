'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getAllApplications, updateApplication } from '@/lib/firestore';

const STAGES = ['Waiting Approval','Ready for Application','Evaluation','Offer Letter','Payment','Acceptance Letter','Pre-Registered','Registration','Visa Accepted','Visa Rejected'];

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [toast, setToast] = useState('');

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

  const updateStage = async (app, stage) => {
    await updateApplication(app.id, { stage });
    showToast(`Stage updated to "${stage}"`);
    await load();
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
              <tr><th>#</th><th>Applicant</th><th>University</th><th>Program</th><th>Term</th><th>Degree</th><th>Stage</th><th>Submitted</th><th>Update Stage</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9}><div className="empty-state" style={{ padding: 40 }}><p>No applications found</p></div></td></tr>}
              {filtered.map((app, i) => (
                <tr key={app.id}>
                  <td className="muted">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{app.firstName} {app.lastName}</td>
                  <td className="muted">{app.university || '—'}</td>
                  <td className="muted">{app.program || '—'}</td>
                  <td className="muted">{app.term}</td>
                  <td className="muted">{app.degreeType}</td>
                  <td><span className={`badge ${badgeClass(app.stage)}`}>{app.stage}</span></td>
                  <td className="muted">{app.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: 180, padding: '6px 10px', fontSize: '0.8rem' }}
                      value={app.stage}
                      onChange={e => updateStage(app, e.target.value)}
                    >
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
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
