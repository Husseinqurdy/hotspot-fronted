import { useEffect, useState } from 'react'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { Table, Badge, PageHeader, Card, Button, Modal, Input, Alert, StatCard } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

// ===== ROUTERS =====
export function ClientRouters() {
  const { clientInfo } = useAuth()
  const [routers, setRouters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [testing, setTesting] = useState<number | null>(null)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [form, setForm] = useState({ name: '', vpn_ip: '', api_port: '8728', api_username: 'admin', api_password: '', hotspot_interface: 'bridge' })

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const fetch = () => { api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async () => {
    try {
      await api.post('/routers/', { ...form, client: clientInfo?.id })
      showAlrt('success', `Router ${form.name} imeongezwa!`)
      setShowModal(false)
      setForm({ name: '', vpn_ip: '', api_port: '8728', api_username: 'admin', api_password: '', hotspot_interface: 'bridge' })
      fetch()
    } catch { showAlrt('error', 'Imeshindwa kuunda router') }
  }

  const testConn = async (id: number) => {
    setTesting(id)
    try {
      const r = await api.post(`/routers/${id}/test-connection/`)
      showAlrt('success', r.data.message)
      fetch()
    } catch { showAlrt('error', 'Router haipo online') }
    finally { setTesting(null) }
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1000 }}>
        <PageHeader title="Routers Zangu" subtitle="Simamia MikroTik routers zako"
          action={<Button onClick={() => setShowModal(true)} icon="➕">Ongeza Router</Button>}
        />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, color: '#1e40af' }}>
          💡 Unganisha router yako kwa WireGuard VPN kwanza, kisha weka IP yake ya VPN hapa. Hakikisha port 8728 imefunguliwa.
        </div>

        <Card>
          <Table loading={loading} headers={['Jina', 'VPN IP', 'Port', 'Hali', 'Mwisho', '']}
            rows={routers.map(r => [
              <div style={{ fontWeight: 600 }}>{r.name}</div>,
              <code style={{ fontSize: 13, color: 'var(--gray-600)', background: 'var(--gray-50)', padding: '2px 8px', borderRadius: 5 }}>{r.vpn_ip}</code>,
              r.api_port,
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.is_online ? '#10b981' : '#ef4444', boxShadow: r.is_online ? '0 0 0 3px #d1fae5' : 'none' }} />
                <Badge text={r.is_online ? 'Online' : 'Offline'} color={r.is_online ? 'green' : 'red'} />
              </div>,
              r.last_seen ? new Date(r.last_seen).toLocaleString('sw-TZ') : '—',
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => testConn(r.id)} disabled={testing === r.id}>
                  {testing === r.id ? '...' : '🔗 Test'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => api.post(`/routers/${r.id}/sync-packages/`).then(() => showAlrt('success', 'Imesync!'))}>
                  🔄 Sync
                </Button>
              </div>,
            ])}
            emptyMessage="Hakuna routers. Ongeza router yako ya kwanza!"
          />
        </Card>

        <Modal open={showModal} onClose={() => setShowModal(false)} title="Ongeza Router Mpya">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Jina la Router *" placeholder="Router ya Nyumba" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <Input label="VPN IP Address *" placeholder="10.0.0.2" value={form.vpn_ip} onChange={(e: any) => setForm({ ...form, vpn_ip: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="API Port" type="number" value={form.api_port} onChange={(e: any) => setForm({ ...form, api_port: e.target.value })} />
              <Input label="API Username" value={form.api_username} onChange={(e: any) => setForm({ ...form, api_username: e.target.value })} />
            </div>
            <Input label="API Password *" type="password" placeholder="••••••" value={form.api_password} onChange={(e: any) => setForm({ ...form, api_password: e.target.value })} />
            <Input label="Hotspot Interface" placeholder="bridge" value={form.hotspot_interface} onChange={(e: any) => setForm({ ...form, hotspot_interface: e.target.value })} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Ghairi</Button>
              <Button onClick={handleCreate}>Hifadhi Router</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

