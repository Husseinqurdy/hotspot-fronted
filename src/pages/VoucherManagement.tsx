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
      left: 0 !important; top: 0 !important;
      width: 100% !important;
      padding: 5mm !important;
      background: white !important;
    }
    @page { margin: 8mm; size: A4; }
  }
`

const COLOR_THEMES = [
  { id: 'blue',    name: 'Bluu',     bg: '#1e40af', accent: '#3b82f6', text: '#fff', light: '#dbeafe' },
  { id: 'green',   name: 'Kijani',   bg: '#065f46', accent: '#10b981', text: '#fff', light: '#d1fae5' },
  { id: 'purple',  name: 'Zambarau', bg: '#4c1d95', accent: '#8b5cf6', text: '#fff', light: '#ede9fe' },
  { id: 'red',     name: 'Nyekundu', bg: '#991b1b', accent: '#ef4444', text: '#fff', light: '#fee2e2' },
  { id: 'orange',  name: 'Chungwa',  bg: '#9a3412', accent: '#f97316', text: '#fff', light: '#ffedd5' },
  { id: 'teal',    name: 'Teal',     bg: '#134e4a', accent: '#14b8a6', text: '#fff', light: '#ccfbf1' },
  { id: 'black',   name: 'Nyeusi',   bg: '#111827', accent: '#6b7280', text: '#fff', light: '#f3f4f6' },
  { id: 'gold',    name: 'Dhahabu',  bg: '#78350f', accent: '#f59e0b', text: '#fff', light: '#fef3c7' },
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

function CodeSettingsPanel({ settings, onChange }: { settings: CodeSettings; onChange: (s: CodeSettings) => void }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        ⚙️ Mipangilio ya Code
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Aina ya Herufi</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ v: 'mixed', l: '🔤 Mchanganyiko' }, { v: 'letters', l: '🔡 Herufi Tu' }, { v: 'numbers', l: '🔢 Namba Tu' }].map(opt => (
              <button key={opt.v} onClick={() => onChange({ ...settings, type: opt.v as any })}
                style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid', borderColor: settings.type === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: settings.type === opt.v ? 'var(--primary-light)' : '#fff', color: settings.type === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>
        {settings.type !== 'numbers' && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Ukubwa wa Herufi</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ v: 'upper', l: '⬆️ KUBWA (ABC)' }, { v: 'lower', l: '⬇️ Ndogo (abc)' }].map(opt => (
                <button key={opt.v} onClick={() => onChange({ ...settings, case: opt.v as any })}
                  style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid', borderColor: settings.case === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: settings.case === opt.v ? 'var(--primary-light)' : '#fff', color: settings.case === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>
            Idadi ya Herufi: <strong style={{ color: 'var(--primary)' }}>{settings.length}</strong>
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
          Preview: <strong style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', letterSpacing: 2 }}>{generateCodeWithSettings(settings)}</strong>
        </div>
      </div>
    </div>
  )
}

type VTab = 'list' | 'manual' | 'batch'

export function VoucherManagementPage() {
  const { t } = useLang()
  const { clientInfo } = useAuth()

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

// Function ya kupata info ya package kutoka jina lake
const enrichVoucherForPrint = (v: any) => {
  // Kama ina duration/speed tayari — rudisha ilivyo
  if (v.duration && v.duration !== '—' && v.speed && v.speed !== '—') return v

  // Tafuta package inayolingana
  const pkg = allPackages.find((p: any) =>
    p.name === v.package_name ||
    p.mikrotik_profile === v.package_name ||
    p.mikrotik_profile === v.profile
  )

  if (pkg) {
    return {
      ...v,
      duration: v.duration && v.duration !== '—'
        ? v.duration
        : pkg.duration_display || (pkg.duration_unit === 'days'
          ? `Siku ${pkg.duration_value}`
          : `Saa ${pkg.duration_value}`),
      speed: v.speed && v.speed !== '—'
        ? v.speed
        : `${pkg.speed_down}mb / ${pkg.speed_up}mb`,
      package_price: v.package_price || pkg.price,
    }
  }
  return v
}

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }
  const theme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0]
  const printThemeObj = COLOR_THEMES.find(t => t.id === printTheme) || COLOR_THEMES[0]

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

  // ── Pata maelezo ya package (duration + speed) ────────────────────────────
  const getProfileInfo = async (profileName: string) => {
    try {
      const res = await api.get('/packages/')
      const pkgs = res.data.results || res.data
      const pkg = pkgs.find((p: any) => p.mikrotik_profile === profileName)
      if (pkg) {
        const timeout = pkg.duration_unit === 'days'
          ? `${pkg.duration_value * 24}h`
          : `${pkg.duration_value}h`
        return {
          duration: pkg.duration_display || `${pkg.duration_value} ${pkg.duration_unit}`,
          speed: `${pkg.speed_down}mb / ${pkg.speed_up}mb`,
          session_timeout: timeout,
        }
      }
    } catch {}
    return { duration: '—', speed: '—', session_timeout: '1h' }
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
    if (!manualForm.router_id || !manualForm.profile) {
      showAlrt('error', 'Chagua router na profile'); return
    }
    setSaving(true)
    try {
      const code = manualForm.custom_code || makeCode()
      const profileInfo = await getProfileInfo(manualForm.profile)

      // ── 1. Unda user kwenye MikroTik ────────────────────────────────────
      await api.post(`/mikrotik/${manualForm.router_id}/hotspot/users/`, {
        username: code,
        password: code,
        profile: manualForm.profile,
        comment: `Manual|${manualForm.customer_phone || 'N/A'}`,
      })

      // ── 2. Weka scheduler — voucher itaisha automatically ────────────────
      try {
        await api.post(`/mikrotik/${manualForm.router_id}/voucher/schedule/`, {
          username: code,
          session_timeout: profileInfo.session_timeout,
          profile: manualForm.profile,
        })
      } catch {
        // Scheduler si lazima — endelea hata kama imeshindwa
      }

      showAlrt('success', `✅ Voucher ${code} imeundwa + scheduler imewekwa!`)
      setPrintVouchers([{
        code,
        package_name: manualForm.profile,
        customer_phone: manualForm.customer_phone,
        duration: profileInfo.duration,
        speed: profileInfo.speed,
      }])
      setShowPrintModal(true)
      setManualForm({ router_id: manualForm.router_id, profile: manualForm.profile, customer_phone: '', custom_code: '' })
      fetchVouchers()
    } catch (e: any) {
      showAlrt('error', e.response?.data?.error || 'Imeshindwa — angalia router ipo online')
    } finally { setSaving(false) }
  }

  const handleBatchCreate = async () => {
    if (!batchForm.router_id || !batchForm.profile) {
      showAlrt('error', 'Chagua router na profile'); return
    }
    const qty = parseInt(batchForm.quantity)
    if (isNaN(qty) || qty < 1 || qty > 200) {
      showAlrt('error', 'Quantity lazima iwe kati ya 1 na 200'); return
    }
    setSaving(true)
    const profileInfo = await getProfileInfo(batchForm.profile)
    const results: any[] = []
    let failed = 0
    try {
      for (let i = 0; i < qty; i++) {
        const code = makeCode()
        try {
          await api.post(`/mikrotik/${batchForm.router_id}/hotspot/users/`, {
            username: code, password: code,
            profile: batchForm.profile,
            comment: `Batch|${new Date().toLocaleDateString('sw-TZ')}`,
          })
          results.push({
            code,
            package_name: batchForm.profile,
            customer_phone: '',
            duration: profileInfo.duration,
            speed: profileInfo.speed,
          })
        } catch { failed++ }
      }
      setBatchResult(results)
      setPrintVouchers(results)
      setShowBatchPrint(true)
      if (failed > 0) showAlrt('warning', `${results.length} imefanikiwa, ${failed} imeshindwa`)
      else showAlrt('success', `✅ Vouchers ${results.length} zimeundwa!`)
      fetchVouchers()
    } catch { showAlrt('error', 'Imeshindwa kuwasiliana na router') }
    finally { setSaving(false) }
  }

  const handlePrint = () => { window.print() }

  const toggleSelect = (id: number) => {
    setSelectedForPrint(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  const openPrintSelected = () => {
  const toprint = vouchers
    .filter((_, i) => selectedForPrint.has(i))
    .map(enrichVoucherForPrint)
  setPrintVouchers(toprint)
  setShowPrintModal(true)
}

  const business_name = clientInfo?.business_name || 'NetSafi Hotspot'
  const vs: Record<string, any> = { active: 'green', used: 'gray', expired: 'red' }
  const VTABS = [
    { key: 'list',   label: 'Lista ya Vouchers', icon: '📋' },
    { key: 'manual', label: 'Unda Moja',          icon: '✏️' },
    { key: 'batch',  label: 'Unda Batch',          icon: '📦' },
  ] as const
  const FILTERS = [{ k: '', l: t('all') }, { k: 'active', l: 'Active' }, { k: 'used', l: t('used') }, { k: 'expired', l: t('expired') }]

  const ProfileDropdown = ({ routerId, value, onChange }: { routerId: string; value: string; onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
        Hotspot Profile * {profilesLoading && <Spinner size={12} />}
      </label>
      {!routerId ? (
        <div style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', background: '#fafafa' }}>
          Chagua router kwanza...
        </div>
      ) : profilesLoading ? (
        <div style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', background: '#fafafa' }}>
          Inapakia profiles kutoka MikroTik...
        </div>
      ) : (
        <select value={value} onChange={(e: any) => onChange(e.target.value)}
          style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', background: '#fff', color: 'var(--gray-800)' }}>
          {profiles.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )}
      {profiles.length > 0 && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Profiles {profiles.length} kutoka MikroTik</span>}
    </div>
  )

  return (
    <Layout>
      <style>{PRINT_STYLE}</style>
      <div style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={t('vouchers')} subtitle="Simamia, unda, na chapisha vouchers" />

        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { l: t('all'), v: stats?.total || 0, c: '#6366f1', i: '🎫' },
            { l: 'Active', v: stats?.active || 0, c: '#10b981', i: '✅' },
            { l: t('used'), v: stats?.used || 0, c: '#6b7280', i: '✔' },
            { l: t('expired'), v: stats?.expired || 0, c: '#ef4444', i: '⏰' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '0.9rem', borderLeft: `4px solid ${s.c}`, boxShadow: 'var(--card-shadow)' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        <Tabs tabs={VTABS as any} active={tab} onChange={(k) => setTab(k as VTab)} />

        {/* ── LIST ── */}
        {tab === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f.k} onClick={() => setFilter(f.k)}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid', borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)', background: filter === f.k ? 'var(--primary-light)' : '#fff', color: filter === f.k ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {f.l}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {selectedForPrint.size > 0 && (
                  <>
                    <select value={printTheme} onChange={e => setPrintTheme(e.target.value as ThemeId)}
                      style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid var(--gray-200)', fontSize: 12, cursor: 'pointer' }}>
                      {COLOR_THEMES.map(th => <option key={th.id} value={th.id}>{th.name}</option>)}
                    </select>
                    <Button size="sm" variant="success" onClick={openPrintSelected} icon="🖨">Chapisha ({selectedForPrint.size})</Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedForPrint(new Set())}>Futa Chaguo</Button>
                  </>
                )}
                {selectedForPrint.size === 0 && vouchers.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedForPrint(new Set(vouchers.map((_, i) => i)))} icon="☑️">Chagua Zote</Button>
                )}
              </div>
            </div>
            <Card>
              <Table loading={loading}
                headers={['☑', t('code'), 'Package', 'Bei', t('customer_phone'), t('status'), t('created_at'), '']}
                rows={vouchers.map((v, i) => [
                  <input type="checkbox" checked={selectedForPrint.has(i)} onChange={() => toggleSelect(i)} style={{ width: 15, height: 15, cursor: 'pointer' }} />,
                  <code style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary)', letterSpacing: '0.08em' }}>{v.code}</code>,
                  v.package_name || '—',
                  `TZS ${Number(v.package_price || 0).toLocaleString()}`,
                  v.customer_phone || '—',
                  <Badge text={v.status_display || v.status} color={vs[v.status] || 'gray'} />,
                  new Date(v.created_at).toLocaleString('sw-TZ'),
                  <Button size="sm" variant="ghost" onClick={() => { setPrintVouchers([v]); setShowPrintModal(true) }} icon="🖨">Print</Button>,
                ])}
                emptyMessage={t('no_vouchers')}
              />
            </Card>
          </div>
        )}

        {/* ── MANUAL ── */}
        {tab === 'manual' && (
          <Card>
            <CardHeader title="Unda Voucher Moja Kwa Moja" />
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <CodeSettingsPanel settings={codeSettings} onChange={setCodeSettings} />

                  <Select label="Router (lazima iwe online) *" value={manualForm.router_id}
                    onChange={(e: any) => handleManualRouterChange(e.target.value)}>
                    <option value="">— Chagua Router —</option>
                    {routers.map(r => <option key={r.id} value={r.id}>🟢 {r.name} ({r.host})</option>)}
                  </Select>

                  <ProfileDropdown
                    routerId={manualForm.router_id}
                    value={manualForm.profile}
                    onChange={v => setManualForm(prev => ({ ...prev, profile: v }))}
                  />

                  <Input label="Simu ya Mteja (optional)" placeholder="0744123456"
                    value={manualForm.customer_phone}
                    onChange={(e: any) => setManualForm({ ...manualForm, customer_phone: e.target.value })} />

                  <div>
                    <Input label="Code ya Maalum (acha tupu = random)" placeholder="ABCD1234"
                      value={manualForm.custom_code}
                      onChange={(e: any) => setManualForm({ ...manualForm, custom_code: e.target.value })} />
                    {!manualForm.custom_code && (
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                        Preview code: <strong style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{makeCode()}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Rangi ya Voucher (Print)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {COLOR_THEMES.map(th => (
                        <button key={th.id} onClick={() => setPrintTheme(th.id as ThemeId)} title={th.name}
                          style={{ width: 28, height: 28, borderRadius: 7, background: th.bg, border: printTheme === th.id ? `3px solid ${th.accent}` : '2px solid transparent', cursor: 'pointer', boxShadow: printTheme === th.id ? `0 0 0 2px ${th.accent}40` : 'none', transition: 'all 0.15s' }} />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleManualCreate} disabled={saving || !manualForm.router_id || !manualForm.profile} icon="✨">
                    {saving ? 'Inaunda...' : 'Unda Voucher'}
                  </Button>
                </div>

                {/* Preview */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Preview ya Voucher</label>
                  {manualForm.router_id && manualForm.profile ? (
                    <VoucherPrintCard
                      voucher={{ code: manualForm.custom_code || makeCode(), package_name: manualForm.profile, customer_phone: manualForm.customer_phone, duration: '—', speed: '—' }}
                      business_name={business_name}
                      theme={printThemeObj}
                    />
                  ) : (
                    <div style={{ border: '2px dashed var(--gray-200)', borderRadius: 12, padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
                      Chagua router na profile
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── BATCH ── */}
        {tab === 'batch' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
            <Card>
              <CardHeader title="Unda Vouchers Nyingi (Batch)" />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <CodeSettingsPanel settings={codeSettings} onChange={setCodeSettings} />

                <Select label="Router (lazima iwe online) *" value={batchForm.router_id}
                  onChange={(e: any) => handleBatchRouterChange(e.target.value)}>
                  <option value="">— Chagua Router —</option>
                  {routers.map(r => <option key={r.id} value={r.id}>🟢 {r.name} ({r.host})</option>)}
                </Select>

                <ProfileDropdown
                  routerId={batchForm.router_id}
                  value={batchForm.profile}
                  onChange={v => setBatchForm(prev => ({ ...prev, profile: v }))}
                />

                <Input label="Idadi ya Vouchers (1–200) *" type="number" min="1" max="200"
                  placeholder="10" value={batchForm.quantity}
                  onChange={(e: any) => setBatchForm({ ...batchForm, quantity: e.target.value })} />

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Rangi ya Vouchers (Print)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                    {COLOR_THEMES.map(th => (
                      <button key={th.id} onClick={() => setSelectedTheme(th.id as ThemeId)}
                        style={{ padding: '8px 4px', borderRadius: 8, border: `2px solid ${selectedTheme === th.id ? th.accent : 'transparent'}`, background: th.bg, cursor: 'pointer', transition: 'all 0.15s', boxShadow: selectedTheme === th.id ? `0 0 0 3px ${th.accent}40` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 14 }}>🎨</span>
                        <span style={{ fontSize: 10, color: th.text, fontWeight: 600 }}>{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {batchForm.profile && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>Preview</label>
                    <div style={{ transform: 'scale(0.65)', transformOrigin: 'left top', marginBottom: -90 }}>
                      <VoucherPrintCard voucher={{ code: makeCode(), package_name: batchForm.profile, duration: '—', speed: '—' }} business_name={business_name} theme={theme} />
                    </div>
                  </div>
                )}

                <Button onClick={handleBatchCreate} disabled={saving || !batchForm.router_id || !batchForm.profile} icon="⚡">
                  {saving ? 'Inaunda...' : `Unda Vouchers ${batchForm.quantity || 0}`}
                </Button>

                {saving && (
                  <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: 13 }}>
                    <div style={{ marginBottom: 6 }}>Inaunda vouchers kwenye MikroTik...</div>
                    <div style={{ height: 5, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 3, animation: 'pulse 1.5s infinite', width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {batchResult.length > 0 && (
              <Card>
                <CardHeader title={`Vouchers ${batchResult.length} Zimeundwa! 🎉`}
                  action={<Button size="sm" variant="success" onClick={() => { setPrintVouchers(batchResult); setShowPrintModal(true) }} icon="🖨">Chapisha Zote</Button>} />
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {batchResult.map((v, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--gray-50)' }}>
                      <code style={{ fontWeight: 800, fontSize: 13, color: 'var(--primary)', letterSpacing: '0.08em' }}>{v.code}</code>
                      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{v.package_name}</span>
                      <Badge text="✓" color="green" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Print Modal */}
        {showPrintModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>🖨️ Chapisha Vouchers ({printVouchers.length})</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'var(--gray-500)' }}>Rangi:</label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {COLOR_THEMES.map(th => (
                      <button key={th.id} onClick={() => setPrintTheme(th.id as ThemeId)} title={th.name}
                        style={{ width: 22, height: 22, borderRadius: 5, background: th.bg, border: printTheme === th.id ? `2px solid ${th.accent}` : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                  <button onClick={() => setShowPrintModal(false)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              </div>
              <div id="voucher-print-area" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f9fafb' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {printVouchers.map((v, i) => (
                    <VoucherPrintCard key={i} voucher={v} business_name={business_name} theme={printThemeObj} />
                  ))}
                </div>
              </div>
              <div style={{ padding: '0.875rem', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowPrintModal(false)}>Funga</Button>
                <Button variant="success" onClick={handlePrint} icon="🖨️">Chapisha Sasa</Button>
              </div>
            </div>
          </div>
        )}

        {showBatchPrint && (
          <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: 'var(--card-shadow-lg)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 200, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 24 }}>🎉</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Vouchers {batchResult.length} zimeundwa!</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Unataka kuzipiga print?</div>
            </div>
            <Button size="sm" variant="success" onClick={() => { setShowBatchPrint(false); setShowPrintModal(true) }} icon="🖨">Print</Button>
            <button onClick={() => setShowBatchPrint(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 18 }}>✕</button>
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
