import { useEffect, useState } from 'react'
import api from '../../lib/api'
import Layout from '../../components/Layout'
import { Table, Badge, PageHeader, Card, Button, Modal, Input, Select, Alert, FormRow, FormActions, Tabs, InfoRow, ConfirmDialog } from '../../components/UI'
import { Icons } from '../../components/Icons'
import { useLang } from '../../contexts/LangContext'

const NETWORKS = [
  { value: 'vodacom', label: 'Vodacom M-Pesa' },
  { value: 'tigo', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'halo', label: 'HaloPesa' },
]

const netColor: Record<string, any> = { vodacom: 'green', tigo: 'blue', airtel: 'red', halo: 'yellow' }

function signalBadge(rssi: number | null | undefined) {
  if (rssi === null || rssi === undefined || rssi === 99) return <Badge text="—" color="gray" />
  if (rssi < 10) return <Badge text={`Dhaifu (${rssi})`} color="red" />
  if (rssi < 20) return <Badge text={`Wastani (${rssi})`} color="yellow" />
  return <Badge text={`Nzuri (${rssi})`} color="green" />
}

function batteryBadge(percent: number | null | undefined) {
  if (percent === null || percent === undefined) return <span style={{ color: 'var(--gray-400)' }}>—</span>
  const color = percent < 20 ? '#dc2626' : percent < 50 ? '#d97706' : '#16a34a'
  return <span style={{ fontWeight: 700, color }}>{percent.toFixed(0)}%</span>
}

