import { useEffect, useState, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import Layout from '../components/Layout'
import { StatCard, Table, Badge, PageHeader, Card, CardHeader, Button, Modal, Input, Select, Alert, FormRow, FormActions, ConfirmDialog } from '../components/UI'
import { useLang } from '../contexts/LangContext'
import { useAuth } from '../contexts/AuthContext'
import { MikroTikPermissionsModal } from './MikroTikManager'

const WEEK = [{ d: 'Ju', v: 12 }, { d: 'Al', v: 19 }, { d: 'Ju', v: 8 }, { d: 'Al', v: 24 }, { d: 'Ij', v: 16 }, { d: 'Ar', v: 31 }, { d: 'Ju', v: 22 }]

function useAlert() {
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const show = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }
  return { alert, show }
}

const P = '1.25rem'
const nc: Record<string, any> = { vodacom: 'green', tigo: 'blue', airtel: 'red', halo: 'yellow', unknown: 'gray' }
const sc: Record<string, any> = { completed: 'green', failed: 'red', processing: 'yellow', pending: 'gray' }
const vs: Record<string, any> = { active: 'green', used: 'gray', expired: 'red' }

// ── SVG ICONS ─────────────────────────────────────────────
const Icons = {
  Router: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/><circle cx="8.5" cy="14.5" r="1" fill="currentColor"/><circle cx="12" cy="14.5" r="1" fill="currentColor"/><circle cx="15.5" cy="14.5" r="1" fill="currentColor"/></svg>,
  Package: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  Payment: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Voucher: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M2 15v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><path d="M20 9a2 2 0 0 0 0 6"/><path d="M4 9a2 2 0 0 1 0 6"/></svg>,
  Revenue: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Wifi: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.09-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Money: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Online: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Diamond: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Device: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
}

