import { receivePurchaseOrder, sendPurchaseOrder } from '@/api/purchaseOrders';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

export function usePurchaseOrderActions() {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: sendPurchaseOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });

      message.success('Закупка отправлена поставщику');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось отправить закупку поставщику'));
    }
  });

  const receiveMutation = useMutation({
    mutationFn: receivePurchaseOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });

      message.success('Закупка принята на склад');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось принять закупку на склад'));
    }
  });

  return { sendMutation, receiveMutation };
}
