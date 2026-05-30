import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL || 'https://api.umemeswahili.co.tz/api'
const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ns_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('ns_refresh')
        const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh })
        localStorage.setItem('ns_access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch { localStorage.clear(); window.location.href = '/login' }
    }
    return Promise.reject(error)
  }
)
export default api
