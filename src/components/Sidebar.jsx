'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, GraduationCap,
  BarChart2, Settings, ClipboardList, LogOut, Globe, Building2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

// ─── Student nav (no Clients, university focused) ──────────────────────────────
const studentNav = [
  { href: '/student/dashboard',      icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/student/applications',   icon: ClipboardList,   label: 'Apply'      },
  { href: '/student/documents',      icon: FileText,        label: 'Documents'  },
  { href: '/student/universities',   icon: Globe,           label: 'Unis'       },
];

// ─── Agency nav (manage applicants, no clients) ────────────────────────────────
const agencyNav = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/dashboard/students',     icon: GraduationCap,   label: 'Students'   },
  { href: '/dashboard/applications', icon: ClipboardList,   label: 'Apply'      },
  { href: '/dashboard/documents',    icon: FileText,        label: 'Documents'  },
  { href: '/dashboard/universities', icon: Globe,           label: 'Unis'       },
  { href: '/dashboard/analytics',    icon: BarChart2,       label: 'Analytics'  },
];

// ─── Admin nav ─────────────────────────────────────────────────────────────────
const adminNav = [
  { href: '/admin/dashboard',        icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/admin/students',         icon: GraduationCap,   label: 'Students'   },
  { href: '/admin/agencies',         icon: Building2,       label: 'Agencies'   },
  { href: '/admin/applications',     icon: ClipboardList,   label: 'Apply'      },
  { href: '/admin/documents',        icon: FileText,        label: 'Documents'  },
  { href: '/admin/universities',     icon: Globe,           label: 'Unis'       },
  { href: '/admin/analytics',        icon: BarChart2,       label: 'Analytics'  },
];

export default function Sidebar({ role = 'student' }) {
  const pathname = usePathname();
  const router = useRouter();

  const nav = role === 'admin' ? adminNav : role === 'agency' ? agencyNav : studentNav;
  const settingsHref = role === 'admin' ? '/admin/settings'
    : role === 'agency' ? '/dashboard/settings'
    : '/student/settings';

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  const isActive = (href) => {
    const roots = ['/student/dashboard', '/dashboard', '/admin/dashboard'];
    if (roots.includes(href)) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoMark}>PP</div>

      <ul className={styles.navList}>
        {nav.map(({ href, icon: Icon, label }) => (
          <li key={href} className={styles.navItem}>
            <Link href={href} className={`${styles.navLink} ${isActive(href) ? styles.active : ''}`} title={label}>
              <Icon size={20} strokeWidth={isActive(href) ? 2.2 : 1.8} />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          </li>
        ))}

        <div className={styles.navDivider} />

        <li className={styles.navItem}>
          <Link href={settingsHref}
            className={`${styles.navLink} ${pathname === settingsHref ? styles.active : ''}`}
            title="Settings">
            <Settings size={20} />
            <span className={styles.navLabel}>Settings</span>
          </Link>
        </li>

        <li className={styles.navItem}>
          <button id="logout-btn" className={styles.navLink}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleLogout} title="Logout">
            <LogOut size={20} />
            <span className={styles.navLabel}>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}
