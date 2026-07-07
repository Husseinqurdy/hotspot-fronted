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
  Analysis: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/><circle cx="7" cy="15" r="1" fill="currentColor"/><circle cx="11" cy="10" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/><circle cx="19" cy="6" r="1" fill="currentColor"/></svg>,
  Withdraw: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/><path d="M15 15l3 3 3-3"/><path d="M18 12v6"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ChevronLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
}

// ── TOOLTIP ICON BUTTON (used for Logout everywhere) ───────
function TooltipIconButton({
  icon, label, onClick, tone = 'danger', block = false,
}: { icon: React.ReactNode; label: string; onClick: () => void; tone?: 'danger' | 'neutral'; block?: boolean }) {
  const colors = tone === 'danger'
    ? { fg: '#ef4444', bg: '#fef2f2', bgHover: '#fee2e2', border: '#fecaca' }
    : { fg: '#374151', bg: '#f8fafc', bgHover: '#eef2ff', border: '#e5e7eb' }

  return (
    <div className="tooltip-wrap" style={{ position: 'relative', display: block ? 'block' : 'inline-flex', width: block ? '100%' : undefined }}>
      <button
        onClick={onClick}
        aria-label={label}
        className="tooltip-btn"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: block ? 'flex-start' : 'center',
          gap: 10, width: block ? '100%' : 38, height: 38,
          padding: block ? '0 12px' : 0,
          borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.bg,
          color: colors.fg, cursor: 'pointer', transition: 'all 0.18s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = colors.bgHover; (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = colors.bg; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      >
        {icon}
        {block && <span className="tooltip-inline-label" style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>}
      </button>
      {!block && <span className="tooltip-label">{label}</span>}
    </div>
  )
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
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.14)' : '#f1f5f9'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.08)' : '#f8fafc'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>
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

