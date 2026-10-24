import { useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, Button, Table, Badge } from '../components/UI'
import { useTt } from './TrackI18n'

const money = (n: any) => `TZS ${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
const LEVEL: Record<string, { c: string; bg: string; icon: string }> = {
  error: { c: '#b91c1c', bg: '#fef2f2', icon: '✕' }, warning: { c: '#b45309', bg: '#fffbeb', icon: '!' }, info: { c: '#475569', bg: '#f1f5f9', icon: 'i' },
}
const RANK: Record<string, number> = { error: 0, warning: 1, info: 2 }
const STATE_COLOR: Record<string, any> = { unused: 'gray', running: 'green', expired: 'red' }
const PAY_COLOR: Record<string, any> = { completed: 'green', processing: 'yellow', pending: 'yellow', failed: 'red', duplicate: 'gray', invalid: 'red' }

const bytes = (b: any) => { let n = Number(b || 0); const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (n >= 1024 && i < 3) { n /= 1024; i++ } return `${n.toFixed(i ? 1 : 0)} ${u[i]}` }
const recentGet = (): string[] => { try { return JSON.parse(localStorage.getItem('vt_recent') || '[]') } catch { return [] } }
const recentSet = (v: string[]) => { try { localStorage.setItem('vt_recent', JSON.stringify(v)) } catch { /* hifadhi si lazima */ } }

const CSS = `
@keyframes vtRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes vtFill{from{width:0}to{width:var(--w)}}
@keyframes vtPulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}60%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}
@keyframes vtPop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes vtShimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.vt-rise{animation:vtRise .5s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--d,0ms)}
.vt-card{background:#fff;border:1px solid #eef0f6;border-radius:18px;padding:1.2rem 1.4rem;margin-bottom:14px;box-shadow:0 1px 2px rgba(15,23,42,.04);transition:box-shadow .25s,border-color .25s}
.vt-card:hover{box-shadow:0 14px 30px -18px rgba(79,70,229,.35);border-color:#dfe3f8}
.vt-card h3{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin:0 0 12px}
.vt-search{display:flex;gap:10px;padding:8px;border-radius:18px;background:#fff;border:2px solid #e0e7ff;box-shadow:0 10px 30px -18px rgba(99,102,241,.55);transition:border-color .2s,box-shadow .2s;margin-bottom:12px}
.vt-search:focus-within{border-color:#6366f1;box-shadow:0 14px 34px -14px rgba(99,102,241,.6)}
.vt-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:600 20px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;padding:8px 12px;color:#0f172a}
.vt-chip{border:1px solid #e0e7ff;background:#f5f7ff;color:#4338ca;border-radius:999px;padding:4px 12px;font:600 12px ui-monospace,Menlo,monospace;transition:transform .15s,background .15s}
.vt-chip:hover{background:#e0e7ff;transform:translateY(-1px)}
.vt-banner{display:flex;gap:14px;align-items:center;padding:1rem 1.25rem;border-radius:18px;margin-bottom:14px}
.vt-ico{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:800;flex-shrink:0;animation:vtPop .5s .15s cubic-bezier(.34,1.56,.64,1) both}
.vt-issue{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;margin-top:8px;font-size:13px;line-height:1.45;animation:vtRise .45s both;animation-delay:var(--d,0ms)}
.vt-code{font:800 clamp(22px,5vw,32px) ui-monospace,Menlo,Consolas,monospace;letter-spacing:.1em;color:#0f172a}
.vt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.vt-kv span{display:block;font-size:11.5px;color:#94a3b8;margin-bottom:2px}.vt-kv b{font-size:14px;color:#0f172a;word-break:break-word}
.vt-tl{position:relative;display:grid;grid-template-columns:repeat(3,1fr);text-align:center;padding-top:6px}
.vt-line{position:absolute;top:17px;left:16.66%;right:16.66%;height:4px;background:#eceef6;border-radius:4px;overflow:hidden}
.vt-fill{height:100%;width:var(--w);background:linear-gradient(90deg,#6366f1,#10b981);border-radius:4px;animation:vtFill 1.1s .2s cubic-bezier(.22,1,.36,1) both}
.vt-fill.exp{background:linear-gradient(90deg,#6366f1,#ef4444)}
.vt-dot{position:relative;z-index:1;width:24px;height:24px;border-radius:50%;margin:0 auto 8px;background:#fff;border:3px solid #dfe3f8;transition:all .3s}
.vt-dot.done{background:#6366f1;border-color:#6366f1;animation:vtPop .5s both}
.vt-dot.live{background:#10b981;border-color:#10b981;animation:vtPulse 1.8s infinite}
.vt-dot.end{background:#ef4444;border-color:#ef4444;animation:vtPop .5s both}
.vt-tl small{display:block;font-size:11.5px;color:#94a3b8}.vt-tl b{font-size:13px;color:#0f172a}
.vt-clock{margin-top:16px;text-align:center;font:800 clamp(26px,6vw,40px) ui-monospace,Menlo,monospace;font-variant-numeric:tabular-nums;color:#059669;letter-spacing:.04em}
.vt-sk{border-radius:18px;background:linear-gradient(90deg,#eef0f6 25%,#f7f8fc 50%,#eef0f6 75%);background-size:800px 100%;animation:vtShimmer 1.3s linear infinite}
details.vt-tech summary{cursor:pointer;font-weight:700;font-size:13px;color:#4338ca;list-style:none}
details.vt-tech summary::before{content:'▸';display:inline-block;margin-right:8px;transition:transform .2s}
details.vt-tech[open] summary::before{transform:rotate(90deg)}
@media(prefers-reduced-motion:reduce){.vt-page *{animation:none!important;transition:none!important}}
`
const d = (ms: number) => ({ ['--d' as any]: `${ms}ms` }) as React.CSSProperties

function Clock({ expires }: { expires: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const s = Math.max(0, Math.floor((new Date(expires).getTime() - now) / 1000))
  const p = (n: number) => String(n).padStart(2, '0')
  const days = Math.floor(s / 86400)
  return <>{days > 0 ? `${days}d ` : ''}{p(Math.floor((s % 86400) / 3600))}:{p(Math.floor((s % 3600) / 60))}:{p(s % 60)}</>
}

export default function VoucherTrackPage() {
  const { t, dt } = useTt()
  const { isSuperAdmin } = useAuth()
  const [q, setQ] = useState('')
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState<any>(null)
  const [liveBusy, setLiveBusy] = useState(false)
  const [liveErr, setLiveErr] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>(recentGet())
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])

  const dur = (m: number) => (m % 1440 === 0 ? t('d_day', { n: m / 1440 }) : m % 60 === 0 ? t('d_hour', { n: m / 60 }) : t('d_min', { n: m }))

  const run = async (raw?: string) => {
    const code = (raw ?? q).trim()
    if (!code) { setErr('code_required'); setData(null); return }
    setQ(code); setLoading(true); setErr(null); setData(null); setLive(null); setLiveErr(null)
    try {
      const r = await api.get('/tracking/voucher/', { params: { code } })
      setData(r.data)
      const next = [r.data.voucher.code, ...recent.filter(x => x !== r.data.voucher.code)].slice(0, 6)
      setRecent(next); recentSet(next)
    } catch (e: any) {
      const s = e?.response?.status
      setErr(s === 404 ? 'not_found' : s === 400 ? 'code_required' : 'err_net')
    } finally { setLoading(false) }
  }

  const checkRouter = async () => {
    setLiveBusy(true); setLive(null); setLiveErr(null)
    try { setLive((await api.post('/tracking/voucher/live/', { code: data.voucher.code })).data) }
    catch (e: any) {
      const x = e?.response?.data
      setLiveErr(x?.error === 'router_unreachable' ? t('e_router_unreachable', { router: x.router })
        : x?.error === 'router_error' ? t('e_router_error', { detail: x.detail }) : t('err_net'))
    } finally { setLiveBusy(false) }
  }

  const copy = async () => { try { await navigator.clipboard.writeText(data.voucher.code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* hakuna ruhusa */ } }

  const v = data?.voucher, tl = data?.timeline
  const issues = [...(data?.issues || [])].sort((a: any, b: any) => RANK[a.level] - RANK[b.level])
  const problems = issues.filter((i: any) => i.level !== 'info').length
  const issueText = (i: any) => t('i_' + i.code, { ...i.params, status: i.code === 'payment_status' ? t('p_' + i.params.status) : i.code === 'job_stuck' ? t('j_' + i.params.status) : i.params?.status, seen: i.params?.last_seen ? ` (${dt(i.params.last_seen)})` : '', since: i.params?.since ? dt(i.params.since) : '' })
  const pct = tl?.state === 'running' && tl.total_seconds ? Math.min(100, ((tl.elapsed_seconds || 0) / tl.total_seconds) * 100) : 0
  const fill = tl?.state === 'expired' ? 100 : tl?.state === 'running' ? 50 + pct / 2 : 0
  const IssueList = ({ list, base = 0 }: { list: any[]; base?: number }) => <>{list.map((i, n) => (
    <div className="vt-issue" key={i.code + n} style={{ ...d(base + n * 70), background: LEVEL[i.level].bg, color: LEVEL[i.level].c }}>
      <b style={{ width: 18, textAlign: 'center' }}>{LEVEL[i.level].icon}</b><span>{issueText(i)}</span></div>))}</>

  return (
    <Layout>
      <style>{CSS}</style>
      <div className="vt-page" style={{ padding: '1.25rem', maxWidth: 900, margin: '0 auto' }}>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />

        <form className="vt-search vt-rise" onSubmit={e => { e.preventDefault(); run() }}>
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder={t('ph')} spellCheck={false} autoCapitalize="characters" autoComplete="off" />
          <Button loading={loading} onClick={() => run()}>{t('search')}</Button>
        </form>
        {recent.length > 0 && !data && !loading && (
          <div className="vt-rise" style={{ ...d(80), display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <small style={{ color: '#94a3b8' }}>{t('recent')}:</small>{recent.map(c => <button key={c} type="button" className="vt-chip" onClick={() => run(c)}>{c}</button>)}
          </div>)}

        {loading && <><div className="vt-sk" style={{ height: 90, marginBottom: 14 }} /><div className="vt-sk" style={{ height: 200, marginBottom: 14 }} /></>}

        {!data && !loading && !err && <div className="vt-card vt-rise" style={{ ...d(120), textAlign: 'center', color: '#64748b', fontSize: 13.5 }}>{t('hint')}</div>}

        {err && !loading && (
          <div className="vt-card vt-rise" style={{ textAlign: 'center' }}>
            <div className="vt-ico" style={{ margin: '0 auto 10px', background: '#fef2f2', color: '#b91c1c' }}>?</div>
            <b style={{ fontSize: 16 }}>{t(err === 'not_found' ? 'not_found' : err)}</b>
            {err === 'not_found' && <p style={{ color: '#64748b', fontSize: 13, margin: '6px 0 0' }}>{t(isSuperAdmin ? 'not_found_admin' : 'not_found_sub')}</p>}
          </div>)}

        {data && !loading && (<>
          <div className="vt-banner vt-rise" style={{ background: problems ? (issues.some((i: any) => i.level === 'error') ? '#fef2f2' : '#fffbeb') : '#ecfdf5' }}>
            <div className="vt-ico" style={{ background: problems ? LEVEL[issues[0].level].c : '#10b981', color: '#fff' }}>{problems ? LEVEL[issues[0].level].icon : '✓'}</div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 15 }}>{problems ? `${t('issues_found')} (${problems})` : t('no_issues')}</b>
              {!problems && <div style={{ fontSize: 12.5, color: '#047857', marginTop: 2 }}>{t('no_issues_sub')}</div>}
            </div>
          </div>
          {issues.length > 0 && <div style={{ marginTop: -6, marginBottom: 14 }}><IssueList list={issues} /></div>}

          <div className="vt-card vt-rise" style={d(60)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div><span className="vt-code">{v.code}</span>
                <button type="button" className="vt-chip" style={{ marginLeft: 10 }} onClick={copy}>{copied ? t('copied') : t('copy')}</button></div>
              <Badge text={t('s_' + tl.state)} color={STATE_COLOR[tl.state]} />
            </div>
            <div className="vt-grid" style={{ marginTop: 14 }}>
              {isSuperAdmin && <div className="vt-kv"><span>{t('client')}</span><b>{v.client}</b></div>}
              <div className="vt-kv"><span>{t('router')}</span><b>{v.router || '—'} {v.router_online !== null && <span style={{ display: 'inline', color: v.router_online ? '#059669' : '#dc2626', fontWeight: 600 }}>● {t(v.router_online ? 'online' : 'offline')}</span>}</b></div>
              <div className="vt-kv"><span>{t('phone')}</span><b>{v.customer_phone || '—'}</b></div>
              <div className="vt-kv"><span>{t('origin')}</span><b>{t(v.origin === 'payment' ? 'o_payment' : 'o_manual')}</b></div>
            </div>
          </div>

          <div className="vt-card vt-rise" style={d(120)}>
            <div className="vt-tl">
              <div className="vt-line"><div className={`vt-fill ${tl.state === 'expired' ? 'exp' : ''}`} style={{ ['--w' as any]: `${fill}%` }} /></div>
              <div><div className="vt-dot done" /><small>{t('tl_created')}</small><b>{dt(tl.created_at)}</b></div>
              <div><div className={`vt-dot ${tl.first_used_at ? (tl.state === 'running' ? 'live' : 'done') : ''}`} /><small>{t('tl_started')}</small><b>{tl.first_used_at ? dt(tl.first_used_at) : t('tl_not_started')}</b></div>
              <div><div className={`vt-dot ${tl.state === 'expired' ? 'end' : ''}`} /><small>{t(tl.state === 'expired' ? 'tl_ended' : 'tl_ends')}</small><b>{tl.expires_at ? dt(tl.expires_at) : '—'}</b></div>
            </div>
            {tl.state === 'running' && <div className="vt-clock"><small style={{ display: 'block', font: '600 12px system-ui', color: '#94a3b8', letterSpacing: 0 }}>{t('remaining')}</small><Clock expires={tl.expires_at} /></div>}
            {tl.state === 'unused' && <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, margin: '14px 0 0' }}>{t('tl_starts_on_use')} · {dur(data.package.duration_minutes)}</p>}
          </div>

          <div className="vt-grid">
            <div className="vt-card vt-rise" style={d(180)}><h3>{t('package')}</h3>
              <div className="vt-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                <div className="vt-kv"><span>{t('package')}</span><b>{data.package.name}</b></div>
                <div className="vt-kv"><span>{t('duration')}</span><b>{dur(data.package.duration_minutes)}</b></div>
                <div className="vt-kv"><span>{t('speed')}</span><b>{data.package.speed_up} / {data.package.speed_down} Mbps</b></div>
                <div className="vt-kv"><span>{t('price')}</span><b>{money(v.sold_price)}</b></div>
              </div></div>
            {data.payment && <div className="vt-card vt-rise" style={d(240)}><h3>{t('payment')}</h3>
              <div className="vt-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                <div className="vt-kv"><span>{t('amount')}</span><b>{money(data.payment.amount)}</b></div>
                <div className="vt-kv"><span>{t('status')}</span><b><Badge text={t('p_' + data.payment.status)} color={PAY_COLOR[data.payment.status]} /></b></div>
                <div className="vt-kv"><span>{t('txn')}</span><b>{data.payment.transaction_id || '—'}</b></div>
                <div className="vt-kv"><span>{t('when')}</span><b>{dt(data.payment.created_at)}</b></div>
              </div></div>}
          </div>

          <div className="vt-card vt-rise" style={d(300)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="ghost" loading={liveBusy} onClick={checkRouter}>{liveBusy ? t('live_busy') : t('live_btn')}</Button>
              <small style={{ color: '#94a3b8', flex: 1, minWidth: 200 }}>{t('live_note')}</small>
            </div>
            {liveErr && <div className="vt-issue" style={{ background: LEVEL.error.bg, color: LEVEL.error.c }}><b>✕</b><span>{liveErr}</span></div>}
            {live && (<div style={{ marginTop: 14 }}>
              <h3>{t('live_title')} · {live.router}</h3>
              <div className="vt-grid">
                <div className="vt-kv"><span>{t('l_exists')}</span><b>{live.user ? t('ok_yes') : t('ok_no')}</b></div>
                {live.user && <>
                  <div className="vt-kv"><span>{t('l_profile')}</span><b>{live.user.profile}</b></div>
                  <div className="vt-kv"><span>{t('l_uptime')}</span><b>{live.user.uptime || '0s'} / {live.user['limit-uptime'] || '—'}</b></div>
                  <div className="vt-kv"><span>{t('l_traffic')}</span><b>{bytes(live.user['bytes-out'])} / {bytes(live.user['bytes-in'])}</b></div>
                  <div className="vt-kv"><span>{t('l_disabled')}</span><b>{live.user.disabled === 'true' ? t('ok_yes') : t('ok_no')}</b></div></>}
                <div className="vt-kv"><span>{t('l_active')}</span><b>{live.active ? `${t('ok_yes')} · ${live.active.address} · ${live.active['session-time-left'] || ''}` : t('l_not_active')}</b></div>
                {live.scheduler && <div className="vt-kv"><span>{t('l_sched')}</span><b>{live.scheduler['start-date']} {live.scheduler['start-time']} · {live.scheduler.interval}</b></div>}
              </div>
              <IssueList list={live.issues} />
            </div>)}
          </div>

          <div className="vt-card vt-rise" style={d(360)}>
            <details className="vt-tech"><summary>{t('tech')}</summary>
              <h3 style={{ marginTop: 14 }}>{t('jobs')}</h3>
              <Table emptyMessage={t('none')} headers={[t('router'), t('status'), t('retries'), t('error'), t('when')]}
                rows={data.jobs.map((j: any) => [j.router, <Badge text={t('j_' + j.status)} color={j.status === 'completed' ? 'green' : j.status === 'failed' ? 'red' : 'yellow'} />, j.retries, j.error_message || '—', dt(j.created_at)])} />
              <h3 style={{ marginTop: 14 }}>{t('presences')}</h3>
              <Table emptyMessage={t('none')} headers={[t('router'), t('status'), t('error'), t('when')]}
                rows={data.presences.map((p: any) => [p.router, <Badge text={t('r_' + p.status)} color={p.status === 'active' ? 'green' : p.status === 'failed' ? 'red' : 'gray'} />, p.error_message || '—', dt(p.created_at)])} />
              <h3 style={{ marginTop: 14 }}>{t('sms')}</h3>
              <Table emptyMessage={t('none')} headers={[t('phone'), t('status'), t('retries'), t('when')]}
                rows={data.sms.map((s: any) => [s.phone, <Badge text={t('m_' + s.status)} color={s.status === 'sent' ? 'green' : s.status === 'failed' ? 'red' : 'yellow'} />, s.retries, dt(s.sent_at || s.created_at)])} />
              {data.print_batch && <p style={{ fontSize: 13, color: '#64748b', marginTop: 14 }}>{t('batch')}: #{data.print_batch.id} · {data.print_batch.quantity} · {dt(data.print_batch.created_at)}</p>}
            </details>
          </div>
        </>)}
      </div>
    </Layout>
  )
}
