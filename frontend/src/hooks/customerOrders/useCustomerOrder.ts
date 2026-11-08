import { getCustomerOrder } from '@/api/customerOrders';
import { useQuery } from '@tanstack/react-query';

export function useCustomerOrder(id: number | null) {
  return useQuery({
    queryKey: ['customer-order', id],
    queryFn: () => {
      if (id === null) {
        throw new Error('Не выбран заказ');
      }

      return getCustomerOrder(id);
    },
    enabled: id !== null
  });
}
