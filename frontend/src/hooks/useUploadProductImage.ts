import { uploadProductImage } from '@/api/products';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';

type UploadProductImageVariables = {
  productId: number;
  file: File;
};

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ productId, file }: UploadProductImageVariables) =>
      uploadProductImage(productId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Изображение загружено');
    },
    onError: (error: unknown) =>
      message.error(getApiErrorMessage(error, 'Не удалось загрузить изображение'))
  });
}
