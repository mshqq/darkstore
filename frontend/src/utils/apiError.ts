import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const detail = error.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return (
      detail
        .map((item: { msg?: string }) => item.msg)
        .filter(Boolean)
        .join(', ') || fallback
    );
  }

  return fallback;
}
