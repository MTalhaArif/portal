'use client';
import styles from './StatsCard.module.css';

export default function StatsCard({ label, value, icon: Icon, color = 'primary', delta }) {
  return (
    <div className={`${styles.card} card`}>
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value ?? <span className={styles.skeleton} />}</p>
        {delta !== undefined && (
          <p className={`${styles.delta} ${delta >= 0 ? styles.pos : styles.neg}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} this month
          </p>
        )}
      </div>
      <div className={`${styles.iconWrap} ${styles[color]}`}>
        {Icon && <Icon size={22} strokeWidth={1.8} />}
      </div>
    </div>
  );
}
