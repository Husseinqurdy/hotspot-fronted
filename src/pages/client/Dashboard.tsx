import { useEffect, useState, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'
import Layout from '../../components/Layout'

/* ─── tiny helpers ─────────────────────────────────────────────────── */

function useCountUp(target: number, duration = 900, active = true) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active || target === 0) { setValue(target); return }
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, active, duration])
  return value
}

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(14px)'
    const t = setTimeout(() => {
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, delay)
    return () => clearTimeout(t)
  }, [delay])
  return ref
}

/* ─── SVG icon set ─────────────────────────────────────────────────── */

const Icon = {
  Router: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="7" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <circle cx="8.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="12" cy="14.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  Payment: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Voucher: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3" />
      <path d="M2 15v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
      <path d="M20 9a2 2 0 0 0 0 6" />
      <path d="M4 9a2 2 0 0 1 0 6" />
    </svg>
  ),
  Revenue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  Info: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
}

/* ─── Stat Card ─────────────────────────────────────────────────────── */

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accent: string
  delay?: number
  loaded?: boolean
}

function AnimatedStatCard({ title, value, subtitle, icon, accent, delay = 0, loaded = false }: StatCardProps) {
  const ref = useFadeIn(delay)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? accent + '55' : 'var(--border)'}`,
        borderRadius: 14,
        padding: '1.1rem 1.25rem',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px ${accent}22` : '0 1px 4px rgba(0,0,0,0.06)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: accent,
        opacity: hovered ? 1 : 0.35,
        transition: 'opacity 0.25s ease',
        borderRadius: '14px 14px 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            {title}
          </p>
          {!loaded ? (
            <div style={{ height: 28, width: '60%', background: 'var(--skeleton)', borderRadius: 6, animation: 'shimmer 1.4s ease-in-out infinite' }} />
          ) : (
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </p>
          )}
          {subtitle && loaded && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '5px 0 0', fontWeight: 500 }}>{subtitle}</p>
          )}
        </div>
        <div style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: accent + '18',
          color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          marginLeft: 12,
          transition: 'background 0.25s ease',
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

/* ─── Payment instruction banner ────────────────────────────────────── */

