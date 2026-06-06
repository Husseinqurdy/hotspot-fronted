import { useEffect, useState, useRef } from 'react'
import api from '../lib/api'
import Layout from '../components/Layout'
import { Card, CardHeader, Badge, Button, Table, Alert, Tabs, Spinner, ConfirmDialog, Input, FormActions, PageHeader } from '../components/UI'
import { useLang } from '../contexts/LangContext'

type Tab =
  | 'servers'
  | 'server_profiles'
  | 'users'
  | 'active'
  | 'hosts'
  | 'ip_bindings'
  | 'walled_garden'
  | 'walled_garden_ip'
  | 'cookies'
  | 'scheduler'

const ENDPOINTS: Record<Tab, string> = {
  servers:          'hotspot/servers/',
  server_profiles:  'hotspot/profiles/',
  users:            'hotspot/users/',
  active:           'hotspot/sessions/',
  hosts:            'hotspot/hosts/',
  ip_bindings:      'hotspot/ip-bindings/',
  walled_garden:    'hotspot/walled-garden/',
  walled_garden_ip: 'hotspot/walled-garden-ip/',
  cookies:          'hotspot/cookies/',
  scheduler:        'scheduler/',
}

const ALL_TABS = [
  { key: 'servers',          label: 'Servers',           icon: '🖥' },
  { key: 'server_profiles',  label: 'Server Profiles',   icon: '📋' },
  { key: 'users',            label: 'Users',             icon: '👤' },
  { key: 'active',           label: 'Active',            icon: '🟢' },
  { key: 'hosts',            label: 'Hosts',             icon: '💻' },
  { key: 'ip_bindings',      label: 'IP Bindings',       icon: '🔗' },
  { key: 'walled_garden',    label: 'Walled Garden',     icon: '🌐' },
  { key: 'walled_garden_ip', label: 'Walled Garden IP',  icon: '🌍' },
  { key: 'cookies',          label: 'Cookies',           icon: '🍪' },
  { key: 'scheduler',        label: 'Scheduler',         icon: '⏰' },
] as const

// ── DETAIL ROW: read-only ─────────────────────────────────
function DetailRow({ label, value, mono = false, full = false }: {
  label: string; value: any; mono?: boolean; full?: boolean
}) {
  if (!value && value !== 0 && value !== false) return null
  return (
    <div style={{
      display: 'flex',
      flexDirection: full ? 'column' : 'row',
      justifyContent: full ? undefined : 'space-between',
      alignItems: full ? 'flex-start' : 'flex-start',
      padding: '8px 0',
      borderBottom: '1px solid var(--gray-50)',
      gap: full ? 4 : 8,
    }}>
      <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, minWidth: full ? undefined : 140, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, color: 'var(--gray-800)', fontFamily: mono ? 'monospace' : undefined,
        wordBreak: 'break-all', textAlign: full ? 'left' : 'right',
      }}>
        {value}
      </span>
    </div>
  )
}

// ── EDIT ROW: field inayoweza kubadilika ──────────────────
function EditRow({ label, name, value, onChange, mono = false, type = 'text', placeholder = '' }: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  mono?: boolean
  type?: string
  placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{
          padding: '7px 10px',
          border: '1.5px solid var(--gray-200)',
          borderRadius: 7,
          fontSize: 13,
          fontFamily: mono ? 'monospace' : undefined,
          outline: 'none',
          color: 'var(--gray-800)',
          background: '#fff',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
        onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
      />
    </div>
  )
}

