import { Product } from '../../products/types';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'DELIVERED' | 'REJECTED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number; // This is the unit price (main_price) at time of order
  product_name?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  marketer_id: string;
  branch_id: string;
  delivery_point_id?: string;
  total_price: number;
  sold_price: number;
  delivery_fee?: number;
  status: OrderStatus;
  notes?: string;
  coupon_code?: string;
  discount_percentage?: number;
  discount_amount?: number;
  items?: OrderItem[];
  customer_name?: string;
  marketer_name?: string;
  branch_name?: string;
  delivery_point_name?: string;
  created_at: string;
  transactions?: {
    employee_name: string;
    amount: number;
  }[];
  preview_transactions?: {
    employee_name: string;
    amount: number;
  }[];
}

export interface CreateOrderInput {
  customer_id: string;
  branch_id: string;
  delivery_point_id?: string;
  sold_price: number;
  notes?: string;
  coupon_code?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

// UI structure for Cart - Minimal data as per requirement
export interface CartItem {
  productId: string;
  name: string;
  price: number; // Main price from product
  quantity: number;
  maxQuantity: number; // Limits how many can be added based on stock
  imageUrl?: string;
}