// ── TOPBAR (desktop only — hidden on small screens) ────────
function TopBar({ sidebarW, displayName, isAdmin, initials }: { sidebarW: number; displayName: string; isAdmin: boolean; initials: string }) {
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
    if (path.includes('analysis')) return 'Analysis'
    if (path.includes('withdraw')) return 'Withdraw'
    return 'NetSafi'
  }

  return (
    <div className="layout-topbar" style={{ position: 'fixed', top: 0, left: sidebarW, right: 0, height: 60, background: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'left 0.25s ease', animation: 'topbarSlide 0.4s cubic-bezier(0.22,1,0.36,1)', boxSizing: 'border-box', gap: 10 }}>

      {/* Left - greeting + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, overflow: 'hidden', animation: 'fadeSlideIn 0.45s ease 0.05s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span className="topbar-greeting-word">{t('welcome_client')}</span>, <span style={{ color: '#6366f1' }}>{displayName}</span>
            </h2>
          </div>
          <div className="topbar-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', animation: 'pulseDot 2s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getTitle()}</span>
          </div>
        </div>
      </div>

      {/* Right - actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        <div style={{ animation: 'fadeSlideIn 0.4s ease 0.1s both' }}>
          <LangSwitcher />
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative', animation: 'fadeSlideIn 0.4s ease 0.15s both' }}>
          <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', transition: 'all 0.18s', position: 'relative', flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLElement).style.color = '#6366f1'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>
            <Icon.Bell />
            <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff', animation: 'pulseDot 1.8s ease-in-out infinite' }} />
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
        <div ref={profileRef} style={{ position: 'relative', animation: 'fadeSlideIn 0.4s ease 0.2s both' }}>
          <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.18s', minWidth: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>
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
              <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  {initials}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{isAdmin ? 'Super Admin' : 'Client'}</div>
              </div>

              <button onClick={() => setProfileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 13, fontWeight: 500, textAlign: 'left', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span style={{ color: '#6b7280' }}><Icon.Settings /></span>
                Settings
              </button>

              <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />

              {/* Logout — icon only, tooltip on hover */}
              <div style={{ padding: '4px 16px 8px' }}>
                <TooltipIconButton
                  icon={<Icon.Logout />}
                  label="Logout"
                  onClick={() => { logout(); navigate('/login'); setProfileOpen(false) }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN LAYOUT ────────────────────────────────────────────
export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, clientInfo, isSuperAdmin, logout } = useAuth()
  const { t } = useLang()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false)

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
    { to: '/admin/analysis',  label: 'Analysis',     icon: <Icon.Analysis /> },
    { to: '/admin/withdraw',  label: 'Withdraw',     icon: <Icon.Withdraw /> },
  ]
  const clientLinks = [
    { to: '/client/dashboard', label: t('dashboard'),    icon: <Icon.Dashboard /> },
    { to: '/client/routers',   label: t('routers'),      icon: <Icon.Routers /> },
    { to: '/client/mikrotik',  label: 'Manage MikroTik', icon: <Icon.MikroTik /> },
    { to: '/client/packages',  label: t('packages'),     icon: <Icon.Packages /> },
    { to: '/client/vouchers',  label: t('vouchers'),     icon: <Icon.Vouchers /> },
    { to: '/client/payments',  label: t('payments'),     icon: <Icon.Payments /> },
    { to: '/client/analysis',  label: 'Analysis',        icon: <Icon.Analysis /> },
    { to: '/client/withdraw',  label: 'Withdraw',        icon: <Icon.Withdraw /> },
  ]
  const links = isAdmin ? adminLinks : clientLinks

  const displayName = isAdmin ? (user?.username || 'Admin') : (clientInfo?.business_name || user?.username || '')
  const initials = (displayName?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)) || '?'

  const Logo = ({ collapsedLogo }: { collapsedLogo: boolean }) => (
    <div style={{ padding: collapsedLogo ? '18px 0' : '18px 16px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsedLogo ? 'center' : 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 6 }}>
      <div className="netsafi-logo-wrap" style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.4)', overflow: 'hidden', animation: 'logoPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <img src="/netsafi2.png" alt="NetSafi" className="netsafi-logo-img" style={{ width: '78%', height: '78%', objectFit: 'contain', transition: 'transform 0.35s ease' }} />
      </div>
      {!collapsedLogo && (
        <div style={{ animation: 'fadeSlideIn 0.4s ease 0.1s both' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>NetSafi</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Hotspot Management</div>
        </div>
      )}
    </div>
  )

  const NavLinks = ({ collapsedNav, onNavigate }: { collapsedNav: boolean; onNavigate?: () => void }) => (
    <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
      {links.map((link, i) => {
        const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
        return (
          <Link key={link.to} to={link.to} onClick={onNavigate}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsedNav ? '10px 0' : '9px 12px', justifyContent: collapsedNav ? 'center' : 'flex-start', borderRadius: 10, marginBottom: 2, background: active ? 'rgba(99,102,241,0.18)' : 'transparent', color: active ? '#a5b4fc' : 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 0.15s', position: 'relative', animation: `navItemIn 0.3s ease ${i * 0.035}s both` }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0' } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)' } }}>
            {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: '#6366f1', borderRadius: '0 3px 3px 0' }} />}
            <span style={{ color: active ? '#a5b4fc' : 'rgba(255,255,255,0.45)', flexShrink: 0 }}>{link.icon}</span>
            {!collapsedNav && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.label}</span>}
          </Link>
        )
      })}
    </nav>
  )

  // Desktop sidebar (with collapse support, no topbar-content duplication)
  const DesktopSidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Logo collapsedLogo={collapsed} />
      <NavLinks collapsedNav={collapsed} />
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div style={{ padding: '6px 8px', fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            v1.0.0
          </div>
        )}
      </div>
    </div>
  )

  // Mobile sidebar — carries everything the topbar used to show
  const getMobileTitle = () => {
    const path = location.pathname
    if (path.includes('dashboard')) return t('dashboard')
    if (path.includes('routers')) return t('routers')
    if (path.includes('mikrotik')) return 'Manage MikroTik'
    if (path.includes('packages')) return t('packages')
    if (path.includes('vouchers')) return t('vouchers')
    if (path.includes('payments')) return t('payments')
    if (path.includes('clients')) return t('clients')
    if (path.includes('devices')) return t('devices')
    if (path.includes('analysis')) return 'Analysis'
    if (path.includes('withdraw')) return 'Withdraw'
    return 'NetSafi'
  }

  const MobileSidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Logo collapsedLogo={false} />

      {/* Greeting + page title (moved from topbar) */}
      <div style={{ padding: '4px 16px 12px', animation: 'fadeSlideIn 0.35s ease 0.05s both' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
          {t('welcome_client')}, <span style={{ color: '#a5b4fc' }}>{displayName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#818cf8', animation: 'pulseDot 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{getMobileTitle()}</span>
        </div>
      </div>

      {/* Quick actions: language + notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 14px', animation: 'fadeSlideIn 0.35s ease 0.1s both' }}>
        <LangSwitcher dark />
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMobileNotifOpen(o => !o)}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e2e8f0', position: 'relative', transition: 'all 0.18s' }}>
            <Icon.Bell />
            <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #1e1b4b', animation: 'pulseDot 1.8s ease-in-out infinite' }} />
          </button>
        </div>
      </div>

      {mobileNotifOpen && (
        <div style={{ margin: '0 16px 14px', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', animation: 'dropDown 0.18s ease' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Notifications</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Hakuna notifications</div>
        </div>
      )}

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 6px' }} />

      <NavLinks collapsedNav={false} onNavigate={() => setMobileOpen(false)} />

      {/* Profile + Logout (icon only, tooltip on hover/press) */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{isAdmin ? 'Super Admin' : 'Client'}</div>
        </div>
        <TooltipIconButton
          icon={<Icon.Logout />}
          label="Logout"
          onClick={() => { logout(); navigate('/login'); setMobileOpen(false) }}
        />
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <style>{`
        @keyframes dropDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sidebarIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes topbarSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes navItemIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes contentIn { from{opacity:0} to{opacity:1} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.55;transform:scale(1.25)} }
        @keyframes logoPop { from{opacity:0;transform:scale(0.6) rotate(-8deg)} to{opacity:1;transform:scale(1) rotate(0)} }

        .sidebar-link { transition: all 0.15s; }
        .layout-sidebar { animation: sidebarIn 0.35s ease; }
        .mobile-menu-btn { display: none; }

        .netsafi-logo-wrap:hover .netsafi-logo-img { transform: scale(1.15) rotate(-4deg); }

        /* Tooltip for icon-only buttons (e.g. Logout) */
        .tooltip-wrap .tooltip-label {
          position: absolute; top: 50%; left: calc(100% + 8px); transform: translateY(-50%) translateX(-4px);
          background: #111827; color: #fff; font-size: 11px; font-weight: 600;
          padding: 5px 9px; border-radius: 6px; white-space: nowrap;
          opacity: 0; pointer-events: none; transition: opacity 0.15s ease, transform 0.15s ease;
          z-index: 50;
        }
        .tooltip-wrap .tooltip-label::before {
          content: ''; position: absolute; top: 50%; right: 100%; transform: translateY(-50%);
          border: 5px solid transparent; border-right-color: #111827;
        }
        .tooltip-wrap:hover .tooltip-label { opacity: 1; transform: translateY(-50%) translateX(0); }

        /* Tablet & below: hide desktop topbar + desktop sidebar entirely */
        @media (max-width: 768px) {
          .layout-sidebar { display: none !important; }
          .layout-topbar { display: none !important; }
          .layout-main { margin-left: 0 !important; padding-top: 20px !important; }
          .mobile-fab { display: flex !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="layout-sidebar" style={{ width: sidebarW, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, background: 'linear-gradient(180deg, #1e1b4b 0%, #13103a 100%)', zIndex: 40, transition: 'width 0.25s ease', overflow: 'hidden', boxShadow: '2px 0 20px rgba(0,0,0,0.15)' }}>
        <button onClick={() => setCollapsed(c => !c)}
          style={{ position: 'absolute', top: 20, right: -12, width: 24, height: 24, borderRadius: '50%', background: '#6366f1', border: '2px solid #13103a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 2px 8px rgba(99,102,241,0.5)', transition: 'transform 0.18s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
          <div style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
            <Icon.ChevronLeft />
          </div>
        </button>
        <DesktopSidebar />
      </div>

      {/* Floating hamburger — mobile only (topbar is hidden on mobile) */}
      <button
        className="mobile-fab"
        onClick={() => setMobileOpen(true)}
        style={{ display: 'none', position: 'fixed', top: 14, left: 14, width: 44, height: 44, borderRadius: 12, background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', zIndex: 90, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
      >
        <Icon.Menu />
      </button>

      {/* Mobile sidebar overlay (drawer holds everything the topbar used to show) */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, animation: 'overlayIn 0.2s ease' }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, maxWidth: '85vw', background: 'linear-gradient(180deg, #1e1b4b 0%, #13103a 100%)', animation: 'sidebarIn 0.25s ease', boxShadow: '4px 0 24px rgba(0,0,0,0.3)', overflowY: 'auto' }}>
            <MobileSidebar />
          </div>
        </div>
      )}

      {/* Top Bar — desktop only */}
      <TopBar
        sidebarW={sidebarW}
        displayName={displayName}
        isAdmin={!!isAdmin}
        initials={initials}
      />

      {/* Main Content */}
      <main className="layout-main" style={{ marginLeft: sidebarW, flex: 1, minHeight: '100vh', paddingTop: TOPBAR_H, transition: 'margin-left 0.25s ease', animation: 'contentIn 0.4s ease' }}>
        {children}
      </main>
    </div>
  )
}
