import { updateProduct } from '@/api/products';
import type { ProductUpdate } from '@/types/product';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

type UpdateProductVariables = {
  productId: number;
  data: ProductUpdate;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ productId, data }: UpdateProductVariables) => updateProduct(productId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['stock'] })
      ]);

      message.success('Товар обновлён');
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось обновить товар'));
    }
  });
}
