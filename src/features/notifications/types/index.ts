export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'SALARY_REQUEST_APPROVED'
  | 'SALARY_REQUEST_REJECTED'
  | 'SYSTEM'
  | 'NEW_TEAM_MEMBER';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  // Optional links to related entities
  orderId?: string;
  salaryRequestId?: string;
  employeeId?: string;
}
