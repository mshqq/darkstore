import { createPurchaseOrder } from '@/api/purchaseOrders';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });

      message.success('Закупка создана');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось создать закупку'));
    }
  });

  return createMutation;
}
