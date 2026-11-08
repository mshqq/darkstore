import { createSupplier } from '@/api/suppliers';
import type { SupplierCreate } from '@/types/supplier';
import { getApiErrorMessage } from '@/utils/apiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Button, Col, Divider, Flex, Form, Input, Row } from 'antd';

type SupplierFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

export default function SupplierForm({ onCancel, onSuccess }: SupplierFormProps) {
  const [form] = Form.useForm<SupplierCreate>();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });

      message.success('Поставщик добавлен');
      onSuccess();
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Не удалось добавить поставщика'));
    }
  });

  const handleSubmit = (values: SupplierCreate) => {
    mutation.mutate({
      ...values,
      email: values.email?.trim() || null
    });
  };
  return (
    <Form<SupplierCreate>
      form={form}
      layout="vertical"
      requiredMark="optional"
      onFinish={handleSubmit}
      disabled={mutation.isPending}
    >
      <Form.Item
        label="Название"
        name="name"
        rules={[{ required: true, whitespace: true, message: 'Введите название' }]}
      >
        <Input
          maxLength={255}
          placeholder='ООО "Ромашка"'
        />
      </Form.Item>

      <Form.Item
        label="ИНН"
        name="inn"
        normalize={(value: string) => value?.replace(/\D/g, '')}
        rules={[
          { required: true, message: 'Введите ИНН' },
          {
            pattern: /^\d{10}(\d{2})?$/,
            message: 'ИНН должен содержать 10 или 12 цифр'
          }
        ]}
      >
        <Input
          maxLength={12}
          inputMode="numeric"
          placeholder="10 или 12 цифр"
        />
      </Form.Item>

      <Divider
        titlePlacement="left"
        style={{ margin: '8px 0 16px' }}
      >
        Контакты
      </Divider>

      <Form.Item
        label="Контактное лицо"
        name="contact_person"
        rules={[{ required: true, whitespace: true, message: 'Введите контактное лицо' }]}
      >
        <Input
          maxLength={255}
          placeholder="Иванов Иван Иванович"
          autoComplete="off"
        />
      </Form.Item>

      <Row gutter={12}>
        <Col
          xs={24}
          sm={12}
        >
          <Form.Item
            label="Телефон"
            name="phone"
            rules={[
              { required: true, message: 'Введите телефон' },
              { min: 5, max: 32, message: 'Телефон должен содержать от 5 до 32 символов' }
            ]}
          >
            <Input
              maxLength={32}
              inputMode="tel"
              placeholder="+7 900 000-00-00"
            />
          </Form.Item>
        </Col>

        <Col
          xs={24}
          sm={12}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Введите корректный Email' }]}
          >
            <Input
              inputMode="email"
              placeholder="name@company.ru"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Адрес"
        name="address"
        rules={[{ required: true, whitespace: true, message: 'Введите адрес' }]}
      >
        <Input
          maxLength={255}
          placeholder="Город, улица, дом"
        />
      </Form.Item>

      <Divider style={{ margin: '8px 0 16px' }} />

      <Flex
        justify="flex-end"
        gap={8}
      >
        <Button
          onClick={onCancel}
          disabled={false}
        >
          Отмена
        </Button>

        <Button
          type="primary"
          htmlType="submit"
          loading={mutation.isPending}
        >
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}
