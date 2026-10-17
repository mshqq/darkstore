export type Supplier = {
  id: number;
  name: string;
  inn: string;
  contact_person: string;
  address: string;
  phone: string;
  email?: string;
  is_active: boolean;
  created_at: Date;
};

export type SupplierCreate = {
  name: string;
  inn: string;
  contact_person: string;
  address: string;
  phone: string;
  email: string | null;
};