export default function AdminDevices() {
  const { t } = useLang()
  const [devices, setDevices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'active'>('pending')
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)

  const [claimTarget, setClaimTarget] = useState<any>(null)
  const [claimForm, setClaimForm] = useState({ client: '', name: '', network: 'vodacom', lipa_number: '', phone_number: '', shared_with: [] as number[] })
  const [claiming, setClaiming] = useState(false)

  const [editDevice, setEditDevice] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: '', network: 'vodacom', lipa_number: '', phone_number: '', shared_with: [] as number[], description: '' })
  const [saving, setSaving] = useState(false)

  const [revealedKey, setRevealedKey] = useState<{ device: string; key: string } | null>(null)

  const [confirmCommand, setConfirmCommand] = useState<{ device: any; action: 'restart' | 'sim_reset' } | null>(null)
  const [commandLoading, setCommandLoading] = useState<number | null>(null)

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000) }

  const fetchDevices = (silent = false) => {
    if (!silent) setLoading(true)
    api.get('/devices/').then(r => {
      setDevices(r.data.results || r.data)
      if (!silent) setLoading(false)
    }).catch(() => { if (!silent) setLoading(false) })
  }

  const fetchClients = () => {
    api.get('/clients/').then(r => setClients(r.data.results || r.data)).catch(() => {})
  }

  useEffect(() => {
    fetchDevices()
    fetchClients()
    const interval = setInterval(() => fetchDevices(true), 15000)
    return () => clearInterval(interval)
  }, [])

  const pendingDevices = devices.filter(d => d.status === 'unclaimed')
  const activeDevices = devices.filter(d => d.status === 'active')

  const openClaim = (d: any) => {
    setClaimTarget(d)
    setClaimForm({ client: '', name: '', network: 'vodacom', lipa_number: '', phone_number: '', shared_with: [] })
  }

  const toggleSharedWith = (form: any, setForm: any, clientId: number) => {
    setForm({
      ...form,
      shared_with: form.shared_with.includes(clientId)
        ? form.shared_with.filter((id: number) => id !== clientId)
        : [...form.shared_with, clientId],
    })
  }

  const handleClaim = async () => {
    if (!claimForm.client || !claimForm.name || !claimForm.lipa_number) {
      showAlrt('error', 'Jaza sehemu zote zinazohitajika (Client, Jina, Lipa Namba)')
      return
    }
    setClaiming(true)
    try {
      const { data } = await api.post(`/devices/${claimTarget.id}/claim/`, claimForm)
      showAlrt('success', `Kifaa "${claimForm.name}" kimewekewa client kikamilifu!`)
      setClaimTarget(null)
      if (data.api_key) setRevealedKey({ device: claimForm.name, key: data.api_key })
      fetchDevices()
    } catch (e: any) {
      showAlrt('error', JSON.stringify(e.response?.data || t('error')))
    } finally { setClaiming(false) }
  }

  const openEdit = (d: any) => {
    setEditDevice(d)
    setEditForm({
      name: d.name, network: d.network, lipa_number: d.lipa_number,
      phone_number: d.phone_number, shared_with: d.shared_with || [], description: d.description || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.lipa_number) { showAlrt('error', 'Jaza sehemu zote zinazohitajika'); return }
    setSaving(true)
    try {
      await api.patch(`/devices/${editDevice.id}/`, editForm)
      showAlrt('success', 'Device imesasishwa!')
      setEditDevice(null)
      fetchDevices()
    } catch (e: any) {
      showAlrt('error', JSON.stringify(e.response?.data || t('error')))
    } finally { setSaving(false) }
  }

  const handleToggleActive = async (d: any) => {
    try {
      await api.patch(`/devices/${d.id}/`, { is_active: !d.is_active })
      showAlrt('success', `Device ${d.is_active ? 'imezuiwa' : 'imewashwa'}`)
      fetchDevices()
    } catch { showAlrt('error', t('error')) }
  }

  const handleDelete = async (d: any) => {
    if (!confirm(`Futa kifaa "${d.name || d.device_id}"? Hatua hii haiwezi kurudishwa.`)) return
    try {
      await api.delete(`/devices/${d.id}/`)
      showAlrt('success', 'Imefutwa')
      fetchDevices()
    } catch { showAlrt('error', t('error')) }
  }

  const handleRegenerateKey = async (d: any) => {
    if (!confirm(`Zalisha upya API Key ya "${d.name}"? Key ya zamani itaacha kufanya kazi mara moja.`)) return
    try {
      const { data } = await api.post(`/devices/${d.id}/regenerate-key/`)
      setRevealedKey({ device: d.name, key: data.api_key })
      showAlrt('success', 'API Key mpya imezalishwa')
    } catch { showAlrt('error', t('error')) }
  }

  const runCommand = async () => {
    if (!confirmCommand) return
    const { device, action } = confirmCommand
    setCommandLoading(device.id)
    try {
      await api.post(`/devices/${device.id}/command/`, { action })
      showAlrt('success', action === 'restart'
        ? `Amri ya kuwasha upya "${device.name}" imetumwa.`
        : `Amri ya ku-reset SIM800C ya "${device.name}" imetumwa.`)
    } catch {
      showAlrt('error', t('error'))
    } finally {
      setCommandLoading(null)
      setConfirmCommand(null)
    }
  }

  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: 1200 }}>
        <PageHeader title={t('devices')} subtitle="Simamia vifaa vya GSM (SIM800C) na lipa namba — zero-touch provisioning" />

        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: 14, color: '#1e40af' }}>
          <strong>Jinsi inavyofanya kazi:</strong> Kifaa kipya (ESP32+SIM800C) kinapowashwa mara ya kwanza, kinajitangaza chenyewe na kuonekana chini ya "Vifaa Vipya". Bonyeza "Weka Client" kukiweka mahali pake.
        </div>

        <Tabs
          active={tab}
          onChange={(k) => setTab(k as any)}
          tabs={[
            { key: 'pending', label: `Vifaa Vipya (${pendingDevices.length})` },
            { key: 'active', label: `Vifaa Vilivyowekwa (${activeDevices.length})` },
          ]}
        />

        {tab === 'pending' && (
          <Card>
            <Table
              loading={loading}
              headers={['Factory ID', 'Kimejitangaza', 'Mwisho Kuonekana', '']}
              rows={pendingDevices.map(d => [
                <code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>{d.device_id}</code>,
                d.created_at ? new Date(d.created_at).toLocaleString('sw-TZ') : '—',
                d.last_seen ? new Date(d.last_seen).toLocaleString('sw-TZ') : t('never'),
                <Button size="sm" onClick={() => openClaim(d)} icon={<Icons.CheckCircle size={14} />}>Weka Client</Button>,
              ])}
              emptyMessage="Hakuna vifaa vipya vinavyosubiri. Vitaonekana hapa mara vinapojitangaza."
            />
          </Card>
        )}

        {tab === 'active' && (
          <Card>
            <Table
              loading={loading}
              headers={['Device', 'Mtandao', 'Lipa Namba', 'Client', 'Betri', 'Signal', 'Backup', t('status'), '']}
              rows={activeDevices.map(d => [
                <div>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <code style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.device_id}</code>
                </div>,
                <Badge text={d.network_display} color={netColor[d.network] || 'gray'} />,
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{d.lipa_number}</span>,
                <div>
                  <div>{d.client_name}</div>
                  {d.shared_with_names?.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>+ {d.shared_with_names.join(', ')}</div>
                  )}
                </div>,
                batteryBadge(d.battery_percent),
                signalBadge(d.last_rssi),
                d.on_backup_power ? <Badge text="BACKUP" color="red" /> : <span style={{ color: 'var(--gray-300)' }}>—</span>,
                <Badge text={d.is_active ? t('active') : t('inactive')} color={d.is_active ? 'green' : 'red'} />,
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(d)} icon={<Icons.Pencil size={14} />}>{t('edit')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRegenerateKey(d)} icon={<Icons.Key size={14} />}>Key</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmCommand({ device: d, action: 'restart' })} disabled={commandLoading === d.id} icon={<Icons.RefreshCw size={14} />}>Restart</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmCommand({ device: d, action: 'sim_reset' })} disabled={commandLoading === d.id} icon={<Icons.PowerOff size={14} />}>SIM Reset</Button>
                  <Button size="sm" variant={d.is_active ? 'danger' : 'success'} onClick={() => handleToggleActive(d)} icon={d.is_active ? <Icons.Pause size={14} /> : <Icons.Play size={14} />}>
                    {d.is_active ? t('inactive') : t('active')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(d)} icon={<Icons.Trash2 size={14} />}>Del</Button>
                </div>,
              ])}
              emptyMessage="Hakuna vifaa vilivyowekwa bado."
            />
          </Card>
        )}

        <Modal open={!!claimTarget} onClose={() => setClaimTarget(null)} title="Weka Client kwa Kifaa Kipya" width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              Factory ID: <code>{claimTarget?.device_id}</code>
            </div>
            <Select label="Client *" value={claimForm.client} onChange={(e: any) => setClaimForm({ ...claimForm, client: e.target.value })}>
              <option value="">-- Chagua Client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
            </Select>
            <Input label="Jina la Kifaa *" placeholder="Vodacom Device 1" value={claimForm.name} onChange={(e: any) => setClaimForm({ ...claimForm, name: e.target.value })} />
            <Select label="Mtandao *" value={claimForm.network} onChange={(e: any) => setClaimForm({ ...claimForm, network: e.target.value })}>
              {NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
            <FormRow>
              <Input label={`${t('lipa_number')} *`} placeholder="0744123456" value={claimForm.lipa_number} onChange={(e: any) => setClaimForm({ ...claimForm, lipa_number: e.target.value })} />
              <Input label="Namba ya SIM" placeholder="0744123456" value={claimForm.phone_number} onChange={(e: any) => setClaimForm({ ...claimForm, phone_number: e.target.value })} />
            </FormRow>
            {clients.length > 0 && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
                  Shirikisha na Clients Wengine (hiari)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--gray-100)', borderRadius: 8, padding: 8 }}>
                  {clients.filter(c => String(c.id) !== claimForm.client).map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <input type="checkbox" checked={claimForm.shared_with.includes(c.id)} onChange={() => toggleSharedWith(claimForm, setClaimForm, c.id)} />
                      {c.business_name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <FormActions>
              <Button variant="ghost" onClick={() => setClaimTarget(null)}>{t('cancel')}</Button>
              <Button onClick={handleClaim} disabled={claiming}>{claiming ? t('loading') : 'Weka Client'}</Button>
            </FormActions>
          </div>
        </Modal>

        <Modal open={!!editDevice} onClose={() => setEditDevice(null)} title={`${t('edit')} ${editDevice?.name || ''}`} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label={`${t('device_name')} *`} value={editForm.name} onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value })} />
            <Select label="Mtandao *" value={editForm.network} onChange={(e: any) => setEditForm({ ...editForm, network: e.target.value })}>
              {NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
            <FormRow>
              <Input label={`${t('lipa_number')} *`} value={editForm.lipa_number} onChange={(e: any) => setEditForm({ ...editForm, lipa_number: e.target.value })} />
              <Input label="Namba ya SIM" value={editForm.phone_number} onChange={(e: any) => setEditForm({ ...editForm, phone_number: e.target.value })} />
            </FormRow>
            <Input label={t('description')} value={editForm.description} onChange={(e: any) => setEditForm({ ...editForm, description: e.target.value })} />
            {clients.length > 0 && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
                  Shirikisha na Clients Wengine
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--gray-100)', borderRadius: 8, padding: 8 }}>
                  {clients.filter(c => c.id !== editDevice?.client).map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <input type="checkbox" checked={editForm.shared_with.includes(c.id)} onChange={() => toggleSharedWith(editForm, setEditForm, c.id)} />
                      {c.business_name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <FormActions>
              <Button variant="ghost" onClick={() => setEditDevice(null)}>{t('cancel')}</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>{saving ? t('loading') : t('save_device')}</Button>
            </FormActions>
          </div>
        </Modal>

        <Modal open={!!revealedKey} onClose={() => setRevealedKey(null)} title="API Key Imetengenezwa" width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
              Hii ndiyo mara pekee key hii itaonyeshwa kikamilifu. Kifaa kitaipata chenyewe kwenye checkin inayofuata — hakuna haja ya kuiweka kwa mkono.
            </div>
            <InfoRow label="Kifaa" value={revealedKey?.device || ''} />
            <InfoRow label="API Key" value={revealedKey?.key || ''} />
            <FormActions>
              <Button onClick={() => setRevealedKey(null)}>Nimeelewa</Button>
            </FormActions>
          </div>
        </Modal>

        <ConfirmDialog
          open={!!confirmCommand}
          onClose={() => setConfirmCommand(null)}
          onConfirm={runCommand}
          danger={confirmCommand?.action === 'sim_reset'}
          title={confirmCommand?.action === 'restart' ? 'Washa Upya Kifaa?' : 'Reset SIM800C?'}
          message={
            confirmCommand?.action === 'restart'
              ? `Kifaa "${confirmCommand?.device?.name}" kitawashwa upya (soft restart).`
              : `SIM800C ya "${confirmCommand?.device?.name}" itakatiwa umeme kabisa kisha kurudishiwa (hard power-cycle).`
          }
        />
      </div>
    </Layout>
  )
}