// ===== PACKAGES =====
export function ClientPackages() {
  const { clientInfo } = useAuth()
  const [packages, setPackages] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [form, setForm] = useState({ name: '', price: '', duration_minutes: '', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' })

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }
  const fetch = () => api.get('/packages/').then(r => setPackages(r.data.results || r.data))
  useEffect(() => { fetch() }, [])

  const handleCreate = async () => {
    try {
      await api.post('/packages/', { ...form, client: clientInfo?.id })
      showAlrt('success', `Package ${form.name} imeundwa!`)
      setShowModal(false)
      setForm({ name: '', price: '', duration_minutes: '', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' })
      fetch()
    } catch (e: any) {
      const err = e.response?.data
      showAlrt('error', typeof err === 'object' ? Object.values(err).flat().join(', ') : 'Hitilafu imetokea')
    }
  }

  // Pata identifier ya client kutoka kwa package yoyote
  const identifier = clientInfo?.identifier

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1000 }}>
        <PageHeader title="Vifurushi vya Internet" subtitle="Unda na simamia packages zako"
          action={<Button onClick={() => setShowModal(true)} icon="➕">Ongeza Kifurushi</Button>}
        />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        {/* Maelezo ya bei */}
        {identifier && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: '1.5rem', fontSize: 14, color: '#166534' }}>
            💡 Bei inayoonekana kwenye kadi ni bei ya msingi. Wateja wako watalipa{' '}
            <strong>bei + {identifier}</strong> (nambari yako).
            Mfano: Package ya TZS 500 → mteja alipe <strong>TZS {500 + identifier}</strong>.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{
              background: '#fff', borderRadius: 14, padding: '1.25rem',
              border: '1px solid var(--gray-100)',
              boxShadow: 'var(--card-shadow)',
              borderTop: '3px solid var(--primary)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-lg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)' }}>{pkg.name}</span>
                <Badge text={pkg.is_active ? 'Active' : 'Off'} color={pkg.is_active ? 'green' : 'gray'} />
              </div>

              {/* Bei ya msingi */}
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>
                TZS {Number(pkg.price).toLocaleString()}
              </div>

              {/* ✅ Bei halisi wateja watalipa */}
              {identifier && (
                <div style={{
                  marginTop: 6, marginBottom: 12,
                  background: '#fef9c3',
                  border: '1px solid #fde047',
                  borderRadius: 7,
                  padding: '4px 10px',
                  fontSize: 12,
                  color: '#854d0e',
                  fontWeight: 600,
                }}>
                  💳 Wateja watalipa: TZS {(Number(pkg.price) + identifier).toLocaleString()}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { icon: '⏱', label: pkg.duration_display },
                  { icon: '⬇️', label: `${pkg.speed_down} Mbps Download` },
                  { icon: '⬆️', label: `${pkg.speed_up} Mbps Upload` },
                  { icon: '👥', label: `${pkg.shared_users} mtumiaji` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '6px 10px', background: 'var(--gray-50)', borderRadius: 7, fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                Profile: {pkg.mikrotik_profile}
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)', background: '#fff', borderRadius: 14, border: '2px dashed var(--gray-200)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              Hakuna vifurushi. Ongeza kifurushi chako cha kwanza!
            </div>
          )}
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title="Ongeza Kifurushi Kipya">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Jina *" placeholder="Saa 1, Siku 1..." value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Bei (TZS) *" type="number" placeholder="500" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} />
              <Input label="Muda (dakika) *" type="number" placeholder="60" value={form.duration_minutes} onChange={(e: any) => setForm({ ...form, duration_minutes: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Download Mbps" type="number" placeholder="2" value={form.speed_down} onChange={(e: any) => setForm({ ...form, speed_down: e.target.value })} />
              <Input label="Upload Mbps" type="number" placeholder="2" value={form.speed_up} onChange={(e: any) => setForm({ ...form, speed_up: e.target.value })} />
            </div>

            {/* Preview ya bei wateja watalipa */}
            {form.price && identifier && (
              <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#854d0e' }}>
                💳 Wateja watalipa: <strong>TZS {(Number(form.price) + identifier).toLocaleString()}</strong>
              </div>
            )}

            <Input label="MikroTik Profile Name *" placeholder="pkg-500" value={form.mikrotik_profile} onChange={(e: any) => setForm({ ...form, mikrotik_profile: e.target.value })} />
            <Input label="Shared Users" type="number" placeholder="1" value={form.shared_users} onChange={(e: any) => setForm({ ...form, shared_users: e.target.value })} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Ghairi</Button>
              <Button onClick={handleCreate}>Hifadhi Kifurushi</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

// ===== VOUCHERS =====
export function ClientVouchers() {
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

  const statusMap: Record<string, { label: string; color: any }> = {
    active: { label: 'Active', color: 'green' },
    used: { label: 'Imetumika', color: 'gray' },
    expired: { label: 'Imeisha', color: 'red' },
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1000 }}>
        <PageHeader title="Vouchers Zangu" subtitle="Historia ya vouchers zote zilizoundwa" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Zote', value: stats?.total || 0, icon: '🎫', color: '#6366f1' },
            { label: 'Active', value: stats?.active || 0, icon: '✅', color: '#10b981' },
            { label: 'Zimetumika', value: stats?.used || 0, icon: '✔', color: '#6b7280' },
            { label: 'Zimeisha', value: stats?.expired || 0, icon: '⏰', color: '#ef4444' },
          ].map((s, i) => (
            <StatCard key={i} title={s.label} value={s.value} icon={s.icon} color={s.color} />
          ))}
        </div>

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
          <Table loading={loading} headers={['Code', 'Package', 'Bei', 'Simu', 'Hali', 'Tarehe']}
            rows={vouchers.map(v => [
              <code style={{ fontWeight: 800, fontSize: 15, color: 'var(--primary)', letterSpacing: '0.1em' }}>{v.code}</code>,
              v.package_name,
              `TZS ${Number(v.package_price).toLocaleString()}`,
              v.customer_phone,
              <Badge text={statusMap[v.status]?.label || v.status} color={statusMap[v.status]?.color || 'gray'} />,
              new Date(v.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage="Hakuna vouchers bado"
          />
        </Card>
      </div>
    </Layout>
  )
}

// ===== PAYMENTS =====
export function ClientPayments() {
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

  const netColor: Record<string, any> = { vodacom: 'green', tigo: 'blue', airtel: 'red', halo: 'yellow', unknown: 'gray' }
  const statColor: Record<string, any> = { completed: 'green', failed: 'red', processing: 'yellow', pending: 'gray' }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1000 }}>
        <PageHeader title="Malipo Yangu" subtitle="Historia ya malipo yote" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard title="Malipo Yote" value={summary?.total_payments || 0} icon="📊" color="#6366f1" />
          <StatCard title="Mapato Yangu" value={`TZS ${Number(summary?.total_client_share || 0).toLocaleString()}`} icon="💰" color="#10b981" />
          <StatCard title="Jumla" value={`TZS ${Number(summary?.total_amount || 0).toLocaleString()}`} icon="📈" color="#f59e0b" />
        </div>

        <Card>
          <Table loading={loading} headers={['Simu', 'Kiasi', 'Transaction ID', 'Network', 'Hali', 'Tarehe']}
            rows={payments.map(p => [
              p.phone_number,
              <strong style={{ color: 'var(--gray-900)' }}>TZS {Number(p.amount).toLocaleString()}</strong>,
              <code style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.transaction_id || '—'}</code>, // ✅ reference_code → transaction_id
              <Badge text={p.network_display || p.network.toUpperCase()} color={netColor[p.network] || 'gray'} />,
              <Badge text={p.status_display} color={statColor[p.status] || 'gray'} />,
              new Date(p.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage="Hakuna malipo bado"
          />
        </Card>
      </div>
    </Layout>
  )
}