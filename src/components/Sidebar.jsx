'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, GraduationCap,
  BarChart2, Settings, ClipboardList, LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

const clientNav = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/clients',        icon: Users,           label: 'Clients'   },
  { href: '/dashboard/documents',      icon: FileText,        label: 'Documents' },
  { href: '/dashboard/applications',   icon: ClipboardList,   label: 'Apply'     },
  { href: '/dashboard/analytics',      icon: BarChart2,       label: 'Analytics' },
];

const adminNav = [
  { href: '/admin/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users',              icon: Users,           label: 'Users'     },
  { href: '/admin/documents',          icon: FileText,        label: 'Documents' },
  { href: '/admin/applications',       icon: ClipboardList,   label: 'Apply'     },
  { href: '/admin/analytics',          icon: BarChart2,       label: 'Analytics' },
];

export default function Sidebar({ isAdmin = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = isAdmin ? adminNav : clientNav;

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoMark}>PP</div>

      <ul className={styles.navList}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && href !== '/admin/dashboard' && pathname.startsWith(href));
          return (
            <li key={href} className={styles.navItem}>
              <Link
                href={href}
                className={`${styles.navLink} ${active ? styles.active : ''}`}
                title={label}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className={styles.navLabel}>{label}</span>
              </Link>
            </li>
          );
        })}

        <div className={styles.navDivider} />

        <li className={styles.navItem}>
          <Link
            href={isAdmin ? '/admin/settings' : '/dashboard/settings'}
            className={`${styles.navLink} ${pathname.endsWith('/settings') ? styles.active : ''}`}
            title="Settings"
          >
            <Settings size={20} />
            <span className={styles.navLabel}>Settings</span>
          </Link>
        </li>

        <li className={styles.navItem}>
          <button
            id="logout-btn"
            className={styles.navLink}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={20} />
            <span className={styles.navLabel}>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}