const DurationField = ({ form, setForm }: { form: any; setForm: any }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>Muda wa Package *</label>
    <div style={{ display: 'flex', gap: 8 }}>
      <input type="number" min="1" placeholder="1" value={form.duration_value || ''}
        onChange={(e: any) => setForm({ ...form, duration_value: e.target.value })}
        style={{ flex: 1, padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
      <select value={form.duration_unit || 'hours'} onChange={(e: any) => setForm({ ...form, duration_unit: e.target.value })}
        style={{ flex: 1, padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: 'var(--gray-800)', cursor: 'pointer' }}>
        <option value="hours">Masaa</option>
        <option value="days">Siku</option>
      </select>
    </div>
    {(form.duration_value && form.duration_unit) && (
      <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
        = {form.duration_unit === 'hours' ? `${form.duration_value * 60} dakika` : `${form.duration_value * 1440} dakika (${form.duration_value * 24} masaa)`}
      </span>
    )}
  </div>
)

function VoucherPrintCard({ voucher, business_name, theme }: { voucher: any; business_name: string; theme: any }) {
  const price = Number(voucher.package_price || voucher.price || 0)
  const priceDisplay = price > 0 ? price >= 10000 ? `${(price / 1000).toFixed(0)}K` : price.toLocaleString() : '—'
  const uptime = voucher.duration || voucher.duration_display || voucher.uptime || '—'
  const speed = voucher.speed || (voucher.speed_down && voucher.speed_up ? `${voucher.speed_down}mb / ${voucher.speed_up}mb` : null) || '—'
  const packageName = voucher.package_name || voucher.package || '—'
  const priceFontSize = priceDisplay.length > 6 ? 11 : priceDisplay.length > 4 ? 14 : 17
  return (
    <div style={{ display: 'inline-block', margin: '6px', verticalAlign: 'top', pageBreakInside: 'avoid', fontFamily: 'Arial, sans-serif', background: '#f0f4ff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', border: '1px solid #e0e8ff', width: '100%', boxSizing: 'border-box' as any }}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 9, color: '#c9a227', marginBottom: 2, letterSpacing: 2 }}>✦ ─── ✦ ─── ✦</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: theme.bg, letterSpacing: 1, lineHeight: 1.1 }}>{business_name.toUpperCase()}</div>
            <div style={{ fontSize: 8, color: '#888', fontStyle: 'italic', marginTop: 1 }}>Stay Connected. Stay Powered.</div>
            <div style={{ fontSize: 8, color: '#c9a227', marginTop: 3, letterSpacing: 2 }}>── ── ── ──</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {price > 0 && (
              <div style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, #0d1a5c 100%)`, borderRadius: 8, padding: '5px 10px', border: '2px solid #c9a227', textAlign: 'center' }}>
                <div style={{ fontSize: 7, color: '#c9a227', fontWeight: 700, letterSpacing: 2, marginBottom: 1 }}>PRICE</div>
                <div style={{ fontSize: priceFontSize, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1 }}>TZS {priceDisplay}</div>
              </div>
            )}
            <div style={{ background: theme.bg, borderRadius: 8, padding: '7px 9px', border: '2px solid #c9a227', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1.5 8.5C5.5 4.5 10.5 2.5 12 2.5C13.5 2.5 18.5 4.5 22.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M4.5 11.5C7.5 8.5 10 7 12 7C14 7 16.5 8.5 19.5 11.5" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M7.5 14.5C9.5 12.5 11 11.5 12 11.5C13 11.5 14.5 12.5 16.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="18" r="1.5" fill="white"/></svg>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 9, padding: '7px 8px', border: '1px solid #e5eaf5' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#333', letterSpacing: 0.5, marginBottom: 3 }}>UPTIME</div>
            <div style={{ fontSize: uptime.length > 8 ? 10 : 12, fontWeight: 900, color: theme.bg }}>{uptime}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 9, padding: '7px 8px', border: '1px solid #e5eaf5' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#333', letterSpacing: 0.5, marginBottom: 3 }}>SPEED</div>
            <div style={{ fontSize: speed.length > 10 ? 9 : 11, fontWeight: 900, color: theme.bg }}>{speed}</div>
          </div>
        </div>
        <div style={{ marginBottom: 8, padding: '5px 8px', background: '#fff', borderRadius: 7, border: '1px solid #e5eaf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: 1 }}>PACKAGE</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: theme.bg }}>{packageName}</span>
          </div>
          {voucher.customer_phone && (
            <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>{voucher.customer_phone}</div>
          )}
        </div>
        <div style={{ borderTop: '1.5px dashed #c9a227', margin: '6px 0' }} />
        <div style={{ background: '#fff', border: '2px solid #c9a227', borderRadius: 10, padding: '7px 10px', textAlign: 'center', marginBottom: 7, boxShadow: '0 2px 8px rgba(201,162,39,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color: '#c9a227', fontWeight: 700, fontSize: 10 }}>——</span>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: 5, color: theme.bg, fontFamily: 'Courier New, monospace' }}>{voucher.code}</span>
            <span style={{ color: '#c9a227', fontWeight: 700, fontSize: 10 }}>——</span>
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#888', letterSpacing: 3 }}>VOUCHER CODE</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 8, color: '#666', fontStyle: 'italic', maxWidth: '55%', lineHeight: 1.5 }}>
            Enjoy fast, reliable and <span style={{ color: theme.bg, fontWeight: 700 }}>uninterrupted</span> internet.
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: theme.bg, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Thank You!</div>
            <div style={{ fontSize: 7, color: '#c9a227', letterSpacing: 1 }}>── For Choosing Us ──</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ADMIN DASHBOARD ──────────────────────────────────────
export function AdminDashboard() {
  const { t } = useLang()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/dashboard/superadmin/').then(r => { setData(r.data); setLoading(false) }) }, [])
  const s = data?.stats
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader title={t('dashboard')} subtitle={t('summary')} action={<span style={{ fontSize: 12, color: 'var(--gray-500)', background: '#fff', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>{new Date().toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('total_clients')} value={loading ? '—' : s?.total_clients || 0} icon={<Icons.Users />} color="#6366f1" />
          <StatCard title={t('online_routers')} value={loading ? '—' : `${s?.online_routers || 0}/${s?.total_routers || 0}`} icon={<Icons.Online />} color="#10b981" />
          <StatCard title={t('today_revenue')} value={loading ? '—' : `TZS ${Number(s?.today_revenue || 0).toLocaleString()}`} icon={<Icons.Money />} color="#f59e0b" />
          <StatCard title={t('today_commission')} value={loading ? '—' : `TZS ${Number(s?.today_commission || 0).toLocaleString()}`} icon={<Icons.Diamond />} color="#8b5cf6" />
          <StatCard title={t('vouchers_today')} value={loading ? '—' : s?.total_vouchers_today || 0} icon={<Icons.Voucher />} color="#06b6d4" />
          <StatCard title={t('pending_jobs')} value={loading ? '—' : s?.pending_jobs || 0} icon={<Icons.Clock />} color="#f59e0b" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <Card style={{ gridColumn: 'span 2' }}>
            <CardHeader title={t('vouchers_this_week')} />
            <div style={{ padding: '1rem' }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={WEEK}>
                  <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}/>
                  <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#ag)" strokeWidth={2} name="Vouchers"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title={t('system_status')} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Django API', ok: true },
                { label: 'Celery Worker', ok: true },
                { label: 'Redis', ok: true },
                { label: `GSM Devices (${s?.active_devices || 0})`, ok: (s?.active_devices || 0) > 0 },
                { label: `VPN Routers (${s?.online_routers || 0})`, ok: (s?.online_routers || 0) > 0 },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 500 }}>{item.label}</span>
                  <Badge text={item.ok ? 'OK' : 'Issue'} color={item.ok ? 'green' : 'red'} />
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card>
          <CardHeader title={t('clients')} action={<Badge text={`${data?.clients?.length || 0}`} color="indigo" />} />
          <Table loading={loading} headers={[t('business_name'), 'ID', t('commission_rate'), t('balance'), t('payments'), t('status')]}
            rows={(data?.clients || []).map((c: any) => [
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{c.business_name}</div><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{c.username}</div></div>,
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.1em' }}>{c.identifier}</span>,
              `${c.commission_rate}%`,
              <span style={{ fontWeight: 700, color: '#059669', fontSize: 13 }}>TZS {Number(c.balance).toLocaleString()}</span>,
              c.total_payments,
              <Badge text={c.is_active ? t('active') : t('inactive')} color={c.is_active ? 'green' : 'red'} />,
            ])}
            emptyMessage={t('no_clients_yet')}
          />
        </Card>
      </div>
    </Layout>
  )
}

// ── ADMIN CLIENTS ────────────────────────────────────────
export function AdminClients() {
  const { t } = useLang()
  const { alert, show } = useAlert()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showBalance, setShowBalance] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [form, setForm] = useState({ business_name: '', username: '', password: '', email: '', phone: '', commission_rate: '10' })

  const fetch = () => { setLoading(true); api.get('/clients/').then(r => { setClients(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => { fetch() }, [])

  const handleCreate = async () => {
    if (!form.business_name || !form.username || !form.password) { show('error', 'Jaza sehemu zote'); return }
    setSaving(true)
    try { await api.post('/clients/', form); show('success', `${form.business_name} ameundwa!`); setShowCreate(false); setForm({ business_name: '', username: '', password: '', email: '', phone: '', commission_rate: '10' }); fetch() }
    catch (e: any) { show('error', JSON.stringify(e.response?.data || t('error'))) }
    finally { setSaving(false) }
  }

  const handleBalance = async () => {
    if (!selected || !balanceAmount) return
    try { const r = await api.post(`/clients/${selected.id}/add-balance/`, { amount: balanceAmount }); show('success', r.data.message); setShowBalance(false); setBalanceAmount(''); fetch() }
    catch { show('error', t('error')) }
  }

  const handlePassword = async () => {
    if (!selected || !newPassword) return
    try { await api.post(`/clients/${selected.id}/change-password/`, { new_password: newPassword }); show('success', 'Password imebadilishwa'); setShowPassword(false); setNewPassword('') }
    catch { show('error', t('error')) }
  }

  const handleToggle = async (c: any, action: 'activate' | 'deactivate') => {
    try { const r = await api.post(`/clients/${c.id}/${action}/`); show('success', r.data.message); fetch() }
    catch { show('error', t('error')) }
  }

  const handleDelete = async () => {
    if (!selected) return
    try { await api.delete(`/clients/${selected.id}/`); show('success', 'Imefutwa'); setShowDelete(false); setSelected(null); fetch() }
    catch { show('error', t('error')) }
  }

  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader title={t('clients')} subtitle={`${clients.length} wateja`} action={<Button onClick={() => setShowCreate(true)} icon="➕">{t('add_client')}</Button>} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        <Card>
          <Table loading={loading} headers={[t('business_name'), 'ID', t('commission_rate'), t('balance'), t('status'), '']}
            rows={clients.map(c => [
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{c.business_name}</div><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{c.username} {c.email ? `· ${c.email}` : ''}</div></div>,
              <span style={{ fontFamily: 'monospace', fontWeight: 800, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 5, fontSize: 13, letterSpacing: '0.1em' }}>{c.identifier}</span>,
              `${c.commission_rate}%`,
              <span style={{ fontWeight: 700, color: '#059669', fontSize: 13 }}>TZS {Number(c.balance).toLocaleString()}</span>,
              <Badge text={c.is_active ? t('active') : t('inactive')} color={c.is_active ? 'green' : 'red'} />,
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowBalance(true) }}>{t('add_balance')}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowPassword(true) }}>{t('change_password')}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowPermissions(true) }}>MikroTik</Button>
                <Button size="sm" variant={c.is_active ? 'warning' : 'success'} onClick={() => handleToggle(c, c.is_active ? 'deactivate' : 'activate')}>{c.is_active ? t('deactivate') : t('activate')}</Button>
                <Button size="sm" variant="danger" onClick={() => { setSelected(c); setShowDelete(true) }}>{t('delete')}</Button>
              </div>,
            ])}
            emptyMessage={t('no_clients_yet')}
          />
        </Card>
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('add_client')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={`${t('business_name')} *`} placeholder="Mama Fatuma Hotspot" value={form.business_name} onChange={(e: any) => setForm({ ...form, business_name: e.target.value })} />
            <FormRow>
              <Input label={`${t('username')} *`} placeholder="mfatuma" value={form.username} onChange={(e: any) => setForm({ ...form, username: e.target.value })} />
              <Input label={`${t('password')} *`} type="password" placeholder="••••••" value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} />
            </FormRow>
            <FormRow>
              <Input label={t('phone')} placeholder="0712345678" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
              <Input label={t('email')} type="email" placeholder="email@example.com" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} />
            </FormRow>
            <Input label={t('commission_rate')} type="number" placeholder="10" value={form.commission_rate} onChange={(e: any) => setForm({ ...form, commission_rate: e.target.value })} />
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534' }}>ID itatolewa automatically kwa mpangilio (1, 2, 3...)</div>
            <FormActions>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('cancel')}</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? t('loading') : t('create_client')}</Button>
            </FormActions>
          </div>
        </Modal>
        <Modal open={showBalance} onClose={() => setShowBalance(false)} title={`${t('add_balance')} — ${selected?.business_name}`} width={380}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--gray-50)', borderRadius: 9, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t('current_balance')}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>TZS {Number(selected?.balance || 0).toLocaleString()}</span>
            </div>
            <Input label={`${t('amount')} (TZS)`} type="number" placeholder="50000" value={balanceAmount} onChange={(e: any) => setBalanceAmount(e.target.value)} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowBalance(false)}>{t('cancel')}</Button>
              <Button variant="success" onClick={handleBalance}>{t('add_balance')}</Button>
            </FormActions>
          </div>
        </Modal>
        <Modal open={showPassword} onClose={() => setShowPassword(false)} title={`${t('change_password')} — ${selected?.business_name}`} width={380}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label={t('new_password')} type="password" placeholder="••••••••" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowPassword(false)}>{t('cancel')}</Button>
              <Button onClick={handlePassword}>{t('save')}</Button>
            </FormActions>
          </div>
        </Modal>
        {showPermissions && selected && (
          <MikroTikPermissionsModal client={selected} onClose={() => { setShowPermissions(false); setSelected(null) }} onSaved={() => { show('success', `Permissions za ${selected.business_name} zimehifadhiwa`); fetch() }} />
        )}
        <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title={t('delete_client')} message={`Futa ${selected?.business_name}? Hatua hii haiwezi kurudishwa!`} danger />
      </div>
    </Layout>
  )
}

