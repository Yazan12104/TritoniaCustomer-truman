import { apiClient } from '../../../core/api/apiClient';
import { USE_MOCK_API } from '../../../config/env';
import { Employee, EmployeeHierarchy } from '../types';

// Mappers
const mapEmployee = (apiData: any): Employee => ({
  id: apiData.id || '',
  name: apiData.full_name || apiData.name || (apiData.first_name ? `${apiData.first_name} ${apiData.last_name}` : ''),
  email: apiData.email || '',
  phone: apiData.phone || '',
  role: apiData.role || 'MARKETER',
  // التعديل هنا - اقرأ supervisor_id من API
  supervisorId: apiData.supervisor_id || apiData.supervisorId || apiData.supervisor?.id || '',
  supervisorName: apiData.supervisor_name || apiData.supervisorName || apiData.supervisor?.name || '',
  branchId: apiData.branch_id || apiData.branchId || apiData.branch?.id || '',
  userId: apiData.user_id || apiData.userId || apiData.user?.id || '',
  branchName: apiData.branch || apiData.branchName || apiData.branch?.governorate || '',
  status: apiData.is_active !== undefined ? (apiData.is_active ? 'ACTIVE' : 'INACTIVE') : (apiData.status || 'ACTIVE'),
  createdAt: apiData.created_at || apiData.createdAt || new Date().toISOString(),

  // Detailed fields
  orderCount: apiData.orderCount,
  salary: apiData.salary,
  orders: apiData.orders,
  customers: apiData.customers,
  salary_requests: apiData.salary_requests,
  supervisor: apiData.supervisor,
  general_supervisor: apiData.general_supervisor,
});

