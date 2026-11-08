import { useUpdateProduct } from '@/hooks/products/useUpdateProduct';
import { useSuppliers } from '@/hooks/suppliers/useSuppliers';
import { useUploadProductImage } from '@/hooks/products/useUploadProductImage';
import type { Product } from '@/types/product';
import { Button, Flex, Form, Image, Input, InputNumber, Select } from 'antd';

type EditProductFormValues = Pick<
  Product,
  'name' | 'sku' | 'min_level' | 'default_supplier_id' | 'description'
> & { selling_price: number | null };

type EditProductFormProps = {
  product: Product;
  onCancel: () => void;
  onSuccess: () => void;
};

const EditProductForm = ({ product, onCancel, onSuccess }: EditProductFormProps) => {
  const updateMutation = useUpdateProduct();
  const suppliersQuery = useSuppliers();

  const uploadImageMutation = useUploadProductImage();

  const imageUrl = uploadImageMutation.data?.image_url ?? product.image_url;
  const isBusy = updateMutation.isPending || uploadImageMutation.isPending;

  const handleSubmit = (values: EditProductFormValues) => {
    updateMutation.mutate(
      {
        productId: product.id,
        data: {
          ...values,
          description: values.description?.trim() || null,
          selling_price: values.selling_price?.toFixed(2) ?? null
        }
      },
      { onSuccess: () => onSuccess() }
    );
  };

  return (
    <Form<EditProductFormValues>
      layout="vertical"
      initialValues={{
        name: product.name,
        description: product.description,
        sku: product.sku,
        min_level: product.min_level,
        default_supplier_id: product.default_supplier_id,
        selling_price: product.selling_price === null ? null : Number(product.selling_price)
      }}
      disabled={updateMutation.isPending}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Изображение"
        extra="JPEG, PNG или WebP, до 5 МБ"
      >
        <Flex
          vertical
          gap={12}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              width={160}
              height={160}
              style={{ objectFit: 'contain' }}
              alt={product.name}
            />
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isBusy}
            onChange={e => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = '';

              if (!file) return;

              uploadImageMutation.mutate({ productId: product.id, file });
            }}
          />

          {uploadImageMutation.isPending && <span>Загрузка изображения...</span>}
        </Flex>
      </Form.Item>

      <Form.Item
        label="Поставщик"
        name="default_supplier_id"
        rules={[{ required: true, message: 'Выберите поставщика' }]}
      >
        <Select
          allowClear
          loading={suppliersQuery.isPending}
          disabled={suppliersQuery.isPending || suppliersQuery.isError}
          placeholder="Не выбран"
          options={(suppliersQuery.data ?? []).map(supplier => ({
            value: supplier.id,
            label: supplier.name
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Название"
        name="name"
        rules={[{ required: true, whitespace: true, message: 'Введите название' }]}
      >
        <Input maxLength={255} />
      </Form.Item>

      <Form.Item
        label="Артикул"
        name="sku"
        rules={[{ required: true, whitespace: true, message: 'Введите артикул' }]}
      >
        <Input maxLength={64} />
      </Form.Item>

      <Form.Item
        label="Описание"
        name="description"
      >
        <Input.TextArea
          rows={4}
          showCount
          placeholder="Состав, особенности и другая информация о товаре"
          maxLength={2000}
        />
      </Form.Item>

      <Form.Item
        label="Розничная цена"
        name="selling_price"
        rules={[
          { required: true, message: 'Введите розничную цену' },
          {
            type: 'number',
            min: 0.01,
            max: 99999999.99,
            message: 'Введите цену от 0,01 до 99 999 999,99'
          }
        ]}
      >
        <InputNumber
          min={0.01}
          max={99999999.99}
          suffix="₽"
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="Минимальный остаток"
        name="min_level"
        rules={[
          { required: true, message: 'Введите минимальный остаток' },
          { type: 'integer', min: 0, message: 'Введите целое неотрицательное число' }
        ]}
      >
        <InputNumber
          min={0}
          precision={0}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Flex
        gap={8}
        justify="flex-end"
      >
        <Button onClick={onCancel}>Отмена</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={updateMutation.isPending}
        >
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
};

export default EditProductForm;
