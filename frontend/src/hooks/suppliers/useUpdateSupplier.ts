import { updateSupplier } from '@/api/suppliers';
import type { SupplierUpdate } from '@/types/supplier';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

type UpdateSupplierVariables = {
  supplierId: number;
  data: SupplierUpdate;
};

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ supplierId, data }: UpdateSupplierVariables) => updateSupplier(supplierId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });

      message.success('Поставщик обновлён');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось обновить поставщика'));
    }
  });
}
