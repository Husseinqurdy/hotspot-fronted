import { useEffect, useState } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import { Card, CardHeader, Badge, Button, Table, Alert, Tabs, Spinner, PageHeader, Input, Select } from '../components/UI'
import { useLang } from '../contexts/LangContext'
import { useAuth } from '../contexts/AuthContext'
import { VoucherPrintCard } from './AllPages'

const PRINT_STYLE = `
  @media print {
    body * { visibility: hidden !important; }
    #voucher-print-area, #voucher-print-area * { visibility: visible !important; }
    #voucher-print-area {
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      padding: 3mm !important;
      background: white !important;
    }
    #voucher-print-area .voucher-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 2mm !important;
      width: 100% !important;
    }
    #voucher-print-area .voucher-grid > div {
      width: 100% !important;
      margin: 0 !important;
      display: inline-block !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-sizing: border-box !important;
    }
    @page {
      margin: 3mm;
      size: A4 portrait;
    }
  }
`

// ── Responsive (on-screen) styles — only affects small viewports, never printing ──
const RESPONSIVE_STYLE = `
  @media (max-width: 640px) {
    .vm-container { padding: 0.75rem !important; }
    .vm-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
    .vm-stats-grid > div { padding: 0.65rem !important; }
    .vm-list-toolbar { flex-direction: column !important; align-items: stretch !important; }
    .vm-list-filters { width: 100% !important; }
    .vm-list-actions { width: 100% !important; flex-wrap: wrap !important; }
    .vm-list-actions > select,
    .vm-list-actions > button { flex: 1 1 auto !important; }
    .vm-table-scroll { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .vm-table-scroll table { min-width: 680px !important; }
    .vm-manual-grid, .vm-batch-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
    .vm-code-type-row { flex-wrap: wrap !important; }
    .vm-batch-theme-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .vm-print-modal { max-width: 100% !important; width: 100% !important; height: 100% !important; max-height: 100% !important; border-radius: 0 !important; }
    .vm-print-modal-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .vm-print-modal-header > div { width: 100% !important; justify-content: space-between !important; }
    .vm-print-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
    .vm-batch-toast { left: 0.75rem !important; right: 0.75rem !important; bottom: 0.75rem !important; flex-wrap: wrap !important; }
  }
  @media (max-width: 400px) {
    .vm-print-grid { grid-template-columns: 1fr !important; }
  }
`

// ── Real SVG icon set (replaces all emoji in this page) ───────────────
const Icons = {
  Settings: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Letters: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V4M4 12h8M12 20V4" /><circle cx="18" cy="16" r="3.2" /><path d="M21.2 16v3.5" />
    </svg>
  ),
  Numbers: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  Mixed: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
    </svg>
  ),
  CaseUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  ),
  CaseDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  List: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Package: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  Voucher: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" /><path d="M2 15v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
      <path d="M20 9a2 2 0 0 0 0 6" /><path d="M4 9a2 2 0 0 1 0 6" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Printer: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  CheckSquare: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z" />
    </svg>
  ),
  Zap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Palette: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Celebrate: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L2 22" /><path d="M17 2l5 5" /><circle cx="7" cy="9" r="1.4" fill="currentColor" />
      <circle cx="12" cy="4" r="1.2" fill="currentColor" /><circle cx="4" cy="16" r="1.2" fill="currentColor" />
    </svg>
  ),
  Close: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

// NOTE: `name` here is now a translation KEY (resolved via t() at render time), not literal text.
const COLOR_THEMES = [
  { id: 'blue',    name: 'theme_blue',    bg: '#1e40af', accent: '#3b82f6', text: '#fff', light: '#dbeafe' },
  { id: 'green',   name: 'theme_green',   bg: '#065f46', accent: '#10b981', text: '#fff', light: '#d1fae5' },
  { id: 'purple',  name: 'theme_purple',  bg: '#4c1d95', accent: '#8b5cf6', text: '#fff', light: '#ede9fe' },
  { id: 'red',     name: 'theme_red',     bg: '#991b1b', accent: '#ef4444', text: '#fff', light: '#fee2e2' },
  { id: 'orange',  name: 'theme_orange',  bg: '#9a3412', accent: '#f97316', text: '#fff', light: '#ffedd5' },
  { id: 'teal',    name: 'theme_teal',    bg: '#134e4a', accent: '#14b8a6', text: '#fff', light: '#ccfbf1' },
  { id: 'black',   name: 'theme_black',   bg: '#111827', accent: '#6b7280', text: '#fff', light: '#f3f4f6' },
  { id: 'gold',    name: 'theme_gold',    bg: '#78350f', accent: '#f59e0b', text: '#fff', light: '#fef3c7' },
]

