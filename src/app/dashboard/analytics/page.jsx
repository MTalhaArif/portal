'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserApplications, getUserDocuments, getAllStudents } from '@/lib/firestore';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PERIOD_LABELS = { Months: MONTHS, Weeks: ['W1','W2','W3','W4'], Days: Array.from({length:30},(_,i)=>`${i+1}`) };

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('Months');
  const [stats, setStats] = useState({ apps: 0, docs: 0, clients: 0 });
  const [appsByMonth, setAppsByMonth] = useState(Array(12).fill(0));
  const [docsByMonth, setDocsByMonth] = useState(Array(12).fill(0));
  const [stageData, setStageData] = useState({});
  const [docsByCategory, setDocsByCategory] = useState({});

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserApplications(user.uid),
      getUserDocuments(user.uid),
      getAllStudents(),
    ]).then(([apps, docs, students]) => {
      setStats({ apps: apps.length, docs: docs.length, clients: students.length });

      // By month
      const aByM = Array(12).fill(0);
      const dByM = Array(12).fill(0);
      apps.forEach(a => {
        const d = a.createdAt?.toDate?.();
        if (d) aByM[d.getMonth()]++;
      });
      docs.forEach(d => {
        const dt = d.createdAt?.toDate?.();
        if (dt) dByM[dt.getMonth()]++;
      });
      setAppsByMonth(aByM);
      setDocsByMonth(dByM);

      // Stage counts
      const stages = {};
      apps.forEach(a => { stages[a.stage] = (stages[a.stage] || 0) + 1; });
      setStageData(stages);

      // Docs by category
      const cats = {};
      docs.forEach(d => { cats[d.category] = (cats[d.category] || 0) + 1; });
      setDocsByCategory(cats);
    });
  }, [user]);

  const lineData = {
    labels: MONTHS,
    datasets: [
      { label: 'Applications', data: appsByMonth, borderColor: '#e85d04', backgroundColor: 'rgba(232,93,4,.1)', tension: 0.4, fill: true, pointRadius: 4 },
      { label: 'Documents',    data: docsByMonth,  borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', tension: 0.4, fill: true, pointRadius: 4 },
    ],
  };

  const stageBar = {
    labels: Object.keys(stageData),
    datasets: [{ label: 'Applications by Stage', data: Object.values(stageData),
      backgroundColor: ['#e85d04','#f4a261','#e9c46a','#2a9d8f','#457b9d','#8b5cf6','#ec4899','#14b8a6','#22c55e','#ef4444'],
      borderRadius: 6 }],
  };

  const catBar = {
    labels: Object.keys(docsByCategory),
    datasets: [{ label: 'Documents by Category', data: Object.values(docsByCategory),
      backgroundColor: '#3b82f6', borderRadius: 6 }],
  };

  const chartOpts = { responsive: true, plugins: { legend: { position: 'bottom' } } };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Overview of your applications and documents</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Applications', value: stats.apps, color: '#e85d04' },
          { label: 'Documents',    value: stats.docs, color: '#3b82f6' },
          { label: 'Clients',      value: stats.clients, color: '#22c55e' },
        ].map(s => (
          <div className="card" key={s.label} style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-4">
        {['Days','Weeks','Months'].map(p => (
          <button key={p} className={`btn ${period === p ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      {/* Line chart */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Applications &amp; Documents Overview</h2>
        <Line data={lineData} options={chartOpts} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>By Stage</h2>
          {Object.keys(stageData).length > 0
            ? <Bar data={stageBar} options={{ ...chartOpts, indexAxis: 'y' }} />
            : <div className="empty-state"><p>No stage data yet</p></div>
          }
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Documents by Category</h2>
          {Object.keys(docsByCategory).length > 0
            ? <Bar data={catBar} options={chartOpts} />
            : <div className="empty-state"><p>No document data yet</p></div>
          }
        </div>
      </div>
    </div>
  );
}
