export type StockItem = {
  product_id: number;
  name: string;
  sku: string;
  unit: string;
  min_level: number;
  quantity: number;
  reserved: number;
  available: number;
  is_low: boolean;
};
