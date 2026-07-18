import { useEffect, useState } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import {
  StatCard, Table, Badge, PageHeader, Card, Button, Modal, Input, Select,
  Alert, FormRow, FormActions, ConfirmDialog,
} from '../components/UI'
import { useLang } from '../contexts/LangContext'

const P = '1.25rem'

const NETWORKS = [
  { value: 'vodacom', label: 'Vodacom M-Pesa' },
  { value: 'tigo', label: 'Tigo Pesa' },
  { value: 'airtel', label: 'Airtel Money' },
  { value: 'halo', label: 'HaloPesa' },
]

const statusColor: Record<string, 'yellow' | 'green' | 'red' | 'gray'> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
}

function useAlert() {
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const show = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }
  return { alert, show }
}

// ── CLIENT: Withdraw ──────────────────────────────────────
export function ClientWithdraw() {
  const { t } = useLang()
  const { alert, show } = useAlert()
  const [balance, setBalance] = useState<number | null>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ network: 'vodacom', account_name: '', lipa_number: '', amount: '' })

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/dashboard/client/'),
      api.get('/payments/withdrawals/'),
    ]).then(([d, w]) => {
      setBalance(Number(d.data?.client?.balance || 0))
      setWithdrawals(w.data.results || w.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const resetForm = () => setForm({ network: 'vodacom', account_name: '', lipa_number: '', amount: '' })

  const handleSubmit = async () => {
    if (!form.account_name || !form.lipa_number || !form.amount) {
      show('error', t('fill_required'))
      return
    }
    setSaving(true)
    try {
      await api.post('/payments/withdrawals/', form)
      show('success', t('withdrawal_requested_success'))
      resetForm()
      fetchAll()
    } catch (e: any) {
      const err = e.response?.data
      const msg = typeof err === 'object'
        ? Object.values(err).flat().join(', ')
        : t('error')
      show('error', msg || t('error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 900, margin: '0 auto' }}>
        <PageHeader title={t('withdraw')} subtitle={t('withdraw_page_subtitle')} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard
            title={t('current_balance')}
            value={loading || balance === null ? '—' : `TZS ${balance.toLocaleString()}`}
            icon="💰"
            color="#059669"
          />
        </div>

        <Card style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 14 }}>{t('request_withdrawal')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select label={`${t('network')} *`} value={form.network} onChange={(e: any) => setForm({ ...form, network: e.target.value })}>
              {NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
            <FormRow>
              <Input
                label={`${t('account_name')} *`}
                placeholder="Juma Hassan"
                value={form.account_name}
                onChange={(e: any) => setForm({ ...form, account_name: e.target.value })}
              />
              <Input
                label={`${t('lipa_number')} *`}
                placeholder="0712345678"
                value={form.lipa_number}
                onChange={(e: any) => setForm({ ...form, lipa_number: e.target.value })}
              />
            </FormRow>
            <Input
              label={`${t('amount')} (TZS) *`}
              type="number"
              placeholder="50000"
              value={form.amount}
              onChange={(e: any) => setForm({ ...form, amount: e.target.value })}
            />
            <FormActions>
              <Button onClick={handleSubmit} disabled={saving} loading={saving}>
                {saving ? t('saving_label') : t('request_withdrawal')}
              </Button>
            </FormActions>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>{t('withdrawal_history')}</h3>
          </div>
          <Table
            loading={loading}
            headers={[t('network'), t('account_name'), t('lipa_number'), t('amount'), t('status'), t('created_at')]}
            rows={withdrawals.map(w => [
              <Badge text={w.network_display} color="indigo" />,
              w.account_name,
              w.lipa_number,
              <strong style={{ color: '#059669' }}>TZS {Number(w.amount).toLocaleString()}</strong>,
              <div>
                <Badge text={w.status_display} color={statusColor[w.status] || 'gray'} />
                {w.status === 'rejected' && w.admin_note && (
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{w.admin_note}</div>
                )}
              </div>,
              new Date(w.created_at).toLocaleString('sw-TZ'),
            ])}
            emptyMessage={t('no_withdrawals')}
          />
        </Card>
      </div>
    </Layout>
  )
}

// ── ADMIN: Withdrawal Requests ────────────────────────────
export function AdminWithdrawalRequests() {
  const { t } = useLang()
  const { alert, show } = useAlert()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState<any>(null)
  const [showRejectModal, setShowRejectModal] = useState<any>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const fetchRequests = () => {
    setLoading(true)
    const url = filter ? `/payments/withdrawals/?status=${filter}` : '/payments/withdrawals/'
    api.get(url).then(r => { setRequests(r.data.results || r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [filter])

  const handleApprove = async () => {
    if (!showApproveConfirm) return
    setApprovingId(showApproveConfirm.id)
    try {
      await api.post(`/payments/withdrawals/${showApproveConfirm.id}/approve/`)
      show('success', t('withdrawal_approved_success'))
      fetchRequests()
    } catch (e: any) {
      show('error', e.response?.data?.error || t('error'))
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async () => {
    if (!showRejectModal) return
    setRejecting(true)
    try {
      await api.post(`/payments/withdrawals/${showRejectModal.id}/reject/`, { note: rejectNote })
      show('success', t('withdrawal_rejected_success'))
      setShowRejectModal(null)
      setRejectNote('')
      fetchRequests()
    } catch (e: any) {
      show('error', e.response?.data?.error || t('error'))
    } finally {
      setRejecting(false)
    }
  }

  const FILTERS = [
    { k: '', l: t('all') },
    { k: 'pending', l: t('pending_status') },
    { k: 'approved', l: t('approved_status') },
    { k: 'rejected', l: t('rejected_status') },
  ]

  return (
    <Layout>
      <div style={{ padding: P, maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={t('withdrawal_requests')} subtitle={t('withdrawal_requests_subtitle')} />
        {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
                borderColor: filter === f.k ? 'var(--primary)' : 'var(--gray-200)',
                background: filter === f.k ? 'var(--primary)15' : '#fff',
                color: filter === f.k ? 'var(--primary)' : 'var(--gray-600)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {f.l}
            </button>
          ))}
        </div>

        <Card>
          <Table
            loading={loading}
            headers={[t('client'), t('network'), t('account_name'), t('lipa_number'), t('amount'), t('status'), t('created_at'), '']}
            rows={requests.map(w => [
              w.client_name,
              <Badge text={w.network_display} color="indigo" />,
              w.account_name,
              w.lipa_number,
              <strong style={{ color: '#059669' }}>TZS {Number(w.amount).toLocaleString()}</strong>,
              <div>
                <Badge text={w.status_display} color={statusColor[w.status] || 'gray'} />
                {w.status === 'rejected' && w.admin_note && (
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{w.admin_note}</div>
                )}
              </div>,
              new Date(w.created_at).toLocaleString('sw-TZ'),
              w.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button
                    size="sm"
                    variant="success"
                    disabled={approvingId === w.id}
                    loading={approvingId === w.id}
                    onClick={() => setShowApproveConfirm(w)}
                  >
                    {t('approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => { setShowRejectModal(w); setRejectNote('') }}
                  >
                    {t('reject')}
                  </Button>
                </div>
              ) : (
                w.processed_by_name ? (
                  <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{w.processed_by_name}</span>
                ) : null
              ),
            ])}
            emptyMessage={t('no_withdrawals')}
          />
        </Card>

        <ConfirmDialog
          open={!!showApproveConfirm}
          onClose={() => setShowApproveConfirm(null)}
          onConfirm={handleApprove}
          title={t('approve_withdrawal_title')}
          message={
            showApproveConfirm
              ? `${t('approve_withdrawal_message_prefix')} ${showApproveConfirm.client_name} — TZS ${Number(showApproveConfirm.amount).toLocaleString()}?`
              : ''
          }
        />

        <Modal open={!!showRejectModal} onClose={() => setShowRejectModal(null)} title={t('reject_withdrawal_title')} width={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>
              {showRejectModal ? `${showRejectModal.client_name} — TZS ${Number(showRejectModal.amount).toLocaleString()}` : ''}
            </p>
            <Input
              label={t('reject_reason_prompt')}
              placeholder={t('reject_reason_placeholder')}
              value={rejectNote}
              onChange={(e: any) => setRejectNote(e.target.value)}
            />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowRejectModal(null)} disabled={rejecting}>{t('cancel')}</Button>
              <Button variant="danger" onClick={handleReject} disabled={rejecting} loading={rejecting}>
                {rejecting ? t('saving_label') : t('reject')}
              </Button>
            </FormActions>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
