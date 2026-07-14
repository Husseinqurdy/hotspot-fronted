import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'https://us.umemeswahili.com/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Ambatanisha access token kwenye kila request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ns_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Fanya logout iwe consistent kila mahali (badala ya localStorage.clear())
function forceLogout() {
  ;['ns_access', 'ns_refresh', 'ns_user', 'ns_client'].forEach((k) => localStorage.removeItem(k))
  window.location.href = '/login'
}

// Zuia mzunguko wa maombi mengi ya refresh yakitokea kwa wakati mmoja
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token as string)
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem('ns_refresh')

      // Hakuna refresh token -> logout moja kwa moja, usijaribu chochote
      if (!refresh) {
        forceLogout()
        return Promise.reject(error)
      }

      // Kama refresh tayari inaendelea, subiri iishe kisha jaribu tena request hii
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh })
        localStorage.setItem('ns_access', data.access)
        // Kama backend inarudisha refresh mpya (rotation), ihifadhi pia
        if (data.refresh) localStorage.setItem('ns_refresh', data.refresh)

        api.defaults.headers.common.Authorization = `Bearer ${data.access}`
        original.headers.Authorization = `Bearer ${data.access}`

        processQueue(null, data.access)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        forceLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api