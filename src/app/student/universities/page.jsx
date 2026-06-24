'use client';
import { useState } from 'react';
import { UNIVERSITIES } from '@/lib/firestore';
import { Globe, GraduationCap, MapPin } from 'lucide-react';

export default function StudentUniversitiesPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');

  const cities = ['All', ...new Set(UNIVERSITIES.map(u => u.city))];
  const filtered = UNIVERSITIES.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.programs.some(p => p.toLowerCase().includes(search.toLowerCase()));
    const matchCity = city === 'All' || u.city === city;
    return matchSearch && matchCity;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Universities</h1>
        <p className="page-subtitle">Browse {UNIVERSITIES.length} partner universities in Turkey</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'14px 18px', marginBottom:20 }}>
        <div className="flex items-center gap-3">
          <div className="search-box" style={{ flex:1 }}>
            <Globe size={15} />
            <input type="text" className="form-input" placeholder="Search universities or programs..."
              value={search} onChange={e => setSearch(e.target.value)} id="uni-search" />
          </div>
          <select className="form-select" style={{ width:160 }} value={city} onChange={e => setCity(e.target.value)}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* University cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
        {filtered.map(uni => (
          <div key={uni.id} className="card" style={{ padding:24, transition:'transform 0.18s, box-shadow 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
            <div className="flex items-center gap-3" style={{ marginBottom:14 }}>
              <div style={{ width:52, height:52, background:'var(--primary-light)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0 }}>
                {uni.logo}
              </div>
              <div>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', lineHeight:1.3 }}>{uni.name}</h3>
                <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4, marginTop:3 }}>
                  <MapPin size={12} /> {uni.city}, {uni.country}
                </p>
              </div>
            </div>

            <p style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>
              Programs
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
              {uni.programs.map(prog => (
                <span key={prog} className="badge badge-gray" style={{ fontSize:'0.75rem' }}>{prog}</span>
              ))}
            </div>

            <a href={`/student/applications`}
              className="btn btn-primary btn-sm"
              style={{ width:'100%', justifyContent:'center' }}>
              <GraduationCap size={15} /> Apply Now
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" style={{ marginTop:40 }}>
          <Globe size={40} />
          <p>No universities match your search. Try different keywords.</p>
        </div>
      )}
    </div>
  );
}
