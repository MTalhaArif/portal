'use client';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header({ title }) {
  const { profile } = useAuth();
  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={styles.header}>
      <span className={styles.pageTitle}>{profile?.fullName || 'Loading...'}</span>

      <div className={styles.right}>
        <button className={styles.notifBtn} title="Notifications" id="notif-btn">
          <Bell size={18} />
          <span className={styles.badge} />
        </button>

        <div className={styles.avatar}>
          <div className={styles.avatarCircle}>{initials}</div>
          <span className={styles.avatarName}>{profile?.fullName?.split(' ')[0]}</span>
          {profile?.role === 'admin' && (
            <span className={styles.roleBadge}>Admin</span>
          )}
        </div>
      </div>
    </header>
  );
}
