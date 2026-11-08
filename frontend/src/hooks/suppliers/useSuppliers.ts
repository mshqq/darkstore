import { getSuppliers } from '@/api/suppliers';
import { useQuery } from '@tanstack/react-query';

export function useSuppliers() {
  return useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });
}