// Mock Data
let mockEmployees: Employee[] = [
  { id: 'emp_001', name: 'سامر الخالدي', email: 'samer@tritonia.com', phone: '07901000001', role: 'GENERAL_SUPERVISOR', status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'emp_002', name: 'لينا العمري', email: 'lina@tritonia.com', phone: '07901000002', role: 'SUPERVISOR', supervisorId: 'emp_001', status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildHierarchy = (rootId: string, all: Employee[]): EmployeeHierarchy => {
  const root = all.find(e => e.id === rootId)!;
  const subordinates = all.filter(e => e.supervisorId === rootId);
  return { employee: root, subordinates: subordinates.map(sub => buildHierarchy(sub.id, all)) };
};

export const employeesApi = {
  getEmployees: async (params?: { page?: number; limit?: number; search?: string; role?: string; supervisorId?: string; branchId?: string }): Promise<{ data: Employee[]; pagination: any }> => {
    try {
      if (USE_MOCK_API) {
        await delay(500);
        return { data: [...mockEmployees], pagination: { total: mockEmployees.length, page: 1, limit: 100, pages: 1 } };
      } else {
        const response = await apiClient.get('/employees', {
          params: { page: 1, limit: 20, ...params }
        });

        const rawData = response.data.body || response.data.data;
        const rawList = rawData?.data || rawData || [];

      

        const pagination = rawData?.pagination || { total: rawList.length, page: 1, limit: 20, pages: 1 };

        return {
          data: Array.isArray(rawList) ? rawList.map(mapEmployee) : [],
          pagination
        };
      }
    } catch (error: any) {
      console.error("getEmployees Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب قائمة الموظفين');
    }
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    try {
      if (USE_MOCK_API) {
        await delay(300);
        const emp = mockEmployees.find(e => e.id === id);
        if (!emp) throw new Error('الموظف غير موجود');
        return { ...emp };
      } else {
        const response = await apiClient.get(`/employees/${id}`);
        // Handle both .body and .data envelopes
        return mapEmployee(response.data.body || response.data.data);
      }
    } catch (error: any) {
      console.error("getEmployeeById Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب بيانات الموظف');
    }
  },

  // employeesApi.ts - التعديل الصحيح
  // employeesApi.ts - الكود المعدل
  // employeesApi.ts - تعديل createEmployee
  createEmployee: async (data: any): Promise<Employee> => {
    try {
      if (USE_MOCK_API) {
        await delay(800);

        // محاكاة التحقق من الرقم في mock
        const phoneExists = mockEmployees.some(emp => emp.phone === data.phone);
        if (phoneExists) {
          throw new Error('رقم الهاتف مستخدم مسبقاً');
        }

        const newEmployee: Employee = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          name: `${data.first_name} ${data.last_name}`,
        };
        mockEmployees.push(newEmployee);
        return newEmployee;
      } else {
        const backendData: Record<string, any> = {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          password: data.password,
          role: data.role,
          branchId: data.branchId,        // <- تغيير من branch_id إلى branchId
          supervisorId: data.supervisorId // <- تغيير من supervisor_id إلى supervisorId
        };

        if (data.email && data.email.trim()) {
          backendData.email = data.email;
        }

        const response = await apiClient.post('/employees', backendData);
        const userData = response.data.data || response.data.body;
        return mapEmployee({
          ...userData,
          name: `${userData.first_name} ${userData.last_name}`,
          status: userData.is_active ? 'ACTIVE' : 'INACTIVE'
        });
      }
    } catch (error: any) {
      console.error("createEmployee Error:", error);
      // استخراج رسالة الخطأ
      let errorMessage = 'فشل إضافة الموظف';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },
  updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    try {
      if (USE_MOCK_API) {
        await delay(800);
        const idx = mockEmployees.findIndex(e => e.id === id);
        if (idx === -1) throw new Error('الموظف غير موجود');
        mockEmployees[idx] = { ...mockEmployees[idx], ...data };
        return { ...mockEmployees[idx] };
      } else {
        const response = await apiClient.put(`/employees/${id}`, data);
        return mapEmployee(response.data.body || response.data.data);
      }
    } catch (error: any) {
      console.error("updateEmployee Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تحديث بيانات الموظف');
    }
  },

  adminResetPassword: async (userId: string, newPassword: string): Promise<any> => {
    try {
      if (USE_MOCK_API) {
        await delay(300);
        return { message: 'تم إعادة تعيين كلمة المرور (محاكاة)' };
      } else {
        const response = await apiClient.patch(`/admin/users/${userId}/password`, { newPassword });
        return response.data;
      }
    } catch (error: any) {
      console.error('adminResetPassword Error:', error);
      throw new Error(error.response?.data?.message || error.message || 'فشل إعادة تعيين كلمة المرور');
    }
  },

  getHierarchy: async (rootId?: string): Promise<EmployeeHierarchy[]> => {
    try {
      if (USE_MOCK_API) {
        return []; // Simplified
      } else {
        const response = await apiClient.get('/employees/hierarchy', { params: { root_id: rootId } });
        return response.data.body || response.data.data || [];
      }
    } catch (error: any) {
      console.error("getHierarchy Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل جلب الهيكلية');
    }
  },

  removeEmployee: async (employeeId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.patch(`/employees/${employeeId}/remove`);
      return response.data.body || { success: true, message: 'تم تحويل الموظف إلى عميل بنجاح' };
    } catch (error: any) {
      console.error("removeEmployee Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تحويل الموظف إلى عميل');
    }
  },

  applyEmployee: async (data: { userId: string; role: string; branchId: string; supervisorId?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.patch('/employees/apply', data);
      return response.data.body || { success: true, message: 'تم تحويل العميل إلى موظف بنجاح' };
    } catch (error: any) {
      console.error("applyEmployee Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تحويل العميل إلى موظف');
    }
  },

  promoteEmployee: async (employeeId: string): Promise<{ success: boolean; message: string; newRole: string }> => {
    try {
      const response = await apiClient.patch(`/employees/${employeeId}/promote`);
      return response.data.body || { success: true, message: 'تمت الترقية بنجاح', newRole: '' };
    } catch (error: any) {
      console.error("promoteEmployee Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل ترقية الموظف');
    }
  },

  demoteEmployee: async (employeeId: string, newSupervisorId?: string): Promise<{ success: boolean; message: string; newRole: string }> => {
    try {
      const response = await apiClient.patch(`/employees/${employeeId}/demote`, {
        newSupervisorId: newSupervisorId || null,
      });
      return response.data.body || { success: true, message: 'تم التخفيض بنجاح', newRole: '' };
    } catch (error: any) {
      console.error("demoteEmployee Error:", error);
      throw new Error(error.response?.data?.message || error.message || 'فشل تخفيض الموظف');
    }
  }
};
