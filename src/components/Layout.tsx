import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang, LanguageSwitcher } from '../contexts/LangContext'

// ── Real SVG icon set (replaces emoji) ─────────────────────
const NavIcons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Clients: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Routers: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="7" rx="2" /><path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <circle cx="8.5" cy="14.5" r="1" fill="currentColor" /><circle cx="12" cy="14.5" r="1" fill="currentColor" /><circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
    </svg>
  ),
  Devices: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Payments: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Vouchers: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" /><path d="M2 15v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
      <path d="M20 9a2 2 0 0 0 0 6" /><path d="M4 9a2 2 0 0 1 0 6" />
    </svg>
  ),
  MikroTik: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Packages: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, clientInfo, logout, isSuperAdmin } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const ADMIN_NAV = [
    { path: '/admin/dashboard', label: t('dashboard'), Icon: NavIcons.Dashboard },
    { path: '/admin/clients', label: t('clients'), Icon: NavIcons.Clients },
    { path: '/admin/routers', label: t('routers'), Icon: NavIcons.Routers },
    { path: '/admin/devices', label: t('devices'), Icon: NavIcons.Devices },
    { path: '/admin/payments', label: t('payments'), Icon: NavIcons.Payments },
    { path: '/admin/vouchers', label: t('vouchers'), Icon: NavIcons.Vouchers },
  ]

  const CLIENT_NAV = [
    { path: '/client/dashboard', label: t('dashboard'), Icon: NavIcons.Dashboard },
    { path: '/client/routers', label: t('routers'), Icon: NavIcons.Routers },
    { path: '/client/mikrotik', label: t('mikrotik_mgmt'), Icon: NavIcons.MikroTik },
    { path: '/client/packages', label: t('packages'), Icon: NavIcons.Packages },
    { path: '/client/vouchers', label: t('vouchers'), Icon: NavIcons.Vouchers },
    { path: '/client/payments', label: t('payments'), Icon: NavIcons.Payments },
  ]

  const navItems = isSuperAdmin ? ADMIN_NAV : CLIENT_NAV
  const initials = (user?.full_name || user?.username || 'NS').slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/netsafi2.png"
          alt="NetSafi"
          style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>NetSafi</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isSuperAdmin ? t('super_admin') : clientInfo?.business_name || t('client')}
          </div>
        </div>
      </div>

      {/* Lang switcher */}
      <div style={{ padding: '0.7rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
        <LanguageSwitcher dark={true} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path)
          const Ico = item.Icon
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: active ? '#fff' : 'rgba(255,255,255,0.5)', background: active ? 'rgba(99,102,241,0.2)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!active)(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active)(e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}><Ico /></span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1' }} />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name || user?.username}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{isSuperAdmin ? t('super_admin') : t('client')}</div>
          </div>
        </div>
        <button onClick={logout} style={{ padding: '7px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
          <NavIcons.Logout /> {t('logout')}
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Desktop Sidebar */}
      <aside style={{ width: 240, background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}
        className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setMobileOpen(false)}>
          <aside style={{ width: 240, height: '100%', background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.25s ease' }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile header */}
        <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-600)', padding: 4, display: 'flex', alignItems: 'center' }} aria-label="Menu">
            <NavIcons.Menu />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/netsafi2.png"
              alt="NetSafi"
              style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--gray-900)' }}>NetSafi</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <LanguageSwitcher dark={false} />
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .desktop-sidebar { display: flex !important; }
          header { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
