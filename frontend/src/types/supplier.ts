export type Supplier = {
  id: number;
  name: string;
  inn: string;
  contact_person: string;
  address: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

export type SupplierCreate = {
  name: string;
  inn: string;
  contact_person: string;
  address: string;
  phone: string;
  email: string | null;
};

export type SupplierUpdate = {
  name?: string;
  inn?: string;
  contact_person?: string;
  address?: string;
  phone?: string;
  email?: string | null;
};
