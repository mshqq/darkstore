export type CustomerOrderStatus =
  | 'new'
  | 'picking'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type CustomerOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  qty: number;
  price: string;
};

export type CustomerOrder = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  comment: string | null;
  status: CustomerOrderStatus;
  created_at: string;

  total: string;

  items: CustomerOrderItem[];
};
