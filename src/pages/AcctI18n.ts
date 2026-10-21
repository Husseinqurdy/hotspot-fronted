import { useLang } from '../contexts/LangContext'

// [Kiswahili, English] — inafuata kitufe cha lugha cha app (SW / EN)
const D: Record<string, [string, string]> = {
  title: ['Uhasibu', 'Accounting'],
  subtitle: ['Vitabu vya kampuni — vimetengwa na malipo na vouchers za mfumo', 'Company books — kept separate from system payments and vouchers'],
  dl_xlsx: ['Pakua Excel', 'Download Excel'], dl_pdf: ['Pakua PDF', 'Download PDF'],
  site: ['Site', 'Site'], all: ['Zote', 'All'], company: ['Kampuni nzima', 'Whole company'], inactive: ['imezimwa', 'inactive'],
  from: ['Kuanzia', 'From'], to: ['Hadi', 'To'],
  tab_summary: ['Muhtasari', 'Summary'], tab_entries: ['Rekodi', 'Records'], tab_sites: ['Sites', 'Sites'], tab_logs: ['Logs', 'Logs'],
  profit: ['Faida', 'Profit'], loss: ['Hasara', 'Loss'], all_sites: ['Sites zote', 'All sites'], start: ['mwanzo', 'start'], now: ['leo', 'today'],
  income: ['Mapato', 'Income'], expense: ['Matumizi', 'Expenses'], assets: ['Mali (assets)', 'Assets'], liabilities: ['Madeni', 'Liabilities'],
  loans_out: ['Mikopo isiyolipwa', 'Outstanding loans'], equity: ['Mtaji (equity)', 'Equity'],
  hero_sub: ['Mapato {i} − Matumizi {e}', 'Income {i} − Expenses {e}'],
  chart_monthly: ['Mapato na matumizi kwa mwezi', 'Income and expenses by month'], chart_monthly_sub: ['Kiasi kwa TZS', 'Amounts in TZS'],
  chart_site: ['Faida kwa site', 'Profit by site'], chart_site_sub: ['Nani anaingiza, nani anapoteza', 'Who earns, who loses'],
  chart_exp: ['Matumizi kwa kundi', 'Expenses by category'], chart_exp_sub: ['Pesa inaenda wapi', 'Where the money goes'],
  chart_inc: ['Mapato kwa kundi', 'Income by category'], chart_inc_sub: ['Pesa inatoka wapi', 'Where the money comes from'],
  profit_loss: ['Faida / Hasara', 'Profit / Loss'], col_assets: ['Mali', 'Assets'], col_liab: ['Madeni', 'Liabilities'], col_loans: ['Mikopo', 'Loans'],
  empty_period: ['Bado hakuna rekodi kwenye kipindi hiki. Anza kwa kuongeza rekodi kwenye kichupo cha Rekodi.', 'No records in this period yet. Start by adding one in the Records tab.'],
  add_entry: ['Ongeza rekodi', 'Add record'], none_entries: ['Hakuna rekodi kwenye kipindi hiki.', 'No records in this period.'],
  col_date: ['Tarehe', 'Date'], col_type: ['Aina', 'Type'], col_desc: ['Maelezo', 'Description'], col_amount: ['Kiasi', 'Amount'], col_status: ['Hali', 'Status'],
  voided: ['Imefutwa', 'Deleted'], edit: ['Hariri', 'Edit'], del: ['Futa', 'Delete'], balance: ['bakaa', 'balance'], rate: ['riba', 'interest'],
  add_site: ['Ongeza site', 'Add site'], no_sites: ['Bado hakuna site. Ongeza ya kwanza.', 'No sites yet. Add the first one.'],
  col_name: ['Jina', 'Name'], active: ['Inatumika', 'Active'], disabled: ['Imezimwa', 'Disabled'],
  user: ['Mtumiaji', 'User'], all_m: ['Wote', 'Everyone'], action: ['Kitendo', 'Action'], all_n: ['Vyote', 'All'],
  col_when: ['Lini', 'When'], col_who: ['Nani', 'Who'], no_logs: ['Hakuna logs.', 'No logs.'],
  a_open: ['Ameingia sehemu hii', 'Opened this section'], a_create: ['Ameongeza rekodi', 'Added a record'], a_update: ['Amebadilisha rekodi', 'Edited a record'],
  a_void: ['Amefuta rekodi', 'Deleted a record'], a_export: ['Amepakua ripoti', 'Downloaded a report'],
  a_site_create: ['Ameunda site', 'Created a site'], a_site_update: ['Amebadilisha site', 'Edited a site'],
  k_income: ['Mapato', 'Income'], k_expense: ['Matumizi', 'Expense'], k_asset: ['Mali (asset)', 'Asset'], k_liability: ['Deni (liability)', 'Liability'],
  k_loan: ['Mkopo', 'Loan'], k_loan_payment: ['Marejesho ya mkopo', 'Loan repayment'],
  modal_new: ['Rekodi mpya', 'New record'], modal_edit: ['Hariri rekodi', 'Edit record'], f_loan: ['Mkopo', 'Loan'], pick_loan: ['Chagua mkopo', 'Choose a loan'],
  f_amount: ['Kiasi (TZS)', 'Amount (TZS)'], f_cat: ['Kundi (mf. Umeme, Mshahara)', 'Category (e.g. Electricity, Salaries)'], f_rate: ['Riba (%)', 'Interest (%)'],
  save: ['Hifadhi', 'Save'], cancel: ['Ghairi', 'Cancel'],
  void_title: ['Futa rekodi', 'Delete record'],
  void_note: ['{k} ya {a} ({d}) itaondolewa kwenye hesabu, lakini itabaki kwenye vitabu na logs.', '{k} of {a} ({d}) will be removed from the totals but will stay in the books and logs.'],
  void_reason: ['Sababu (inahitajika)', 'Reason (required)'],
  del_site: ['Futa site', 'Delete site'],
  del_site_note: ['Site "{n}" itafutwa kabisa. Inawezekana tu ikiwa haina rekodi yoyote; ikiwa ina rekodi, izime badala yake.', 'Site "{n}" will be permanently deleted. This only works if it has no records; if it does, disable it instead.'],
  msg_site_deleted: ['Site imefutwa.', 'Site deleted.'], a_site_delete: ['Amefuta site', 'Deleted a site'],
  site_new: ['Site mpya', 'New site'], site_edit: ['Hariri site', 'Edit site'], site_name: ['Jina la site', 'Site name'], site_note: ['Maelezo (hiari)', 'Note (optional)'],
  keeps_old: ['Imezimwa (rekodi za zamani zinabaki)', 'Disabled (old records stay)'],
  msg_added: ['Rekodi imeongezwa.', 'Record added.'], msg_updated: ['Rekodi imebadilishwa.', 'Record updated.'],
  msg_voided: ['Rekodi imewekewa alama ya kufutwa. Inabaki kwenye vitabu.', 'Record marked as deleted. It stays in the books.'], msg_site: ['Site imehifadhiwa.', 'Site saved.'],
  err_net: ['Hitilafu ya mtandao. Jaribu tena.', 'Network error. Please try again.'], err_dl: ['Imeshindwa kupakua.', 'Download failed.'],
  cum_profit: ['Faida jumuishi', 'Cumulative profit'], no_data: ['Hakuna data ya kuonyesha kwenye kipindi hiki.', 'No data to display for this period.'],
  site_hint: ["Chagua 'Zote' kwenye Site ili kulinganisha sites.", "Choose 'All' under Site to compare sites."],
  no_cat: ['Hakuna rekodi za kundi hili.', 'No records in this category.'], total_tzs: ['Jumla (TZS)', 'Total (TZS)'], other: ['Nyingine', 'Other'],
  nocat: ['Bila kundi', 'No category'], equity_sub: ['Mali − madeni − mikopo', 'Assets − liabilities − loans'],
  reason: ['Sababu', 'Reason'], file: ['Faili', 'File'], none: ['Hakuna mabadiliko', 'No changes'],
}

