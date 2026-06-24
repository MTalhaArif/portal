'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, FileText, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserApplications, getUserDocuments } from '@/lib/firestore';
import StatsCard from '@/components/StatsCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STAGES = ['Waiting Approval','Ready for Application','Evaluation','Offer Letter','Payment','Acceptance Letter','Pre-Registered','Registration','Visa Accepted','Visa Rejected'];

export default function StudentDashboardPage() {
  const { user, profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserApplications(user.uid), getUserDocuments(user.uid)])
      .then(([a, d]) => { setApps(a); setDocs(d); });
  }, [user]);

  const approved = apps.filter(a => a.stage === 'Visa Accepted').length;
  const stageCounts = STAGES.reduce((acc, s) => { acc[s] = apps.filter(a => a.stage === s).length; return acc; }, {});

  const pieData = {
    labels: STAGES.filter(s => stageCounts[s] > 0),
    datasets: [{
      data: STAGES.filter(s => stageCounts[s] > 0).map(s => stageCounts[s]),
      backgroundColor: ['#e85d04','#f4a261','#e9c46a','#2a9d8f','#457b9d','#8b5cf6','#ec4899','#14b8a6','#22c55e','#ef4444'],
      borderWidth: 0,
    }],
  };

  const firstName = profile?.fullName?.split(' ')[0] || 'Student';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">Welcome back, {firstName} 👋</p>
      </div>

      <div className="stats-grid">
        <StatsCard label="My Applications" value={apps.length}  icon={ClipboardList} color="primary" />
        <StatsCard label="Documents Uploaded" value={docs.length} icon={FileText}  color="info"    />
        <StatsCard label="Approved"         value={approved}    icon={CheckCircle} color="success" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        {/* Pie chart */}
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20 }}>My Application Stages</h2>
          {apps.length > 0 ? (
            <div style={{ maxWidth:260, margin:'0 auto' }}>
              <Doughnut data={pieData} options={{ plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, font:{ size:11 } } } }, cutout:'60%' }} />
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={40} />
              <p>No applications yet. <a href="/student/applications" style={{ color:'var(--primary)' }}>Apply now →</a></p>
            </div>
          )}
        </div>

        {/* Stage breakdown */}
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Application Stages</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {STAGES.map(s => stageCounts[s] > 0 ? (
              <div key={s} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-light)', fontSize:'0.8125rem' }}>
                <span style={{ color:'var(--text-secondary)' }}>{s}</span>
                <span style={{ fontWeight:700 }}>{stageCounts[s]}</span>
              </div>
            ) : null)}
            {apps.length === 0 && <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>No stage data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div className="card" style={{ padding:24 }}>
        <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>My Recent Applications</h2>
        {apps.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>#</th><th>University</th><th>Program</th><th>Term</th><th>Stage</th><th>Submitted</th></tr></thead>
              <tbody>
                {apps.slice(0,6).map((app, i) => (
                  <tr key={app.id}>
                    <td className="muted">{i+1}</td>
                    <td style={{ fontWeight:600 }}>{app.university || '—'}</td>
                    <td className="muted">{app.program || '—'}</td>
                    <td className="muted">{app.term}</td>
                    <td><span className={`badge ${app.stage==='Visa Accepted'?'badge-success':app.stage==='Visa Rejected'?'badge-danger':'badge-warning'}`}>{app.stage}</span></td>
                    <td className="muted">{app.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={40} />
            <p>No applications yet. <a href="/student/applications" style={{ color:'var(--primary)' }}>Start your first application →</a></p>
          </div>
        )}
      </div>
    </div>
  );
}
