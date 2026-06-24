'use client';
import { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, CheckCircle } from 'lucide-react';
import { getAllUsers, getAllDocumentsAdmin, getAllApplications } from '@/lib/firestore';
import StatsCard from '@/components/StatsCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STAGES = ['Waiting Approval','Ready for Application','Evaluation','Offer Letter','Payment','Acceptance Letter','Pre-Registered','Registration','Visa Accepted','Visa Rejected'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: null, docs: null, apps: null, approved: null });
  const [apps, setApps] = useState([]);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllDocumentsAdmin(), getAllApplications()]).then(([users, docs, applications]) => {
      const clients = users.filter(u => u.role !== 'admin');
      setStats({
        users: clients.length,
        docs: docs.length,
        apps: applications.length,
        approved: applications.filter(a => a.stage === 'Visa Accepted').length,
      });
      setApps(applications);
      setRecentApps(applications.slice(0, 8));
    });
  }, []);

  const stageCounts = STAGES.reduce((acc, s) => { acc[s] = apps.filter(a => a.stage === s).length; return acc; }, {});
  const pieData = {
    labels: STAGES.filter(s => stageCounts[s] > 0),
    datasets: [{ data: STAGES.filter(s => stageCounts[s] > 0).map(s => stageCounts[s]),
      backgroundColor: ['#e85d04','#f4a261','#e9c46a','#2a9d8f','#457b9d','#8b5cf6','#ec4899','#14b8a6','#ef4444','#6b7280'],
      borderWidth: 0 }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview</p>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Clients"    value={stats.users}    icon={Users}         color="primary" />
        <StatsCard label="Total Documents"  value={stats.docs}     icon={FileText}      color="info" />
        <StatsCard label="Applications"     value={stats.apps}     icon={ClipboardList} color="warning" />
        <StatsCard label="Visa Accepted"    value={stats.approved} icon={CheckCircle}   color="success" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Applications by Stage</h2>
          {apps.length > 0 ? (
            <div style={{ maxWidth: 300, margin: '0 auto' }}>
              <Doughnut data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: '60%' }} />
            </div>
          ) : (
            <div className="empty-state"><p>No applications yet</p></div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Stage Breakdown</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            {STAGES.map(s => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
                <span style={{ fontWeight: 700 }}>{stageCounts[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Recent Applications</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Applicant</th><th>University</th><th>Program</th><th>Term</th><th>Stage</th><th>Date</th></tr></thead>
            <tbody>
              {recentApps.length === 0 && <tr><td colSpan={6}><div className="empty-state" style={{ padding: 30 }}><p>No applications</p></div></td></tr>}
              {recentApps.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</td>
                  <td className="muted">{a.university || '—'}</td>
                  <td className="muted">{a.program || '—'}</td>
                  <td className="muted">{a.term}</td>
                  <td><span className={`badge ${a.stage === 'Visa Accepted' ? 'badge-success' : a.stage === 'Visa Rejected' ? 'badge-danger' : 'badge-warning'}`}>{a.stage}</span></td>
                  <td className="muted">{a.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
