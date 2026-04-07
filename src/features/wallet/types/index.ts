export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  date: string;
  orderId?: string;
}

export interface SalaryRequestTransaction {
  id: string;
  amount: number;
  order_id?: string;
  created_at: string;
  total_main_price?: number;
  total_sold_price?: number;
}

export interface SalaryRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  employeeName?: string;
  processedDate?: string;
  phone?: string;
  role?: string;
  branch?: string;
  transactions?: SalaryRequestTransaction[];
}

export interface WalletSummary {
  currentBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingRequestsTotal: number;
}
