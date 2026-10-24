import { createProduct } from '@/api/products';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import { UNITS } from '@/constants/units';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { ProductCreate } from '@/types/product';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  App,
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select
} from 'antd';

type ProductFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const unitOptions = Object.entries(UNITS).map(([key, value]) => ({ value, key }));

export default function ProductForm({ onCancel, onSuccess }: ProductFormProps) {
  const [form] = Form.useForm<ProductCreate>();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const suppliersQuery = useSuppliers();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      message.success('Товар добавлен');
      onSuccess();
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось добавить товар'));
    }
  });

  const suppliers = suppliersQuery.data ?? EMPTY_SUPPLIERS;

  const handleSubmit = (values: ProductCreate) => {
    mutation.mutate({
      ...values,
      default_supplier_id: values.default_supplier_id || null
    });
  };
  return (
    <Form<ProductCreate>
      form={form}
      layout="vertical"
      requiredMark="optional"
      disabled={mutation.isPending}
      onFinish={handleSubmit}
      initialValues={{ unit: unitOptions[0]?.value, min_level: 0 }}
    >
      {suppliersQuery.isError && (
        <Alert
          type="warning"
          showIcon
          title="Не удалось загрузить поставщиков"
          description="Товар можно создать и без поставщика по умолчанию."
          action={
            <Button
              size="small"
              onClick={() => suppliersQuery.refetch()}
            >
              Повторить
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      <Form.Item
        label="Название"
        name="name"
        rules={[{ required: true, whitespace: true, message: 'Введите название' }]}
      >
        <Input
          maxLength={255}
          placeholder="Например, Молоко 3.2%"
        />
      </Form.Item>

      <Row gutter={12}>
        <Col
          xs={24}
          sm={12}
        >
          <Form.Item
            label="Артикул"
            name="sku"
            rules={[{ required: true, whitespace: true, message: 'Введите артикул' }]}
          >
            <Input
              maxLength={64}
              placeholder="MLK-032"
            />
          </Form.Item>
        </Col>

        <Col
          xs={24}
          sm={12}
        >
          <Form.Item
            label="Единица измерения"
            name="unit"
            rules={[{ required: true, message: 'Выберите единицу измерения' }]}
          >
            <Select options={unitOptions} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Минимальный остаток"
        name="min_level"
        tooltip='Когда остаток опустится до этого значения, товар будет отмечен как "Мало"'
        rules={[
          { required: true, message: 'Введите минимальный остаток' },
          {
            type: 'number',
            min: 0,
            message: 'Минимальный остаток не может быть отрицательным'
          }
        ]}
      >
        <InputNumber
          min={0}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="Поставщик по умолчанию"
        name="default_supplier_id"
      >
        <Select
          allowClear
          loading={suppliersQuery.isPending}
          disabled={suppliersQuery.isError}
          showSearch={{ optionFilterProp: 'label' }}
          placeholder={suppliersQuery.isError ? 'Не удалось загрузить' : 'Не выбран'}
          options={suppliers.map(s => ({ value: s.id, label: s.name }))}
        />
      </Form.Item>

      <Divider style={{ margin: '8px 0 16px' }} />

      <Flex
        justify="flex-end"
        gap={8}
      >
        <Button
          htmlType="button"
          onClick={onCancel}
          disabled={false}
        >
          Отмена
        </Button>

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
