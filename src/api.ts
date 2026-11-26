import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''
export const api = axios.create({ baseURL, headers: { Accept: 'application/json' } })
export type Tokens = { accessToken: string; refreshToken: string; expiresOnUtc: string }
export type AccessScope = 0 | 1
export type CurrentUser = { userId: string; email: string; roles: string[]; claims: { type: string; value: string }[]; branchId: string | null; accessScope: AccessScope }
export type Branch = { branchId: string; name: string; code: string; isActive: boolean }
export type BranchEmployee = { employeeId: string; name: string; role: number | string; accessScope: AccessScope; isDefault: boolean }
export type EmployeeAccount = { employeeId: string; email: string; role: number | string; accessScope: AccessScope; branchId: string }
export type Labor = { laborId: string; name: string }
export type Vehicle = { vehicleId: string; make: string; model: string; year: number; licensePlate: string }
export type VehicleInput = { vehicleId?: string; make: string; model: string; year: number; licensePlate: string }
export type Customer = { customerId: string; name: string; phoneNumber: string; email: string; vehicles: Vehicle[] }
export type CustomerInput = { name: string; phoneNumber: string; email: string; vehicles: VehicleInput[] }
export type Part = { partId?: string; name: string; cost: number; quantity: number }
export type RepairTask = { repairTaskId: string; name: string; estimatedDurationInMins: number; laborCost: number; totalCost: number; parts: Part[] }
export type OrderState = 0 | 1 | 2 | 3
export type Spot = 0 | 1 | 2 | 3
export type WorkOrder = { workOrderId: string; branchId: string; rowVersion: string; invoiceId?: string | null; vehicle?: Vehicle | null; customer?: string | null; labor?: Labor | null; state: OrderState; spot: Spot; startAtUtc: string; endAtUtc: string; repairTasks: RepairTask[] | string[]; totalPartCost?: number; totalLaborCost?: number; totalCost?: number; totalDurationInMins?: number; createdAt?: string }
export type Page<T> = { pageNumber: number; pageSize: number; totalPages: number; totalCount: number; items: T[] }
export type WorkOrderFilters = { page?: number; pageSize?: number; searchTerm?: string; sortColumn?: string; sortDirection?: string; state?: OrderState; vehicleId?: string; laborId?: string; startDateFrom?: string; startDateTo?: string; endDateFrom?: string; endDateTo?: string; spot?: Spot }
export type Stats = { date: string; total: number; scheduled: number; inProgress: number; completed: number; cancelled: number; totalRevenue: number; totalPartsCost: number; totalLaborCost: number; netProfit: number; profitMargin: number; completionRate: number; averageRevenuePerOrder: number; uniqueVehicles: number; uniqueCustomers: number }
export type ScheduleSlot = { workOrderId?: string | null; spot: Spot; startAt: string; endAt: string; vehicle?: string; labor?: Labor; isOccupied: boolean; isAvailable?: boolean; workOrderLocked: boolean; state?: OrderState; repairTasks?: RepairTask[] }
export type Schedule = { onDate: string; endOfDay: boolean; spots: { spot: Spot; slots: ScheduleSlot[] }[] }
export type Invoice = { invoiceId: string; workOrderId: string; issuedAtUtc: string; customer?: Customer; vehicle?: Vehicle; discountAmount?: number; subtotal: number; taxAmount: number; total: number; paymentStatus?: string; items: { invoiceId: string; lineNumber: number; description?: string | null; quantity: number; unitPrice: number; lineTotal: number }[] }
export type OperatingHours = { openingTime: string; closingTime: string }
export type HealthReport = { status: string; checks: { name: string; status: string; description?: string }[] }