type ThemeId = typeof COLOR_THEMES[number]['id']

interface CodeSettings {
  type: 'mixed' | 'letters' | 'numbers'
  case: 'upper' | 'lower'
  length: number
}

function generateCodeWithSettings(settings: CodeSettings): string {
  let chars = ''
  if (settings.type === 'mixed') chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  else if (settings.type === 'letters') chars = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  else chars = '0123456789'
  if (settings.type !== 'numbers') {
    if (settings.case === 'lower') chars = chars.toLowerCase()
  }
  return Array.from({ length: settings.length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

function CodeSettingsPanel({ settings, onChange, t }: { settings: CodeSettings; onChange: (s: CodeSettings) => void; t: (k: string) => string }) {
  const TYPE_OPTS = [
    { v: 'mixed', l: t('type_mixed'), Ico: Icons.Mixed },
    { v: 'letters', l: t('type_letters'), Ico: Icons.Letters },
    { v: 'numbers', l: t('type_numbers'), Ico: Icons.Numbers },
  ] as const
  const CASE_OPTS = [
    { v: 'upper', l: t('case_upper'), Ico: Icons.CaseUp },
    { v: 'lower', l: t('case_lower'), Ico: Icons.CaseDown },
  ] as const
  return (
    <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icons.Settings /> {t('code_settings_title')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>{t('char_type_label')}</label>
          <div className="vm-code-type-row" style={{ display: 'flex', gap: 6 }}>
            {TYPE_OPTS.map(opt => (
              <button key={opt.v} onClick={() => onChange({ ...settings, type: opt.v as any })}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: '1.5px solid', borderColor: settings.type === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: settings.type === opt.v ? 'var(--primary-light)' : '#fff', color: settings.type === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                <opt.Ico /> {opt.l}
              </button>
            ))}
          </div>
        </div>
        {settings.type !== 'numbers' && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>{t('char_case_label')}</label>
            <div className="vm-code-type-row" style={{ display: 'flex', gap: 6 }}>
              {CASE_OPTS.map(opt => (
                <button key={opt.v} onClick={() => onChange({ ...settings, case: opt.v as any })}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, border: '1.5px solid', borderColor: settings.case === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: settings.case === opt.v ? 'var(--primary-light)' : '#fff', color: settings.case === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  <opt.Ico /> {opt.l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
            {t('char_count_label')}: <strong style={{ color: 'var(--primary)' }}>{settings.length}</strong>
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[4, 5, 6, 7, 8].map(n => (
              <button key={n} onClick={() => onChange({ ...settings, length: n })}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: settings.length === n ? 'var(--primary)' : 'var(--gray-200)', background: settings.length === n ? 'var(--primary-light)' : '#fff', color: settings.length === n ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
          {t('preview_label')}: <strong style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', letterSpacing: 2 }}>{generateCodeWithSettings(settings)}</strong>
        </div>
      </div>
    </div>
  )
}

type VTab = 'list' | 'manual' | 'batch'

export function VoucherManagementPage() {
  const { t, lang } = useLang()
  const { clientInfo } = useAuth()
  const dateLocale = lang === 'sw' ? 'sw-TZ' : 'en-US'

  const [tab, setTab] = useState<VTab>('list')
  const [vouchers, setVouchers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [routers, setRouters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)

  const [profiles, setProfiles] = useState<string[]>([])
  const [profilesLoading, setProfilesLoading] = useState(false)

  const [codeSettings, setCodeSettings] = useState<CodeSettings>({ type: 'mixed', case: 'upper', length: 8 })
  const [manualForm, setManualForm] = useState({ router_id: '', profile: '', customer_phone: '', custom_code: '' })
  const [batchForm, setBatchForm] = useState({ router_id: '', profile: '', quantity: '10' })

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('blue')
  const [batchResult, setBatchResult] = useState<any[]>([])
  const [showBatchPrint, setShowBatchPrint] = useState(false)
  const [selectedForPrint, setSelectedForPrint] = useState<Set<number>>(new Set())
  const [printTheme, setPrintTheme] = useState<ThemeId>('blue')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [printVouchers, setPrintVouchers] = useState<any[]>([])
  const [allPackages, setAllPackages] = useState<any[]>([])

  useEffect(() => {
    api.get('/packages/').then(r => setAllPackages(r.data.results || r.data)).catch(() => {})
  }, [])

  const enrichVoucherForPrint = (v: any) => {
    if (v.duration && v.duration !== '—' && v.speed && v.speed !== '—') return v
    const pkg = allPackages.find((p: any) =>
      p.name === v.package_name ||
      p.mikrotik_profile === v.package_name ||
      p.mikrotik_profile === v.profile
    )
    if (pkg) {
      return {
        ...v,
        duration: v.duration && v.duration !== '—' ? v.duration
          : pkg.duration_display || (pkg.duration_unit === 'days' ? `${t('duration_days_prefix')} ${pkg.duration_value}` : `${t('duration_hours_prefix')} ${pkg.duration_value}`),
        speed: v.speed && v.speed !== '—' ? v.speed : `${pkg.speed_down}mb / ${pkg.speed_up}mb`,
        package_price: v.package_price || pkg.price,
      }
    }
    return v
  }

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }
  const theme = COLOR_THEMES.find(th => th.id === selectedTheme) || COLOR_THEMES[0]
  const printThemeObj = COLOR_THEMES.find(th => th.id === printTheme) || COLOR_THEMES[0]

  const fetchVouchers = () => {
    setLoading(true)
    const url = filter ? `/vouchers/?status=${filter}` : '/vouchers/'
    Promise.all([api.get(url), api.get('/vouchers/stats/')]).then(([v, s]) => {
      setVouchers(v.data.results || v.data)
      setStats(s.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchVouchers()
    api.get('/routers/').then(r => setRouters((r.data.results || r.data).filter((rt: any) => rt.is_online)))
  }, [filter])

  const fetchProfiles = async (routerId: string) => {
    if (!routerId) { setProfiles([]); return }
    setProfilesLoading(true)
    try {
      const res = await api.get(`/mikrotik/${routerId}/hotspot/profiles/`)
      const names: string[] = (res.data.profiles || []).map((p: any) => p.name).filter(Boolean)
      const list = names.length > 0 ? names : ['default']
      setProfiles(list)
      return list[0]
    } catch {
      setProfiles(['default'])
      return 'default'
    } finally { setProfilesLoading(false) }
  }

  const getProfileInfo = async (profileName: string) => {
    try {
      const res = await api.get('/packages/')
      const pkgs = res.data.results || res.data
      const pkg = pkgs.find((p: any) => p.mikrotik_profile === profileName)
      if (pkg) {
        return {
          duration: pkg.duration_display || `${pkg.duration_value} ${pkg.duration_unit}`,
          speed: `${pkg.speed_down}mb / ${pkg.speed_up}mb`,
        }
      }
    } catch {}
    return { duration: '—', speed: '—' }
  }

  const handleManualRouterChange = async (routerId: string) => {
    setManualForm(prev => ({ ...prev, router_id: routerId, profile: '' }))
    const first = await fetchProfiles(routerId)
    if (first) setManualForm(prev => ({ ...prev, router_id: routerId, profile: first }))
  }

  const handleBatchRouterChange = async (routerId: string) => {
    setBatchForm(prev => ({ ...prev, router_id: routerId, profile: '' }))
    const first = await fetchProfiles(routerId)
    if (first) setBatchForm(prev => ({ ...prev, router_id: routerId, profile: first }))
  }

  const makeCode = () => generateCodeWithSettings(codeSettings)

  const handleManualCreate = async () => {
    if (!manualForm.router_id || !manualForm.profile) { showAlrt('error', t('alert_select_router_profile')); return }
    setSaving(true)
    try {
      const requestedCode = manualForm.custom_code || makeCode()
      const profileInfo = await getProfileInfo(manualForm.profile)

      const res = await api.post(`/mikrotik/${manualForm.router_id}/hotspot/users/`, {
        username: requestedCode, password: requestedCode, profile: manualForm.profile,
        comment: `Manual|${manualForm.customer_phone || 'N/A'}`,
      })

      // Backend inaweza kurudisha code TOFAUTI na hii tuliyotuma (kama
      // kulikuwa na mgongano na iliundwa mpya moja kwa moja) — hii ndiyo
      // 'ukweli' halisi uliyoundwa kwenye MikroTik, tumia hii kila mahali
      // chini badala ya requestedCode.
      const code = res.data?.code || requestedCode
      if (manualForm.custom_code && code !== requestedCode) {
        showAlrt('warning', `Code "${requestedCode}" tayari ilikuwa inatumika — voucher imeundwa kwa code mpya: ${code}`)
      }

      // Hifadhi PDF ya historia (Sehemu ya 1 ya Analysis page) — best-effort,
      // haizuii voucher kufanya kazi hata kama hii itashindwa.
      try {
        await api.post('/vouchers/generate-pdf/', { codes: [code], theme: printTheme })
      } catch (pdfErr) {
        console.warn('generate-pdf (manual) imeshindwa:', pdfErr)
      }

      showAlrt('success', `${t('alert_voucher_created_prefix')} ${code} ${t('alert_voucher_created_suffix')}`)
      const pkg = allPackages.find((p: any) => p.mikrotik_profile === manualForm.profile || p.name === manualForm.profile)
      setPrintVouchers([{
        code,
        package_name: manualForm.profile,
        customer_phone: manualForm.customer_phone,
        duration: profileInfo.duration,
        speed: profileInfo.speed,
        package_price: pkg?.price || 0,
      }])
      setShowPrintModal(true)
      setManualForm({ router_id: manualForm.router_id, profile: manualForm.profile, customer_phone: '', custom_code: '' })
      fetchVouchers()
    } catch (e: any) {
      showAlrt('error', e.response?.data?.error || t('alert_create_failed'))
    } finally { setSaving(false) }
  }

  const handleBatchCreate = async () => {
    if (!batchForm.router_id || !batchForm.profile) { showAlrt('error', t('alert_select_router_profile')); return }
    const qty = parseInt(batchForm.quantity)
    if (isNaN(qty) || qty < 1 || qty > 200) { showAlrt('error', t('alert_quantity_range')); return }
    setSaving(true)
    const profileInfo = await getProfileInfo(batchForm.profile)
    const results: any[] = []
    let failed = 0
    const pkg = allPackages.find((p: any) => p.mikrotik_profile === batchForm.profile || p.name === batchForm.profile)
    const pkgPrice = pkg?.price || 0
    try {
      for (let i = 0; i < qty; i++) {
        const code = makeCode()
        try {
          const res = await api.post(`/mikrotik/${batchForm.router_id}/hotspot/users/`, {
            username: code, password: code, profile: batchForm.profile,
            comment: `Batch|${new Date().toLocaleDateString(dateLocale)}`,
          })
          // Backend inaweza kurudisha code TOFAUTI na hii tuliyotuma (kama
          // kulikuwa na mgongano na iliundwa mpya moja kwa moja) — tumia
          // 'code' halisi kutoka response, siyo ile tuliyotuma.
          const finalCode = res.data?.code || code
          results.push({ code: finalCode, package_name: batchForm.profile, customer_phone: '', duration: profileInfo.duration, speed: profileInfo.speed, package_price: pkgPrice })
        } catch { failed++ }
      }
      setBatchResult(results)
      setPrintVouchers(results)
      setShowBatchPrint(true)

      // Hifadhi PDF ya historia (Sehemu ya 1 ya Analysis page) — best-effort,
      // haizuii vouchers kufanya kazi hata kama hii itashindwa.
      if (results.length > 0) {
        try {
          await api.post('/vouchers/generate-pdf/', {
            codes: results.map((r: any) => r.code),
            theme: selectedTheme,
          })
        } catch (pdfErr) {
          console.warn('generate-pdf (batch) imeshindwa:', pdfErr)
        }
      }

      if (failed > 0) showAlrt('warning', `${results.length} ${t('alert_batch_partial_ok')}, ${failed} ${t('alert_batch_partial_failed')}`)
      else showAlrt('success', `${t('alert_batch_success_prefix')} ${results.length} ${t('alert_batch_success_suffix')}`)
      fetchVouchers()
    } catch { showAlrt('error', t('alert_batch_router_failed')) }
    finally { setSaving(false) }
  }

  const handlePrint = () => {
    const themeObj = printThemeObj
    const biz = business_name
    const PER_PAGE = 32

    const makeVoucherHtml = (v: any) => {
      const price = Number(v.package_price || v.price || 0)
      const priceDisplay = price > 0 ? (price >= 10000 ? `${(price / 1000).toFixed(0)}K` : price.toLocaleString()) : '—'
      const uptime = v.duration || v.duration_display || v.uptime || '—'
      const speed = v.speed || (v.speed_down && v.speed_up ? `${v.speed_down}mb / ${v.speed_up}mb` : '—') || '—'
      const packageName = v.package_name || v.package || '—'
      const priceFontSize = priceDisplay.length > 6 ? 10 : priceDisplay.length > 4 ? 12 : 14
      return `<div class="voucher">
        <div class="v-inner">
          <div>
            <div class="v-header">
              <div class="v-left">
                <div class="v-bizname">${biz.toUpperCase()}</div>
                <div class="v-tagline">Stay Connected. Stay Powered.</div>
              </div>
              <div class="v-right">
                ${price > 0 ? `<div class="v-price-box" style="background:linear-gradient(135deg,${themeObj.bg} 0%,#0d1a5c 100%);">
                  <div class="v-price-label">PRICE</div>
                  <div class="v-price-val" style="font-size:${priceFontSize}px;">TZS ${priceDisplay}</div>
                </div>` : ''}
                <div class="v-wifi" style="background:${themeObj.bg};">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M1.5 8.5C5.5 4.5 10.5 2.5 12 2.5C13.5 2.5 18.5 4.5 22.5 8.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M4.5 11.5C7.5 8.5 10 7 12 7C14 7 16.5 8.5 19.5 11.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M7.5 14.5C9.5 12.5 11 11.5 12 11.5C13 11.5 14.5 12.5 16.5 14.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                    <circle cx="12" cy="18" r="1.5" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="v-stats">
              <div class="v-stat">
                <div class="v-stat-label">UPTIME</div>
                <div class="v-stat-val" style="color:${themeObj.bg};">${uptime}</div>
              </div>
              <div class="v-stat">
                <div class="v-stat-label">SPEED</div>
                <div class="v-stat-val" style="color:${themeObj.bg};font-size:${speed.length > 10 ? '7px' : '9px'};">${speed}</div>
              </div>
            </div>
            <div class="v-pkg">
              <span class="v-pkg-label">PACKAGE</span>
              <span class="v-pkg-val" style="color:${themeObj.bg};">${packageName}</span>
            </div>
          </div>
          <div>
            <div class="v-dash"></div>
            <div class="v-code-box">
              <div class="v-code" style="color:${themeObj.bg};">${v.code}</div>
              <div class="v-code-label">VOUCHER CODE</div>
            </div>
            <div class="v-footer">
              <div class="v-ty" style="color:${themeObj.bg};">Thank You!</div>
            </div>
          </div>
        </div>
      </div>`
    }

    // Gawanya vouchers katika vikundi vya PER_PAGE
    const chunks: any[][] = []
    for (let i = 0; i < printVouchers.length; i += PER_PAGE) {
      chunks.push(printVouchers.slice(i, i + PER_PAGE))
    }

    const pages = chunks.map((chunk, pageIdx) => {
      const vHtml = chunk.map(makeVoucherHtml).join('')
      const isLast = pageIdx === chunks.length - 1
      return `<div class="page${isLast ? ' last-page' : ''}">${vHtml}</div>`
    }).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vouchers — ${biz}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
    body { background: white; font-family: Arial, sans-serif; }

    .page {
      width: 202mm;
      padding: 3mm;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: minmax(34mm, auto);
      gap: 2mm;
      page-break-after: always;
      break-after: page;
    }
    .last-page {
      page-break-after: avoid;
      break-after: avoid;
    }

    .voucher {
      background: #f0f4ff;
      border-radius: 7px;
      border: 1px solid #d0d8ff;
      overflow: visible;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .v-inner {
      padding: 6px 7px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .v-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .v-left { flex: 1; min-width: 0; }
    .v-bizname { font-size: 11px; font-weight: 900; letter-spacing: 0.3px; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .v-tagline { font-size: 5.5px; color: #888; font-style: italic; margin-top: 1px; }
    .v-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; margin-left: 4px; }
    .v-price-box { border-radius: 5px; padding: 2px 5px; border: 1.5px solid #c9a227; text-align: center; }
    .v-price-label { font-size: 5px; color: #c9a227; font-weight: 700; letter-spacing: 1px; }
    .v-price-val { font-weight: 900; color: #fff; white-space: nowrap; }
    .v-wifi { border-radius: 5px; padding: 3px 4px; border: 1.5px solid #c9a227; display: flex; align-items: center; justify-content: center; }
    .v-stats { display: flex; gap: 3px; margin-bottom: 3px; }
    .v-stat { flex: 1; background: #fff; border-radius: 4px; padding: 3px 4px; border: 1px solid #e5eaf5; }
    .v-stat-label { font-size: 5.5px; font-weight: 700; color: #333; letter-spacing: 0.2px; margin-bottom: 1px; }
    .v-stat-val { font-size: 9px; font-weight: 900; }
    .v-pkg { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px; background: #fff; border-radius: 4px; border: 1px solid #e5eaf5; }
    .v-pkg-label { font-size: 5.5px; font-weight: 700; color: #555; letter-spacing: 0.3px; }
    .v-pkg-val { font-size: 7px; font-weight: 700; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .v-dash { border-top: 1px dashed #c9a227; margin: 3px 0; }
    .v-code-box { background: #fff; border: 1.5px solid #c9a227; border-radius: 5px; padding: 3px 4px; text-align: center; margin-bottom: 2px; }
    .v-code {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1.5px;
      font-family: 'Courier New', monospace;
      word-break: break-all;
      white-space: normal;
      line-height: 1.3;
    }
    .v-code-label { font-size: 5px; font-weight: 700; color: #888; letter-spacing: 1.5px; margin-top: 1px; }
    .v-footer { text-align: center; }
    .v-ty { font-size: 7px; font-weight: 900; font-style: italic; font-family: Georgia, serif; }

    @page { size: A4 portrait; margin: 4mm; }
    @media print {
      body { margin: 0; }
      .page {
        width: 202mm !important;
        padding: 3mm !important;
        gap: 2mm !important;
        grid-auto-rows: minmax(34mm, auto) !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .last-page { page-break-after: avoid !important; break-after: avoid !important; }
      .voucher {
        overflow: visible !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  ${pages}
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
  <\/script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) { win.document.open(); win.document.write(html); win.document.close() }
  }

  const toggleSelect = (id: number) => {
    setSelectedForPrint(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  const openPrintSelected = () => {
    const toprint = vouchers.filter((_, i) => selectedForPrint.has(i)).map(enrichVoucherForPrint)
    setPrintVouchers(toprint)
    setShowPrintModal(true)
  }

  const business_name = clientInfo?.business_name || 'NetSafi Hotspot'
  const vs: Record<string, any> = { active: 'green', used: 'gray', expired: 'red' }
  const VTABS = [
    { key: 'list',   label: t('tab_voucher_list'), icon: <Icons.List /> },
    { key: 'manual', label: t('tab_voucher_manual'), icon: <Icons.Edit /> },
    { key: 'batch',  label: t('tab_voucher_batch'), icon: <Icons.Package /> },
  ] as const
  const FILTERS = [{ k: '', l: t('all') }, { k: 'active', l: t('active') }, { k: 'used', l: t('used') }, { k: 'expired', l: t('expired') }]

  const ProfileDropdown = ({ routerId, value, onChange }: { routerId: string; value: string; onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {t('hotspot_profile_star')} {profilesLoading && <Spinner size={12} />}
      </label>
      {!routerId ? (
        <div style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', background: '#fafafa' }}>{t('choose_router_first')}</div>
      ) : profilesLoading ? (
        <div style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', background: '#fafafa' }}>{t('loading_profiles_mikrotik')}</div>
      ) : (
        <select value={value} onChange={(e: any) => onChange(e.target.value)}
          style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', background: '#fff', color: 'var(--gray-800)' }}>
          {profiles.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )}
      {profiles.length > 0 && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t('profiles_count_prefix')} {profiles.length} {t('profiles_count_suffix')}</span>}
    </div>
  )

  return (
    <Layout>
      <style>{PRINT_STYLE}</style>
      <style>{RESPONSIVE_STYLE}</style>
      <div className="vm-container" style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={t('vouchers')} subtitle={t('voucher_page_subtitle')} />

        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <div className="vm-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { l: t('all'), v: stats?.total || 0, c: '#6366f1', Ico: Icons.Voucher },
            { l: t('active'), v: stats?.active || 0, c: '#10b981', Ico: Icons.CheckCircle },
            { l: t('used'), v: stats?.used || 0, c: '#6b7280', Ico: Icons.Check },
            { l: t('expired'), v: stats?.expired || 0, c: '#ef4444', Ico: Icons.Clock },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '0.9rem', borderLeft: `4px solid ${s.c}`, boxShadow: 'var(--card-shadow)' }}>
              <div style={{ marginBottom: 6, color: s.c }}><s.Ico /></div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        <Tabs tabs={VTABS as any} active={tab} onChange={(k) => setTab(k as VTab)} />

        {/* ── LIST ── */}
        {tab === 'list' && (
          <div>
            <div className="vm-list-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
              <div className="vm-list-filters" style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f.k} onClick={() => setFilter(f.k)}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid', borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)', background: filter === f.k ? 'var(--primary-light)' : '#fff', color: filter === f.k ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {f.l}
                  </button>
                ))}
              </div>
              <div className="vm-list-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {selectedForPrint.size > 0 && (
                  <>
                    <select value={printTheme} onChange={e => setPrintTheme(e.target.value as ThemeId)}
                      style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid var(--gray-200)', fontSize: 12, cursor: 'pointer' }}>
                      {COLOR_THEMES.map(th => <option key={th.id} value={th.id}>{t(th.name)}</option>)}
                    </select>
                    <Button size="sm" variant="success" onClick={openPrintSelected} icon={<Icons.Printer />}>{t('print_selected_prefix')} ({selectedForPrint.size})</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedForPrint(new Set())}>{t('deselect_all')}</Button>
                  </>
                )}
                {selectedForPrint.size === 0 && vouchers.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedForPrint(new Set(vouchers.map((_, i) => i)))} icon={<Icons.CheckSquare />}>{t('select_all')}</Button>
                )}
              </div>
            </div>
            <Card>
              <div className="vm-table-scroll">
                <Table loading={loading}
                  headers={['', t('code'), t('package_name'), t('price'), t('customer_phone'), t('status'), t('created_at'), '']}
                  rows={vouchers.map((v, i) => [
                    <input type="checkbox" checked={selectedForPrint.has(i)} onChange={() => toggleSelect(i)} style={{ width: 15, height: 15, cursor: 'pointer' }} />,
                    <code style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary)', letterSpacing: '0.08em' }}>{v.code}</code>,
                    v.package_name || '—',
                    `TZS ${Number(v.package_price || 0).toLocaleString()}`,
                    v.customer_phone || '—',
                    <Badge text={v.status_display || v.status} color={vs[v.status] || 'gray'} />,
                    new Date(v.created_at).toLocaleString(dateLocale),
                    <Button size="sm" variant="ghost" onClick={() => { setPrintVouchers([enrichVoucherForPrint(v)]); setShowPrintModal(true) }} icon={<Icons.Printer />}>{t('print')}</Button>,
                  ])}
                  emptyMessage={t('no_vouchers')}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ── MANUAL ── */}
        {tab === 'manual' && (
          <Card>
            <CardHeader title={t('create_manual_title')} />
            <div style={{ padding: '1.25rem' }}>
              <div className="vm-manual-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <CodeSettingsPanel settings={codeSettings} onChange={setCodeSettings} t={t} />
                  <Select label={t('router_online_required')} value={manualForm.router_id} onChange={(e: any) => handleManualRouterChange(e.target.value)}>
                    <option value="">— {t('choose_router')} —</option>
                    {routers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.host})</option>)}
                  </Select>
                  <ProfileDropdown routerId={manualForm.router_id} value={manualForm.profile} onChange={v => setManualForm(prev => ({ ...prev, profile: v }))} />
                  <Input label={t('customer_phone_optional')} placeholder="0744123456" value={manualForm.customer_phone} onChange={(e: any) => setManualForm({ ...manualForm, customer_phone: e.target.value })} />
                  <div>
                    <Input label={t('custom_code_label')} placeholder="ABCD1234" value={manualForm.custom_code} onChange={(e: any) => setManualForm({ ...manualForm, custom_code: e.target.value })} />
                    {!manualForm.custom_code && <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{t('preview_code_label')}: <strong style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{makeCode()}</strong></p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>{t('voucher_color_label')}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {COLOR_THEMES.map(th => (
                        <button key={th.id} onClick={() => setPrintTheme(th.id as ThemeId)} title={t(th.name)}
                          style={{ width: 28, height: 28, borderRadius: 7, background: th.bg, border: printTheme === th.id ? `3px solid ${th.accent}` : '2px solid transparent', cursor: 'pointer', boxShadow: printTheme === th.id ? `0 0 0 2px ${th.accent}40` : 'none', transition: 'all 0.15s' }} />
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleManualCreate} disabled={saving || !manualForm.router_id || !manualForm.profile} icon={<Icons.Sparkle />}>
                    {saving ? t('creating') : t('create_voucher_btn')}
                  </Button>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>{t('preview_voucher_label')}</label>
                  {manualForm.router_id && manualForm.profile ? (
                    <VoucherPrintCard
                      voucher={{ code: manualForm.custom_code || makeCode(), package_name: manualForm.profile, customer_phone: manualForm.customer_phone, duration: '—', speed: '—' }}
                      business_name={business_name}
                      theme={printThemeObj}
                    />
                  ) : (
                    <div style={{ border: '2px dashed var(--gray-200)', borderRadius: 12, padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Icons.Voucher /></div>{t('choose_router_profile_prompt')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── BATCH ── */}
        {tab === 'batch' && (
          <div className="vm-batch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
            <Card>
              <CardHeader title={t('create_batch_title')} />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <CodeSettingsPanel settings={codeSettings} onChange={setCodeSettings} t={t} />
                <Select label={t('router_online_required')} value={batchForm.router_id} onChange={(e: any) => handleBatchRouterChange(e.target.value)}>
                  <option value="">— {t('choose_router')} —</option>
                  {routers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.host})</option>)}
                </Select>
                <ProfileDropdown routerId={batchForm.router_id} value={batchForm.profile} onChange={v => setBatchForm(prev => ({ ...prev, profile: v }))} />
                <Input label={t('quantity_label')} type="number" min="1" max="200" placeholder="10" value={batchForm.quantity} onChange={(e: any) => setBatchForm({ ...batchForm, quantity: e.target.value })} />
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>{t('vouchers_color_label')}</label>
                  <div className="vm-batch-theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                    {COLOR_THEMES.map(th => (
                      <button key={th.id} onClick={() => setSelectedTheme(th.id as ThemeId)}
                        style={{ padding: '8px 4px', borderRadius: 8, border: `2px solid ${selectedTheme === th.id ? th.accent : 'transparent'}`, background: th.bg, cursor: 'pointer', transition: 'all 0.15s', boxShadow: selectedTheme === th.id ? `0 0 0 3px ${th.accent}40` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <span style={{ color: th.text }}><Icons.Palette /></span>
                        <span style={{ fontSize: 10, color: th.text, fontWeight: 600 }}>{t(th.name)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {batchForm.profile && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>{t('preview_label')}</label>
                    <div style={{ transform: 'scale(0.65)', transformOrigin: 'left top', marginBottom: -90 }}>
                      <VoucherPrintCard voucher={{ code: makeCode(), package_name: batchForm.profile, duration: '—', speed: '—' }} business_name={business_name} theme={theme} />
                    </div>
                  </div>
                )}
                <Button onClick={handleBatchCreate} disabled={saving || !batchForm.router_id || !batchForm.profile} icon={<Icons.Zap />}>
                  {saving ? t('creating') : `${t('create_batch_btn_prefix')} ${batchForm.quantity || 0}`}
                </Button>
                {saving && (
                  <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: 13 }}>
                    <div style={{ marginBottom: 6 }}>{t('creating_on_mikrotik')}</div>
                    <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 3, animation: 'pulse 1.5s infinite', width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {batchResult.length > 0 && (
              <Card>
                <CardHeader title={`${t('vouchers_created_prefix')} ${batchResult.length} ${t('vouchers_created_suffix')}`}
                  action={<Button size="sm" variant="success" onClick={() => { setPrintVouchers(batchResult); setShowPrintModal(true) }} icon={<Icons.Printer />}>{t('print_all')}</Button>} />
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {batchResult.map((v, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--gray-50)' }}>
                      <code style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary)', letterSpacing: '0.08em' }}>{v.code}</code>
                      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{v.package_name}</span>
                      <Badge text="OK" color="green" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── PRINT MODAL ── */}
        {showPrintModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="vm-print-modal" style={{ background: '#fff', borderRadius: 16, maxWidth: 900, width: '100%', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div className="vm-print-modal-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Printer /> {t('print_modal_title_prefix')} ({printVouchers.length})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t('color_label')}:</label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {COLOR_THEMES.map(th => (
                      <button key={th.id} onClick={() => setPrintTheme(th.id as ThemeId)} title={t(th.name)}
                        style={{ width: 22, height: 22, borderRadius: 5, background: th.bg, border: printTheme === th.id ? `2px solid ${th.accent}` : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                  <button onClick={() => setShowPrintModal(false)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-600)' }}>
                    <Icons.Close />
                  </button>
                </div>
              </div>
              <div id="voucher-print-area" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f9fafb' }}>
                <div className="voucher-grid vm-print-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {printVouchers.map((v, i) => (
                    <VoucherPrintCard key={i} voucher={v} business_name={business_name} theme={printThemeObj} />
                  ))}
                </div>
              </div>
              <div style={{ padding: '0.875rem', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowPrintModal(false)}>{t('close')}</Button>
                <Button variant="success" onClick={handlePrint} icon={<Icons.Printer />}>{t('print_now')}</Button>
              </div>
            </div>
          </div>
        )}

        {showBatchPrint && (
          <div className="vm-batch-toast" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: 'var(--card-shadow-lg)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 200, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ color: '#10b981' }}><Icons.Celebrate /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t('vouchers_created_prefix')} {batchResult.length} {t('vouchers_created_suffix')}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{t('print_question')}</div>
            </div>
            <Button size="sm" variant="success" onClick={() => { setShowBatchPrint(false); setShowPrintModal(true) }} icon={<Icons.Printer />}>{t('print')}</Button>
            <button onClick={() => setShowBatchPrint(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
              <Icons.Close />
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </Layout>
  )
}
