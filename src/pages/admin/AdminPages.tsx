import { useEffect, useState } from 'react'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { Table, Badge, PageHeader, Card, Button } from '../../components/UI'

// ===== ADMIN ROUTERS =====
export function AdminRouters() {
  const [routers, setRouters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<number | null>(null)

  useEffect(() => {
    api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) })
  }, [])

  const testConn = async (id: number) => {
    setTesting(id)
    try {
      const r = await api.post(`/routers/${id}/test-connection/`)
      alert(r.data.message)
      api.get('/routers/').then(r => setRouters(r.data.results || r.data))
    } catch { alert('Router haipo online') }
    finally { setTesting(null) }
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>
        <PageHeader title="Routers Zote" subtitle="Routers za wateja wote" />
        <Card>
          <Table
            loading={loading}
            headers={['Jina', 'Client', 'VPN IP', 'Hali', 'Mwisho Kuonekana', '']}
            rows={routers.map(r => [
              <div style={{ fontWeight: 600 }}>{r.name}</div>,
              r.client_name,
              <code style={{ fontSize: 13, color: 'var(--gray-600)', background: 'var(--gray-50)', padding: '2px 8px', borderRadius: 5 }}>{r.vpn_ip}</code>,
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.is_online ? '#10b981' : '#ef4444' }} />
                <Badge text={r.is_online ? 'Online' : 'Offline'} color={r.is_online ? 'green' : 'red'} />
              </div>,
              r.last_seen ? new Date(r.last_seen).toLocaleString('sw-TZ') : '—',
              <Button size="sm" variant="ghost" onClick={() => testConn(r.id)} disabled={testing === r.id}>
                {testing === r.id ? '...' : '🔗 Test'}
              </Button>,
            ])}
            emptyMessage="Hakuna routers"
          />
        </Card>
      </div>
    </Layout>
  )
}

// ===== ADMIN PAYMENTS =====
export function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/payments/'), api.get('/payments/summary/')]).then(([p, s]) => {
      setPayments(p.data.results || p.data)
      setSummary(s.data)
      setLoading(false)
    })
  }, [])

  const netColor: Record<string, any> = { mpesa: 'green', tigo: 'blue', airtel: 'red', halopesa: 'yellow', generic: 'gray' }
  const statColor: Record<string, any> = { completed: 'green', failed: 'red', processing: 'yellow', pending: 'gray' }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>
        <PageHeader title="Malipo Yote" subtitle="Historia ya malipo ya wateja wote" />

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Jumla ya Malipo', value: summary?.total_payments || 0, icon: '📊' },
            { label: 'Jumla ya Mapato', value: `TZS ${Number(summary?.total_amount || 0).toLocaleString()}`, icon: '💰' },
            { label: 'Commission Yote', value: `TZS ${Number(summary?.total_commission || 0).toLocaleString()}`, icon: '💎' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <Card>
          <Table
            loading={loading}
            headers={['Client', 'Simu', 'Kiasi', 'Reference', 'Network', 'Hali', 'Tarehe']}
            rows={payments.map(p => [
              p.client_name,
              p.phone_number,
              <strong>TZS {Number(p.amount).toLocaleString()}</strong>,
              <code style={{ fontSize: 12 }}>{p.reference_code}</code>,
              <Badge text={p.network.toUpperCase()} color={netColor[p.network]} />,
              <Badge text={p.status_display} color={statColor[p.status]} />,
              new Date(p.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage="Hakuna malipo bado"
          />
        </Card>
      </div>
    </Layout>
  )
}

// ===== ADMIN VOUCHERS =====
export function AdminVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const url = filter ? `/vouchers/?status=${filter}` : '/vouchers/'
    Promise.all([api.get(url), api.get('/vouchers/stats/')]).then(([v, s]) => {
      setVouchers(v.data.results || v.data)
      setStats(s.data)
      setLoading(false)
    })
  }, [filter])

  const statColor: Record<string, any> = { active: 'green', used: 'gray', expired: 'red' }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>
        <PageHeader title="Vouchers Zote" subtitle="Vouchers za wateja wote" />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Zote', value: stats?.total || 0, color: '#6366f1' },
            { label: 'Active', value: stats?.active || 0, color: '#10b981' },
            { label: 'Zimetumika', value: stats?.used || 0, color: '#6b7280' },
            { label: 'Zimeisha', value: stats?.expired || 0, color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '1.1rem', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          {[{ k: '', l: 'Zote' }, { k: 'active', l: 'Active' }, { k: 'used', l: 'Zimetumika' }, { k: 'expired', l: 'Zimeisha' }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{
              padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
              borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)',
              background: filter === f.k ? 'var(--primary-light)' : '#fff',
              color: filter === f.k ? 'var(--primary-dark)' : 'var(--gray-600)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              {f.l}
            </button>
          ))}
        </div>

        <Card>
          <Table
            loading={loading}
            headers={['Code', 'Client', 'Package', 'Bei', 'Simu', 'Hali', 'Tarehe']}
            rows={vouchers.map(v => [
              <code style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', letterSpacing: '0.1em' }}>{v.code}</code>,
              v.client_name,
              v.package_name,
              `TZS ${Number(v.package_price).toLocaleString()}`,
              v.customer_phone,
              <Badge text={v.status_display} color={statColor[v.status]} />,
              new Date(v.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage="Hakuna vouchers"
          />
        </Card>
      </div>
    </Layout>
  )
}