const tokenKey = 'mechanicshop.tokens'
export const getTokens = (): Tokens | null => { try { return JSON.parse(localStorage.getItem(tokenKey) || 'null') as Tokens | null } catch { return null } }
const saveTokens = (tokens: Tokens | null) => tokens ? localStorage.setItem(tokenKey, JSON.stringify(tokens)) : localStorage.removeItem(tokenKey)
api.interceptors.request.use(config => { const token = getTokens()?.accessToken; if (token) config.headers.Authorization = `Bearer ${token}`; return config })
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }
let refreshing: Promise<Tokens | null> | null = null
api.interceptors.response.use(r => r, async (error: AxiosError) => {
  const original = error.config as RetriableConfig | undefined
  if (error.response?.status === 401 && original && !original._retried && !original.url?.includes('/identity/')) {
    const tokens = getTokens()
    if (!tokens) { saveTokens(null); window.dispatchEvent(new Event('auth:expired')); throw error }
    original._retried = true
    refreshing ??= axios.post<Tokens>(`${baseURL}/identity/token/refresh-token`, { refreshToken: tokens.refreshToken, expiredAccessToken: tokens.accessToken }).then(r => { saveTokens(r.data); return r.data }).catch(() => { saveTokens(null); window.dispatchEvent(new Event('auth:expired')); return null }).finally(() => { refreshing = null })
    const renewed = await refreshing
    if (renewed) { original.headers.Authorization = `Bearer ${renewed.accessToken}`; return api(original) }
  }
  throw error
})
export const apiErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : 'حدث خطأ غير متوقع.'
  if (error.response?.status === 409) return 'تعارض في التعديل: تغيرت البيانات على الخادم. حدّث البيانات وحاول مجددًا.'
  const data = error.response?.data as { detail?: string; title?: string; errors?: Record<string, string[]> } | undefined
  if (data?.errors) return Object.values(data.errors).flat().join(' · ')
  if (data?.detail || data?.title) return [data.title, data.detail].filter(Boolean).join(': ')
  if (error.response?.status === 401) return 'انتهت الجلسة أو بيانات الدخول غير صحيحة.'
  if (error.response?.status === 403) return 'ليست لديك صلاحية لتنفيذ هذا الإجراء.'
  return error.message || 'تعذر الاتصال بالخادم.'
}
export const isConcurrencyConflict = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 409
const v1 = '/api/v1.0'
export const authApi = {
  login: async (email: string, password: string) => { const { data } = await api.post<Tokens>('/identity/token/generate', { email, password }); saveTokens(data); return data },
  refresh: async () => { const t = getTokens(); if (!t) throw new Error('لا توجد جلسة نشطة.'); const { data } = await api.post<Tokens>('/identity/token/refresh-token', { refreshToken: t.refreshToken, expiredAccessToken: t.accessToken }); saveTokens(data); return data },
  logout: async () => { try { await api.post('/identity/logout') } finally { saveTokens(null) } },
  changePassword: async (currentPassword: string, newPassword: string) => { await api.post('/identity/change-password', { currentPassword, newPassword }) },
  currentUser: async () => (await api.get<CurrentUser>('/identity/current-user/claims')).data,
}
export const branchesApi = {
  list: async () => (await api.get<Branch[]>(`${v1}/branches`)).data,
  byId: async (id: string) => (await api.get<Branch>(`${v1}/branches/${id}`)).data,
  employees: async (id: string) => (await api.get<BranchEmployee[]>(`${v1}/branches/${id}/employees`)).data,
  create: async (data: { name: string; code: string }) => (await api.post<Branch>(`${v1}/branches`, data)).data,
  setActive: async (id: string, isActive: boolean) => { await api.put(`${v1}/branches/${id}/active`, { isActive }) },
  addEmployee: async (branchId: string, employeeId: string) => { await api.post(`${v1}/branches/${branchId}/employees/${employeeId}`) },
  setAccessScope: async (employeeId: string, accessScope: AccessScope) => { await api.put(`${v1}/branches/employees/${employeeId}/access-scope`, { accessScope }) },
  setDefault: async (branchId: string) => { await api.put(`${v1}/branches/me/default`, { branchId }) },
}
export const customersApi = {
  list: async () => (await api.get<Customer[]>(`${v1}/customers`)).data,
  byId: async (id: string) => (await api.get<Customer>(`${v1}/customers/${id}`)).data,
  create: async (data: CustomerInput) => (await api.post<Customer>(`${v1}/customers`, data)).data,
  update: async (id: string, data: CustomerInput) => { await api.put(`${v1}/customers/${id}`, data) },
  delete: async (id: string) => { await api.delete(`${v1}/customers/${id}`) },
}
export const employeesApi = {
  createLabor: async (data: { firstName: string; lastName: string; email: string; password: string; branchId: string }) => (await api.post<EmployeeAccount>(`${v1}/employees/labors`, data)).data,
  createBranchManager: async (data: { firstName: string; lastName: string; email: string; password: string; branchId: string }) => (await api.post<EmployeeAccount>(`${v1}/employees/branch-managers`, data)).data,
}
export const laborsApi = { list: async () => (await api.get<Labor[]>(`${v1}/labors`)).data }
export const dashboardApi = { stats: async (date: string) => (await api.get<Stats>(`${v1}/dashboard/stats`, { params: { date } })).data }
export const repairTasksApi = {
  list: async () => (await api.get<RepairTask[]>(`${v1}/repair-tasks`)).data,
  byId: async (id: string) => (await api.get<RepairTask>(`${v1}/repair-tasks/${id}`)).data,
  create: async (data: Omit<RepairTask, 'repairTaskId'|'totalCost'>) => (await api.post<RepairTask>(`${v1}/repair-tasks`, data)).data,
  update: async (id: string, data: Omit<RepairTask, 'repairTaskId'|'totalCost'>) => (await api.put<RepairTask>(`${v1}/repair-tasks/${id}`, data)).data,
  delete: async (id: string) => { await api.delete(`${v1}/repair-tasks/${id}`) },
}
export const invoicesApi = {
  issue: async (workOrderId: string) => (await api.post<Invoice>(`${v1}/invoices/workorders/${workOrderId}`)).data,
  byId: async (id: string) => (await api.get<Invoice>(`${v1}/invoices/${id}`)).data,
  pdf: async (id: string) => (await api.get<Blob>(`${v1}/invoices/${id}/pdf`, { responseType: 'blob' })).data,
  settle: async (id: string) => { await api.put(`${v1}/invoices/${id}/payments`) },
}
export const workOrdersApi = {
  list: async (filters: WorkOrderFilters = {}) => (await api.get<Page<WorkOrder>>(`${v1}/workorders`, { params: { page: 1, pageSize: 20, ...filters } })).data,
  byId: async (id: string) => (await api.get<WorkOrder>(`${v1}/workorders/${id}`)).data,
  create: async (data: { spot: Spot; vehicleId: string; branchId?: string; repairTaskIds: string[]; laborId: string; startAtUtc: string }) => (await api.post<WorkOrder>(`${v1}/workorders`, data)).data,
  relocate: async (id: string, data: { newStartAtUtc: string; newSpot: Spot; rowVersion: string }) => { await api.put(`${v1}/workorders/${id}/relocation`, data) },
  assignLabor: async (id: string, laborId: string, rowVersion: string) => { await api.put(`${v1}/workorders/${id}/labor`, { laborId, rowVersion }) },
  updateState: async (id: string, state: OrderState, rowVersion: string) => { await api.put(`${v1}/workorders/${id}/state`, { state, rowVersion }) },
  updateRepairTasks: async (id: string, repairTaskIds: string[], rowVersion: string) => { await api.put(`${v1}/workorders/${id}/repair-task`, { repairTaskIds, rowVersion }) },
  delete: async (id: string, rowVersion: string) => { await api.delete(`${v1}/workorders/${id}`, { headers: { 'If-Match': `\"${rowVersion}\"` } }) },
  schedule: async (date: string, laborId?: string, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo') => (await api.get<Schedule>(`${v1}/workorders/schedule/${date}`, { params: laborId ? { laborId } : undefined, headers: { 'X-TimeZone': timeZone } })).data,
}
export const settingsApi = { operatingHours: async () => (await api.get<OperatingHours>('/api/settings/operating-hours')).data }
export const healthApi = { check: async () => (await api.get<HealthReport>('/health')).data }