// ── ADMIN ROUTERS ────────────────────────────────────────
export function AdminRouters() {
  const { t } = useLang()
  const { alert, show } = useAlert()
  const [routers, setRouters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<number | null>(null)
  const fetch = () => { setLoading(true); api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => { fetch() }, [])
  const testConn = async (id: number) => {
    setTesting(id)
    try { const r = await api.post(`/routers/${id}/test-connection/`); show('success', r.data.message); fetch() }
    catch { show('error', t('router_offline')) }
    finally { setTesting(null) }
  }
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader title={t('routers')} subtitle={t('all_routers_subtitle')} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        <Card>
          <Table loading={loading} headers={[t('router_name'), t('client'), 'Host', 'Port', t('status'), t('last_seen'), '']}
            rows={routers.map(r => [
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>,
              <Badge text={r.client_name} color="indigo" />,
              <code style={{ fontSize: 11, color: 'var(--gray-500)' }}>{r.host}</code>,
              r.api_port,
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.is_online ? '#10b981' : '#ef4444', boxShadow: r.is_online ? '0 0 0 3px #d1fae5' : 'none' }} />
                <Badge text={r.is_online ? t('online') : t('offline')} color={r.is_online ? 'green' : 'red'} />
              </div>,
              r.last_seen ? new Date(r.last_seen).toLocaleString('sw-TZ') : t('never'),
              <Button size="sm" variant="ghost" onClick={() => testConn(r.id)} disabled={testing === r.id}>{testing === r.id ? t('testing') : 'Test'}</Button>,
            ])}
            emptyMessage={t('no_routers')}
          />
        </Card>
      </div>
    </Layout>
  )
}

