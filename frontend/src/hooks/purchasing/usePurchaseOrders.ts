import { getPurchaseOrders } from '@/api/purchaseOrders';
import { useQuery } from '@tanstack/react-query';

export function usePurchaseOrders() {
  return useQuery({ queryKey: ['purchase-orders'], queryFn: getPurchaseOrders });
}
