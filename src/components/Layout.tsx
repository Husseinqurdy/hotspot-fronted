import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang, LanguageSwitcher } from '../contexts/LangContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, clientInfo, logout, isSuperAdmin } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const ADMIN_NAV = [
    { path: '/admin/dashboard', label: t('dashboard'), icon: '▦' },
    { path: '/admin/clients', label: t('clients'), icon: '👥' },
    { path: '/admin/routers', label: t('routers'), icon: '📡' },
    { path: '/admin/devices', label: t('devices'), icon: '📱' },
    { path: '/admin/payments', label: t('payments'), icon: '💳' },
    { path: '/admin/vouchers', label: t('vouchers'), icon: '🎫' },
  ]

  const CLIENT_NAV = [
    { path: '/client/dashboard', label: t('dashboard'), icon: '▦' },
    { path: '/client/routers', label: t('routers'), icon: '📡' },
    { path: '/client/mikrotik', label: t('mikrotik_mgmt'), icon: '🔧' },
    { path: '/client/packages', label: t('packages'), icon: '📦' },
    { path: '/client/vouchers', label: t('vouchers'), icon: '🎫' },
    { path: '/client/payments', label: t('payments'), icon: '💳' },
  ]

  const navItems = isSuperAdmin ? ADMIN_NAV : CLIENT_NAV
  const initials = (user?.full_name || user?.username || 'NS').slice(0, 2).toUpperCase()

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white"/>
          </svg>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>NetSafi</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isSuperAdmin ? t('super_admin') : clientInfo?.business_name || t('client')}
          </div>
        </div>
      </div>

      {/* Lang switcher */}
      <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <LanguageSwitcher dark={true} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path)
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', color: active ? '#fff' : 'rgba(255,255,255,0.5)', background: active ? 'rgba(99,102,241,0.2)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!active)(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active)(e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
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
        <button onClick={logout} style={{ padding: '7px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
          🚪 {t('logout')}
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
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-600)', padding: 4 }} aria-label="Menu">☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white"/>
              </svg>
            </div>
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
      `}</style>
    </div>
  )
}
