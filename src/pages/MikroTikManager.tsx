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

const ALL_TABS = [
  { key: 'servers',          label: 'Servers',           icon: <Icons.Server size={14} /> },
  { key: 'server_profiles',  label: 'Server Profiles',   icon: <Icons.Clipboard size={14} /> },
  { key: 'users',            label: 'Users',             icon: <Icons.User size={14} /> },
  { key: 'active',           label: 'Active',            icon: <Icons.Circle size={9} /> },
  { key: 'hosts',            label: 'Hosts',             icon: <Icons.Monitor size={14} /> },
  { key: 'ip_bindings',      label: 'IP Bindings',       icon: <Icons.Link size={14} /> },
  { key: 'walled_garden',    label: 'Walled Garden',     icon: <Icons.Globe size={14} /> },
  { key: 'walled_garden_ip', label: 'Walled Garden IP',  icon: <Icons.Globe2 size={14} /> },
  { key: 'cookies',          label: 'Cookies',           icon: <Icons.Cookie size={14} /> },
  { key: 'scheduler',        label: 'Scheduler',         icon: <Icons.Clock size={14} /> },
  { key: 'terminal',         label: 'Terminal',          icon: <Icons.Terminal size={14} /> },
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
  return (
    <Tooltip label={editing ? 'Angalia tu (View)' : 'Hariri (Edit)'}>
      <button onClick={onToggle}
        style={{ padding: '4px 10px', borderRadius: 7, border: `1.5px solid ${editing ? 'var(--primary)' : 'var(--gray-200)'}`, background: editing ? 'var(--primary-light)' : '#fff', color: editing ? 'var(--primary-dark)' : 'var(--gray-500)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {editing ? <Icons.Eye size={13} /> : <Icons.Edit size={13} />} {editing ? 'View' : 'Edit'}
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

const QUICK_COMMANDS: { category: string; icon: ReactNode; commands: { label: string; cmd: string; params: Record<string, string> }[] }[] = [
  {
    category: 'System',
    icon: <Icons.Settings size={14} />,
    commands: [
      { label: 'Angalia Saa na Timezone', cmd: '/system/clock/print', params: {} },
      { label: 'Weka Timezone Nairobi', cmd: '/system/clock/set', params: { 'time-zone-name': 'Africa/Nairobi' } },
      { label: 'System Resources', cmd: '/system/resource/print', params: {} },
      { label: 'Router Identity', cmd: '/system/identity/print', params: {} },
      { label: 'RouterOS Version', cmd: '/system/routerboard/print', params: {} },
    ]
  },
  {
    category: 'Hotspot',
    icon: <Icons.Router size={14} />,
    commands: [
      { label: 'Hotspot Users (count)', cmd: '/ip/hotspot/user/print', params: {} },
      { label: 'Active Sessions', cmd: '/ip/hotspot/active/print', params: {} },
      { label: 'Schedulers Zote', cmd: '/system/scheduler/print', params: {} },
      { label: 'Hotspot Servers', cmd: '/ip/hotspot/print', params: {} },
    ]
  },
  {
    category: 'Network',
    icon: <Icons.Globe size={14} />,
    commands: [
      { label: 'IP Addresses', cmd: '/ip/address/print', params: {} },
      { label: 'Interfaces', cmd: '/interface/print', params: {} },
      { label: 'DNS Settings', cmd: '/ip/dns/print', params: {} },
      { label: 'Routes', cmd: '/ip/route/print', params: {} },
    ]
  },
]

function MikroTikTerminal({ routerId }: { routerId: number }) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: 'MikroTik Terminal — tayari kutumia', timestamp: new Date().toLocaleTimeString('sw-TZ') },
    { type: 'info', text: 'Tumia quick commands au andika command mwenyewe hapa chini.', timestamp: '' },
    { type: 'info', text: '─────────────────────────────────────────────────────', timestamp: '' },
  ])
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [activeCategory, setActiveCategory] = useState('System')
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
    if (!result) return '(hakuna matokeo)'
    if (typeof result === 'string') return result
    if (Array.isArray(result)) {
      if (result.length === 0) return '(orodha tupu)'
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
          outputLines.unshift({ type: 'info' as const, text: `✓ Matokeo: ${data.count} item(s)`, timestamp: '' })
        }
        addLines(outputLines)
      } else {
        addLine({ type: 'error', text: `✗ ${data.error || 'Command imeshindwa'}`, timestamp: now() })
      }
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || 'Hitilafu ya muunganiko'
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
      setLines([{ type: 'info', text: 'Terminal imefutwa.', timestamp: now() }])
    }
  }

  const clearTerminal = () => {
    setLines([{ type: 'info', text: 'Terminal imesafishwa. Tayari kutumia.', timestamp: now() }])
  }

  const lineColor = (type: TerminalLine['type']) => {
    if (type === 'input') return '#60a5fa'
    if (type === 'error') return '#f87171'
    if (type === 'info') return '#6b7280'
    return '#86efac'
  }

  const currentCategory = QUICK_COMMANDS.find(c => c.category === activeCategory)

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
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)' }}>Quick Commands</div>
        </div>
        {/* Category tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-100)' }}>
          {QUICK_COMMANDS.map(cat => (
            <button key={cat.category} onClick={() => setActiveCategory(cat.category)}
              style={{ flex: 1, padding: '7px 4px', border: 'none', background: activeCategory === cat.category ? 'var(--primary-light)' : '#fff', color: activeCategory === cat.category ? 'var(--primary-dark)' : 'var(--gray-500)', fontSize: 10, fontWeight: 700, cursor: 'pointer', borderBottom: activeCategory === cat.category ? '2px solid var(--primary)' : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s' }}>
              {cat.icon}
              <div>{cat.category}</div>
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
              {cmd.label}
            </button>
          ))}
        </div>
        {/* Help */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--gray-100)', background: '#fafafa' }}>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--gray-500)' }}>Keyboard:</strong><br />
            ↑↓ — history<br />
            Enter — run<br />
            Ctrl+L — clear
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
                Inatekeleza...
              </span>
            )}
            <Tooltip label="Futa skrini ya terminal">
              <button onClick={clearTerminal}
                style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #334155', background: 'none', color: '#94a3b8', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                <Icons.Trash size={12} /> Clear
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
              <span style={{ fontSize: 12 }}>Inasubiri jibu kutoka MikroTik...</span>
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
            placeholder="Andika command... (mfano: /ip/address/print)"
            style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontFamily: "'Courier New', monospace", fontSize: 13, caretColor: '#60a5fa' }}
            autoFocus
          />
          <button onClick={handleSubmit} disabled={running || !input.trim()}
            style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: running || !input.trim() ? '#334155' : '#3b82f6', color: running || !input.trim() ? '#64748b' : '#fff', fontSize: 12, fontWeight: 700, cursor: running || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: 'monospace', transition: 'background 0.15s', flexShrink: 0 }}>
            Run ↵
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
      setAlert({ type: 'success', msg: 'Profile imesasishwa ✓' }); setDirty(false); onSaved()
    } catch (e: any) { setAlert({ type: 'error', msg: e.response?.data?.error || 'Imeshindwa kuhifadhi' }) }
    finally { setSaving(false) }
  }

  const handleOK = async () => { if (dirty) await handleApply(); onClose() }

  const tabs = [{ key: 'general', label: 'General' }, { key: 'scripts', label: 'Scripts' }]

  return (
    <div className="mtk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="mtk-modal-box" style={{ background: '#fff', borderRadius: 14, maxWidth: 520, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
        <div className="mtk-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <Icons.Clipboard size={16} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Hotspot User Profile</div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 2, wordBreak: 'break-all' }}>{profile.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
            <IconButton icon={<Icons.X size={14} />} label="Funga" onClick={onClose} />
          </div>
        </div>
        {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          {activeTab === 'general' && (
            editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <EditRow label="Name" name="name" value={form.name} onChange={handleChange} mono />
                <EditRow label="Rate Limit" name="rate-limit" value={form['rate-limit']} onChange={handleChange} mono placeholder="e.g. 2M/2M" />
                <EditRow label="Session Timeout" name="session-timeout" value={form['session-timeout']} onChange={handleChange} placeholder="e.g. 1h / unlimited" />
                <EditRow label="Idle Timeout" name="idle-timeout" value={form['idle-timeout']} onChange={handleChange} placeholder="e.g. 30m / unlimited" />
                <EditRow label="Keepalive Timeout" name="keepalive-timeout" value={form['keepalive-timeout']} onChange={handleChange} />
                <EditRow label="Shared Users" name="shared-users" value={form['shared-users']} onChange={handleChange} type="number" placeholder="1" />
                <EditRow label="DNS Name" name="dns-name" value={form['dns-name']} onChange={handleChange} />
                <EditRow label="HTML Directory" name="html-directory" value={form['html-directory']} onChange={handleChange} mono />
                <EditRow label="HTTP Cookie Lifetime" name="http-cookie-lifetime" value={form['http-cookie-lifetime']} onChange={handleChange} />
                <EditRow label="Status Auto-Refresh" name="status-autorefresh" value={form['status-autorefresh']} onChange={handleChange} />
                <EditRow label="Address Pool" name="address-pool" value={form['address-pool']} onChange={handleChange} />
                <EditRow label="MAC Cookie Timeout" name="mac-cookie-timeout" value={form['mac-cookie-timeout']} onChange={handleChange} />
              </div>
            ) : (
              <div>
                <DetailRow label="Name" value={form.name} mono />
                <DetailRow label="Rate Limit" value={form['rate-limit'] || 'unlimited'} mono />
                <DetailRow label="Session Timeout" value={form['session-timeout'] || 'unlimited'} />
                <DetailRow label="Idle Timeout" value={form['idle-timeout'] || 'unlimited'} />
                <DetailRow label="Keepalive Timeout" value={form['keepalive-timeout'] || '—'} />
                <DetailRow label="Shared Users" value={form['shared-users'] || '1'} />
                <DetailRow label="DNS Name" value={form['dns-name'] || '—'} />
                <DetailRow label="HTML Directory" value={form['html-directory'] || '—'} mono />
                <DetailRow label="HTTP Cookie Lifetime" value={form['http-cookie-lifetime'] || '—'} />
                <DetailRow label="Status Auto-Refresh" value={form['status-autorefresh'] || '—'} />
                <DetailRow label="Transparent Proxy" value={form['transparent-proxy'] || '—'} />
                <DetailRow label="Address Pool" value={form['address-pool'] || '—'} />
                <DetailRow label="MAC Cookie Timeout" value={form['mac-cookie-timeout'] || '—'} />
              </div>
            )
          )}
          {activeTab === 'scripts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'On Login', key: 'on-login' }, { label: 'On Logout', key: 'on-logout' }].map(({ label, key }) => (
                <div key={key}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>{label}</div>
                  {editing ? (
                    <EditTextareaRow label={label} name={key} value={form[key] || ''} onChange={handleChange} placeholder={`# Script ya ${label.toLowerCase()}`} minHeight={120} />
                  ) : (
                    form[key] ? (
                      <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '10px 14px', overflowX: 'auto' }}>
                        <pre style={{ fontSize: 12, color: '#e0e7ff', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>{form[key]}</pre>
                      </div>
                    ) : (
                      <div style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>Hakuna script</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mtk-modal-footer" style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {editing && dirty && <Button variant="ghost" onClick={handleApply} disabled={saving} icon={saving ? undefined : <Icons.Save size={13} />}>{saving ? <Spinner size={14} /> : 'Apply'}</Button>}
          <Button onClick={handleOK} disabled={saving}>{saving ? <Spinner size={14} /> : 'OK'}</Button>
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
      setAlert({ type: 'success', msg: 'User imesasishwa ✓' }); setDirty(false); onSaved()
    } catch (e: any) { setAlert({ type: 'error', msg: e.response?.data?.error || 'Imeshindwa kuhifadhi' }) }
    finally { setSaving(false) }
  }

  const handleOK = async () => { if (dirty) await handleApply(); onClose() }

  const tabs = [{ key: 'general', label: 'General' }, { key: 'statistics', label: 'Statistics' }]
  const profileOptions = availableProfiles.length > 0
    ? availableProfiles.map(p => ({ value: p, label: p }))
    : [{ value: form.profile || 'default', label: form.profile || 'default' }]
  const disabledOptions = [
    { value: 'false', label: 'Active — mtumiaji anaweza kuingia' },
    { value: 'true', label: 'Disabled — mtumiaji amezuiwa' },
  ]

  return (
    <>
      <div className="mtk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div className="mtk-modal-box" style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
          <div className="mtk-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Icons.User size={16} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Hotspot User</div>
                <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginTop: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}>{user.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
              <IconButton icon={<Icons.X size={14} />} label="Funga" onClick={onClose} />
            </div>
          </div>
          {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            {activeTab === 'general' && (
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Name</div>
                    <div style={{ padding: '7px 10px', background: 'var(--gray-50)', borderRadius: 7, fontSize: 13, fontFamily: 'monospace', color: 'var(--gray-500)', border: '1.5px solid var(--gray-100)', wordBreak: 'break-all' }}>
                      {form.name} <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>(haiwezi kubadilika)</span>
                    </div>
                  </div>
                  <EditRow label="Password" name="password" value={form.password || ''} onChange={handleChange} mono placeholder="Weka password mpya" />
                  <EditSelectRow label="Profile" name="profile" value={form.profile || 'default'} options={profileOptions} onChange={handleChange} />
                  <EditRow label="Comment" name="comment" value={form.comment || ''} onChange={handleChange} placeholder="Jina la mteja au maelezo" />
                  <EditRow label="Limit Uptime" name="limit-uptime" value={form['limit-uptime'] || ''} onChange={handleChange} placeholder="e.g. 1h / unlimited" />
                  <EditRow label="Limit Bytes In" name="limit-bytes-in" value={form['limit-bytes-in'] || ''} onChange={handleChange} placeholder="bytes (0 = unlimited)" />
                  <EditRow label="Limit Bytes Out" name="limit-bytes-out" value={form['limit-bytes-out'] || ''} onChange={handleChange} placeholder="bytes (0 = unlimited)" />
                  <EditRow label="Limit Bytes Total" name="limit-bytes-total" value={form['limit-bytes-total'] || ''} onChange={handleChange} placeholder="bytes (0 = unlimited)" />
                  <EditRow label="MAC Address" name="mac-address" value={form['mac-address'] || ''} onChange={handleChange} mono placeholder="AA:BB:CC:DD:EE:FF" />
                  <EditRow label="IP Address" name="address" value={form.address || ''} onChange={handleChange} mono placeholder="192.168.1.100" />
                  <EditSelectRow label="Disabled" name="disabled" value={form.disabled || 'false'} options={disabledOptions} onChange={handleChange} />
                </div>
              ) : (
                <div>
                  <DetailRow label="Name" value={user.name} mono />
                  <DetailRow label="Password" value={user.password || '(hidden)'} mono />
                  <DetailRow label="Profile" value={<Badge text={form.profile || 'default'} color="indigo" />} />
                  <DetailRow label="Comment" value={form.comment || '—'} />
                  <DetailRow label="Limit Uptime" value={form['limit-uptime'] || 'unlimited'} />
                  <DetailRow label="Limit Bytes In" value={form['limit-bytes-in'] || 'unlimited'} />
                  <DetailRow label="Limit Bytes Out" value={form['limit-bytes-out'] || 'unlimited'} />
                  <DetailRow label="Limit Bytes Total" value={form['limit-bytes-total'] || 'unlimited'} />
                  <DetailRow label="MAC Address" value={form['mac-address'] || '—'} mono />
                  <DetailRow label="IP Address" value={form.address || '—'} mono />
                  <DetailRow label="Disabled" value={<Badge text={form.disabled === 'true' ? 'Yes' : 'No'} color={form.disabled === 'true' ? 'red' : 'green'} />} />
                </div>
              )
            )}
            {activeTab === 'statistics' && (
              <div>
                <DetailRow label="Uptime" value={user.uptime || '—'} />
                <DetailRow label="Bytes In" value={user['bytes-in'] ? `${Number(user['bytes-in']).toLocaleString()} B` : '—'} />
                <DetailRow label="Bytes Out" value={user['bytes-out'] ? `${Number(user['bytes-out']).toLocaleString()} B` : '—'} />
                <DetailRow label="Packets In" value={user['packets-in'] || '—'} />
                <DetailRow label="Packets Out" value={user['packets-out'] || '—'} />
                <DetailRow label="Last Logged In" value={user['last-logged-in'] || '—'} />
                {(!user.uptime && !user['bytes-in']) && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)', fontSize: 13 }}>
                    Hakuna statistics — user hajawahi kuingia
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mtk-modal-footer" style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Icons.Trash size={13} />}>Remove</Button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              {editing && dirty && <Button variant="ghost" onClick={handleApply} disabled={saving} icon={saving ? undefined : <Icons.Save size={13} />}>{saving ? <Spinner size={14} /> : 'Apply'}</Button>}
              <Button onClick={handleOK} disabled={saving}>{saving ? <Spinner size={14} /> : 'OK'}</Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete} onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(user.name); setConfirmDelete(false); onClose() }}
        title="Futa User" message={`Futa user "${user.name}"? Hatua hii haiwezi kurudishwa!`} danger
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
      setAlert({ type: 'success', msg: 'Scheduler imesasishwa ✓' }); setDirty(false); onSaved()
    } catch (e: any) { setAlert({ type: 'error', msg: e.response?.data?.error || 'Imeshindwa kuhifadhi' }) }
    finally { setSaving(false) }
  }

  const handleOK = async () => { if (dirty) await handleApply(); onClose() }

  const tabs = [{ key: 'general', label: 'General' }, { key: 'script', label: 'Script' }]
  const policyOptions = [
    { value: 'read,write,reboot', label: 'read, write, reboot' },
    { value: 'read,write', label: 'read, write' },
    { value: 'read,write,reboot,policy,sensitive', label: 'Full' },
    { value: 'read', label: 'read only' },
  ]
  const intervalPresets = [
    { l: 'Mara moja', v: '00:00:00' }, { l: 'Kila dakika', v: '00:01:00' },
    { l: 'Kila saa', v: '01:00:00' }, { l: 'Kila saa 6', v: '06:00:00' },
    { l: 'Kila siku', v: '1d 00:00:00' }, { l: 'Kila wiki', v: '7d 00:00:00' },
  ]

  return (
    <>
      <div className="mtk-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div className="mtk-modal-box" style={{ background: '#fff', borderRadius: 14, maxWidth: 540, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
          <div className="mtk-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Icons.Clock size={16} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Scheduler</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, wordBreak: 'break-all' }}>{scheduler.name}</span>
                  <Badge text={isDisabled ? 'Disabled' : 'Running'} color={isDisabled ? 'red' : 'green'} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
              <IconButton icon={<Icons.X size={14} />} label="Funga" onClick={onClose} />
            </div>
          </div>
          {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            {activeTab === 'general' && (
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <EditRow label="Name" name="name" value={form.name} onChange={handleChange} mono />
                  <EditRow label="Comment" name="comment" value={form.comment || ''} onChange={handleChange} placeholder="Maelezo ya scheduler" />
                  <EditRow label="Start Date" name="start-date" value={form['start-date'] || ''} onChange={handleChange} placeholder="jan/01/1970" mono />
                  <EditRow label="Start Time" name="start-time" value={form['start-time'] || ''} onChange={handleChange} placeholder="00:00:00" mono />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interval</label>
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
                  <EditSelectRow label="Policy" name="policy" value={form.policy || 'read,write,reboot'} options={policyOptions} onChange={handleChange} />
                  <EditSelectRow label="Status" name="disabled" value={form.disabled || 'false'}
                    options={[{ value: 'false', label: 'Enabled — inafanya kazi' }, { value: 'true', label: 'Disabled — imesimamishwa' }]}
                    onChange={handleChange} />
                </div>
              ) : (
                <div>
                  <DetailRow label="Name" value={scheduler.name} mono />
                  <DetailRow label="Comment" value={form.comment || '—'} />
                  <DetailRow label="Start Date" value={form['start-date'] || '—'} />
                  <DetailRow label="Start Time" value={form['start-time'] || '—'} mono />
                  <DetailRow label="Interval" value={form.interval || 'once'} mono />
                  <DetailRow label="Policy" value={form.policy || '—'} />
                  <DetailRow label="Run Count" value={<span style={{ fontWeight: 700, color: (scheduler['run-count'] || 0) > 0 ? '#059669' : 'var(--gray-400)' }}>{scheduler['run-count'] || '0'}</span>} />
                  <DetailRow label="Next Run" value={scheduler['next-run'] || '—'} />
                  <DetailRow label="Status" value={<Badge text={isDisabled ? 'Disabled' : 'Running'} color={isDisabled ? 'red' : 'green'} />} />
                </div>
              )
            )}
            {activeTab === 'script' && (
              <div>
                {editing ? (
                  <>
                    <EditTextareaRow label="On Event Script" name="on-event" value={form['on-event'] || ''} onChange={handleChange}
                      placeholder={`# Script ya scheduler\n# Mfano:\n/ip hotspot user remove [find comment~"Batch" uptime>1h]`} minHeight={180} />
                    <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '8px 12px', marginTop: 8, fontSize: 11, color: '#a5b4fc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icons.Bulb size={12} /> Mifano ya haraka:</span>
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[
                          { l: 'Log message', v: ':log info "Scheduler imefanya kazi"' },
                          { l: 'Futa used users', v: '/ip hotspot user remove [find comment~"used"]' },
                          { l: 'Reboot router', v: '/system reboot' },
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
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>On Event Script</div>
                    {form['on-event'] ? (
                      <div style={{ background: '#1e1b4b', borderRadius: 10, padding: '14px 16px', overflowX: 'auto' }}>
                        <pre style={{ fontSize: 13, color: '#e0e7ff', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.6 }}>{form['on-event']}</pre>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>Hakuna script</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mtk-modal-footer" style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon={<Icons.Trash size={13} />}>Remove</Button>
              <Button variant={isDisabled ? 'success' : 'warning'} size="sm" onClick={() => { onToggle(scheduler); onClose() }} icon={isDisabled ? <Icons.Play size={12} /> : <Icons.Pause size={12} />}>
                {isDisabled ? 'Enable' : 'Disable'}
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              {editing && dirty && <Button variant="ghost" onClick={handleApply} disabled={saving} icon={saving ? undefined : <Icons.Save size={13} />}>{saving ? <Spinner size={14} /> : 'Apply'}</Button>}
              <Button onClick={handleOK} disabled={saving}>{saving ? <Spinner size={14} /> : 'OK'}</Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete} onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(scheduler['.id']); setConfirmDelete(false); onClose() }}
        title="Futa Scheduler" message={`Futa scheduler "${scheduler.name}"? Script haitatekelezwa tena.`} danger
      />
    </>
  )
}

// ════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════
function MikroTikManager({ routerId, allowedTabs }: { routerId: number; allowedTabs: Tab[] }) {
  const { t } = useLang()
  const visibleTabs = ALL_TABS.filter(t => allowedTabs.includes(t.key as Tab))
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

  const [showAddBinding, setShowAddBinding] = useState(false)
  const [newBinding, setNewBinding]         = useState({ mac_address: '', ip_address: '', type: 'regular', comment: '' })

  const [showAddWG, setShowAddWG] = useState(false)
  const [newWG, setNewWG]         = useState({ dst_host: '', action: 'allow', comment: '' })

  const [showAddWGIP, setShowAddWGIP] = useState(false)
  const [newWGIP, setNewWGIP]         = useState({ dst_address: '', action: 'accept', comment: '' })

  const [showAddScheduler, setShowAddScheduler] = useState(false)
  const [editScheduler, setEditScheduler]       = useState<any>(null)
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
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>Huna ruhusa ya kufikia MikroTik Manager</div>
        <div style={{ fontSize: 13 }}>Wasiliana na admin wako kukupa ruhusa.</div>
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
      if (!silent) showAlrt('error', e.response?.data?.error || 'Hitilafu ya muunganiko')
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
      showAlrt('success', `User ${username} amefutwa ✓`); fetchTab('users')
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
      `Imefuta ${success} user(s)${failed ? `, imeshindwa kufuta ${failed}` : ''} ✓`)
    fetchTab('users')
  }

  const handleDisconnect = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/sessions/`, { data: { session_id: id } })
      showAlrt('success', 'Session imekatwa ✓'); fetchTab('active', true)
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddUser = async () => {
    if (!newUser.username) { showAlrt('error', 'Jaza username'); return }
    const payload = { ...newUser, password: newUser.password || newUser.username }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/users/`, payload)
      showAlrt('success', `User ${newUser.username} ameongezwa ✓`)
      setShowAddUser(false); setNewUser({ username: '', password: '', profile: '', comment: '' }); fetchTab('users')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteBinding = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/ip-bindings/`, { data: { binding_id: id } })
      showAlrt('success', 'IP Binding imefutwa ✓'); fetchTab('ip_bindings')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddBinding = async () => {
    if (!newBinding.mac_address) { showAlrt('error', 'Jaza MAC Address'); return }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/ip-bindings/`, newBinding)
      showAlrt('success', 'IP Binding imeongezwa ✓')
      setShowAddBinding(false); setNewBinding({ mac_address: '', ip_address: '', type: 'regular', comment: '' }); fetchTab('ip_bindings')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteWG = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/walled-garden/`, { data: { entry_id: id } })
      showAlrt('success', 'Walled Garden entry imefutwa ✓'); fetchTab('walled_garden')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddWG = async () => {
    if (!newWG.dst_host) { showAlrt('error', 'Jaza Dst Host'); return }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/walled-garden/`, newWG)
      showAlrt('success', `${newWG.dst_host} imeongezwa ✓`)
      setShowAddWG(false); setNewWG({ dst_host: '', action: 'allow', comment: '' }); fetchTab('walled_garden')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteWGIP = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/walled-garden-ip/`, { data: { entry_id: id } })
      showAlrt('success', 'Walled Garden IP imefutwa ✓'); fetchTab('walled_garden_ip')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddWGIP = async () => {
    if (!newWGIP.dst_address) { showAlrt('error', 'Jaza Dst Address'); return }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/walled-garden-ip/`, newWGIP)
      showAlrt('success', `${newWGIP.dst_address} imeongezwa ✓`)
      setShowAddWGIP(false); setNewWGIP({ dst_address: '', action: 'accept', comment: '' }); fetchTab('walled_garden_ip')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteCookie = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/cookies/`, { data: { cookie_id: id } })
      showAlrt('success', 'Cookie imefutwa ✓'); fetchTab('cookies')
    } catch { showAlrt('error', t('error')) }
  }

  const handleClearAllCookies = async () => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/cookies/`, { data: {} })
      showAlrt('success', 'Cookies zote zimefutwa ✓'); fetchTab('cookies')
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
    if (!newScheduler.name) { showAlrt('error', 'Jaza jina la scheduler'); return }
    if (!newScheduler.on_event) { showAlrt('error', 'Jaza script (On Event)'); return }
    try {
      if (editScheduler) {
        await api.patch(`/mikrotik/${routerId}/scheduler/`, { scheduler_id: editScheduler['.id'], ...newScheduler })
        showAlrt('success', `Scheduler "${newScheduler.name}" imesasishwa ✓`)
      } else {
        await api.post(`/mikrotik/${routerId}/scheduler/`, newScheduler)
        showAlrt('success', `Scheduler "${newScheduler.name}" imeongezwa ✓`)
      }
      setShowAddScheduler(false); setEditScheduler(null); fetchTab('scheduler')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteScheduler = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/scheduler/`, { data: { scheduler_id: id } })
      showAlrt('success', 'Scheduler imefutwa ✓'); fetchTab('scheduler')
    } catch { showAlrt('error', t('error')) }
  }

  const handleToggleScheduler = async (item: any) => {
    try {
      await api.patch(`/mikrotik/${routerId}/scheduler/`, { scheduler_id: item['.id'], disabled: item.disabled === 'true' ? 'false' : 'true' })
      showAlrt('success', `Scheduler ${item.disabled === 'true' ? 'imewashwa' : 'imezimwa'} ✓`)
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
      <IconButton icon={<Icons.X size={14} />} label="Funga" onClick={onClose} />
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
      Live · {countdown}s
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
            <Icons.Terminal size={16} /> <strong>MikroTik Terminal</strong> — Tekeleza commands moja kwa moja kwenye router yako.
            Commands zinatumwa salama kupitia API.
          </div>
          <MikroTikTerminal routerId={routerId} />
        </div>
      )}

      {loading && tab !== 'terminal' && <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>}

      {/* 1. SERVERS */}
      {!loading && tab === 'servers' && (
        <Card>
          <CardHeader title={`Hotspot Servers (${d?.count || 0})`} />
          <TableScroll>
          <Table headers={['Name', 'Interface', 'Address Pool', 'Profile', 'Idle Timeout', 'Status']}
            rows={(d?.servers || []).map((s: any) => [
              <strong>{s.name || '—'}</strong>, s.interface || '—', s['address-pool'] || '—',
              <Badge text={s.profile || 'default'} color="indigo" />, s['idle-timeout'] || '—',
              <Badge text={s.disabled === 'true' ? 'Disabled' : 'Running'} color={s.disabled === 'true' ? 'red' : 'green'} />,
            ])} emptyMessage="Hakuna hotspot servers" />
          </TableScroll>
        </Card>
      )}

      {/* 2. SERVER PROFILES */}
      {!loading && tab === 'server_profiles' && (
        <Card>
          <CardHeader title={`Server Profiles (${(d?.profiles || []).length})`} />
          <div style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Bulb size={13} /> Bonyeza profile yoyote kuona na kuhariri maelezo yake (General, Scripts)
          </div>
          <TableScroll>
          <Table headers={['Name', 'Rate Limit', 'Session Timeout', 'Shared Users', 'On Login Script', '']}
            rows={(d?.profiles || []).map((p: any) => [
              <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setSelectedProfile(p)}>{p.name}</strong>,
              p['rate-limit'] || <span style={{ color: 'var(--gray-400)' }}>unlimited</span>,
              p['session-timeout'] || <span style={{ color: 'var(--gray-400)' }}>unlimited</span>,
              p['shared-users'] || '1',
              p['on-login'] ? <Badge text="Ipo" color="green" /> : <Badge text="Hakuna" color="gray" />,
              <IconButton icon={<Icons.Edit size={14} />} label="Hariri Profile" onClick={() => setSelectedProfile(p)} />,
            ])} emptyMessage="Hakuna server profiles" />
          </TableScroll>
        </Card>
      )}

      {/* 3. USERS */}
      {!loading && tab === 'users' && (
        <Card>
          <CardHeader title={`Users (${d?.count || 0})`} action={<Button size="sm" onClick={openAddUser} icon={<Icons.Plus size={13} />}>{t('add_user')}</Button>} />

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0 1rem 1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex' }}><Icons.Search size={14} /></span>
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Tafuta kwa username, comment au profile..."
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
              />
            </div>
            {selectedUserNames.size > 0 && (
              <>
                <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>
                  {selectedUserNames.size} zimechaguliwa
                </span>
                <Button size="sm" variant="danger" onClick={() => setConfirmBulkDeleteUsers(true)} icon={<Icons.Trash size={13} />}>
                  Futa zilizochaguliwa
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedUserNames(new Set())}>
                  Ondoa uchaguzi
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
                {allFilteredSelected ? 'Ondoa uchaguzi wote' : `Chagua wote (${filteredUsers.length})`}
              </span>
            </div>
          )}

          <div style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Bulb size={13} /> Bonyeza jina la user kuona na kuhariri maelezo yake
          </div>

          <TableScroll>
          <Table
            headers={['', 'Name', 'Profile', 'Limit Uptime', 'Uptime / Hali', 'Comment', 'Status', '']}
            rows={filteredUsers.map((u: any) => {
              const currentUptime = u.uptime || ''
              const lastLogin     = u['last-logged-in'] || ''
              const hasStarted    = currentUptime && currentUptime !== '00:00:00'
              const neverUsed     = !currentUptime && !lastLogin

              let usageBadge: any
              if (neverUsed) {
                usageBadge = (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                    <Icons.Circle size={6} /> Haijatumika
                  </span>
                )
              } else if (hasStarted) {
                usageBadge = (
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                      <Icons.Play size={9} /> {currentUptime}
                    </span>
                    {lastLogin && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, whiteSpace: 'nowrap' }}>Login: {lastLogin}</div>}
                  </div>
                )
              } else {
                usageBadge = (
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                      <Icons.Pause size={9} /> Nje
                    </span>
                    {lastLogin && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2, whiteSpace: 'nowrap' }}>Mwisho: {lastLogin}</div>}
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
                  : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>unlimited</span>,
                usageBadge,
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.comment || '—'}</span>,
                <Badge text={u.disabled === 'true' ? 'Disabled' : 'Active'} color={u.disabled === 'true' ? 'red' : 'green'} />,
                <IconButton icon={<Icons.Edit size={14} />} label="Hariri User" onClick={() => setSelectedUser(u)} />,
              ]
            })}
            emptyMessage={userSearch ? `Hakuna user inayofanana na "${userSearch}"` : 'Hakuna users'}
          />
          </TableScroll>
        </Card>
      )}

      {/* 4. ACTIVE */}
      {!loading && tab === 'active' && (
        <Card>
          <CardHeader title={`Active (${d?.count || 0})`} action={<LiveBadge />} />
          {(d?.sessions || []).length === 0
            ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Circle size={30} /></div>Hakuna active sessions</div>
            : <TableScroll><Table headers={['User', 'MAC Address', 'IP Address', 'Uptime', 'TX Bytes', 'RX Bytes', 'Server', '']}
                rows={(d?.sessions || []).map((s: any) => [
                  <strong>{s.user || '—'}</strong>,
                  <code style={{ fontSize: 11 }}>{s['mac-address'] || '—'}</code>,
                  <code style={{ fontSize: 11 }}>{s.address || '—'}</code>,
                  s.uptime || '—', s['bytes-out'] || '0', s['bytes-in'] || '0', s.server || '—',
                  <IconButton icon={<Icons.X size={14} />} label="Kata Connection" variant="danger" onClick={() => setConfirmDisconnect(s['.id'])} />,
                ])} emptyMessage="Hakuna active sessions" /></TableScroll>
          }
        </Card>
      )}

      {/* 5. HOSTS */}
      {!loading && tab === 'hosts' && (
        <Card>
          <CardHeader title={`Hosts (${d?.count || 0})`} action={<LiveBadge />} />
          <TableScroll>
          <Table headers={['MAC Address', 'IP Address', 'Hostname', 'Server', 'Bridge', 'Status']}
            rows={(d?.hosts || []).map((h: any) => [
              <code style={{ fontSize: 11 }}>{h['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{h.address || '—'}</code>,
              h.hostname || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              h.server || '—', h.bridge || '—',
              <Badge text={h.authorized === 'true' ? 'authorized' : 'unauthorized'} color={h.authorized === 'true' ? 'green' : 'gray'} />,
            ])} emptyMessage="Hakuna hosts" />
          </TableScroll>
        </Card>
      )}

      {/* 6. IP BINDINGS */}
      {!loading && tab === 'ip_bindings' && (
        <Card>
          <CardHeader title={`IP Bindings (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddBinding(true)} icon={<Icons.Plus size={13} />}>Add Binding</Button>} />
          <TableScroll>
          <Table headers={['MAC Address', 'IP Address', 'Type', 'Comment', '']}
            rows={(d?.bindings || []).map((b: any) => [
              <code style={{ fontSize: 11 }}>{b['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{b.address || '—'}</code>,
              <Badge text={b.type || 'regular'} color={b.type === 'bypassed' ? 'green' : b.type === 'blocked' ? 'red' : 'blue'} />,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{b.comment || '—'}</span>,
              <IconButton icon={<Icons.Trash size={14} />} label="Futa Binding" variant="danger" onClick={() => setConfirmDeleteBinding(b['.id'])} />,
            ])} emptyMessage="Hakuna IP Bindings" />
          </TableScroll>
        </Card>
      )}

      {/* 7. WALLED GARDEN */}
      {!loading && tab === 'walled_garden' && (
        <Card>
          <CardHeader title={`Walled Garden (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddWG(true)} icon={<Icons.Plus size={13} />}>Add Entry</Button>} />
          <div style={{ padding: '8px 16px', background: 'var(--info-light)', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Globe size={13} /> Tovuti zinazoweza kufikiwa <strong>bila login</strong> (HTTP)
          </div>
          <TableScroll>
          <Table headers={['Dst Host', 'Action', 'Server', 'Path', 'Comment', '']}
            rows={(d?.entries || []).map((e: any) => [
              <code style={{ fontSize: 12, color: 'var(--primary)' }}>{e['dst-host'] || '—'}</code>,
              <Badge text={e.action || 'allow'} color={e.action === 'deny' ? 'red' : 'green'} />,
              e.server || <span style={{ color: 'var(--gray-300)' }}>all</span>,
              e.path || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.comment || '—'}</span>,
              <IconButton icon={<Icons.Trash size={14} />} label="Futa Entry" variant="danger" onClick={() => setConfirmDeleteWG(e['.id'])} />,
            ])} emptyMessage="Hakuna Walled Garden entries" />
          </TableScroll>
        </Card>
      )}

      {/* 8. WALLED GARDEN IP */}
      {!loading && tab === 'walled_garden_ip' && (
        <Card>
          <CardHeader title={`Walled Garden IP List (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddWGIP(true)} icon={<Icons.Plus size={13} />}>Add IP</Button>} />
          <div style={{ padding: '8px 16px', background: 'var(--info-light)', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Globe2 size={13} /> IP addresses zinazoweza kufikiwa <strong>bila login</strong> (HTTPS/IP direct)
          </div>
          <TableScroll>
          <Table headers={['Dst Address', 'Action', 'Protocol', 'Server', 'Comment', '']}
            rows={(d?.entries || []).map((e: any) => [
              <code style={{ fontSize: 12, color: 'var(--primary)' }}>{e['dst-address'] || '—'}</code>,
              <Badge text={e.action || 'accept'} color={e.action === 'drop' ? 'red' : 'green'} />,
              e.protocol || <span style={{ color: 'var(--gray-300)' }}>any</span>,
              e.server || <span style={{ color: 'var(--gray-300)' }}>all</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.comment || '—'}</span>,
              <IconButton icon={<Icons.Trash size={14} />} label="Futa IP" variant="danger" onClick={() => setConfirmDeleteWGIP(e['.id'])} />,
            ])} emptyMessage="Hakuna Walled Garden IP entries" />
          </TableScroll>
        </Card>
      )}

      {/* 9. COOKIES */}
      {!loading && tab === 'cookies' && (
        <Card>
          <CardHeader title={`Cookies (${d?.count || 0})`}
            action={(d?.count || 0) > 0
              ? <Button size="sm" variant="danger" onClick={() => setConfirmClearCookies(true)} icon={<Icons.Trash size={13} />}>Clear All</Button>
              : undefined} />
          <div style={{ padding: '8px 16px', background: '#fff7ed', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Cookie size={13} /> Login cookies — ruhusu mtumiaji kuingia <strong>bila password</strong> tena
          </div>
          <TableScroll>
          <Table headers={['User', 'MAC Address', 'IP Address', 'Expires At', '']}
            rows={(d?.cookies || []).map((c: any) => [
              <strong>{c.user || '—'}</strong>,
              <code style={{ fontSize: 11 }}>{c['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{c.address || '—'}</code>,
              c['expires-at'] || '—',
              <IconButton icon={<Icons.Trash size={14} />} label="Futa Cookie" variant="danger" onClick={() => setConfirmDeleteCookie(c['.id'])} />,
            ])} emptyMessage="Hakuna cookies" />
          </TableScroll>
        </Card>
      )}

      {/* 10. SCHEDULER */}
      {!loading && tab === 'scheduler' && (
        <Card>
          <CardHeader title={`Scheduler (${(d?.schedulers || []).length})`} action={<Button size="sm" onClick={openAddScheduler} icon={<Icons.Plus size={13} />}>Add Schedule</Button>} />
          <div style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Clock size={13} /> Bonyeza scheduler kuona na kuhariri script yake kamili
          </div>
          <TableScroll>
          <Table
            headers={['Name', 'Start Date', 'Start Time', 'Interval', 'Run Count', 'Next Run', 'Status', '']}
            rows={(d?.schedulers || []).map((s: any) => [
              <div style={{ cursor: 'pointer', minWidth: 80 }} onClick={() => setSelectedScheduler(s)}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', textDecoration: 'underline dotted' }}>{s.name}</div>
                {s.comment && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 1 }}>{s.comment}</div>}
              </div>,
              s['start-date'] ? <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{s['start-date']}</span> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>,
              s['start-time'] ? <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{s['start-time']}</span> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>,
              s.interval && s.interval !== '00:00:00' ? <Badge text={s.interval} color="blue" /> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>once</span>,
              <span style={{ fontWeight: 700, color: (s['run-count'] || 0) > 0 ? '#059669' : 'var(--gray-400)', fontSize: 13 }}>{s['run-count'] || '0'}</span>,
              s['next-run'] ? <span style={{ fontSize: 11, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{s['next-run']}</span> : <span style={{ color: 'var(--gray-300)', fontSize: 11 }}>—</span>,
              <Badge text={s.disabled === 'true' ? 'Disabled' : 'Running'} color={s.disabled === 'true' ? 'red' : 'green'} />,
              <div style={{ display: 'flex', gap: 2 }}>
                <IconButton icon={<Icons.Edit size={14} />} label="Hariri Scheduler" onClick={() => openEditScheduler(s)} />
                <IconButton icon={s.disabled === 'true' ? <Icons.Play size={13} /> : <Icons.Pause size={13} />} label={s.disabled === 'true' ? 'Washa (Enable)' : 'Zima (Disable)'} variant={s.disabled === 'true' ? 'success' : 'warning'} onClick={() => handleToggleScheduler(s)} />
                <IconButton icon={<Icons.Trash size={14} />} label="Futa Scheduler" variant="danger" onClick={() => setConfirmDeleteScheduler(s['.id'])} />
              </div>,
            ])}
            emptyMessage="Hakuna schedulers"
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
            <Input label="Username *" placeholder="mtumiaji001" value={newUser.username} onChange={(e: any) => setNewUser({ ...newUser, username: e.target.value })} />
            <Input label="Password (default = username)" placeholder="Acha tupu" value={newUser.password} onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Profile {profilesLoading && <Spinner size={12} />}</label>
              {profilesLoading
                ? <div style={{ padding: '10px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)' }}>Inapakia...</div>
                : <select value={newUser.profile} onChange={(e: any) => setNewUser({ ...newUser, profile: e.target.value })} style={selectStyle}>
                    {availableProfiles.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>}
            </div>
            <Input label="Comment (optional)" placeholder="Jina la mteja" value={newUser.comment} onChange={(e: any) => setNewUser({ ...newUser, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddUser(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddUser} disabled={profilesLoading} icon={<Icons.Plus size={13} />}>{t('save')}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD BINDING MODAL ── */}
      {showAddBinding && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader('Add IP Binding', () => setShowAddBinding(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="MAC Address *" placeholder="AA:BB:CC:DD:EE:FF" value={newBinding.mac_address} onChange={(e: any) => setNewBinding({ ...newBinding, mac_address: e.target.value })} />
            <Input label="IP Address (optional)" placeholder="192.168.20.100" value={newBinding.ip_address} onChange={(e: any) => setNewBinding({ ...newBinding, ip_address: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Type</label>
              <select value={newBinding.type} onChange={(e: any) => setNewBinding({ ...newBinding, type: e.target.value })} style={selectStyle}>
                <option value="regular">Regular — mtumiaji wa kawaida</option>
                <option value="bypassed">Bypassed — anaruhusiwa bila login</option>
                <option value="blocked">Blocked — amezuiwa kabisa</option>
              </select>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo" value={newBinding.comment} onChange={(e: any) => setNewBinding({ ...newBinding, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddBinding(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddBinding} icon={<Icons.Plus size={13} />}>Add Binding</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD WALLED GARDEN MODAL ── */}
      {showAddWG && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader('Add Walled Garden Entry', () => setShowAddWG(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Dst Host *" placeholder="example.com au *.example.com" value={newWG.dst_host} onChange={(e: any) => setNewWG({ ...newWG, dst_host: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Action</label>
              <select value={newWG.action} onChange={(e: any) => setNewWG({ ...newWG, action: e.target.value })} style={selectStyle}>
                <option value="allow">Allow — ruhusu bila login</option>
                <option value="deny">Deny — zuia</option>
              </select>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo" value={newWG.comment} onChange={(e: any) => setNewWG({ ...newWG, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddWG(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddWG} icon={<Icons.Plus size={13} />}>Add Entry</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD WALLED GARDEN IP MODAL ── */}
      {showAddWGIP && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBox}>
          {modalHeader('Add Walled Garden IP', () => setShowAddWGIP(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Dst Address *" placeholder="8.8.8.8 au 192.168.1.0/24" value={newWGIP.dst_address} onChange={(e: any) => setNewWGIP({ ...newWGIP, dst_address: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Action</label>
              <select value={newWGIP.action} onChange={(e: any) => setNewWGIP({ ...newWGIP, action: e.target.value })} style={selectStyle}>
                <option value="accept">Accept — ruhusu</option>
                <option value="drop">Drop — zuia</option>
              </select>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo" value={newWGIP.comment} onChange={(e: any) => setNewWGIP({ ...newWGIP, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddWGIP(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddWGIP} icon={<Icons.Plus size={13} />}>Add IP</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── ADD/EDIT SCHEDULER MODAL ── */}
      {showAddScheduler && (
        <div className="mtk-modal-overlay" style={modalOverlay}><div className="mtk-modal-box" style={modalBoxLg}>
          {modalHeader(editScheduler ? `Edit: ${editScheduler.name}` : 'Add Scheduler', () => setShowAddScheduler(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Name *" placeholder="mfano: cleanup-daily" value={newScheduler.name} onChange={(e: any) => setNewScheduler({ ...newScheduler, name: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <label style={labelStyle}>Start Date</label>
                <input value={newScheduler.start_date} onChange={(e: any) => setNewScheduler({ ...newScheduler, start_date: e.target.value })} placeholder="jan/01/1970" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Format: jan/01/1970</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <label style={labelStyle}>Start Time</label>
                <input value={newScheduler.start_time} onChange={(e: any) => setNewScheduler({ ...newScheduler, start_time: e.target.value })} placeholder="00:00:00" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Format: HH:MM:SS</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Interval (00:00:00 = mara moja tu)</label>
              <input value={newScheduler.interval} onChange={(e: any) => setNewScheduler({ ...newScheduler, interval: e.target.value })} placeholder="00:00:00" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                {[{ l: 'Kila dakika', v: '00:01:00' }, { l: 'Kila saa', v: '01:00:00' }, { l: 'Kila saa 6', v: '06:00:00' }, { l: 'Kila siku', v: '1d 00:00:00' }, { l: 'Kila wiki', v: '7d 00:00:00' }].map(opt => (
                  <button key={opt.v} onClick={() => setNewScheduler({ ...newScheduler, interval: opt.v })}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid', borderColor: newScheduler.interval === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: newScheduler.interval === opt.v ? 'var(--primary-light)' : '#fff', color: newScheduler.interval === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Policy</label>
              <select value={newScheduler.policy} onChange={(e: any) => setNewScheduler({ ...newScheduler, policy: e.target.value })} style={selectStyle}>
                <option value="read,write,reboot">read, write, reboot</option>
                <option value="read,write">read, write</option>
                <option value="read,write,reboot,policy,sensitive">Full</option>
                <option value="read">read only</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>On Event (Script) *</label>
              <textarea value={newScheduler.on_event} onChange={(e: any) => setNewScheduler({ ...newScheduler, on_event: e.target.value })}
                placeholder={`# Mfano:\n/ip hotspot user remove [find comment~"Batch" uptime>1h]`} style={textareaStyle} />
              <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#a5b4fc', overflowX: 'auto' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icons.Bulb size={12} /> Mifano:</span>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[{ l: 'Log message', v: ':log info "Scheduler imefanya kazi"' }, { l: 'Futa used users', v: '/ip hotspot user remove [find comment~"used"]' }, { l: 'Reboot router', v: '/system reboot' }].map((ex, i) => (
                    <button key={i} onClick={() => setNewScheduler({ ...newScheduler, on_event: ex.v })}
                      style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#e0e7ff', fontSize: 11 }}>
                      <span style={{ color: '#818cf8' }}>{ex.l}:</span> <code>{ex.v}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo ya scheduler" value={newScheduler.comment} onChange={(e: any) => setNewScheduler({ ...newScheduler, comment: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Hali ya Awali</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ v: 'false', l: 'Enabled', Ico: Icons.Play }, { v: 'true', l: 'Disabled', Ico: Icons.Pause }].map(opt => (
                  <button key={opt.v} onClick={() => setNewScheduler({ ...newScheduler, disabled: opt.v })}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid', borderColor: newScheduler.disabled === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: newScheduler.disabled === opt.v ? 'var(--primary-light)' : '#fff', color: newScheduler.disabled === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <opt.Ico size={12} /> {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddScheduler(false)}>{t('cancel')}</Button>
              <Button onClick={handleSaveScheduler} icon={editScheduler ? <Icons.Save size={13} /> : <Icons.Plus size={13} />}>{editScheduler ? 'Sasisha' : 'Ongeza Scheduler'}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {/* ── CONFIRM DIALOGS ── */}
      <ConfirmDialog open={!!confirmDisconnect} onClose={() => setConfirmDisconnect(null)} onConfirm={() => confirmDisconnect && handleDisconnect(confirmDisconnect)} title="Disconnect Session" message="Una uhakika unataka kukata connection hii?" danger />
      <ConfirmDialog open={!!confirmDeleteUser} onClose={() => setConfirmDeleteUser(null)} onConfirm={() => confirmDeleteUser && handleDeleteUser(confirmDeleteUser)} title={t('delete_user')} message={`Futa user "${confirmDeleteUser}"?`} danger />
      <ConfirmDialog open={!!confirmDeleteBinding} onClose={() => setConfirmDeleteBinding(null)} onConfirm={() => confirmDeleteBinding && handleDeleteBinding(confirmDeleteBinding)} title="Remove IP Binding" message="Una uhakika unataka kufuta IP Binding hii?" danger />
      <ConfirmDialog open={!!confirmDeleteWG} onClose={() => setConfirmDeleteWG(null)} onConfirm={() => confirmDeleteWG && handleDeleteWG(confirmDeleteWG)} title="Remove Walled Garden" message="Una uhakika unataka kufuta entry hii?" danger />
      <ConfirmDialog open={!!confirmDeleteWGIP} onClose={() => setConfirmDeleteWGIP(null)} onConfirm={() => confirmDeleteWGIP && handleDeleteWGIP(confirmDeleteWGIP)} title="Remove Walled Garden IP" message="Una uhakika unataka kufuta IP hii?" danger />
      <ConfirmDialog open={!!confirmDeleteCookie} onClose={() => setConfirmDeleteCookie(null)} onConfirm={() => confirmDeleteCookie && handleDeleteCookie(confirmDeleteCookie)} title="Remove Cookie" message="Futa cookie hii? Mtumiaji atalazimika kuingia tena." danger />
      <ConfirmDialog open={confirmClearCookies} onClose={() => setConfirmClearCookies(false)} onConfirm={handleClearAllCookies} title="Clear All Cookies" message="Futa cookies ZOTE? Watumiaji wote watalazimika kuingia tena." danger />
      <ConfirmDialog open={!!confirmDeleteScheduler} onClose={() => setConfirmDeleteScheduler(null)} onConfirm={() => confirmDeleteScheduler && handleDeleteScheduler(confirmDeleteScheduler)} title="Futa Scheduler" message="Futa scheduler hii? Script haitatekelezwa tena." danger />
      <ConfirmDialog
        open={confirmBulkDeleteUsers}
        onClose={() => setConfirmBulkDeleteUsers(false)}
        onConfirm={handleBulkDeleteUsers}
        title="Futa Users Walizochaguliwa"
        message={`Una uhakika unataka kufuta ${selectedUserNames.size} user(s)? Hatua hii haiwezi kurudishwa!${bulkDeleting ? ' Inafuta...' : ''}`}
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
const FEATURE_LABELS: Record<string, { label: string; icon: ReactNode; desc: string }> = {
  servers:          { label: 'Servers',          icon: <Icons.Server size={16} />,   desc: 'Ona hotspot servers' },
  server_profiles:  { label: 'Server Profiles',  icon: <Icons.Clipboard size={16} />, desc: 'Ona server profiles' },
  users:            { label: 'Users',            icon: <Icons.User size={16} />,      desc: 'Simamia hotspot users' },
  active:           { label: 'Active Sessions',  icon: <Icons.Circle size={10} />,    desc: 'Ona na kata sessions' },
  hosts:            { label: 'Hosts',            icon: <Icons.Monitor size={16} />,   desc: 'Vifaa vilivyounganika' },
  ip_bindings:      { label: 'IP Bindings',      icon: <Icons.Link size={16} />,      desc: 'Simamia IP bindings' },
  walled_garden:    { label: 'Walled Garden',    icon: <Icons.Globe size={16} />,     desc: 'Tovuti bila login (HTTP)' },
  walled_garden_ip: { label: 'Walled Garden IP', icon: <Icons.Globe2 size={16} />,    desc: 'IPs bila login (HTTPS)' },
  cookies:          { label: 'Cookies',          icon: <Icons.Cookie size={16} />,    desc: 'Simamia login cookies' },
  scheduler:        { label: 'Scheduler',        icon: <Icons.Clock size={16} />,     desc: 'Scripts za wakati maalum' },
  terminal:         { label: 'Terminal',         icon: <Icons.Terminal size={16} />,  desc: 'Run commands moja kwa moja' },
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
            <PageHeader title={t('mikrotik_mgmt')} subtitle="IP → Hotspot (kama Winbox)" />
            {!loading && allowedTabs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {allowedTabs.map(key => {
                  const f = FEATURE_LABELS[key]
                  return f ? (
                    <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: 12, color: '#166534', fontWeight: 600 }}>
                      {f.icon} {f.label}
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
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>Huna ruhusa ya MikroTik Manager</div>
                    <div style={{ fontSize: 13 }}>Wasiliana na admin kukupa ruhusa.</div>
                  </div>
                : routers.length === 0
                  ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Router size={32} /></div>Hakuna routers</div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                      {routers.map(r => <RouterCard key={r.id} router={r} onSelect={() => setSelectedRouter(r.id)} />)}
                    </div>
            }
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRouter(null)} icon={<Icons.ArrowLeft size={13} />}>Rudi</Button>
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
  const allTabs = ALL_TABS.map(t => t.key) as Tab[]

  useEffect(() => { api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) }) }, [])

  return (
    <Layout>
      <div style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
        {!selectedRouter ? (
          <>
            <PageHeader title={t('mikrotik_mgmt')} subtitle="Simamia routers zote za clients" />
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
              <Button variant="ghost" size="sm" onClick={() => setSelectedRouter(null)} icon={<Icons.ArrowLeft size={13} />}>Rudi</Button>
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
    } catch { setAlert({ type: 'error', msg: 'Imeshindwa kuhifadhi permissions' }) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'modalIn 0.2s ease' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Shield size={15} /> MikroTik Permissions</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{client.business_name}</p>
            </div>
            <IconButton icon={<Icons.X size={14} />} label="Funga" onClick={onClose} />
          </div>
          {alert && <Alert type={alert.type} message={alert.msg} />}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setPermissions(ALL_FEATURES)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'transform 0.1s' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
              <Icons.Check size={12} /> Chagua Zote
            </button>
            <button onClick={() => setPermissions([])} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #fee2e2', background: '#fef2f2', color: '#991b1b', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'transform 0.1s' }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')} onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
              <Icons.X size={12} /> Futa Zote
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: checked ? '#4338ca' : 'var(--gray-700)' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-100)', flexShrink: 0, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderRadius: '0 0 16px 16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{permissions.length} / {ALL_FEATURES.length} features zimechaguliwa</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>Funga</Button>
            <Button onClick={handleSave} disabled={saving} icon={<Icons.Save size={13} />}>{saving ? 'Inahifadhi...' : 'Hifadhi'}</Button>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  )
}
