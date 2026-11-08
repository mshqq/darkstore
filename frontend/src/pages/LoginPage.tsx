import useLogin from '@/hooks/auth/useLogin';
import type { LoginRequest } from '@/types/auth';
import { Button, Card, Flex, Form, Input } from 'antd';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const loginMutation = useLogin();

  return (
    <Flex
      justify="center"
      align="center"
      className={styles.page}
    >
      <Card
        title="Вход для сотрудников"
        className={styles.card}
      >
        <Form<LoginRequest>
          layout="vertical"
          disabled={loginMutation.isPending}
          onFinish={values => loginMutation.mutate(values)}
        >
          <Form.Item
            label="Имя пользователя"
            name="username"
            rules={[{ required: true, whitespace: true, message: 'Введите имя пользователя' }]}
          >
            <Input autoComplete="username" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, whitespace: true, message: 'Введите пароль' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Button
            htmlType="submit"
            type="primary"
            loading={loginMutation.isPending}
          >
            Войти
          </Button>
        </Form>
      </Card>
    </Flex>
  );
};

export default LoginPage;
