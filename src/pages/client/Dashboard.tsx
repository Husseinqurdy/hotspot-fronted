import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { StatCard, Badge, PageHeader, Card, CardHeader } from '../../components/UI'

const MOCK_CHART = [
  { h: '08:00', v: 2 }, { h: '09:00', v: 5 }, { h: '10:00', v: 8 },
  { h: '11:00', v: 6 }, { h: '12:00', v: 12 }, { h: '13:00', v: 9 },
  { h: '14:00', v: 15 }, { h: '15:00', v: 11 }, { h: '16:00', v: 7 },
]

export default function ClientDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/client/').then(r => { setData(r.data); setLoading(false) })
  }, [])

  const stats = data?.stats
  const identifier = data?.client?.identifier

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>
        <PageHeader
          title={`Habari, ${data?.client?.business_name || '...'} 👋`}
          subtitle="Hapa chini ni muhtasari wa biashara yako ya leo"
        />

        {/* Reference info banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 14,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ color: '#fff' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              Maagizo kwa Wateja wako
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6 }}>
              Lipa Namba:{' '}
              <strong style={{ fontSize: 18, color: '#a5b4fc' }}>0523</strong>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 12px' }}>·</span>
              Nambari yako:{' '}
              <strong style={{
                fontSize: 22,
                fontFamily: 'monospace',
                color: '#a5b4fc',
                letterSpacing: '0.1em',
                background: 'rgba(165,180,252,0.15)',
                padding: '2px 10px',
                borderRadius: 6,
              }}>
                {identifier || '...'}
              </strong>
            </p>

            {/* Maelezo ya jinsi ya kutumia */}
            <div style={{
              marginTop: 12,
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8,
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#c7d2fe', marginBottom: 4 }}>
                📌 Jinsi wateja wako wanavyolipa:
              </p>
              <p style={{ margin: 0 }}>
                1. Mwambie mteja achague package anayotaka — kila package ina bei yake maalum.
              </p>
              <p style={{ margin: 0 }}>
                2. Bei ya package hiyo <strong>tayari imejumuisha nambari yako ({identifier || '...'})</strong> — 
                mteja alipe <strong style={{ color: '#a5b4fc' }}>bei hiyo kamili</strong> bila kuongeza wala kupunguza.
              </p>
              <p style={{ margin: 0 }}>
                3. Mfano: Package ya TZS 500 → mteja alipe{' '}
                <strong style={{ color: '#fbbf24' }}>
                  TZS {identifier ? 500 + identifier : '...'} 
                </strong>{' '}
                kwenda Lipa Namba <strong style={{ color: '#a5b4fc' }}>0523</strong>.
              </p>
              <p style={{ margin: 0 }}>
                4. Mfumo utamtumia mteja voucher moja kwa moja kupitia SMS. ✅
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Bakaa yako</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              TZS {Number(data?.client?.balance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <StatCard title="Routers" value={loading ? '—' : `${stats?.online_routers}/${stats?.total_routers}`}
            subtitle="Zipo online" icon="📡" color="#10b981" />
          <StatCard title="Vifurushi" value={loading ? '—' : stats?.total_packages || 0} icon="📦" color="#f59e0b" />
          <StatCard title="Malipo Leo" value={loading ? '—' : stats?.today_payments || 0} icon="💳" color="#6366f1" />
          <StatCard title="Vouchers Leo" value={loading ? '—' : stats?.today_vouchers || 0} icon="🎫" color="#8b5cf6" />
          <StatCard
            title="Mapato Leo"
            value={loading ? '—' : `TZS ${Number(stats?.today_revenue || 0).toLocaleString()}`}
            icon="💰" color="#06b6d4"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Vouchers chart */}
          <Card>
            <CardHeader title="Vouchers za Leo (kwa saa)" />
            <div style={{ padding: '1.25rem' }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={MOCK_CHART}>
                  <defs>
                    <linearGradient id="vg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 9, border: '1px solid #e5e7eb' }} />
                  <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="url(#vg2)"
                    strokeWidth={2} name="Vouchers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent vouchers */}
          <Card>
            <CardHeader title="Vouchers za Hivi Karibuni" />
            <div style={{ padding: '0.5rem 0' }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>Inapakia...</div>
              ) : (data?.recent_vouchers || []).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🎫</div>
                  Hakuna vouchers leo
                </div>
              ) : (
                (data?.recent_vouchers || []).slice(0, 6).map((v: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: i < 5 ? '1px solid var(--gray-50)' : 'none',
                  }}>
                    <div>
                      <code style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                        {v.code}
                      </code>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                        {v.customer_phone} · {v.package}
                      </div>
                    </div>
                    <Badge
                      text={v.status === 'active' ? 'Active' : v.status === 'used' ? 'Imetumika' : 'Imeisha'}
                      color={v.status === 'active' ? 'green' : v.status === 'used' ? 'gray' : 'red'}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}