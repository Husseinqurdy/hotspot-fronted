import { useEffect, useState, useRef, type ReactNode } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import { Card, CardHeader, Badge, Button, Table, Alert, Tabs, Spinner, ConfirmDialog, Input, FormActions, PageHeader } from '../components/UI'
import { useLang } from '../contexts/LangContext'

// ════════════════════════════════════════════════════════
// REAL SVG ICON SET (replaces every emoji in this file)
// ════════════════════════════════════════════════════════
type IconProps = { size?: number }
const svgBase = (children: ReactNode, { size = 15 }: IconProps = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const Icons = {
  Server: (p?: IconProps) => svgBase(<><rect x="2" y="3" width="20" height="7" rx="1.5" /><rect x="2" y="14" width="20" height="7" rx="1.5" /><line x1="6" y1="6.5" x2="6.01" y2="6.5" /><line x1="6" y1="17.5" x2="6.01" y2="17.5" /></>, p),
  Clipboard: (p?: IconProps) => svgBase(<><rect x="6" y="3" width="12" height="18" rx="2" /><rect x="9" y="1.5" width="6" height="3.5" rx="1" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /></>, p),
  User: (p?: IconProps) => svgBase(<><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.5-4 4-6 7.5-6s6 2 7.5 6" /></>, p),
  Circle: (p?: IconProps) => svgBase(<circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" />, p),
  Monitor: (p?: IconProps) => svgBase(<><rect x="2.5" y="4" width="19" height="13" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>, p),
  Link: (p?: IconProps) => svgBase(<><path d="M9 15l6-6" /><path d="M13 5.5l1-1a3.5 3.5 0 015 5l-1 1" /><path d="M11 18.5l-1 1a3.5 3.5 0 01-5-5l1-1" /></>, p),
  Globe: (p?: IconProps) => svgBase(<><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a13 13 0 013 9 13 13 0 01-3 9 13 13 0 01-3-9 13 13 0 013-9z" /></>, p),
  Globe2: (p?: IconProps) => svgBase(<><circle cx="12" cy="12" r="9" /><path d="M3 9h18M3 15h18" /><path d="M12 3c2.2 2.4 3.4 5.6 3.4 9s-1.2 6.6-3.4 9c-2.2-2.4-3.4-5.6-3.4-9S9.8 5.4 12 3z" /></>, p),
  Cookie: (p?: IconProps) => svgBase(<><path d="M12 2.5a9.5 9.5 0 109.5 9.5 4 4 0 01-4-4 4 4 0 01-4-4 4 4 0 01-1.5-1.5z" /><circle cx="9" cy="10" r=".7" fill="currentColor" /><circle cx="13" cy="14" r=".7" fill="currentColor" /><circle cx="9.5" cy="15" r=".7" fill="currentColor" /></>, p),
  Clock: (p?: IconProps) => svgBase(<><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></>, p),
  Terminal: (p?: IconProps) => svgBase(<><rect x="2.5" y="4" width="19" height="16" rx="2" /><polyline points="7 9 10.5 12 7 15" /><line x1="12.5" y1="15" x2="17" y2="15" /></>, p),
  Edit: (p?: IconProps) => svgBase(<><path d="M11 4H4.5a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2V13" /><path d="M18.5 2.5a2.1 2.1 0 013 3L11 16l-4 1 1-4z" /></>, p),
  Trash: (p?: IconProps) => svgBase(<><polyline points="3.5 6 5.2 6 20.5 6" /><path d="M8.5 6V4a1.5 1.5 0 011.5-1.5h4A1.5 1.5 0 0115.5 4v2" /><path d="M6.5 6l1 14a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5l1-14" /><line x1="10" y1="10.5" x2="10" y2="17" /><line x1="14" y1="10.5" x2="14" y2="17" /></>, p),
  Plus: (p?: IconProps) => svgBase(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, p),
  Save: (p?: IconProps) => svgBase(<><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v6h8V3" /><path d="M7 21v-7h10v7" /></>, p),
  X: (p?: IconProps) => svgBase(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, p),
  Refresh: (p?: IconProps) => svgBase(<><path d="M3.5 12a8.5 8.5 0 0114.5-6" /><polyline points="18.5 2 18.5 6.5 14 6.5" /><path d="M20.5 12a8.5 8.5 0 01-14.5 6" /><polyline points="5.5 22 5.5 17.5 10 17.5" /></>, p),
  Settings: (p?: IconProps) => svgBase(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>, p),
  Search: (p?: IconProps) => svgBase(<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>, p),
  Check: (p?: IconProps) => svgBase(<polyline points="20 6 9 17 4 12" />, p),
  CheckSquare: (p?: IconProps) => svgBase(<><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>, p),
  Eye: (p?: IconProps) => svgBase(<><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" /></>, p),
  Lock: (p?: IconProps) => svgBase(<><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M7.5 10.5V7a4.5 4.5 0 019 0v3.5" /></>, p),
  Play: (p?: IconProps) => svgBase(<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />, p),
  Pause: (p?: IconProps) => svgBase(<><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /></>, p),
  Info: (p?: IconProps) => svgBase(<><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16.5" /><circle cx="12" cy="7.5" r=".9" fill="currentColor" stroke="none" /></>, p),
  Bulb: (p?: IconProps) => svgBase(<><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6.5 6.5 0 00-3.8 11.8c.6.5 1 1.2 1 2.2h5.6c0-1 .4-1.7 1-2.2A6.5 6.5 0 0012 3z" /></>, p),
  ArrowLeft: (p?: IconProps) => svgBase(<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>, p),
  Router: (p?: IconProps) => svgBase(<><rect x="2.5" y="9.5" width="19" height="8" rx="2" /><line x1="7" y1="13.5" x2="7.01" y2="13.5" /><line x1="10.5" y1="13.5" x2="10.51" y2="13.5" /><path d="M7 9.5V6a2 2 0 012-2h6a2 2 0 012 2v3.5" /><line x1="16" y1="13.5" x2="19" y2="13.5" /></>, p),
  Shield: (p?: IconProps) => svgBase(<path d="M12 2.5l8 3.5v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6z" />, p),
  Zap: (p?: IconProps) => svgBase(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />, p),
}

// ════════════════════════════════════════════════════════
// TOOLTIP — small label that appears on hover / focus
// ════════════════════════════════════════════════════════
function Tooltip({ label, children, side = 'top' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' }) {
  const [show, setShow] = useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            [side === 'top' ? 'bottom' : 'top']: 'calc(100% + 7px)',
            background: '#1e293b',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '5px 9px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            zIndex: 50,
            pointerEvents: 'none',
            animation: 'tooltipIn 0.12s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  )
}

// ════════════════════════════════════════════════════════
// ICON BUTTON — icon-only action, label shown on hover (tooltip)
// ════════════════════════════════════════════════════════
type IBVariant = 'ghost' | 'danger' | 'success' | 'warning' | 'primary'
const IB_COLORS: Record<IBVariant, { color: string; hoverBg: string; hoverColor: string }> = {
  ghost:   { color: 'var(--gray-500)', hoverBg: 'var(--gray-100)', hoverColor: 'var(--gray-800)' },
  danger:  { color: '#ef4444', hoverBg: '#fee2e2', hoverColor: '#b91c1c' },
  success: { color: '#10b981', hoverBg: '#d1fae5', hoverColor: '#047857' },
  warning: { color: '#f59e0b', hoverBg: '#fef3c7', hoverColor: '#b45309' },
  primary: { color: 'var(--primary)', hoverBg: 'var(--primary-light)', hoverColor: 'var(--primary-dark)' },
}
function IconButton({ icon, label, onClick, variant = 'ghost', size = 30, disabled = false }: {
  icon: ReactNode; label: string; onClick?: () => void; variant?: IBVariant; size?: number; disabled?: boolean
}) {
  const c = IB_COLORS[variant]
  const [hover, setHover] = useState(false)
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: size, height: size, minWidth: size,
          borderRadius: 8, border: 'none',
          background: hover && !disabled ? c.hoverBg : 'transparent',
          color: hover && !disabled ? c.hoverColor : c.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'background 0.15s, color 0.15s, transform 0.1s',
          transform: hover && !disabled ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

type Tab =
  | 'servers'
  | 'server_profiles'
  | 'users'
  | 'active'
  | 'hosts'
  | 'ip_bindings'
  | 'walled_garden'
  | 'walled_garden_ip'
  | 'cookies'
  | 'scheduler'
  | 'terminal'

const ENDPOINTS: Record<Exclude<Tab, 'terminal'>, string> = {
  servers:          'hotspot/servers/',
  server_profiles:  'hotspot/profiles/',
  users:            'hotspot/users/',
  active:           'hotspot/sessions/',
  hosts:            'hotspot/hosts/',
  ip_bindings:      'hotspot/ip-bindings/',
  walled_garden:    'hotspot/walled-garden/',
  walled_garden_ip: 'hotspot/walled-garden-ip/',
  cookies:          'hotspot/cookies/',
  scheduler:        'scheduler/',
}

// Tab metadata stores translation KEYS from LangContext, resolved with t(labelKey) at render time.
const ALL_TABS = [
  { key: 'servers',          labelKey: 'mt_hotspot_servers',  icon: <Icons.Server size={14} /> },
  { key: 'server_profiles',  labelKey: 'mt_server_profiles',  icon: <Icons.Clipboard size={14} /> },
  { key: 'users',            labelKey: 'hotspot_users',       icon: <Icons.User size={14} /> },
  { key: 'active',           labelKey: 'active_sessions',     icon: <Icons.Circle size={9} /> },
  { key: 'hosts',            labelKey: 'mt_hosts_title',      icon: <Icons.Monitor size={14} /> },
  { key: 'ip_bindings',      labelKey: 'mt_ip_bindings',      icon: <Icons.Link size={14} /> },
  { key: 'walled_garden',    labelKey: 'mt_walled_garden',    icon: <Icons.Globe size={14} /> },
  { key: 'walled_garden_ip', labelKey: 'mt_walled_garden_ip', icon: <Icons.Globe2 size={14} /> },
  { key: 'cookies',          labelKey: 'mt_cookies',          icon: <Icons.Cookie size={14} /> },
  { key: 'scheduler',        labelKey: 'mt_scheduler',        icon: <Icons.Clock size={14} /> },
  { key: 'terminal',         labelKey: 'mt_terminal_tab',     icon: <Icons.Terminal size={14} /> },
] as const

function DetailRow({ label, value, mono = false, full = false }: {
  label: string; value: any; mono?: boolean; full?: boolean
}) {
  if (!value && value !== 0 && value !== false) return null
  return (
    <div className="mtk-detail-row" style={{
      display: 'flex',
      flexDirection: full ? 'column' : 'row',
      justifyContent: full ? undefined : 'space-between',
      alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: '1px solid var(--gray-50)',
      gap: full ? 4 : 8,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, minWidth: full ? undefined : 140, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, color: 'var(--gray-800)', fontFamily: mono ? 'monospace' : undefined,
        wordBreak: 'break-all', textAlign: full ? 'left' : 'right', minWidth: 0,
      }}>
        {value}
      </span>
    </div>
  )
}

function EditRow({ label, name, value, onChange, mono = false, type = 'text', placeholder = '' }: {
  label: string; name: string; value: string
  onChange: (name: string, value: string) => void
  mono?: boolean; type?: string; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <input
        type={type} value={value ?? ''} placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{ padding: '7px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 7, fontSize: 13, fontFamily: mono ? 'monospace' : undefined, outline: 'none', color: 'var(--gray-800)', background: '#fff', transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
        onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
      />
    </div>
  )
}

function EditSelectRow({ label, name, value, options, onChange }: {
  label: string; name: string; value: string
  options: { value: string; label: string }[]
  onChange: (name: string, value: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <select value={value ?? ''} onChange={e => onChange(name, e.target.value)}
        style={{ padding: '7px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 7, fontSize: 13, outline: 'none', color: 'var(--gray-800)', background: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function EditTextareaRow({ label, name, value, onChange, placeholder = '', minHeight = 100 }: {
  label: string; name: string; value: string
  onChange: (name: string, value: string) => void
  placeholder?: string; minHeight?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <textarea value={value ?? ''} placeholder={placeholder} onChange={e => onChange(name, e.target.value)}
        style={{ padding: '8px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 7, fontSize: 12, fontFamily: 'monospace', outline: 'none', color: 'var(--gray-800)', background: '#fff', resize: 'vertical', minHeight, lineHeight: 1.6, transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
        onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
      />
    </div>
  )
}

function DetailTabs({ tabs, active, onChange }: {
  tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void
}) {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid var(--gray-100)', marginBottom: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{ padding: '8px 16px', border: 'none', background: 'none', fontSize: 13, fontWeight: active === t.key ? 700 : 500, color: active === t.key ? 'var(--primary)' : 'var(--gray-500)', borderBottom: active === t.key ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function EditModeToggle({ editing, onToggle }: { editing: boolean; onToggle: () => void }) {
  const { t } = useLang()
  return (
    <Tooltip label={editing ? t('mt_view_tooltip') : t('mt_edit_tooltip')}>
      <button onClick={onToggle}
        style={{ padding: '4px 10px', borderRadius: 7, border: `1.5px solid ${editing ? 'var(--primary)' : 'var(--gray-200)'}`, background: editing ? 'var(--primary-light)' : '#fff', color: editing ? 'var(--primary-dark)' : 'var(--gray-500)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {editing ? <Icons.Eye size={13} /> : <Icons.Edit size={13} />} {editing ? t('view') : t('edit')}
      </button>
    </Tooltip>
  )
}

// ════════════════════════════════════════════════════════
// TERMINAL COMPONENT
// ════════════════════════════════════════════════════════
interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'info'
  text: string
  timestamp: string
}

// Quick command definitions carry translation KEYS (categoryKey / labelKey),
// resolved via t(key) at render time inside the component.
const QUICK_COMMANDS: { categoryKey: string; icon: ReactNode; commands: { labelKey: string; cmd: string; params: Record<string, string> }[] }[] = [
  {
    categoryKey: 'mt_cat_system',
    icon: <Icons.Settings size={14} />,
    commands: [
      { labelKey: 'mt_cmd_clock_tz', cmd: '/system/clock/print', params: {} },
      { labelKey: 'mt_cmd_set_tz_nairobi', cmd: '/system/clock/set', params: { 'time-zone-name': 'Africa/Nairobi' } },
      { labelKey: 'mt_cmd_sys_resources', cmd: '/system/resource/print', params: {} },
      { labelKey: 'mt_cmd_router_identity', cmd: '/system/identity/print', params: {} },
      { labelKey: 'mt_cmd_routeros_version', cmd: '/system/routerboard/print', params: {} },
    ]
  },
  {
    categoryKey: 'mt_cat_hotspot',
    icon: <Icons.Router size={14} />,
    commands: [
      { labelKey: 'mt_cmd_hotspot_users_count', cmd: '/ip/hotspot/user/print', params: {} },
      { labelKey: 'active_sessions', cmd: '/ip/hotspot/active/print', params: {} },
      { labelKey: 'mt_cmd_all_schedulers', cmd: '/system/scheduler/print', params: {} },
      { labelKey: 'mt_hotspot_servers', cmd: '/ip/hotspot/print', params: {} },
    ]
  },
  {
    categoryKey: 'mt_cat_network',
    icon: <Icons.Globe size={14} />,
    commands: [
      { labelKey: 'ip_addresses', cmd: '/ip/address/print', params: {} },
      { labelKey: 'interfaces', cmd: '/interface/print', params: {} },
      { labelKey: 'mt_cmd_dns_settings', cmd: '/ip/dns/print', params: {} },
      { labelKey: 'mt_cmd_routes', cmd: '/ip/route/print', params: {} },
    ]
  },
]

function MikroTikTerminal({ routerId }: { routerId: number }) {
  const { t } = useLang()
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: t('mt_term_ready'), timestamp: new Date().toLocaleTimeString('sw-TZ') },
    { type: 'info', text: t('mt_term_intro'), timestamp: '' },
    { type: 'info', text: '─────────────────────────────────────────────────────', timestamp: '' },
  ])
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [activeCategory, setActiveCategory] = useState('mt_cat_system')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const now = () => new Date().toLocaleTimeString('sw-TZ')

  const scrollBottom = () => {
    setTimeout(() => {
      if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }, 50)
  }

  const addLine = (line: TerminalLine) => {
    setLines(prev => [...prev, line])
    scrollBottom()
  }

  const addLines = (newLines: TerminalLine[]) => {
    setLines(prev => [...prev, ...newLines])
    scrollBottom()
  }

  const formatResult = (result: any): string => {
    if (!result) return `(${t('mt_no_results')})`
    if (typeof result === 'string') return result
    if (Array.isArray(result)) {
      if (result.length === 0) return `(${t('mt_empty_list')})`
      return result.map((item: any, i: number) => {
        if (typeof item === 'object') {
          const rows = Object.entries(item)
            .filter(([k]) => !k.startsWith('.'))
            .map(([k, v]) => `  ${k.padEnd(24)}: ${v}`)
            .join('\n')
          return `[${i}]\n${rows}`
        }
        return String(item)
      }).join('\n\n')
    }
    if (typeof result === 'object') {
      return Object.entries(result)
        .map(([k, v]) => `  ${k.padEnd(24)}: ${v}`)
        .join('\n')
    }
    return String(result)
  }

  const runCommand = async (cmd: string, params: Record<string, string> = {}) => {
    if (running) return
    const ts = now()
    addLine({ type: 'input', text: `> ${cmd}${Object.keys(params).length ? ' ' + JSON.stringify(params) : ''}`, timestamp: ts })
    setRunning(true)
    try {
      const res = await api.post(`/mikrotik/${routerId}/terminal/`, { command: cmd, params })
      const data = res.data
      if (data.success) {
        const formatted = formatResult(data.result)
        const outputLines: TerminalLine[] = formatted.split('\n').map((line: string, i: number) => ({
          type: 'output' as const,
          text: line,
          timestamp: i === 0 ? now() : '',
        }))
        if (data.count > 0) {
          outputLines.unshift({ type: 'info' as const, text: `✓ ${t('mt_results_label')}: ${data.count} ${t('mt_items_label')}`, timestamp: '' })
        }
        addLines(outputLines)
      } else {
        addLine({ type: 'error', text: `✗ ${data.error || t('mt_command_failed')}`, timestamp: now() })
      }
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || t('mt_connection_error')
      addLine({ type: 'error', text: `✗ ${msg}`, timestamp: now() })
    } finally {
      setRunning(false)
      addLine({ type: 'info', text: '─────────────────────────────────────────────────────', timestamp: '' })
      inputRef.current?.focus()
    }
  }

  const handleSubmit = () => {
    const raw = input.trim()
    if (!raw) return
    setHistory(prev => [raw, ...prev.slice(0, 49)])
    setHistoryIdx(-1)
    setInput('')

    // Gawanya command na params — mfano: /system/clock/set {"time-zone-autodetect":"true"}
    const jsonMatch = raw.match(/^(\S+)\s+(\{.+\})$/)
    if (jsonMatch) {
      try {
        const cmd = jsonMatch[1]
        const params = JSON.parse(jsonMatch[2]) as Record<string, string>
        runCommand(cmd, params)
        return
      } catch {
        // JSON si sahihi — endelea na command nzima
      }
    }
    runCommand(raw)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleSubmit(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(historyIdx + 1, history.length - 1)
      setHistoryIdx(idx)
      setInput(history[idx] || '')
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(historyIdx - 1, -1)
      setHistoryIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([{ type: 'info', text: t('mt_terminal_cleared'), timestamp: now() }])
    }
  }

  const clearTerminal = () => {
    setLines([{ type: 'info', text: t('mt_terminal_cleared_ready'), timestamp: now() }])
  }

  const lineColor = (type: TerminalLine['type']) => {
    if (type === 'input') return '#60a5fa'
    if (type === 'error') return '#f87171'
    if (type === 'info') return '#6b7280'
    return '#86efac'
  }

  const currentCategory = QUICK_COMMANDS.find(c => c.categoryKey === activeCategory)

  return (
    <div className="mt-terminal-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem', alignItems: 'start' }}>
      <style>{`
        @media (max-width: 720px) {
          .mt-terminal-grid { grid-template-columns: 1fr !important; }
          .mt-terminal-screen { min-width: 0 !important; }
        }
      `}</style>
      {/* Quick Commands Sidebar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-100)', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '10px 14px', background: 'var(--primary-light)', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Zap size={13} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)' }}>{t('mt_quick_commands')}</div>
        </div>
        {/* Category tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-100)' }}>
          {QUICK_COMMANDS.map(cat => (
            <button key={cat.categoryKey} onClick={() => setActiveCategory(cat.categoryKey)}
              style={{ flex: 1, padding: '7px 4px', border: 'none', background: activeCategory === cat.categoryKey ? 'var(--primary-light)' : '#fff', color: activeCategory === cat.categoryKey ? 'var(--primary-dark)' : 'var(--gray-500)', fontSize: 10, fontWeight: 700, cursor: 'pointer', borderBottom: activeCategory === cat.categoryKey ? '2px solid var(--primary)' : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s' }}>
              {cat.icon}
              <div>{t(cat.categoryKey)}</div>
            </button>
          ))}
        </div>
        {/* Commands list */}
        <div style={{ padding: '6px 0' }}>
          {currentCategory?.commands.map((cmd, i) => (
            <button key={i} onClick={() => runCommand(cmd.cmd, cmd.params)} disabled={running}
              style={{ width: '100%', textAlign: 'left', padding: '8px 14px', border: 'none', background: 'none', fontSize: 12, color: running ? 'var(--gray-300)' : 'var(--gray-700)', cursor: running ? 'not-allowed' : 'pointer', lineHeight: 1.4, transition: 'background 0.1s' }}
              onMouseEnter={e => { if (!running) (e.currentTarget as HTMLElement).style.background = '#f0f4ff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
              {t(cmd.labelKey)}
            </button>
          ))}
        </div>
        {/* Help */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--gray-100)', background: '#fafafa' }}>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--gray-500)' }}>{t('mt_keyboard_label')}</strong><br />
            ↑↓ — {t('mt_history')}<br />
            Enter — {t('mt_run_hint')}<br />
            Ctrl+L — {t('mt_clear_hint')}
          </div>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="mt-terminal-screen" style={{ background: '#0f172a', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', minWidth: 0 }}>
        {/* Title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#1e293b', borderBottom: '1px solid #334155', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>MikroTik Terminal</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {running && (
              <span style={{ fontSize: 11, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'livepulse 0.8s infinite' }} />
                {t('mt_executing')}
              </span>
            )}
            <Tooltip label={t('mt_clear_screen_tooltip')}>
              <button onClick={clearTerminal}
                style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #334155', background: 'none', color: '#94a3b8', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                <Icons.Trash size={12} /> {t('mt_clear')}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Output area */}
        <div ref={terminalRef}
          style={{ height: 380, overflowY: 'auto', overflowX: 'auto', padding: '12px 16px', fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.7, cursor: 'text' }}
          onClick={() => inputRef.current?.focus()}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {line.timestamp && (
                <span style={{ fontSize: 10, color: '#334155', flexShrink: 0, marginTop: 3 }}>{line.timestamp}</span>
              )}
              {!line.timestamp && <span style={{ fontSize: 10, color: 'transparent', flexShrink: 0, marginTop: 3 }}>00:00:00</span>}
              <span style={{ color: lineColor(line.type), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.text}</span>
            </div>
          ))}
          {running && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#60a5fa', marginTop: 4 }}>
              <span style={{ animation: 'pulse 1s infinite' }}>▌</span>
              <span style={{ fontSize: 12 }}>{t('mt_waiting_response')}</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#1e293b', borderTop: '1px solid #334155', gap: 10 }}>
          <span style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: 14, flexShrink: 0 }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={running}
            placeholder={t('mt_command_placeholder')}
            style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontFamily: "'Courier New', monospace", fontSize: 13, caretColor: '#60a5fa' }}
            autoFocus
          />
          <button onClick={handleSubmit} disabled={running || !input.trim()}
            style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: running || !input.trim() ? '#334155' : '#3b82f6', color: running || !input.trim() ? '#64748b' : '#fff', fontSize: 12, fontWeight: 700, cursor: running || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: 'monospace', transition: 'background 0.15s', flexShrink: 0 }}>
            {t('mt_run_btn')} ↵
          </button>
        </div>

        {/* Footer hint */}
        <div style={{ padding: '5px 16px 8px', background: '#0f172a', display: 'flex', gap: 16, flexWrap: 'wrap', overflowX: 'auto' }}>
          {[
            { k: '/system/clock/print', l: 'clock' },
            { k: '/ip/address/print', l: 'ip' },
            { k: '/interface/print', l: 'interfaces' },
            { k: '/system/resource/print', l: 'resources' },
          ].map(hint => (
            <button key={hint.k} onClick={() => { setInput(hint.k); inputRef.current?.focus() }}
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', padding: 0, textDecoration: 'underline dotted', whiteSpace: 'nowrap' }}>
              {hint.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// DETAIL MODAL: Server Profile
// ════════════════════════════════════════════════════════
function ServerProfileDetailModal({ profile, routerId, onClose, onSaved }: {
  profile: any; routerId: number; onClose: () => void; onSaved: () => void
}) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ ...profile })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)

  const handleChange = (name: string, value: string) => { setForm(prev => ({ ...prev, [name]: value })); setDirty(true) }

  const handleApply = async () => {
    setSaving(true)
    try {
      await api.patch(`/mikrotik/${routerId}/hotspot/profiles/`, { profile_name: profile.name, ...form })
      setAlert({ type: 'success', msg: `${t('th_profile')} ${t('updated_success')} ✓` }); setDirty(false); onSaved()
    } catch (e: any) { setAlert({ type: 'error', msg: e.response?.data?.error || t('mt_save_generic_failed') }) }
    finally { setSaving(false) }
  }

  const handleOK = async () => { if (dirty) await handleApply(); onClose() }

  const tabs = [{ key: 'general', label: t('mt_tab_general') }, { key: 'scripts', label: t('mt_tab_scripts') }]

  return (
    <div className="mtk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="mtk-modal-box" style={{ background: '#fff', borderRadius: 14, maxWidth: 520, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
        <div className="mtk-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Icons.Clipboard size={16} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{t('mt_profile_modal_title')}</div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 2, wordBreak: 'break-all' }}>{profile.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
            <IconButton icon={<Icons.X size={14} />} label={t('close')} onClick={onClose} />
          </div>
        </div>
        {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          {activeTab === 'general' && (
            editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <EditRow label={t('th_name')} name="name" value={form.name} onChange={handleChange} mono />
                <EditRow label={t('th_rate_limit')} name="rate-limit" value={form['rate-limit']} onChange={handleChange} mono placeholder="e.g. 2M/2M" />
                <EditRow label={t('th_session_timeout')} name="session-timeout" value={form['session-timeout']} onChange={handleChange} placeholder="e.g. 1h / unlimited" />
                <EditRow label={t('mt_lbl_idle_timeout')} name="idle-timeout" value={form['idle-timeout']} onChange={handleChange} placeholder="e.g. 30m / unlimited" />
                <EditRow label={t('mt_lbl_keepalive_timeout')} name="keepalive-timeout" value={form['keepalive-timeout']} onChange={handleChange} />
                <EditRow label={t('th_shared_users')} name="shared-users" value={form['shared-users']} onChange={handleChange} type="number" placeholder="1" />
                <EditRow label={t('mt_lbl_dns_name')} name="dns-name" value={form['dns-name']} onChange={handleChange} />
                <EditRow label={t('mt_lbl_html_directory')} name="html-directory" value={form['html-directory']} onChange={handleChange} mono />
                <EditRow label={t('mt_lbl_http_cookie_lifetime')} name="http-cookie-lifetime" value={form['http-cookie-lifetime']} onChange={handleChange} />
                <EditRow label={t('mt_lbl_status_autorefresh')} name="status-autorefresh" value={form['status-autorefresh']} onChange={handleChange} />
                <EditRow label={t('mt_lbl_address_pool')} name="address-pool" value={form['address-pool']} onChange={handleChange} />
                <EditRow label={t('mt_lbl_mac_cookie_timeout')} name="mac-cookie-timeout" value={form['mac-cookie-timeout']} onChange={handleChange} />
              </div>
            ) : (
              <div>
                <DetailRow label={t('th_name')} value={form.name} mono />
                <DetailRow label={t('th_rate_limit')} value={form['rate-limit'] || t('th_unlimited')} mono />
                <DetailRow label={t('th_session_timeout')} value={form['session-timeout'] || t('th_unlimited')} />
                <DetailRow label={t('mt_lbl_idle_timeout')} value={form['idle-timeout'] || t('th_unlimited')} />
                <DetailRow label={t('mt_lbl_keepalive_timeout')} value={form['keepalive-timeout'] || '—'} />
                <DetailRow label={t('th_shared_users')} value={form['shared-users'] || '1'} />
                <DetailRow label={t('mt_lbl_dns_name')} value={form['dns-name'] || '—'} />
                <DetailRow label={t('mt_lbl_html_directory')} value={form['html-directory'] || '—'} mono />
                <DetailRow label={t('mt_lbl_http_cookie_lifetime')} value={form['http-cookie-lifetime'] || '—'} />
                <DetailRow label={t('mt_lbl_status_autorefresh')} value={form['status-autorefresh'] || '—'} />
                <DetailRow label={t('mt_lbl_transparent_proxy')} value={form['transparent-proxy'] || '—'} />
                <DetailRow label={t('mt_lbl_address_pool')} value={form['address-pool'] || '—'} />
                <DetailRow label={t('mt_lbl_mac_cookie_timeout')} value={form['mac-cookie-timeout'] || '—'} />
              </div>
            )
          )}
          {activeTab === 'scripts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: t('mt_on_login'), key: 'on-login' }, { label: t('mt_on_logout'), key: 'on-logout' }].map(({ label, key }) => (
                <div key={key}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>{label}</div>
                  {editing ? (
                    <EditTextareaRow label={label} name={key} value={form[key] || ''} onChange={handleChange} placeholder={`# ${label}`} minHeight={120} />
                  ) : (
                    form[key] ? (
                      <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '10px 14px', overflowX: 'auto' }}>
                        <pre style={{ fontSize: 12, color: '#e0e7ff', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>{form[key]}</pre>
                      </div>
                    ) : (
                      <div style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>{t('mt_no_script')}</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mtk-modal-footer" style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
          {editing && dirty && <Button variant="ghost" onClick={handleApply} disabled={saving} icon={saving ? undefined : <Icons.Save size={13} />}>{saving ? <Spinner size={14} /> : t('mt_apply')}</Button>}
          <Button onClick={handleOK} disabled={saving}>{saving ? <Spinner size={14} /> : t('mt_ok')}</Button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// DETAIL MODAL: User
// ════════════════════════════════════════════════════════
function UserDetailModal({ user, routerId, onClose, onDelete, onSaved, availableProfiles = [] }: {
  user: any; routerId: number; onClose: () => void
  onDelete: (username: string) => void; onSaved: () => void; availableProfiles?: string[]
}) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ ...user })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (name: string, value: string) => { setForm(prev => ({ ...prev, [name]: value })); setDirty(true) }

  const handleApply = async () => {
    setSaving(true)
    try {
      await api.patch(`/mikrotik/${routerId}/hotspot/users/`, { username: user.name, ...form })
      setAlert({ type: 'success', msg: `${t('th_user')} ${t('updated_success')} ✓` }); setDirty(false); onSaved()
    } catch (e: any) { setAlert({ type: 'error', msg: e.response?.data?.error || t('mt_save_generic_failed') }) }
    finally { setSaving(false) }
  }

  const handleOK = async () => { if (dirty) await handleApply(); onClose() }

  const tabs = [{ key: 'general', label: t('mt_tab_general') }, { key: 'statistics', label: t('mt_tab_statistics') }]
  const profileOptions = availableProfiles.length > 0
    ? availableProfiles.map(p => ({ value: p, label: p }))
    : [{ value: form.profile || 'default', label: form.profile || 'default' }]
  const disabledOptions = [
    { value: 'false', label: t('mt_opt_active_desc') },
    { value: 'true', label: t('mt_opt_disabled_desc') },
  ]

  return (
    <>
      <div className="mtk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div className="mtk-modal-box" style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
          <div className="mtk-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Icons.User size={16} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{t('mt_user_modal_title')}</div>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginTop: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>{user.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
              <IconButton icon={<Icons.X size={14} />} label={t('close')} onClick={onClose} />
            </div>
          </div>
          {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            {activeTab === 'general' && (
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{t('th_name')}</div>
                    <div style={{ padding: '7px 10px', background: 'var(--gray-50)', borderRadius: 7, fontSize: 13, fontFamily: 'monospace', color: 'var(--gray-500)', border: '1.5px solid var(--gray-100)', wordBreak: 'break-all' }}>
                      {form.name} <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>({t('mt_cannot_change')})</span>
                    </div>
                  </div>
                  <EditRow label={t('password')} name="password" value={form.password || ''} onChange={handleChange} mono placeholder={t('mt_ph_new_password')} />
                  <EditSelectRow label={t('mt_profile_label')} name="profile" value={form.profile || 'default'} options={profileOptions} onChange={handleChange} />
                  <EditRow label={t('th_comment')} name="comment" value={form.comment || ''} onChange={handleChange} placeholder={t('mt_customer_name_hint')} />
                  <EditRow label={t('th_limit_uptime')} name="limit-uptime" value={form['limit-uptime'] || ''} onChange={handleChange} placeholder="e.g. 1h / unlimited" />
                  <EditRow label={t('mt_lbl_limit_bytes_in')} name="limit-bytes-in" value={form['limit-bytes-in'] || ''} onChange={handleChange} placeholder={t('mt_ph_bytes_unlimited')} />
                  <EditRow label={t('mt_lbl_limit_bytes_out')} name="limit-bytes-out" value={form['limit-bytes-out'] || ''} onChange={handleChange} placeholder={t('mt_ph_bytes_unlimited')} />
                  <EditRow label={t('mt_lbl_limit_bytes_total')} name="limit-bytes-total" value={form['limit-bytes-total'] || ''} onChange={handleChange} placeholder={t('mt_ph_bytes_unlimited')} />
                  <EditRow label={t('th_mac')} name="mac-address" value={form['mac-address'] || ''} onChange={handleChange} mono placeholder="AA:BB:CC:DD:EE:FF" />
                  <EditRow label={t('th_ip')} name="address" value={form.address || ''} onChange={handleChange} mono placeholder="192.168.1.100" />
                  <EditSelectRow label={t('mt_lbl_disabled_field')} name="disabled" value={form.disabled || 'false'} options={disabledOptions} onChange={handleChange} />
                </div>
              ) : (
                <div>
                  <DetailRow label={t('th_name')} value={user.name} mono />
                  <DetailRow label={t('password')} value={user.password || `(${t('mt_hidden')})`} mono />
                  <DetailRow label={t('mt_profile_label')} value={<Badge text={form.profile || 'default'} color="indigo" />} />
                  <DetailRow label={t('th_comment')} value={form.comment || '—'} />
                  <DetailRow label={t('th_limit_uptime')} value={form['limit-uptime'] || t('th_unlimited')} />
                  <DetailRow label={t('mt_lbl_limit_bytes_in')} value={form['limit-bytes-in'] || t('th_unlimited')} />
                  <DetailRow label={t('mt_lbl_limit_bytes_out')} value={form['limit-bytes-out'] || t('th_unlimited')} />
                  <DetailRow label={t('mt_lbl_limit_bytes_total')} value={form['limit-bytes-total'] || t('th_unlimited')} />
                  <DetailRow label={t('th_mac')} value={form['mac-address'] || '—'} mono />
                  <DetailRow label={t('th_ip')} value={form.address || '—'} mono />
                  <DetailRow label={t('mt_lbl_disabled_field')} value={<Badge text={form.disabled === 'true' ? t('mt_yes') : t('mt_no')} color={form.disabled === 'true' ? 'red' : 'green'} />} />
                </div>
              )
            )}
            {activeTab === 'statistics' && (
              <div>
                <DetailRow label={t('uptime')} value={user.uptime || '—'} />
                <DetailRow label={t('mt_lbl_bytes_in')} value={user['bytes-in'] ? `${Number(user['bytes-in']).toLocaleString()} B` : '—'} />
                <DetailRow label={t('mt_lbl_bytes_out')} value={user['bytes-out'] ? `${Number(user['bytes-out']).toLocaleString()} B` : '—'} />
                <DetailRow label={t('mt_lbl_packets_in')} value={user['packets-in'] || '—'} />
                <DetailRow label={t('mt_lbl_packets_out')} value={user['packets-out'] || '—'} />
                <DetailRow label={t('mt_lbl_last_login')} value={user['last-logged-in'] || '—'} />
                {(!user.uptime && !user['bytes-in']) && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)', fontSize: 13 }}>
                    {t('mt_no_stats')}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mtk-modal-footer" style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Icons.Trash size={13} />}>{t('delete')}</Button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
              {editing && dirty && <Button variant="ghost" onClick={handleApply} disabled={saving} icon={saving ? undefined : <Icons.Save size={13} />}>{saving ? <Spinner size={14} /> : t('mt_apply')}</Button>}
              <Button onClick={handleOK} disabled={saving}>{saving ? <Spinner size={14} /> : t('mt_ok')}</Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete} onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(user.name); setConfirmDelete(false); onClose() }}
        title={t('delete_user')} message={`${t('mt_confirm_delete_user_msg_prefix')} "${user.name}"? ${t('mt_action_irreversible')}`} danger
      />
    </>
  )
}

// ════════════════════════════════════════════════════════
// DETAIL MODAL: Scheduler
// ════════════════════════════════════════════════════════
function SchedulerDetailModal({ scheduler, routerId, onClose, onSaved, onDelete, onToggle }: {
  scheduler: any; routerId: number; onClose: () => void; onSaved: () => void
  onDelete: (id: string) => void; onToggle: (s: any) => void
}) {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ ...scheduler })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isDisabled = form.disabled === 'true'
  const handleChange = (name: string, value: string) => { setForm(prev => ({ ...prev, [name]: value })); setDirty(true) }

  const handleApply = async () => {
    setSaving(true)
    try {
      await api.patch(`/mikrotik/${routerId}/scheduler/`, {
        scheduler_id: scheduler['.id'], name: form.name,
        'start-date': form['start-date'], 'start-time': form['start-time'],
        interval: form.interval, 'on-event': form['on-event'],
        policy: form.policy, comment: form.comment, disabled: form.disabled,
      })
      setAlert({ type: 'success', msg: `${t('mt_scheduler')} ${t('updated_success')} ✓` }); setDirty(false); onSaved()
    } catch (e: any) { setAlert({ type: 'error', msg: e.response?.data?.error || t('mt_save_generic_failed') }) }
    finally { setSaving(false) }
  }

  const handleOK = async () => { if (dirty) await handleApply(); onClose() }

  const tabs = [{ key: 'general', label: t('mt_tab_general') }, { key: 'script', label: t('mt_tab_script') }]
  const policyOptions = [
    { value: 'read,write,reboot', label: 'read, write, reboot' },
    { value: 'read,write', label: 'read, write' },
    { value: 'read,write,reboot,policy,sensitive', label: 'Full' },
    { value: 'read', label: 'read only' },
  ]
  const intervalPresets = [
    { l: t('mt_once'), v: '00:00:00' }, { l: t('mt_int_every_min'), v: '00:01:00' },
    { l: t('mt_int_every_hour'), v: '01:00:00' }, { l: t('mt_int_every_6h'), v: '06:00:00' },
    { l: t('mt_int_every_day'), v: '1d 00:00:00' }, { l: t('mt_int_every_week'), v: '7d 00:00:00' },
  ]

  return (
    <>
      <div className="mtk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div className="mtk-modal-box" style={{ background: '#fff', borderRadius: 14, maxWidth: 540, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
          <div className="mtk-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Icons.Clock size={16} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{t('mt_scheduler')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, wordBreak: 'break-all' }}>{scheduler.name}</span>
                  <Badge text={isDisabled ? t('inactive') : t('active')} color={isDisabled ? 'red' : 'green'} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
              <IconButton icon={<Icons.X size={14} />} label={t('close')} onClick={onClose} />
            </div>
          </div>
          {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            {activeTab === 'general' && (
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <EditRow label={t('th_name')} name="name" value={form.name} onChange={handleChange} mono />
                  <EditRow label={t('th_comment')} name="comment" value={form.comment || ''} onChange={handleChange} placeholder={t('mt_scheduler_comment_hint')} />
                  <EditRow label={t('th_start_date')} name="start-date" value={form['start-date'] || ''} onChange={handleChange} placeholder="jan/01/1970" mono />
                  <EditRow label={t('th_start_time')} name="start-time" value={form['start-time'] || ''} onChange={handleChange} placeholder="00:00:00" mono />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('th_interval')}</label>
                    <input value={form.interval || ''} onChange={e => handleChange('interval', e.target.value)} placeholder="00:00:00"
                      style={{ padding: '7px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 7, fontSize: 13, fontFamily: 'monospace', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')} />
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
                      {intervalPresets.map(p => (
                        <button key={p.v} onClick={() => handleChange('interval', p.v)}
                          style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid', borderColor: form.interval === p.v ? 'var(--primary)' : 'var(--gray-200)', background: form.interval === p.v ? 'var(--primary-light)' : '#fff', color: form.interval === p.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          {p.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <EditSelectRow label={t('mt_policy_label')} name="policy" value={form.policy || 'read,write,reboot'} options={policyOptions} onChange={handleChange} />
                  <EditSelectRow label={t('th_status')} name="disabled" value={form.disabled || 'false'}
                    options={[{ value: 'false', label: t('mt_opt_enabled_desc') }, { value: 'true', label: t('mt_opt_disabled_desc2') }]}
                    onChange={handleChange} />
                </div>
              ) : (
                <div>
                  <DetailRow label={t('th_name')} value={scheduler.name} mono />
                  <DetailRow label={t('th_comment')} value={form.comment || '—'} />
                  <DetailRow label={t('th_start_date')} value={form['start-date'] || '—'} />
                  <DetailRow label={t('th_start_time')} value={form['start-time'] || '—'} mono />
                  <DetailRow label={t('th_interval')} value={form.interval || t('mt_once')} mono />
                  <DetailRow label={t('mt_policy_label')} value={form.policy || '—'} />
                  <DetailRow label={t('th_run_count')} value={<span style={{ fontWeight: 700, color: (scheduler['run-count'] || 0) > 0 ? '#059669' : 'var(--gray-400)' }}>{scheduler['run-count'] || '0'}</span>} />
                  <DetailRow label={t('th_next_run')} value={scheduler['next-run'] || '—'} />
                  <DetailRow label={t('th_status')} value={<Badge text={isDisabled ? t('inactive') : t('active')} color={isDisabled ? 'red' : 'green'} />} />
                </div>
              )
            )}
            {activeTab === 'script' && (
              <div>
                {editing ? (
                  <>
                    <EditTextareaRow label={t('mt_lbl_on_event_script')} name="on-event" value={form['on-event'] || ''} onChange={handleChange}
                      placeholder={`# ${t('mt_scheduler_comment_hint')}\n# ${t('mt_examples_label')}\n/ip hotspot user remove [find comment~"Batch" uptime>1h]`} minHeight={180} />
                    <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '8px 12px', marginTop: 8, fontSize: 11, color: '#a5b4fc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icons.Bulb size={12} /> {t('mt_examples_label_full')}</span>
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[
                          { l: t('mt_ex_log_message'), v: ':log info "Scheduler imefanya kazi"' },
                          { l: t('mt_ex_remove_used_users'), v: '/ip hotspot user remove [find comment~"used"]' },
                          { l: t('mt_ex_reboot_router'), v: '/system reboot' },
                        ].map((ex, i) => (
                          <button key={i} onClick={() => handleChange('on-event', ex.v)}
                            style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#e0e7ff', fontSize: 11, overflowX: 'auto' }}>
                            <span style={{ color: '#818cf8' }}>{ex.l}:</span> <code>{ex.v}</code>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>{t('mt_lbl_on_event_script')}</div>
                    {form['on-event'] ? (
                      <div style={{ background: '#1e1b4b', borderRadius: 10, padding: '14px 16px', overflowX: 'auto' }}>
                        <pre style={{ fontSize: 13, color: '#e0e7ff', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.6 }}>{form['on-event']}</pre>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>{t('mt_no_script')}</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mtk-modal-footer" style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Icons.Trash size={13} />}>{t('delete')}</Button>
              <Button variant={isDisabled ? 'success' : 'warning'} size="sm" onClick={() => { onToggle(scheduler); onClose() }} icon={isDisabled ? <Icons.Play size={12} /> : <Icons.Pause size={12} />}>
                {isDisabled ? t('mt_enable') : t('mt_disable')}
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost" onClick={onClose}>{t('cancel')}</Button>
              {editing && dirty && <Button variant="ghost" onClick={handleApply} disabled={saving} icon={saving ? undefined : <Icons.Save size={13} />}>{saving ? <Spinner size={14} /> : t('mt_apply')}</Button>}
              <Button onClick={handleOK} disabled={saving}>{saving ? <Spinner size={14} /> : t('mt_ok')}</Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete} onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(scheduler['.id']); setConfirmDelete(false); onClose() }}
        title={t('mt_delete_scheduler_title')} message={t('mt_delete_scheduler_msg')} danger
      />
    </>
  )
}

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
function MikroTikManager({ routerId, allowedTabs }: { routerId: number; allowedTabs: Tab[] }) {
  const { t } = useLang()
  const visibleTabs = ALL_TABS.filter(tb => allowedTabs.includes(tb.key as Tab)).map(tb => ({ ...tb, label: t(tb.labelKey) }))
  const [tab, setTab] = useState<Tab>(visibleTabs.length > 0 ? visibleTabs[0].key as Tab : 'servers')
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const intervalRef = useRef<any>(null)

  const [selectedProfile, setSelectedProfile]     = useState<any>(null)
  const [selectedUser, setSelectedUser]           = useState<any>(null)
  const [selectedScheduler, setSelectedScheduler] = useState<any>(null)

  const [confirmDisconnect, setConfirmDisconnect]       = useState<string | null>(null)
  const [confirmDeleteUser, setConfirmDeleteUser]       = useState<string | null>(null)
  const [confirmDeleteBinding, setConfirmDeleteBinding] = useState<string | null>(null)
  const [confirmDeleteWG, setConfirmDeleteWG]           = useState<string | null>(null)
  const [confirmDeleteWGIP, setConfirmDeleteWGIP]       = useState<string | null>(null)
  const [confirmDeleteCookie, setConfirmDeleteCookie]   = useState<string | null>(null)
  const [confirmClearCookies, setConfirmClearCookies]   = useState(false)
  const [confirmDeleteScheduler, setConfirmDeleteScheduler] = useState<string | null>(null)

  const [showAddUser, setShowAddUser]         = useState(false)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [availableProfiles, setAvailableProfiles] = useState<string[]>([])
  const [newUser, setNewUser]                 = useState({ username: '', password: '', profile: '', comment: '' })
  const [savingUser, setSavingUser]           = useState(false)

  const [showAddBinding, setShowAddBinding] = useState(false)
  const [newBinding, setNewBinding]         = useState({ mac_address: '', ip_address: '', type: 'regular', comment: '' })
  const [savingBinding, setSavingBinding]   = useState(false)

  const [showAddWG, setShowAddWG] = useState(false)
  const [newWG, setNewWG]         = useState({ dst_host: '', action: 'allow', comment: '' })
  const [savingWG, setSavingWG]   = useState(false)

  const [showAddWGIP, setShowAddWGIP] = useState(false)
  const [newWGIP, setNewWGIP]         = useState({ dst_address: '', action: 'accept', comment: '' })
  const [savingWGIP, setSavingWGIP]   = useState(false)

  const [showAddScheduler, setShowAddScheduler] = useState(false)
  const [editScheduler, setEditScheduler]       = useState<any>(null)
  const [savingScheduler, setSavingScheduler]   = useState(false)
  const [newScheduler, setNewScheduler]         = useState({
    name: '', start_date: 'jan/01/1970', start_time: '00:00:00',
    interval: '00:00:00', on_event: '', policy: 'read,write,reboot',
    comment: '', disabled: 'false',
  })

  const [countdown, setCountdown] = useState(5)

  // ── Users: search & bulk select ───────────────────────
  const [userSearch, setUserSearch]             = useState('')
  const [selectedUserNames, setSelectedUserNames] = useState<Set<string>>(new Set())
  const [confirmBulkDeleteUsers, setConfirmBulkDeleteUsers] = useState(false)
  const [bulkDeleting, setBulkDeleting]         = useState(false)

  if (visibleTabs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.25rem', color: 'var(--gray-400)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icons.Lock size={40} /></div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>{t('mt_no_permission_title')}</div>
        <div style={{ fontSize: 13 }}>{t('mt_no_permission_contact')}</div>
      </div>
    )
  }

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }

  const fetchTab = async (currentTab: Tab, silent = false) => {
    if (currentTab === 'terminal') return  // Terminal haina fetch
    if (!silent) setLoading(true)
    try {
      const res = await api.get(`/mikrotik/${routerId}/${ENDPOINTS[currentTab as Exclude<Tab, 'terminal'>]}`)
      setData((prev: any) => ({ ...prev, [currentTab]: res.data }))
    } catch (e: any) {
      if (!silent) showAlrt('error', e.response?.data?.error || t('mt_connection_error'))
    } finally { if (!silent) setLoading(false) }
  }

  useEffect(() => {
    if (tab === 'terminal') return  // Terminal haitumii auto-fetch
    fetchTab(tab)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (tab === 'active' || tab === 'hosts') {
      setCountdown(5)
      const countTick = setInterval(() => { setCountdown(c => { if (c <= 1) return 5; return c - 1 }) }, 1000)
      intervalRef.current = setInterval(() => { fetchTab(tab, true); setCountdown(5) }, 5000)
      return () => { clearInterval(intervalRef.current); clearInterval(countTick) }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [tab, routerId])

  const openAddUser = async () => {
    setShowAddUser(true); setProfilesLoading(true)
    try {
      const res = await api.get(`/mikrotik/${routerId}/hotspot/profiles/`)
      const names: string[] = (res.data.profiles || []).map((p: any) => p.name).filter(Boolean)
      const list = names.length > 0 ? names : ['default']
      setAvailableProfiles(list)
      setNewUser(prev => ({ ...prev, profile: list[0] }))
    } catch { setAvailableProfiles(['default']); setNewUser(prev => ({ ...prev, profile: 'default' })) }
    finally { setProfilesLoading(false) }
  }

  const handleDeleteUser = async (username: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/users/delete/`, { data: { username } })
      showAlrt('success', `${t('th_user')} ${username} ${t('deleted_success')}`); fetchTab('users')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const toggleSelectUser = (name: string) => {
    setSelectedUserNames(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleBulkDeleteUsers = async () => {
    setBulkDeleting(true)
    const names = Array.from(selectedUserNames)
    let success = 0, failed = 0
    for (const username of names) {
      try {
        await api.delete(`/mikrotik/${routerId}/hotspot/users/delete/`, { data: { username } })
        success++
      } catch { failed++ }
    }
    setBulkDeleting(false)
    setConfirmBulkDeleteUsers(false)
    setSelectedUserNames(new Set())
    showAlrt(failed === 0 ? 'success' : 'error',
      `${success} ${t('th_user')}(s) ${t('deleted_success')}${failed ? `${t('mt_bulk_failed_note')} ${failed}` : ''} ✓`)
    fetchTab('users')
  }

  const handleDisconnect = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/sessions/`, { data: { session_id: id } })
      showAlrt('success', `${t('mt_session_disconnected')} ✓`); fetchTab('active', true)
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddUser = async () => {
    if (!newUser.username) { showAlrt('error', t('fill_required')); return }
    const payload = { ...newUser, password: newUser.password || newUser.username }
    setSavingUser(true)
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/users/`, payload)
      showAlrt('success', `${t('th_user')} ${newUser.username} ${t('created_success')}`)
      setShowAddUser(false); setNewUser({ username: '', password: '', profile: '', comment: '' }); fetchTab('users')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
    finally { setSavingUser(false) }
  }

  const handleDeleteBinding = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/ip-bindings/`, { data: { binding_id: id } })
      showAlrt('success', `${t('mt_ip_bindings')} ${t('deleted_success')}`); fetchTab('ip_bindings')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddBinding = async () => {
    if (!newBinding.mac_address) { showAlrt('error', t('fill_required')); return }
    setSavingBinding(true)
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/ip-bindings/`, newBinding)
      showAlrt('success', `${t('mt_ip_bindings')} ${t('created_success')}`)
      setShowAddBinding(false); setNewBinding({ mac_address: '', ip_address: '', type: 'regular', comment: '' }); fetchTab('ip_bindings')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
    finally { setSavingBinding(false) }
  }

  const handleDeleteWG = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/walled-garden/`, { data: { entry_id: id } })
      showAlrt('success', `${t('mt_walled_garden')} ${t('deleted_success')}`); fetchTab('walled_garden')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddWG = async () => {
    if (!newWG.dst_host) { showAlrt('error', t('fill_required')); return }
    setSavingWG(true)
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/walled-garden/`, newWG)
      showAlrt('success', `${newWG.dst_host} ${t('created_success')}`)
      setShowAddWG(false); setNewWG({ dst_host: '', action: 'allow', comment: '' }); fetchTab('walled_garden')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
    finally { setSavingWG(false) }
  }

  const handleDeleteWGIP = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/walled-garden-ip/`, { data: { entry_id: id } })
      showAlrt('success', `${t('mt_walled_garden_ip')} ${t('deleted_success')}`); fetchTab('walled_garden_ip')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddWGIP = async () => {
    if (!newWGIP.dst_address) { showAlrt('error', t('fill_required')); return }
    setSavingWGIP(true)
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/walled-garden-ip/`, newWGIP)
      showAlrt('success', `${newWGIP.dst_address} ${t('created_success')}`)
      setShowAddWGIP(false); setNewWGIP({ dst_address: '', action: 'accept', comment: '' }); fetchTab('walled_garden_ip')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
    finally { setSavingWGIP(false) }
  }

  const handleDeleteCookie = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/cookies/`, { data: { cookie_id: id } })
      showAlrt('success', `${t('mt_cookies')} ${t('deleted_success')}`); fetchTab('cookies')
    } catch { showAlrt('error', t('error')) }
  }

  const handleClearAllCookies = async () => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/cookies/`, { data: {} })
      showAlrt('success', `${t('mt_cookies')} ${t('deleted_success')}`); fetchTab('cookies')
    } catch { showAlrt('error', t('error')) }
  }

  const openAddScheduler = () => {
    setEditScheduler(null)
    setNewScheduler({ name: '', start_date: 'jan/01/1970', start_time: '00:00:00', interval: '00:00:00', on_event: '', policy: 'read,write,reboot', comment: '', disabled: 'false' })
    setShowAddScheduler(true)
  }

  const openEditScheduler = (item: any) => {
    setSelectedScheduler(null)
    setEditScheduler(item)
    setNewScheduler({
      name: item.name || '', start_date: item['start-date'] || 'jan/01/1970',
      start_time: item['start-time'] || '00:00:00', interval: item.interval || '00:00:00',
      on_event: item['on-event'] || '', policy: item.policy || 'read,write,reboot',
      comment: item.comment || '', disabled: item.disabled || 'false',
    })
    setShowAddScheduler(true)
  }

  const handleSaveScheduler = async () => {
    if (!newScheduler.name) { showAlrt('error', t('fill_required')); return }
    if (!newScheduler.on_event) { showAlrt('error', t('fill_required')); return }
    setSavingScheduler(true)
    try {
      if (editScheduler) {
        await api.patch(`/mikrotik/${routerId}/scheduler/`, { scheduler_id: editScheduler['.id'], ...newScheduler })
        showAlrt('success', `${t('mt_scheduler')} "${newScheduler.name}" ${t('updated_success')}`)
      } else {
        await api.post(`/mikrotik/${routerId}/scheduler/`, newScheduler)
        showAlrt('success', `${t('mt_scheduler')} "${newScheduler.name}" ${t('created_success')}`)
      }
      setShowAddScheduler(false); setEditScheduler(null); fetchTab('scheduler')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
    finally { setSavingScheduler(false) }
  }

  const handleDeleteScheduler = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/scheduler/`, { data: { scheduler_id: id } })
      showAlrt('success', `${t('mt_scheduler')} ${t('deleted_success')}`); fetchTab('scheduler')
    } catch { showAlrt('error', t('error')) }
  }

  const handleToggleScheduler = async (item: any) => {
    try {
      await api.patch(`/mikrotik/${routerId}/scheduler/`, { scheduler_id: item['.id'], disabled: item.disabled === 'true' ? 'false' : 'true' })
      showAlrt('success', `${t('mt_scheduler')} ${item.disabled === 'true' ? t('mt_enable') : t('mt_disable')} ✓`)
      fetchTab('scheduler')
    } catch { showAlrt('error', t('error')) }
  }

  const d = data[tab]

  // ── filtered users (search) ───────────────────────────
  const filteredUsers = (d?.users || []).filter((u: any) => {
    if (!userSearch.trim()) return true
    const q = userSearch.toLowerCase()
    return (u.name || '').toLowerCase().includes(q)
      || (u.comment || '').toLowerCase().includes(q)
      || (u.profile || '').toLowerCase().includes(q)
  })
  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((u: any) => selectedUserNames.has(u.name))

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '1rem',
  }
  const modalBox: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: '1.5rem',
    maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease', boxSizing: 'border-box',
  }
  const modalBoxLg: React.CSSProperties = { ...modalBox, maxWidth: 560 }
  const modalHeader = (title: string, onClose: () => void) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: 10 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, minWidth: 0, wordBreak: 'break-word' }}>{title}</h3>
      <IconButton icon={<Icons.X size={14} />} label={t('close')} onClick={onClose} />
    </div>
  )
  const selectStyle: React.CSSProperties = {
    padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8,
    fontSize: 14, outline: 'none', width: '100%', background: '#fff', color: 'var(--gray-800)', cursor: 'pointer', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 5, display: 'block' }
  const textareaStyle: React.CSSProperties = {
    padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8,
    fontSize: 13, outline: 'none', width: '100%', background: '#fff',
    color: 'var(--gray-800)', fontFamily: 'monospace', resize: 'vertical', minHeight: 100, boxSizing: 'border-box',
  }

  const LiveBadge = () => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#16a34a', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'livepulse 1.5s infinite' }} />
      {t('mt_live_label')} · {countdown}s
    </span>
  )

  // Reusable horizontally-scrollable wrapper so tables never break the layout on small screens
  const TableScroll = ({ children }: { children: ReactNode }) => (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -0.5px' }}>{children}</div>
  )

  return (
    <div className="mtk-page">
      {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

      <div className="mtk-toolbar-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
          <Tabs tabs={visibleTabs as any} active={tab} onChange={(k) => setTab(k as Tab)} />
        </div>
        {tab !== 'terminal' && (
          <Button size="sm" variant="ghost" onClick={() => fetchTab(tab)} icon={<Icons.Refresh size={13} />}>{t('refresh')}</Button>
        )}
      </div>

      {/* ── TERMINAL ── */}
      {tab === 'terminal' && (
        <div>
          <div style={{ marginBottom: '1rem', padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Icons.Terminal size={16} /> <strong>MikroTik Terminal</strong> — {t('mt_terminal_banner')}
          </div>
          <MikroTikTerminal routerId={routerId} />
        </div>
      )}

      {loading && tab !== 'terminal' && <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>}

      {/* 1. SERVERS */}
      {!loading && tab === 'servers' && (
        <Card>
          <CardHeader title={`${t('mt_hotspot_servers')} (${d?.count || 0})`} />
          <TableScroll>
          <Table headers={[t('th_name'), t('interfaces'), t('th_address_pool'), t('th_profile'), t('th_idle_timeout'), t('th_status')]}
            rows={(d?.servers || []).map((s: any) => [
              <strong>{s.name || '—'}</strong>, s.interface || '—', s['address-pool'] || '—',
              <Badge text={s.profile || 'default'} color="indigo" />, s['idle-timeout'] || '—',
              <Badge text={s.disabled === 'true' ? t('inactive') : t('active')} color={s.disabled === 'true' ? 'red' : 'green'} />,
            ])} emptyMessage={t('mt_no_servers')} />
          </TableScroll>
        </Card>
      )}

      {/* 2. SERVER PROFILES */}
      {!loading && tab === 'server_profiles' && (
        <Card>
          <CardHeader title={`${t('mt_server_profiles')} (${(d?.profiles || []).length})`} />
          <div style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Bulb size={13} /> {t('mt_profile_tip')}
          </div>
          <TableScroll>
          <Table headers={[t('th_name'), t('th_rate_limit'), t('th_session_timeout'), t('th_shared_users'), t('th_on_login_script'), '']}
            rows={(d?.profiles || []).map((p: any) => [
              <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setSelectedProfile(p)}>{p.name}</strong>,
              p['rate-limit'] || <span style={{ color: 'var(--gray-400)' }}>{t('th_unlimited')}</span>,
              p['session-timeout'] || <span style={{ color: 'var(--gray-400)' }}>{t('th_unlimited')}</span>,
              p['shared-users'] || '1',
              p['on-login'] ? <Badge text={t('mt_ipo')} color="green" /> : <Badge text={t('mt_hakuna')} color="gray" />,
              <IconButton icon={<Icons.Edit size={14} />} label={t('mt_edit_profile')} onClick={() => setSelectedProfile(p)} />,
            ])} emptyMessage={t('mt_no_profiles')} />
          </TableScroll>
        </Card>
      )}

      {/* 3. USERS */}
      {!loading && tab === 'users' && (
        <Card>
          <CardHeader title={`${t('hotspot_users')} (${d?.count || 0})`} action={<Button size="sm" onClick={openAddUser} icon={<Icons.Plus size={13} />}>{t('add_user')}</Button>} />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0 1rem 1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex' }}><Icons.Search size={14} /></span>
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder={t('mt_search_users_placeholder')}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
              />
            </div>
            {selectedUserNames.size > 0 && (
              <>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>
                  {selectedUserNames.size} {t('mt_selected_count_suffix')}
                </span>
                <Button size="sm" variant="danger" onClick={() => setConfirmBulkDeleteUsers(true)} icon={<Icons.Trash size={13} />}>
                  {t('mt_delete_selected')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedUserNames(new Set())}>
                  {t('mt_deselect')}
                </Button>
              </>
            )}
          </div>

          {filteredUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px 8px', borderBottom: '1px solid var(--gray-100)' }}>
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={() => {
                  if (allFilteredSelected) {
                    setSelectedUserNames(prev => {
                      const next = new Set(prev)
                      filteredUsers.forEach((u: any) => next.delete(u.name))
                      return next
                    })
                  } else {
                    setSelectedUserNames(prev => {
                      const next = new Set(prev)
                      filteredUsers.forEach((u: any) => next.add(u.name))
                      return next
                    })
                  }
                }}
                style={{ cursor: 'pointer', width: 15, height: 15, flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                {allFilteredSelected ? t('mt_deselect_all_filtered') : `${t('mt_select_all_filtered_prefix')} (${filteredUsers.length})`}
              </span>
            </div>
          )}

          <div style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Bulb size={13} /> {t('mt_users_tip')}
          </div>

          <TableScroll>
          <Table
            headers={['', t('th_name'), t('th_profile'), t('th_limit_uptime'), t('th_uptime_hali'), t('th_comment'), t('th_status'), '']}
            rows={filteredUsers.map((u: any) => {
              const currentUptime = u.uptime || ''
              const lastLogin     = u['last-logged-in'] || ''
              const hasStarted    = currentUptime && currentUptime !== '00:00:00'
              const neverUsed     = !currentUptime && !lastLogin

              let usageBadge: any
              if (neverUsed) {
                usageBadge = (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                    <Icons.Circle size={6} /> {t('mt_never_used')}
                  </span>
                )
              } else if (hasStarted) {
                usageBadge = (
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                      <Icons.Play size={9} /> {currentUptime}
                    </span>
                    {lastLogin && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, whiteSpace: 'nowrap' }}>{t('mt_login_label')}: {lastLogin}</div>}
                  </div>
                )
              } else {
                usageBadge = (
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                      <Icons.Pause size={9} /> {t('mt_nje')}
                    </span>
                    {lastLogin && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, whiteSpace: 'nowrap' }}>{t('mt_last_label')}: {lastLogin}</div>}
                  </div>
                )
              }

              return [
                <input
                  type="checkbox"
                  checked={selectedUserNames.has(u.name)}
                  onChange={() => toggleSelectUser(u.name)}
                  style={{ cursor: 'pointer', width: 15, height: 15 }}
                />,
                <code style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline dotted', whiteSpace: 'nowrap' }} onClick={() => setSelectedUser(u)}>
                  {u.name}
                </code>,
                <Badge text={u.profile || 'default'} color="indigo" />,
                u['limit-uptime']
                  ? <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gray-700)', fontWeight: 600, whiteSpace: 'nowrap' }}>{u['limit-uptime']}</span>
                  : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>{t('th_unlimited')}</span>,
                usageBadge,
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.comment || '—'}</span>,
                <Badge text={u.disabled === 'true' ? t('inactive') : t('active')} color={u.disabled === 'true' ? 'red' : 'green'} />,
                <IconButton icon={<Icons.Edit size={14} />} label={t('mt_edit_user')} onClick={() => setSelectedUser(u)} />,
              ]
            })}
            emptyMessage={userSearch ? `${t('mt_no_users_match_prefix')} "${userSearch}"` : t('mt_no_users')}
          />
          </TableScroll>
        </Card>
      )}

      {/* 4. ACTIVE */}
      {!loading && tab === 'active' && (
        <Card>
          <CardHeader title={`${t('active_sessions')} (${d?.count || 0})`} action={<LiveBadge />} />
          {(d?.sessions || []).length === 0
            ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Circle size={30} /></div>{t('mt_no_active_sessions')}</div>
            : <TableScroll><Table headers={[t('th_user'), t('th_mac'), t('th_ip'), t('uptime'), t('th_tx'), t('th_rx'), t('th_server'), '']}
                rows={(d?.sessions || []).map((s: any) => [
                  <strong>{s.user || '—'}</strong>,
                  <code style={{ fontSize: 11 }}>{s['mac-address'] || '—'}</code>,
                  <code style={{ fontSize: 11 }}>{s.address || '—'}</code>,
                  s.uptime || '—', s['bytes-out'] || '0', s['bytes-in'] || '0', s.server || '—',
                  <IconButton icon={<Icons.X size={14} />} label={t('mt_disconnect')} variant="danger" onClick={() => setConfirmDisconnect(s['.id'])} />,
                ])} emptyMessage={t('mt_no_active_sessions')} /></TableScroll>
          }
        </Card>
      )}

      {/* 5. HOSTS */}
      {!loading && tab === 'hosts' && (
        <Card>
          <CardHeader title={`${t('mt_hosts_title')} (${d?.count || 0})`} action={<LiveBadge />} />
          <TableScroll>
          <Table headers={[t('th_mac'), t('th_ip'), t('th_hostname'), t('th_server'), t('th_bridge'), t('th_status')]}
            rows={(d?.hosts || []).map((h: any) => [
              <code style={{ fontSize: 11 }}>{h['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{h.address || '—'}</code>,
              h.hostname || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              h.server || '—', h.bridge || '—',
              <Badge text={h.authorized === 'true' ? t('mt_authorized') : t('mt_unauthorized')} color={h.authorized === 'true' ? 'green' : 'gray'} />,
            ])} emptyMessage={t('mt_no_hosts')} />
          </TableScroll>
        </Card>
      )}

      {/* 6. IP BINDINGS */}
      {!loading && tab === 'ip_bindings' && (
        <Card>
          <CardHeader title={`${t('mt_ip_bindings')} (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddBinding(true)} icon={<Icons.Plus size={13} />}>{t('mt_add_binding')}</Button>} />
          <TableScroll>
          <Table headers={[t('th_mac'), t('th_ip'), t('th_type'), t('th_comment'), '']}
            rows={(d?.bindings || []).map((b: any) => [
              <code style={{ fontSize: 11 }}>{b['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{b.address || '—'}</code>,
              <Badge text={b.type || 'regular'} color={b.type === 'bypassed' ? 'green' : b.type === 'blocked' ? 'red' : 'blue'} />,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{b.comment || '—'}</span>,
              <IconButton icon={<Icons.Trash size={14} />} label={t('mt_remove_binding')} variant="danger" onClick={() => setConfirmDeleteBinding(b['.id'])} />,
            ])} emptyMessage={t('mt_no_bindings')} />
          </TableScroll>
        </Card>
      )}

      {/* 7. WALLED GARDEN */}
      {!loading && tab === 'walled_garden' && (
        <Card>
          <CardHeader title={`${t('mt_walled_garden')} (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddWG(true)} icon={<Icons.Plus size={13} />}>{t('mt_add_entry')}</Button>} />
          <div style={{ padding: '8px 16px', background: 'var(--info-light)', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Globe size={13} /> {t('mt_wg_tip')}
          </div>
          <TableScroll>
          <Table headers={[t('th_dst_host'), t('th_action'), t('th_server'), t('th_path'), t('th_comment'), '']}
            rows={(d?.entries || []).map((e: any) => [
              <code style={{ fontSize: 12, color: 'var(--primary)' }}>{e['dst-host'] || '—'}</code>,
              <Badge text={e.action || 'allow'} color={e.action === 'deny' ? 'red' : 'green'} />,
              e.server || <span style={{ color: 'var(--gray-300)' }}>{t('all')}</span>,
              e.path || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.comment || '—'}</span>,
              <IconButton icon={<Icons.Trash size={14} />} label={t('mt_remove_entry')} variant="danger" onClick={() => setConfirmDeleteWG(e['.id'])} />,
            ])} emptyMessage={t('mt_no_wg')} />
          </TableScroll>
        </Card>
      )}

      {/* 8. WALLED GARDEN IP */}
      {!loading && tab === 'walled_garden_ip' && (
        <Card>
          <CardHeader title={`${t('mt_walled_garden_ip')} (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddWGIP(true)} icon={<Icons.Plus size={13} />}>{t('mt_add_ip')}</Button>} />
          <div style={{ padding: '8px 16px', background: 'var(--info-light)', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Globe2 size={13} /> {t('mt_wgip_tip')}
          </div>
          <TableScroll>
          <Table headers={[t('th_dst_address'), t('th_action'), t('th_protocol'), t('th_server'), t('th_comment'), '']}
            rows={(d?.entries || []).map((e: any) => [
              <code style={{ fontSize: 12, color: 'var(--primary)' }}>{e['dst-address'] || '—'}</code>,
              <Badge text={e.action || 'accept'} color={e.action === 'drop' ? 'red' : 'green'} />,
              e.protocol || <span style={{ color: 'var(--gray-300)' }}>{t('mt_any')}</span>,
              e.server || <span style={{ color: 'var(--gray-300)' }}>{t('all')}</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.comment || '—'}</span>,
              <IconButton icon={<Icons.Trash size={14} />} label={t('mt_remove_ip')} variant="danger" onClick={() => setConfirmDeleteWGIP(e['.id'])} />,
            ])} emptyMessage={t('mt_no_wgip')} />
          </TableScroll>
        </Card>
      )}

      {/* 9. COOKIES */}
      {!loading && tab === 'cookies' && (
        <Card>
          <CardHeader title={`${t('mt_cookies')} (${d?.count || 0})`}
            action={(d?.count || 0) > 0
              ? <Button size="sm" variant="danger" onClick={() => setConfirmClearCookies(true)} icon={<Icons.Trash size={13} />}>{t('mt_clear_all')}</Button>
              : undefined} />
          <div style={{ padding: '8px 16px', background: '#fff7ed', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Cookie size={13} /> {t('mt_cookies_tip')}
          </div>
          <TableScroll>
          <Table headers={[t('th_user'), t('th_mac'), t('th_ip'), t('th_expires_at'), '']}
            rows={(d?.cookies || []).map((c: any) => [
              <strong>{c.user || '—'}</strong>,
              <code style={{ fontSize: 11 }}>{c['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{c.address || '—'}</code>,
              c['expires-at'] || '—',
              <IconButton icon={<Icons.Trash size={14} />} label={t('mt_remove_cookie')} variant="danger" onClick={() => setConfirmDeleteCookie(c['.id'])} />,
            ])} emptyMessage={t('mt_no_cookies')} />
          </TableScroll>
        </Card>
      )}

      {/* 10. SCHEDULER */}
      {!loading && tab === 'scheduler' && (
        <Card>
          <CardHeader title={`${t('mt_scheduler')} (${(d?.schedulers || []).length})`} action={<Button size="sm" onClick={openAddScheduler} icon={<Icons.Plus size={13} />}>{t('mt_add_schedule')}</Button>} />
          <div style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Clock size={13} /> {t('mt_scheduler_tip')}
          </div>
          <TableScroll>
          <Table
            headers={[t('th_name'), t('th_start_date'), t('th_start_time'), t('th_interval'), t('th_run_count'), t('th_next_run'), t('th_status'), '']}
            rows={(d?.schedulers || []).map((s: any) => [
              <div style={{ cursor: 'pointer', minWidth: 80 }} onClick={() => setSelectedScheduler(s)}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', textDecoration: 'underline dotted' }}>{s.name}</div>
                {s.comment && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 1 }}>{s.comment}</div>}
              </div>,
              s['start-date'] ? <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{s['start-date']}</span> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>,
              s['start-time'] ? <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{s['start-time']}</span> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>,
              s.interval && s.interval !== '00:00:00' ? <Badge text={s.interval} color="blue" /> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>{t('mt_once')}</span>,
              <span style={{ fontWeight: 700, color: (s['run-count'] || 0) > 0 ? '#059669' : 'var(--gray-400)', fontSize: 13 }}>{s['run-count'] || '0'}</span>,
              s['next-run'] ? <span style={{ fontSize: 11, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{s['next-run']}</span> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>,
              <Badge text={s.disabled === 'true' ? t('inactive') : t('active')} color={s.disabled === 'true' ? 'red' : 'green'} />,
              <div style={{ display: 'flex', gap: 2 }}>
                <IconButton icon={<Icons.Edit size={14} />} label={t('mt_edit_scheduler')} onClick={() => openEditScheduler(s)} />
                <IconButton icon={s.disabled === 'true' ? <Icons.Play size={13} /> : <Icons.Pause size={13} />} label={s.disabled === 'true' ? t('mt_enable') : t('mt_disable')} variant={s.disabled === 'true' ? 'success' : 'warning'} onClick={() => handleToggleScheduler(s)} />
                <IconButton icon={<Icons.Trash size={14} />} label={t('mt_delete_scheduler')} variant="danger" onClick={() => setConfirmDeleteScheduler(s['.id'])} />
              </div>,
            ])}
            emptyMessage={t('mt_no_schedulers')}
          />
          </TableScroll>
        </Card>
      )}

      {/* ── DETAIL MODALS ── */}
      {selectedProfile && (
        <ServerProfileDetailModal profile={selectedProfile} routerId={routerId}
          onClose={() => setSelectedProfile(null)} onSaved={() => fetchTab('server_profiles')} />
      )}
      {selectedUser && (
        <UserDetailModal user={selectedUser} routerId={routerId}
          onClose={() => setSelectedUser(null)}
          onDelete={(username) => { handleDeleteUser(username); setSelectedUser(null) }}
          onSaved={() => fetchTab('users')} availableProfiles={availableProfiles} />
      )}
      {selectedScheduler && (
        <SchedulerDetailModal scheduler={selectedScheduler} routerId={routerId}
          onClose={() => setSelectedScheduler(null)} onSaved={() => fetchTab('scheduler')}
          onDelete={(id) => { handleDeleteScheduler(id); setSelectedScheduler(null) }}
          onToggle={(s) => { handleToggleScheduler(s) }} />
      )}

      {/* ── ADD USER MODAL ── */}
      {showAddUser && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader(t('add_user'), () => setShowAddUser(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={t('mt_username_star')} placeholder="mtumiaji001" value={newUser.username} onChange={(e: any) => setNewUser({ ...newUser, username: e.target.value })} />
            <Input label={t('mt_password_default')} placeholder={t('mt_leave_blank')} value={newUser.password} onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_profile_label')} {profilesLoading && <Spinner size={12} />}</label>
              {profilesLoading
                ? <div style={{ padding: '10px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)' }}>{t('mt_loading_short')}</div>
                : <select value={newUser.profile} onChange={(e: any) => setNewUser({ ...newUser, profile: e.target.value })} style={selectStyle}>
                    {availableProfiles.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>}
            </div>
            <Input label={t('mt_comment_optional')} placeholder={t('mt_customer_name_hint')} value={newUser.comment} onChange={(e: any) => setNewUser({ ...newUser, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddUser(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddUser} disabled={profilesLoading || savingUser} icon={savingUser ? undefined : <Icons.Plus size={13} />}>{savingUser ? <Spinner size={14} /> : t('save')}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD BINDING MODAL ── */}
      {showAddBinding && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader(t('mt_add_binding_title'), () => setShowAddBinding(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={t('mt_mac_star')} placeholder="AA:BB:CC:DD:EE:FF" value={newBinding.mac_address} onChange={(e: any) => setNewBinding({ ...newBinding, mac_address: e.target.value })} />
            <Input label={t('mt_ip_optional')} placeholder="192.168.20.100" value={newBinding.ip_address} onChange={(e: any) => setNewBinding({ ...newBinding, ip_address: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_type_label')}</label>
              <select value={newBinding.type} onChange={(e: any) => setNewBinding({ ...newBinding, type: e.target.value })} style={selectStyle}>
                <option value="regular">{t('mt_binding_regular')}</option>
                <option value="bypassed">{t('mt_binding_bypassed')}</option>
                <option value="blocked">{t('mt_binding_blocked')}</option>
              </select>
            </div>
            <Input label={t('mt_comment_optional')} placeholder={t('mt_notes_hint')} value={newBinding.comment} onChange={(e: any) => setNewBinding({ ...newBinding, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddBinding(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddBinding} disabled={savingBinding} icon={savingBinding ? undefined : <Icons.Plus size={13} />}>{savingBinding ? <Spinner size={14} /> : t('mt_add_binding')}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD WALLED GARDEN MODAL ── */}
      {showAddWG && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader(t('mt_add_wg_title'), () => setShowAddWG(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={t('mt_dst_host_star')} placeholder="example.com au *.example.com" value={newWG.dst_host} onChange={(e: any) => setNewWG({ ...newWG, dst_host: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_action_label')}</label>
              <select value={newWG.action} onChange={(e: any) => setNewWG({ ...newWG, action: e.target.value })} style={selectStyle}>
                <option value="allow">{t('mt_allow_desc')}</option>
                <option value="deny">{t('mt_deny_desc')}</option>
              </select>
            </div>
            <Input label={t('mt_comment_optional')} placeholder={t('mt_notes_hint')} value={newWG.comment} onChange={(e: any) => setNewWG({ ...newWG, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddWG(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddWG} disabled={savingWG} icon={savingWG ? undefined : <Icons.Plus size={13} />}>{savingWG ? <Spinner size={14} /> : t('mt_add_entry')}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD WALLED GARDEN IP MODAL ── */}
      {showAddWGIP && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader(t('mt_add_wgip_title'), () => setShowAddWGIP(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={t('mt_dst_address_star')} placeholder="8.8.8.8 au 192.168.1.0/24" value={newWGIP.dst_address} onChange={(e: any) => setNewWGIP({ ...newWGIP, dst_address: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_action_label')}</label>
              <select value={newWGIP.action} onChange={(e: any) => setNewWGIP({ ...newWGIP, action: e.target.value })} style={selectStyle}>
                <option value="accept">{t('mt_accept_desc')}</option>
                <option value="drop">{t('mt_drop_desc')}</option>
              </select>
            </div>
            <Input label={t('mt_comment_optional')} placeholder={t('mt_notes_hint')} value={newWGIP.comment} onChange={(e: any) => setNewWGIP({ ...newWGIP, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddWGIP(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddWGIP} disabled={savingWGIP} icon={savingWGIP ? undefined : <Icons.Plus size={13} />}>{savingWGIP ? <Spinner size={14} /> : t('mt_add_ip')}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD/EDIT SCHEDULER MODAL ── */}
      {showAddScheduler && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBoxLg}>
          {modalHeader(editScheduler ? `${t('mt_edit_scheduler_prefix')}: ${editScheduler.name}` : t('mt_add_scheduler_title'), () => setShowAddScheduler(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={t('mt_scheduler_name_star')} placeholder="mfano: cleanup-daily" value={newScheduler.name} onChange={(e: any) => setNewScheduler({ ...newScheduler, name: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <label style={labelStyle}>{t('th_start_date')}</label>
                <input value={newScheduler.start_date} onChange={(e: any) => setNewScheduler({ ...newScheduler, start_date: e.target.value })} placeholder="jan/01/1970" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{t('mt_start_date_hint')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <label style={labelStyle}>{t('th_start_time')}</label>
                <input value={newScheduler.start_time} onChange={(e: any) => setNewScheduler({ ...newScheduler, start_time: e.target.value })} placeholder="00:00:00" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>{t('mt_start_time_hint')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_interval_hint')}</label>
              <input value={newScheduler.interval} onChange={(e: any) => setNewScheduler({ ...newScheduler, interval: e.target.value })} placeholder="00:00:00" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                {[{ l: t('mt_int_every_min'), v: '00:01:00' }, { l: t('mt_int_every_hour'), v: '01:00:00' }, { l: t('mt_int_every_6h'), v: '06:00:00' }, { l: t('mt_int_every_day'), v: '1d 00:00:00' }, { l: t('mt_int_every_week'), v: '7d 00:00:00' }].map(opt => (
                  <button key={opt.v} onClick={() => setNewScheduler({ ...newScheduler, interval: opt.v })}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid', borderColor: newScheduler.interval === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: newScheduler.interval === opt.v ? 'var(--primary-light)' : '#fff', color: newScheduler.interval === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_policy_label')}</label>
              <select value={newScheduler.policy} onChange={(e: any) => setNewScheduler({ ...newScheduler, policy: e.target.value })} style={selectStyle}>
                <option value="read,write,reboot">read, write, reboot</option>
                <option value="read,write">read, write</option>
                <option value="read,write,reboot,policy,sensitive">Full</option>
                <option value="read">read only</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_on_event_star')}</label>
              <textarea value={newScheduler.on_event} onChange={(e: any) => setNewScheduler({ ...newScheduler, on_event: e.target.value })}
                placeholder={`# ${t('mt_examples_label')}\n/ip hotspot user remove [find comment~"Batch" uptime>1h]`} style={textareaStyle} />
              <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#a5b4fc', overflowX: 'auto' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icons.Bulb size={12} /> {t('mt_examples_label_full')}</span>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[{ l: t('mt_ex_log_message'), v: ':log info "Scheduler imefanya kazi"' }, { l: t('mt_ex_remove_used_users'), v: '/ip hotspot user remove [find comment~"used"]' }, { l: t('mt_ex_reboot_router'), v: '/system reboot' }].map((ex, i) => (
                    <button key={i} onClick={() => setNewScheduler({ ...newScheduler, on_event: ex.v })}
                      style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#e0e7ff', fontSize: 11 }}>
                      <span style={{ color: '#818cf8' }}>{ex.l}:</span> <code>{ex.v}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Input label={t('mt_comment_optional')} placeholder={t('mt_scheduler_comment_hint')} value={newScheduler.comment} onChange={(e: any) => setNewScheduler({ ...newScheduler, comment: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>{t('mt_initial_status')}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ v: 'false', l: t('mt_enable'), Ico: Icons.Play }, { v: 'true', l: t('mt_disable'), Ico: Icons.Pause }].map(opt => (
                  <button key={opt.v} onClick={() => setNewScheduler({ ...newScheduler, disabled: opt.v })}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid', borderColor: newScheduler.disabled === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: newScheduler.disabled === opt.v ? 'var(--primary-light)' : '#fff', color: newScheduler.disabled === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <opt.Ico size={12} /> {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddScheduler(false)}>{t('cancel')}</Button>
              <Button onClick={handleSaveScheduler} disabled={savingScheduler} icon={savingScheduler ? undefined : (editScheduler ? <Icons.Save size={13} /> : <Icons.Plus size={13} />)}>{savingScheduler ? <Spinner size={14} /> : (editScheduler ? t('mt_update_btn') : t('mt_add_scheduler_btn'))}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── CONFIRM DIALOGS ── */}
      <ConfirmDialog open={!!confirmDisconnect} onClose={() => setConfirmDisconnect(null)} onConfirm={() => confirmDisconnect && handleDisconnect(confirmDisconnect)} title={t('mt_disconnect_confirm_title')} message={t('mt_disconnect_confirm_msg')} danger />
      <ConfirmDialog open={!!confirmDeleteUser} onClose={() => setConfirmDeleteUser(null)} onConfirm={() => confirmDeleteUser && handleDeleteUser(confirmDeleteUser)} title={t('delete_user')} message={`${t('mt_confirm_delete_user_msg_prefix')} "${confirmDeleteUser}"?`} danger />
      <ConfirmDialog open={!!confirmDeleteBinding} onClose={() => setConfirmDeleteBinding(null)} onConfirm={() => confirmDeleteBinding && handleDeleteBinding(confirmDeleteBinding)} title={t('mt_remove_binding_title')} message={t('mt_remove_binding_msg')} danger />
      <ConfirmDialog open={!!confirmDeleteWG} onClose={() => setConfirmDeleteWG(null)} onConfirm={() => confirmDeleteWG && handleDeleteWG(confirmDeleteWG)} title={t('mt_remove_wg_title')} message={t('mt_remove_wg_msg')} danger />
      <ConfirmDialog open={!!confirmDeleteWGIP} onClose={() => setConfirmDeleteWGIP(null)} onConfirm={() => confirmDeleteWGIP && handleDeleteWGIP(confirmDeleteWGIP)} title={t('mt_remove_wgip_title')} message={t('mt_remove_wgip_msg')} danger />
      <ConfirmDialog open={!!confirmDeleteCookie} onClose={() => setConfirmDeleteCookie(null)} onConfirm={() => confirmDeleteCookie && handleDeleteCookie(confirmDeleteCookie)} title={t('mt_remove_cookie_title')} message={t('mt_remove_cookie_msg')} danger />
      <ConfirmDialog open={confirmClearCookies} onClose={() => setConfirmClearCookies(false)} onConfirm={handleClearAllCookies} title={t('mt_clear_cookies_title')} message={t('mt_clear_cookies_msg')} danger />
      <ConfirmDialog open={!!confirmDeleteScheduler} onClose={() => setConfirmDeleteScheduler(null)} onConfirm={() => confirmDeleteScheduler && handleDeleteScheduler(confirmDeleteScheduler)} title={t('mt_delete_scheduler_title')} message={t('mt_delete_scheduler_msg')} danger />
      <ConfirmDialog
        open={confirmBulkDeleteUsers}
        onClose={() => setConfirmBulkDeleteUsers(false)}
        onConfirm={handleBulkDeleteUsers}
        title={t('mt_bulk_delete_title')}
        message={`${t('mt_bulk_delete_msg_prefix')} ${selectedUserNames.size} ${t('mt_bulk_delete_msg_suffix')}${bulkDeleting ? ` ${t('mt_deleting')}` : ''}`}
        danger
      />

      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        @keyframes livepulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes tooltipIn { from { opacity:0; transform:translate(-50%,2px) } to { opacity:1; transform:translate(-50%,0) } }

        .card-header-row { }

        @media (max-width: 640px) {
          .card-header-row { flex-direction: column; align-items: stretch !important; }
        }

        /* ── Mobile responsiveness pass ── */
        @media (max-width: 640px) {
          .mtk-toolbar-row { flex-direction: column; align-items: stretch !important; }
          .mtk-toolbar-row > button { align-self: flex-start; }
          .mtk-modal-overlay { padding: 0.5rem !important; align-items: flex-end !important; }
          .mtk-modal-box { max-width: 100% !important; width: 100% !important; padding: 1rem !important; border-radius: 14px 14px 0 0 !important; max-height: 94vh !important; }
          .mtk-modal-header { padding: 0.85rem 1rem !important; }
          .mtk-modal-footer { padding: 0.75rem 1rem !important; }
          .mtk-modal-footer > div { width: 100%; }
        }

        @media (max-width: 400px) {
          .mtk-modal-footer button, .mtk-modal-footer > div { width: 100%; }
        }
      `}</style>
    </div>
  )
}

// ── FEATURE LABELS ────────────────────────────────────────
// Stores translation KEYS (labelKey/descKey), resolved with t() at render.
const FEATURE_LABELS: Record<string, { labelKey: string; icon: ReactNode; descKey: string }> = {
  servers:          { labelKey: 'mt_hotspot_servers',  icon: <Icons.Server size={16} />,   descKey: 'mt_feature_desc_servers' },
  server_profiles:  { labelKey: 'mt_server_profiles',  icon: <Icons.Clipboard size={16} />, descKey: 'mt_feature_desc_server_profiles' },
  users:            { labelKey: 'hotspot_users',       icon: <Icons.User size={16} />,      descKey: 'mt_feature_desc_users' },
  active:           { labelKey: 'active_sessions',     icon: <Icons.Circle size={10} />,    descKey: 'mt_feature_desc_active' },
  hosts:            { labelKey: 'mt_hosts_title',      icon: <Icons.Monitor size={16} />,   descKey: 'mt_feature_desc_hosts' },
  ip_bindings:      { labelKey: 'mt_ip_bindings',      icon: <Icons.Link size={16} />,      descKey: 'mt_feature_desc_ip_bindings' },
  walled_garden:    { labelKey: 'mt_walled_garden',    icon: <Icons.Globe size={16} />,     descKey: 'mt_feature_desc_walled_garden' },
  walled_garden_ip: { labelKey: 'mt_walled_garden_ip', icon: <Icons.Globe2 size={16} />,    descKey: 'mt_feature_desc_walled_garden_ip' },
  cookies:          { labelKey: 'mt_cookies',          icon: <Icons.Cookie size={16} />,    descKey: 'mt_feature_desc_cookies' },
  scheduler:        { labelKey: 'mt_scheduler',        icon: <Icons.Clock size={16} />,     descKey: 'mt_feature_desc_scheduler' },
  terminal:         { labelKey: 'mt_terminal_tab',     icon: <Icons.Terminal size={16} />,  descKey: 'mt_feature_desc_terminal' },
}

function RouterCard({ router, onSelect }: { router: any; onSelect: () => void }) {
  const { t } = useLang()
  return (
    <div onClick={onSelect}
      style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: `2px solid ${router.is_online ? 'var(--success)' : 'var(--gray-200)'}`, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: 'var(--card-shadow)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--primary)' }}>
        <Icons.Router size={24} />
        <Badge text={router.is_online ? t('online') : t('offline')} color={router.is_online ? 'green' : 'red'} />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{router.name}</h3>
      {router.client_name && <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{router.client_name}</p>}
      <code style={{ fontSize: 11, color: 'var(--gray-400)' }}>{router.host}:{router.api_port}</code>
      <div style={{ marginTop: '0.9rem', padding: '7px 12px', background: 'var(--primary-light)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--primary-dark)', textAlign: 'center' }}>{t('manage')} →</div>
    </div>
  )
}

export function ClientMikroTikPage() {
  const { t } = useLang()
  const [routers, setRouters] = useState<any[]>([])
  const [selectedRouter, setSelectedRouter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [allowedTabs, setAllowedTabs] = useState<Tab[]>([])

  useEffect(() => {
    Promise.all([api.get('/routers/'), api.get('/clients/my-mikrotik-permissions/')]).then(([r, p]) => {
      setRouters(r.data.results || r.data)
      setAllowedTabs(p.data.mikrotik_permissions || [])
      setLoading(false)
    })
  }, [])

  return (
    <Layout>
      <div style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
        {!selectedRouter ? (
          <>
            <PageHeader title={t('mikrotik_mgmt')} subtitle={t('mt_mikrotik_by_client_subtitle')} />
            {!loading && allowedTabs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {allowedTabs.map(key => {
                  const f = FEATURE_LABELS[key]
                  return f ? (
                    <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: 12, color: '#166534', fontWeight: 600 }}>
                      {f.icon} {t(f.labelKey)}
                    </span>
                  ) : null
                })}
              </div>
            )}
            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>
              : allowedTabs.length === 0
                ? <div style={{ textAlign: 'center', padding: '4rem 1.25rem', color: 'var(--gray-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icons.Lock size={40} /></div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>{t('mt_no_permission_title_short')}</div>
                    <div style={{ fontSize: 13 }}>{t('mt_no_permission_contact_short')}</div>
                  </div>
                : routers.length === 0
                  ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Router size={32} /></div>{t('mt_no_routers_short')}</div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                      {routers.map(r => <RouterCard key={r.id} router={r} onSelect={() => setSelectedRouter(r.id)} />)}
                    </div>
            }
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRouter(null)} icon={<Icons.ArrowLeft size={13} />}>{t('mt_back')}</Button>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{routers.find(r => r.id === selectedRouter)?.name}</span>
            </div>
            <MikroTikManager routerId={selectedRouter} allowedTabs={allowedTabs} />
          </>
        )}
      </div>
    </Layout>
  )
}

export function AdminMikroTikPage() {
  const { t } = useLang()
  const [routers, setRouters] = useState<any[]>([])
  const [selectedRouter, setSelectedRouter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const allTabs = ALL_TABS.map(tb => tb.key) as Tab[]

  useEffect(() => { api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) }) }, [])

  return (
    <Layout>
      <div style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
        {!selectedRouter ? (
          <>
            <PageHeader title={t('mikrotik_mgmt')} subtitle={t('mt_mikrotik_by_admin_subtitle')} />
            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                  {routers.map(r => <RouterCard key={r.id} router={r} onSelect={() => setSelectedRouter(r.id)} />)}
                </div>
            }
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRouter(null)} icon={<Icons.ArrowLeft size={13} />}>{t('mt_back')}</Button>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{routers.find(r => r.id === selectedRouter)?.name}</span>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{routers.find(r => r.id === selectedRouter)?.client_name}</span>
            </div>
            <MikroTikManager routerId={selectedRouter} allowedTabs={allTabs} />
          </>
        )}
      </div>
    </Layout>
  )
}

export function MikroTikPermissionsModal({ client, onClose, onSaved }: {
  client: any; onClose: () => void; onSaved: () => void
}) {
  const { t } = useLang()
  const [permissions, setPermissions] = useState<string[]>(client.mikrotik_permissions || [])
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const ALL_FEATURES = Object.keys(FEATURE_LABELS)

  const toggle = (key: string) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/clients/${client.id}/mikrotik-permissions/`, { permissions })
      onSaved(); onClose()
    } catch { setAlert({ type: 'error', msg: t('mt_save_failed') }) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'modalIn 0.2s ease' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Shield size={15} /> {t('mt_permissions_title')}</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{client.business_name}</p>
            </div>
            <IconButton icon={<Icons.X size={14} />} label={t('mt_funga')} onClick={onClose} />
          </div>
          {alert && <Alert type={alert.type} message={alert.msg} />}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setPermissions(ALL_FEATURES)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'transform 0.1s' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
              <Icons.Check size={12} /> {t('mt_select_all_features')}
            </button>
            <button onClick={() => setPermissions([])} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #fee2e2', background: '#fef2f2', color: '#991b1b', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'transform 0.1s' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
              <Icons.X size={12} /> {t('mt_clear_all_features')}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_FEATURES.map(key => {
            const f = FEATURE_LABELS[key]
            const checked = permissions.includes(key)
            return (
              <div key={key} onClick={() => toggle(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${checked ? '#6366f1' : 'var(--gray-200)'}`, background: checked ? '#eef2ff' : '#fafafa', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? '#6366f1' : 'var(--gray-300)'}`, background: checked ? '#6366f1' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s, border-color 0.15s' }}>
                  {checked && <span style={{ color: '#fff', display: 'flex' }}><Icons.Check size={12} /></span>}
                </div>
                <span style={{ display: 'flex', color: checked ? '#4338ca' : 'var(--gray-500)', flexShrink: 0 }}>{f.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: checked ? '#4338ca' : 'var(--gray-700)' }}>{t(f.labelKey)}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t(f.descKey)}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-100)', flexShrink: 0, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderRadius: '0 0 16px 16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{permissions.length} / {ALL_FEATURES.length} {t('mt_features_selected_suffix')}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>{t('mt_funga')}</Button>
            <Button onClick={handleSave} disabled={saving} icon={<Icons.Save size={13} />}>{saving ? t('mt_saving') : t('mt_hifadhi')}</Button>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  )
}
