import { EMPTY_PRODUCTS } from '@/constants/products';
import { statusConfig } from '@/constants/purchaseOrder';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import { useProducts } from '@/hooks/products/useProducts';
import { usePurchaseOrder } from '@/hooks/purchasing/usePurchaseOrder';
import { usePurchaseOrderActions } from '@/hooks/purchasing/usePurchaseOrderActions';
import { useSuppliers } from '@/hooks/suppliers/useSuppliers';
import type { PurchaseOrderItem } from '@/types/purchaseOrder';
import { formatMoney } from '@/utils/money';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Popconfirm, Spin, Table, Tag, Typography } from 'antd';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const formatDate = (value: string | null): string => {
  if (value === null) {
    return '-';
  }

  return new Date(value).toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const PurchaseOrderPage = () => {
  const { id } = useParams();
  const orderId = Number(id);
  const orderQuery = usePurchaseOrder(orderId);

  const supplierQuery = useSuppliers();
  const productsQuery = useProducts();

  const { sendMutation, receiveMutation } = usePurchaseOrderActions();

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return (
      <Alert
        type="error"
        title="Некорректный номер закупки"
      />
    );
  }

  if (orderQuery.isPending) {
    return <Spin />;
  }

  if (orderQuery.isError) {
    const isNotFound =
      axios.isAxiosError(orderQuery.error) && orderQuery.error.response?.status === 404;

    return (
      <Alert
        type="error"
        title={isNotFound ? 'Закупка не найдена' : 'Не удалось загрузить закупку'}
        description={
          isNotFound
            ? 'Проверь номер закупки или вернись к списку'
            : 'Попробуй загрузить данные ещё раз'
        }
        action={
          isNotFound ? (
            <Button icon={<ArrowLeftOutlined />}>
              <Link to="/orders">К списку закупок</Link>
            </Button>
          ) : (
            <Button
              loading={orderQuery.isFetching}
              onClick={() => orderQuery.refetch()}
            >
              Повторить
            </Button>
          )
        }
      />
    );
  }

  const order = orderQuery.data;
  const total = order.items.reduce((sum, item) => sum + item.qty * Number(item.price), 0);

  const currentStatus = statusConfig[order.status];

  const suppliers = supplierQuery.data ?? EMPTY_SUPPLIERS;
  const products = productsQuery.data ?? EMPTY_PRODUCTS;

  const supplierNames = new Map(suppliers.map(supplier => [supplier.id, supplier.name]));
  const productNames = new Map(products.map(product => [product.id, product.name]));

  return (
    <>
      <Link to="/orders">
        <Button icon={<ArrowLeftOutlined />}>К списку закупок</Button>
      </Link>

      <Typography.Title level={3}>Закупка №{order.id}</Typography.Title>

      {order.status === 'draft' && (
        <Popconfirm
          title="Отправить закупку поставщику?"
          description="После отправки закупку можно будет принять на склад."
          okText="Отправить"
          cancelText="Отмена"
          onConfirm={() => sendMutation.mutateAsync(order.id)}
        >
          <Button
            type="primary"
            style={{ marginBottom: 10 }}
            loading={sendMutation.isPending}
            disabled={sendMutation.isPending}
          >
            Отправить поставщику
          </Button>
        </Popconfirm>
      )}

      {order.status === 'sent' && (
        <Popconfirm
          title="Принять закупку на склад?"
          description="Количество всех позиций будет добавлено к остаткам."
          okText="Принять"
          cancelText="Отмена"
          onConfirm={() => receiveMutation.mutateAsync(order.id)}
        >
          <Button
            type="primary"
            style={{ marginBottom: 10 }}
            loading={receiveMutation.isPending}
            disabled={receiveMutation.isPending}
          >
            Принять на склад
          </Button>
        </Popconfirm>
      )}

      <Descriptions
        bordered
        column={1}
        items={[
          {
            key: 'supplier',
            label: 'Поставщик',
            children: supplierQuery.isPending
              ? 'Загрузка поставщика...'
              : (supplierNames.get(order.supplier_id) ?? `№{order.supplier_id}`)
          },
          {
            key: 'status',
            label: 'Статус',
            children: <Tag color={currentStatus.color}>{currentStatus.label}</Tag>
          },
          { key: 'comment', label: 'Комментарий', children: order.comment },
          { key: 'created_at', label: 'Создана', children: formatDate(order.created_at) },
          { key: 'created_at', label: 'Отправлена', children: formatDate(order.sent_at) },
          { key: 'created_at', label: 'Принята', children: formatDate(order.received_at) }
        ]}
      />

      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        dataSource={order.items}
        pagination={false}
        columns={[
          {
            title: 'Товар',
            dataIndex: 'product_id',
            key: 'product_id',
            render: (id: number) => productNames.get(id)
          },
          {
            title: 'Количество',
            dataIndex: 'qty',
            key: 'qty',
            render: (qty: number, item: PurchaseOrderItem) => {
              const product = products.find(product => product.id === item.product_id);
              return `${qty} ${product?.unit ?? ''}`.trim();
            }
          },
          {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            render: (price: string) => formatMoney(price)
          },
          {
            title: 'Сумма',
            key: 'total',
            render: (_: unknown, item: PurchaseOrderItem) =>
              formatMoney(item.qty * Number(item.price))
          }
        ]}
      />
      <Typography.Title level={4}>Итого: {formatMoney(total)}</Typography.Title>
    </>
  );
};

export default PurchaseOrderPage;
