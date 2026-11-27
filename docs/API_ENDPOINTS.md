# فهرس نقاط API وربطها بالواجهة

مصدر الحقيقة هو `src/MechanicShop.Api/Controllers` و`Program.cs` في مستودع MechanicShop. اكتُشف 41 مسار REST في الـcontrollers، إضافة إلى فحص الصحة `/health`؛ كما تتصل الواجهة بـSignalR في `/hubs/workorders`. نقاط التوثيق في Development مذكورة في نهاية الملف.

## الهوية والجلسات

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `POST /identity/token/generate` | `authApi.login` | `useLogin` | نموذج تسجيل الدخول |
| `POST /identity/token/refresh-token` | `authApi.refresh` | `useRefreshToken` | تجديد تلقائي بعد 401 وزر تجديد الجلسة |
| `POST /identity/logout` | `authApi.logout` | `useLogout` | تسجيل الخروج |
| `POST /identity/change-password` | `authApi.changePassword` | `useChangePassword` | نافذة تغيير كلمة المرور |
| `GET /identity/current-user/claims` | `authApi.currentUser` | `useCurrentUser` | حماية المسارات، الدور والنطاق |

## الفروع

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `GET /api/v1.0/branches` | `branchesApi.list` | `useBranches` | صفحة الفروع، إنشاء الموظف، إنشاء أمر |
| `GET /api/v1.0/branches/{branchId}` | `branchesApi.byId` | `useBranch` | تفاصيل الفرع |
| `GET /api/v1.0/branches/{branchId}/employees` | `branchesApi.employees` | `useBranchEmployees` | موظفو الفرع ونطاق وصولهم |
| `POST /api/v1.0/branches` | `branchesApi.create` | `useCreateBranch` | نموذج إنشاء فرع، مدير الشركة |
| `PUT /api/v1.0/branches/{branchId}/active` | `branchesApi.setActive` | `useSetBranchActive` | زر تفعيل/تعطيل الفرع |
| `POST /api/v1.0/branches/{branchId}/employees/{employeeId}` | `branchesApi.addEmployee` | `useAddBranchEmployee` | إضافة موظف إلى الفرع |
| `PUT /api/v1.0/branches/employees/{employeeId}/access-scope` | `branchesApi.setAccessScope` | `useSetEmployeeAccessScope` | تبديل نطاق الموظف، مدير الشركة |
| `PUT /api/v1.0/branches/me/default` | `branchesApi.setDefault` | `useSetDefaultBranch` | تعيين الفرع الافتراضي للحساب |

## الموظفون والفنيون

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `POST /api/v1.0/employees/labors` | `employeesApi.createLabor` | `useCreateLabor` | نموذج إنشاء فني |
| `POST /api/v1.0/employees/branch-managers` | `employeesApi.createBranchManager` | `useCreateBranchManager` | نموذج مدير فرع، مدير الشركة |
| `GET /api/v1.0/labors` | `laborsApi.list` | `useLabors` | قائمة الفنيين، إنشاء/تعديل أوامر الشغل، والجدول |

## العملاء والمركبات

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `GET /api/v1.0/customers` | `customersApi.list` | `useCustomers` | جدول العملاء واختيار المركبات |
| `GET /api/v1.0/customers/{customerId}` | `customersApi.byId` | `useCustomer` | تفاصيل العميل ومركباته |
| `POST /api/v1.0/customers` | `customersApi.create` | `useCreateCustomer` | نموذج إنشاء العميل مع مركبة |
| `PUT /api/v1.0/customers/{customerId}` | `customersApi.update` | `useUpdateCustomer` | نموذج تعديل العميل والمركبات |
| `DELETE /api/v1.0/customers/{customerId}` | `customersApi.delete` | `useDeleteCustomer` | إجراء حذف بتأكيد |

المركبات مضمّنة في طلب/استجابة العميل؛ لا توجد مسارات Vehicle مستقلة في الخادم.

## لوحة المؤشرات

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `GET /api/v1.0/dashboard/stats?fromUtc=...&toUtc=...` | `dashboardApi.stats` | `useDashboardStats` | مؤشرات اليوم ومخطط توزيع الحالات؛ يحوّل التطبيق نطاق يوم القاهرة إلى UTC قبل الإرسال |

