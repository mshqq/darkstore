import { useCurrentUser } from '@/hooks/auth/useCurrentUser';
import { getAccessToken } from '@/utils/authToken';
import { Alert, Button, Spin } from 'antd';
import axios from 'axios';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = () => {
  const userQuery = useCurrentUser();
  const token = getAccessToken();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (userQuery.isPending) {
    return <Spin />;
  }

  if (userQuery.isError) {
    const error = userQuery.error;

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }

    return (
      <Alert
        type="error"
        title="Не удалось проверить вход"
        action={<Button onClick={() => userQuery.refetch()}>Повторить</Button>}
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
