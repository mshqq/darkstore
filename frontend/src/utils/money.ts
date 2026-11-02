export const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB'
});

export const formatMoney = (value: number | string) => moneyFormatter.format(Number(value));
