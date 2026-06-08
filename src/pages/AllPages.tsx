import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import Layout from '../components/Layout'
import { StatCard, Table, Badge, PageHeader, Card, CardHeader, Button, Modal, Input, Select, Alert, FormRow, FormActions, Spinner, ConfirmDialog } from '../components/UI'
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

const DurationField = ({ form, setForm }: { form: any; setForm: any }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>Muda wa Package *</label>
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type="number"
        min="1"
        placeholder="1"
        value={form.duration_value || ''}
        onChange={(e: any) => setForm({ ...form, duration_value: e.target.value })}
        style={{ flex: 1, padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none' }}
      />
      <select
        value={form.duration_unit || 'hours'}
        onChange={(e: any) => setForm({ ...form, duration_unit: e.target.value })}
        style={{ flex: 1, padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: 'var(--gray-800)', cursor: 'pointer' }}
      >
        <option value="hours">⏰ Masaa</option>
        <option value="days">📅 Siku</option>
      </select>
    </div>
    {(form.duration_value && form.duration_unit) && (
      <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
        = {form.duration_unit === 'hours'
          ? `${form.duration_value * 60} dakika`
          : `${form.duration_value * 1440} dakika (${form.duration_value * 24} masaa)`}
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
            {/* Bei — inaonyeshwa hapa badala ya left strip */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <div style={{ width: 24, height: 24, background: theme.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1.5 8.5C5.5 4.5 10.5 2.5 12 2.5C13.5 2.5 18.5 4.5 22.5 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M4.5 11.5C7.5 8.5 10 7 12 7C14 7 16.5 8.5 19.5 11.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M7.5 14.5C9.5 12.5 11 11.5 12 11.5C13 11.5 14.5 12.5 16.5 14.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><circle cx="12" cy="18" r="1.5" fill="white"/></svg>
              </div>
              <div><div style={{ fontSize: 8, fontWeight: 700, color: '#333', letterSpacing: 0.5 }}>UPTIME</div><div style={{ fontSize: 7, color: '#888' }}>Reliability You Trust</div></div>
            </div>
            <div style={{ fontSize: uptime.length > 8 ? 10 : 12, fontWeight: 900, color: theme.bg }}>{uptime}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 9, padding: '7px 8px', border: '1px solid #e5eaf5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <div style={{ width: 24, height: 24, background: theme.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 14.74 3.08 17.22 4.85 19H19.15C20.92 17.22 22 14.74 22 12C22 6.48 17.52 2 12 2Z" stroke="white" strokeWidth="2"/><path d="M12 12L16 8" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="1.5" fill="white"/></svg>
              </div>
              <div><div style={{ fontSize: 8, fontWeight: 700, color: '#333', letterSpacing: 0.5 }}>SPEED</div><div style={{ fontSize: 7, color: '#888' }}>High Speed Internet</div></div>
            </div>
            <div style={{ fontSize: speed.length > 10 ? 9 : 11, fontWeight: 900, color: theme.bg }}>{speed}</div>
          </div>
        </div>
        <div style={{ marginBottom: 8, padding: '5px 8px', background: '#fff', borderRadius: 7, border: '1px solid #e5eaf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke={theme.bg} strokeWidth="2" strokeLinejoin="round"/><path d="M12 3V21" stroke={theme.bg} strokeWidth="2"/><path d="M3 8L12 13L21 8" stroke={theme.bg} strokeWidth="2" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: 1 }}>PACKAGE</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: theme.bg, marginLeft: 'auto' }}>{packageName}</span>
          </div>
          {voucher.customer_phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14.2 14.4C14.5 14.1 14.9 14 15.3 14.2C16.5 14.6 17.8 14.8 19.1 14.8C19.7 14.8 20.1 15.2 20.1 15.8V19.1C20.1 19.7 19.7 20.1 19.1 20.1C10.2 20.1 3 12.9 3 4C3 3.4 3.4 3 4 3H7.3C7.9 3 8.3 3.4 8.3 4C8.3 5.3 8.5 6.6 8.9 7.8C9 8.2 8.9 8.6 8.6 8.9L6.6 10.8Z" stroke={theme.bg} strokeWidth="1.5"/></svg>
              <span style={{ fontSize: 9, color: '#666' }}>{voucher.customer_phone}</span>
            </div>
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
            <span style={{ color: '#c9a227', fontSize: 12, fontWeight: 900 }}>"</span>{' '}Enjoy fast, reliable and{' '}<span style={{ color: theme.bg, fontWeight: 700 }}>uninterrupted</span>{' '}internet.{' '}<span style={{ color: '#c9a227', fontSize: 12, fontWeight: 900 }}>"</span>
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
        <PageHeader title={t('dashboard')} subtitle={t('summary')} action={<span style={{ fontSize: 12, color: 'var(--gray-500)', background: '#fff', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>📅 {new Date().toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('total_clients')} value={loading ? '—' : s?.total_clients || 0} icon="👥" color="#6366f1" />
          <StatCard title={t('online_routers')} value={loading ? '—' : `${s?.online_routers || 0}/${s?.total_routers || 0}`} icon="📡" color="#10b981" />
          <StatCard title={t('today_revenue')} value={loading ? '—' : `TZS ${Number(s?.today_revenue || 0).toLocaleString()}`} icon="💰" color="#f59e0b" />
          <StatCard title={t('today_commission')} value={loading ? '—' : `TZS ${Number(s?.today_commission || 0).toLocaleString()}`} icon="💎" color="#8b5cf6" />
          <StatCard title={t('vouchers_today')} value={loading ? '—' : s?.total_vouchers_today || 0} icon="🎫" color="#06b6d4" />
          <StatCard title={t('pending_jobs')} value={loading ? '—' : s?.pending_jobs || 0} icon="⏳" color="#f59e0b" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <Card style={{ gridColumn: 'span 2' }}>
            <CardHeader title={t('vouchers_today')} />
            <div style={{ padding: '1rem' }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={WEEK}>
                  <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#ag)" strokeWidth={2} name="Vouchers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title={t('system_status')} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[{ label: 'Django API', ok: true }, { label: 'Celery Worker', ok: true }, { label: 'Redis', ok: true }, { label: `GSM Devices (${s?.active_devices || 0})`, ok: (s?.active_devices || 0) > 0 }, { label: `VPN Routers (${s?.online_routers || 0})`, ok: (s?.online_routers || 0) > 0 }].map((item, i) => (
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
          <Table loading={loading} headers={[t('business_name'), 'ID', t('commission_rate'), t('balance'), 'Malipo', t('status')]}
            rows={(data?.clients || []).map((c: any) => [
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{c.business_name}</div><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{c.username}</div></div>,
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.1em' }}>{c.identifier}</span>,
              `${c.commission_rate}%`,
              <span style={{ fontWeight: 700, color: '#059669', fontSize: 13 }}>TZS {Number(c.balance).toLocaleString()}</span>,
              c.total_payments,
              <Badge text={c.is_active ? t('active') : t('inactive')} color={c.is_active ? 'green' : 'red'} />,
            ])}
            emptyMessage="Hakuna wateja"
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
                <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowBalance(true) }} icon="💰">{t('add_balance')}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowPassword(true) }} icon="🔑">{t('change_password')}</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowPermissions(true) }} icon="🔐">MikroTik</Button>
                <Button size="sm" variant={c.is_active ? 'warning' : 'success'} onClick={() => handleToggle(c, c.is_active ? 'deactivate' : 'activate')}>{c.is_active ? `⏸ ${t('deactivate')}` : `▶ ${t('activate')}`}</Button>
                <Button size="sm" variant="danger" onClick={() => { setSelected(c); setShowDelete(true) }} icon="🗑">{t('delete')}</Button>
              </div>,
            ])}
            emptyMessage="Hakuna wateja"
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
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534' }}>ℹ️ Nambari ya utambulisho (ID) itatolewa automatically kwa mpangilio (1, 2, 3...)</div>
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
              <Button variant="success" onClick={handleBalance} icon="💰">{t('add_balance')}</Button>
            </FormActions>
          </div>
        </Modal>
        <Modal open={showPassword} onClose={() => setShowPassword(false)} title={`${t('change_password')} — ${selected?.business_name}`} width={380}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label={t('new_password')} type="password" placeholder="••••••••" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowPassword(false)}>{t('cancel')}</Button>
              <Button onClick={handlePassword} icon="🔑">{t('save')}</Button>
            </FormActions>
          </div>
        </Modal>
        {showPermissions && selected && (
          <MikroTikPermissionsModal client={selected} onClose={() => { setShowPermissions(false); setSelected(null) }} onSaved={() => { show('success', `Permissions za ${selected.business_name} zimehifadhiwa ✓`); fetch() }} />
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
        <PageHeader title={t('routers')} subtitle="Routers za wateja wote" />
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
              <Button size="sm" variant="ghost" onClick={() => testConn(r.id)} disabled={testing === r.id}>{testing === r.id ? t('testing') : `🔗 Test`}</Button>,
            ])}
            emptyMessage="Hakuna routers"
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
        <PageHeader title={t('payments')} subtitle="Malipo yote" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('total_payments')} value={summary?.total_payments || 0} icon="📊" color="#6366f1" />
          <StatCard title="Jumla" value={`TZS ${Number(summary?.total_amount || 0).toLocaleString()}`} icon="💰" color="#10b981" />
          <StatCard title="Commission" value={`TZS ${Number(summary?.total_commission || 0).toLocaleString()}`} icon="💎" color="#8b5cf6" />
        </div>
        <Card>
          <Table loading={loading} headers={[t('client'), t('phone_number'), 'Kiasi', 'Transaction ID', t('network'), t('status'), t('created_at')]}
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
        <PageHeader title={t('vouchers')} subtitle="Vouchers za wateja wote" />
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
          <Table loading={loading} headers={[t('code'), t('client'), 'Package', 'Bei', t('customer_phone'), t('status'), t('created_at')]}
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
          💡 Ukibadilisha lipa namba hapa, clients wote wataona mabadiliko automatically.
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
                <Button size="sm" variant="ghost" onClick={() => openEdit(d)} icon="✏️">{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(d)}>🗑</Button>
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
            <div style={{ background: 'var(--warning-light)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e' }}>⚠️ {t('device_id_hint')}</div>
            <FormActions><Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button><Button onClick={handleSave} disabled={saving}>{saving ? t('loading') : t('save_device')}</Button></FormActions>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

// ── CLIENT DASHBOARD ──────────────────────────────────────
export function ClientDashboard() {
  const { t } = useLang()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/dashboard/client/').then(r => { setData(r.data); setLoading(false) }) }, [])
  const s = data?.stats
  const identifier = data?.client?.identifier
  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={`${t('welcome_back')}, ${data?.client?.business_name || '...'} 👋`} subtitle={t('summary')} />
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 14, padding: '1.1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ color: '#fff' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>{t('reference')}</p>
            <p style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 800, color: '#a5b4fc', letterSpacing: '0.15em' }}>{identifier || '...'}</p>
            {identifier && (
              <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#c7d2fe', marginBottom: 2 }}>📌 Jinsi wateja wako wanavyolipa:</p>
                <p style={{ margin: 0 }}>Waambie walipe <strong>bei ya package + {identifier}</strong> kwenda Lipa Namba.</p>
                <p style={{ margin: 0 }}>Mfano: Package TZS 500 → lipa <strong style={{ color: '#fbbf24' }}>TZS {500 + identifier}</strong> ✅</p>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{t('my_balance')}</p>
            <p style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 800, color: '#fff' }}>TZS {Number(data?.client?.balance || 0).toLocaleString()}</p>
          </div>
        </div>
        {(data?.lipa_numbers?.length > 0) ? (
          <div style={{ background: '#fff', border: '1px solid var(--gray-100)', borderRadius: 14, padding: '1rem', marginBottom: '1.25rem', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: '0.5rem' }}>{t('lipa_namba')}</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: '0.75rem' }}>{t('pay_instruction')}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {data.lipa_numbers.map((d: any, i: number) => (
                <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 9, padding: '10px 14px', border: '1px solid var(--gray-200)', minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 3 }}>{d.network_display}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>{d.lipa_number}</div>
                </div>
              ))}
            </div>
          </div>
        ) : !loading && (
          <div style={{ background: 'var(--warning-light)', borderRadius: 9, padding: '0.75rem', marginBottom: '1.25rem', fontSize: 13, color: '#92400e' }}>⚠️ {t('no_devices')}</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('online_routers')} value={loading ? '—' : `${s?.online_routers}/${s?.total_routers}`} icon="📡" color="#10b981" />
          <StatCard title={t('packages')} value={loading ? '—' : s?.total_packages || 0} icon="📦" color="#f59e0b" />
          <StatCard title={`${t('payments')} Leo`} value={loading ? '—' : s?.today_payments || 0} icon="💳" color="#6366f1" />
          <StatCard title={`${t('vouchers')} Leo`} value={loading ? '—' : s?.today_vouchers || 0} icon="🎫" color="#8b5cf6" />
          <StatCard title={t('today_revenue')} value={loading ? '—' : `TZS ${Number(s?.today_revenue || 0).toLocaleString()}`} icon="💰" color="#06b6d4" />
        </div>
        <Card>
          <CardHeader title={t('recent_vouchers')} />
          <div>
            {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div>
              : (data?.recent_vouchers || []).length === 0
                ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}><div style={{ fontSize: 28, marginBottom: 6 }}>🎫</div>{t('no_vouchers')}</div>
                : (data?.recent_vouchers || []).map((v: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--gray-50)', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <code style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', letterSpacing: '0.05em' }}>{v.code}</code>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{v.customer_phone} · {v.package}</div>
                    </div>
                    <Badge text={v.status === 'active' ? 'Active' : v.status === 'used' ? t('used') : t('expired')} color={vs[v.status] || 'gray'} />
                  </div>
                ))}
          </div>
        </Card>
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
        <PageHeader title={t('routers')} subtitle="Simamia MikroTik routers zako" action={<Button onClick={openCreate} icon="➕">{t('add_router')}</Button>} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#1e40af' }}>🔒 {t('vpn_hint')}</div>
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
                <Button size="sm" variant="ghost" onClick={() => testConn(r.id)} disabled={testing === r.id}>{testing === r.id ? t('testing') : '🔗 Test'}</Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(r)} icon="✏️">{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => setShowDelete(r)}>🗑</Button>
              </div>,
            ])}
            emptyMessage="Hakuna routers"
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
            <FormActions><Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></FormActions>
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
    try {
      const r = await api.post(`/packages/${pkgId}/sync-from-mikrotik/`)
      show('success', r.data?.message || 'Package imesasishwa kutoka MikroTik ✓')
      fetchPackages()
    } catch (e: any) {
      show('error', e.response?.data?.error || 'Sync imeshindwa — angalia router')
    } finally { setSyncingPkg(null) }
  }

  const handleSyncAll = async () => {
    setSyncingAll(true)
    try {
      const r = await api.post('/packages/sync-all-from-mikrotik/')
      show('success', r.data?.message || 'Packages zote zimesasishwa ✓')
      fetchPackages()
    } catch (e: any) {
      show('error', e.response?.data?.error || 'Sync imeshindwa — angalia router')
    } finally { setSyncingAll(false) }
  }

  const openCreate = () => {
    setEditPkg(null)
    setForm({ name: '', price: '', duration_value: '1', duration_unit: 'hours', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' })
    setShowModal(true)
  }

  const openEdit = (pkg: any) => {
    setEditPkg(pkg)
    setForm({
      name: pkg.name, price: String(pkg.price),
      duration_value: String(pkg.duration_value || Math.round(pkg.duration_minutes / 60)),
      duration_unit: pkg.duration_unit || 'hours',
      speed_up: pkg.speed_up, speed_down: pkg.speed_down,
      mikrotik_profile: pkg.mikrotik_profile, shared_users: String(pkg.shared_users),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editPkg) { await api.patch(`/packages/${editPkg.id}/`, form); show('success', `${form.name} imesasishwa!`) }
      else { await api.post('/packages/', { ...form, client: clientInfo?.id }); show('success', `${form.name} imeundwa!`) }
      setShowModal(false)
      setForm({ name: '', price: '', duration_value: '1', duration_unit: 'hours', speed_up: '2', speed_down: '2', mikrotik_profile: '', shared_users: '1' })
      fetchPackages()
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
        <PageHeader
          title={t('packages')}
          subtitle="Unda na simamia vifurushi vyako"
          action={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={handleSyncAll} disabled={syncingAll} icon={syncingAll ? undefined : '🔄'}>
                {syncingAll ? '⏳ Inasync...' : 'Sync All'}
              </Button>
              <Button onClick={openCreate} icon="➕">{t('add_package')}</Button>
            </div>
          }
        />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}
        {identifier && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 13, color: '#166534' }}>
            💡 Bei inayoonekana kwenye kadi ni bei ya msingi. Wateja wako watalipa <strong>bei + {identifier}</strong>.
            Mfano: TZS 500 → wateja watalipa <strong>TZS {500 + identifier}</strong>.
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
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginBottom: 6, letterSpacing: '-0.5px' }}>
                TZS {Number(pkg.price).toLocaleString()}
              </div>
              {identifier && (
                <div style={{ marginBottom: 10, background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#854d0e', fontWeight: 600 }}>
                  💳 Wateja: TZS {(Number(pkg.price) + identifier).toLocaleString()}
                </div>
              )}
              {[{ i: '⏱', v: pkg.duration_display }, { i: '⬇️', v: `${pkg.speed_down}Mbps` }, { i: '⬆️', v: `${pkg.speed_up}Mbps` }, { i: '👥', v: `${pkg.shared_users} users` }].map((x, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)', marginBottom: 3 }}><span>{x.i}</span>{x.v}</div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace', marginBottom: 10 }}>{pkg.mikrotik_profile}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 10, flexWrap: 'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => handleSyncPkg(pkg.id)} disabled={syncingPkg === pkg.id} style={{ flex: 1 }}>
                  {syncingPkg === pkg.id ? '⏳' : '🔄'} Sync
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(pkg)} icon="✏️" style={{ flex: 1 }}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => setShowDelete(pkg)} style={{ flex: 1 }}>🗑 Futa</Button>
              </div>
            </div>
          ))}
          {packages.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)', background: '#fff', borderRadius: 14, border: '2px dashed var(--gray-200)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>{t('no_packages')}
            </div>
          )}
        </div>
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editPkg ? `Hariri: ${editPkg.name}` : t('add_package')}>
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
                💳 Wateja watalipa: <strong>TZS {(Number(form.price) + identifier).toLocaleString()}</strong>
              </div>
            )}
            <FormActions>
              <Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
              <Button onClick={handleSave}>{editPkg ? t('save') : t('save_package')}</Button>
            </FormActions>
          </div>
        </Modal>
        <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} title="Futa Package" message={`Futa package "${showDelete?.name}"? Hatua hii haiwezi kurudishwa!`} danger />
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
        <PageHeader title={t('vouchers')} subtitle="Historia ya vouchers zako" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[{ l: t('all'), v: stats?.total || 0, c: '#6366f1' }, { l: 'Active', v: stats?.active || 0, c: '#10b981' }, { l: t('used'), v: stats?.used || 0, c: '#6b7280' }, { l: t('expired'), v: stats?.expired || 0, c: '#ef4444' }].map((s, i) => <StatCard key={i} title={s.l} value={s.v} icon={['🎫', '✅', '✔', '⏰'][i]} color={s.c} />)}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: '5px 12px', borderRadius: 7, border: '1.5px solid', borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)', background: filter === f.k ? 'var(--primary-light)' : '#fff', color: filter === f.k ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{f.l}</button>)}
        </div>
        <Card>
          <Table loading={loading} headers={[t('code'), 'Package', 'Bei', t('customer_phone'), t('status'), t('created_at')]}
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
        <PageHeader title={t('payments')} subtitle="Historia ya malipo yako" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard title={t('total_payments')} value={summary?.total_payments || 0} icon="📊" color="#6366f1" />
          <StatCard title={t('my_revenue')} value={`TZS ${Number(summary?.total_client_share || 0).toLocaleString()}`} icon="💰" color="#10b981" />
          <StatCard title={t('grand_total')} value={`TZS ${Number(summary?.total_amount || 0).toLocaleString()}`} icon="📈" color="#f59e0b" />
        </div>
        <Card>
          <Table loading={loading} headers={[t('phone_number'), 'Kiasi', 'Transaction ID', t('network'), t('status'), t('created_at')]}
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
