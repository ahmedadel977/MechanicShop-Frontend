import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5106', headers: { Accept: 'application/json' } })
type Tokens = { accessToken: string; refreshToken: string; expiresOnUtc: string }
export type CurrentUser = { userId: string; email: string; roles: string[]; branchId?: string | null; accessScope: number }
export type Branch = { branchId: string; name: string; code: string; isActive: boolean }
export type Stats = { date: string; total: number; scheduled: number; inProgress: number; completed: number; cancelled: number; totalRevenue: number; netProfit: number; completionRate: number }
export type Order = { workOrderId: string; rowVersion: string; customer?: string; labor?: string; state: number; spot: number; startAtUtc: string; endAtUtc: string; vehicle: { make: string; model: string; licensePlate: string }; repairTasks: string[] }

const tokenKey = 'mechanicshop.tokens'
export const getTokens = (): Tokens | null => { try { return JSON.parse(localStorage.getItem(tokenKey) || 'null') } catch { return null } }
const setTokens = (tokens: Tokens | null) => tokens ? localStorage.setItem(tokenKey, JSON.stringify(tokens)) : localStorage.removeItem(tokenKey)
api.interceptors.request.use(config => { const tokens = getTokens(); if (tokens?.accessToken) config.headers.Authorization = `Bearer ${tokens.accessToken}`; return config })
let refreshing: Promise<Tokens | null> | null = null
api.interceptors.response.use(response => response, async error => {
  const original = error.config
  if (error.response?.status === 401 && !original._retried && !original.url?.includes('/identity/')) {
    const tokens = getTokens(); if (!tokens?.refreshToken) { setTokens(null); window.dispatchEvent(new Event('auth:expired')); return Promise.reject(error) }
    original._retried = true
    refreshing ??= axios.post<Tokens>(`${api.defaults.baseURL}/identity/token/refresh-token`, { expiredAccessToken: tokens.accessToken, refreshToken: tokens.refreshToken }).then(r => { setTokens(r.data); return r.data }).catch(() => { setTokens(null); window.dispatchEvent(new Event('auth:expired')); return null }).finally(() => { refreshing = null })
    const next = await refreshing; if (next) { original.headers.Authorization = `Bearer ${next.accessToken}`; return api(original) }
  }
  return Promise.reject(error)
})
export const signIn = async (email: string, password: string) => { const { data } = await api.post<Tokens>('/identity/token/generate', { email, password }); setTokens(data); return data }
export const signOut = async () => { try { await api.post('/identity/logout') } finally { setTokens(null) } }
export const currentUser = async () => (await api.get<CurrentUser>('/identity/current-user/claims')).data
export const getBranches = async () => (await api.get<Branch[]>('/api/v1.0/branches')).data
export const getStats = async (date: string) => (await api.get<Stats>('/api/v1.0/dashboard/stats', { params: { date } })).data
export const getOrders = async () => (await api.get<{ items?: Order[] } | Order[]>('/api/v1.0/workorders', { params: { page: 1, pageSize: 8, sortColumn: 'StartAtUtc', sortDirection: 'desc' } })).data
