import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../lib/api'

interface User { id: number; username: string; email: string; role: 'superadmin'|'client'; full_name: string }
interface ClientInfo { id: number; business_name: string; identifier: number; balance: string } // ✅
interface AuthCtx { user: User|null; clientInfo: ClientInfo|null; login:(u:string,p:string)=>Promise<void>; logout:()=>void; isLoading:boolean; isSuperAdmin:boolean; isClient:boolean }

const AuthContext = createContext<AuthCtx|null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User|null>(null)
  const [clientInfo, setClientInfo] = useState<ClientInfo|null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const u = localStorage.getItem('ns_user'); const c = localStorage.getItem('ns_client')
    if (u && localStorage.getItem('ns_access')) { setUser(JSON.parse(u)); if (c) setClientInfo(JSON.parse(c)) }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('ns_access', data.access); localStorage.setItem('ns_refresh', data.refresh)
    localStorage.setItem('ns_user', JSON.stringify(data.user))
    if (data.client) { localStorage.setItem('ns_client', JSON.stringify(data.client)); setClientInfo(data.client) }
    setUser(data.user)
  }

  const logout = () => {
    ['ns_access','ns_refresh','ns_user','ns_client'].forEach(k => localStorage.removeItem(k))
    setUser(null); setClientInfo(null); window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, clientInfo, login, logout, isLoading, isSuperAdmin: user?.role==='superadmin', isClient: user?.role==='client' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth'); return ctx }