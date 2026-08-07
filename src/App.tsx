import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LangProvider, useLang } from './contexts/LangContext'
import LoginPage from './pages/LoginPage'
import {
  AdminDashboard, AdminClients, AdminDevices, AdminRouters, AdminPayments, AdminVouchers, AdminAds,
  ClientDashboard, ClientRouters, ClientPackages, ClientPayments,
} from './pages/AllPages'
import { AdminMikroTikPage, ClientMikroTikPage } from './pages/MikroTikManager'
import { VoucherManagementPage } from './pages/VoucherManagement'
import { ClientWithdraw, AdminWithdrawalRequests } from './pages/WithdrawPages'
import type { JSX } from 'react'
import { AnalysisPage } from './pages/AnalysisPage'

// ── PAGE TITLE — inabadilika kulingana na lugha iliyochaguliwa ──
const PAGE_TITLE: Record<string, string> = {
  sw: 'NetSafi – Mfumo wa Kusimamia Hotspot & Voucher Internet',
  en: 'NetSafi – Hotspot & Voucher Internet Management System',
}

function PageTitleSync() {
  const { lang } = useLang()
  useEffect(() => {
    document.title = PAGE_TITLE[lang] || PAGE_TITLE.sw
  }, [lang])
  return null
}

function Guard({ children, role }: { children: JSX.Element; role: string }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #e5e7eb', borderTopColor:'#6366f1', borderRadius:'50%', margin:'0 auto 12px', animation:'spin 0.8s linear infinite' }} />
        <p style={{ color:'#6b7280', fontSize:14, fontWeight:500 }}>NetSafi...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'superadmin' ? '/admin/dashboard' : '/client/dashboard'} replace />
  return children
}

function Redirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'superadmin' ? '/admin/dashboard' : '/client/dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <PageTitleSync />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<Guard role="superadmin"><AdminDashboard /></Guard>} />
            <Route path="/admin/clients" element={<Guard role="superadmin"><AdminClients /></Guard>} />
            <Route path="/admin/devices" element={<Guard role="superadmin"><AdminDevices /></Guard>} />
            <Route path="/admin/routers" element={<Guard role="superadmin"><AdminRouters /></Guard>} />
            <Route path="/admin/mikrotik" element={<Guard role="superadmin"><AdminMikroTikPage /></Guard>} />
            <Route path="/admin/payments" element={<Guard role="superadmin"><AdminPayments /></Guard>} />
            <Route path="/admin/vouchers" element={<Guard role="superadmin"><AdminVouchers /></Guard>} />
            <Route path="/admin/ads" element={<Guard role="superadmin"><AdminAds /></Guard>} />
            <Route path="/admin/requests" element={<Guard role="superadmin"><AdminWithdrawalRequests /></Guard>} />
            


            {/* Client */}
            <Route path="/client/dashboard" element={<Guard role="client"><ClientDashboard /></Guard>} />
            <Route path="/client/routers" element={<Guard role="client"><ClientRouters /></Guard>} />
            <Route path="/client/mikrotik" element={<Guard role="client"><ClientMikroTikPage /></Guard>} />
            <Route path="/client/packages" element={<Guard role="client"><ClientPackages /></Guard>} />
            <Route path="/client/vouchers" element={<Guard role="client"><VoucherManagementPage /></Guard>} />
            <Route path="/client/payments" element={<Guard role="client"><ClientPayments /></Guard>} />
            <Route path="/client/analysis" element={<Guard role="client"><AnalysisPage /></Guard>} />
            <Route path="/client/withdraw" element={<Guard role="client"><ClientWithdraw /></Guard>} />
            

            <Route path="/" element={<Redirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
