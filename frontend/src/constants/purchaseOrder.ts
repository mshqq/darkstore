import type { PurchaseOrderStatus } from '@/types/purchaseOrder';

export const statusConfig: Record<
  PurchaseOrderStatus,
  { label: string; color: string; actionLabel: string | null }
> = {
  draft: { label: 'Черновик', color: 'default', actionLabel: 'Отправить' },
  sent: { label: 'Отправлен', color: 'blue', actionLabel: 'Принять на склад' },
  received: { label: 'Принят на склад', color: 'green', actionLabel: null }
};
