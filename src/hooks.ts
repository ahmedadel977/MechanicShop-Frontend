import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, branchesApi, customersApi, dashboardApi, employeesApi, healthApi, invoicesApi, laborsApi, repairTasksApi, settingsApi, workOrdersApi, type AccessScope, type CustomerInput, type OrderState, type RepairTask, type Spot, type WorkOrderFilters } from './api'

const useRefresh = (...keys: string[]) => { const qc=useQueryClient(); return () => keys.forEach(key=>void qc.invalidateQueries({queryKey:[key]})) }
export const useCurrentUser = (enabled=true) => useQuery({queryKey:['me'],queryFn:authApi.currentUser,enabled,retry:false,staleTime:300_000})
export const useLogin = () => useMutation({mutationFn:({email,password}:{email:string;password:string})=>authApi.login(email,password)})
export const useRefreshToken = () => useMutation({mutationFn:authApi.refresh})
export const useLogout = () => useMutation({mutationFn:authApi.logout})
export const useChangePassword = () => useMutation({mutationFn:({currentPassword,newPassword}:{currentPassword:string;newPassword:string})=>authApi.changePassword(currentPassword,newPassword)})
export const useBranches = () => useQuery({queryKey:['branches'],queryFn:branchesApi.list})
export const useBranch = (id?:string) => useQuery({queryKey:['branch',id],queryFn:()=>branchesApi.byId(id!),enabled:Boolean(id)})
export const useBranchEmployees = (id?:string,enabled=true) => useQuery({queryKey:['branchEmployees',id],queryFn:()=>branchesApi.employees(id!),enabled:Boolean(id)&&enabled})
export const useCreateBranch = () => {const refresh=useRefresh('branches');return useMutation({mutationFn:branchesApi.create,onSuccess:refresh})}
export const useSetBranchActive = () => {const refresh=useRefresh('branches','branch');return useMutation({mutationFn:({id,isActive}:{id:string;isActive:boolean})=>branchesApi.setActive(id,isActive),onSuccess:refresh})}
export const useAddBranchEmployee = () => {const refresh=useRefresh('branchEmployees','employees');return useMutation({mutationFn:({branchId,employeeId}:{branchId:string;employeeId:string})=>branchesApi.addEmployee(branchId,employeeId),onSuccess:refresh})}
export const useSetEmployeeAccessScope = () => {const refresh=useRefresh('branchEmployees');return useMutation({mutationFn:({employeeId,accessScope}:{employeeId:string;accessScope:AccessScope})=>branchesApi.setAccessScope(employeeId,accessScope),onSuccess:refresh})}
export const useSetDefaultBranch = () => {const refresh=useRefresh('branches','me');return useMutation({mutationFn:branchesApi.setDefault,onSuccess:refresh})}
export const useCustomers = () => useQuery({queryKey:['customers'],queryFn:customersApi.list})
export const useCustomer = (id?:string) => useQuery({queryKey:['customer',id],queryFn:()=>customersApi.byId(id!),enabled:Boolean(id)})
export const useCreateCustomer = () => {const refresh=useRefresh('customers');return useMutation({mutationFn:customersApi.create,onSuccess:refresh})}
export const useUpdateCustomer = () => {const refresh=useRefresh('customers','customer');return useMutation({mutationFn:({id,data}:{id:string;data:CustomerInput})=>customersApi.update(id,data),onSuccess:refresh})}
export const useDeleteCustomer = () => {const refresh=useRefresh('customers');return useMutation({mutationFn:customersApi.delete,onSuccess:refresh})}
export const useCreateLabor = () => {const refresh=useRefresh('labors','branchEmployees');return useMutation({mutationFn:employeesApi.createLabor,onSuccess:refresh})}
export const useCreateBranchManager = () => {const refresh=useRefresh('branchEmployees');return useMutation({mutationFn:employeesApi.createBranchManager,onSuccess:refresh})}
export const useLabors = () => useQuery({queryKey:['labors'],queryFn:laborsApi.list})
export const useDashboardStats = (date:string) => useQuery({queryKey:['stats',date],queryFn:()=>dashboardApi.stats(date)})
export const useRepairTasks = () => useQuery({queryKey:['repairTasks'],queryFn:repairTasksApi.list})
export const useRepairTask = (id?:string) => useQuery({queryKey:['repairTask',id],queryFn:()=>repairTasksApi.byId(id!),enabled:Boolean(id)})
export const useCreateRepairTask = () => {const refresh=useRefresh('repairTasks');return useMutation({mutationFn:repairTasksApi.create,onSuccess:refresh})}
export const useUpdateRepairTask = () => {const refresh=useRefresh('repairTasks','repairTask');return useMutation({mutationFn:({id,data}:{id:string;data:Omit<RepairTask,'repairTaskId'|'totalCost'>})=>repairTasksApi.update(id,data),onSuccess:refresh})}
export const useDeleteRepairTask = () => {const refresh=useRefresh('repairTasks');return useMutation({mutationFn:repairTasksApi.delete,onSuccess:refresh})}
export const useInvoice = (id?:string) => useQuery({queryKey:['invoice',id],queryFn:()=>invoicesApi.byId(id!),enabled:Boolean(id)})
export const useIssueInvoice = () => {const refresh=useRefresh('invoice','workOrders');return useMutation({mutationFn:invoicesApi.issue,onSuccess:refresh})}
export const useInvoicePdf = () => useMutation({mutationFn:invoicesApi.pdf})
export const useSettleInvoice = () => {const refresh=useRefresh('invoice');return useMutation({mutationFn:invoicesApi.settle,onSuccess:refresh})}
export const useWorkOrders = (filters:WorkOrderFilters={}) => useQuery({queryKey:['workOrders',filters],queryFn:()=>workOrdersApi.list(filters)})
export const useWorkOrder = (id?:string) => useQuery({queryKey:['workOrder',id],queryFn:()=>workOrdersApi.byId(id!),enabled:Boolean(id)})
export const useCreateWorkOrder = () => {const refresh=useRefresh('workOrders','schedule','stats');return useMutation({mutationFn:workOrdersApi.create,onSuccess:refresh})}
export const useRelocateWorkOrder = () => {const refresh=useRefresh('workOrders','workOrder','schedule');return useMutation({mutationFn:({id,newStartAtUtc,newSpot,rowVersion}:{id:string;newStartAtUtc:string;newSpot:Spot;rowVersion:string})=>workOrdersApi.relocate(id,{newStartAtUtc,newSpot,rowVersion}),onSuccess:refresh})}
export const useAssignLabor = () => {const refresh=useRefresh('workOrders','workOrder');return useMutation({mutationFn:({id,laborId,rowVersion}:{id:string;laborId:string;rowVersion:string})=>workOrdersApi.assignLabor(id,laborId,rowVersion),onSuccess:refresh})}
export const useUpdateWorkOrderState = () => {const refresh=useRefresh('workOrders','workOrder','stats');return useMutation({mutationFn:({id,state,rowVersion}:{id:string;state:OrderState;rowVersion:string})=>workOrdersApi.updateState(id,state,rowVersion),onSuccess:refresh})}
export const useUpdateWorkOrderRepairTasks = () => {const refresh=useRefresh('workOrders','workOrder');return useMutation({mutationFn:({id,repairTaskIds,rowVersion}:{id:string;repairTaskIds:string[];rowVersion:string})=>workOrdersApi.updateRepairTasks(id,repairTaskIds,rowVersion),onSuccess:refresh})}
export const useDeleteWorkOrder = () => {const refresh=useRefresh('workOrders','schedule','stats');return useMutation({mutationFn:({id,rowVersion}:{id:string;rowVersion:string})=>workOrdersApi.delete(id,rowVersion),onSuccess:refresh})}
export const useSchedule = (date:string,laborId?:string) => useQuery({queryKey:['schedule',date,laborId],queryFn:()=>workOrdersApi.schedule(date,laborId)})
export const useOperatingHours = () => useQuery({queryKey:['operatingHours'],queryFn:settingsApi.operatingHours})
export const useHealthCheck = () => useQuery({queryKey:['health'],queryFn:healthApi.check,enabled:false,retry:false})

