// utils/customerHelpers.ts
import { Customer } from '../types';

export const getCustomerDisplayName = (customer: Customer): string => {
  return customer.full_name || customer.name || '';
};

export const getCustomerInitials = (customer: Customer): string => {
  const name = getCustomerDisplayName(customer);
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const formatCustomerPhone = (phone: string): string => {
  // Add any phone formatting logic here
  return phone;
};