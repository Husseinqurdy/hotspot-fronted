import { useEffect, useState } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import {
  Table, Badge, PageHeader, Card, Button, Modal, Input, Select,
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

// ── GLOBAL STYLES (animations + responsive table/card switch) ──
const GLOBAL_STYLES = `
  @keyframes wdFadeUp  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes wdSpin    { to { transform:rotate(360deg) } }
  @keyframes wdPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.35)} 60%{box-shadow:0 0 0 7px rgba(99,102,241,0)} }
  @keyframes wdPop     { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }

  .wd-card-hover { transition: box-shadow 0.2s, transform 0.2s; }
  .wd-card-hover:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1); transform:translateY(-3px); }

  .wd-balance-icon { animation: wdPulse 2.4s ease-in-out infinite; }

  .wd-tr { transition:background 0.12s; animation:wdFadeUp 0.3s ease both; }
  .wd-tr:hover { background:#f8fafc; }

  .wd-table-wrap { display:block; }
  .wd-cards-wrap { display:none; }
  .wd-cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }

  @media (max-width:760px) {
    .wd-table-wrap { display:none !important; }
    .wd-cards-wrap { display:block !important; }
  }

  .wd-filter-btn { transition: all 0.15s; }
  .wd-filter-btn:hover { transform: translateY(-1px); }
`

// ── SVG ICONS (no emoji) ────────────────────────────────────
const Icons = {
  Wallet: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>,
  Send: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  History: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>,
  Inbox: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Spin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'wdSpin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Bank: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="9" y1="21" x2="9" y2="10"/><line x1="15" y1="21" x2="15" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><polygon points="12 3 3 8 21 8 12 3"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l1.09-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  User: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

function StatusBadgeWithNote({ w }: { w: any }) {
  return (
    <div>
      <Badge text={w.status_display} color={statusColor[w.status] || 'gray'} />
      {w.status === 'rejected' && w.admin_note && (
        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{w.admin_note}</div>
      )}
    </div>
  )
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

  const HistoryCard = ({ w, idx }: { w: any; idx: number }) => (
    <div className="wd-card-hover" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', animation: `wdFadeUp 0.3s ease ${idx * 45}ms both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ color: 'var(--primary)' }}><Icons.Bank /></span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{w.network_display}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icons.User /> {w.account_name}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Icons.Phone /> {w.lipa_number}
          </div>
        </div>
        <StatusBadgeWithNote w={w} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
        <strong style={{ color: '#059669', fontSize: 15 }}>TZS {Number(w.amount).toLocaleString()}</strong>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(w.created_at).toLocaleString('sw-TZ')}</span>
      </div>
    </div>
  )

  return (
    <Layout>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ padding: P, maxWidth: 900, margin: '0 auto' }}>
        <PageHeader title={t('withdraw')} subtitle={t('withdraw_page_subtitle')} />
        {alert && <div style={{ marginBottom: '1rem', animation: 'wdFadeUp 0.3s ease' }}><Alert type={alert.type} message={alert.msg} /></div>}

        {/* Balance banner */}
        <div
          className="wd-card-hover"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1a1040 100%)',
            borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
            border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            animation: 'wdFadeUp 0.35s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="wd-balance-icon" style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.Wallet />
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{t('current_balance')}</p>
              {loading || balance === null ? (
                <div style={{ height: 28, width: 120, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
              ) : (
                <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>TZS {balance.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Request form */}
        <Card style={{ padding: '1.25rem', marginBottom: '1.25rem', animation: 'wdFadeUp 0.35s ease 0.05s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ color: 'var(--primary)' }}><Icons.Send /></span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>{t('request_withdrawal')}</h3>
          </div>
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
              <Button onClick={handleSubmit} disabled={saving} loading={saving} icon={!saving && <Icons.Send />}>
                {saving ? t('saving_label') : t('request_withdrawal')}
              </Button>
            </FormActions>
          </div>
        </Card>

        {/* History */}
        <Card style={{ animation: 'wdFadeUp 0.35s ease 0.1s both' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--gray-500)' }}><Icons.History /></span>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>{t('withdrawal_history')}</h3>
          </div>

          <div className="wd-table-wrap">
            <Table
              loading={loading}
              headers={[t('network'), t('account_name'), t('lipa_number'), t('amount'), t('status'), t('created_at')]}
              rows={withdrawals.map(w => [
                <Badge text={w.network_display} color="indigo" />,
                w.account_name,
                w.lipa_number,
                <strong style={{ color: '#059669' }}>TZS {Number(w.amount).toLocaleString()}</strong>,
                <StatusBadgeWithNote w={w} />,
                new Date(w.created_at).toLocaleString('sw-TZ'),
              ])}
              emptyMessage={t('no_withdrawals')}
            />
          </div>

          <div className="wd-cards-wrap" style={{ padding: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}><Icons.Spin /></div>
            ) : withdrawals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Inbox /></div>
                <p style={{ fontSize: 13, margin: 0 }}>{t('no_withdrawals')}</p>
              </div>
            ) : (
              <div className="wd-cards-grid">
                {withdrawals.map((w, idx) => <HistoryCard key={w.id || idx} w={w} idx={idx} />)}
              </div>
            )}
          </div>
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
    { k: '', l: t('all'), c: '#6366f1' },
    { k: 'pending', l: t('pending_status'), c: '#f59e0b', ico: <Icons.Clock /> },
    { k: 'approved', l: t('approved_status'), c: '#10b981', ico: <Icons.Check /> },
    { k: 'rejected', l: t('rejected_status'), c: '#ef4444', ico: <Icons.X /> },
  ]

  const ActionButtons = ({ w }: { w: any }) => (
    w.status === 'pending' ? (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button
          size="sm"
          variant="success"
          disabled={approvingId === w.id}
          loading={approvingId === w.id}
          icon={approvingId !== w.id && <Icons.Check />}
          onClick={() => setShowApproveConfirm(w)}
        >
          {t('approve')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          icon={<Icons.X />}
          onClick={() => { setShowRejectModal(w); setRejectNote('') }}
        >
          {t('reject')}
        </Button>
      </div>
    ) : (
      w.processed_by_name ? (
        <span style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icons.User /> {w.processed_by_name}
        </span>
      ) : null
    )
  )

  const RequestCard = ({ w, idx }: { w: any; idx: number }) => (
    <div className="wd-card-hover" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', animation: `wdFadeUp 0.3s ease ${idx * 45}ms both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.client_name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ color: 'var(--primary)' }}><Icons.Bank /></span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{w.network_display}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Icons.User /> {w.account_name} <span style={{ opacity: 0.4 }}>·</span> <Icons.Phone /> {w.lipa_number}
          </div>
        </div>
        <StatusBadgeWithNote w={w} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: 10, marginBottom: w.status === 'pending' ? 10 : 0 }}>
        <strong style={{ color: '#059669', fontSize: 16 }}>TZS {Number(w.amount).toLocaleString()}</strong>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(w.created_at).toLocaleString('sw-TZ')}</span>
      </div>
      <ActionButtons w={w} />
    </div>
  )

  return (
    <Layout>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ padding: P, maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader title={t('withdrawal_requests')} subtitle={t('withdrawal_requests_subtitle')} />
        {alert && <div style={{ marginBottom: '1rem', animation: 'wdFadeUp 0.3s ease' }}><Alert type={alert.type} message={alert.msg} /></div>}

        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap', animation: 'wdFadeUp 0.3s ease 0.05s both' }}>
          {FILTERS.map(f => (
            <button
              key={f.k}
              className="wd-filter-btn"
              onClick={() => setFilter(f.k)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
                borderColor: filter === f.k ? f.c : 'var(--gray-200)',
                background: filter === f.k ? f.c + '15' : '#fff',
                color: filter === f.k ? f.c : 'var(--gray-600)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {f.ico} {f.l}
            </button>
          ))}
        </div>

        <Card style={{ animation: 'wdFadeUp 0.3s ease 0.1s both' }}>
          <div className="wd-table-wrap">
            <Table
              loading={loading}
              headers={[t('client'), t('network'), t('account_name'), t('lipa_number'), t('amount'), t('status'), t('created_at'), '']}
              rows={requests.map(w => [
                w.client_name,
                <Badge text={w.network_display} color="indigo" />,
                w.account_name,
                w.lipa_number,
                <strong style={{ color: '#059669' }}>TZS {Number(w.amount).toLocaleString()}</strong>,
                <StatusBadgeWithNote w={w} />,
                new Date(w.created_at).toLocaleString('sw-TZ'),
                <ActionButtons w={w} />,
              ])}
              emptyMessage={t('no_withdrawals')}
            />
          </div>

          <div className="wd-cards-wrap" style={{ padding: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}><Icons.Spin /></div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Icons.Inbox /></div>
                <p style={{ fontSize: 13, margin: 0 }}>{t('no_withdrawals')}</p>
              </div>
            ) : (
              <div className="wd-cards-grid">
                {requests.map((w, idx) => <RequestCard key={w.id || idx} w={w} idx={idx} />)}
              </div>
            )}
          </div>
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