// ── ADMIN PAYMENTS ────────────────────────────────────────
export function AdminPayments() {
  const { t } = useLang()
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { Promise.all([api.get('/payments/'), api.get('/payments/summary/')]).then(([p, s]) => { setPayments(p.data.results || p.data); setSummary(s.data); setLoading(false) }) }, [])
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader title={t('payments')} subtitle={t('all_payments_subtitle')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('total_payments')} value={summary?.total_payments || 0} icon={<Icons.Payment />} color="#6366f1" />
          <StatCard title={t('grand_total')} value={`TZS ${Number(summary?.total_amount || 0).toLocaleString()}`} icon={<Icons.Money />} color="#10b981" />
          <StatCard title={t('total_commission')} value={`TZS ${Number(summary?.total_commission || 0).toLocaleString()}`} icon={<Icons.Diamond />} color="#8b5cf6" />
        </div>
        <Card>
          <Table loading={loading} headers={[t('client'), t('phone_number'), t('amount'), 'Transaction ID', t('network'), t('status'), t('created_at')]}
            rows={payments.map(p => [
              p.client_name, p.phone_number,
              <strong style={{ fontSize: 13 }}>TZS {Number(p.amount).toLocaleString()}</strong>,
              <code style={{ fontSize: 11 }}>{p.transaction_id || '—'}</code>,
              <Badge text={p.network_display} color={nc[p.network] || 'gray'} />,
              <Badge text={p.status_display} color={sc[p.status] || 'gray'} />,
              new Date(p.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage={t('no_payments')}
          />
        </Card>
      </div>
    </Layout>
  )
}

// ── ADMIN VOUCHERS ────────────────────────────────────────
export function AdminVouchers() {
  const { t } = useLang()
  const [vouchers, setVouchers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const url = filter ? `/vouchers/?status=${filter}` : '/vouchers/'
    Promise.all([api.get(url), api.get('/vouchers/stats/')]).then(([v, s]) => { setVouchers(v.data.results || v.data); setStats(s.data); setLoading(false) })
  }, [filter])
  const FILTERS = [{ k: '', l: t('all') }, { k: 'active', l: 'Active' }, { k: 'used', l: t('used') }, { k: 'expired', l: t('expired') }]
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader title={t('vouchers')} subtitle={t('all_vouchers_subtitle')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[{ l: t('all'), v: stats?.total || 0, c: '#6366f1' }, { l: 'Active', v: stats?.active || 0, c: '#10b981' }, { l: t('used'), v: stats?.used || 0, c: '#6b7280' }, { l: t('expired'), v: stats?.expired || 0, c: '#ef4444' }].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 12, padding: '0.9rem', borderLeft: `4px solid ${s.c}` }}>
              <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.c, marginTop: 3 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid', borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)', background: filter === f.k ? 'var(--primary-light)' : '#fff', color: filter === f.k ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{f.l}</button>)}
        </div>
        <Card>
          <Table loading={loading} headers={[t('code'), t('client'), t('packages'), t('price'), t('customer_phone'), t('status'), t('created_at')]}
            rows={vouchers.map(v => [
              <code style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', letterSpacing: '0.08em' }}>{v.code}</code>,
              v.client_name, v.package_name,
              `TZS ${Number(v.package_price).toLocaleString()}`,
              v.customer_phone,
              <Badge text={v.status_display} color={vs[v.status] || 'gray'} />,
              new Date(v.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage={t('no_vouchers')}
          />
        </Card>
      </div>
    </Layout>
  )
}

// ── ADMIN DEVICES ────────────────────────────────────────
export function AdminDevices() {
  const { t } = useLang()
  const { alert, show } = useAlert()
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editDev, setEditDev] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', network: 'vodacom', lipa_number: '', phone_number: '', device_id: '', description: '' })
  const NETS = [{ value: 'vodacom', label: 'Vodacom M-Pesa' }, { value: 'tigo', label: 'Tigo Pesa' }, { value: 'airtel', label: 'Airtel Money' }, { value: 'halo', label: 'HaloPesa' }]
  const fetch = () => { setLoading(true); api.get('/devices/').then(r => { setDevices(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => { fetch() }, [])
  const openEdit = (d: any) => { setEditDev(d); setForm({ name: d.name, network: d.network, lipa_number: d.lipa_number, phone_number: d.phone_number, device_id: d.device_id, description: d.description || '' }); setShowModal(true) }
  const openCreate = () => { setEditDev(null); setForm({ name: '', network: 'vodacom', lipa_number: '', phone_number: '', device_id: '', description: '' }); setShowModal(true) }
  const handleSave = async () => {
    if (!form.name || !form.lipa_number || !form.phone_number || !form.device_id) { show('error', 'Jaza sehemu zote'); return }
    setSaving(true)
    try { if (editDev) await api.patch(`/devices/${editDev.id}/`, form); else await api.post('/devices/', form); show('success', editDev ? 'Imesasishwa!' : 'Imeongezwa!'); setShowModal(false); fetch() }
    catch (e: any) { show('error', JSON.stringify(e.response?.data || t('error'))) }
    finally { setSaving(false) }
  }
  const handleDelete = async (d: any) => {
    if (!confirm(`Futa ${d.name}?`)) return
    try { await api.delete(`/devices/${d.id}/`); show('success', 'Imefutwa'); fetch() }
    catch { show('error', t('error')) }
  }
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={t('devices')} subtitle="GSM Devices — lipa namba zinasimamia hapa" action={<Button onClick={openCreate} icon="➕">{t('add_device')}</Button>} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#1e40af' }}>
          Ukibadilisha lipa namba hapa, clients wote wataona mabadiliko automatically.
        </div>
        <Card>
          <Table loading={loading} headers={[t('device_name'), t('network'), t('lipa_number'), 'SIM', 'ID', t('last_seen'), t('status'), '']}
            rows={devices.map(d => [
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.description}</div></div>,
              <Badge text={d.network_display} color={nc[d.network] || 'gray'} />,
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{d.lipa_number}</span>,
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.phone_number}</span>,
              <code style={{ fontSize: 11 }}>{d.device_id}</code>,
              d.last_seen ? new Date(d.last_seen).toLocaleString('sw-TZ') : t('never'),
              <Badge text={d.is_active ? t('active') : t('inactive')} color={d.is_active ? 'green' : 'red'} />,
              <div style={{ display: 'flex', gap: 5 }}>
                <Button size="sm" variant="ghost" onClick={() => openEdit(d)}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(d)}>{t('delete')}</Button>
              </div>,
            ])}
            emptyMessage={t('no_devices_admin')}
          />
        </Card>
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editDev ? `${t('edit_device')}: ${editDev.name}` : t('add_device')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={`${t('device_name')} *`} placeholder="Vodacom Device 1" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <Select label={`${t('network')} *`} value={form.network} onChange={(e: any) => setForm({ ...form, network: e.target.value })}>
              {NETS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
            <FormRow>
              <Input label={`${t('lipa_number')} *`} placeholder="0744123456" value={form.lipa_number} onChange={(e: any) => setForm({ ...form, lipa_number: e.target.value })} />
              <Input label={`${t('phone_number')} *`} placeholder="0744123456" value={form.phone_number} onChange={(e: any) => setForm({ ...form, phone_number: e.target.value })} />
            </FormRow>
            <Input label={`${t('device_id')} *`} placeholder="VODA_001" value={form.device_id} onChange={(e: any) => setForm({ ...form, device_id: e.target.value })} />
            <Input label={t('description')} placeholder="Device ya Dar es Salaam" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
            <div style={{ background: 'var(--warning-light)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e' }}>{t('device_id_hint')}</div>
            <FormActions>
              <Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? t('loading') : t('save_device')}</Button>
            </FormActions>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

// ── CLIENT DASHBOARD ──────────────────────────────────────
function useCountUp(target: number, duration = 900, active = true) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active || target === 0) { setValue(target); return }
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.floor((1 - Math.pow(1 - progress, 3)) * target))
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

