import { useEffect, useRef, useState, useCallback } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import { PageHeader, Button, Table, Badge, Modal, Input, Select, Alert, FormRow, FormActions } from '../components/UI'
import { fmt, money, TrendArea, MonthlyBars, SiteBars, CategoryDonut, C } from './AcctCharts'
import { useTr } from './AcctI18n'

const today = () => new Date().toISOString().slice(0, 10)
const KINDS = ['income', 'expense', 'asset', 'liability', 'loan', 'loan_payment']
const KIND_COLOR: Record<string, any> = { income: 'green', expense: 'red', asset: 'blue', liability: 'orange', loan: 'purple', loan_payment: 'yellow' }
const ACTIONS = ['open', 'create', 'update', 'void', 'export', 'site_create', 'site_update']
const TABS = ['summary', 'entries', 'sites', 'logs']
const emptyEntry = { id: 0, kind: 'income', site: '', date: today(), category: '', description: '', amount: '', interest_rate: '', loan_ref: '' }
const d = (ms: number) => ({ ['--d' as any]: `${ms}ms` }) as React.CSSProperties

// Namba zinazopanda (count-up) — zinaheshimu "reduce motion"
function Num({ v }: { v: any }) {
  const to = Number(v || 0)
  const [x, setX] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setX(to); prev.current = to; return }
    let raf = 0
    const t0 = performance.now()
    const step = (n: number) => {
      const p = Math.min(1, (n - t0) / 900)
      setX(from + (to - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step); else prev.current = to
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{money(x)}</>
}

const rows = Array.from({ length: 12 }, (_, i) => `.ac-view tbody tr:nth-child(${i + 1}){animation-delay:${i * 40}ms}`).join('')
const ACSTYLE = `
@keyframes acRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes acPop{from{opacity:0;transform:scale(.96) translateY(-6px)}to{opacity:1;transform:none}}
@keyframes acShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes acDrift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-18px) scale(1.15)}}
@keyframes acBreath{0%,100%{box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 18%,transparent)}50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--c) 6%,transparent)}}
.ac-rise{animation:acRise .55s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--d,0ms)}
.ac-view{animation:acRise .4s cubic-bezier(.22,1,.36,1) both}
.ac-view tbody tr{animation:acRise .45s cubic-bezier(.22,1,.36,1) both}${rows}
.ac-pop{animation:acPop .3s cubic-bezier(.34,1.4,.64,1) both}
.ac-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:1rem 1.1rem;margin-bottom:14px}
.ac-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;align-items:center;padding:1.6rem 1.8rem;border-radius:22px;background:linear-gradient(135deg,#0b1020 0%,#1e1b4b 100%);color:#fff;margin-bottom:16px;box-shadow:0 18px 40px -18px rgba(30,27,75,.55)}
.ac-hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(ellipse at 30% 40%,#000 20%,transparent 75%)}
.ac-blob{position:absolute;border-radius:50%;filter:blur(46px);opacity:.5;animation:acDrift 9s ease-in-out infinite}
.ac-hero>*{position:relative;z-index:1}.ac-hero>.ac-blob{position:absolute;z-index:0}
.ac-hero small{color:rgba(255,255,255,.62);font-size:12.5px}
.ac-big{font-size:clamp(28px,5vw,44px);font-weight:800;letter-spacing:-1.2px;line-height:1.1;margin:8px 0;font-variant-numeric:tabular-nums}
.ac-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:10px;margin-bottom:16px}
.ac-kpi,.ac-card{background:#fff;border:1px solid #eef0f6;border-radius:16px;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.ac-kpi{padding:.95rem 1.05rem}
.ac-kpi:hover,.ac-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px -16px rgba(79,70,229,.35);border-color:#dfe3f8}
.ac-kpi span{display:flex;align-items:center;gap:8px;font-size:12px;color:#64748b}
.ac-kpi i{width:8px;height:8px;border-radius:50%;background:var(--c);animation:acBreath 2.8s ease-in-out infinite}
.ac-kpi b{display:block;font-size:17px;margin-top:5px;color:#0f172a;font-variant-numeric:tabular-nums}
.ac-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:16px}
.ac-card{padding:1.15rem 1.3rem;min-width:0;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.ac-card h3{font-size:14px;font-weight:700;color:#0f172a;margin:0 0 2px}
.ac-card p{font-size:12px;color:#94a3b8;margin:0 0 10px}
.ac-seg{position:relative;display:inline-grid;grid-template-columns:repeat(4,minmax(84px,1fr));padding:4px;background:#eceef6;border-radius:14px;margin-bottom:16px;max-width:100%}
.ac-thumb{position:absolute;top:4px;bottom:4px;left:4px;width:calc((100% - 8px)/4);border-radius:10px;background:#fff;box-shadow:0 2px 8px rgba(15,23,42,.14);transform:translateX(calc(var(--i)*100%));transition:transform .4s cubic-bezier(.34,1.3,.64,1)}
.ac-seg button{position:relative;z-index:1;border:0;background:transparent;padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;color:#64748b;white-space:nowrap;transition:color .25s,transform .15s}
.ac-seg button[aria-pressed=true]{color:#4f46e5}.ac-seg button:active{transform:scale(.96)}
.ac-seg button:focus-visible{outline:2px solid #6366f1;outline-offset:1px}
.ac-sk{border-radius:16px;background:linear-gradient(90deg,#eef0f6 25%,#f7f8fc 50%,#eef0f6 75%);background-size:800px 100%;animation:acShimmer 1.3s linear infinite}
@media(max-width:900px){.ac-hero,.ac-grid{grid-template-columns:1fr}.ac-filters{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.ac-page *{animation:none!important;transition:none!important}}
`

export default function AccountingPage() {
  const { t, be, msg: bmsg, lang } = useTr()
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
  const [note, setNote] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<any>(null)
  const [loans, setLoans] = useState<any[]>([])
  const [voidTarget, setVoidTarget] = useState<any>(null)
  const [reason, setReason] = useState('')
  const [siteForm, setSiteForm] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [ver, setVer] = useState(0)

  const errMsg = (e: any): string => {
    const x = e?.response?.data
    if (!x) return t('err_net')
    if (typeof x === 'string') return bmsg(x)
    if (x.error || x.detail) return bmsg(x.error || x.detail)
    return Object.entries(x).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.map(bmsg).join(' ') : bmsg(String(v))}`).join(' | ')
  }
  const fail = (e: any) => setNote({ type: 'error', text: errMsg(e) })
  useEffect(() => { if (!note) return; const id = setTimeout(() => setNote(null), 6500); return () => clearTimeout(id) }, [note])

  const qp = useCallback(() => {
    const p: any = {}
    if (site) p.site = site
    if (from) p.date_from = from
    if (to) p.date_to = to
    return p
  }, [site, from, to])

  const loadSites = () => api.get('/accounting/sites/').then(r => setSites(r.data)).catch(fail)
  useEffect(() => { api.post('/accounting/access/').catch(() => {}); loadSites() }, [])  // eslint-disable-line

  useEffect(() => {
    setLoading(true)
    const ok = (set: (v: any) => void) => (r: any) => { set(r.data); setLoading(false) }
    const bad = (e: any) => { fail(e); setLoading(false) }
    if (tab === 'summary') api.get('/accounting/summary/', { params: qp() }).then(ok(setSummary)).catch(bad)
    else if (tab === 'entries') api.get('/accounting/entries/', { params: qp() }).then(ok(setEntries)).catch(bad)
    else if (tab === 'logs') api.get('/accounting/logs/', { params: { ...qp(), user: logUser, action: logAction } }).then(ok(setLogs)).catch(bad)
    else setLoading(false)
  }, [tab, qp, logUser, logAction, ver])  // eslint-disable-line
  const reload = () => setVer(v => v + 1)

  const openEntry = (e?: any) => {
    api.get('/accounting/entries/', { params: { kind: 'loan', include_void: '0' } }).then(r => setLoans(r.data)).catch(() => {})
    setForm(e ? { ...e, site: e.site ?? '', interest_rate: e.interest_rate ?? '', loan_ref: e.loan_ref ?? '' } : { ...emptyEntry, site })
  }
  const saveEntry = async () => {
    setSaving(true)
    const p: any = { site: form.kind === 'loan_payment' ? undefined : (form.site || null), date: form.date, category: form.category, description: form.description, amount: form.amount }
    if (!form.id) { p.kind = form.kind; if (form.kind === 'loan_payment') p.loan_ref = form.loan_ref || null }
    if (form.kind === 'loan') p.interest_rate = form.interest_rate === '' ? null : form.interest_rate
    try {
      if (form.id) await api.patch(`/accounting/entries/${form.id}/`, p); else await api.post('/accounting/entries/', p)
      setNote({ type: 'success', text: t(form.id ? 'msg_updated' : 'msg_added') }); setForm(null); reload()
    } catch (e) { fail(e) } finally { setSaving(false) }
  }
  const doVoid = async () => {
    setSaving(true)
    try {
      await api.post(`/accounting/entries/${voidTarget.id}/void/`, { reason })
      setNote({ type: 'success', text: t('msg_voided') }); setVoidTarget(null); setReason(''); reload()
    } catch (e) { fail(e) } finally { setSaving(false) }
  }
  const saveSite = async () => {
    setSaving(true)
    try {
      if (siteForm.id) await api.patch(`/accounting/sites/${siteForm.id}/`, siteForm); else await api.post('/accounting/sites/', siteForm)
      setSiteForm(null); loadSites(); setNote({ type: 'success', text: t('msg_site') })
    } catch (e) { fail(e) } finally { setSaving(false) }
  }
  const download = async (type: 'xlsx' | 'pdf') => {
    try {
      const r = await api.get('/accounting/export/', { params: { ...qp(), type }, responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a'); a.href = url; a.download = `accounting-${today()}.${type}`; a.click(); URL.revokeObjectURL(url)
    } catch (e: any) {
      let text = t('err_dl')
      try { text = bmsg(JSON.parse(await e.response.data.text()).error || text) } catch { /* ujumbe wa kawaida */ }
      setNote({ type: 'error', text })
    }
  }

  const describe = (l: any): string => {
    const x = l.detail || {}
    if (x.changes) return Object.entries(x.changes).map(([k, v]: any) => `${k}: ${v.kabla ?? '—'} → ${v.baada ?? '—'}`).join(', ') || t('none')
    if (x.reason) return `${t('reason')}: ${x.reason} (${fmt(x.snapshot?.amount)})`
    if (x.after) return `${x.kind ? t('k_' + x.kind) : ''} ${x.after.amount ? money(x.after.amount) : x.after.name || ''} ${x.after.description || x.after.category || ''}`.trim()
    if (x.type) return `${t('file')}: ${String(x.type).toUpperCase()} (${x.date_from || t('start')} → ${x.date_to || t('now')})`
    return ''
  }

  const s = summary
  const activeSites = sites.filter(x => x.is_active)
  const siteLabel = site === '' ? t('all_sites') : site === 'company' ? t('company') : (sites.find(x => String(x.id) === site)?.name || '')
  const cats = (k: string) => (s?.by_category || []).filter((c: any) => c.kind === k)
  const isProfit = Number(s?.profit) >= 0

  return (
    <Layout>
      <style>{ACSTYLE}</style>
      <div className="ac-page" style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={t('title')} subtitle={t('subtitle')}
          action={<div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => download('xlsx')}>{t('dl_xlsx')}</Button>
            <Button variant="ghost" size="sm" onClick={() => download('pdf')}>{t('dl_pdf')}</Button>
          </div>} />

        {note && <div className="ac-pop" style={{ marginBottom: 12 }}><Alert type={note.type} message={note.text} /></div>}

        <div className="ac-card ac-filters ac-rise">
          <Select label={t('site')} value={site} onChange={(e: any) => setSite(e.target.value)}>
            <option value="">{t('all')}</option>
            <option value="company">{t('company')}</option>
            {sites.map(x => <option key={x.id} value={x.id}>{x.name}{x.is_active ? '' : ` (${t('inactive')})`}</option>)}
          </Select>
          <Input label={t('from')} type="date" value={from} onChange={(e: any) => setFrom(e.target.value)} />
          <Input label={t('to')} type="date" value={to} onChange={(e: any) => setTo(e.target.value)} />
        </div>

        <div className="ac-seg ac-rise" style={{ ...d(60), ['--i' as any]: TABS.indexOf(tab) }} role="tablist">
          <span className="ac-thumb" />
          {TABS.map(k => <button key={k} role="tab" aria-pressed={tab === k} onClick={() => setTab(k)}>{t('tab_' + k)}</button>)}
        </div>

        <div key={tab + lang} className="ac-view">
          {tab === 'summary' && !s && <><div className="ac-sk" style={{ height: 170, marginBottom: 16 }} /><div className="ac-grid"><div className="ac-sk" style={{ height: 300 }} /><div className="ac-sk" style={{ height: 300 }} /></div></>}

          {tab === 'summary' && s && (
            <>
              <div className="ac-hero">
                <span className="ac-blob" style={{ width: 220, height: 220, background: '#6366f1', top: -60, left: -40 }} />
                <span className="ac-blob" style={{ width: 180, height: 180, background: '#10b981', bottom: -70, right: '30%', animationDelay: '-4s', opacity: .3 }} />
                <div>
                  <small>{t(isProfit ? 'profit' : 'loss')} · {siteLabel} · {from || t('start')} → {to || t('now')}</small>
                  <div className="ac-big" style={{ color: isProfit ? '#6ee7b7' : '#fda4af' }}><Num v={s.profit} /></div>
                  <small>{t('hero_sub', { i: money(s.income), e: money(s.expense) })}</small>
                </div>
                <TrendArea months={s.by_month} />
              </div>

              <div className="ac-kpis">
                {[['income', s.income, C.income], ['expense', s.expense, C.expense], ['assets', s.assets, '#0ea5e9'],
                  ['liabilities', s.liabilities, '#f59e0b'], ['loans_out', s.loans_outstanding, '#a855f7'], ['equity', s.equity, C.profit]]
                  .map(([k, v, c]: any, i) => (
                    <div className="ac-kpi ac-rise" key={k} style={{ ...d(80 + i * 60), ['--c' as any]: c }} title={k === 'equity' ? t('equity_sub') : undefined}>
                      <span><i />{t(k)}</span><b><Num v={v} /></b>
                    </div>))}
              </div>

              <div className="ac-grid">
                <div className="ac-card ac-rise" style={d(120)}><h3>{t('chart_monthly')}</h3><p>{t('chart_monthly_sub')}</p><MonthlyBars months={s.by_month} /></div>
                <div className="ac-card ac-rise" style={d(200)}><h3>{t('chart_site')}</h3><p>{t('chart_site_sub')}</p><SiteBars rows={s.by_site} /></div>
                <div className="ac-card ac-rise" style={d(280)}><h3>{t('chart_exp')}</h3><p>{t('chart_exp_sub')}</p><CategoryDonut items={cats('expense')} /></div>
                <div className="ac-card ac-rise" style={d(360)}><h3>{t('chart_inc')}</h3><p>{t('chart_inc_sub')}</p><CategoryDonut items={cats('income')} /></div>
              </div>

              {s.by_site.length > 0 && (
                <div className="ac-card ac-rise" style={{ ...d(420), padding: 0, overflow: 'hidden' }}>
                  <Table loading={loading}
                    headers={[t('site'), t('income'), t('expense'), t('profit_loss'), t('col_assets'), t('col_liab'), t('col_loans')]}
                    rows={s.by_site.map((r: any) => [be(r.site), fmt(r.income), fmt(r.expense),
                      <b style={{ color: Number(r.profit) < 0 ? '#dc2626' : 'inherit' }}>{fmt(r.profit)}</b>,
                      fmt(r.assets), fmt(r.liabilities), fmt(r.loans_outstanding)])} />
                </div>
              )}
              {!s.by_site.length && !s.by_month.length && <div className="ac-card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{t('empty_period')}</div>}
            </>
          )}

          {tab === 'entries' && (
            <div className="ac-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}><Button onClick={() => openEntry()}>{t('add_entry')}</Button></div>
              <Table loading={loading} emptyMessage={t('none_entries')}
                headers={[t('col_date'), t('site'), t('col_type'), t('col_desc'), t('col_amount'), t('col_status'), '']}
                rows={entries.map(e => {
                  const st = e.voided ? { textDecoration: 'line-through', opacity: 0.55 } : {}
                  return [
                    <span style={st}>{e.date}</span>, <span style={st}>{be(e.site_name)}</span>,
                    <Badge text={t('k_' + e.kind)} color={KIND_COLOR[e.kind]} />,
                    <span style={st}>{[be(e.category), e.description].filter(Boolean).join(' — ') || '—'}
                      {e.kind === 'loan' && ` (${t('balance')} ${fmt(e.loan_balance)}${e.interest_rate ? `, ${t('rate')} ${e.interest_rate}%` : ''})`}</span>,
                    <b style={st}>{fmt(e.amount)}</b>,
                    e.voided ? <Badge text={`${t('voided')}: ${e.void_reason}`} color="gray" /> : '',
                    e.voided ? '' : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="ghost" onClick={() => openEntry(e)}>{t('edit')}</Button>
                        <Button size="sm" variant="danger" onClick={() => { setVoidTarget(e); setReason('') }}>{t('del')}</Button>
                      </div>),
                  ]
                })} />
            </div>
          )}

          {tab === 'sites' && (
            <div className="ac-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}><Button onClick={() => setSiteForm({ name: '', note: '', is_active: true })}>{t('add_site')}</Button></div>
              <Table emptyMessage={t('no_sites')} headers={[t('col_name'), t('col_desc'), t('col_status'), '']}
                rows={sites.map(x => [x.name, x.note || '—', <Badge text={t(x.is_active ? 'active' : 'disabled')} color={x.is_active ? 'green' : 'gray'} />,
                  <Button size="sm" variant="ghost" onClick={() => setSiteForm({ ...x })}>{t('edit')}</Button>])} />
            </div>
          )}

          {tab === 'logs' && (
            <div className="ac-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem' }}>
                <FormRow>
                  <Select label={t('user')} value={logUser} onChange={(e: any) => setLogUser(e.target.value)}>
                    <option value="">{t('all_m')}</option>{logs.users.map((u: string) => <option key={u} value={u}>{u}</option>)}
                  </Select>
                  <Select label={t('action')} value={logAction} onChange={(e: any) => setLogAction(e.target.value)}>
                    <option value="">{t('all_n')}</option>{ACTIONS.map(k => <option key={k} value={k}>{t('a_' + k)}</option>)}
                  </Select>
                </FormRow>
              </div>
              <Table loading={loading} emptyMessage={t('no_logs')} headers={[t('col_when'), t('col_who'), t('action'), t('site'), t('col_desc')]}
                rows={logs.results.map((l: any) => [new Date(l.created_at).toLocaleString(lang === 'sw' ? 'sw-TZ' : 'en-GB'), <b>{l.username}</b>,
                  ACTIONS.includes(l.action) ? t('a_' + l.action) : l.action, be(l.site_name) || '—', describe(l)])} />
            </div>
          )}
        </div>
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={t(form?.id ? 'modal_edit' : 'modal_new')} width={520}>
        {form && (<>
          <Select label={t('col_type')} value={form.kind} disabled={!!form.id} onChange={(e: any) => setForm({ ...form, kind: e.target.value })}>
            {KINDS.map(k => <option key={k} value={k}>{t('k_' + k)}</option>)}
          </Select>
          {form.kind === 'loan_payment' ? (
            <Select label={t('f_loan')} value={form.loan_ref} disabled={!!form.id} onChange={(e: any) => setForm({ ...form, loan_ref: e.target.value })}>
              <option value="">{t('pick_loan')}</option>
              {loans.map(l => <option key={l.id} value={l.id}>{be(l.site_name)} — {l.description || l.category || `#${l.id}`} ({t('balance')} {fmt(l.loan_balance)})</option>)}
            </Select>
          ) : (
            <Select label={t('site')} value={form.site} onChange={(e: any) => setForm({ ...form, site: e.target.value })}>
              <option value="">{t('company')}</option>{activeSites.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </Select>
          )}
          <FormRow>
            <Input label={t('col_date')} type="date" value={form.date} onChange={(e: any) => setForm({ ...form, date: e.target.value })} />
            <Input label={t('f_amount')} type="number" min="0" value={form.amount} onChange={(e: any) => setForm({ ...form, amount: e.target.value })} />
          </FormRow>
          <FormRow>
            <Input label={t('f_cat')} value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })} />
            {form.kind === 'loan' && <Input label={t('f_rate')} type="number" min="0" value={form.interest_rate} onChange={(e: any) => setForm({ ...form, interest_rate: e.target.value })} />}
          </FormRow>
          <Input label={t('col_desc')} value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
          <FormActions><Button variant="ghost" onClick={() => setForm(null)}>{t('cancel')}</Button><Button loading={saving} onClick={saveEntry}>{t('save')}</Button></FormActions>
        </>)}
      </Modal>

      <Modal open={!!voidTarget} onClose={() => setVoidTarget(null)} title={t('void_title')}>
        {voidTarget && (<>
          <p style={{ fontSize: 13, marginBottom: 12 }}>{t('void_note', { k: t('k_' + voidTarget.kind), a: money(voidTarget.amount), d: voidTarget.date })}</p>
          <Input label={t('void_reason')} value={reason} onChange={(e: any) => setReason(e.target.value)} />
          <FormActions><Button variant="ghost" onClick={() => setVoidTarget(null)}>{t('cancel')}</Button><Button variant="danger" loading={saving} disabled={!reason.trim()} onClick={doVoid}>{t('void_title')}</Button></FormActions>
        </>)}
      </Modal>

      <Modal open={!!siteForm} onClose={() => setSiteForm(null)} title={t(siteForm?.id ? 'site_edit' : 'site_new')}>
        {siteForm && (<>
          <Input label={t('site_name')} value={siteForm.name} onChange={(e: any) => setSiteForm({ ...siteForm, name: e.target.value })} />
          <Input label={t('site_note')} value={siteForm.note} onChange={(e: any) => setSiteForm({ ...siteForm, note: e.target.value })} />
          {siteForm.id ? (
            <Select label={t('col_status')} value={siteForm.is_active ? '1' : '0'} onChange={(e: any) => setSiteForm({ ...siteForm, is_active: e.target.value === '1' })}>
              <option value="1">{t('active')}</option><option value="0">{t('keeps_old')}</option>
            </Select>) : null}
          <FormActions><Button variant="ghost" onClick={() => setSiteForm(null)}>{t('cancel')}</Button><Button loading={saving} disabled={!siteForm.name.trim()} onClick={saveSite}>{t('save')}</Button></FormActions>
        </>)}
      </Modal>
    </Layout>
  )
}
