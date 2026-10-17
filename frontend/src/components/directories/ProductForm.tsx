import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Button, Flex, Form, Input, InputNumber, Select } from 'antd';
import { createProduct } from '../../api/products';
import { EMPTY_SUPPLIERS } from '../../constants/suppliers';
import { UNITS } from '../../constants/units';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { ProductCreate } from '../../types/product';

type ProductFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const unitOptions = Object.entries(UNITS).map(([key, value]) => ({ value, key }));

export default function ProductForm({ onCancel, onSuccess }: ProductFormProps) {
  const [form] = Form.useForm<ProductCreate>();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: suppliers = EMPTY_SUPPLIERS, isPending, isError } = useSuppliers();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      message.success('Товар добавлен');
      onSuccess();
    },
    onError: (error: unknown) => {
      const detail =
        typeof error === 'object' && error !== null && 'response' in error
          ? (
              error as {
                response?: { data?: { detail?: unknown } };
              }
            ).response?.data?.detail
          : undefined;

      message.error(typeof detail === 'string' ? detail : 'Не удалось добавить товар');
    }
  });

  if (isPending) return;

  if (isError) {
    return <p>Не удалось загрузить товары.</p>;
  }

  const handleSubmit = (values: ProductCreate) => {
    mutation.mutate({
      ...values,
      default_supplier_id: values.default_supplier_id || null
    });
  };
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Название"
        name="name"
        rules={[{ required: true, message: 'Введите название' }]}
      >
        <Input maxLength={255} />
      </Form.Item>

      <Form.Item
        label="Артикул"
        name="sku"
        rules={[{ required: true, message: 'Введите артикул' }]}
      >
        <Input maxLength={64} />
      </Form.Item>

      <Form.Item
        label="Единица измерения"
        name="contact_person"
        rules={[{ required: true, message: 'Выберите единицу измерения' }]}
      >
        <Select
          defaultValue={UNITS[0]}
          options={unitOptions}
        />
      </Form.Item>

      <Form.Item
        label="Минимальный остаток"
        name="min_level"
        rules={[
          { required: true, message: 'Введите минимальный остаток' },
          {
            type: 'number',
            min: 0,
            message: 'Минимальный остаток должен быть больше или равен нулю'
          }
        ]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item
        label="Поставщик по умолчанию"
        name="default_supplier_id"
      >
        <Select
          disabled={isError}
          loading={isPending}
          allowClear
          showSearch={{ optionFilterProp: 'label' }}
          placeholder={isError ? 'Не удалось загрузить' : 'Не выбран'}
          options={suppliers.map(s => ({ value: s.id, label: s.name }))}
        />
      </Form.Item>

      <Flex
        justify="flex-end"
        gap="small"
      >
        <Button onClick={onCancel}>Отмена</Button>

        <Button
          type="primary"
          htmlType="submit"
          loading={mutation.isPending}
        >
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}
