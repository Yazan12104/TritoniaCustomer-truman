export interface Governorate {
  id: string;
  name: string;
}

export interface Branch {
  id: string;
  name: string;
  governorate_id: string; // snake_case as per backend
  governorate?: string;   // the governorate name often returned by backend
  managerId?: string; 
  manager_name?: string;
  manager_phone?: string;
  address: string;
  phone: string;
  is_active: boolean; // confirmed in branchRepository.js
  status: 'ACTIVE' | 'INACTIVE'; // legacy, but backend uses is_active
  employees?: BranchEmployee[];
  orders_count?: number;
}

export interface BranchEmployee {
  id: string;
  full_name: string;
  phone: string;
  role: string;
}