// Ujumbe wa makosa unaotoka backend (Kiswahili) → Kiingereza
const BE: Record<string, string> = {
  'Kiasi lazima kiwe zaidi ya sifuri.': 'Amount must be greater than zero.',
  'Site hii imezimwa.': 'This site is disabled.',
  'Chagua mkopo halali.': 'Choose a valid loan.',
  'Inatumika kwa marejesho ya mkopo tu.': 'Only used for loan repayments.',
  'Riba ni kwa mkopo tu.': 'Interest applies to loans only.',
  'Rekodi iliyofutwa haiwezi kubadilishwa.': 'A deleted record cannot be edited.',
  'Aina na mkopo wa rekodi haviwezi kubadilishwa. Futa rekodi kisha iunde upya.': 'Type and loan cannot be changed. Delete the record and create it again.',
  'Sababu inahitajika.': 'A reason is required.',
  'Rekodi tayari imefutwa.': 'Record is already deleted.',
  'Mkopo una marejesho. Futa marejesho kwanza.': 'This loan has repayments. Delete the repayments first.',
  'Superadmin pekee.': 'Superadmin only.',
  'Tarehe si sahihi (YYYY-MM-DD).': 'Invalid date (YYYY-MM-DD).',
  'Tarehe ya kuanza iko baada ya ya mwisho.': 'Start date is after the end date.',
  'Site si sahihi.': 'Invalid site.',
  'Site ina rekodi, haiwezi kufutwa. Izime badala yake.': 'This site has records and cannot be deleted. Disable it instead.',
}
const BE_RE: [RegExp, string][] = [
  [/Marejesho yanazidi bakaa ya mkopo \(([\d,.]+)\)\./, 'Repayment exceeds the loan balance ($1).'],
  [/Mkopo umeshalipwa ([\d,.]+); kiasi hakiwezi kuwa chini ya hicho\./, 'This loan has already been repaid $1; the amount cannot be lower.'],
]

export function useTr() {
  const { lang } = useLang()
  const i = lang === 'sw' ? 0 : 1
  const t = (k: string, vars?: Record<string, string>) => {
    let s = D[k]?.[i] ?? k
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, b)
    return s
  }
  // majina yanayotoka backend: 'Kampuni nzima', 'Bila kundi'
  const be = (s: string) => (s === 'Kampuni nzima' ? t('company') : s === 'Bila kundi' ? t('nocat') : s)
  const msg = (s: string) => {
    if (lang === 'sw') return s
    if (BE[s]) return BE[s]
    for (const [re, to] of BE_RE) if (re.test(s)) return s.replace(re, to)
    return s
  }
  return { t, be, msg, lang }
}