function DashStatCard({ title, value, icon, accent, delay = 0, loaded = false, subtitle }: { title: string; value: string | number; icon: React.ReactNode; accent: string; delay?: number; loaded?: boolean; subtitle?: string }) {
  const ref = useFadeIn(delay)
  const [hovered, setHovered] = useState(false)
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: 14, border: `1px solid ${hovered ? accent + '55' : '#e5e7eb'}`, padding: '1.1rem 1.25rem', transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hovered ? `0 8px 24px ${accent}22` : '0 1px 4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', cursor: 'default' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent, opacity: hovered ? 1 : 0.35, transition: 'opacity 0.25s', borderRadius: '14px 14px 0 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>{title}</p>
          {!loaded ? <div style={{ height: 26, width: '55%', background: '#f3f4f6', borderRadius: 6, animation: 'cdShimmer 1.4s ease-in-out infinite' }} />
            : <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{value}</p>}
          {subtitle && loaded && <p style={{ fontSize: 12, color: '#9ca3af', margin: '5px 0 0', fontWeight: 500 }}>{subtitle}</p>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent + '18', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 12 }}>{icon}</div>
      </div>
    </div>
  )
}

function DashChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#6366f1', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{payload[0].value} vouchers</p>
    </div>
  )
}

const DASH_CHART = [
  { h: '08:00', v: 2 }, { h: '09:00', v: 5 }, { h: '10:00', v: 8 },
  { h: '11:00', v: 6 }, { h: '12:00', v: 12 }, { h: '13:00', v: 9 },
  { h: '14:00', v: 15 }, { h: '15:00', v: 11 }, { h: '16:00', v: 7 },
]

