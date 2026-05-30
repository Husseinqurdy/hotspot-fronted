import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang, LanguageSwitcher } from '../contexts/LangContext'
import { Alert } from '../components/UI'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(form.username, form.password)
      const user = JSON.parse(localStorage.getItem('ns_user') || '{}')
      navigate(user.role === 'superadmin' ? '/admin/dashboard' : '/client/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || t('invalid_credentials'))
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Desktop: 2 columns | Mobile: single column */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Left branding */}
        <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', width: `${(i + 1) * 200}px`, height: `${(i + 1) * 200}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />)}
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', maxWidth: 340 }}>
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>NetSafi</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '2rem' }}>{t('app_tagline')}</p>
            {[
              { icon: '⚡', text: 'Auto voucher via MikroTik Polling' },
              { icon: '🔧', text: 'Remote MikroTik Management (Winbox-like)' },
              { icon: '📱', text: 'Vodacom, Tigo, Airtel, Halo' },
              { icon: '🔒', text: 'WireGuard VPN — Secure Connection' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textAlign: 'left' }}>
                <span style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem' }}>
            <LanguageSwitcher dark={true} />
          </div>
        </div>

        {/* Right form */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', background: '#fafafa' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.5px' }}>{t('welcome_back')} 👋</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: '1.75rem' }}>{t('login_subtitle')}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('username')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>👤</span>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="username"
                    style={{ width: '100%', padding: '11px 12px 11px 38px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('password')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔒</span>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••"
                    style={{ width: '100%', padding: '11px 38px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}>{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>
              {error && <Alert type="error" message={error} />}
              <button type="submit" disabled={loading} style={{ padding: '12px', background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />{t('logging_in')}</> : `${t('login')} →`}
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>{t('accounts_by_admin')}</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
