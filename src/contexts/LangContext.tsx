import { createContext, useContext, useState, type ReactNode } from 'react'

export type Language = 'sw' | 'en'

const T: Record<Language, Record<string, string>> = {
  sw: {
    login:'Ingia', logout:'Toka', username:'Jina la mtumiaji', password:'Neno la siri',
    logging_in:'Inaingia...', welcome_back:'Karibu tena', login_subtitle:'Ingia kwa akaunti yako',
    invalid_credentials:'Jina au neno la siri si sahihi', account_disabled:'Akaunti imezuiwa',
    accounts_by_admin:'Akaunti zinaundwa na msimamizi peke yake',
    dashboard:'Dashibodi', clients:'Wateja', routers:'Routers', packages:'Vifurushi',
    vouchers:'Vouchers', payments:'Malipo', devices:'Vifaa GSM', mikrotik_mgmt:'Simamia MikroTik',
    summary:'Muhtasari wa Leo', total_clients:'Wateja Wote', online_routers:'Zipo Online',
    today_revenue:'Mapato Leo', today_commission:'Commission Leo', vouchers_today:'Vouchers Leo',
    active_devices:'Vifaa Active', my_balance:'Bakaa Yangu', pending_jobs:'Kazi Zinazosubiri',
    system_status:'Hali ya Mfumo', recent_vouchers:'Vouchers za Hivi Karibuni',
    total_routers:'Routers Zote', month_revenue:'Mapato ya Mwezi', today:'Leo',
    add_client:'Ongeza Mteja', business_name:'Jina la Biashara', reference_prefix:'Prefix',
    commission_rate:'Commission (%)', balance:'Bakaa', status:'Hali', active:'Inafanya Kazi',
    inactive:'Imezuiwa', add_balance:'Ongeza Bakaa', current_balance:'Bakaa ya Sasa',
    amount:'Kiasi', save:'Hifadhi', cancel:'Ghairi', create_client:'Unda Mteja',
    auto_generated:'Itatengenezwa automatically', email:'Barua pepe', phone:'Simu',
    activate:'Washa Akaunti', deactivate:'Zima Akaunti', change_password:'Badilisha Password',
    new_password:'Password Mpya', delete_client:'Futa Mteja', confirm_delete:'Thibitisha Kufuta',
    add_router:'Ongeza Router', router_name:'Jina la Router', host:'Host (VPN IP)',
    api_port:'API Port', api_username:'Username ya API', api_password:'Password ya API',
    hotspot_interface:'Interface ya Hotspot', test_connection:'Jaribu Kuunganika',
    sync_packages:'Sync Vifurushi', online:'Online', offline:'Offline', last_seen:'Mwisho Kuonekana',
    never:'Haijawahi', testing:'Inajaribu...', edit_router:'Hariri Router', delete_router:'Futa Router',
    vpn_hint:'Weka VPN IP ya MikroTik (mfano: 10.66.66.2) baada ya kuunganisha WireGuard',
    router_status:'Hali ya Router', interfaces:'Interfaces', ip_addresses:'IP Addresses',
    hotspot_users:'Hotspot Users', active_sessions:'Sessions Active', hotspot_profiles:'Profiles',
    firewall:'Firewall', logs:'Logs', dns:'DNS', bandwidth:'Bandwidth',
    restart_router:'Restart Router', disconnect_session:'Kata Connection',
    delete_user:'Futa User', add_user:'Ongeza User',
    cpu_load:'CPU Load', memory:'Kumbukumbu', uptime:'Muda wa Kufanya Kazi',
    no_sessions:'Hakuna watumiaji waliounganishwa sasa',
    restart_confirm:'Una uhakika unataka kuanza router upya? Wateja wote watakatika.',
    add_package:'Ongeza Kifurushi', package_name:'Jina', price:'Bei (TZS)',
    duration_minutes:'Muda (dakika)', speed_down:'Download (Mbps)', speed_up:'Upload (Mbps)',
    mikrotik_profile:'MikroTik Profile', shared_users:'Shared Users', save_package:'Hifadhi',
    no_packages:'Hakuna vifurushi. Ongeza cha kwanza!',
    code:'Code', customer_phone:'Simu ya Mteja', all:'Zote', used:'Zimetumika', expired:'Zimeisha',
    no_vouchers:'Hakuna vouchers bado',
    no_payments:'Hakuna malipo bado', total_payments:'Jumla ya Malipo',
    my_revenue:'Mapato Yangu', grand_total:'Jumla Kubwa',
    add_device:'Ongeza Device', device_name:'Jina la Device', device_id:'Device ID',
    phone_number:'Namba ya SIM', description:'Maelezo', save_device:'Hifadhi Device',
    no_devices_admin:'Hakuna vifaa. Ongeza A7670E ya kwanza!',
    edit_device:'Hariri Device', device_id_hint:'Lazima iwe sawa na A7670E inayotuma',
    lipa_namba:'Namba za Kulipa', pay_instruction:'Wateja waweke namba ya lipa na reference yako',
    reference:'Reference yako', lipa_number:'Namba ya Lipa', no_devices:'Hakuna GSM devices',
    network:'Mtandao',
    loading:'Inapakia...', no_data:'Hakuna data', error:'Hitilafu', success:'Imefanikiwa',
    delete:'Futa', edit:'Hariri', search:'Tafuta', from_date:'Tangu', to_date:'Hadi',
    actions:'Vitendo', super_admin:'Super Admin', client:'Client', created_at:'Iliundwa',
    app_name:'NetSafi', app_tagline:'Mfumo wa Hotspot Tanzania', refresh:'Sasisha',
    manage:'Simamia',
  },
  en: {
    login:'Login', logout:'Logout', username:'Username', password:'Password',
    logging_in:'Logging in...', welcome_back:'Welcome back', login_subtitle:'Sign in to your account',
    invalid_credentials:'Invalid username or password', account_disabled:'Account disabled',
    accounts_by_admin:'Accounts are created by the administrator only',
    dashboard:'Dashboard', clients:'Clients', routers:'Routers', packages:'Packages',
    vouchers:'Vouchers', payments:'Payments', devices:'GSM Devices', mikrotik_mgmt:'Manage MikroTik',
    summary:"Today's Summary", total_clients:'Total Clients', online_routers:'Online',
    today_revenue:"Today's Revenue", today_commission:"Today's Commission", vouchers_today:"Today's Vouchers",
    active_devices:'Active Devices', my_balance:'My Balance', pending_jobs:'Pending Jobs',
    system_status:'System Status', recent_vouchers:'Recent Vouchers',
    total_routers:'Total Routers', month_revenue:'Month Revenue', today:'Today',
    add_client:'Add Client', business_name:'Business Name', reference_prefix:'Prefix',
    commission_rate:'Commission (%)', balance:'Balance', status:'Status', active:'Active',
    inactive:'Disabled', add_balance:'Add Balance', current_balance:'Current Balance',
    amount:'Amount', save:'Save', cancel:'Cancel', create_client:'Create Client',
    auto_generated:'Auto-generated', email:'Email', phone:'Phone',
    activate:'Activate Account', deactivate:'Deactivate Account', change_password:'Change Password',
    new_password:'New Password', delete_client:'Delete Client', confirm_delete:'Confirm Delete',
    add_router:'Add Router', router_name:'Router Name', host:'Host (VPN IP)',
    api_port:'API Port', api_username:'API Username', api_password:'API Password',
    hotspot_interface:'Hotspot Interface', test_connection:'Test Connection',
    sync_packages:'Sync Packages', online:'Online', offline:'Offline', last_seen:'Last Seen',
    never:'Never', testing:'Testing...', edit_router:'Edit Router', delete_router:'Delete Router',
    vpn_hint:'Enter MikroTik VPN IP (e.g., 10.66.66.2) after connecting WireGuard',
    router_status:'Router Status', interfaces:'Interfaces', ip_addresses:'IP Addresses',
    hotspot_users:'Hotspot Users', active_sessions:'Active Sessions', hotspot_profiles:'Profiles',
    firewall:'Firewall', logs:'Logs', dns:'DNS', bandwidth:'Bandwidth',
    restart_router:'Restart Router', disconnect_session:'Disconnect',
    delete_user:'Delete User', add_user:'Add User',
    cpu_load:'CPU Load', memory:'Memory', uptime:'Uptime',
    no_sessions:'No active sessions',
    restart_confirm:'Are you sure you want to restart? All clients will be disconnected.',
    add_package:'Add Package', package_name:'Name', price:'Price (TZS)',
    duration_minutes:'Duration (minutes)', speed_down:'Download (Mbps)', speed_up:'Upload (Mbps)',
    mikrotik_profile:'MikroTik Profile', shared_users:'Shared Users', save_package:'Save',
    no_packages:'No packages yet. Add your first one!',
    code:'Code', customer_phone:'Customer Phone', all:'All', used:'Used', expired:'Expired',
    no_vouchers:'No vouchers yet',
    no_payments:'No payments yet', total_payments:'Total Payments',
    my_revenue:'My Revenue', grand_total:'Grand Total',
    add_device:'Add Device', device_name:'Device Name', device_id:'Device ID',
    phone_number:'SIM Number', description:'Description', save_device:'Save Device',
    no_devices_admin:'No devices. Add your first A7670E!',
    edit_device:'Edit Device', device_id_hint:'Must match the A7670E device_id',
    lipa_namba:'Payment Numbers', pay_instruction:'Customers enter the lipa number and your reference',
    reference:'Your Reference', lipa_number:'Lipa Number', no_devices:'No GSM devices configured',
    network:'Network',
    loading:'Loading...', no_data:'No data', error:'Error', success:'Success',
    delete:'Delete', edit:'Edit', search:'Search', from_date:'From', to_date:'To',
    actions:'Actions', super_admin:'Super Admin', client:'Client', created_at:'Created',
    app_name:'NetSafi', app_tagline:'Modern Hotspot Management Tanzania', refresh:'Refresh',
    manage:'Manage',
  }
}

interface LangCtx { lang: Language; setLang:(l:Language)=>void; t:(key:string)=>string }
const LangContext = createContext<LangCtx|null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => (localStorage.getItem('ns_lang') as Language) || 'sw')
  const setLang = (l: Language) => { setLangState(l); localStorage.setItem('ns_lang', l) }
  const t = (key: string): string => T[lang][key] || T['sw'][key] || key
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => { const ctx = useContext(LangContext); if (!ctx) throw new Error('useLang'); return ctx }

export function LanguageSwitcher({ dark=true }: { dark?: boolean }) {
  const { lang, setLang } = useLang()
  return (
    <div style={{ display:'flex', gap:3, background: dark?'rgba(255,255,255,0.08)':'var(--gray-100)', borderRadius:8, padding:3 }}>
      {(['sw','en'] as Language[]).map(l => (
        <button key={l} onClick={() => setLang(l)} style={{ padding:'4px 10px', borderRadius:6, border:'none', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s', background: lang===l ? (dark?'#6366f1':'var(--primary)') : 'transparent', color: lang===l ? '#fff' : (dark?'rgba(255,255,255,0.5)':'var(--gray-500)') }}>
          {l==='sw' ? '🇹🇿 SW' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  )
}
