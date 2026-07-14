import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../lib/api'
import Layout from '../components/Layout'
import { Card, CardHeader, Badge, Button, Alert, Tabs, PageHeader, ConfirmDialog } from '../components/UI'
import { useLang } from '../contexts/LangContext'

// ── SVG icons (sawa na muundo wa VoucherManagementPage) ───────────────
const Icons = {
  Report: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" />
      <circle cx="7" cy="15" r="1" fill="currentColor" /><circle cx="11" cy="10" r="1" fill="currentColor" />
      <circle cx="14" cy="13" r="1" fill="currentColor" /><circle cx="19" cy="6" r="1" fill="currentColor" />
    </svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" />
    </svg>
  ),
  Money: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Voucher: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" /><path d="M2 15v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
      <path d="M20 9a2 2 0 0 0 0 6" /><path d="M4 9a2 2 0 0 1 0 6" />
    </svg>
  ),
  Today: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Open: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
    </svg>
  ),
  Empty: () => (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
}

// ── Tafsiri za ndani (haitegemei LangContext — inaepuka bug ya keys
//    zisizopo kuonekana ghafi kwenye screen, mfano "analysis_subtitle") ──
const LOCAL_TR: Record<string, { sw: string; en: string }> = {
  analysis:             { sw: 'Uchambuzi',                                    en: 'Analysis' },
  analysis_subtitle:    { sw: 'Ripoti ya mauzo na historia ya vocha',          en: 'Sales report and voucher history' },
  sales_report_tab:     { sw: 'Ripoti ya Mauzo',                              en: 'Sales Report' },
  voucher_history_tab:  { sw: 'Historia ya Vocha',                            en: 'Voucher History' },
  today_revenue:        { sw: 'Mauzo ya Leo',                                 en: "Today's Revenue" },
  today_vouchers:       { sw: 'Vocha za Leo',                                 en: 'Vouchers Today' },
  total_period:         { sw: 'Jumla',                                        en: 'Total' },
  avg_daily:            { sw: 'Wastani/Siku',                                 en: 'Avg / Day' },
  sales_trend:          { sw: 'Mwenendo wa Mauzo',                            en: 'Sales Trend' },
  last_7_days:          { sw: 'Siku 7',                                       en: '7 Days' },
  last_14_days:         { sw: 'Siku 14',                                      en: '14 Days' },
  last_30_days:         { sw: 'Siku 30',                                      en: '30 Days' },
  loading:              { sw: 'Inapakia...',                                  en: 'Loading...' },
  no_sales_data:        { sw: 'Hakuna data ya mauzo bado',                    en: 'No sales data yet' },
  no_sales_data_hint:   { sw: 'Hakuna ripoti bado — itaonekana hapa baada ya saa 23:30', en: 'No reports yet — will appear here after 11:30 PM' },
  daily_breakdown:      { sw: 'Muhtasari wa Kila Siku',                       en: 'Daily Breakdown' },
  vouchers:             { sw: 'vocha',                                        en: 'vouchers' },
  pdf_history:          { sw: 'Historia ya PDF za Vocha',                     en: 'Voucher PDF History' },
  no_pdf_history:       { sw: 'Bado hujaunda vocha — PDF zitaonekana hapa',   en: "You haven't created vouchers yet — PDFs will appear here" },
  unit_price:           { sw: 'Bei',                                          en: 'Price' },
  open_pdf:             { sw: 'Fungua PDF',                                   en: 'Open PDF' },
  delete:                { sw: 'Futa',                                        en: 'Delete' },
  delete_pdf_title:      { sw: 'Futa PDF',                                    en: 'Delete PDF' },
  delete_pdf_confirm:    { sw: 'Una uhakika unataka kufuta PDF hii? Hatua hii haiwezi kurudishwa.', en: 'Are you sure you want to delete this PDF? This action cannot be undone.' },
  pdf_deleted_success:   { sw: 'PDF imefutwa',                                en: 'PDF deleted' },
  error:                 { sw: 'Hitilafu imetokea',                          en: 'An error occurred' },
}

function useL() {
  const { lang } = useLang()
  return (key: keyof typeof LOCAL_TR) => {
    const entry = LOCAL_TR[key]
    if (!entry) return key
    return lang === 'sw' ? entry.sw : entry.en
  }
}

