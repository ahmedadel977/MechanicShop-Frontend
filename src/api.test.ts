import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AxiosHeaders, type AxiosAdapter, type AxiosError } from 'axios'
import { api, apiErrorMessage, authApi, branchesApi, customersApi, dashboardApi, employeesApi, healthApi, invoicesApi, laborsApi, repairTasksApi, settingsApi, workOrdersApi } from './api'

type Seen={method:string;url:string;headers:Record<string,unknown>;data:unknown}
const id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
let seen:Seen[]=[]
let originalAdapter:typeof api.defaults.adapter
const storage=new Map<string,string>()

describe('backend endpoint coverage',()=>{
  beforeEach(()=>{
    seen=[]
    originalAdapter=api.defaults.adapter
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v),removeItem:(k:string)=>storage.delete(k)}})
    api.defaults.adapter=((async config=>{
      seen.push({method:(config.method??'get').toUpperCase(),url:config.url??'',headers:(config.headers as AxiosHeaders).toJSON(),data:typeof config.data==='string'?JSON.parse(config.data):config.data})
      return {data:{accessToken:'access',refreshToken:'refresh',expiresOnUtc:'2030-01-01T00:00:00Z'},status:200,statusText:'OK',headers:new AxiosHeaders(),config}
    }) as AxiosAdapter)
  })
  afterEach(()=>{api.defaults.adapter=originalAdapter;storage.clear()})
  it('issues requests for every REST route discovered in the backend',async()=>{
    await authApi.login('manager@example.com','secret')
    await authApi.refresh()
    await authApi.currentUser()
    await authApi.changePassword('old-password','new-password')
    await authApi.logout()

    await branchesApi.list(); await branchesApi.byId(id); await branchesApi.employees(id)
    await branchesApi.create({name:'North',code:'NTH'}); await branchesApi.setActive(id,false)
    await branchesApi.addEmployee(id,id); await branchesApi.setAccessScope(id,0); await branchesApi.setDefault(id)

    await customersApi.list(); await customersApi.byId(id)
    const customer={name:'A Customer',phoneNumber:'+201000000000',email:'a@example.com',vehicles:[{make:'Ford',model:'Focus',year:2022,licensePlate:'ABC123'}]}
    await customersApi.create(customer); await customersApi.update(id,customer); await customersApi.delete(id)
    await employeesApi.createLabor({firstName:'A',lastName:'Tech',email:'a@example.com',password:'password',branchId:id})
    await employeesApi.createBranchManager({firstName:'B',lastName:'Manager',email:'b@example.com',password:'password',branchId:id})
    await laborsApi.list(); await dashboardApi.stats('2026-11-26')

    const task={name:'Oil change',laborCost:400,estimatedDurationInMins:60,parts:[{name:'Oil',cost:500,quantity:1}]}
    await repairTasksApi.list(); await repairTasksApi.byId(id); await repairTasksApi.create(task); await repairTasksApi.update(id,task); await repairTasksApi.delete(id)
    await invoicesApi.issue(id); await invoicesApi.byId(id); await invoicesApi.pdf(id); await invoicesApi.settle(id)

    await workOrdersApi.list({page:2,pageSize:10,searchTerm:'Ford'})
    await workOrdersApi.byId(id)
    await workOrdersApi.create({vehicleId:id,branchId:id,laborId:id,repairTaskIds:[id],spot:0,startAtUtc:'2026-11-26T12:00:00Z'})
    await workOrdersApi.relocate(id,{newStartAtUtc:'2026-11-26T13:00:00Z',newSpot:1,rowVersion:'AQID'})
    await workOrdersApi.assignLabor(id,id,'AQID'); await workOrdersApi.updateState(id,1,'AQID')
    await workOrdersApi.updateRepairTasks(id,[id],'AQID'); await workOrdersApi.delete(id,'AQID')
    await workOrdersApi.schedule('2026-11-26',id,'Africa/Cairo')
    await settingsApi.operatingHours(); await healthApi.check()

    const expected=[
      ['POST','/identity/token/generate'],['POST','/identity/token/refresh-token'],['GET','/identity/current-user/claims'],['POST','/identity/change-password'],['POST','/identity/logout'],
      ['GET','/api/v1.0/branches'],['GET',`/api/v1.0/branches/${id}`],['GET',`/api/v1.0/branches/${id}/employees`],['POST','/api/v1.0/branches'],['PUT',`/api/v1.0/branches/${id}/active`],['POST',`/api/v1.0/branches/${id}/employees/${id}`],['PUT',`/api/v1.0/branches/employees/${id}/access-scope`],['PUT','/api/v1.0/branches/me/default'],
      ['GET','/api/v1.0/customers'],['GET',`/api/v1.0/customers/${id}`],['POST','/api/v1.0/customers'],['PUT',`/api/v1.0/customers/${id}`],['DELETE',`/api/v1.0/customers/${id}`],
      ['POST','/api/v1.0/employees/labors'],['POST','/api/v1.0/employees/branch-managers'],['GET','/api/v1.0/labors'],['GET','/api/v1.0/dashboard/stats'],
      ['GET','/api/v1.0/repair-tasks'],['GET',`/api/v1.0/repair-tasks/${id}`],['POST','/api/v1.0/repair-tasks'],['PUT',`/api/v1.0/repair-tasks/${id}`],['DELETE',`/api/v1.0/repair-tasks/${id}`],
      ['POST',`/api/v1.0/invoices/workorders/${id}`],['GET',`/api/v1.0/invoices/${id}`],['GET',`/api/v1.0/invoices/${id}/pdf`],['PUT',`/api/v1.0/invoices/${id}/payments`],
      ['GET','/api/v1.0/workorders'],['GET',`/api/v1.0/workorders/${id}`],['POST','/api/v1.0/workorders'],['PUT',`/api/v1.0/workorders/${id}/relocation`],['PUT',`/api/v1.0/workorders/${id}/labor`],['PUT',`/api/v1.0/workorders/${id}/state`],['PUT',`/api/v1.0/workorders/${id}/repair-task`],['DELETE',`/api/v1.0/workorders/${id}`],['GET','/api/v1.0/workorders/schedule/2026-11-26'],
      ['GET','/api/settings/operating-hours'],['GET','/health'],
    ]
    expect(seen.map(x=>[x.method,x.url])).toEqual(expected)
    const deleteOrder=seen.find(x=>x.url===`/api/v1.0/workorders/${id}`&&x.method==='DELETE')!
    expect(deleteOrder.headers['If-Match']).toBe('"AQID"')
    const schedule=seen.find(x=>x.url==='/api/v1.0/workorders/schedule/2026-11-26')!
    expect(schedule.headers['X-TimeZone']).toBe('Africa/Cairo')
  })
  it('surfaces the backend RowVersion conflict with a refresh instruction',()=>{
    const error={isAxiosError:true,response:{status:409,data:{title:'Conflict'}}} as AxiosError
    expect(apiErrorMessage(error)).toContain('conflict')
  })
})
