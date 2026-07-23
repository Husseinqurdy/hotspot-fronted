import { useState, useEffect } from 'react'
import { useLang } from '../../contexts/LangContext'
import api from '../../lib/api'

const TR = {
  title:          { sw: 'Mipangilio ya Akaunti', en: 'Account Settings' },
  subtitle:       { sw: 'Angalia na badilisha taarifa zako', en: 'View and update your details' },
  business_name:  { sw: 'Jina la Biashara', en: 'Business Name' },
  phone:          { sw: 'Namba ya Simu', en: 'Phone Number' },
  email:          { sw: 'Barua Pepe', en: 'Email' },
  identifier:     { sw: 'Namba ya Utambulisho', en: 'Identifier' },
  email_note:     { sw: 'Barua pepe haiwezi kubadilishwa hapa', en: 'Email cannot be changed here' },
  edit:           { sw: 'Hariri', en: 'Edit' },
  save:           { sw: 'Hifadhi', en: 'Save' },
  cancel:         { sw: 'Ghairi', en: 'Cancel' },
  saved:          { sw: 'Taarifa zimehifadhiwa', en: 'Details saved' },
  error:          { sw: 'Imeshindwa kuhifadhi, jaribu tena', en: 'Failed to save, try again' },
  load_error:     { sw: 'Imeshindwa kupata taarifa', en: 'Failed to load details' },
  loading:        { sw: 'Inapakia…', en: 'Loading…' },
}

function tr(key: keyof typeof TR, lang: string) {
  return lang === 'sw' ? TR[key].sw : TR[key].en
}

type ClientProfile = {
  id: number
  username: string
  email: string
  business_name: string
  identifier: number
  phone: string
}

export default function ClientSettingsPage() {
  const { lang } = useLang()
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const fetchProfile = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const res = await api.get('/clients/my-profile/')
      setProfile(res.data)
      setBusinessName(res.data.business_name || '')
      setPhone(res.data.phone || '')
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const startEdit = () => {
    if (profile) {
      setBusinessName(profile.business_name || '')
      setPhone(profile.phone || '')
    }
    setEditing(true)
  }

  const cancelEdit = () => {
    if (profile) {
      setBusinessName(profile.business_name || '')
      setPhone(profile.phone || '')
    }
    setEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/clients/my-profile/', {
        business_name: businessName,
        phone: phone,
      })
      setProfile(res.data)
      setEditing(false)
      setToast({ type: 'ok', msg: tr('saved', lang) })
    } catch {
      setToast({ type: 'err', msg: tr('error', lang) })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid #e5e7eb', fontSize: 14, color: '#111827',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  }

  const readonlyBoxStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid #f0f1f3', fontSize: 14, color: '#6b7280',
    background: '#f8fafc', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, display: 'block',
  }

  return (
    <div style={{ padding: '24px 20px 60px', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
        {tr('title', lang)}
      </h1>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 24px' }}>
        {tr('subtitle', lang)}
      </p>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
          {tr('loading', lang)}
        </div>
      ) : loadError ? (
        <div style={{ padding: 20, borderRadius: 12, background: '#fef2f2', color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
          {tr('load_error', lang)}
        </div>
      ) : profile && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 22, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{tr('business_name', lang)}</label>
            {editing ? (
              <input style={inputStyle} value={businessName} onChange={e => setBusinessName(e.target.value)} />
            ) : (
              <div style={readonlyBoxStyle}>{profile.business_name}</div>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{tr('phone', lang)}</label>
            {editing ? (
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
            ) : (
              <div style={readonlyBoxStyle}>{profile.phone || '—'}</div>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{tr('email', lang)}</label>
            <div style={readonlyBoxStyle}>{profile.email || '—'}</div>
            <div style={{ fontSize: 11, color: '#b0b6c0', marginTop: 4 }}>{tr('email_note', lang)}</div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>{tr('identifier', lang)}</label>
            <div style={readonlyBoxStyle}>{profile.identifier}</div>
          </div>

          {editing ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? '…' : tr('save', lang)}
              </button>
              <button onClick={cancelEdit} disabled={saving}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f8fafc', color: '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {tr('cancel', lang)}
              </button>
            </div>
          ) : (
            <button onClick={startEdit}
              style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {tr('edit', lang)}
            </button>
          )}
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'ok' ? '#10b981' : '#ef4444', color: '#fff',
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)', zIndex: 500,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
