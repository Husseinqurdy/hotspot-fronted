import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell, ReferenceLine,
} from 'recharts'
import { useTr } from './AcctI18n'

// ── TZS helpers (zinatumika kote kwenye moduli) ───────────────
export const fmt = (n: any) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
export const money = (n: any) => `TZS ${fmt(n)}`
export const compact = (n: number) => {
  const a = Math.abs(n)
  const f = (v: number, s: string) => `${(n < 0 ? '-' : '')}${+(v).toFixed(1)}${s}`
  return a >= 1e9 ? f(a / 1e9, 'B') : a >= 1e6 ? f(a / 1e6, 'M') : a >= 1e3 ? f(a / 1e3, 'K') : `${n}`
}
const MONTHS = {
  sw: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
export const monthLabel = (ym: string, lang: string) => `${MONTHS[lang === 'sw' ? 'sw' : 'en'][Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`

export const C = { income: '#10b981', expense: '#f43f5e', profit: '#6366f1', grid: '#eef0f6', axis: '#94a3b8' }
const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#a855f7', '#94a3b8']

const tip = {
  contentStyle: { borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(15,23,42,.12)', fontSize: 12, padding: '8px 12px' },
  formatter: (v: any, name: any) => [money(v), name],
}
const axis = { tick: { fontSize: 11, fill: C.axis }, axisLine: false, tickLine: false } as const

function Empty({ text }: { text?: string }) {
  const { t } = useTr()
  return <div style={{ height: 220, display: 'grid', placeItems: 'center', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>{text || t('no_data')}</div>
}

// Faida iliyojumuishwa (cumulative) — kwa hero (mandharinyuma meusi)
export function TrendArea({ months }: { months: any[] }) {
  const { t, lang } = useTr()
  let run = 0
  const data = months.map(m => ({ m: monthLabel(m.month, lang), v: (run += Number(m.income) - Number(m.expense)) }))
  if (data.length < 2) return null
  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="acTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.55} /><stop offset="100%" stopColor="#a5b4fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="m" tick={{ fontSize: 10, fill: 'rgba(255,255,255,.55)' }} axisLine={false} tickLine={false} />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip {...tip} formatter={(v: any) => [money(v), t('cum_profit')]} />
        <Area type="monotone" dataKey="v" stroke="#c7d2fe" strokeWidth={2.5} fill="url(#acTrend)" animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MonthlyBars({ months }: { months: any[] }) {
  const { t, lang } = useTr()
  const data = months.map(m => ({ m: monthLabel(m.month, lang), income: Number(m.income), expense: Number(m.expense) }))
  if (!data.length) return <Empty />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="m" {...axis} />
        <YAxis {...axis} tickFormatter={compact} width={52} />
        <Tooltip {...tip} cursor={{ fill: 'rgba(99,102,241,.06)' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name={t('income')} fill={C.income} radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={900} />
        <Bar dataKey="expense" name={t('expense')} fill={C.expense} radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={900} animationBegin={150} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SiteBars({ rows }: { rows: any[] }) {
  const { t, be } = useTr()
  const data = rows.map(r => ({ s: be(r.site), v: Number(r.profit) })).sort((a, b) => b.v - a.v)
  if (!data.length) return <Empty text={t('site_hint')} />
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42 + 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} horizontal={false} />
        <XAxis type="number" {...axis} tickFormatter={compact} />
        <YAxis type="category" dataKey="s" {...axis} width={110} />
        <Tooltip {...tip} cursor={{ fill: 'rgba(99,102,241,.06)' }} formatter={(v: any) => [money(v), t('profit_loss')]} />
        <ReferenceLine x={0} stroke="#cbd5e1" />
        <Bar dataKey="v" radius={6} maxBarSize={22} animationDuration={900}>
          {data.map((d, i) => <Cell key={i} fill={d.v >= 0 ? C.profit : C.expense} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryDonut({ items }: { items: { category: string; total: number | string }[] }) {
  const { t, be } = useTr()
  const sorted = items.map(i => ({ name: be(i.category), value: Number(i.total) })).filter(i => i.value > 0).sort((a, b) => b.value - a.value)
  if (!sorted.length) return <Empty text={t('no_cat')} />
  const top = sorted.slice(0, 6)
  const rest = sorted.slice(6).reduce((a, b) => a + b.value, 0)
  const data = rest ? [...top, { name: t('other'), value: rest }] : top
  const total = data.reduce((a, b) => a + b.value, 0)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="none" animationDuration={1000}>
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip {...tip} formatter={(v: any, n: any) => [money(v), n]} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', textAlign: 'center' }}>
          <div><div style={{ fontSize: 11, color: C.axis }}>{t('total_tzs')}</div><div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{compact(total)}</div></div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 170, display: 'grid', gap: 7 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(d.value)}</b>
            <span style={{ color: C.axis, width: 34, textAlign: 'right' }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
