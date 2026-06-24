'use client';
import { useEffect, useState } from 'react';
import { GraduationCap, FileText, ClipboardList, CheckCircle } from 'lucide-react';
import { getAllStudents, getAllDocumentsAdmin, getAllApplications } from '@/lib/firestore';
import StatsCard from '@/components/StatsCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
const STAGES = ['Waiting Approval','Ready for Application','Evaluation','Offer Letter','Payment','Acceptance Letter','Pre-Registered','Registration','Visa Accepted','Visa Rejected'];

export default function AgencyDashboardPage() {
  const [students, setStudents] = useState([]);
  const [docs, setDocs] = useState([]);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    Promise.all([getAllStudents(), getAllDocumentsAdmin(), getAllApplications()])
      .then(([s, d, a]) => { setStudents(s); setDocs(d); setApps(a); });
  }, []);

  const approved = apps.filter(a => a.stage === 'Visa Accepted').length;
  const stageCounts = STAGES.reduce((acc,s) => { acc[s]=apps.filter(a=>a.stage===s).length; return acc; }, {});
  const pieData = {
    labels: STAGES.filter(s=>stageCounts[s]>0),
    datasets:[{ data:STAGES.filter(s=>stageCounts[s]>0).map(s=>stageCounts[s]),
      backgroundColor:['#e85d04','#f4a261','#e9c46a','#2a9d8f','#457b9d','#8b5cf6','#ec4899','#14b8a6','#22c55e','#ef4444'],
      borderWidth:0 }],
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agency Dashboard</h1>
        <p className="page-subtitle">Overview of your students and applications</p>
      </div>
      <div className="stats-grid">
        <StatsCard label="Total Students"    value={students.length} icon={GraduationCap} color="primary" />
        <StatsCard label="Total Documents"   value={docs.length}     icon={FileText}      color="info"    />
        <StatsCard label="Applications"      value={apps.length}     icon={ClipboardList} color="warning" />
        <StatsCard label="Visa Accepted"     value={approved}        icon={CheckCircle}   color="success" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20 }}>Applications by Stage</h2>
          {apps.length>0
            ? <div style={{ maxWidth:280, margin:'0 auto' }}><Doughnut data={pieData} options={{ plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, font:{ size:11 } } } }, cutout:'60%' }} /></div>
            : <div className="empty-state"><p>No applications yet</p></div>}
        </div>
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Stage Breakdown</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {STAGES.map(s=>(
              <div key={s} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-light)', fontSize:'0.8125rem' }}>
                <span style={{ color:'var(--text-secondary)' }}>{s}</span>
                <span style={{ fontWeight:700 }}>{stageCounts[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent students */}
      <div className="card" style={{ padding:24 }}>
        <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Recent Students</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>Joined</th></tr></thead>
            <tbody>
              {students.length===0&&<tr><td colSpan={5}><div className="empty-state" style={{ padding:30 }}><p>No students yet</p></div></td></tr>}
              {students.slice(0,6).map(s=>(
                <tr key={s.id}>
                  <td style={{ fontWeight:600 }}>{s.fullName}</td>
                  <td className="muted">{s.email}</td>
                  <td className="muted">{s.phone||'—'}</td>
                  <td className="muted">{s.nationality||'—'}</td>
                  <td className="muted">{s.createdAt?.toDate?.().toLocaleDateString()||s.createdAt?.split?.('T')[0]||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