function InstructionBanner({ identifier, balance, loaded }: { identifier: string, balance: number, loaded: boolean }) {
  const ref = useFadeIn(80)

  return (
    <div
      ref={ref}
      style={{
        background: 'linear-gradient(135deg, #13103a 0%, #1e1b4b 60%, #1a1040 100%)',
        borderRadius: 16,
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(99,102,241,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* subtle grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {/* Lipa info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'rgba(165,180,252,0.7)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Maagizo ya Malipo
            </div>
            <div style={{ height: 1, flex: 1, background: 'rgba(99,102,241,0.25)' }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Lipa Namba
              </p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#a5b4fc', margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
                0523
              </p>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Nambari Yako
              </p>
              {!loaded ? (
                <div style={{ height: 30, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'shimmer 1.4s ease-in-out infinite' }} />
              ) : (
                <p style={{
                  fontSize: 26, fontWeight: 900, margin: 0,
                  fontFamily: 'monospace', letterSpacing: '0.12em',
                  color: '#a5b4fc',
                  background: 'rgba(165,180,252,0.12)',
                  padding: '2px 12px', borderRadius: 8,
                  display: 'inline-block',
                }}>
                  {identifier}
                </p>
              )}
            </div>
          </div>

          {/* Steps */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(165,180,252,0.8)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Jinsi wateja wanavyolipa
            </p>
            {[
              'Mteja achague package — kila moja ina bei maalum.',
              `Bei tayari imejumuisha nambari yako (${loaded ? identifier : '…'}) — alipe kiasi kamili bila mabadiliko.`,
              loaded
                ? `Mfano: Package TZS 500 → mteja alipe TZS 500${identifier} kwenda Lipa Namba 0523.`
                : 'Mfano: Package TZS 500 → mteja alipe TZS 500[NAMBARI] kwenda 0523.',
              'Mfumo utatuma voucher kwa mteja moja kwa moja kupitia SMS.',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 7 : 0 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.25)',
                  color: '#a5b4fc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>
                  {i === 2 && loaded ? (
                    <>
                      Mfano: Package TZS 500 → mteja alipe{' '}
                      <strong style={{ color: '#fbbf24' }}>TZS 500{identifier}</strong>
                      {' '}kwenda Lipa Namba{' '}
                      <strong style={{ color: '#a5b4fc' }}>0523</strong>.
                    </>
                  ) : i === 3 ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {step}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(16,185,129,0.15)',
                        color: '#34d399',
                        fontSize: 11, fontWeight: 700,
                        padding: '1px 8px', borderRadius: 20,
                        flexShrink: 0,
                      }}>
                        <Icon.Check /> Otomatiki
                      </span>
                    </span>
                  ) : step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — balance */}
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 14,
          padding: '1.1rem 1.4rem',
          border: '1px solid rgba(99,102,241,0.2)',
          minWidth: 160,
          textAlign: 'right',
          alignSelf: 'flex-start',
        }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Bakaa
          </p>
          {!loaded ? (
            <div style={{ height: 34, width: 120, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'shimmer 1.4s ease-in-out infinite', marginLeft: 'auto' }} />
          ) : (
            <p style={{
              fontSize: 28, fontWeight: 900, color: '#fff', margin: 0,
              letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
            }}>
              TZS {balance.toLocaleString()}
            </p>
          )}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>Salio la sasa</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Voucher row ───────────────────────────────────────────────────── */

function VoucherRow({ v, index, total }: { v: any; index: number; total: number }) {
  const [hovered, setHovered] = useState(false)
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Inatumika', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    used: { label: 'Imetumika', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    expired: { label: 'Imeisha', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }
  const s = statusMap[v.status] || statusMap.used

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px',
        borderBottom: index < total - 1 ? '1px solid var(--border-subtle)' : 'none',
        background: hovered ? 'var(--hover-bg)' : 'transparent',
        transition: 'background 0.18s ease',
        borderRadius: index === total - 1 ? '0 0 14px 14px' : undefined,
      }}
    >
      <div>
        <code style={{
          fontWeight: 800, fontSize: 13.5, color: 'var(--primary)',
          letterSpacing: '0.06em', fontFamily: 'monospace',
        }}>
          {v.code}
        </code>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
          {v.customer_phone}
          <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
          {v.package}
        </div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        color: s.color, background: s.bg,
        padding: '3px 10px', borderRadius: 20,
        flexShrink: 0,
      }}>
        {s.label}
      </span>
    </div>
  )
}

/* ─── Custom chart tooltip ──────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '8px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
        {payload[0].value} vouchers
      </p>
    </div>
  )
}

/* ─── Mock chart data ───────────────────────────────────────────────── */

