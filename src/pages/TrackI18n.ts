import { useLang } from '../contexts/LangContext'

const D: Record<string, [string, string]> = {
  title: ['Ufuatiliaji wa Voucher', 'Voucher Tracking'],
  subtitle: ['Ingiza voucher ya mteja uone historia yake yote na matatizo yoyote', "Enter a customer's voucher to see its full history and any problems"],
  ph: ['Andika au bandika code ya voucher', 'Type or paste the voucher code'], search: ['Tafuta', 'Search'], recent: ['Zilizotafutwa karibuni', 'Recent searches'],
  hint: ['Mteja akipiga simu akiwa na tatizo la voucher, muombe akutumie code kisha iingize hapa.', 'When a customer calls about a voucher, ask them to send the code and enter it here.'],
  not_found: ['Voucher haikupatikana', 'Voucher not found'],
  not_found_sub: ['Hakikisha code imeandikwa vizuri. Unaweza kutafuta vouchers za routers za account yako tu.', 'Check the code is typed correctly. You can only look up vouchers on your own routers.'],
  not_found_admin: ['Hakikisha code imeandikwa vizuri (herufi kubwa au ndogo hazijalishi).', 'Check the code is typed correctly (upper or lower case does not matter).'],
  code_required: ['Andika code ya voucher kwanza.', 'Enter a voucher code first.'], err_net: ['Hitilafu ya mtandao. Jaribu tena.', 'Network error. Please try again.'],
  copy: ['Nakili', 'Copy'], copied: ['Imenakiliwa', 'Copied'],
  s_unused: ['Haijatumika', 'Not used yet'], s_running: ['Inatumika', 'In use'], s_expired: ['Imeisha', 'Expired'],
  client: ['Mteja wa mfumo', 'Account'], router: ['Router', 'Router'], online: ['Online', 'Online'], offline: ['Offline', 'Offline'],
  issues_found: ['Matatizo yamegunduliwa', 'Problems detected'], no_issues: ['Hakuna tatizo lililoonekana kwenye mfumo', 'No problems found in the system'],
  no_issues_sub: ['Hii ni kulingana na data ya mfumo. Bonyeza "Angalia kwenye router" kuthibitisha hali halisi.', 'This is based on system data. Press "Check on router" to confirm the real state.'],
  tl_created: ['Imeundwa', 'Created'], tl_started: ['Imeanza kutumika', 'First used'], tl_ends: ['Inaisha', 'Ends'], tl_ended: ['Iliisha', 'Ended'],
  tl_not_started: ['Bado haijatumika', 'Not used yet'], tl_starts_on_use: ['Muda utaanza kuhesabiwa itakapotumika', 'The time starts counting when it is first used'],
  remaining: ['Imebaki', 'Remaining'], elapsed: ['Imetumika', 'Elapsed'], total_time: ['Muda wa package', 'Package duration'],
  package: ['Package', 'Package'], duration: ['Muda', 'Duration'], speed: ['Kasi (juu / chini)', 'Speed (up / down)'], price: ['Bei', 'Price'], phone: ['Simu ya mteja', 'Customer phone'],
  origin: ['Chanzo', 'Source'], o_payment: ['Malipo ya simu', 'Mobile payment'], o_manual: ['Imeundwa kwa mkono', 'Created manually'], batch: ['Kundi la kuchapisha', 'Print batch'],
  payment: ['Malipo', 'Payment'], amount: ['Kiasi', 'Amount'], txn: ['Namba ya muamala', 'Transaction ID'], network: ['Mtandao', 'Network'], status: ['Hali', 'Status'], when: ['Lini', 'When'],
  tech: ['Maelezo ya kiufundi', 'Technical details'], jobs: ['Kazi za router', 'Router jobs'], presences: ['Nakala kwenye routers', 'Copies on routers'], sms: ['SMS ya voucher', 'Voucher SMS'],
  none: ['Hakuna', 'None'], retries: ['Marudio', 'Retries'], error: ['Kosa', 'Error'],
  live_btn: ['Angalia kwenye router', 'Check on router'], live_busy: ['Inaangalia router…', 'Checking router…'], live_title: ['Hali halisi kwenye router', 'Live state on the router'],
  live_note: ['Inaunganika na router moja kwa moja, inaweza kuchukua hadi sekunde 10.', 'Connects to the router directly; may take up to 10 seconds.'],
  l_exists: ['Ipo kwenye router', 'Exists on router'], l_missing: ['Haipo kwenye router', 'Not on the router'], l_profile: ['Profile', 'Profile'], l_uptime: ['Muda uliotumika / kikomo', 'Used / limit'],
  l_traffic: ['Data (pakua / pakia)', 'Data (down / up)'], l_active: ['Mtandaoni sasa', 'Online now'], l_not_active: ['Haijaunganishwa sasa', 'Not connected now'], l_sched: ['Scheduler ya kuisha', 'Expiry scheduler'], l_disabled: ['Imezimwa', 'Disabled'],
  ok_yes: ['Ndiyo', 'Yes'], ok_no: ['Hapana', 'No'],
  e_router_unreachable: ['Router "{router}" haipatikani sasa hivi.', 'Router "{router}" is not reachable right now.'], e_router_error: ['Router ilijibu kwa kosa: {detail}', 'The router replied with an error: {detail}'],
  p_completed: ['Imekamilika', 'Completed'], p_processing: ['Inachakatwa', 'Processing'], p_pending: ['Inasubiri', 'Pending'], p_failed: ['Imeshindwa', 'Failed'], p_duplicate: ['Rudufu', 'Duplicate'], p_invalid: ['Si sahihi', 'Invalid'],
  j_pending: ['Inasubiri', 'Pending'], j_processing: ['Inachakatwa', 'Processing'], j_completed: ['Imekamilika', 'Completed'], j_failed: ['Imeshindwa', 'Failed'],
  r_active: ['Ipo', 'Active'], r_removed: ['Imeondolewa', 'Removed'], r_failed: ['Imeshindwa', 'Failed'],
  m_queued: ['Inasubiri', 'Queued'], m_taken: ['Imechukuliwa', 'Picked up'], m_sent: ['Imetumwa', 'Sent'], m_failed: ['Imeshindwa', 'Failed'],
  d_min: ['dakika {n}', '{n} min'], d_hour: ['saa {n}', '{n} h'], d_day: ['siku {n}', '{n} d'],
  i_job_failed: ['Kazi ya kuunda voucher kwenye router imeshindwa (marudio {retries}). Mteja anaweza kuwa amelipa bila kupata voucher inayofanya kazi. Kosa: {error}', 'The job that creates the voucher on the router failed ({retries} retries). The customer may have paid without a working voucher. Error: {error}'],
  i_job_stuck: ['Kazi ya kuunda voucher imekwama ({status}) kwa zaidi ya dakika 10.', 'The voucher creation job has been stuck ({status}) for over 10 minutes.'],
  i_payment_status: ['Malipo ya voucher hii bado hayajakamilika (hali: {status}).', 'The payment for this voucher is not completed (status: {status}).'],
  i_sync_missing: ['Wakati wa ulinganisho, voucher haikuonekana kwenye router tangu {since}. Huenda ilifutwa kwenye router.', 'During the last sync the voucher was missing on the router since {since}. It may have been deleted there.'],
  i_router_offline: ['Router "{router}" iko offline{seen}. Mteja hawezi kuitumia hadi router irudi.', 'Router "{router}" is offline{seen}. The customer cannot use it until the router is back.'],
  i_presence_failed: ['Voucher haikuundwa kwenye router "{router}" ({error}).', 'The voucher could not be created on router "{router}" ({error}).'],
  i_used_elsewhere: ['Nakala ya router "{router}" iliondolewa kwa sababu voucher ilitumika router nyingine. Hii ni kawaida.', 'The copy on router "{router}" was removed because the voucher was used on another router. This is normal.'],
  i_sms_failed: ['SMS yenye voucher kwa mteja imeshindwa kutumwa. Mpe mteja code hii kwa simu.', 'The SMS with the voucher failed to send. Give the customer this code by phone.'],
  i_sms_stuck: ['SMS ya voucher imekaa kwenye foleni zaidi ya dakika 10 bila kutumwa.', 'The voucher SMS has been queued for over 10 minutes without being sent.'],
  i_expired: ['Voucher hii muda wake umeisha, haiwezi kutumika tena.', 'This voucher has expired and can no longer be used.'],
  i_expires_soon: ['Voucher inaisha baada ya dakika {minutes}.', 'The voucher expires in {minutes} minutes.'],
  i_live_user_missing: ['Haipo kwenye router. Mteja hawezi kuingia nayo.', 'Not found on the router. The customer cannot log in with it.'],
  i_live_disabled: ['Imezimwa kwenye router, kwa hiyo mteja hawezi kuingia.', 'It is disabled on the router, so the customer cannot log in.'],
}

export function useTt() {
  const { lang } = useLang()
  const i = lang === 'sw' ? 0 : 1
  const t = (k: string, v?: Record<string, any>) => {
    let s = D[k]?.[i] ?? k
    if (v) for (const [a, b] of Object.entries(v)) s = s.split(`{${a}}`).join(String(b))
    return s
  }
  const loc = lang === 'sw' ? 'sw-TZ' : 'en-GB'
  const dt = (x: any) => (x ? new Date(x).toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' }) : '—')
  return { t, dt, lang }
}
