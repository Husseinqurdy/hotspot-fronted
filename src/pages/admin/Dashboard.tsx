import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { StatCard, Table, Badge, PageHeader, Card, CardHeader } from '../../components/UI'
import { useLang } from '../../contexts/LangContext'

const MOCK = [
  { d: 'Ju', v: 12 }, { d: 'Al', v: 19 }, { d: 'Ju', v: 8 },
  { d: 'Al', v: 24 }, { d: 'Ij', v: 16 }, { d: 'Ar', v: 31 }, { d: 'Ju', v: 22 },
]

export default function AdminDashboard() {
  const { t } = useLang()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/superadmin/').then(r => { setData(r.data); setLoading(false) })
  }, [])

  const s = data?.stats

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1200 }}>
        <PageHeader title={t('dashboard')} subtitle={t('summary')}
          action={<span style={{ fontSize: 13, color: 'var(--gray-500)', background: '#fff', padding: '8px 14px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
            📅 {new Date().toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard title={t('total_clients')} value={loading ? '—' : s?.total_clients || 0} icon="👥" color="#6366f1" />
          <StatCard title={t('online_routers')} value={loading ? '—' : `${s?.online_routers||0}/${s?.total_routers||0}`} subtitle="Zipo online sasa" icon="📡" color="#10b981" />
          <StatCard title={t('today_revenue')} value={loading ? '—' : `TZS ${Number(s?.today_revenue||0).toLocaleString()}`} icon="💰" color="#f59e0b" />
          <StatCard title={t('today_commission')} value={loading ? '—' : `TZS ${Number(s?.today_commission||0).toLocaleString()}`} icon="💎" color="#8b5cf6" />
          <StatCard title={t('vouchers_today')} value={loading ? '—' : s?.total_vouchers_today || 0} icon="🎫" color="#06b6d4" />
          <StatCard title={t('active_devices')} value={loading ? '—' : `${s?.active_devices||0}/${s?.total_devices||0}`} subtitle="GSM Devices" icon="📱" color="#10b981" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <Card>
            <CardHeader title="Vouchers za Wiki Hii / This Week's Vouchers" />
            <div style={{ padding: '1.25rem' }}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 9, border: '1px solid #e5e7eb' }} />
                  <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} name="Vouchers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title={t('system_status')} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Django API', ok: true },
                { label: 'Celery Worker', ok: true },
                { label: 'Redis', ok: true },
                { label: 'Africa\'s Talking', ok: true },
                { label: `GSM Devices (${s?.active_devices||0})`, ok: (s?.active_devices||0) > 0 },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--gray-600)', fontWeight: 500 }}>{item.label}</span>
                  <Badge text={item.ok ? 'Online' : 'Offline'} color={item.ok ? 'green' : 'red'} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title={t('clients')} action={<span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{data?.clients?.length || 0}</span>} />
          <Table loading={loading} headers={['Biashara', 'Prefix', 'Commission', t('balance'), 'Malipo', t('status')]}
            rows={(data?.clients || []).map((c: any) => [
              <div><div style={{ fontWeight: 600 }}>{c.business_name}</div></div>,
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em' }}>{c.reference_prefix}</span>,
              `${c.commission_rate}%`,
              <span style={{ fontWeight: 700, color: '#059669' }}>TZS {Number(c.balance).toLocaleString()}</span>,
              c.total_payments,
              <Badge text={c.is_active ? t('active') : t('inactive')} color={c.is_active ? 'green' : 'red'} />,
            ])}
            emptyMessage="Hakuna wateja bado"
          />
        </Card>
      </div>
    </Layout>
  )
}
