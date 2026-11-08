import type { CustomerOrder } from '@/types/customerOrder';
import { orderDateFormatter } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { CommentOutlined, EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import { Card, Flex, Space, theme, Typography } from 'antd';

type CustomerOrderCardProps = {
  order: CustomerOrder;
  onOpen: (id: number) => void;
};

const CustomerOrderCard = ({ order, onOpen }: CustomerOrderCardProps) => {
  const { token } = theme.useToken();

  return (
    <Card
      onClick={() => onOpen(order.id)}
      size="small"
      style={{ borderRadius: 10, cursor: 'pointer' }}
    >
      <Flex
        vertical
        gap={6}
      >
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={4}
        >
          <Typography.Text
            type="secondary"
            strong
            style={{ fontSize: 12 }}
          >
            Заказ №{order.id}
          </Typography.Text>

          <Typography.Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            <time dateTime={order.created_at}>
              {orderDateFormatter.format(new Date(order.created_at))}
            </time>
          </Typography.Text>
        </Flex>

        <Flex justify="space-between">
          <Typography.Text
            strong
            style={{ fontSize: 15, overflowWrap: 'anywhere' }}
          >
            {order.customer_name}
          </Typography.Text>

          <Typography.Text strong>{formatMoney(order.total)}</Typography.Text>
        </Flex>

        <Flex
          align="baseline"
          gap={6}
          style={{ color: token.colorTextSecondary }}
        >
          <EnvironmentOutlined />{' '}
          <Typography.Text
            type="secondary"
            style={{ fontSize: 13, overflowWrap: 'anywhere' }}
          >
            {order.address}
          </Typography.Text>
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={6}
          style={{
            marginTop: 2,
            paddingTop: 7,
            borderTop: `1px solid ${token.colorSplit}`
          }}
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12 }}
          >
            <Space size={5}>
              <InboxOutlined />
              <span>Позиций: {order.items.length}</span>
            </Space>
          </Typography.Text>

          {order.comment?.trim() && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, overflowWrap: 'anywhere' }}
            >
              <Space size={5}>
                <CommentOutlined />
                <span>Комментарий: {order.comment}</span>
              </Space>
            </Typography.Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default CustomerOrderCard;
