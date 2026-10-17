import { useProducts } from '../hooks/useProducts';

export default function OrdersPage() {
  const { data = [], isPending, isError } = useProducts();

  if (isPending) {
    return <p>Загрузка поставщиков...</p>;
  }

  if (isError) {
    return <p>Не удалось загрузить поставщиков.</p>;
  }

  return (
    <ul>
      {data.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
