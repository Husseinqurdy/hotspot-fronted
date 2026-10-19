import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import {
  PageHeader, Card, Button, Table, Badge, Modal, Input, Select,
  Alert, FormRow, FormActions,
} from '../components/UI'
import { fmt, money, TrendArea, MonthlyBars, SiteBars, CategoryDonut, C } from './AcctCharts'

// ── Helpers ───────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10)

const KINDS = [
  { value: 'income', label: 'Mapato' },
  { value: 'expense', label: 'Matumizi' },
  { value: 'asset', label: 'Mali (asset)' },
  { value: 'liability', label: 'Deni (liability)' },
  { value: 'loan', label: 'Mkopo' },
  { value: 'loan_payment', label: 'Marejesho ya mkopo' },
]
const KIND_COLOR: Record<string, any> = {
  income: 'green', expense: 'red', asset: 'blue', liability: 'orange', loan: 'purple', loan_payment: 'yellow',
}
const ACTIONS: Record<string, string> = {
  open: 'Ameingia sehemu hii', create: 'Ameongeza rekodi', update: 'Amebadilisha rekodi',
  void: 'Amefuta rekodi', export: 'Amepakua ripoti', site_create: 'Ameunda site', site_update: 'Amebadilisha site',
}

function errMsg(e: any): string {
  const d = e?.response?.data
  if (!d) return 'Hitilafu ya mtandao. Jaribu tena.'
  if (typeof d === 'string') return d
  if (d.error || d.detail) return d.error || d.detail
  return Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
}

function describe(l: any): string {
  const d = l.detail || {}
  if (d.changes) {
    const c = Object.entries(d.changes).map(([k, v]: any) => `${k}: ${v.kabla ?? '—'} → ${v.baada ?? '—'}`)
    return c.join(', ') || 'Hakuna mabadiliko'
  }
  if (d.reason) return `Sababu: ${d.reason} (kiasi ${fmt(d.snapshot?.amount)})`
  if (d.after) return `${d.kind || ''} ${d.after.amount ? money(d.after.amount) : d.after.name || ''} ${d.after.description || d.after.category || ''}`.trim()
  if (d.type) return `Faili: ${String(d.type).toUpperCase()} (${d.date_from || 'mwanzo'} → ${d.date_to || 'leo'})`
  return ''
}

const emptyEntry = { id: 0, kind: 'income', site: '', date: today(), category: '', description: '', amount: '', interest_rate: '', loan_ref: '' }


const ACSTYLE = `
.ac-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;align-items:center;padding:1.5rem 1.75rem;border-radius:20px;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);color:#fff;margin-bottom:16px}
.ac-hero small{color:rgba(255,255,255,.62);font-size:12.5px}
.ac-big{font-size:clamp(28px,5vw,42px);font-weight:800;letter-spacing:-1px;line-height:1.1;margin:6px 0;font-variant-numeric:tabular-nums}
.ac-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.ac-kpi{background:#fff;border:1px solid #eef0f6;border-radius:14px;padding:.9rem 1rem}
.ac-kpi span{display:flex;align-items:center;gap:7px;font-size:12px;color:#64748b}
.ac-kpi i{width:8px;height:8px;border-radius:50%}
.ac-kpi b{display:block;font-size:17px;margin-top:4px;color:#0f172a;font-variant-numeric:tabular-nums}
.ac-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:16px}
.ac-card{background:#fff;border:1px solid #eef0f6;border-radius:16px;padding:1.1rem 1.25rem;box-shadow:0 1px 2px rgba(15,23,42,.04);min-width:0}
.ac-card h3{font-size:14px;font-weight:700;color:#0f172a;margin:0 0 2px}
.ac-card p{font-size:12px;color:#94a3b8;margin:0 0 10px}
.ac-seg{display:inline-flex;gap:4px;padding:4px;background:#eef0f6;border-radius:12px;margin-bottom:16px;max-width:100%;overflow-x:auto}
.ac-seg button{border:0;background:transparent;padding:7px 16px;border-radius:9px;font-size:13px;font-weight:600;color:#64748b;white-space:nowrap}
.ac-seg button[aria-pressed=true]{background:#fff;color:#4f46e5;box-shadow:0 1px 3px rgba(15,23,42,.12)}
.ac-seg button:focus-visible{outline:2px solid #6366f1;outline-offset:1px}
@media(max-width:900px){.ac-hero,.ac-grid{grid-template-columns:1fr}}
`

