import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, ArrowDownLeft, Bell, BriefcaseBusiness, CalendarDays, CarFront, Check, ChevronDown, CircleDollarSign, ClipboardList, Gauge, LogOut, Menu, Search, Settings, ShieldCheck, Users, Wrench, X } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { currentUser, getBranches, getOrders, getStats, signIn, signOut, type Branch, type CurrentUser, type Order, type Stats } from './api'

const nav = [
  { to: '/', label: 'لوحة التحكم', icon: Gauge }, { to: '/workorders', label: 'أوامر الشغل', icon: ClipboardList },
  { to: '/schedule', label: 'جدول المواعيد', icon: CalendarDays }, { to: '/customers', label: 'العملاء والمركبات', icon: CarFront },
  { to: '/branches', label: 'الفروع', icon: BriefcaseBusiness }, { to: '/team', label: 'الفريق', icon: Users },
  { to: '/reports', label: 'التقارير', icon: Activity },
]
const stateLabel = ['مجدول', 'قيد التنفيذ', 'مكتمل', 'ملغي']
const currency = new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })
const dateToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date())
function ErrorBox({ error }: { error: Error }) { return <div className="error-box" role="alert"><strong>تعذر تحميل البيانات</strong><span>{error.message}</span><button onClick={() => window.location.reload()}>إعادة المحاولة</button></div> }
function Login() {
  const schema = z.object({ email: z.email('أدخل بريدًا إلكترونيًا صحيحًا'), password: z.string().min(1, 'كلمة المرور مطلوبة') })
  type Form = z.infer<typeof schema>
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })
  const navigate = useNavigate(); const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: (v: Form) => signIn(v.email, v.password), onSuccess: () => navigate('/', { replace: true }), onError: (e: Error) => setError(e.message) })
  return <main className="login-screen"><div className="login-card"><div className="brand-mark"><Wrench size={22}/></div><p className="eyebrow">إدارة ورشتك بسهولة</p><h1>أهلًا بعودتك</h1><p className="muted">سجّل الدخول لمتابعة أعمال الورشة</p><form onSubmit={handleSubmit(v => mutation.mutate(v))}>
    <label>البريد الإلكتروني<input autoComplete="username" type="email" dir="ltr" {...register('email')}/>{errors.email && <small>{errors.email.message}</small>}</label>
    <label>كلمة المرور<input autoComplete="current-password" type="password" {...register('password')}/>{errors.password && <small>{errors.password.message}</small>}</label>
    {error && <div className="inline-error">تعذر تسجيل الدخول. تحقق من البيانات واتصال الخادم.</div>}
    <button className="primary-btn full" disabled={mutation.isPending}>{mutation.isPending ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}</button></form><p className="login-foot">اتصال آمن ومشفّر · صلاحياتك يحددها حسابك</p></div></main>
}
function App() {
  const location = useLocation(); const navigate = useNavigate(); const qc = useQueryClient()
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('mechanicshop.tokens')))
  const [drawer, setDrawer] = useState(false); const [date, setDate] = useState(dateToday())
  useEffect(() => { const expire = () => { setAuthenticated(false); navigate('/login', { replace: true }) }; window.addEventListener('auth:expired', expire); return () => window.removeEventListener('auth:expired', expire) }, [navigate])
  const user = useQuery({ queryKey: ['me'], queryFn: currentUser, enabled: authenticated, retry: false, staleTime: 300_000 })
  useEffect(() => { if (user.isError) { localStorage.removeItem('mechanicshop.tokens'); setAuthenticated(false) } }, [user.isError])
  const title = nav.find(x => x.to === location.pathname)?.label ?? 'لوحة التحكم'
  if (location.pathname === '/login') return authenticated ? <Navigate to="/" replace/> : <Login/>
  if (!authenticated) return <Navigate to="/login" replace/>
  if (user.isPending) return <main className="loading-screen"><div className="spinner"/>جارٍ التحقق من الجلسة…</main>
  if (user.isError) return <Navigate to="/login" replace/>
  const account = user.data
  const logout = async () => { await signOut(); qc.clear(); setAuthenticated(false); navigate('/login', { replace: true }) }
  return <div className="app-shell"><aside className={`sidebar ${drawer ? 'open' : ''}`}><div className="brand"><span className="brand-icon"><Wrench size={20}/></span><span><b>وِرشة</b><small>إدارة الورش الذكية</small></span><button className="drawer-close" onClick={() => setDrawer(false)} aria-label="إغلاق القائمة"><X/></button></div><div className="branch-pill"><span className="online-dot"/><span>الفرع النشط</span><ChevronDown size={15}/><strong>{account.branchId ? 'فرعك الحالي' : 'كل الفروع'}</strong></div><nav className="main-nav" aria-label="التنقل الرئيسي"><p className="nav-caption">القائمة الرئيسية</p>{nav.filter(item => item.to !== '/branches' || account.accessScope === 1).map(item => <a href={item.to} key={item.to} className={location.pathname === item.to ? 'nav-link active' : 'nav-link'} onClick={e => { e.preventDefault(); navigate(item.to); setDrawer(false) }}><item.icon size={19}/><span>{item.label}</span>{item.to === '/workorders' && <span className="nav-badge">•</span>}</a>)}</nav><div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><ShieldCheck size={18}/></span><strong>مساحة عمل آمنة</strong><p>بياناتك محمية بصلاحيات حسابك.</p></div><button className="nav-link" onClick={logout}><LogOut size={18}/><span>تسجيل الخروج</span></button><div className="profile"><div className="avatar">{account.email.slice(0,1).toUpperCase()}</div><span><strong>{account.email}</strong><small>{roleName(account)}</small></span><Settings size={17}/></div></div></aside>
    {drawer && <button className="scrim" aria-label="إغلاق القائمة" onClick={() => setDrawer(false)}/>}
    <section className="workspace"><header className="topbar"><button className="menu-btn" onClick={() => setDrawer(true)} aria-label="فتح القائمة"><Menu/></button><div className="breadcrumb">الرئيسية <span>/</span> <strong>{title}</strong></div><div className="top-actions"><span className="today-label"><CalendarDays size={16}/> {new Intl.DateTimeFormat('ar-EG',{dateStyle:'full'}).format(new Date())}</span><button className="icon-btn" aria-label="التنبيهات"><Bell size={18}/></button><div className="top-avatar">{account.email.slice(0,1).toUpperCase()}</div></div></header>
      <main className="page-content"><Routes><Route path="/" element={<Dashboard account={account} date={date} setDate={setDate}/>}/><Route path="/workorders" element={<OrdersPage/>}/><Route path="/branches" element={<BranchesPage/>}/><Route path="*" element={<NotAvailable title={title}/>}/></Routes></main>
    </section></div>
}
function roleName(account: CurrentUser) { return account.roles.includes('Manager') ? (account.accessScope === 1 ? 'مدير الشركة' : 'مدير فرع') : 'فني صيانة' }
function Dashboard({ account, date, setDate }: { account: CurrentUser; date: string; setDate: (d: string) => void }) {
  const stats = useQuery({ queryKey: ['stats', date], queryFn: () => getStats(date) })
  const orders = useQuery({ queryKey: ['orders', date], queryFn: getOrders })
  const branchList = useQuery({ queryKey: ['branches'], queryFn: getBranches })
  const list = useMemo(() => { const d = orders.data; return Array.isArray(d) ? d : (d as { items?: Order[] } | undefined)?.items ?? [] }, [orders.data])
  const branchName = branchList.data?.find(b => b.branchId === account.branchId)?.name ?? (account.branchId ? 'الفرع الحالي' : 'كل الفروع')
  return <><div className="page-heading"><div><p className="eyebrow">نظرة عامة على الورشة</p><h1>صباح الخير 👋</h1><p className="muted">إليك ملخص حركة العمل لهذا اليوم.</p></div><div className="heading-actions"><label className="date-control"><CalendarDays size={16}/><input aria-label="تاريخ الملخص" type="date" value={date} onChange={e => setDate(e.target.value)}/></label><button className="primary-btn" onClick={() => window.location.assign('/workorders')}><ClipboardList size={17}/> أوامر الشغل</button></div></div>
    <div className="context-row"><span className="branch-tag"><BriefcaseBusiness size={15}/>{branchName}</span><span className="live-tag"><span className="online-dot"/>بيانات مباشرة من النظام</span></div>
    {stats.isError ? <ErrorBox error={stats.error}/> : <StatsGrid stats={stats.data} loading={stats.isPending}/>}
    <section className="panel orders-panel"><div className="panel-heading"><div><h2>أوامر الشغل الأخيرة</h2><p>آخر الطلبات المسجلة في النظام</p></div><a className="text-link" href="/workorders">عرض الكل <ArrowLeftIcon/></a></div>{orders.isError ? <ErrorBox error={orders.error}/> : orders.isPending ? <div className="skeleton-list"><i/><i/><i/><i/></div> : list.length === 0 ? <div className="empty-state"><ClipboardList/><strong>لا توجد أوامر شغل لهذا اليوم</strong><span>ستظهر هنا بمجرد تسجيل أوامر جديدة.</span></div> : <OrderTable items={list.slice(0, 6)}/>}</section>
  </>
}
function ArrowLeftIcon(){return <ArrowDownLeft size={16}/>}
function StatsGrid({ stats, loading }: { stats?: Stats; loading: boolean }) {
  const cards = [{ label:'إجمالي أوامر الشغل',value:stats?.total,icon:ClipboardList,tone:'blue',note:'خلال اليوم'},{label:'قيد التنفيذ',value:stats?.inProgress,icon:Wrench,tone:'amber',note:'تعمل الآن'},{label:'أعمال مكتملة',value:stats?.completed,icon:Check,tone:'green',note:'خلال اليوم'},{label:'إيرادات اليوم',value:stats ? currency.format(stats.totalRevenue) : undefined,icon:CircleDollarSign,tone:'navy',note:'حسب الفواتير المسجلة'}]
  return <div className="stats-grid">{cards.map(({label,value,icon:Icon,tone,note})=><article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={20}/></div><span className="stat-label">{label}</span>{loading ? <div className="skeleton value-skeleton"/> : <strong className="stat-value">{value ?? '—'}</strong>}<span className="stat-note">{note}</span></article>)}</div>
}
function OrderTable({ items }: { items: Order[] }) { return <div className="table-scroll"><table><thead><tr><th>رقم الأمر</th><th>المركبة</th><th>العميل</th><th>الفني</th><th>موعد البدء</th><th>الحالة</th></tr></thead><tbody>{items.map(o=><tr key={o.workOrderId}><td><span className="order-id">#{o.workOrderId.slice(0,8).toUpperCase()}</span></td><td><strong>{o.vehicle?.make} {o.vehicle?.model}</strong><small className="cell-sub">{o.vehicle?.licensePlate}</small></td><td>{o.customer || '—'}</td><td>{o.labor || 'غير معيّن'}</td><td dir="ltr" className="time-cell">{new Intl.DateTimeFormat('ar-EG',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Cairo'}).format(new Date(o.startAtUtc))}</td><td><span className={`status status-${o.state}`}>{stateLabel[o.state] ?? 'غير معروف'}</span></td></tr>)}</tbody></table></div> }
function OrdersPage(){ const q=useQuery({queryKey:['orders','all'],queryFn:getOrders}); const data=q.data; const items=Array.isArray(data)?data:(data as {items?:Order[]}|undefined)?.items??[]; return <><div className="page-heading"><div><p className="eyebrow">متابعة الصيانة</p><h1>أوامر الشغل</h1><p className="muted">عرض أوامر الشغل المتاحة لحسابك.</p></div><div className="heading-actions"><span className="soft-search"><Search size={16}/> بحث من الخادم</span></div></div><section className="panel orders-panel">{q.isError?<ErrorBox error={q.error}/>:q.isPending?<div className="skeleton-list"><i/><i/><i/></div>:items.length?<OrderTable items={items}/>:<div className="empty-state"><ClipboardList/><strong>لا توجد أوامر شغل</strong></div>}</section></> }
function BranchesPage(){const q=useQuery({queryKey:['branches'],queryFn:getBranches}); return <><div className="page-heading"><div><p className="eyebrow">إدارة المواقع</p><h1>الفروع</h1><p className="muted">الفروع التي يسمح حسابك بالوصول إليها.</p></div></div>{q.isError?<ErrorBox error={q.error}/>:q.isPending?<div className="skeleton-list"><i/><i/></div>:<div className="branches-grid">{q.data?.map((branch:Branch)=><article className="branch-card" key={branch.branchId}><div className="stat-icon blue"><BriefcaseBusiness/></div><span className={branch.isActive?'status status-2':'status status-3'}>{branch.isActive?'نشط':'غير نشط'}</span><h2>{branch.name}</h2><p>رمز الفرع <b>{branch.code}</b></p></article>)}</div>}</> }
function NotAvailable({title}:{title:string}){return <><div className="page-heading"><div><p className="eyebrow">{title}</p><h1>{title}</h1></div></div><section className="panel empty-state unavailable"><ShieldCheck/><strong>هذه الصفحة غير متاحة ضمن واجهات الخادم الحالية</strong><span>لن نعرض بيانات تجريبية. ستظهر الميزة عند توفر نقطة API مناسبة.</span><p>يمكنك متابعة لوحة التحكم وأوامر الشغل والفروع المدعومة.</p></section></>}
export default App
