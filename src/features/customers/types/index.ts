// types/index.ts
export interface Customer {
  id: string;
  customer_id?: string;
  customer_user_id?: string;
  user_id?: string;
  full_name: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  is_active?: boolean;
  governorate?: string;
  referred_by_name?: string;
  referred_by_role?: string;
  first_marketer_name?: string;
  first_marketer_role?: string;
  referred_by_phone?: string;
  first_marketer_phone?: string;
  createdAt?: string;
  orders?: Order[];
}

export interface CreateCustomerInput {
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  governorate_id: string;
}

export interface Order {
  id: string;
  order_number?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name?: string;
  quantity?: number;
  price?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export interface Governorate {
  id: string; // UUID
  name: string;
  created_at?: string;
}