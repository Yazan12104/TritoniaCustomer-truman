import { Role } from '../../auth/types';

// Re-use the role enum from auth types for consistency
export type EmployeeRole = Extract<Role, 'GENERAL_SUPERVISOR' | 'SUPERVISOR' | 'MARKETER' | 'BRANCH_MANAGER'>;

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  branchId?: string;
  userId?: string;
  branchName?: string;
  supervisorId?: string;
  supervisorName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;

  // New detailed fields for getById
  orderCount?: number;
  salary?: number;
  orders?: Array<{
    id: string;
    status: string;
    total_sold_price: number;
    created_at: string;
    customer?: { name: string };
  }>;
  customers?: Array<{
    id: string;
    name: string;
    phone: string;
    governorate: string;
  }>;
  salary_requests?: Array<{
    id: string;
    requested_amount: number;
    status: string;
    created_at: string;
  }>;
  supervisor?: {
    id: string;
    name: string;
    role: string;
  };
  general_supervisor?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface EmployeeHierarchy {
  employee: Employee;
  subordinates: EmployeeHierarchy[];
}
