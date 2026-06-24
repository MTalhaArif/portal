'use client';
import { useEffect, useState } from 'react';
import { getAllUsers, getAllDocumentsAdmin, getAllApplications } from '@/lib/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({ users: 0, docs: 0, apps: 0 });
  const [appsByMonth, setAppsByMonth] = useState(Array(12).fill(0));
  const [usersByMonth, setUsersByMonth] = useState(Array(12).fill(0));
  const [stageData, setStageData] = useState({});

  useEffect(() => {
    Promise.all([getAllUsers(), getAllDocumentsAdmin(), getAllApplications()]).then(([users, docs, apps]) => {
      setStats({ users: users.length, docs: docs.length, apps: apps.length });

      const aByM = Array(12).fill(0);
      const uByM = Array(12).fill(0);
      apps.forEach(a => { const d = a.createdAt?.toDate?.(); if (d) aByM[d.getMonth()]++; });
      users.forEach(u => { const d = u.createdAt?.toDate?.(); if (d) uByM[d.getMonth()]++; });
      setAppsByMonth(aByM);
      setUsersByMonth(uByM);

      const stages = {};
      apps.forEach(a => { stages[a.stage] = (stages[a.stage] || 0) + 1; });
      setStageData(stages);
    });
  }, []);

  const lineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Applications', data: appsByMonth, borderColor: '#e85d04', backgroundColor: 'rgba(232,93,4,.1)', tension: 0.4, fill: true, pointRadius: 4 },
      { label: 'New Users',    data: usersByMonth, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', tension: 0.4, fill: true, pointRadius: 4 },
    ],
  };
  const stageBar = {
    labels: Object.keys(stageData),
    datasets: [{ label: 'By Stage', data: Object.values(stageData),
      backgroundColor: ['#e85d04','#f4a261','#e9c46a','#2a9d8f','#457b9d','#8b5cf6','#ec4899','#14b8a6','#22c55e','#ef4444'],
      borderRadius: 6 }],
  };
  const chartOpts = { responsive: true, plugins: { legend: { position: 'bottom' } } };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Platform Analytics</h1>
        <p className="page-subtitle">Full overview across all users</p>
      </div>
      <div className="stats-grid mb-6">
        {[['Total Users', stats.users, '#3b82f6'],['Total Documents', stats.docs, '#e85d04'],['Total Applications', stats.apps, '#22c55e']].map(([label, value, color]) => (
          <div className="card" key={label} style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Applications &amp; User Growth</h2>
        <Line data={lineData} options={chartOpts} />
      </div>
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Applications by Stage</h2>
        {Object.keys(stageData).length > 0
          ? <Bar data={stageBar} options={{ ...chartOpts, indexAxis: 'y' }} />
          : <div className="empty-state"><p>No data yet</p></div>
        }
      </div>
    </div>
  );
}
