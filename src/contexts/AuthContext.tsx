import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../lib/api'

interface User { id: number; username: string; email: string; role: 'superadmin'|'client'; full_name: string }
interface ClientInfo { id: number; business_name: string; identifier: number; balance: string } // ✅
interface AuthCtx { user: User|null; clientInfo: ClientInfo|null; login:(u:string,p:string)=>Promise<void>; logout:()=>void; isLoading:boolean; isSuperAdmin:boolean; isClient:boolean }

const AuthContext = createContext<AuthCtx|null>(null)

// Muda wa kutokuwa na shughuli kabla ya auto-logout (dakika 15)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User|null>(null)
  const [clientInfo, setClientInfo] = useState<ClientInfo|null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    ['ns_access','ns_refresh','ns_user','ns_client'].forEach(k => localStorage.removeItem(k))
    setUser(null); setClientInfo(null); window.location.href = '/login'
  }

  // 1) Wakati wa mount: usiamini localStorage tu, thibitisha na server
  useEffect(() => {
    const verifySession = async () => {
      const u = localStorage.getItem('ns_user')
      const token = localStorage.getItem('ns_access')

      if (u && token) {
        try {
          const { data } = await api.get('/auth/me/')
          setUser(data.user)
          localStorage.setItem('ns_user', JSON.stringify(data.user))

          if (data.client) {
            setClientInfo(data.client)
            localStorage.setItem('ns_client', JSON.stringify(data.client))
          } else {
            setClientInfo(null)
            localStorage.removeItem('ns_client')
          }
        } catch {
          // Token si halali au imeisha muda -> futa kila kitu
          ;['ns_access','ns_refresh','ns_user','ns_client'].forEach(k => localStorage.removeItem(k))
          setUser(null)
          setClientInfo(null)
        }
      }
      setIsLoading(false)
    }
    verifySession()
  }, [])

  // 2) Auto-logout endapo hakuna shughuli kwa muda mrefu
  useEffect(() => {
    if (!user) return

    let timer: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        logout()
      }, INACTIVITY_TIMEOUT_MS)
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(ev => window.addEventListener(ev, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach(ev => window.removeEventListener(ev, resetTimer))
    }
  }, [user])

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('ns_access', data.access); localStorage.setItem('ns_refresh', data.refresh)
    localStorage.setItem('ns_user', JSON.stringify(data.user))
    if (data.client) { localStorage.setItem('ns_client', JSON.stringify(data.client)); setClientInfo(data.client) }
    setUser(data.user)
  }

  return (
    <AuthContext.Provider value={{ user, clientInfo, login, logout, isLoading, isSuperAdmin: user?.role==='superadmin', isClient: user?.role==='client' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth'); return ctx }