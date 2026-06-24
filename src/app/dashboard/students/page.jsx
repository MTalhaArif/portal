'use client';
import { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { getAllStudents, getUserApplications, getUserDocuments } from '@/lib/firestore';

export default function AgencyStudentsPage() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [studentApps, setStudentApps] = useState([]);
  const [studentDocs, setStudentDocs] = useState([]);

  useEffect(() => { getAllStudents().then(d => { setStudents(d); setFiltered(d); }); }, []);

  useEffect(() => {
    if (!search) { setFiltered(students); return; }
    setFiltered(students.filter(s =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.nationality?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, students]);

  const viewStudent = async (student) => {
    setSelected(student);
    const [apps, docs] = await Promise.all([getUserApplications(student.uid), getUserDocuments(student.uid)]);
    setStudentApps(apps);
    setStudentDocs(docs);
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
        <div className="page-header" style={{ margin:0 }}>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} registered student{students.length!==1?'s':''}</p>
        </div>
      </div>

      <div className="card" style={{ padding:'14px 18px', marginBottom:16 }}>
        <div className="search-box" style={{ maxWidth:400 }}>
          <Search size={15} />
          <input type="text" className="form-input" placeholder="Search by name, email, nationality..."
            value={search} onChange={e => setSearch(e.target.value)} id="student-search" />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Full Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>Date of Birth</th><th>Joined</th><th>View</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={7}><div className="empty-state" style={{ padding:40 }}><p>No students found</p></div></td></tr>}
              {filtered.map(s=>(
                <tr key={s.id}>
                  <td style={{ fontWeight:600 }}>{s.fullName}</td>
                  <td className="muted">{s.email}</td>
                  <td className="muted">{s.phone||'—'}</td>
                  <td className="muted">{s.nationality||'—'}</td>
                  <td className="muted">{s.dateOfBirth||'—'}</td>
                  <td className="muted">{s.createdAt?.toDate?.().toLocaleDateString()||s.createdAt?.split?.('T')[0]||'—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-icon" title="View Profile" onClick={()=>viewStudent(s)}>
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal-box" style={{ maxWidth:680 }}>
            <div className="modal-header">
              <span className="modal-title">Student Profile — {selected.fullName}</span>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Personal Info */}
              <h3 style={{ fontWeight:700, marginBottom:12 }}>Personal Details</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 20px', marginBottom:20 }}>
                {[['Full Name',selected.fullName],['Email',selected.email],['Phone',selected.phone],['Nationality',selected.nationality],['Date of Birth',selected.dateOfBirth]].map(([k,v])=>v&&(
                  <div key={k} style={{ padding:'8px 0', borderBottom:'1px solid var(--border-light)', fontSize:'0.875rem' }}>
                    <span style={{ fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:2 }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>

              {/* Applications */}
              <h3 style={{ fontWeight:700, marginBottom:12 }}>Applications ({studentApps.length})</h3>
              {studentApps.length>0 ? (
                <div className="table-wrapper" style={{ marginBottom:16 }}>
                  <table className="data-table">
                    <thead><tr><th>University</th><th>Program</th><th>Term</th><th>Stage</th></tr></thead>
                    <tbody>
                      {studentApps.map(app=>(
                        <tr key={app.id}>
                          <td style={{ fontWeight:500 }}>{app.university}</td>
                          <td className="muted">{app.program}</td>
                          <td className="muted">{app.term}</td>
                          <td><span className={`badge ${badgeClass(app.stage)}`}>{app.stage}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:16 }}>No applications yet.</p>}

              {/* Documents */}
              <h3 style={{ fontWeight:700, marginBottom:12 }}>Documents ({studentDocs.length})</h3>
              {studentDocs.length>0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {studentDocs.map(doc=>(
                    <div key={doc.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#fafafa', borderRadius:8, border:'1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight:500, fontSize:'0.875rem' }}>{doc.fileName}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{doc.category}</p>
                      </div>
                      <span className={`badge ${doc.status==='Approved'?'badge-success':doc.status==='Rejected'?'badge-danger':'badge-warning'}`}>{doc.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>No documents uploaded yet.</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
