import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'

// ── SVG ICONS ──────────────────────────────────────────────
const Icon = {
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  Routers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/><circle cx="8.5" cy="14.5" r="1" fill="currentColor"/><circle cx="12" cy="14.5" r="1" fill="currentColor"/><circle cx="15.5" cy="14.5" r="1" fill="currentColor"/></svg>,
  MikroTik: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Packages: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  Vouchers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M2 15v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><path d="M20 9a2 2 0 0 0 0 6"/><path d="M4 9a2 2 0 0 1 0 6"/></svg>,
  Payments: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Clients: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Devices: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  Logout: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ChevronLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Wifi: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M1.5 8.5C5.5 4.5 10.5 2.5 12 2.5C13.5 2.5 18.5 4.5 22.5 8.5"/><path d="M4.5 11.5C7.5 8.5 10 7 12 7C14 7 16.5 8.5 19.5 11.5"/><path d="M7.5 14.5C9.5 12.5 11 11.5 12 11.5C13 11.5 14.5 12.5 16.5 14.5"/><circle cx="12" cy="18" r="1.5" fill="white"/></svg>,
}

// ── LANGUAGE SWITCHER ──────────────────────────────────────
const LANGS = [
  { code: 'sw', label: 'Kiswahili', short: 'SW', flag: '🇹🇿' },
  { code: 'en', label: 'English',   short: 'EN', flag: '🇬🇧' },
]

function LangSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 10px', borderRadius: 9, cursor: 'pointer',
    border: dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #e5e7eb',
    background: dark ? 'rgba(255,255,255,0.08)' : '#f8fafc',
    color: dark ? '#e2e8f0' : '#374151',
    transition: 'all 0.18s',
    fontSize: 12, fontWeight: 700,
    flexShrink: 0,
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button style={btnStyle} onClick={() => setOpen(o => !o)}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.14)' : '#f1f5f9'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.08)' : '#f8fafc'}>
        <Icon.Globe />
        <span className="lang-short-label" style={{ fontSize: 11, letterSpacing: '0.05em' }}>{current.short}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }}>
          <Icon.ChevronDown />
        </span>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', zIndex: 200, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', minWidth: 160, width: 'max-content', maxWidth: 'calc(100vw - 24px)', animation: 'dropDown 0.18s ease' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code as any); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: lang === l.code ? '#eef2ff' : 'transparent', border: 'none', cursor: 'pointer', color: lang === l.code ? '#4338ca' : '#374151', fontSize: 13, fontWeight: lang === l.code ? 700 : 500, textAlign: 'left', transition: 'background 0.12s' }}
              onMouseEnter={e => { if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
              onMouseLeave={e => { if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span style={{ marginLeft: 'auto', color: '#6366f1' }}><Icon.Check /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── TOPBAR ─────────────────────────────────────────────────
function TopBar({ sidebarW, displayName, isAdmin, initials, onMenuClick }: { sidebarW: number; displayName: string; isAdmin: boolean; initials: string; onMenuClick: () => void }) {
  const { t } = useLang()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Page title from path
  const getTitle = () => {
    const path = location.pathname
    if (path.includes('dashboard')) return t('dashboard')
    if (path.includes('routers')) return t('routers')
    if (path.includes('mikrotik')) return 'Manage MikroTik'
    if (path.includes('packages')) return t('packages')
    if (path.includes('vouchers')) return t('vouchers')
    if (path.includes('payments')) return t('payments')
    if (path.includes('clients')) return t('clients')
    if (path.includes('devices')) return t('devices')
    return 'NetSafi'
  }

  return (
    <div className="layout-topbar" style={{ position: 'fixed', top: 0, left: sidebarW, right: 0, height: 60, background: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'left 0.25s ease', animation: 'topbarSlide 0.35s ease', boxSizing: 'border-box', gap: 10 }}>

      {/* Left - hamburger (mobile) + greeting + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <button className="mobile-menu-btn" onClick={onMenuClick}
          style={{ display: 'none', width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon.Menu />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span className="topbar-greeting-word">{t('welcome_client')}</span>, <span style={{ color: '#6366f1' }}>{displayName}</span>
            </h2>
          </div>
          <div className="topbar-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', opacity: 0.5, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getTitle()}</span>
          </div>
        </div>
      </div>

      {/* Right - actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Language */}
        <LangSwitcher />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', transition: 'all 0.18s', position: 'relative', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLElement).style.color = '#6366f1' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.color = '#6b7280' }}>
            <Icon.Bell />
            {/* Notification dot */}
            <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }} />
          </button>

          {notifOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, width: 'min(300px, calc(100vw - 24px))', zIndex: 200, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'dropDown 0.18s ease' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Notifications</span>
                <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ padding: '12px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#d1d5db' }}>
                  <Icon.Bell />
                </div>
                Hakuna notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.18s', minWidth: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div className="topbar-profile-text" style={{ textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{isAdmin ? 'Super Admin' : 'Client'}</div>
            </div>
            <div style={{ color: '#9ca3af', marginLeft: 2, flexShrink: 0 }}><Icon.ChevronDown /></div>
          </button>

          {profileOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, width: 'min(220px, calc(100vw - 24px))', zIndex: 200, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'dropDown 0.18s ease' }}>
              {/* Profile header */}
              <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  {initials}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{isAdmin ? 'Super Admin' : 'Client'}</div>
              </div>

              {/* Menu items */}
              {[
                { icon: <Icon.Settings />, label: 'Settings', action: () => {} },
              ].map((item, i) => (
                <button key={i} onClick={() => { item.action(); setProfileOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 13, fontWeight: 500, textAlign: 'left', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ color: '#6b7280' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />

              {/* Logout */}
              <button onClick={() => { logout(); navigate('/login'); setProfileOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'left', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <Icon.Logout />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN LAYOUT ────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, clientInfo, isSuperAdmin } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = isSuperAdmin
  const sidebarW = collapsed ? 64 : 220
  const TOPBAR_H = 60

  const adminLinks = [
    { to: '/admin/dashboard', label: t('dashboard'), icon: <Icon.Dashboard /> },
    { to: '/admin/clients',   label: t('clients'),   icon: <Icon.Clients /> },
    { to: '/admin/routers',   label: t('routers'),   icon: <Icon.Routers /> },
    { to: '/admin/devices',   label: t('devices'),   icon: <Icon.Devices /> },
    { to: '/admin/payments',  label: t('payments'),  icon: <Icon.Payments /> },
    { to: '/admin/vouchers',  label: t('vouchers'),  icon: <Icon.Vouchers /> },
  ]
  const clientLinks = [
    { to: '/client/dashboard', label: t('dashboard'),    icon: <Icon.Dashboard /> },
    { to: '/client/routers',   label: t('routers'),      icon: <Icon.Routers /> },
    { to: '/client/mikrotik',  label: 'Manage MikroTik', icon: <Icon.MikroTik /> },
    { to: '/client/packages',  label: t('packages'),     icon: <Icon.Packages /> },
    { to: '/client/vouchers',  label: t('vouchers'),     icon: <Icon.Vouchers /> },
    { to: '/client/payments',  label: t('payments'),     icon: <Icon.Payments /> },
  ]
  const links = isAdmin ? adminLinks : clientLinks

  const displayName = isAdmin ? (user?.username || 'Admin') : (clientInfo?.business_name || user?.username || '')
  const initials = (displayName?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)) || '?'

  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '18px 0' : '18px 16px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
          <Icon.Wifi />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>NetSafi</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Hotspot Management</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        {links.map((link, i) => {
          const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
          return (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, marginBottom: 2, background: active ? 'rgba(99,102,241,0.18)' : 'transparent', color: active ? '#a5b4fc' : 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s', position: 'relative', animationDelay: `${i * 0.04}s` }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' } }}>
              {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: '#6366f1', borderRadius: '0 3px 3px 0' }} />}
              <span style={{ color: active ? '#a5b4fc' : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>{link.icon}</span>
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom - only version tag (compact) */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div style={{ padding: '6px 8px', fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            v1.0.0
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <style>{`
        @keyframes dropDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sidebarIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes topbarSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes contentIn { from{opacity:0} to{opacity:1} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }

        .sidebar-link { transition: all 0.15s; }
        .layout-sidebar { animation: sidebarIn 0.35s ease; }
        .mobile-menu-btn { display: none; }

        /* Tablet & below */
        @media (max-width: 768px) {
          .layout-sidebar { display: none !important; }
          .layout-topbar { left: 0 !important; padding: 0 12px !important; }
          .layout-main { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }

        /* Small phones */
        @media (max-width: 480px) {
          .layout-topbar { height: 56px !important; gap: 6px !important; }
          .layout-main { padding-top: 56px !important; }
          .topbar-subtitle { display: none !important; }
          .topbar-profile-text { display: none !important; }
          .lang-short-label { display: none !important; }
        }

        /* Very small phones */
        @media (max-width: 360px) {
          .topbar-greeting-word { display: none !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="layout-sidebar" style={{ width: sidebarW, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, background: 'linear-gradient(180deg, #1e1b4b 0%, #13103a 100%)', zIndex: 40, transition: 'width 0.25s ease', overflow: 'hidden', boxShadow: '2px 0 20px rgba(0,0,0,0.15)' }}>
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          style={{ position: 'absolute', top: 20, right: -12, width: 24, height: 24, borderRadius: '50%', background: '#6366f1', border: '2px solid #13103a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 2px 8px rgba(99,102,241,0.5)' }}>
          <div style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
            <Icon.ChevronLeft />
          </div>
        </button>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, animation: 'overlayIn 0.2s ease' }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 240, maxWidth: '80vw', background: 'linear-gradient(180deg, #1e1b4b 0%, #13103a 100%)', animation: 'sidebarIn 0.25s ease', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Top Bar (hamburger inatunzwa ndani yake kwa mobile) */}
      <TopBar
        sidebarW={sidebarW}
        displayName={displayName}
        isAdmin={!!isAdmin}
        initials={initials}
        onMenuClick={() => setMobileOpen(true)}
      />

      {/* Main Content */}
      <main className="layout-main" style={{ marginLeft: sidebarW, flex: 1, minHeight: '100vh', paddingTop: TOPBAR_H, transition: 'margin-left 0.25s ease', animation: 'contentIn 0.4s ease' }}>
        {children}
      </main>
    </div>
  )
}
