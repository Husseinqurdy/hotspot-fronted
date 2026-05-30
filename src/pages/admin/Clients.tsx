import { useEffect, useState } from 'react'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { Table, Badge, PageHeader, Card, Button, Modal, Input, Alert, FormRow, FormActions } from '../../components/UI'
import { useLang } from '../../contexts/LangContext'

export default function AdminClients() {
  const { t } = useLang()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showBalance, setShowBalance] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [form, setForm] = useState({ business_name: '', username: '', password: '', email: '', phone: '', commission_rate: '10' })

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }
  const fetch = () => { setLoading(true); api.get('/clients/').then(r => { setClients(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => { fetch() }, [])

  const handleCreate = async () => {
    if (!form.business_name || !form.username || !form.password) { showAlrt('error', 'Jaza sehemu zote'); return }
    setSaving(true)
    try {
      await api.post('/clients/', form)
      showAlrt('success', `${t('success')}: ${form.business_name}`)
      setShowCreate(false)
      setForm({ business_name: '', username: '', password: '', email: '', phone: '', commission_rate: '10' })
      fetch()
    } catch (e: any) {
      const err = e.response?.data
      showAlrt('error', typeof err === 'object' ? Object.values(err).flat().join(', ') : t('error'))
    } finally { setSaving(false) }
  }

  const handleAddBalance = async () => {
    if (!selected || !balanceAmount) return
    try {
      const r = await api.post(`/clients/${selected.id}/add-balance/`, { amount: balanceAmount })
      showAlrt('success', r.data.message)
      setShowBalance(false); setBalanceAmount(''); fetch()
    } catch { showAlrt('error', t('error')) }
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>
        <PageHeader title={t('clients')} subtitle={`${clients.length} ${t('clients').toLowerCase()}`}
          action={<Button onClick={() => setShowCreate(true)} icon="➕">{t('add_client')}</Button>} />

        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <Card>
          <Table loading={loading} headers={['Biashara', 'Username', 'ID', 'Commission', t('balance'), t('status'), '']}
            rows={clients.map(c => [
              <div>
                <div style={{ fontWeight: 600 }}>{c.business_name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{c.phone || c.email}</div>
              </div>,
              <span style={{ fontFamily: 'monospace', color: 'var(--gray-600)', fontSize: 13 }}>{c.username}</span>,
              // ✅ reference_prefix → identifier
              <span style={{ fontFamily: 'monospace', fontWeight: 800, background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: 6, fontSize: 14, letterSpacing: '0.1em' }}>
                {c.identifier}
              </span>,
              `${c.commission_rate}%`,
              <span style={{ fontWeight: 700, color: '#059669' }}>TZS {Number(c.balance).toLocaleString()}</span>,
              <Badge text={c.is_active ? t('active') : t('inactive')} color={c.is_active ? 'green' : 'red'} />,
              <Button size="sm" variant="ghost" onClick={() => { setSelected(c); setShowBalance(true) }} icon="💰">{t('add_balance')}</Button>,
            ])}
            emptyMessage="Hakuna wateja. Ongeza wa kwanza!"
          />
        </Card>

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('add_client')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            {/* ✅ Maelezo yaliyobadilishwa */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534' }}>
              ℹ️ Nambari ya utambulisho (ID) itatolewa automatically kwa mpangilio (1, 2, 3...)
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('cancel')}</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? t('loading') : t('create_client')}</Button>
            </FormActions>
          </div>
        </Modal>

        <Modal open={showBalance} onClose={() => setShowBalance(false)} title={`${t('add_balance')} — ${selected?.business_name}`} width={400}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t('current_balance')}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>TZS {Number(selected?.balance || 0).toLocaleString()}</span>
            </div>
            <Input label={`${t('amount')} (TZS)`} type="number" placeholder="50000" value={balanceAmount} onChange={(e: any) => setBalanceAmount(e.target.value)} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowBalance(false)}>{t('cancel')}</Button>
              <Button variant="success" onClick={handleAddBalance} icon="💰">{t('add_balance')}</Button>
            </FormActions>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}