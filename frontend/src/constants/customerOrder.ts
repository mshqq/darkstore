import type { CustomerOrderStatus } from '@/types/customerOrder';

export const customerOrderStatusConfig = {
  new: { label: 'Новый', color: 'blue' },
  picking: { label: 'Собирается', color: 'orange' },
  ready: { label: 'Собран', color: 'cyan' },
  delivering: { label: 'В доставке', color: 'purple' },
  delivered: { label: 'Доставлен', color: 'green' },
  cancelled: { label: 'Отменён', color: 'red' }
} satisfies Record<CustomerOrderStatus, { label: string; color: string }>;