## أوامر الشغل والجدول

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `GET /api/v1.0/workorders` | `workOrdersApi.list` | `useWorkOrders` | لوحة المؤشرات، الجدول، واختيار أوامر الفوترة مع البحث/الفلاتر/الصفحات |
| `GET /api/v1.0/workorders/{workOrderId}` | `workOrdersApi.byId` | `useWorkOrder` | تفاصيل الأمر وإجراءات دورة العمل |
| `POST /api/v1.0/workorders` | `workOrdersApi.create` | `useCreateWorkOrder` | نموذج إنشاء أمر بفرع ومركبة وفني ومهام ووقت وموقع |
| `PUT /api/v1.0/workorders/{workOrderId}/relocation` | `workOrdersApi.relocate` | `useRelocateWorkOrder` | نموذج إعادة الجدولة |
| `PUT /api/v1.0/workorders/{workOrderId}/labor` | `workOrdersApi.assignLabor` | `useAssignLabor` | نموذج إسناد الفني |
| `PUT /api/v1.0/workorders/{workOrderId}/state` | `workOrdersApi.updateState` | `useUpdateWorkOrderState` | تغيير الحالة |
| `PUT /api/v1.0/workorders/{workOrderId}/repair-task` | `workOrdersApi.updateRepairTasks` | `useUpdateWorkOrderRepairTasks` | تحديث مهام الأمر |
| `DELETE /api/v1.0/workorders/{workOrderId}` | `workOrdersApi.delete` | `useDeleteWorkOrder` | حذف بتأكيد وإرسال `If-Match` |
| `GET /api/v1.0/workorders/schedule/{date}?laborId=...` | `workOrdersApi.schedule` | `useSchedule` | الجدول اليومي؛ يرسل `X-TimeZone` |

كل تعديلات أمر الشغل ترسل `RowVersion` الحالية من الاستجابة. الحذف يرسل القيمة ذاتها في `If-Match`. HTTP 409 يعرض رسالة تعارض وإجراء تحديث للتفاصيل.

## مهام الإصلاح

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `GET /api/v1.0/repair-tasks` | `repairTasksApi.list` | `useRepairTasks` | الكتالوج واختيار مهام أمر الشغل |
| `GET /api/v1.0/repair-tasks/{repairTaskId}` | `repairTasksApi.byId` | `useRepairTask` | تفاصيل المهمة وقطعها |
| `POST /api/v1.0/repair-tasks` | `repairTasksApi.create` | `useCreateRepairTask` | نموذج إنشاء مهمة وقطعة |
| `PUT /api/v1.0/repair-tasks/{repairTaskId}` | `repairTasksApi.update` | `useUpdateRepairTask` | تعديل بيانات المهمة وقطعها |
| `DELETE /api/v1.0/repair-tasks/{repairTaskId}` | `repairTasksApi.delete` | `useDeleteRepairTask` | حذف بتأكيد |

## الفواتير

| الطريقة والمسار | خدمة الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `POST /api/v1.0/invoices/workorders/{workOrderId}` | `invoicesApi.issue` | `useIssueInvoice` | إصدار فاتورة من أمر شغل |
| `GET /api/v1.0/invoices/{invoiceId}` | `invoicesApi.byId` | `useInvoice` | تفاصيل فاتورة مرتبطة بأمر أو معرّف مدخل |
| `GET /api/v1.0/invoices/{invoiceId}/pdf` | `invoicesApi.pdf` | `useInvoicePdf` | تنزيل PDF |
| `PUT /api/v1.0/invoices/{invoiceId}/payments` | `invoicesApi.settle` | `useSettleInvoice` | تسجيل دفع الفاتورة |

الخادم لا يقدم `GET` لقائمة الفواتير؛ تختار الواجهة أمرًا قائمًا أو تستخدم معرّف فاتورة للوصول إلى التفاصيل.

## الإعدادات والتشخيص والوقت الفعلي

| الطريقة/النقل والمسار | خدمة/عميل الواجهة | React Query | موضع الاستخدام |
|---|---|---|---|
| `GET /api/settings/operating-hours` | `settingsApi.operatingHours` | `useOperatingHours` | ساعات العمل في لوحة المؤشرات والإعدادات |
| `GET /health` | `healthApi.check` | `useHealthCheck` | فحص اتصال الخادم وعرض تقرير الصحة |
| SignalR `/hubs/workorders` | `@microsoft/signalr` HubConnection | اتصال طويل العمر | يستمع إلى `WorkOrdersChanged` ويحدّث استعلامات الأوامر والجدول والإحصاءات |

## وثائق التطوير

`Program.cs` يفعّل OpenAPI وSwagger UI وScalar في بيئة Development. صفحة الإعدادات تعرض روابط `/openapi/v1.json` و`/swagger` و`/scalar/v1`. هذه أدوات توثيق/استكشاف وليست عمليات بيانات ضمن مسارات الـ41.

## قيود واجهة الخادم

- لا يوجد endpoint مستقل لتقارير تاريخية أو سجل نشاط.
- لا يوجد endpoint مستقل لقائمة مركبات أو قائمة فواتير.
- CRUD العملاء والمهام وأوامر الشغل والفروع والفريق موصول بحسب المسارات المنشورة، لكن المستخدم يجب أن يمتلك دورًا ونطاقًا يسمح بهما الخادم.

