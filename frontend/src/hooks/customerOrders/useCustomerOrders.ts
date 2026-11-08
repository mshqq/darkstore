import { getCustomerOrders } from '@/api/customerOrders';
import { useQuery } from '@tanstack/react-query';

export function useCustomerOrders() {
  return useQuery({ queryKey: ['customer-orders'], queryFn: getCustomerOrders });
}