// ── EDIT SELECT ROW ───────────────────────────────────────
function EditSelectRow({ label, name, value, options, onChange }: {
  label: string
  name: string
  value: string
  options: { value: string; label: string }[]
  onChange: (name: string, value: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={e => onChange(name, e.target.value)}
        style={{
          padding: '7px 10px',
          border: '1.5px solid var(--gray-200)',
          borderRadius: 7,
          fontSize: 13,
          outline: 'none',
          color: 'var(--gray-800)',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── EDIT TEXTAREA ROW ─────────────────────────────────────
function EditTextareaRow({ label, name, value, onChange, placeholder = '', minHeight = 100 }: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  minHeight?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <textarea
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{
          padding: '8px 10px',
          border: '1.5px solid var(--gray-200)',
          borderRadius: 7,
          fontSize: 12,
          fontFamily: 'monospace',
          outline: 'none',
          color: 'var(--gray-800)',
          background: '#fff',
          resize: 'vertical',
          minHeight,
          lineHeight: 1.6,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
        onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
      />
    </div>
  )
}

// ── TABS za detail window ─────────────────────────────────
function DetailTabs({ tabs, active, onChange }: {
  tabs: { key: string; label: string }[]
  active: string
  onChange: (k: string) => void
}) {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid var(--gray-100)', marginBottom: '1rem' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{
            padding: '8px 16px', border: 'none', background: 'none',
            fontSize: 13, fontWeight: active === t.key ? 700 : 500,
            color: active === t.key ? 'var(--primary)' : 'var(--gray-500)',
            borderBottom: active === t.key ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: -2, cursor: 'pointer', transition: 'all 0.15s',
          }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── EDIT MODE TOGGLE button ───────────────────────────────
function EditModeToggle({ editing, onToggle }: { editing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '4px 10px',
        borderRadius: 7,
        border: `1.5px solid ${editing ? 'var(--primary)' : 'var(--gray-200)'}`,
        background: editing ? 'var(--primary-light)' : '#fff',
        color: editing ? 'var(--primary-dark)' : 'var(--gray-500)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.15s',
      }}
    >
      {editing ? '👁 View' : '✏️ Edit'}
    </button>
  )
}

// ════════════════════════════════════════════════════════
// DETAIL MODAL: Server Profile — tabs: General, Scripts
// ════════════════════════════════════════════════════════
function ServerProfileDetailModal({ profile, routerId, onClose, onSaved }: {
  profile: any
  routerId: number
  onClose: () => void
  onSaved: () => void
}) {
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ ...profile })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setDirty(true)
  }

  const handleApply = async () => {
    setSaving(true)
    try {
      await api.patch(`/mikrotik/${routerId}/hotspot/profiles/`, {
        profile_name: profile.name,
        ...form,
      })
      setAlert({ type: 'success', msg: 'Profile imesasishwa ✓' })
      setDirty(false)
      onSaved()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.error || 'Imeshindwa kuhifadhi' })
    } finally {
      setSaving(false)
    }
  }

  const handleOK = async () => {
    if (dirty) await handleApply()
    onClose()
  }

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'scripts', label: 'Scripts' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 14, maxWidth: 520, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>

        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>📋 Hotspot User Profile</div>
            <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{profile.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
            <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        </div>

        {/* Alert */}
        {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {activeTab === 'general' && (
            editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <EditRow label="Name" name="name" value={form.name} onChange={handleChange} mono />
                <EditRow label="Rate Limit" name="rate-limit" value={form['rate-limit']} onChange={handleChange} mono placeholder="e.g. 2M/2M" />
                <EditRow label="Session Timeout" name="session-timeout" value={form['session-timeout']} onChange={handleChange} placeholder="e.g. 1h / unlimited" />
                <EditRow label="Idle Timeout" name="idle-timeout" value={form['idle-timeout']} onChange={handleChange} placeholder="e.g. 30m / unlimited" />
                <EditRow label="Keepalive Timeout" name="keepalive-timeout" value={form['keepalive-timeout']} onChange={handleChange} />
                <EditRow label="Shared Users" name="shared-users" value={form['shared-users']} onChange={handleChange} type="number" placeholder="1" />
                <EditRow label="DNS Name" name="dns-name" value={form['dns-name']} onChange={handleChange} />
                <EditRow label="HTML Directory" name="html-directory" value={form['html-directory']} onChange={handleChange} mono />
                <EditRow label="HTTP Cookie Lifetime" name="http-cookie-lifetime" value={form['http-cookie-lifetime']} onChange={handleChange} />
                <EditRow label="Status Auto-Refresh" name="status-autorefresh" value={form['status-autorefresh']} onChange={handleChange} />
                <EditRow label="Address Pool" name="address-pool" value={form['address-pool']} onChange={handleChange} />
                <EditRow label="MAC Cookie Timeout" name="mac-cookie-timeout" value={form['mac-cookie-timeout']} onChange={handleChange} />
              </div>
            ) : (
              <div>
                <DetailRow label="Name" value={form.name} mono />
                <DetailRow label="Rate Limit" value={form['rate-limit'] || 'unlimited'} mono />
                <DetailRow label="Session Timeout" value={form['session-timeout'] || 'unlimited'} />
                <DetailRow label="Idle Timeout" value={form['idle-timeout'] || 'unlimited'} />
                <DetailRow label="Keepalive Timeout" value={form['keepalive-timeout'] || '—'} />
                <DetailRow label="Shared Users" value={form['shared-users'] || '1'} />
                <DetailRow label="DNS Name" value={form['dns-name'] || '—'} />
                <DetailRow label="HTML Directory" value={form['html-directory'] || '—'} mono />
                <DetailRow label="HTTP Cookie Lifetime" value={form['http-cookie-lifetime'] || '—'} />
                <DetailRow label="Status Auto-Refresh" value={form['status-autorefresh'] || '—'} />
                <DetailRow label="Transparent Proxy" value={form['transparent-proxy'] || '—'} />
                <DetailRow label="Address Pool" value={form['address-pool'] || '—'} />
                <DetailRow label="MAC Cookie Timeout" value={form['mac-cookie-timeout'] || '—'} />
              </div>
            )
          )}

          {activeTab === 'scripts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'On Login', key: 'on-login' },
                { label: 'On Logout', key: 'on-logout' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>{label}</div>
                  {editing ? (
                    <EditTextareaRow
                      label={label}
                      name={key}
                      value={form[key] || ''}
                      onChange={handleChange}
                      placeholder={`# Script ya ${label.toLowerCase()}\n# Mfano: :log info "User ameingia"`}
                      minHeight={120}
                    />
                  ) : (
                    form[key] ? (
                      <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '10px 14px' }}>
                        <pre style={{ fontSize: 12, color: '#e0e7ff', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                          {form[key]}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>
                        Hakuna script
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {editing && dirty && (
            <Button variant="ghost" onClick={handleApply} disabled={saving}>
              {saving ? <Spinner size={14} /> : '💾 Apply'}
            </Button>
          )}
          <Button onClick={handleOK} disabled={saving}>
            {saving ? <Spinner size={14} /> : 'OK'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// DETAIL MODAL: User — tabs: General, Statistics
// ════════════════════════════════════════════════════════
function UserDetailModal({ user, routerId, onClose, onDelete, onSaved, availableProfiles = [] }: {
  user: any
  routerId: number
  onClose: () => void
  onDelete: (username: string) => void
  onSaved: () => void
  availableProfiles?: string[]
}) {
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ ...user })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setDirty(true)
  }

  const handleApply = async () => {
    setSaving(true)
    try {
      await api.patch(`/mikrotik/${routerId}/hotspot/users/`, {
        username: user.name,
        ...form,
      })
      setAlert({ type: 'success', msg: 'User imesasishwa ✓' })
      setDirty(false)
      onSaved()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.error || 'Imeshindwa kuhifadhi' })
    } finally {
      setSaving(false)
    }
  }

  const handleOK = async () => {
    if (dirty) await handleApply()
    onClose()
  }

  const tabs = [
    { key: 'general',    label: 'General' },
    { key: 'statistics', label: 'Statistics' },
  ]

  const profileOptions = availableProfiles.length > 0
    ? availableProfiles.map(p => ({ value: p, label: p }))
    : [{ value: form.profile || 'default', label: form.profile || 'default' }]

  const disabledOptions = [
    { value: 'false', label: 'Active — mtumiaji anaweza kuingia' },
    { value: 'true',  label: 'Disabled — mtumiaji amezuiwa' },
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>

          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>👤 Hotspot User</div>
              <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>{user.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
              <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          </div>

          {/* Alert */}
          {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'general' && (
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Name: read-only hata katika edit mode */}
                  <div style={{ padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Name</div>
                    <div style={{ padding: '7px 10px', background: 'var(--gray-50)', borderRadius: 7, fontSize: 13, fontFamily: 'monospace', color: 'var(--gray-500)', border: '1.5px solid var(--gray-100)' }}>
                      {form.name} <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>(haiwezi kubadilika)</span>
                    </div>
                  </div>
                  <EditRow label="Password" name="password" value={form.password || ''} onChange={handleChange} mono placeholder="Weka password mpya" />
                  <EditSelectRow label="Profile" name="profile" value={form.profile || 'default'} options={profileOptions} onChange={handleChange} />
                  <EditRow label="Comment" name="comment" value={form.comment || ''} onChange={handleChange} placeholder="Jina la mteja au maelezo" />
                  <EditRow label="Limit Uptime" name="limit-uptime" value={form['limit-uptime'] || ''} onChange={handleChange} placeholder="e.g. 1h / unlimited" />
                  <EditRow label="Limit Bytes In" name="limit-bytes-in" value={form['limit-bytes-in'] || ''} onChange={handleChange} placeholder="bytes (0 = unlimited)" />
                  <EditRow label="Limit Bytes Out" name="limit-bytes-out" value={form['limit-bytes-out'] || ''} onChange={handleChange} placeholder="bytes (0 = unlimited)" />
                  <EditRow label="Limit Bytes Total" name="limit-bytes-total" value={form['limit-bytes-total'] || ''} onChange={handleChange} placeholder="bytes (0 = unlimited)" />
                  <EditRow label="MAC Address" name="mac-address" value={form['mac-address'] || ''} onChange={handleChange} mono placeholder="AA:BB:CC:DD:EE:FF" />
                  <EditRow label="IP Address" name="address" value={form.address || ''} onChange={handleChange} mono placeholder="192.168.1.100" />
                  <EditSelectRow label="Disabled" name="disabled" value={form.disabled || 'false'} options={disabledOptions} onChange={handleChange} />
                </div>
              ) : (
                <div>
                  <DetailRow label="Name" value={user.name} mono />
                  <DetailRow label="Password" value={user.password || '(hidden)'} mono />
                  <DetailRow label="Profile" value={<Badge text={form.profile || 'default'} color="indigo" />} />
                  <DetailRow label="Comment" value={form.comment || '—'} />
                  <DetailRow label="Limit Uptime" value={form['limit-uptime'] || 'unlimited'} />
                  <DetailRow label="Limit Bytes In" value={form['limit-bytes-in'] || 'unlimited'} />
                  <DetailRow label="Limit Bytes Out" value={form['limit-bytes-out'] || 'unlimited'} />
                  <DetailRow label="Limit Bytes Total" value={form['limit-bytes-total'] || 'unlimited'} />
                  <DetailRow label="MAC Address" value={form['mac-address'] || '—'} mono />
                  <DetailRow label="IP Address" value={form.address || '—'} mono />
                  <DetailRow label="Disabled" value={
                    <Badge
                      text={form.disabled === 'true' ? 'Yes' : 'No'}
                      color={form.disabled === 'true' ? 'red' : 'green'}
                    />
                  } />
                </div>
              )
            )}

            {activeTab === 'statistics' && (
              <div>
                <DetailRow label="Uptime" value={user.uptime || '—'} />
                <DetailRow label="Bytes In" value={user['bytes-in'] ? `${Number(user['bytes-in']).toLocaleString()} B` : '—'} />
                <DetailRow label="Bytes Out" value={user['bytes-out'] ? `${Number(user['bytes-out']).toLocaleString()} B` : '—'} />
                <DetailRow label="Packets In" value={user['packets-in'] || '—'} />
                <DetailRow label="Packets Out" value={user['packets-out'] || '—'} />
                <DetailRow label="Last Logged In" value={user['last-logged-in'] || '—'} />
                {(!user.uptime && !user['bytes-in']) && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)', fontSize: 13 }}>
                    Hakuna statistics — user hajawahi kuingia
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon="🗑">Remove</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              {editing && dirty && (
                <Button variant="ghost" onClick={handleApply} disabled={saving}>
                  {saving ? <Spinner size={14} /> : '💾 Apply'}
                </Button>
              )}
              <Button onClick={handleOK} disabled={saving}>
                {saving ? <Spinner size={14} /> : 'OK'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(user.name); setConfirmDelete(false); onClose() }}
        title="Futa User"
        message={`Futa user "${user.name}"? Hatua hii haiwezi kurudishwa!`}
        danger
      />
    </>
  )
}

// ════════════════════════════════════════════════════════
// DETAIL MODAL: Scheduler — tabs: General, Script
// ════════════════════════════════════════════════════════
function SchedulerDetailModal({ scheduler, routerId, onClose, onSaved, onDelete, onToggle }: {
  scheduler: any
  routerId: number
  onClose: () => void
  onSaved: () => void
  onDelete: (id: string) => void
  onToggle: (s: any) => void
}) {
  const [activeTab, setActiveTab] = useState('general')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ ...scheduler })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isDisabled = form.disabled === 'true'

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setDirty(true)
  }

  const handleApply = async () => {
    setSaving(true)
    try {
      await api.patch(`/mikrotik/${routerId}/scheduler/`, {
        scheduler_id: scheduler['.id'],
        name: form.name,
        'start-date': form['start-date'],
        'start-time': form['start-time'],
        interval: form.interval,
        'on-event': form['on-event'],
        policy: form.policy,
        comment: form.comment,
        disabled: form.disabled,
      })
      setAlert({ type: 'success', msg: 'Scheduler imesasishwa ✓' })
      setDirty(false)
      onSaved()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.error || 'Imeshindwa kuhifadhi' })
    } finally {
      setSaving(false)
    }
  }

  const handleOK = async () => {
    if (dirty) await handleApply()
    onClose()
  }

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'script',  label: 'Script' },
  ]

  const policyOptions = [
    { value: 'read,write,reboot',               label: 'read, write, reboot' },
    { value: 'read,write',                       label: 'read, write' },
    { value: 'read,write,reboot,policy,sensitive', label: 'Full' },
    { value: 'read',                             label: 'read only' },
  ]

  const intervalPresets = [
    { l: 'Mara moja', v: '00:00:00' },
    { l: 'Kila dakika', v: '00:01:00' },
    { l: 'Kila saa', v: '01:00:00' },
    { l: 'Kila saa 6', v: '06:00:00' },
    { l: 'Kila siku', v: '1d 00:00:00' },
    { l: 'Kila wiki', v: '7d 00:00:00' },
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: 14, maxWidth: 540, width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>

          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>⏰ Scheduler</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{scheduler.name}</span>
                <Badge text={isDisabled ? 'Disabled' : 'Running'} color={isDisabled ? 'red' : 'green'} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <EditModeToggle editing={editing} onToggle={() => setEditing(e => !e)} />
              <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          </div>

          {/* Alert */}
          {alert && <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem', flexShrink: 0 }}><Alert type={alert.type} message={alert.msg} /></div>}

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            <DetailTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'general' && (
              editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <EditRow label="Name" name="name" value={form.name} onChange={handleChange} mono />
                  <EditRow label="Comment" name="comment" value={form.comment || ''} onChange={handleChange} placeholder="Maelezo ya scheduler" />
                  <EditRow label="Start Date" name="start-date" value={form['start-date'] || ''} onChange={handleChange} placeholder="jan/01/1970" mono />
                  <EditRow label="Start Time" name="start-time" value={form['start-time'] || ''} onChange={handleChange} placeholder="00:00:00" mono />
                  {/* Interval + presets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interval</label>
                    <input
                      value={form.interval || ''}
                      onChange={e => handleChange('interval', e.target.value)}
                      placeholder="00:00:00"
                      style={{ padding: '7px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 7, fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--gray-200)')}
                    />
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
                      {intervalPresets.map(p => (
                        <button key={p.v} onClick={() => handleChange('interval', p.v)}
                          style={{
                            padding: '3px 8px', borderRadius: 6, border: '1px solid',
                            borderColor: form.interval === p.v ? 'var(--primary)' : 'var(--gray-200)',
                            background: form.interval === p.v ? 'var(--primary-light)' : '#fff',
                            color: form.interval === p.v ? 'var(--primary-dark)' : 'var(--gray-600)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>
                          {p.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <EditSelectRow label="Policy" name="policy" value={form.policy || 'read,write,reboot'} options={policyOptions} onChange={handleChange} />
                  <EditSelectRow
                    label="Status"
                    name="disabled"
                    value={form.disabled || 'false'}
                    options={[
                      { value: 'false', label: '▶ Enabled — inafanya kazi' },
                      { value: 'true',  label: '⏸ Disabled — imesimamishwa' },
                    ]}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div>
                  <DetailRow label="Name" value={scheduler.name} mono />
                  <DetailRow label="Comment" value={form.comment || '—'} />
                  <DetailRow label="Start Date" value={form['start-date'] || '—'} />
                  <DetailRow label="Start Time" value={form['start-time'] || '—'} mono />
                  <DetailRow label="Interval" value={form.interval || 'once'} mono />
                  <DetailRow label="Policy" value={form.policy || '—'} />
                  <DetailRow label="Run Count" value={
                    <span style={{ fontWeight: 700, color: (scheduler['run-count'] || 0) > 0 ? '#059669' : 'var(--gray-400)' }}>
                      {scheduler['run-count'] || '0'}
                    </span>
                  } />
                  <DetailRow label="Next Run" value={scheduler['next-run'] || '—'} />
                  <DetailRow label="Status" value={
                    <Badge text={isDisabled ? 'Disabled' : 'Running'} color={isDisabled ? 'red' : 'green'} />
                  } />
                </div>
              )
            )}

            {activeTab === 'script' && (
              <div>
                {editing ? (
                  <>
                    <EditTextareaRow
                      label="On Event Script"
                      name="on-event"
                      value={form['on-event'] || ''}
                      onChange={handleChange}
                      placeholder={`# Script ya scheduler\n# Mfano:\n/ip hotspot user remove [find comment~"Batch" uptime>1h]`}
                      minHeight={180}
                    />
                    {/* Quick examples */}
                    <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '8px 12px', marginTop: 8, fontSize: 11, color: '#a5b4fc' }}>
                      💡 Mifano ya haraka:
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[
                          { l: 'Log message',    v: ':log info "Scheduler imefanya kazi"' },
                          { l: 'Futa used users', v: '/ip hotspot user remove [find comment~"used"]' },
                          { l: 'Reboot router',  v: '/system reboot' },
                        ].map((ex, i) => (
                          <button key={i}
                            onClick={() => handleChange('on-event', ex.v)}
                            style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#e0e7ff', fontSize: 11 }}>
                            <span style={{ color: '#818cf8' }}>{ex.l}:</span> <code>{ex.v}</code>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>On Event Script</div>
                    {form['on-event'] ? (
                      <div style={{ background: '#1e1b4b', borderRadius: 10, padding: '14px 16px' }}>
                        <pre style={{ fontSize: 13, color: '#e0e7ff', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.6 }}>
                          {form['on-event']}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>
                        Hakuna script
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} icon="🗑">Remove</Button>
              <Button
                variant={isDisabled ? 'success' : 'warning'}
                size="sm"
                onClick={() => { onToggle(scheduler); onClose() }}
              >
                {isDisabled ? '▶ Enable' : '⏸ Disable'}
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              {editing && dirty && (
                <Button variant="ghost" onClick={handleApply} disabled={saving}>
                  {saving ? <Spinner size={14} /> : '💾 Apply'}
                </Button>
              )}
              <Button onClick={handleOK} disabled={saving}>
                {saving ? <Spinner size={14} /> : 'OK'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(scheduler['.id']); setConfirmDelete(false); onClose() }}
        title="Futa Scheduler"
        message={`Futa scheduler "${scheduler.name}"? Script haitatekelezwa tena.`}
        danger
      />
    </>
  )
}

function MikroTikManager({ routerId, allowedTabs }: { routerId: number; allowedTabs: Tab[] }) {
  const { t } = useLang()

  const visibleTabs = ALL_TABS.filter(t => allowedTabs.includes(t.key as Tab))

  const [tab, setTab] = useState<Tab>(
    visibleTabs.length > 0 ? visibleTabs[0].key as Tab : 'servers'
  )
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const intervalRef = useRef<any>(null)

  // ── Detail modals state ───────────────────────────────
  const [selectedProfile,   setSelectedProfile]   = useState<any>(null)
  const [selectedUser,      setSelectedUser]       = useState<any>(null)
  const [selectedScheduler, setSelectedScheduler] = useState<any>(null)

  const [confirmDisconnect, setConfirmDisconnect]           = useState<string | null>(null)
  const [confirmDeleteUser, setConfirmDeleteUser]           = useState<string | null>(null)
  const [confirmDeleteBinding, setConfirmDeleteBinding]     = useState<string | null>(null)
  const [confirmDeleteWG, setConfirmDeleteWG]               = useState<string | null>(null)
  const [confirmDeleteWGIP, setConfirmDeleteWGIP]           = useState<string | null>(null)
  const [confirmDeleteCookie, setConfirmDeleteCookie]       = useState<string | null>(null)
  const [confirmClearCookies, setConfirmClearCookies]       = useState(false)
  const [confirmDeleteScheduler, setConfirmDeleteScheduler] = useState<string | null>(null)

  const [showAddUser, setShowAddUser]             = useState(false)
  const [profilesLoading, setProfilesLoading]     = useState(false)
  const [availableProfiles, setAvailableProfiles] = useState<string[]>([])
  const [newUser, setNewUser]                     = useState({ username: '', password: '', profile: '', comment: '' })

  const [showAddBinding, setShowAddBinding] = useState(false)
  const [newBinding, setNewBinding]         = useState({ mac_address: '', ip_address: '', type: 'regular', comment: '' })

  const [showAddWG, setShowAddWG] = useState(false)
  const [newWG, setNewWG]         = useState({ dst_host: '', action: 'allow', comment: '' })

  const [showAddWGIP, setShowAddWGIP] = useState(false)
  const [newWGIP, setNewWGIP]         = useState({ dst_address: '', action: 'accept', comment: '' })

  const [showAddScheduler, setShowAddScheduler] = useState(false)
  const [editScheduler, setEditScheduler]       = useState<any>(null)
  const [newScheduler, setNewScheduler]         = useState({
    name: '', start_date: 'jan/01/1970', start_time: '00:00:00',
    interval: '00:00:00', on_event: '', policy: 'read,write,reboot',
    comment: '', disabled: 'false',
  })

  const [countdown, setCountdown] = useState(5)

  if (visibleTabs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-400)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>Huna ruhusa ya kufikia MikroTik Manager</div>
        <div style={{ fontSize: 13 }}>Wasiliana na admin wako kukupa ruhusa.</div>
      </div>
    )
  }

  const showAlrt = (type: any, msg: string) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 5000) }

  const fetchTab = async (currentTab: Tab, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get(`/mikrotik/${routerId}/${ENDPOINTS[currentTab]}`)
      setData((prev: any) => ({ ...prev, [currentTab]: res.data }))
    } catch (e: any) {
      if (!silent) showAlrt('error', e.response?.data?.error || 'Hitilafu ya muunganiko')
    } finally { if (!silent) setLoading(false) }
  }

  useEffect(() => {
    fetchTab(tab)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (tab === 'active' || tab === 'hosts') {
      setCountdown(5)
      const countTick = setInterval(() => { setCountdown(c => { if (c <= 1) return 5; return c - 1 }) }, 1000)
      intervalRef.current = setInterval(() => { fetchTab(tab, true); setCountdown(5) }, 5000)
      return () => { clearInterval(intervalRef.current); clearInterval(countTick) }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [tab, routerId])

  const openAddUser = async () => {
    setShowAddUser(true); setProfilesLoading(true)
    try {
      const res = await api.get(`/mikrotik/${routerId}/hotspot/profiles/`)
      const names: string[] = (res.data.profiles || []).map((p: any) => p.name).filter(Boolean)
      const list = names.length > 0 ? names : ['default']
      setAvailableProfiles(list)
      setNewUser(prev => ({ ...prev, profile: list[0] }))
    } catch { setAvailableProfiles(['default']); setNewUser(prev => ({ ...prev, profile: 'default' })) }
    finally { setProfilesLoading(false) }
  }

  const handleDeleteUser = async (username: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/users/delete/`, { data: { username } })
      showAlrt('success', `User ${username} amefutwa ✓`); fetchTab('users')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDisconnect = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/sessions/`, { data: { session_id: id } })
      showAlrt('success', 'Session imekatwa ✓'); fetchTab('active', true)
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddUser = async () => {
    if (!newUser.username) { showAlrt('error', 'Jaza username'); return }
    const payload = { ...newUser, password: newUser.password || newUser.username }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/users/`, payload)
      showAlrt('success', `User ${newUser.username} ameongezwa ✓`)
      setShowAddUser(false); setNewUser({ username: '', password: '', profile: '', comment: '' }); fetchTab('users')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteBinding = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/ip-bindings/`, { data: { binding_id: id } })
      showAlrt('success', 'IP Binding imefutwa ✓'); fetchTab('ip_bindings')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddBinding = async () => {
    if (!newBinding.mac_address) { showAlrt('error', 'Jaza MAC Address'); return }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/ip-bindings/`, newBinding)
      showAlrt('success', 'IP Binding imeongezwa ✓')
      setShowAddBinding(false); setNewBinding({ mac_address: '', ip_address: '', type: 'regular', comment: '' }); fetchTab('ip_bindings')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteWG = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/walled-garden/`, { data: { entry_id: id } })
      showAlrt('success', 'Walled Garden entry imefutwa ✓'); fetchTab('walled_garden')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddWG = async () => {
    if (!newWG.dst_host) { showAlrt('error', 'Jaza Dst Host'); return }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/walled-garden/`, newWG)
      showAlrt('success', `${newWG.dst_host} imeongezwa ✓`)
      setShowAddWG(false); setNewWG({ dst_host: '', action: 'allow', comment: '' }); fetchTab('walled_garden')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteWGIP = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/walled-garden-ip/`, { data: { entry_id: id } })
      showAlrt('success', 'Walled Garden IP imefutwa ✓'); fetchTab('walled_garden_ip')
    } catch { showAlrt('error', t('error')) }
  }

  const handleAddWGIP = async () => {
    if (!newWGIP.dst_address) { showAlrt('error', 'Jaza Dst Address'); return }
    try {
      await api.post(`/mikrotik/${routerId}/hotspot/walled-garden-ip/`, newWGIP)
      showAlrt('success', `${newWGIP.dst_address} imeongezwa ✓`)
      setShowAddWGIP(false); setNewWGIP({ dst_address: '', action: 'accept', comment: '' }); fetchTab('walled_garden_ip')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteCookie = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/cookies/`, { data: { cookie_id: id } })
      showAlrt('success', 'Cookie imefutwa ✓'); fetchTab('cookies')
    } catch { showAlrt('error', t('error')) }
  }

  const handleClearAllCookies = async () => {
    try {
      await api.delete(`/mikrotik/${routerId}/hotspot/cookies/`, { data: {} })
      showAlrt('success', 'Cookies zote zimefutwa ✓'); fetchTab('cookies')
    } catch { showAlrt('error', t('error')) }
  }

  const openAddScheduler = () => {
    setEditScheduler(null)
    setNewScheduler({ name: '', start_date: 'jan/01/1970', start_time: '00:00:00', interval: '00:00:00', on_event: '', policy: 'read,write,reboot', comment: '', disabled: 'false' })
    setShowAddScheduler(true)
  }

  const openEditScheduler = (item: any) => {
    setSelectedScheduler(null)
    setEditScheduler(item)
    setNewScheduler({
      name: item.name || '', start_date: item['start-date'] || 'jan/01/1970',
      start_time: item['start-time'] || '00:00:00', interval: item.interval || '00:00:00',
      on_event: item['on-event'] || '', policy: item.policy || 'read,write,reboot',
      comment: item.comment || '', disabled: item.disabled || 'false',
    })
    setShowAddScheduler(true)
  }

  const handleSaveScheduler = async () => {
    if (!newScheduler.name) { showAlrt('error', 'Jaza jina la scheduler'); return }
    if (!newScheduler.on_event) { showAlrt('error', 'Jaza script (On Event)'); return }
    try {
      if (editScheduler) {
        await api.patch(`/mikrotik/${routerId}/scheduler/`, { scheduler_id: editScheduler['.id'], ...newScheduler })
        showAlrt('success', `Scheduler "${newScheduler.name}" imesasishwa ✓`)
      } else {
        await api.post(`/mikrotik/${routerId}/scheduler/`, newScheduler)
        showAlrt('success', `Scheduler "${newScheduler.name}" imeongezwa ✓`)
      }
      setShowAddScheduler(false); setEditScheduler(null); fetchTab('scheduler')
    } catch (e: any) { showAlrt('error', e.response?.data?.error || t('error')) }
  }

  const handleDeleteScheduler = async (id: string) => {
    try {
      await api.delete(`/mikrotik/${routerId}/scheduler/`, { data: { scheduler_id: id } })
      showAlrt('success', 'Scheduler imefutwa ✓'); fetchTab('scheduler')
    } catch { showAlrt('error', t('error')) }
  }

  const handleToggleScheduler = async (item: any) => {
    try {
      await api.patch(`/mikrotik/${routerId}/scheduler/`, { scheduler_id: item['.id'], disabled: item.disabled === 'true' ? 'false' : 'true' })
      showAlrt('success', `Scheduler ${item.disabled === 'true' ? 'imewashwa' : 'imezimwa'} ✓`)
      fetchTab('scheduler')
    } catch { showAlrt('error', t('error')) }
  }

  const d = data[tab]

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '1rem',
  }
  const modalBox: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: '1.5rem',
    maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    animation: 'modalIn 0.2s ease',
  }
  const modalBoxLg: React.CSSProperties = { ...modalBox, maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }
  const modalHeader = (title: string, onClose: () => void) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h3>
      <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: 'var(--gray-500)' }}>✕</button>
    </div>
  )
  const selectStyle: React.CSSProperties = {
    padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8,
    fontSize: 14, outline: 'none', width: '100%', background: '#fff', color: 'var(--gray-800)', cursor: 'pointer',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 5, display: 'block' }
  const textareaStyle: React.CSSProperties = {
    padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8,
    fontSize: 13, outline: 'none', width: '100%', background: '#fff',
    color: 'var(--gray-800)', fontFamily: 'monospace', resize: 'vertical', minHeight: 100,
  }

  const LiveBadge = () => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'livepulse 1.5s infinite' }} />
      Live · {countdown}s
    </span>
  )

  return (
    <div>
      {alert && <div style={{ marginBottom: '1rem' }}><Alert type={alert.type} message={alert.msg} /></div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
        <Tabs tabs={visibleTabs as any} active={tab} onChange={(k) => setTab(k as Tab)} />
        <Button size="sm" variant="ghost" onClick={() => fetchTab(tab)} icon="🔄">{t('refresh')}</Button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>}

      {/* 1. SERVERS */}
      {!loading && tab === 'servers' && (
        <Card>
          <CardHeader title={`Hotspot Servers (${d?.count || 0})`} />
          <Table headers={['Name', 'Interface', 'Address Pool', 'Profile', 'Idle Timeout', 'Status']}
            rows={(d?.servers || []).map((s: any) => [
              <strong>{s.name || '—'}</strong>, s.interface || '—', s['address-pool'] || '—',
              <Badge text={s.profile || 'default'} color="indigo" />, s['idle-timeout'] || '—',
              <Badge text={s.disabled === 'true' ? 'Disabled' : 'Running'} color={s.disabled === 'true' ? 'red' : 'green'} />,
            ])} emptyMessage="Hakuna hotspot servers" />
        </Card>
      )}

      {/* 2. SERVER PROFILES */}
      {!loading && tab === 'server_profiles' && (
        <Card>
          <CardHeader title={`Server Profiles (${(d?.profiles || []).length})`} />
          <div style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af' }}>
            💡 Bonyeza profile yoyote kuona na kuhariri maelezo yake (General, Scripts)
          </div>
          <Table headers={['Name', 'Rate Limit', 'Session Timeout', 'Shared Users', 'On Login Script', '']}
            rows={(d?.profiles || []).map((p: any) => [
              <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setSelectedProfile(p)}>
                {p.name}
              </strong>,
              p['rate-limit'] || <span style={{ color: 'var(--gray-400)' }}>unlimited</span>,
              p['session-timeout'] || <span style={{ color: 'var(--gray-400)' }}>unlimited</span>,
              p['shared-users'] || '1',
              p['on-login']
                ? <Badge text="✓ Ipo" color="green" />
                : <Badge text="Hakuna" color="gray" />,
              <Button size="sm" variant="ghost" onClick={() => setSelectedProfile(p)} icon="✏️">Edit</Button>,
            ])} emptyMessage="Hakuna server profiles" />
        </Card>
      )}

      {/* 3. USERS */}
      {!loading && tab === 'users' && (
        <Card>
          <CardHeader title={`Users (${d?.count || 0})`} action={<Button size="sm" onClick={openAddUser} icon="➕">{t('add_user')}</Button>} />
          <div style={{ padding: '8px 16px', background: '#eff6ff', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af' }}>
            💡 Bonyeza jina la user kuona na kuhariri maelezo yake
          </div>
          <Table headers={['Name', 'Profile', 'Limit Uptime', 'Comment', 'Status', '']}
            rows={(d?.users || []).map((u: any) => [
              <code
                style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                onClick={() => setSelectedUser(u)}
              >
                {u.name}
              </code>,
              <Badge text={u.profile || 'default'} color="indigo" />,
              u['limit-uptime'] || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.comment || '—'}</span>,
              <Badge
                text={u.disabled === 'true' ? 'Disabled' : 'Active'}
                color={u.disabled === 'true' ? 'red' : 'green'}
              />,
              <Button size="sm" variant="ghost" onClick={() => setSelectedUser(u)} icon="✏️">Edit</Button>,
            ])} emptyMessage="Hakuna users" />
        </Card>
      )}

      {/* 4. ACTIVE */}
      {!loading && tab === 'active' && (
        <Card>
          <CardHeader title={`Active (${d?.count || 0})`} action={<LiveBadge />} />
          {(d?.sessions || []).length === 0
            ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}><div style={{ fontSize: 36, marginBottom: 8 }}>🟢</div>Hakuna active sessions</div>
            : <Table headers={['User', 'MAC Address', 'IP Address', 'Uptime', 'TX Bytes', 'RX Bytes', 'Server', '']}
                rows={(d?.sessions || []).map((s: any) => [
                  <strong>{s.user || '—'}</strong>,
                  <code style={{ fontSize: 11 }}>{s['mac-address'] || '—'}</code>,
                  <code style={{ fontSize: 11 }}>{s.address || '—'}</code>,
                  s.uptime || '—', s['bytes-out'] || '0', s['bytes-in'] || '0', s.server || '—',
                  <Button size="sm" variant="danger" onClick={() => setConfirmDisconnect(s['.id'])}>Disconnect</Button>,
                ])} emptyMessage="Hakuna active sessions" />
          }
        </Card>
      )}

      {/* 5. HOSTS */}
      {!loading && tab === 'hosts' && (
        <Card>
          <CardHeader title={`Hosts (${d?.count || 0})`} action={<LiveBadge />} />
          <Table headers={['MAC Address', 'IP Address', 'Hostname', 'Server', 'Bridge', 'Status']}
            rows={(d?.hosts || []).map((h: any) => [
              <code style={{ fontSize: 11 }}>{h['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{h.address || '—'}</code>,
              h.hostname || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              h.server || '—', h.bridge || '—',
              <Badge text={h.authorized === 'true' ? 'authorized' : 'unauthorized'} color={h.authorized === 'true' ? 'green' : 'gray'} />,
            ])} emptyMessage="Hakuna hosts" />
        </Card>
      )}

      {/* 6. IP BINDINGS */}
      {!loading && tab === 'ip_bindings' && (
        <Card>
          <CardHeader title={`IP Bindings (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddBinding(true)} icon="➕">Add Binding</Button>} />
          <Table headers={['MAC Address', 'IP Address', 'Type', 'Comment', '']}
            rows={(d?.bindings || []).map((b: any) => [
              <code style={{ fontSize: 11 }}>{b['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{b.address || '—'}</code>,
              <Badge text={b.type || 'regular'} color={b.type === 'bypassed' ? 'green' : b.type === 'blocked' ? 'red' : 'blue'} />,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{b.comment || '—'}</span>,
              <Button size="sm" variant="danger" onClick={() => setConfirmDeleteBinding(b['.id'])} icon="🗑">Remove</Button>,
            ])} emptyMessage="Hakuna IP Bindings" />
        </Card>
      )}

      {/* 7. WALLED GARDEN */}
      {!loading && tab === 'walled_garden' && (
        <Card>
          <CardHeader title={`Walled Garden (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddWG(true)} icon="➕">Add Entry</Button>} />
          <div style={{ padding: '8px 16px', background: 'var(--info-light)', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af' }}>
            🌐 Tovuti zinazoweza kufikiwa <strong>bila login</strong> (HTTP)
          </div>
          <Table headers={['Dst Host', 'Action', 'Server', 'Path', 'Comment', '']}
            rows={(d?.entries || []).map((e: any) => [
              <code style={{ fontSize: 12, color: 'var(--primary)' }}>{e['dst-host'] || '—'}</code>,
              <Badge text={e.action || 'allow'} color={e.action === 'deny' ? 'red' : 'green'} />,
              e.server || <span style={{ color: 'var(--gray-300)' }}>all</span>,
              e.path || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.comment || '—'}</span>,
              <Button size="sm" variant="danger" onClick={() => setConfirmDeleteWG(e['.id'])} icon="🗑">Remove</Button>,
            ])} emptyMessage="Hakuna Walled Garden entries" />
        </Card>
      )}

      {/* 8. WALLED GARDEN IP */}
      {!loading && tab === 'walled_garden_ip' && (
        <Card>
          <CardHeader title={`Walled Garden IP List (${d?.count || 0})`} action={<Button size="sm" onClick={() => setShowAddWGIP(true)} icon="➕">Add IP</Button>} />
          <div style={{ padding: '8px 16px', background: 'var(--info-light)', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#1e40af' }}>
            🌍 IP addresses zinazoweza kufikiwa <strong>bila login</strong> (HTTPS/IP direct)
          </div>
          <Table headers={['Dst Address', 'Action', 'Protocol', 'Server', 'Comment', '']}
            rows={(d?.entries || []).map((e: any) => [
              <code style={{ fontSize: 12, color: 'var(--primary)' }}>{e['dst-address'] || '—'}</code>,
              <Badge text={e.action || 'accept'} color={e.action === 'drop' ? 'red' : 'green'} />,
              e.protocol || <span style={{ color: 'var(--gray-300)' }}>any</span>,
              e.server || <span style={{ color: 'var(--gray-300)' }}>all</span>,
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{e.comment || '—'}</span>,
              <Button size="sm" variant="danger" onClick={() => setConfirmDeleteWGIP(e['.id'])} icon="🗑">Remove</Button>,
            ])} emptyMessage="Hakuna Walled Garden IP entries" />
        </Card>
      )}

      {/* 9. COOKIES */}
      {!loading && tab === 'cookies' && (
        <Card>
          <CardHeader title={`Cookies (${d?.count || 0})`}
            action={(d?.count || 0) > 0
              ? <Button size="sm" variant="danger" onClick={() => setConfirmClearCookies(true)} icon="🗑">Clear All</Button>
              : undefined} />
          <div style={{ padding: '8px 16px', background: '#fff7ed', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#92400e' }}>
            🍪 Login cookies — ruhusu mtumiaji kuingia <strong>bila password</strong> tena
          </div>
          <Table headers={['User', 'MAC Address', 'IP Address', 'Expires At', '']}
            rows={(d?.cookies || []).map((c: any) => [
              <strong>{c.user || '—'}</strong>,
              <code style={{ fontSize: 11 }}>{c['mac-address'] || '—'}</code>,
              <code style={{ fontSize: 11 }}>{c.address || '—'}</code>,
              c['expires-at'] || '—',
              <Button size="sm" variant="danger" onClick={() => setConfirmDeleteCookie(c['.id'])} icon="🗑">Remove</Button>,
            ])} emptyMessage="Hakuna cookies" />
        </Card>
      )}

      {/* 10. SCHEDULER */}
      {!loading && tab === 'scheduler' && (
        <Card>
          <CardHeader title={`Scheduler (${(d?.schedulers || []).length})`} action={<Button size="sm" onClick={openAddScheduler} icon="➕">Add Schedule</Button>} />
          <div style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: 8, margin: '0 1rem 1rem', fontSize: 12, color: '#166534' }}>
            ⏰ Bonyeza scheduler kuona na kuhariri script yake kamili
          </div>
          <Table headers={['Name', 'Interval', 'Run Count', 'Next Run', 'Status', '']}
            rows={(d?.schedulers || []).map((s: any) => [
              <div style={{ cursor: 'pointer' }} onClick={() => setSelectedScheduler(s)}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', textDecoration: 'underline dotted' }}>{s.name}</div>
                {s.comment && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.comment}</div>}
              </div>,
              s.interval ? <Badge text={s.interval} color="blue" /> : <span style={{ color: 'var(--gray-300)' }}>once</span>,
              <span style={{ fontWeight: 600, color: (s['run-count'] || 0) > 0 ? '#059669' : 'var(--gray-400)' }}>{s['run-count'] || '0'}</span>,
              s['next-run'] || <span style={{ color: 'var(--gray-300)' }}>—</span>,
              <Badge text={s.disabled === 'true' ? 'Disabled' : 'Running'} color={s.disabled === 'true' ? 'red' : 'green'} />,
              <div style={{ display: 'flex', gap: 4 }}>
                <Button size="sm" variant="ghost" onClick={() => openEditScheduler(s)} icon="✏️">Edit</Button>
                <Button size="sm" variant={s.disabled === 'true' ? 'success' : 'warning'} onClick={() => handleToggleScheduler(s)}>
                  {s.disabled === 'true' ? '▶' : '⏸'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmDeleteScheduler(s['.id'])} icon="🗑">Del</Button>
              </div>,
            ])} emptyMessage="Hakuna schedulers" />
        </Card>
      )}

      {/* ── DETAIL MODALS (with edit) ── */}
      {selectedProfile && (
        <ServerProfileDetailModal
          profile={selectedProfile}
          routerId={routerId}
          onClose={() => setSelectedProfile(null)}
          onSaved={() => fetchTab('server_profiles')}
        />
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          routerId={routerId}
          onClose={() => setSelectedUser(null)}
          onDelete={(username) => { handleDeleteUser(username); setSelectedUser(null) }}
          onSaved={() => fetchTab('users')}
          availableProfiles={availableProfiles}
        />
      )}

      {selectedScheduler && (
        <SchedulerDetailModal
          scheduler={selectedScheduler}
          routerId={routerId}
          onClose={() => setSelectedScheduler(null)}
          onSaved={() => fetchTab('scheduler')}
          onDelete={(id) => { handleDeleteScheduler(id); setSelectedScheduler(null) }}
          onToggle={(s) => { handleToggleScheduler(s) }}
        />
      )}

      {/* ── ADD/EDIT MODALS (unchanged) ── */}
      {showAddUser && (
        <div style={modalOverlay}><div style={modalBox}>
          {modalHeader(t('add_user'), () => setShowAddUser(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Username *" placeholder="mtumiaji001" value={newUser.username} onChange={(e: any) => setNewUser({ ...newUser, username: e.target.value })} />
            <Input label="Password (default = username)" placeholder="Acha tupu" value={newUser.password} onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Profile {profilesLoading && <Spinner size={12} />}</label>
              {profilesLoading
                ? <div style={{ padding: '10px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, color: 'var(--gray-400)' }}>Inapakia...</div>
                : <select value={newUser.profile} onChange={(e: any) => setNewUser({ ...newUser, profile: e.target.value })} style={selectStyle}>
                    {availableProfiles.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>}
            </div>
            <Input label="Comment (optional)" placeholder="Jina la mteja" value={newUser.comment} onChange={(e: any) => setNewUser({ ...newUser, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddUser(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddUser} disabled={profilesLoading} icon="➕">{t('save')}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {showAddBinding && (
        <div style={modalOverlay}><div style={modalBox}>
          {modalHeader('Add IP Binding', () => setShowAddBinding(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="MAC Address *" placeholder="AA:BB:CC:DD:EE:FF" value={newBinding.mac_address} onChange={(e: any) => setNewBinding({ ...newBinding, mac_address: e.target.value })} />
            <Input label="IP Address (optional)" placeholder="192.168.20.100" value={newBinding.ip_address} onChange={(e: any) => setNewBinding({ ...newBinding, ip_address: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Type</label>
              <select value={newBinding.type} onChange={(e: any) => setNewBinding({ ...newBinding, type: e.target.value })} style={selectStyle}>
                <option value="regular">Regular — mtumiaji wa kawaida</option>
                <option value="bypassed">Bypassed — anaruhusiwa bila login</option>
                <option value="blocked">Blocked — amezuiwa kabisa</option>
              </select>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo" value={newBinding.comment} onChange={(e: any) => setNewBinding({ ...newBinding, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddBinding(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddBinding} icon="➕">Add Binding</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {showAddWG && (
        <div style={modalOverlay}><div style={modalBox}>
          {modalHeader('Add Walled Garden Entry', () => setShowAddWG(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Dst Host *" placeholder="example.com au *.example.com" value={newWG.dst_host} onChange={(e: any) => setNewWG({ ...newWG, dst_host: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Action</label>
              <select value={newWG.action} onChange={(e: any) => setNewWG({ ...newWG, action: e.target.value })} style={selectStyle}>
                <option value="allow">Allow — ruhusu bila login</option>
                <option value="deny">Deny — zuia</option>
              </select>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo" value={newWG.comment} onChange={(e: any) => setNewWG({ ...newWG, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddWG(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddWG} icon="➕">Add Entry</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {showAddWGIP && (
        <div style={modalOverlay}><div style={modalBox}>
          {modalHeader('Add Walled Garden IP', () => setShowAddWGIP(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Dst Address *" placeholder="8.8.8.8 au 192.168.1.0/24" value={newWGIP.dst_address} onChange={(e: any) => setNewWGIP({ ...newWGIP, dst_address: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Action</label>
              <select value={newWGIP.action} onChange={(e: any) => setNewWGIP({ ...newWGIP, action: e.target.value })} style={selectStyle}>
                <option value="accept">Accept — ruhusu</option>
                <option value="drop">Drop — zuia</option>
              </select>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo" value={newWGIP.comment} onChange={(e: any) => setNewWGIP({ ...newWGIP, comment: e.target.value })} />
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddWGIP(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddWGIP} icon="➕">Add IP</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      {showAddScheduler && (
        <div style={modalOverlay}><div style={modalBoxLg}>
          {modalHeader(editScheduler ? `Edit: ${editScheduler.name}` : 'Add Scheduler', () => setShowAddScheduler(false))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Name *" placeholder="mfano: cleanup-daily" value={newScheduler.name} onChange={(e: any) => setNewScheduler({ ...newScheduler, name: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={labelStyle}>Start Date</label>
                <input value={newScheduler.start_date} onChange={(e: any) => setNewScheduler({ ...newScheduler, start_date: e.target.value })} placeholder="jan/01/1970" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Format: jan/01/1970</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={labelStyle}>Start Time</label>
                <input value={newScheduler.start_time} onChange={(e: any) => setNewScheduler({ ...newScheduler, start_time: e.target.value })} placeholder="00:00:00" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Format: HH:MM:SS</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Interval (00:00:00 = mara moja tu)</label>
              <input value={newScheduler.interval} onChange={(e: any) => setNewScheduler({ ...newScheduler, interval: e.target.value })} placeholder="00:00:00" style={{ padding: '9px 11px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                {[{ l: 'Kila dakika', v: '00:01:00' }, { l: 'Kila saa', v: '01:00:00' }, { l: 'Kila saa 6', v: '06:00:00' }, { l: 'Kila siku', v: '1d 00:00:00' }, { l: 'Kila wiki', v: '7d 00:00:00' }].map(opt => (
                  <button key={opt.v} onClick={() => setNewScheduler({ ...newScheduler, interval: opt.v })}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid', borderColor: newScheduler.interval === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: newScheduler.interval === opt.v ? 'var(--primary-light)' : '#fff', color: newScheduler.interval === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Policy</label>
              <select value={newScheduler.policy} onChange={(e: any) => setNewScheduler({ ...newScheduler, policy: e.target.value })} style={selectStyle}>
                <option value="read,write,reboot">read, write, reboot</option>
                <option value="read,write">read, write</option>
                <option value="read,write,reboot,policy,sensitive">Full</option>
                <option value="read">read only</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>On Event (Script) *</label>
              <textarea value={newScheduler.on_event} onChange={(e: any) => setNewScheduler({ ...newScheduler, on_event: e.target.value })}
                placeholder={`# Mfano:\n/ip hotspot user remove [find comment~"Batch" uptime>1h]`} style={textareaStyle} />
              <div style={{ background: '#1e1b4b', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#a5b4fc' }}>
                💡 Mifano:
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[{ l: 'Log message', v: ':log info "Scheduler imefanya kazi"' }, { l: 'Futa used users', v: '/ip hotspot user remove [find comment~"used"]' }, { l: 'Reboot router', v: '/system reboot' }].map((ex, i) => (
                    <button key={i} onClick={() => setNewScheduler({ ...newScheduler, on_event: ex.v })}
                      style={{ textAlign: 'left', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#e0e7ff', fontSize: 11 }}>
                      <span style={{ color: '#818cf8' }}>{ex.l}:</span> <code>{ex.v}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Input label="Comment (optional)" placeholder="Maelezo ya scheduler" value={newScheduler.comment} onChange={(e: any) => setNewScheduler({ ...newScheduler, comment: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Hali ya Awali</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'false', l: '▶ Enabled' }, { v: 'true', l: '⏸ Disabled' }].map(opt => (
                  <button key={opt.v} onClick={() => setNewScheduler({ ...newScheduler, disabled: opt.v })}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid', borderColor: newScheduler.disabled === opt.v ? 'var(--primary)' : 'var(--gray-200)', background: newScheduler.disabled === opt.v ? 'var(--primary-light)' : '#fff', color: newScheduler.disabled === opt.v ? 'var(--primary-dark)' : 'var(--gray-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <FormActions>
              <Button variant="ghost" onClick={() => setShowAddScheduler(false)}>{t('cancel')}</Button>
              <Button onClick={handleSaveScheduler} icon={editScheduler ? '💾' : '➕'}>{editScheduler ? 'Sasisha' : 'Ongeza Scheduler'}</Button>
            </FormActions>
          </div>
        </div></div>
      )}

      <ConfirmDialog open={!!confirmDisconnect} onClose={() => setConfirmDisconnect(null)} onConfirm={() => confirmDisconnect && handleDisconnect(confirmDisconnect)} title="Disconnect Session" message="Una uhakika unataka kukata connection hii?" danger />
      <ConfirmDialog open={!!confirmDeleteUser} onClose={() => setConfirmDeleteUser(null)} onConfirm={() => confirmDeleteUser && handleDeleteUser(confirmDeleteUser)} title={t('delete_user')} message={`Futa user "${confirmDeleteUser}"?`} danger />
      <ConfirmDialog open={!!confirmDeleteBinding} onClose={() => setConfirmDeleteBinding(null)} onConfirm={() => confirmDeleteBinding && handleDeleteBinding(confirmDeleteBinding)} title="Remove IP Binding" message="Una uhakika unataka kufuta IP Binding hii?" danger />
      <ConfirmDialog open={!!confirmDeleteWG} onClose={() => setConfirmDeleteWG(null)} onConfirm={() => confirmDeleteWG && handleDeleteWG(confirmDeleteWG)} title="Remove Walled Garden" message="Una uhakika unataka kufuta entry hii?" danger />
      <ConfirmDialog open={!!confirmDeleteWGIP} onClose={() => setConfirmDeleteWGIP(null)} onConfirm={() => confirmDeleteWGIP && handleDeleteWGIP(confirmDeleteWGIP)} title="Remove Walled Garden IP" message="Una uhakika unataka kufuta IP hii?" danger />
      <ConfirmDialog open={!!confirmDeleteCookie} onClose={() => setConfirmDeleteCookie(null)} onConfirm={() => confirmDeleteCookie && handleDeleteCookie(confirmDeleteCookie)} title="Remove Cookie" message="Futa cookie hii? Mtumiaji atalazimika kuingia tena." danger />
      <ConfirmDialog open={confirmClearCookies} onClose={() => setConfirmClearCookies(false)} onConfirm={handleClearAllCookies} title="Clear All Cookies" message="Futa cookies ZOTE? Watumiaji wote watalazimika kuingia tena." danger />
      <ConfirmDialog open={!!confirmDeleteScheduler} onClose={() => setConfirmDeleteScheduler(null)} onConfirm={() => confirmDeleteScheduler && handleDeleteScheduler(confirmDeleteScheduler)} title="Futa Scheduler" message="Futa scheduler hii? Script haitatekelezwa tena." danger />

      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        @keyframes livepulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  )
}

// ── FEATURE LABELS ────────────────────────────────────────
const FEATURE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  servers:          { label: 'Servers',          icon: '🖥',  desc: 'Ona hotspot servers' },
  server_profiles:  { label: 'Server Profiles',  icon: '📋',  desc: 'Ona server profiles' },
  users:            { label: 'Users',            icon: '👤',  desc: 'Simamia hotspot users' },
  active:           { label: 'Active Sessions',  icon: '🟢',  desc: 'Ona na kata sessions' },
  hosts:            { label: 'Hosts',            icon: '💻',  desc: 'Vifaa vilivyounganika' },
  ip_bindings:      { label: 'IP Bindings',      icon: '🔗',  desc: 'Simamia IP bindings' },
  walled_garden:    { label: 'Walled Garden',    icon: '🌐',  desc: 'Tovuti bila login (HTTP)' },
  walled_garden_ip: { label: 'Walled Garden IP', icon: '🌍',  desc: 'IPs bila login (HTTPS)' },
  cookies:          { label: 'Cookies',          icon: '🍪',  desc: 'Simamia login cookies' },
  scheduler:        { label: 'Scheduler',        icon: '⏰',  desc: 'Scripts za wakati maalum' },
}

function RouterCard({ router, onSelect }: { router: any; onSelect: () => void }) {
  const { t } = useLang()
  return (
    <div onClick={onSelect}
      style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: `2px solid ${router.is_online ? 'var(--success)' : 'var(--gray-200)'}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--card-shadow)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 26 }}>📡</span>
        <Badge text={router.is_online ? t('online') : t('offline')} color={router.is_online ? 'green' : 'red'} />
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{router.name}</h3>
      {router.client_name && <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{router.client_name}</p>}
      <code style={{ fontSize: 11, color: 'var(--gray-400)' }}>{router.host}:{router.api_port}</code>
      <div style={{ marginTop: '0.9rem', padding: '7px 12px', background: 'var(--primary-light)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--primary-dark)', textAlign: 'center' }}>{t('manage')} →</div>
    </div>
  )
}

export function ClientMikroTikPage() {
  const { t } = useLang()
  const [routers, setRouters] = useState<any[]>([])
  const [selectedRouter, setSelectedRouter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [allowedTabs, setAllowedTabs] = useState<Tab[]>([])

  useEffect(() => {
    Promise.all([api.get('/routers/'), api.get('/clients/my-mikrotik-permissions/')]).then(([r, p]) => {
      setRouters(r.data.results || r.data)
      setAllowedTabs(p.data.mikrotik_permissions || [])
      setLoading(false)
    })
  }, [])

  return (
    <Layout>
      <div style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto' }}>
        {!selectedRouter ? (
          <>
            <PageHeader title={t('mikrotik_mgmt')} subtitle="IP → Hotspot (kama Winbox)" />
            {!loading && allowedTabs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {allowedTabs.map(key => {
                  const f = FEATURE_LABELS[key]
                  return f ? (
                    <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: 12, color: '#166534', fontWeight: 600 }}>
                      {f.icon} {f.label}
                    </span>
                  ) : null
                })}
              </div>
            )}
            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>
              : allowedTabs.length === 0
                ? <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-400)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>Huna ruhusa ya MikroTik Manager</div>
                    <div style={{ fontSize: 13 }}>Wasiliana na admin kukupa ruhusa.</div>
                  </div>
                : routers.length === 0
                  ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}><div style={{ fontSize: 40, marginBottom: 8 }}>📡</div>Hakuna routers</div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                      {routers.map(r => <RouterCard key={r.id} router={r} onSelect={() => setSelectedRouter(r.id)} />)}
                    </div>
            }
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRouter(null)} icon="←">Rudi</Button>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{routers.find(r => r.id === selectedRouter)?.name}</span>
            </div>
            <MikroTikManager routerId={selectedRouter} allowedTabs={allowedTabs} />
          </>
        )}
      </div>
    </Layout>
  )
}

export function AdminMikroTikPage() {
  const { t } = useLang()
  const [routers, setRouters] = useState<any[]>([])
  const [selectedRouter, setSelectedRouter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const allTabs = ALL_TABS.map(t => t.key) as Tab[]

  useEffect(() => { api.get('/routers/').then(r => { setRouters(r.data.results || r.data); setLoading(false) }) }, [])

  return (
    <Layout>
      <div style={{ padding: '1.25rem', maxWidth: 1200, margin: '0 auto' }}>
        {!selectedRouter ? (
          <>
            <PageHeader title={t('mikrotik_mgmt')} subtitle="Simamia routers zote za clients" />
            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem' }}><Spinner size={32} /></div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem' }}>
                  {routers.map(r => <RouterCard key={r.id} router={r} onSelect={() => setSelectedRouter(r.id)} />)}
                </div>
            }
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRouter(null)} icon="←">Rudi</Button>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{routers.find(r => r.id === selectedRouter)?.name}</span>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{routers.find(r => r.id === selectedRouter)?.client_name}</span>
            </div>
            <MikroTikManager routerId={selectedRouter} allowedTabs={allTabs} />
          </>
        )}
      </div>
    </Layout>
  )
}

export function MikroTikPermissionsModal({ client, onClose, onSaved }: {
  client: any; onClose: () => void; onSaved: () => void
}) {
  const [permissions, setPermissions] = useState<string[]>(client.mikrotik_permissions || [])
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: any; msg: string } | null>(null)
  const ALL_FEATURES = Object.keys(FEATURE_LABELS)

  const toggle = (key: string) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/clients/${client.id}/mikrotik-permissions/`, { permissions })
      onSaved(); onClose()
    } catch { setAlert({ type: 'error', msg: 'Imeshindwa kuhifadhi permissions' }) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'modalIn 0.2s ease' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>🔐 MikroTik Permissions</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{client.business_name}</p>
            </div>
            <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
          {alert && <Alert type={alert.type} message={alert.msg} />}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setPermissions(ALL_FEATURES)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✅ Chagua Zote</button>
            <button onClick={() => setPermissions([])} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #fee2e2', background: '#fef2f2', color: '#991b1b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>❌ Futa Zote</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_FEATURES.map(key => {
            const f = FEATURE_LABELS[key]
            const checked = permissions.includes(key)
            return (
              <div key={key} onClick={() => toggle(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${checked ? '#6366f1' : 'var(--gray-200)'}`, background: checked ? '#eef2ff' : '#fafafa', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? '#6366f1' : 'var(--gray-300)'}`, background: checked ? '#6366f1' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {checked && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: checked ? '#4338ca' : 'var(--gray-700)' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-100)', flexShrink: 0, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderRadius: '0 0 16px 16px' }}>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{permissions.length} / {ALL_FEATURES.length} features zimechaguliwa</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>Funga</Button>
            <Button onClick={handleSave} disabled={saving} icon="💾">{saving ? 'Inahifadhi...' : 'Hifadhi'}</Button>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  )
}
