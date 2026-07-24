import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang, LanguageSwitcher } from '../contexts/LangContext'
import { Alert } from '../components/UI'

// ── Inline SVG icons ──────────────────────────────────────
const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IcoLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IcoEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const IcoEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const IcoArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IcoSpin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'lgSpin 0.7s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

// Feature icons
const IcoZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const IcoTool = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)

const IcoPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
)

const IcoShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const FEATURES = [
  { Ico: IcoZap,    text: 'Auto voucher via MikroTik Polling' },
  { Ico: IcoTool,   text: 'Remote MikroTik Management' },
  { Ico: IcoPhone,  text: 'Vodacom · Tigo · Airtel · Halo' },
  { Ico: IcoShield, text: 'Secure Connection' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null)

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
    <>
      <style>{`
        @keyframes lgSpin    { to { transform:rotate(360deg) } }
        @keyframes lgFadeUp  { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes lgFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes lgFloat   { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes lgPulse   { 0%,100% { opacity:.4; transform:scale(1) } 50% { opacity:.7; transform:scale(1.08) } }
        @keyframes lgOrbit   {
          0%   { transform:translate(-50%,-50%) rotate(0deg)   translate(90px) rotate(0deg) }
          100% { transform:translate(-50%,-50%) rotate(360deg) translate(90px) rotate(-360deg) }
        }

        .lg-wrap {
          min-height:100vh; display:grid;
          grid-template-columns:1fr 1fr;
        }
        .lg-brand { 
          background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%);
          display:flex; flex-direction:column; justify-content:center; align-items:center;
          padding:3rem 2rem; position:relative; overflow:hidden; min-height:100vh;
        }
        .lg-form-side {
          display:flex; flex-direction:column; justify-content:center; align-items:center;
          padding:3rem 2rem; background:#fafafa; min-height:100vh;
        }

        .lg-feature {
          display:flex; align-items:center; gap:12px; margin-bottom:12px;
          animation:lgFadeUp 0.4s ease both;
        }
        .lg-feature-icon {
          width:34px; height:34px; border-radius:10px;
          background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.08);
          display:flex; align-items:center; justify-content:center;
          color:rgba(165,180,252,0.9); flex-shrink:0;
          transition:background 0.2s;
        }
        .lg-feature:hover .lg-feature-icon { background:rgba(99,102,241,0.25); }

        .lg-input-wrap { position:relative; }
        .lg-input-icon {
          position:absolute; left:12px; top:50%; transform:translateY(-50%);
          color:#9ca3af; pointer-events:none; display:flex;
          transition:color 0.15s;
        }
        .lg-input {
          width:100%; padding:12px 12px 12px 40px;
          border:1.5px solid #e5e7eb; border-radius:10px;
          font-size:14px; outline:none; background:#fff;
          box-sizing:border-box; transition:border-color 0.15s, box-shadow 0.15s;
          color:#111827;
        }
        .lg-input:focus {
          border-color:#6366f1;
          box-shadow:0 0 0 3px rgba(99,102,241,0.12);
        }
        .lg-input.focused ~ .lg-input-icon,
        .lg-input:focus ~ .lg-input-icon { color:#6366f1; }
        .lg-input-icon.focused { color:#6366f1; }

        .lg-eye-btn {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#9ca3af; cursor:pointer; padding:2px;
          display:flex; align-items:center; transition:color 0.15s;
          border-radius:4px;
        }
        .lg-eye-btn:hover { color:#6366f1; }
        .lg-eye-btn:focus-visible { outline:2px solid #6366f1; outline-offset:2px; }

        .lg-submit {
          width:100%; padding:13px; border:none; border-radius:10px;
          font-size:15px; font-weight:700; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:transform 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .lg-submit:not(:disabled) {
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          color:#fff;
          box-shadow:0 4px 14px rgba(99,102,241,0.35);
        }
        .lg-submit:not(:disabled):hover {
          transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(99,102,241,0.45);
        }
        .lg-submit:not(:disabled):active { transform:scale(0.98); }
        .lg-submit:disabled {
          background:#a5b4fc; color:#fff; cursor:not-allowed;
        }

        .lg-logo {
          animation:lgFloat 4s ease-in-out infinite;
        }

        /* Orbiting dots */
        .lg-orbit-dot {
          position:absolute; top:50%; left:50%;
          width:6px; height:6px; border-radius:50%;
          background:rgba(165,180,252,0.4);
          animation:lgOrbit linear infinite;
        }

        /* Language switcher — desktop: pinned to bottom-left of the brand panel.
           On mobile the panel shrinks to fit its content, so pinning it
           absolutely risks overlapping the last feature row. We fix that
           below by dropping it into normal flow on small screens instead. */
        .lg-lang-switcher {
          position:absolute; bottom:1.5rem; left:1.5rem; z-index:2;
          animation:lgFadeIn 0.6s ease 0.5s both;
        }

        /* Responsive */
        @media (max-width:768px) {
          .lg-wrap { grid-template-columns:1fr; }
          .lg-brand { min-height:auto; padding:2.5rem 1.5rem 2.5rem; }
          .lg-form-side { min-height:auto; padding:2.5rem 1.5rem; }

          /* Take the switcher out of absolute positioning entirely on
             mobile — let it sit in normal flow below the features list,
             centered, with its own breathing room. This guarantees it
             can never overlap content above it, regardless of height. */
          .lg-lang-switcher {
            position:static;
            display:flex; justify-content:center;
            margin:28px auto 0;
          }
        }
        @media (max-width:480px) {
          .lg-brand { padding:2rem 1.25rem 2rem; }
          .lg-form-side { padding:2rem 1.25rem; }
        }
      `}</style>

      <div className="lg-wrap">

        {/* ── LEFT: Branding ── */}
        <div className="lg-brand">
          {/* Decorative rings */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.04)',
              width: `${(i + 1) * 180}px`, height: `${(i + 1) * 180}px`,
              top: '45%', left: '50%', transform: 'translate(-50%,-50%)',
              animation: `lgPulse ${3 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="lg-orbit-dot" style={{
              animationDuration: `${6 + i * 2}s`,
              animationDelay: `${i * 2}s`,
              width: i === 0 ? 8 : i === 1 ? 5 : 6,
              height: i === 0 ? 8 : i === 1 ? 5 : 6,
              background: i === 0 ? 'rgba(165,180,252,0.6)' : i === 1 ? 'rgba(99,102,241,0.5)' : 'rgba(196,181,253,0.4)',
              top: i === 0 ? '45%' : i === 1 ? '40%' : '50%',
            }} />
          ))}

          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', maxWidth: 360, zIndex: 1 }}>
            {/* Logo */}
            <div className="lg-logo" style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/netsafi2.png"
                alt="NetSafi"
                style={{
                  width: 88, height: 88, objectFit: 'contain',
                  borderRadius: 22,
                  boxShadow: '0 0 40px rgba(99,102,241,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.05)',
                  padding: 4,
                }}
              />
            </div>

            <h1 style={{
              fontSize: 'clamp(28px,5vw,40px)', fontWeight: 900,
              letterSpacing: '-1px', marginBottom: 8,
              animation: 'lgFadeUp 0.5s ease both',
            }}>NetSafi</h1>

            <p style={{
              fontSize: 14, color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7, marginBottom: '2rem',
              animation: 'lgFadeUp 0.5s ease 0.1s both',
            }}>
              {t('app_tagline')}
            </p>

            {/* Features */}
            <div style={{ textAlign: 'left' }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="lg-feature" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <div className="lg-feature-icon"><f.Ico /></div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Language switcher — sits as a direct child of .lg-brand (not
              inside the content wrapper) so its "position:absolute" on
              desktop is measured against the full-height panel, exactly
              like before. On mobile the media query turns it into normal
              flow — since it's still the last element in the DOM here, it
              simply appears right after the content, below the features. */}
          <div className="lg-lang-switcher">
            <LanguageSwitcher dark={true} />
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="lg-form-side">
          <div style={{ width: '100%', maxWidth: 400, animation: 'lgFadeUp 0.5s ease 0.15s both' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800,
                color: '#0f172a', marginBottom: 6, letterSpacing: '-0.5px',
              }}>
                {t('welcome_back')}
              </h2>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{t('login_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {t('username')}
                </label>
                <div className="lg-input-wrap">
                  <span className={`lg-input-icon${focusedField === 'username' ? ' focused' : ''}`}>
                    <IcoUser />
                  </span>
                  <input
                    type="text"
                    className="lg-input"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="username"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {t('password')}
                </label>
                <div className="lg-input-wrap">
                  <span className={`lg-input-icon${focusedField === 'password' ? ' focused' : ''}`}>
                    <IcoLock />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="lg-input"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ paddingRight: 42 }}
                  />
                  <button type="button" className="lg-eye-btn" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Ficha' : 'Onyesha'}>
                    {showPass ? <IcoEyeOff /> : <IcoEye />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ animation: 'lgFadeUp 0.3s ease' }}>
                  <Alert type="error" message={error} />
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="lg-submit" disabled={loading}>
                {loading
                  ? <><IcoSpin /> {t('logging_in')}</>
                  : <>{t('login')} <IcoArrow /></>
                }
              </button>
            </form>

            {/* Footer note */}
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
              {t('accounts_by_admin')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
