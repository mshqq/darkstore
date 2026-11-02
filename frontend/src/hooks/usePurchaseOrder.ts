import { getPurchaseOrder } from '@/api/purchaseOrders';
import { useQuery } from '@tanstack/react-query';

export function usePurchaseOrder(orderId: number) {
  return useQuery({
    queryKey: ['purchase-orders', orderId],
    queryFn: () => getPurchaseOrder(orderId),
    enabled: Number.isInteger(orderId) && orderId > 0
  });
}
