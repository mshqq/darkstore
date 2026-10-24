import type { Unit } from '@/types/units';

export type Product = {
  id: number;
  name: string;
  sku: string;
  unit: Unit;
  min_level: number;
  is_active: boolean;
  default_supplier_id?: number;
  created_at: Date;
};

export type ProductCreate = {
  name: string;
  sku: string;
  unit: Unit;
  min_level: number;
  default_supplier_id: number | null;
};