const MOCK_CHART = [
  { h: '08:00', v: 2 }, { h: '09:00', v: 5 }, { h: '10:00', v: 8 },
  { h: '11:00', v: 6 }, { h: '12:00', v: 12 }, { h: '13:00', v: 9 },
  { h: '14:00', v: 15 }, { h: '15:00', v: 11 }, { h: '16:00', v: 7 },
]

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function ClientDashboard() {
  const [data, setData] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const headerRef = useFadeIn(0)

  useEffect(() => {
    api.get('/dashboard/client/').then(r => {
      setData(r.data)
      setLoaded(true)
    })
  }, [])

  const stats = data?.stats
  const identifier = data?.client?.identifier || ''
  const balance = Number(data?.client?.balance || 0)

  const onlineRouters = useCountUp(stats?.online_routers ?? 0, 800, loaded)
  const totalRouters = useCountUp(stats?.total_routers ?? 0, 800, loaded)
  const totalPackages = useCountUp(stats?.total_packages ?? 0, 700, loaded)
  const todayPayments = useCountUp(stats?.today_payments ?? 0, 750, loaded)
  const todayVouchers = useCountUp(stats?.today_vouchers ?? 0, 750, loaded)
  const todayRevenue = useCountUp(stats?.today_revenue ?? 0, 1000, loaded)

  const recentVouchers = (data?.recent_vouchers || []).slice(0, 6)

  return (
    <Layout>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        :root {
          --surface: #ffffff;
          --surface-raised: #ffffff;
          --border: #e5e7eb;
          --border-subtle: #f3f4f6;
          --skeleton: #f3f4f6;
          --hover-bg: #f9fafb;
          --text-primary: #111827;
          --text-muted: #6b7280;
          --primary: #6366f1;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --surface: #1c1c28;
            --surface-raised: #24243a;
            --border: #2a2a3e;
            --border-subtle: #222232;
            --skeleton: #2a2a3e;
            --hover-bg: #22223280;
            --text-primary: #f1f1f5;
            --text-muted: #8b8ba8;
            --primary: #818cf8;
          }
        }
      `}</style>

      <div style={{ padding: '2rem', maxWidth: 1100 }}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 4px',
            letterSpacing: '-0.5px',
          }}>
            {loaded ? `Habari, ${data?.client?.business_name}` : 'Inapakia...'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Muhtasari wa shughuli za biashara yako leo
          </p>
        </div>

        {/* Banner */}
        <InstructionBanner identifier={identifier} balance={balance} loaded={loaded} />

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <AnimatedStatCard
            title="Routers" icon={<Icon.Router />} accent="#10b981"
            value={loaded ? `${onlineRouters} / ${totalRouters}` : '—'}
            subtitle="Zipo online" delay={100} loaded={loaded}
          />
          <AnimatedStatCard
            title="Vifurushi" icon={<Icon.Package />} accent="#f59e0b"
            value={loaded ? totalPackages : '—'}
            delay={160} loaded={loaded}
          />
          <AnimatedStatCard
            title="Malipo Leo" icon={<Icon.Payment />} accent="#6366f1"
            value={loaded ? todayPayments : '—'}
            delay={220} loaded={loaded}
          />
          <AnimatedStatCard
            title="Vouchers Leo" icon={<Icon.Voucher />} accent="#8b5cf6"
            value={loaded ? todayVouchers : '—'}
            delay={280} loaded={loaded}
          />
          <AnimatedStatCard
            title="Mapato Leo" icon={<Icon.Revenue />} accent="#06b6d4"
            value={loaded ? `TZS ${todayRevenue.toLocaleString()}` : '—'}
            delay={340} loaded={loaded}
          />
        </div>

        {/* Chart + Vouchers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>

          {/* Chart card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            animation: 'fadeSlide 0.5s ease 0.4s both',
          }}>
            <div style={{
              padding: '1.1rem 1.4rem 0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Vouchers za Leo
              </h3>
              <span style={{
                fontSize: 11, color: 'var(--text-muted)',
                background: 'var(--border-subtle)',
                padding: '3px 10px', borderRadius: 20,
              }}>Kwa saa</span>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={MOCK_CHART} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vgrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="h" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="url(#vgrad)"
                    strokeWidth={2.5} name="Vouchers" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#8b5cf6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent vouchers */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            animation: 'fadeSlide 0.5s ease 0.5s both',
          }}>
            <div style={{
              padding: '1.1rem 1.4rem 0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Vouchers za Hivi Karibuni
              </h3>
            </div>

            {!loaded ? (
              <div style={{ padding: '0.5rem 0' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ height: 14, width: 90, background: 'var(--skeleton)', borderRadius: 4, marginBottom: 7, animation: 'shimmer 1.4s ease-in-out infinite' }} />
                      <div style={{ height: 11, width: 120, background: 'var(--skeleton)', borderRadius: 4, animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                    </div>
                    <div style={{ height: 22, width: 66, background: 'var(--skeleton)', borderRadius: 20, animation: 'shimmer 1.4s ease-in-out infinite' }} />
                  </div>
                ))}
              </div>
            ) : recentVouchers.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--text-muted)',
                }}>
                  <Icon.Voucher />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Hakuna vouchers leo</p>
              </div>
            ) : (
              <div style={{ padding: '0.5rem 0' }}>
                {recentVouchers.map((v: any, i: number) => (
                  <VoucherRow key={i} v={v} index={i} total={recentVouchers.length} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  )
}
