export type PurchaseOrderStatus = 'draft' | 'sent' | 'received';

export type PurchaseOrderItem = {
  id: number;
  product_id: number;
  qty: number;
  price: string;
};

export type PurchaseOrderItemCreate = {
  product_id: number;
  qty: number;
  price: string;
};

export type PurchaseOrder = {
  id: number;
  supplier_id: number;
  status: PurchaseOrderStatus;
  comment: string | null;
  created_at: string;
  sent_at: string | null;
  received_at: string | null;
  items: PurchaseOrderItem[];
};

export type PurchaseOrderCreate = {
  supplier_id: number;
  comment: string | null;
  items: PurchaseOrderItemCreate[];
};

export type PurchaseOrderFormValues = {
  supplier_id: number;
  comment?: string;
  items: {
    product_id: number;
    qty: number;
    price: number;
  }[];
};
