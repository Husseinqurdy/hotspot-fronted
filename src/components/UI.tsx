import type { ReactNode } from 'react';


export function StatCard({ title, value, subtitle, icon, color }: { title: string; value: string|number; subtitle?: string; icon: string | React.ReactNode; color: string }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:'1.1rem', boxShadow:'var(--card-shadow)', border:'1px solid var(--gray-100)', minWidth:0 }}>
      <div style={{ width:40, height:40, background:`${color}18`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:10 }}>{icon}</div>
      <p style={{ fontSize:12, color:'var(--gray-500)', marginBottom:3, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</p>
      <p style={{ fontSize:20, fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.5px', lineHeight:1.2 }}>{value}</p>
      {subtitle && <p style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{subtitle}</p>}
    </div>
  )
}

export function Table({ headers, rows, emptyMessage='Hakuna data', loading }: { headers: string[]; rows: (string|number|ReactNode)[][]; emptyMessage?: string; loading?: boolean }) {
  return (
    <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, minWidth:500 }}>
        <thead>
          <tr>{headers.map((h,i) => <th key={i} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--gray-500)', background:'var(--gray-50)', borderBottom:'1px solid var(--gray-100)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan={headers.length} style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}><Spinner /></td></tr>
          : rows.length===0 ? <tr><td colSpan={headers.length} style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}><div style={{ fontSize:28, marginBottom:8 }}>📭</div>{emptyMessage}</td></tr>
          : rows.map((row,i) => (
            <tr key={i} style={{ borderBottom:'1px solid var(--gray-50)', transition:'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background='#fafaff')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
              {row.map((cell,j) => <td key={j} style={{ padding:'11px 14px', color:'var(--gray-700)', verticalAlign:'middle' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type BC = 'green'|'red'|'yellow'|'blue'|'purple'|'indigo'|'gray'|'teal'|'orange'
const BCM: Record<BC,{bg:string;color:string}> = {
  green:{bg:'#d1fae5',color:'#065f46'}, red:{bg:'#fee2e2',color:'#991b1b'},
  yellow:{bg:'#fef3c7',color:'#92400e'}, blue:{bg:'#dbeafe',color:'#1e40af'},
  purple:{bg:'#ede9fe',color:'#5b21b6'}, indigo:{bg:'#e0e7ff',color:'#3730a3'},
  gray:{bg:'#f3f4f6',color:'#374151'}, teal:{bg:'#ccfbf1',color:'#065f46'},
  orange:{bg:'#ffedd5',color:'#9a3412'},
}
export function Badge({ text, color='gray' }: { text: string; color?: BC }) {
  const c = BCM[color]
  return <span style={{ background:c.bg, color:c.color, padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600, display:'inline-flex', alignItems:'center', whiteSpace:'nowrap' }}>{text}</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', gap:12, flexWrap:'wrap' }}>
      <div>
        <h1 style={{ fontSize:'clamp(18px, 4vw, 22px)', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.3px' }}>{title}</h1>
        {subtitle && <div style={{ color:'var(--gray-500)', marginTop:4, fontSize:14 }}>{subtitle}</div>}
      </div>
      {action && <div style={{ flexShrink:0 }}>{action}</div>}
    </div>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:'#fff', borderRadius:14, boxShadow:'var(--card-shadow)', border:'1px solid var(--gray-100)', overflow:'hidden', ...style }}>{children}</div>
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ padding:'0.9rem 1.25rem', borderBottom:'1px solid var(--gray-100)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
      <h2 style={{ fontSize:14, fontWeight:700, color:'var(--gray-800)' }}>{title}</h2>
      {action}
    </div>
  )
}

type BV = 'primary'|'success'|'danger'|'ghost'|'warning'
const BVM: Record<BV, React.CSSProperties> = {
  primary:{background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff',boxShadow:'0 2px 8px rgba(99,102,241,0.3)',border:'none'},
  success:{background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',boxShadow:'0 2px 8px rgba(16,185,129,0.3)',border:'none'},
  danger:{background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',boxShadow:'0 2px 8px rgba(239,68,68,0.3)',border:'none'},
  warning:{background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',boxShadow:'0 2px 8px rgba(245,158,11,0.3)',border:'none'},
  ghost:{background:'#fff',color:'var(--gray-700)',border:'1px solid var(--gray-200)'},
}
export function Button({ children, onClick, type='button', variant='primary', disabled, size='md', icon, style }: { children: ReactNode; onClick?: () => void; type?: 'button'|'submit'; variant?: BV; disabled?: boolean; size?: 'sm'|'md'; icon?: string; style?: React.CSSProperties }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ padding:size==='sm'?'5px 12px':'9px 18px', borderRadius:8, fontSize:size==='sm'?12:14, fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.65:1, display:'inline-flex', alignItems:'center', gap:5, transition:'all 0.15s', whiteSpace:'nowrap', ...BVM[variant], ...style }}>
      {icon && <span style={{ fontSize:size==='sm'?13:15 }}>{icon}</span>}{children}
    </button>
  )
}

export function Input({ label, error, ...props }: { label?: string; error?: string; [k: string]: any }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-700)' }}>{label}</label>}
      <input {...props} style={{ padding:'9px 11px', border:`1.5px solid ${error?'var(--danger)':'var(--gray-200)'}`, borderRadius:8, fontSize:14, outline:'none', width:'100%', background:'#fff', color:'var(--gray-800)', transition:'border-color 0.15s', ...props.style }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor=error?'var(--danger)':'var(--gray-200)'} />
      {error && <span style={{ fontSize:11, color:'var(--danger)' }}>{error}</span>}
    </div>
  )
}

export function Select({ label, children, ...props }: { label?: string; children: ReactNode; [k: string]: any }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-700)' }}>{label}</label>}
      <select {...props} style={{ padding:'9px 11px', border:'1.5px solid var(--gray-200)', borderRadius:8, fontSize:14, outline:'none', width:'100%', background:'#fff', color:'var(--gray-800)', ...props.style }}>{children}</select>
    </div>
  )
}

export function Modal({ open, onClose, title, children, width=480 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:width, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'modalIn 0.2s ease' }}>
        <div style={{ padding:'1.1rem 1.25rem', borderBottom:'1px solid var(--gray-100)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--gray-900)' }}>{title}</h3>
          <button onClick={onClose} style={{ width:28, height:28, background:'var(--gray-100)', border:'none', borderRadius:7, cursor:'pointer', fontSize:14, color:'var(--gray-500)', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ padding:'1.25rem' }}>{children}</div>
      </div>
    </div>
  )
}

export function Alert({ type, message }: { type: 'success'|'error'|'warning'|'info'; message: string }) {
  const s = { success:{bg:'var(--success-light)',color:'#065f46',icon:'✅'}, error:{bg:'var(--danger-light)',color:'#991b1b',icon:'❌'}, warning:{bg:'var(--warning-light)',color:'#92400e',icon:'⚠️'}, info:{bg:'var(--info-light)',color:'#1e40af',icon:'ℹ️'} }[type]
  return <div style={{ background:s.bg, color:s.color, padding:'10px 13px', borderRadius:8, fontSize:13, display:'flex', alignItems:'flex-start', gap:8, animation:'fadeIn 0.2s ease' }}><span style={{ flexShrink:0 }}>{s.icon}</span>{message}</div>
}

export function Spinner({ size=18 }: { size?: number }) {
  return <span style={{ width:size, height:size, border:'2px solid var(--gray-200)', borderTopColor:'var(--primary)', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>{children}</div>
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8, flexWrap:'wrap' }}>{children}</div>
}

export function Tabs({ tabs, active, onChange }: { tabs:{key:string;label:string;icon?:string}[]; active:string; onChange:(k:string)=>void }) {
  return (
    <div style={{ display:'flex', gap:4, borderBottom:'2px solid var(--gray-100)', marginBottom:'1.25rem', overflowX:'auto', flexShrink:0 }}>
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)} style={{ padding:'8px 14px', border:'none', background:'transparent', fontSize:13, fontWeight:600, cursor:'pointer', borderBottom:`2px solid ${active===tab.key?'var(--primary)':'transparent'}`, color:active===tab.key?'var(--primary)':'var(--gray-500)', marginBottom:-2, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5, transition:'all 0.15s' }}>
          {tab.icon && <span>{tab.icon}</span>}{tab.label}
        </button>
      ))}
    </div>
  )
}

export function InfoRow({ label, value }: { label: string; value: string|number }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--gray-50)' }}>
      <span style={{ fontSize:13, color:'var(--gray-500)', fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:13, color:'var(--gray-800)', fontWeight:600, fontFamily:'monospace', maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{value}</span>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger=false }: { open:boolean; onClose:()=>void; onConfirm:()=>void; title:string; message:string; danger?:boolean }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'1rem' }}>
      <div style={{ background:'#fff', borderRadius:14, padding:'1.5rem', maxWidth:380, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'modalIn 0.2s ease' }}>
        <div style={{ fontSize:32, textAlign:'center', marginBottom:12 }}>{danger ? '⚠️' : '❓'}</div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'var(--gray-900)', textAlign:'center', marginBottom:8 }}>{title}</h3>
        <p style={{ fontSize:14, color:'var(--gray-600)', textAlign:'center', marginBottom:'1.5rem', lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex', gap:10 }}>
          <Button variant="ghost" onClick={onClose} style={{ flex:1 }}>Ghairi</Button>
          <Button variant={danger?'danger':'primary'} onClick={() => { onConfirm(); onClose() }} style={{ flex:1 }}>Thibitisha</Button>
        </div>
      </div>
    </div>
  )
}