export function ClientDashboard() {
  const { t } = useLang()
  const [data, setData] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const headerRef = useFadeIn(0)
  const bannerRef = useFadeIn(80)

  useEffect(() => {
    api.get('/dashboard/client/').then(r => { setData(r.data); setLoaded(true) })
  }, [])

  const s = data?.stats
  const identifier = data?.client?.identifier || ''
  const balance = Number(data?.client?.balance || 0)
  const lipaNumbers: any[] = data?.lipa_numbers || []
  // Chagua lipa namba ya kwanza kuonyesha - kama ipo zaidi ya moja, onyesha zote
  const primaryLipa = lipaNumbers[0]?.lipa_number || '—'

  const onlineRouters = useCountUp(s?.online_routers ?? 0, 800, loaded)
  const totalRouters  = useCountUp(s?.total_routers  ?? 0, 800, loaded)
  const totalPackages = useCountUp(s?.total_packages ?? 0, 700, loaded)
  const todayPayments = useCountUp(s?.today_payments ?? 0, 750, loaded)
  const todayVouchers = useCountUp(s?.today_vouchers ?? 0, 750, loaded)
  const todayRevenue  = useCountUp(s?.today_revenue  ?? 0, 1000, loaded)

  const recent = (data?.recent_vouchers || []).slice(0, 6)
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    active:  { label: t('active'), color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    used:    { label: t('used'), color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    expired: { label: t('expired'), color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  }

  return (
    <Layout>
      <style>{`
        @keyframes cdShimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes cdFadeSlide { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {loaded ? `${t('welcome_client')}, ${data?.client?.business_name}` : t('loading')}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{t('business_summary_today')}</p>
        </div>

        {/* Banner */}
        <div ref={bannerRef} style={{ background: 'linear-gradient(135deg, #13103a 0%, #1e1b4b 60%, #1a1040 100%)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(165,180,252,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('payment_instructions')}</span>
                <div style={{ height: 1, flex: 1, background: 'rgba(99,102,241,0.25)' }} />
              </div>

              {/* Lipa Numbers - dynamic from API */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginBottom: 16 }}>
                {!loaded ? (
                  <div style={{ height: 40, width: 120, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'cdShimmer 1.4s ease-in-out infinite' }} />
                ) : lipaNumbers.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{t('no_devices')}</div>
                ) : lipaNumbers.map((ln: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {i > 0 && <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />}
                    <div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {ln.network_display || t('lipa_number')}
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#a5b4fc', margin: 0, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                        {ln.lipa_number}
                      </p>
                    </div>
                  </div>
                ))}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' }} />
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 3px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('your_number')}</p>
                  {!loaded
                    ? <div style={{ height: 30, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'cdShimmer 1.4s ease-in-out infinite' }} />
                    : <p style={{ fontSize: 26, fontWeight: 900, margin: 0, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#a5b4fc', background: 'rgba(165,180,252,0.12)', padding: '2px 12px', borderRadius: 8, display: 'inline-block' }}>{identifier}</p>
                  }
                </div>
              </div>

              {/* Payment instructions */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(165,180,252,0.8)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('how_customers_pay')}</p>
                {[
                  t('pay_step_1'),
                  `${t('pay_step_2')} (${loaded ? identifier : '…'})`,
                  null,
                  t('pay_step_4'),
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 7 : 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>
                      {i === 2 ? (
                        loaded && lipaNumbers.length > 0
                          ? <>{t('pay_step_3_prefix')} <strong style={{ color: '#fbbf24' }}>TZS 50{identifier}</strong> {t('pay_step_3_to')} <strong style={{ color: '#a5b4fc' }}>{primaryLipa}</strong>.</>
                          : t('pay_step_3_placeholder')
                      ) : i === 3 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {step}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20, flexShrink: 0 }}>
                            <Icons.Check /> {t('automatic')}
                          </span>
                        </span>
                      ) : step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '1.1rem 1.4rem', border: '1px solid rgba(99,102,241,0.2)', minWidth: 160, textAlign: 'right', alignSelf: 'flex-start' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('balance')}</p>
              {!loaded
                ? <div style={{ height: 34, width: 120, background: 'rgba(255,255,255,0.08)', borderRadius: 6, animation: 'cdShimmer 1.4s ease-in-out infinite', marginLeft: 'auto' }} />
                : <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>TZS {balance.toLocaleString()}</p>
              }
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>{t('current_balance')}</p>
            </div>
          </div>
        </div>

        {/* No devices warning */}
        {loaded && lipaNumbers.length === 0 && (
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8, animation: 'cdFadeSlide 0.4s ease' }}>
            <Icons.Alert />
            {t('no_devices')}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <DashStatCard title={t('routers')} icon={<Icons.Router />} accent="#10b981" value={loaded ? `${onlineRouters} / ${totalRouters}` : '—'} subtitle={t('zipo_online_sasa')} delay={100} loaded={loaded} />
          <DashStatCard title={t('packages')} icon={<Icons.Package />} accent="#f59e0b" value={loaded ? totalPackages : '—'} delay={160} loaded={loaded} />
          <DashStatCard title={t('payments_today')} icon={<Icons.Payment />} accent="#6366f1" value={loaded ? todayPayments : '—'} delay={220} loaded={loaded} />
          <DashStatCard title={t('vouchers_today')} icon={<Icons.Voucher />} accent="#8b5cf6" value={loaded ? todayVouchers : '—'} delay={280} loaded={loaded} />
          <DashStatCard title={t('today_revenue')} icon={<Icons.Revenue />} accent="#06b6d4" value={loaded ? `TZS ${todayRevenue.toLocaleString()}` : '—'} delay={340} loaded={loaded} />
        </div>

        {/* Chart + Recent */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', animation: 'cdFadeSlide 0.5s ease 0.4s both' }}>
            <div style={{ padding: '1.1rem 1.4rem 0.75rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{t('vouchers_today')}</h3>
              <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 20 }}>{t('by_hour')}</span>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={DASH_CHART} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="cdGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.22}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="h" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                  <Tooltip content={<DashChartTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}/>
                  <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="url(#cdGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#8b5cf6' }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', animation: 'cdFadeSlide 0.5s ease 0.5s both' }}>
            <div style={{ padding: '1.1rem 1.4rem 0.75rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{t('recent_vouchers')}</h3>
            </div>
            {!loaded ? (
              <div style={{ padding: '0.5rem 0' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ height: 13, width: 88, background: '#f3f4f6', borderRadius: 4, marginBottom: 7, animation: 'cdShimmer 1.4s ease-in-out infinite' }} />
                      <div style={{ height: 11, width: 118, background: '#f3f4f6', borderRadius: 4, animation: 'cdShimmer 1.4s ease-in-out infinite' }} />
                    </div>
                    <div style={{ height: 22, width: 64, background: '#f3f4f6', borderRadius: 20, animation: 'cdShimmer 1.4s ease-in-out infinite' }} />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#9ca3af' }}><Icons.Voucher /></div>
                <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{t('no_vouchers_today')}</p>
              </div>
            ) : (
              <div style={{ padding: '0.5rem 0' }}>
                {recent.map((v: any, i: number) => {
                  const sm = statusMap[v.status] || statusMap.used
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < recent.length - 1 ? '1px solid #f9fafb' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <div>
                        <code style={{ fontWeight: 800, fontSize: 13.5, color: '#6366f1', letterSpacing: '0.06em' }}>{v.code}</code>
                        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{v.customer_phone}<span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>{v.package}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sm.color, background: sm.bg, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>{sm.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// ── CLIENT ROUTERS ────────────────────────────────────────
export function ClientRouters() {
  const { t } = useLang()
  const { clientInfo } = useAuth()
  const { alert, show } = useAlert()
  const [routers, setRouters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editRouter, setEditRouter] = useState<any>(null)
  const [testing, setTesting] = useState<number | null>(null)
  const [showDelete, setShowDelete] = useState<any>(null)
  const [form, setForm] = useState({ name: '', host: '', api_port: '8728', api_username: 'admin', api_password: '', hotspot_interface: 'bridge' })
  const fetch = () => { setLoading(true); api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => { fetch() }, [])
  const openCreate = () => { setEditRouter(null); setForm({ name: '', host: '', api_port: '8728', api_username: 'admin', api_password: '', hotspot_interface: 'bridge' }); setShowModal(true) }
  const openEdit = (r: any) => { setEditRouter(r); setForm({ name: r.name, host: r.host, api_port: String(r.api_port), api_username: r.api_username, api_password: '', hotspot_interface: r.hotspot_interface }); setShowModal(true) }
  const handleSave = async () => {
    try {
      if (editRouter) await api.patch(`/routers/${editRouter.id}/`, form)
      else await api.post('/routers/', { ...form, client: clientInfo?.id })
      show('success', editRouter ? 'Imesasishwa!' : `${form.name} imeongezwa!`)
      setShowModal(false); fetch()
    } catch { show('error', t('error')) }
  }
  const handleDelete = async () => {
    if (!showDelete) return
    try { await api.delete(`/routers/${showDelete.id}/`); show('success', 'Imefutwa'); setShowDelete(null); fetch() }
    catch { show('error', t('error')) }
  }
  const testConn = async (id: number) => {
    setTesting(id)
    try { const r = await api.post(`/routers/${id}/test-connection/`); show('success', r.data.message); fetch() }
    catch { show('error', t('router_offline')) }
    finally { setTesting(null) }
  }
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title={t('routers')} subtitle={t('manage_routers_subtitle')} action={<Button onClick={openCreate} icon="➕">{t('add_router')}</Button>} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#1e40af' }}>{t('vpn_hint')}</div>
        <Card>
          <Table loading={loading} headers={[t('router_name'), 'VPN Host', 'Port', t('status'), t('last_seen'), '']}
            rows={routers.map(r => [
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>,
              <code style={{ fontSize: 11, color: 'var(--gray-500)' }}>{r.host}</code>,
              r.api_port,
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.is_online ? '#10b981' : '#ef4444', boxShadow: r.is_online ? '0 0 0 3px #d1fae5' : 'none' }} />
                <Badge text={r.is_online ? t('online') : t('offline')} color={r.is_online ? 'green' : 'red'} />
              </div>,
              r.last_seen ? new Date(r.last_seen).toLocaleString('sw-TZ') : t('never'),
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => testConn(r.id)} disabled={testing === r.id}>{testing === r.id ? t('testing') : 'Test'}</Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => setShowDelete(r)}>{t('delete')}</Button>
              </div>,
            ])}
            emptyMessage={t('no_routers')}
          />
        </Card>
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editRouter ? `${t('edit_router')}: ${editRouter.name}` : t('add_router')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={`${t('router_name')} *`} placeholder="Router ya Ofisi" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <Input label={`${t('host')} * (VPN IP)`} placeholder="10.66.66.2" value={form.host} onChange={(e: any) => setForm({ ...form, host: e.target.value })} />
            <FormRow>
              <Input label={t('api_port')} type="number" value={form.api_port} onChange={(e: any) => setForm({ ...form, api_port: e.target.value })} />
              <Input label={t('api_username')} value={form.api_username} onChange={(e: any) => setForm({ ...form, api_username: e.target.value })} />
            </FormRow>
            <Input label={`${t('api_password')} *`} type="password" placeholder="••••••" value={form.api_password} onChange={(e: any) => setForm({ ...form, api_password: e.target.value })} />
            <Input label={t('hotspot_interface')} placeholder="bridge" value={form.hotspot_interface} onChange={(e: any) => setForm({ ...form, hotspot_interface: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
              <Button onClick={handleSave}>{t('save')}</Button>
            </FormActions>
          </div>
        </Modal>
        <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title={t('delete_router')} message={`Futa router "${showDelete?.name}"?`} danger />
      </div>
    </Layout>
  )
}

// ── CLIENT PACKAGES ───────────────────────────────────────
export function ClientPackages() {
  const { t } = useLang()
  const { clientInfo } = useAuth()
  const { alert, show } = useAlert()
  const [packages, setPackages] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editPkg, setEditPkg] = useState<any>(null)
  const [showDelete, setShowDelete] = useState<any>(null)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingPkg, setSyncingPkg] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', price: '', duration_value: '1', duration_unit: 'hours', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' })

  const fetchPackages = () => api.get('/packages/').then(r => setPackages(r.data.results || r.data))
  useEffect(() => { fetchPackages() }, [])

  const handleSyncPkg = async (pkgId: number) => {
    setSyncingPkg(pkgId)
    try { const r = await api.post(`/packages/${pkgId}/sync-from-mikrotik/`); show('success', r.data?.message || 'Imesasishwa'); fetchPackages() }
    catch (e: any) { show('error', e.response?.data?.error || 'Sync imeshindwa') }
    finally { setSyncingPkg(null) }
  }

  const handleSyncAll = async () => {
    setSyncingAll(true)
    try { const r = await api.post('/packages/sync-all-from-mikrotik/'); show('success', r.data?.message || 'Zote zimesasishwa'); fetchPackages() }
    catch (e: any) { show('error', e.response?.data?.error || 'Sync imeshindwa') }
    finally { setSyncingAll(false) }
  }

  const openCreate = () => { setEditPkg(null); setForm({ name: '', price: '', duration_value: '1', duration_unit: 'hours', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' }); setShowModal(true) }
  const openEdit = (pkg: any) => {
    setEditPkg(pkg)
    setForm({ name: pkg.name, price: String(pkg.price), duration_value: String(pkg.duration_value || Math.round(pkg.duration_minutes / 60)), duration_unit: pkg.duration_unit || 'hours', speed_up: pkg.speed_up, speed_down: pkg.speed_down, mikrotik_profile: pkg.mikrotik_profile, shared_users: String(pkg.shared_users) })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editPkg) { await api.patch(`/packages/${editPkg.id}/`, form); show('success', `${form.name} imesasishwa!`) }
      else { await api.post('/packages/', { ...form, client: clientInfo?.id }); show('success', `${form.name} imeundwa!`) }
      setShowModal(false); setForm({ name: '', price: '', duration_value: '1', duration_unit: 'hours', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' }); fetchPackages()
    } catch (e: any) {
      const err = e.response?.data
      show('error', typeof err === 'object' ? Object.values(err).flat().join(', ') : t('error'))
    }
  }

  const handleDelete = async () => {
    if (!showDelete) return
    try { await api.delete(`/packages/${showDelete.id}/`); show('success', `${showDelete.name} imefutwa!`); setShowDelete(null); fetchPackages() }
    catch { show('error', t('error')) }
  }

  const identifier = clientInfo?.identifier

  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title={t('packages')} subtitle={t('manage_packages_subtitle')}
          action={<div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={handleSyncAll} disabled={syncingAll}>{syncingAll ? t('syncing') : 'Sync All'}</Button>
            <Button onClick={openCreate} icon="➕">{t('add_package')}</Button>
          </div>}
        />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        {identifier && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#166534' }}>
            Bei inayoonekana kwenye kadi ni bei ya msingi. Wateja wako watalipa <strong>bei + {identifier}</strong>. Mfano: TZS 500 → wateja watalipa <strong>TZS {500 + identifier}</strong>.
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{ background: '#fff', borderRadius: 14, padding: '1.1rem', border: '1px solid var(--gray-100)', boxShadow: 'var(--card-shadow)', borderTop: '3px solid var(--primary)', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{pkg.name}</span>
                <Badge text={pkg.is_active ? t('active') : 'Off'} color={pkg.is_active ? 'green' : 'gray'} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginBottom: 6, letterSpacing: '-0.5px' }}>TZS {Number(pkg.price).toLocaleString()}</div>
              {identifier && (
                <div style={{ marginBottom: 10, background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#854d0e', fontWeight: 600 }}>
                  {t('customers')}: TZS {(Number(pkg.price) + identifier).toLocaleString()}
                </div>
              )}
              {[{ label: pkg.duration_display }, { label: `${pkg.speed_down}Mbps down` }, { label: `${pkg.speed_up}Mbps up` }, { label: `${pkg.shared_users} users` }].map((x, j) => (
                <div key={j} style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 3 }}>{x.label}</div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace', marginBottom: 10 }}>{pkg.mikrotik_profile}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 10, flexWrap: 'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => handleSyncPkg(pkg.id)} disabled={syncingPkg === pkg.id} style={{ flex: 1 }}>{syncingPkg === pkg.id ? '...' : 'Sync'}</Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(pkg)} style={{ flex: 1 }}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => setShowDelete(pkg)} style={{ flex: 1 }}>{t('delete')}</Button>
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)', background: '#fff', borderRadius: 14, border: '2px dashed var(--gray-200)' }}>
              {t('no_packages')}
            </div>
          )}
        </div>
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editPkg ? `${t('edit')}: ${editPkg.name}` : t('add_package')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label={`${t('package_name')} *`} placeholder="Saa 1, Siku 1..." value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <FormRow>
              <Input label={`${t('price')} *`} type="number" placeholder="500" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} />
              <DurationField form={form} setForm={setForm} />
            </FormRow>
            <FormRow>
              <Input label={t('speed_down')} type="number" placeholder="2" value={form.speed_down} onChange={(e: any) => setForm({ ...form, speed_down: e.target.value })} />
              <Input label={t('speed_up')} type="number" placeholder="2" value={form.speed_up} onChange={(e: any) => setForm({ ...form, speed_up: e.target.value })} />
            </FormRow>
            <Input label={`${t('mikrotik_profile')} *`} placeholder="pkg-500" value={form.mikrotik_profile} onChange={(e: any) => setForm({ ...form, mikrotik_profile: e.target.value })} />
            <Input label={t('shared_users')} type="number" placeholder="1" value={form.shared_users} onChange={(e: any) => setForm({ ...form, shared_users: e.target.value })} />
            {form.price && identifier && (
              <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#854d0e' }}>
                {t('customers_pay')}: <strong>TZS {(Number(form.price) + identifier).toLocaleString()}</strong>
              </div>
            )}
            <FormActions>
              <Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
              <Button onClick={handleSave}>{editPkg ? t('save') : t('save_package')}</Button>
            </FormActions>
          </div>
        </Modal>
        <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title={t('delete')} message={`Futa package "${showDelete?.name}"?`} danger />
      </div>
    </Layout>
  )
}

// ── CLIENT VOUCHERS ───────────────────────────────────────
export function ClientVouchers() {
  const { t } = useLang()
  const [vouchers, setVouchers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  useEffect(() => {
    const url = filter ? `/vouchers/?status=${filter}` : '/vouchers/'
    Promise.all([api.get(url), api.get('/vouchers/stats/')]).then(([v, s]) => { setVouchers(v.data.results || v.data); setStats(s.data); setLoading(false) })
  }, [filter])
  const FILTERS = [{ k: '', l: t('all') }, { k: 'active', l: 'Active' }, { k: 'used', l: t('used') }, { k: 'expired', l: t('expired') }]
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title={t('vouchers')} subtitle={t('vouchers_history_subtitle')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[{ l: t('all'), v: stats?.total || 0, c: '#6366f1' }, { l: 'Active', v: stats?.active || 0, c: '#10b981' }, { l: t('used'), v: stats?.used || 0, c: '#6b7280' }, { l: t('expired'), v: stats?.expired || 0, c: '#ef4444' }].map((s, i) => <StatCard key={i} title={s.l} value={s.v} icon={[<Icons.Voucher />, <Icons.Check />, <Icons.Check />, <Icons.Clock />][i]} color={s.c} />)}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid', borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)', background: filter === f.k ? 'var(--primary-light)' : '#fff', color: filter === f.k ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{f.l}</button>)}
        </div>
        <Card>
          <Table loading={loading} headers={[t('code'), t('packages'), t('price'), t('customer_phone'), t('status'), t('created_at')]}
            rows={vouchers.map(v => [
              <code style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', letterSpacing: '0.08em' }}>{v.code}</code>,
              v.package_name, `TZS ${Number(v.package_price).toLocaleString()}`,
              v.customer_phone,
              <Badge text={v.status_display} color={vs[v.status] || 'gray'} />,
              new Date(v.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage={t('no_vouchers')}
          />
        </Card>
      </div>
    </Layout>
  )
}

// ── CLIENT PAYMENTS ───────────────────────────────────────
export function ClientPayments() {
  const { t } = useLang()
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { Promise.all([api.get('/payments/'), api.get('/payments/summary/')]).then(([p, s]) => { setPayments(p.data.results || p.data); setSummary(s.data); setLoading(false) }) }, [])
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1000, margin: '0 auto' }}>
        <PageHeader title={t('payments')} subtitle={t('payments_history_subtitle')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('total_payments')} value={summary?.total_payments || 0} icon={<Icons.Payment />} color="#6366f1" />
          <StatCard title={t('my_revenue')} value={`TZS ${Number(summary?.total_client_share || 0).toLocaleString()}`} icon={<Icons.Money />} color="#10b981" />
          <StatCard title={t('grand_total')} value={`TZS ${Number(summary?.total_amount || 0).toLocaleString()}`} icon={<Icons.Revenue />} color="#f59e0b" />
        </div>
        <Card>
          <Table loading={loading} headers={[t('phone_number'), t('amount'), 'Transaction ID', t('network'), t('status'), t('created_at')]}
            rows={payments.map(p => [
              p.phone_number,
              <strong style={{ fontSize: 13 }}>TZS {Number(p.amount).toLocaleString()}</strong>,
              <code style={{ fontSize: 11, color: 'var(--gray-500)' }}>{p.transaction_id || '—'}</code>,
              <Badge text={p.network_display} color={nc[p.network] || 'gray'} />,
              <Badge text={p.status_display} color={sc[p.status] || 'gray'} />,
              new Date(p.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage={t('no_payments')}
          />
        </Card>
      </div>
    </Layout>
  )
}

export { VoucherPrintCard, DurationField }
