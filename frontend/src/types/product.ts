import type { Unit } from '@/types/units';

export type Product = {
  id: number;
  name: string;
  description: string | null;
  selling_price: string | null;
  image_url: string | null;
  sku: string;
  unit: Unit;
  min_level: number;
  is_active: boolean;
  default_supplier_id: number | null;
  created_at: string;
};

export type ProductCreate = {
  name: string;
  selling_price?: string | null;
  sku: string;
  unit: Unit;
  min_level: number;
  default_supplier_id: number | null;
};

export type ProductUpdate = {
  name?: string;
  selling_price?: string | null;
  sku?: string;
  min_level?: number;
  default_supplier_id?: number | null;
  description?: string | null;
};
