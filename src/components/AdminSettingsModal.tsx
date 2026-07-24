import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../contexts/LangContext'
import api from '../lib/api'

const TR = {
  title:            { sw: 'Mipangilio ya Akaunti', en: 'Account Settings' },
  subtitle:         { sw: 'Taarifa zako na usalama wa akaunti', en: 'Your details and account security' },
  username:         { sw: 'Jina la Mtumiaji', en: 'Username' },
  email:             { sw: 'Barua Pepe', en: 'Email' },
  phone:            { sw: 'Namba ya Simu', en: 'Phone Number' },
  role:             { sw: 'Cheo', en: 'Role' },
  super_admin:      { sw: 'Msimamizi Mkuu', en: 'Super Admin' },
  profile_note:     { sw: 'Taarifa hizi haziwezi kubadilishwa hapa', en: 'These details cannot be changed here' },
  change_password:  { sw: 'Badilisha Password', en: 'Change Password' },
  old_password:     { sw: 'Password ya Zamani', en: 'Current Password' },
  new_password:     { sw: 'Password Mpya', en: 'New Password' },
  confirm_password: { sw: 'Thibitisha Password Mpya', en: 'Confirm New Password' },
  save:             { sw: 'Hifadhi', en: 'Save' },
  saving:           { sw: 'Inahifadhi…', en: 'Saving…' },
  saved:            { sw: 'Password imebadilishwa', en: 'Password changed' },
  mismatch:         { sw: 'Password mpya hazifanani', en: 'New passwords do not match' },
  too_short:        { sw: 'Password mpya iwe na herufi angalau 6', en: 'New password must be at least 6 characters' },
  fill_all:         { sw: 'Jaza sehemu zote', en: 'Fill in all fields' },
  error:            { sw: 'Imeshindwa, hakikisha password ya zamani ni sahihi', en: 'Failed — check your current password' },
  load_error:       { sw: 'Imeshindwa kupata taarifa', en: 'Failed to load details' },
  loading:          { sw: 'Inapakia…', en: 'Loading…' },
}

function tr(key: keyof typeof TR, lang: string) {
  return lang === 'sw' ? TR[key].sw : TR[key].en
}

type AdminProfile = {
  id: number
  username: string
  email: string
  phone: string
  role: string
  full_name: string
}

export default function AdminSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLang()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const fetchProfile = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const res = await api.get('/auth/me/')
      setProfile(res.data.user)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchProfile()
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!open) return null

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setToast({ type: 'err', msg: tr('fill_all', lang) })
      return
    }
    if (newPassword.length < 6) {
      setToast({ type: 'err', msg: tr('too_short', lang) })
      return
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: 'err', msg: tr('mismatch', lang) })
      return
    }
    setSaving(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      setToast({ type: 'ok', msg: tr('saved', lang) })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const msg = err?.response?.data?.error || tr('error', lang)
      setToast({ type: 'err', msg })
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

  return createPortal(
    <>
      <style>{`
        @keyframes adminSettingsOverlayIn { from{opacity:0} to{opacity:1} }
        @keyframes adminSettingsCardIn { from{opacity:0;transform:translateY(12px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,15,25,0.5)',
        zIndex: 1000, animation: 'adminSettingsOverlayIn 0.16s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
          background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'adminSettingsCardIn 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 22px 14px' }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>{tr('title', lang)}</h2>
              <p style={{ fontSize: 12.5, color: '#9ca3af', margin: '4px 0 0' }}>{tr('subtitle', lang)}</p>
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              width: 32, height: 32, borderRadius: 9, border: '1px solid #e5e7eb', background: '#f8fafc',
              color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: '0 22px 22px' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>{tr('loading', lang)}</div>
            ) : loadError ? (
              <div style={{ padding: 18, borderRadius: 12, background: '#fef2f2', color: '#ef4444', fontSize: 13, textAlign: 'center' }}>
                {tr('load_error', lang)}
              </div>
            ) : profile && (
              <>
                {/* Read-only profile info */}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{tr('username', lang)}</label>
                  <div style={readonlyBoxStyle}>{profile.username}</div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{tr('email', lang)}</label>
                  <div style={readonlyBoxStyle}>{profile.email || '—'}</div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{tr('phone', lang)}</label>
                  <div style={readonlyBoxStyle}>{profile.phone || '—'}</div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>{tr('role', lang)}</label>
                  <div style={readonlyBoxStyle}>{tr('super_admin', lang)}</div>
                </div>

                <div style={{ fontSize: 11, color: '#b0b6c0', marginBottom: 20 }}>{tr('profile_note', lang)}</div>

                {/* Change password */}
                <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0 18px' }} />
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 14 }}>
                  {tr('change_password', lang)}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{tr('old_password', lang)}</label>
                  <input type="password" style={inputStyle} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{tr('new_password', lang)}</label>
                  <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>{tr('confirm_password', lang)}</label>
                  <input type="password" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>

                <button onClick={handleChangePassword} disabled={saving}
                  style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? tr('saving', lang) : tr('save', lang)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'ok' ? '#10b981' : '#ef4444', color: '#fff',
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)', zIndex: 1100, textAlign: 'center', maxWidth: '90vw',
        }}>
          {toast.msg}
        </div>
      )}
    </>,
    document.body
  )
}
