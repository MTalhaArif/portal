'use client';
import { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getClients, getUserDocuments, getUserApplications } from '@/lib/firestore';
import StatsCard from '@/components/StatsCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const APP_STAGES = [
  'Waiting Approval', 'Ready for Application', 'Evaluation', 'Offer Letter',
  'Payment', 'Acceptance Letter', 'Pre-Registered', 'Registration',
  'Visa Accepted', 'Visa Rejected',
];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ clients: null, documents: null, applications: null, approved: null });
  const [apps, setApps] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getClients(user.uid),
      getUserDocuments(user.uid),
      getUserApplications(user.uid),
    ]).then(([clients, docs, applications]) => {
      setStats({
        clients: clients.length,
        documents: docs.length,
        applications: applications.length,
        approved: applications.filter(a => a.status === 'Approved').length,
      });
      setApps(applications);
      setRecentDocs(docs.slice(0, 5));
    });
  }, [user]);

  // Build stage counts for pie chart
  const stageCounts = APP_STAGES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.stage === s).length;
    return acc;
  }, {});

  const pieData = {
    labels: APP_STAGES.filter(s => stageCounts[s] > 0),
    datasets: [{
      data: APP_STAGES.filter(s => stageCounts[s] > 0).map(s => stageCounts[s]),
      backgroundColor: [
        '#e85d04','#f4a261','#e9c46a','#2a9d8f','#457b9d',
        '#8b5cf6','#ec4899','#14b8a6','#ef4444','#6b7280',
      ],
      borderWidth: 0,
    }],
  };

  const firstName = profile?.fullName?.split(' ')[0] || 'there';

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Agency Dashboard</h1>
        <p className="page-subtitle">Welcome back, {firstName}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard label="Total Clients"      value={stats.clients}       icon={Users}          color="primary" />
        <StatsCard label="Documents Uploaded" value={stats.documents}     icon={FileText}       color="info"    />
        <StatsCard label="Applications"       value={stats.applications}  icon={ClipboardList}  color="warning" />
        <StatsCard label="Approved"           value={stats.approved}      icon={CheckCircle}    color="success" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Applications by Stage — Pie Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Applications by Stage</h2>
          {apps.length > 0 ? (
            <div style={{ maxWidth: 320, margin: '0 auto' }}>
              <Doughnut data={pieData} options={{
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                cutout: '60%',
              }} />
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={40} />
              <p>No applications yet</p>
            </div>
          )}
        </div>

        {/* Application Stages table */}
        <div className="card" style={{ padding: 24 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Application Stages</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
            {APP_STAGES.map(stage => (
              <div key={stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{stage}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{stageCounts[stage]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Recent Documents</h2>
        {recentDocs.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.fileName}</td>
                    <td className="muted">{doc.category}</td>
                    <td className="muted">{doc.createdAt?.toDate?.().toLocaleDateString() || '—'}</td>
                    <td>
                      <span className={`badge ${
                        doc.status === 'Approved' ? 'badge-success'
                        : doc.status === 'Rejected' ? 'badge-danger'
                        : 'badge-warning'
                      }`}>{doc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={40} />
            <p>No documents uploaded yet. <a href="/dashboard/documents" style={{ color: 'var(--primary)' }}>Upload one →</a></p>
          </div>
        )}
      </div>
    </div>
  );
}
