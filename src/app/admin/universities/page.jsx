'use client';
import { useState } from 'react';
import { UNIVERSITIES } from '@/lib/firestore';
import { Globe, GraduationCap, MapPin, Building2, BookOpen, DollarSign } from 'lucide-react';

const ALL_PROGRAMS = [...new Set(UNIVERSITIES.flatMap(u => u.programs))].sort();
const ALL_DEGREES = ['Vocational','Bachelor','Master (Thesis)','Master (Non-Thesis)','PhD'];

export default function AdminUniversitiesPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [langFilter, setLangFilter] = useState('All');
  const [selectedUni, setSelectedUni] = useState(null);

  const cities = ['All', ...new Set(UNIVERSITIES.map(u => u.city))];

  const filtered = UNIVERSITIES.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.programs.some(p => p.toLowerCase().includes(q)) ||
      u.description?.toLowerCase().includes(q);
    const matchCity = city === 'All' || u.city === city;
    const matchDegree = degreeFilter === 'All' || (u.degrees || []).includes(degreeFilter);
    const matchLang = langFilter === 'All' || (u.languages || []).includes(langFilter);
    return matchSearch && matchCity && matchDegree && matchLang;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Partner Universities</h1>
        <p className="page-subtitle">
          {UNIVERSITIES.length} partner universities · {UNIVERSITIES.reduce((s,u)=>s+(u.totalPrograms||0),0)}+ programs available
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:20 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <div className="search-box" style={{ flex:'1 1 240px', minWidth:200 }}>
            <Globe size={15} />
            <input type="text" className="form-input" placeholder="Search university or program..."
              value={search} onChange={e => setSearch(e.target.value)} id="uni-search" />
          </div>
          <select className="form-select" style={{ width:140 }} value={city} onChange={e=>setCity(e.target.value)}>
            {cities.map(c=><option key={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width:180 }} value={degreeFilter} onChange={e=>setDegreeFilter(e.target.value)}>
            <option value="All">All Degrees</option>
            {ALL_DEGREES.map(d=><option key={d}>{d}</option>)}
          </select>
          <select className="form-select" style={{ width:140 }} value={langFilter} onChange={e=>setLangFilter(e.target.value)}>
            <option value="All">All Languages</option>
            <option>English</option>
            <option>Turkish</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:16 }}>
        Showing <strong>{filtered.length}</strong> of {UNIVERSITIES.length} universities
      </p>

      {/* University cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:18 }}>
        {filtered.map(uni => (
          <div key={uni.id} className="card" style={{ padding:0, overflow:'hidden', transition:'transform 0.18s, box-shadow 0.18s', cursor:'pointer' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,.12)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>

            {/* Card header */}
            <div style={{ background:'linear-gradient(135deg, #0d1b2a 0%, #1a2f4a 100%)', padding:'20px 20px 16px', position:'relative' }}>
              <div className="flex items-center gap-3">
                <div style={{ width:48, height:48, background:'rgba(232,93,4,.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, border:'1px solid rgba(232,93,4,.3)' }}>
                  {uni.logo}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.92rem', color:'#fff', lineHeight:1.3, marginBottom:3 }}>{uni.name}</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.78rem', color:'rgba(255,255,255,.6)' }}>
                    <MapPin size={11} /> {uni.city}, {uni.country}
                  </div>
                </div>
                <span style={{ background: uni.type==='Public'?'rgba(34,197,94,.15)':'rgba(232,93,4,.15)', color: uni.type==='Public'?'#22c55e':'#e85d04', border:`1px solid ${uni.type==='Public'?'rgba(34,197,94,.3)':'rgba(232,93,4,.3)'}`, borderRadius:99, padding:'2px 10px', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
                  {uni.type}
                </span>
              </div>

              {/* Stats row */}
              <div style={{ display:'flex', gap:14, marginTop:12 }}>
                {[
                  [Building2, `${uni.campuses} campus${uni.campuses!==1?'es':''}`],
                  [BookOpen, `${uni.totalPrograms}+ programs`],
                  [DollarSign, uni.tuitionRange],
                ].map(([Icon, label], i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'rgba(255,255,255,.55)' }}>
                    <Icon size={11} />{label}
                  </div>
                ))}
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding:'14px 20px 18px' }}>
              <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:12, lineHeight:1.5 }}>
                {uni.description}
              </p>

              {/* Language badges */}
              <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                {(uni.languages||[]).map(l=>(
                  <span key={l} style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:99, background: l==='English'?'rgba(59,130,246,.1)':'rgba(232,93,4,.08)', color: l==='English'?'#3b82f6':'#e85d04', border:`1px solid ${l==='English'?'rgba(59,130,246,.25)':'rgba(232,93,4,.2)'}`, fontWeight:600 }}>
                    {l}
                  </span>
                ))}
                {(uni.degrees||[]).slice(0,2).map(d=>(
                  <span key={d} style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:99, background:'#f3f4f6', color:'var(--text-secondary)', border:'1px solid var(--border)', fontWeight:500 }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Programs */}
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>Programs</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                {uni.programs.slice(0,6).map(prog=>(
                  <span key={prog} className="badge badge-gray" style={{ fontSize:'0.72rem', padding:'3px 8px' }}>{prog}</span>
                ))}
                {uni.programs.length > 6 && (
                  <span className="badge badge-gray" style={{ fontSize:'0.72rem', padding:'3px 8px', background:'var(--primary-light)', color:'var(--primary)' }}>
                    +{uni.programs.length-6} more
                  </span>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <button onClick={()=>setSelectedUni(uni)}
                  className="btn btn-outline btn-sm" style={{ justifyContent:'center', fontSize:'0.8rem' }}>
                  View Details
                </button>
                <a href="/admin/applications" className="btn btn-primary btn-sm" style={{ justifyContent:'center', fontSize:'0.8rem' }}>
                  <GraduationCap size={13} /> View Applications
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" style={{ marginTop:40 }}>
          <Globe size={40} />
          <p>No universities match your filters. Try adjusting your search.</p>
        </div>
      )}

      {/* Detail modal */}
      {selectedUni && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelectedUni(null)}>
          <div className="modal-box" style={{ maxWidth:600 }}>
            <div className="modal-header" style={{ background:'linear-gradient(135deg, #0d1b2a, #1a2f4a)' }}>
              <div>
                <span className="modal-title" style={{ color:'#fff', fontSize:'1.1rem' }}>{selectedUni.logo} {selectedUni.name}</span>
                <p style={{ color:'rgba(255,255,255,.55)', fontSize:'0.8rem', marginTop:2 }}>{selectedUni.city}, {selectedUni.country} · {selectedUni.type}</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSelectedUni(null)} style={{ color:'#fff' }}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'var(--text-secondary)', marginBottom:16, lineHeight:1.6 }}>{selectedUni.description}</p>

              {/* Quick stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
                {[[Building2,`${selectedUni.campuses} Campuses`],[BookOpen,`${selectedUni.totalPrograms}+ Programs`],[DollarSign,selectedUni.tuitionRange]].map(([Icon,label],i)=>(
                  <div key={i} style={{ background:'#f8f9fa', borderRadius:10, padding:'12px', textAlign:'center' }}>
                    <Icon size={18} color="var(--primary)" style={{ margin:'0 auto 6px' }} />
                    <p style={{ fontSize:'0.78rem', fontWeight:600 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Degrees */}
              <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'.04em', color:'var(--text-secondary)' }}>Degree Types Offered</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                {selectedUni.degrees?.map(d=>(
                  <span key={d} className="badge badge-info" style={{ fontSize:'0.78rem' }}>{d}</span>
                ))}
              </div>

              {/* Languages */}
              <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'.04em', color:'var(--text-secondary)' }}>Languages of Instruction</p>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {selectedUni.languages?.map(l=>(
                  <span key={l} style={{ padding:'4px 14px', borderRadius:99, fontWeight:700, fontSize:'0.82rem', background: l==='English'?'rgba(59,130,246,.1)':'rgba(232,93,4,.1)', color: l==='English'?'#3b82f6':'#e85d04', border:`1px solid ${l==='English'?'rgba(59,130,246,.3)':'rgba(232,93,4,.3)'}` }}>{l}</span>
                ))}
              </div>

              {/* All programs */}
              <p style={{ fontWeight:700, marginBottom:8, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'.04em', color:'var(--text-secondary)' }}>Available Programs</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {selectedUni.programs.map(prog=>(
                  <span key={prog} className="badge badge-gray" style={{ fontSize:'0.78rem' }}>{prog}</span>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setSelectedUni(null)}>Close</button>
              <a href="/admin/applications" className="btn btn-primary">
                <GraduationCap size={15} /> Applications for {selectedUni.name.split(' ').slice(0,2).join(' ')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
