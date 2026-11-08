import {
  cancelOrder,
  finishDelivery,
  finishPicking,
  startDelivery,
  startPicking
} from '@/api/customerOrders';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

export function useCustomerOrderActions() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const startPickingMutation = useMutation({
    mutationFn: startPicking,
    onSuccess: async order => {
      queryClient.setQueryData(['customer-order', order.id], order);

      await queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось начать сборку заказа'));
    }
  });

  const finishPickingMutation = useMutation({
    mutationFn: finishPicking,
    onSuccess: async order => {
      queryClient.setQueryData(['customer-order', order.id], order);

      await queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось завершить сборку заказа'));
    }
  });

  const startDeliveryMutation = useMutation({
    mutationFn: startDelivery,
    onSuccess: async order => {
      queryClient.setQueryData(['customer-order', order.id], order);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['stock'] })
      ]);
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось начать доставку заказа'));
    }
  });

  const finishDeliveryMutation = useMutation({
    mutationFn: finishDelivery,
    onSuccess: async order => {
      queryClient.setQueryData(['customer-order', order.id], order);

      await queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось завершить доставку заказа'));
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: async order => {
      queryClient.setQueryData(['customer-order', order.id], order);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['stock'] })
      ]);
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось отменить заказ'));
    }
  });

  return {
    startPickingMutation,
    finishPickingMutation,
    startDeliveryMutation,
    finishDeliveryMutation,
    cancelOrderMutation
  };
}