// ── Page ──────────────────────────────────────────────────────
export default function AccountingPage() {
  const [tab, setTab] = useState('summary')
  const [site, setSite] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sites, setSites] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [logs, setLogs] = useState<any>({ results: [], users: [] })
  const [logUser, setLogUser] = useState('')
  const [logAction, setLogAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState<any>(null)          // modal ya rekodi
  const [loans, setLoans] = useState<any[]>([])
  const [voidTarget, setVoidTarget] = useState<any>(null)
  const [reason, setReason] = useState('')
  const [siteForm, setSiteForm] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [ver, setVer] = useState(0)                  // inaongezeka ili kupakia upya kichupo cha sasa

  const qp = useCallback(() => {
    const p: any = {}
    if (site) p.site = site
    if (from) p.date_from = from
    if (to) p.date_to = to
    return p
  }, [site, from, to])

  const loadSites = () => api.get('/accounting/sites/').then(r => setSites(r.data)).catch(e => setMsg({ type: 'error', text: errMsg(e) }))

  useEffect(() => { api.post('/accounting/access/').catch(() => {}); loadSites() }, [])

  useEffect(() => {
    setLoading(true)
    const done = () => setLoading(false)
    const fail = (e: any) => { setMsg({ type: 'error', text: errMsg(e) }); done() }
    if (tab === 'summary') api.get('/accounting/summary/', { params: qp() }).then(r => { setSummary(r.data); done() }).catch(fail)
    else if (tab === 'entries') api.get('/accounting/entries/', { params: qp() }).then(r => { setEntries(r.data); done() }).catch(fail)
    else if (tab === 'logs') api.get('/accounting/logs/', { params: { ...qp(), user: logUser, action: logAction } }).then(r => { setLogs(r.data); done() }).catch(fail)
    else done()
  }, [tab, qp, logUser, logAction, ver])

  const reload = () => setVer(v => v + 1)

  // ── Rekodi ──
  const openEntry = (e?: any) => {
    api.get('/accounting/entries/', { params: { kind: 'loan', include_void: '0' } }).then(r => setLoans(r.data)).catch(() => {})
    setForm(e ? { ...e, site: e.site ?? '', interest_rate: e.interest_rate ?? '', loan_ref: e.loan_ref ?? '' } : { ...emptyEntry, site })
  }

  const saveEntry = async () => {
    setSaving(true)
    const payload: any = {
      site: form.kind === 'loan_payment' ? undefined : (form.site || null),
      date: form.date, category: form.category, description: form.description, amount: form.amount,
    }
    if (!form.id) { payload.kind = form.kind; if (form.kind === 'loan_payment') payload.loan_ref = form.loan_ref || null }
    if (form.kind === 'loan') payload.interest_rate = form.interest_rate === '' ? null : form.interest_rate
    try {
      if (form.id) await api.patch(`/accounting/entries/${form.id}/`, payload)
      else await api.post('/accounting/entries/', payload)
      setMsg({ type: 'success', text: form.id ? 'Rekodi imebadilishwa.' : 'Rekodi imeongezwa.' })
      setForm(null); reload()
    } catch (e) { setMsg({ type: 'error', text: errMsg(e) }) } finally { setSaving(false) }
  }

  const doVoid = async () => {
    setSaving(true)
    try {
      await api.post(`/accounting/entries/${voidTarget.id}/void/`, { reason })
      setMsg({ type: 'success', text: 'Rekodi imewekewa alama ya kufutwa. Inabaki kwenye vitabu.' })
      setVoidTarget(null); setReason(''); reload()
    } catch (e) { setMsg({ type: 'error', text: errMsg(e) }) } finally { setSaving(false) }
  }

  // ── Sites ──
  const saveSite = async () => {
    setSaving(true)
    try {
      if (siteForm.id) await api.patch(`/accounting/sites/${siteForm.id}/`, siteForm)
      else await api.post('/accounting/sites/', siteForm)
      setSiteForm(null); loadSites(); setMsg({ type: 'success', text: 'Site imehifadhiwa.' })
    } catch (e) { setMsg({ type: 'error', text: errMsg(e) }) } finally { setSaving(false) }
  }

  // ── Download (Excel / PDF) ──
  const download = async (type: 'xlsx' | 'pdf') => {
    try {
      const r = await api.get('/accounting/export/', { params: { ...qp(), type }, responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url; a.download = `uhasibu-${today()}.${type}`; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      // blob ya hitilafu — isome ili tuonyeshe ujumbe halisi
      let text = 'Imeshindwa kupakua.'
      try { text = JSON.parse(await e.response.data.text()).error || text } catch { /* tumia ujumbe wa kawaida */ }
      setMsg({ type: 'error', text })
    }
  }

  const s = summary
  const activeSites = sites.filter(x => x.is_active)
  const siteLabel = site === '' ? 'Sites zote' : site === 'company' ? 'Kampuni nzima' : (sites.find(x => String(x.id) === site)?.name || '')

  return (
    <Layout>
      <style>{ACSTYLE}</style>
      <PageHeader
        title="Uhasibu"
        subtitle="Vitabu vya kampuni — vimetengwa na malipo na vouchers za mfumo"
        action={<div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => download('xlsx')}>Pakua Excel</Button>
          <Button variant="ghost" size="sm" onClick={() => download('pdf')}>Pakua PDF</Button>
        </div>}
      />

      {msg && <div style={{ marginBottom: 12 }}><Alert type={msg.type} message={msg.text} /></div>}

      <Card style={{ padding: '1rem', marginBottom: '1rem' }}>
        <FormRow>
          <Select label="Site" value={site} onChange={(e: any) => setSite(e.target.value)}>
            <option value="">Zote</option>
            <option value="company">Kampuni nzima</option>
            {sites.map(x => <option key={x.id} value={x.id}>{x.name}{x.is_active ? '' : ' (imezimwa)'}</option>)}
          </Select>
          <Input label="Kuanzia" type="date" value={from} onChange={(e: any) => setFrom(e.target.value)} />
          <Input label="Hadi" type="date" value={to} onChange={(e: any) => setTo(e.target.value)} />
        </FormRow>
      </Card>

      <div className="ac-seg" role="tablist">
        {[['summary', 'Muhtasari'], ['entries', 'Rekodi'], ['sites', 'Sites'], ['logs', 'Logs']].map(([k, l]) => (
          <button key={k} role="tab" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'summary' && s && (
        <>
          <div className="ac-hero">
            <div>
              <small>{Number(s.profit) >= 0 ? 'Faida' : 'Hasara'} · {siteLabel} · {from || 'mwanzo'} hadi {to || 'leo'}</small>
              <div className="ac-big" style={{ color: Number(s.profit) >= 0 ? '#6ee7b7' : '#fda4af' }}>{money(s.profit)}</div>
              <small>Mapato {money(s.income)} − Matumizi {money(s.expense)}</small>
            </div>
            <TrendArea months={s.by_month} />
          </div>

          <div className="ac-kpis">
            {[['Mapato', s.income, C.income], ['Matumizi', s.expense, C.expense], ['Mali (assets)', s.assets, '#0ea5e9'],
              ['Madeni', s.liabilities, '#f59e0b'], ['Mikopo isiyolipwa', s.loans_outstanding, '#a855f7'], ['Mtaji (equity)', s.equity, C.profit]]
              .map(([l, v, c]: any) => <div className="ac-kpi" key={l}><span><i style={{ background: c }} />{l}</span><b>{money(v)}</b></div>)}
          </div>

          <div className="ac-grid">
            <div className="ac-card"><h3>Mapato na matumizi kwa mwezi</h3><p>Kiasi kwa TZS</p><MonthlyBars months={s.by_month} /></div>
            <div className="ac-card"><h3>Faida kwa site</h3><p>Nani anaingiza, nani anapoteza</p><SiteBars rows={s.by_site} /></div>
            <div className="ac-card"><h3>Matumizi kwa kundi</h3><p>Pesa inaenda wapi</p><CategoryDonut items={s.by_category.filter((c: any) => c.kind === 'expense')} /></div>
            <div className="ac-card"><h3>Mapato kwa kundi</h3><p>Pesa inatoka wapi</p><CategoryDonut items={s.by_category.filter((c: any) => c.kind === 'income')} /></div>
          </div>

          {s.by_site.length > 0 && (
            <div className="ac-card" style={{ padding: 0, overflow: 'hidden' }}>
              <Table loading={loading}
                headers={['Site', 'Mapato', 'Matumizi', 'Faida / Hasara', 'Mali', 'Madeni', 'Mikopo']}
                rows={s.by_site.map((r: any) => [r.site, fmt(r.income), fmt(r.expense),
                  <b style={{ color: Number(r.profit) < 0 ? '#dc2626' : 'inherit' }}>{fmt(r.profit)}</b>,
                  fmt(r.assets), fmt(r.liabilities), fmt(r.loans_outstanding)])} />
            </div>
          )}
          {!s.by_site.length && !s.by_month.length && <Card style={{ padding: '2rem', textAlign: 'center' }}>Bado hakuna rekodi kwenye kipindi hiki. Anza kwa kuongeza rekodi kwenye kichupo cha Rekodi.</Card>}
        </>
      )}

      {tab === 'entries' && (
        <Card>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => openEntry()}>Ongeza rekodi</Button>
          </div>
          <Table loading={loading} emptyMessage="Hakuna rekodi kwenye kipindi hiki."
            headers={['Tarehe', 'Site', 'Aina', 'Maelezo', 'Kiasi', 'Hali', '']}
            rows={entries.map(e => {
              const st = e.voided ? { textDecoration: 'line-through', opacity: 0.55 } : {}
              return [
                <span style={st}>{e.date}</span>,
                <span style={st}>{e.site_name}</span>,
                <Badge text={e.kind_display} color={KIND_COLOR[e.kind]} />,
                <span style={st}>{[e.category, e.description].filter(Boolean).join(' — ') || '—'}
                  {e.kind === 'loan' && ` (bakaa ${fmt(e.loan_balance)}${e.interest_rate ? `, riba ${e.interest_rate}%` : ''})`}</span>,
                <b style={st}>{fmt(e.amount)}</b>,
                e.voided ? <Badge text={`Imefutwa: ${e.void_reason}`} color="gray" /> : '',
                e.voided ? '' : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" variant="ghost" onClick={() => openEntry(e)}>Hariri</Button>
                    <Button size="sm" variant="danger" onClick={() => { setVoidTarget(e); setReason('') }}>Futa</Button>
                  </div>),
              ]
            })} />
        </Card>
      )}

      {tab === 'sites' && (
        <Card>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setSiteForm({ name: '', note: '', is_active: true })}>Ongeza site</Button>
          </div>
          <Table emptyMessage="Bado hakuna site. Ongeza ya kwanza."
            headers={['Jina', 'Maelezo', 'Hali', '']}
            rows={sites.map(x => [x.name, x.note || '—',
              <Badge text={x.is_active ? 'Inatumika' : 'Imezimwa'} color={x.is_active ? 'green' : 'gray'} />,
              <Button size="sm" variant="ghost" onClick={() => setSiteForm({ ...x })}>Hariri</Button>])} />
        </Card>
      )}

      {tab === 'logs' && (
        <Card>
          <div style={{ padding: '1rem' }}>
            <FormRow>
              <Select label="Mtumiaji" value={logUser} onChange={(e: any) => setLogUser(e.target.value)}>
                <option value="">Wote</option>
                {logs.users.map((u: string) => <option key={u} value={u}>{u}</option>)}
              </Select>
              <Select label="Kitendo" value={logAction} onChange={(e: any) => setLogAction(e.target.value)}>
                <option value="">Vyote</option>
                {Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormRow>
          </div>
          <Table loading={loading} emptyMessage="Hakuna logs."
            headers={['Lini', 'Nani', 'Kitendo', 'Site', 'Maelezo']}
            rows={logs.results.map((l: any) => [
              new Date(l.created_at).toLocaleString('en-GB'), <b>{l.username}</b>,
              ACTIONS[l.action] || l.action, l.site_name || '—', describe(l)])} />
        </Card>
      )}

      {/* Rekodi: ongeza / hariri */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Hariri rekodi' : 'Rekodi mpya'} width={520}>
        {form && (
          <>
            <Select label="Aina" value={form.kind} disabled={!!form.id} onChange={(e: any) => setForm({ ...form, kind: e.target.value })}>
              {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
            </Select>
            {form.kind === 'loan_payment' ? (
              <Select label="Mkopo" value={form.loan_ref} disabled={!!form.id} onChange={(e: any) => setForm({ ...form, loan_ref: e.target.value })}>
                <option value="">Chagua mkopo</option>
                {loans.map(l => <option key={l.id} value={l.id}>{l.site_name} — {l.description || l.category || `#${l.id}`} (bakaa {fmt(l.loan_balance)})</option>)}
              </Select>
            ) : (
              <Select label="Site" value={form.site} onChange={(e: any) => setForm({ ...form, site: e.target.value })}>
                <option value="">Kampuni nzima</option>
                {activeSites.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
              </Select>
            )}
            <FormRow>
              <Input label="Tarehe" type="date" value={form.date} onChange={(e: any) => setForm({ ...form, date: e.target.value })} />
              <Input label="Kiasi (TZS)" type="number" min="0" value={form.amount} onChange={(e: any) => setForm({ ...form, amount: e.target.value })} />
            </FormRow>
            <FormRow>
              <Input label="Kundi (mf. Umeme, Mshahara)" value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })} />
              {form.kind === 'loan' && <Input label="Riba (%)" type="number" min="0" value={form.interest_rate} onChange={(e: any) => setForm({ ...form, interest_rate: e.target.value })} />}
            </FormRow>
            <Input label="Maelezo" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setForm(null)}>Ghairi</Button>
              <Button loading={saving} onClick={saveEntry}>Hifadhi</Button>
            </FormActions>
          </>
        )}
      </Modal>

      {/* Futa kwa sababu */}
      <Modal open={!!voidTarget} onClose={() => setVoidTarget(null)} title="Futa rekodi">
        {voidTarget && (
          <>
            <p style={{ fontSize: 13, marginBottom: 12 }}>
              {voidTarget.kind_display} ya {money(voidTarget.amount)} ({voidTarget.date}) itaondolewa kwenye hesabu, lakini itabaki kwenye vitabu na logs.
            </p>
            <Input label="Sababu (inahitajika)" value={reason} onChange={(e: any) => setReason(e.target.value)} />
            <FormActions>
              <Button variant="ghost" onClick={() => setVoidTarget(null)}>Ghairi</Button>
              <Button variant="danger" loading={saving} disabled={!reason.trim()} onClick={doVoid}>Futa rekodi</Button>
            </FormActions>
          </>
        )}
      </Modal>

      {/* Site */}
      <Modal open={!!siteForm} onClose={() => setSiteForm(null)} title={siteForm?.id ? 'Hariri site' : 'Site mpya'}>
        {siteForm && (
          <>
            <Input label="Jina la site" value={siteForm.name} onChange={(e: any) => setSiteForm({ ...siteForm, name: e.target.value })} />
            <Input label="Maelezo (hiari)" value={siteForm.note} onChange={(e: any) => setSiteForm({ ...siteForm, note: e.target.value })} />
            {siteForm.id ? (
              <Select label="Hali" value={siteForm.is_active ? '1' : '0'} onChange={(e: any) => setSiteForm({ ...siteForm, is_active: e.target.value === '1' })}>
                <option value="1">Inatumika</option>
                <option value="0">Imezimwa (rekodi za zamani zinabaki)</option>
              </Select>
            ) : null}
            <FormActions>
              <Button variant="ghost" onClick={() => setSiteForm(null)}>Ghairi</Button>
              <Button loading={saving} disabled={!siteForm.name.trim()} onClick={saveSite}>Hifadhi</Button>
            </FormActions>
          </>
        )}
      </Modal>
    </Layout>
  )
}
