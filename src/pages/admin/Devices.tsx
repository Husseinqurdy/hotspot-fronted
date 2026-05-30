import { useEffect, useState } from 'react'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { Table, Badge, PageHeader, Card, Button, Modal, Input, Select, Alert, FormRow, FormActions } from '../../components/UI'
import { useLang } from '../../contexts/LangContext'

const NETWORKS = [
  { value: 'vodacom', label: 'Vodacom M-Pesa' },
  { value: 'tigo', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'halo', label: 'HaloPesa' },
]

export default function AdminDevices() {
  const { t } = useLang()
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editDevice, setEditDevice] = useState<any>(null)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', network: 'vodacom', lipa_number: '', phone_number: '', device_id: '', description: '' })

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }
  const fetch = () => { setLoading(true); api.get('/devices/').then(r => { setDevices(r.data.results || r.data); setLoading(false) }) }
  useEffect(() => { fetch() }, [])

  const openEdit = (d: any) => {
    setEditDevice(d)
    setForm({ name: d.name, network: d.network, lipa_number: d.lipa_number, phone_number: d.phone_number, device_id: d.device_id, description: d.description || '' })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditDevice(null)
    setForm({ name: '', network: 'vodacom', lipa_number: '', phone_number: '', device_id: '', description: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.lipa_number || !form.phone_number || !form.device_id) { showAlrt('error', 'Jaza sehemu zote zinazohitajika'); return }
    setSaving(true)
    try {
      if (editDevice) {
        await api.patch(`/devices/${editDevice.id}/`, form)
        showAlrt('success', 'Device imesasishwa!')
      } else {
        await api.post('/devices/', form)
        showAlrt('success', 'Device mpya imeongezwa!')
      }
      setShowModal(false); fetch()
    } catch (e: any) {
      showAlrt('error', JSON.stringify(e.response?.data || t('error')))
    } finally { setSaving(false) }
  }

  const handleToggle = async (d: any) => {
    try {
      await api.patch(`/devices/${d.id}/`, { is_active: !d.is_active })
      showAlrt('success', `Device ${d.is_active ? 'imezuiwa' : 'imewashwa'}`)
      fetch()
    } catch { showAlrt('error', t('error')) }
  }

  const handleDelete = async (d: any) => {
    if (!confirm(`Futa ${d.name}?`)) return
    try {
      await api.delete(`/devices/${d.id}/`)
      showAlrt('success', 'Imefutwa')
      fetch()
    } catch { showAlrt('error', t('error')) }
  }

  const netColor: Record<string, any> = { vodacom: 'green', tigo: 'blue', airtel: 'red', halo: 'yellow' }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1100 }}>
        <PageHeader title={t('devices')} subtitle="Simamia A7670E GSM devices na lipa namba"
          action={<Button onClick={openCreate} icon="➕">{t('add_device')}</Button>} />

        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        {/* Info box */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: 14, color: '#1e40af' }}>
          <strong>ℹ️ Jinsi inavyofanya kazi:</strong> Kila device (A7670E) ina SIM card na lipa namba yake. Wateja wanaona lipa namba hizi kwenye dashboard yao. Ukibadilisha lipa namba hapa, itasasishwa automatically kwa clients wote.
        </div>

        <Card>
          <Table loading={loading} headers={['Device', 'Mtandao', 'Lipa Namba', 'Namba ya SIM', 'Device ID', 'Mwisho Kuonekana', t('status'), '']}
            rows={devices.map(d => [
              <div><div style={{ fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{d.description}</div></div>,
              <Badge text={d.network_display} color={netColor[d.network] || 'gray'} />,
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{d.lipa_number}</span>,
              <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{d.phone_number}</span>,
              <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>{d.device_id}</code>,
              d.last_seen ? new Date(d.last_seen).toLocaleString('sw-TZ') : t('never'),
              <Badge text={d.is_active ? t('active') : t('inactive')} color={d.is_active ? 'green' : 'red'} />,
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => openEdit(d)} icon="✏️">{t('edit')}</Button>
                <Button size="sm" variant={d.is_active ? 'danger' : 'success'} onClick={() => handleToggle(d)}>
                  {d.is_active ? '⏸' : '▶'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(d)} icon="🗑">Del</Button>
              </div>,
            ])}
            emptyMessage={t('no_devices_admin')}
          />
        </Card>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editDevice ? `${t('edit')} ${editDevice.name}` : t('add_device')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label={`${t('device_name')} *`} placeholder="Vodacom Device 1" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
            <Select label="Mtandao *" value={form.network} onChange={(e: any) => setForm({ ...form, network: e.target.value })}>
              {NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
            <FormRow>
              <Input label={`${t('lipa_number')} *`} placeholder="0744123456" value={form.lipa_number} onChange={(e: any) => setForm({ ...form, lipa_number: e.target.value })} />
              <Input label={`${t('phone_number')} (SIM) *`} placeholder="0744123456" value={form.phone_number} onChange={(e: any) => setForm({ ...form, phone_number: e.target.value })} />
            </FormRow>
            <Input label={`${t('device_id')} *`} placeholder="VODA_001" value={form.device_id} onChange={(e: any) => setForm({ ...form, device_id: e.target.value })} />
            <Input label={t('description')} placeholder="Device iliyo Dar es Salaam" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
            <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
              ⚠️ Device ID lazima iwe sawa na inayotumwa na A7670 kwenye header ya <code>X-Device-ID</code>
            </div>
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
