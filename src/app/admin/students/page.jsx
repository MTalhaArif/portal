'use client';
import { useEffect, useState } from 'react';
import { Search, Power } from 'lucide-react';
import { getAllStudents, updateDocument } from '@/lib/firestore';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => { const d = await getAllStudents(); setStudents(d); };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(students); return; }
    setFiltered(students.filter(s =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.nationality?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, students]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  const toggleStatus = async (s) => {
    const next = s.status === 'active' ? 'inactive' : 'active';
    await updateDocument('users', s.uid || s.id, { status: next });
    showToast(`Student ${next}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ margin:0 }}>
          <h1 className="page-title">All Students</h1>
          <p className="page-subtitle">{students.length} registered student{students.length!==1?'s':''}</p>
        </div>
      </div>

      <div className="card" style={{ padding:'14px 18px', marginBottom:16 }}>
        <div className="search-box" style={{ maxWidth:400 }}>
          <Search size={15} />
          <input type="text" className="form-input" placeholder="Search by name, email, nationality..."
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>DOB</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={8}><div className="empty-state" style={{ padding:40 }}><p>No students found</p></div></td></tr>}
              {filtered.map(s=>(
                <tr key={s.id}>
                  <td style={{ fontWeight:600 }}>{s.fullName}</td>
                  <td className="muted">{s.email}</td>
                  <td className="muted">{s.phone||'—'}</td>
                  <td className="muted">{s.nationality||'—'}</td>
                  <td className="muted">{s.dateOfBirth||'—'}</td>
                  <td><span className={`badge ${s.status==='active'?'badge-success':'badge-danger'}`}>{s.status}</span></td>
                  <td className="muted">{s.createdAt?.toDate?.().toLocaleDateString()||s.createdAt?.split?.('T')[0]||'—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-icon" title="Toggle Status" onClick={()=>toggleStatus(s)}>
                      <Power size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast&&<div className="toast-container"><div className="toast success">{toast}</div></div>}
    </div>
  );
}