const money = (n: any) => `TZS ${Number(n || 0).toLocaleString()}`

type ChartTooltipProps = { active?: boolean; payload?: any[]; label?: string }
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#6366f1', margin: 0 }}>{money(payload[0]?.value)}</p>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{payload[0]?.payload?.count} vocha</p>
    </div>
  )
}

// ── Icon-only button na tooltip inayotokea taratibu (fade + slide) ────
function IconTipButton({
  icon, label, onClick, tone = 'neutral',
}: { icon: React.ReactNode; label: string; onClick: () => void; tone?: 'neutral' | 'danger' }) {
  const colors = tone === 'danger'
    ? { fg: '#ef4444', bg: '#fef2f2', bgHover: '#fee2e2', border: '#fecaca' }
    : { fg: '#6b7280', bg: '#f8fafc', bgHover: '#eef2ff', border: '#e5e7eb' }
  return (
    <div className="an-tip-wrap" style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={onClick} aria-label={label} className="an-icon-btn"
        style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${colors.border}`, background: colors.bg, color: colors.fg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = colors.bgHover; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = colors.bg; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
        {icon}
      </button>
      <span className="an-tip">{label}</span>
    </div>
  )
}

type AnalysisTab = 'report' | 'history'

export function AnalysisPage() {
  const L = useL()
  const { lang } = useLang()
  const dateLocale = lang === 'sw' ? 'sw-TZ' : 'en-US'

  const [tab, setTab] = useState<AnalysisTab>('report')
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }

  // ── Ripoti ya mauzo ──
  const [days, setDays] = useState(14)
  const [reports, setReports] = useState<any[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  const fetchReports = () => {
    setReportsLoading(true)
    api.get(`/vouchers/sales-reports/?days=${days}`)
      .then(r => setReports((r.data.results || r.data).sort((a: any, b: any) => a.date.localeCompare(b.date))))
      .finally(() => setReportsLoading(false))
  }
  useEffect(fetchReports, [days])

  // ── Historia ya PDF ──
  const [batches, setBatches] = useState<any[]>([])
  const [batchesLoading, setBatchesLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const fetchBatches = () => {
    setBatchesLoading(true)
    api.get('/vouchers/print-batches/')
      .then(r => setBatches(r.data.results || r.data))
      .finally(() => setBatchesLoading(false))
  }
  useEffect(() => { if (tab === 'history') fetchBatches() }, [tab])

  const handleDeleteBatch = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/vouchers/print-batches/${deleteTarget.id}/`)
      showAlrt('success', L('pdf_deleted_success'))
      setDeleteTarget(null)
      fetchBatches()
    } catch {
      showAlrt('error', L('error'))
    }
  }

  // ── Muhtasari (stat cards) ──
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayReport = reports.find(r => r.date === todayStr)
  const periodRevenue = reports.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0)
  const avgDaily = reports.length > 0 ? periodRevenue / reports.length : 0

  const chartData = reports.map(r => ({
    date: new Date(r.date).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' }),
    revenue: Number(r.total_revenue || 0),
    count: r.total_vouchers_sold,
  }))

  const TABS = [
    { key: 'report', label: L('sales_report_tab'), icon: <Icons.Report /> },
    { key: 'history', label: L('voucher_history_tab'), icon: <Icons.History /> },
  ] as const

  const DAY_OPTS = [
    { v: 7, l: L('last_7_days') },
    { v: 14, l: L('last_14_days') },
    { v: 30, l: L('last_30_days') },
  ]

  return (
    <Layout>
      <style>{`
        .an-tip-wrap .an-tip {
          position: absolute; bottom: calc(100% + 7px); left: 50%;
          transform: translateX(-50%) translateY(4px);
          white-space: nowrap; background: #1e293b; color: #fff;
          font-size: 11px; font-weight: 600; padding: 4px 10px;
          border-radius: 7px; pointer-events: none; z-index: 20;
          box-shadow: 0 4px 14px rgba(0,0,0,0.22);
          opacity: 0; transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .an-tip-wrap .an-tip::after {
          content: ''; position: absolute; top: 100%; left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent; border-top-color: #1e293b;
        }
        .an-tip-wrap:hover .an-tip {
          opacity: 1; transform: translateX(-50%) translateY(0);
        }
      `}</style>
      <div style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={L('analysis')} subtitle={L('analysis_subtitle')} />

        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { l: L('today_revenue'), v: money(todayReport?.total_revenue || 0), c: '#10b981', Ico: Icons.Today },
            { l: L('today_vouchers'), v: todayReport?.total_vouchers_sold || 0, c: '#6366f1', Ico: Icons.Voucher },
            { l: `${L('total_period')} (${days}d)`, v: money(periodRevenue), c: '#f59e0b', Ico: Icons.Money },
            { l: L('avg_daily'), v: money(Math.round(avgDaily)), c: '#8b5cf6', Ico: Icons.Report },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '0.9rem', borderLeft: `4px solid ${s.c}`, boxShadow: 'var(--card-shadow)' }}>
              <div style={{ marginBottom: 6, color: s.c }}><s.Ico /></div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: s.c, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <Tabs tabs={TABS as any} active={tab} onChange={(k) => setTab(k as AnalysisTab)} />

        {/* ── RIPOTI YA MAUZO ── */}
        {tab === 'report' && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Card>
              <CardHeader
                title={L('sales_trend')}
                action={
                  <div style={{ display: 'flex', gap: 5 }}>
                    {DAY_OPTS.map(opt => (
                      <button key={opt.v} onClick={() => setDays(opt.v)}
                        style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid', borderColor: days === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: days === opt.v ? 'var(--primary-light)' : '#fff', color: days === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                }
              />
              <div style={{ padding: '1rem' }}>
                {reportsLoading ? (
                  <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                    {L('loading')}
                  </div>
                ) : chartData.length === 0 ? (
                  <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', gap: 8 }}>
                    <Icons.Empty />
                    <span style={{ fontSize: 13 }}>{L('no_sales_data')}</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#salesGrad)" strokeWidth={2.5}
                        dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title={L('daily_breakdown')} action={<Badge text={`${reports.length}`} color="indigo" />} />
              {reportsLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>{L('loading')}</div>
              ) : reports.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Empty /></div>
                  <span style={{ fontSize: 13 }}>{L('no_sales_data_hint')}</span>
                </div>
              ) : (
                <div>
                  {[...reports].reverse().map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < reports.length - 1 ? '1px solid var(--gray-50)' : 'none', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                          {new Date(r.date).toLocaleDateString(dateLocale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        {r.breakdown?.length > 0 && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                            {r.breakdown.map((b: any, j: number) => (
                              <span key={j} style={{ fontSize: 10.5, background: 'var(--gray-50)', color: 'var(--gray-600)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                                {b.package} × {b.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#059669' }}>{money(r.total_revenue)}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.total_vouchers_sold} {L('vouchers')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── HISTORIA YA PDF ── */}
        {tab === 'history' && (
          <div style={{ marginTop: '1rem' }}>
            <Card>
              <CardHeader title={L('pdf_history')} action={<Badge text={`${batches.length}`} color="indigo" />} />
              {batchesLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>{L('loading')}</div>
              ) : batches.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Empty /></div>
                  <span style={{ fontSize: 13 }}>{L('no_pdf_history')}</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, padding: '1rem' }}>
                  {batches.map((b) => (
                    <div key={b.id} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '0.9rem', boxShadow: 'var(--card-shadow)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.profile_name || b.package_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                            {new Date(b.created_at).toLocaleString(dateLocale)}
                          </div>
                        </div>
                        <Badge text={`x${b.quantity}`} color="indigo" />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 10 }}>
                        {L('unit_price')}: <strong style={{ color: '#059669' }}>{money(b.unit_price)}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid var(--gray-50)', paddingTop: 10 }}>
                        <Button size="sm" variant="success" disabled={!b.pdf_url}
                          onClick={() => b.pdf_url && window.open(b.pdf_url, '_blank')} icon={<Icons.Open />}>
                          {L('open_pdf')}
                        </Button>
                        <IconTipButton icon={<Icons.Trash />} label={L('delete')} tone="danger" onClick={() => setDeleteTarget(b)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteBatch}
          title={L('delete_pdf_title')}
          message={L('delete_pdf_confirm')}
          danger
        />
      </div>
    </Layout>
  )
}
