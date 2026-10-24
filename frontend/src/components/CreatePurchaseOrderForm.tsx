import { EMPTY_PRODUCTS } from '@/constants/products';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import { useCreatePurchaseOrder } from '@/hooks/useCreatePurchaseOrder';
import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { PurchaseOrderFormValues } from '@/types/purchaseOrder';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
  theme,
  Typography
} from 'antd';

type PurchaseOrderFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB'
});

const formatMoney = (value: number) => moneyFormatter.format(value);

export default function PurchaseOrderForm({ onCancel, onSuccess }: PurchaseOrderFormProps) {
  const { token } = theme.useToken();
  const [form] = Form.useForm<PurchaseOrderFormValues>();
  const createPurchaseOrder = useCreatePurchaseOrder();

  const {
    data: suppliers = EMPTY_SUPPLIERS,
    isPending: isSuppliersPending,
    isError: isSupplierError
  } = useSuppliers();
  const {
    data: products = EMPTY_PRODUCTS,
    isPending: isProductsPending,
    isError: isProductsError
  } = useProducts();

  const items = Form.useWatch('items', form) ?? [];
  const summary = items.reduce<number>((sum, item) => {
    const qty = Number(item?.qty) || 0;
    const price = Number(item?.price) || 0;

    return sum + qty * price;
  }, 0);

  if (isProductsPending || isSuppliersPending) return <Spin />;

  if (isProductsError || isSupplierError) return <p>Не удалось загрузить форму</p>;

  const handleSubmit = (values: PurchaseOrderFormValues) => {
    createPurchaseOrder.mutate(
      {
        ...values,
        comment: values.comment || null,
        items: values.items.map(item => ({ ...item, price: Number(item.price).toFixed(2) }))
      },
      { onSuccess: () => onSuccess() }
    );
  };

  return (
    <Form<PurchaseOrderFormValues>
      form={form}
      layout="vertical"
      requiredMark="optional"
      onFinish={handleSubmit}
      initialValues={{ items: [{}] }}
      disabled={createPurchaseOrder.isPending}
    >
      {createPurchaseOrder.isError && (
        <Alert
          type="error"
          showIcon
          closable
          title="Не удалось создать закупку"
          description="Попробуйте ещё раз"
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Поставщик"
        name="supplier_id"
        rules={[{ required: true, message: 'Выберите поставщика' }]}
      >
        <Select
          showSearch={{ optionFilterProp: 'label' }}
          placeholder="Выберите поставщика"
          options={suppliers.map(s => ({ value: s.id, label: s.name }))}
        />
      </Form.Item>

      <Divider
        titlePlacement="left"
        style={{ margin: '8px 0 16px' }}
      >
        Позиции
      </Divider>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <Flex
            vertical
            gap={12}
          >
            <Flex
              vertical
              gap={12}
              style={{ maxHeight: '48vh', overflowY: 'auto', paddingRight: 4 }}
            >
              {fields.map(field => {
                const item = items[field.name];
                const total = (Number(item?.qty) || 0) * (Number(item?.price) || 0);

                return (
                  <Card
                    key={field.key}
                    size="small"
                    title={`Товар ${field.name + 1}`}
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          aria-label={`Удалить товар ${field.name + 1}`}
                        />
                      )
                    }
                  >
                    <Form.Item
                      label="Номенклатура"
                      name={[field.name, 'product_id']}
                      rules={[{ required: true, message: 'Выберите товар' }]}
                    >
                      <Select
                        showSearch={{ optionFilterProp: 'label' }}
                        placeholder="Выберите товар"
                        options={products.map(p => ({ value: p.id, label: p.name }))}
                      />
                    </Form.Item>

                    <Row gutter={12}>
                      <Col
                        xs={24}
                        sm={12}
                      >
                        <Form.Item
                          label="Количество"
                          name={[field.name, 'qty']}
                          rules={[
                            { required: true, message: 'Введите количество' },
                            {
                              type: 'number',
                              min: 1,
                              message: 'Должно быть больше нуля'
                            }
                          ]}
                        >
                          <InputNumber
                            min={1}
                            precision={0}
                            placeholder="0"
                            suffix="шт."
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        xs={24}
                        sm={12}
                      >
                        <Form.Item
                          label="Цена за единицу"
                          name={[field.name, 'price']}
                          rules={[
                            { required: true, message: 'Введите цену' },
                            { type: 'number', min: 0.01, message: 'Должна быть больше нуля' }
                          ]}
                        >
                          <InputNumber
                            min={0.01}
                            precision={2}
                            step={0.01}
                            placeholder="Цена за единицу"
                            suffix="₽"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Flex
                      justify="space-between"
                      align="center"
                      style={{
                        padding: '6px 12px',
                        borderRadius: token.borderRadius,
                        background: token.colorFillQuaternary
                      }}
                    >
                      <Typography.Text type="secondary">Сумма позиции</Typography.Text>
                      <Typography.Text strong>{formatMoney(total)}</Typography.Text>
                    </Flex>
                  </Card>
                );
              })}
            </Flex>

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add()}
              block
            >
              Добавить товар
            </Button>
          </Flex>
        )}
      </Form.List>

      <Form.Item
        label="Комментарий"
        name="comment"
        style={{ marginTop: 16 }}
      >
        <Input.TextArea
          placeholder="Необязательный комментарий..."
          maxLength={500}
          showCount
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>

      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: '12px 16px',
          borderRadius: token.borderRadius,
          background: token.colorPrimaryBg,
          marginBottom: 16
        }}
      >
        <Typography.Text>Итого по закупке</Typography.Text>
        <Typography.Title
          level={4}
          style={{ margin: 0, color: token.colorPrimary }}
        >
          {formatMoney(summary)}
        </Typography.Title>
      </Flex>

      <Flex
        justify="end"
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
          loading={createPurchaseOrder.isPending}
        >
          Создать закупку
        </Button>
      </Flex>
    </Form>
  );
}
