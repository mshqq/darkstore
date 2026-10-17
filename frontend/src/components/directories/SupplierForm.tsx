import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App, Button, Flex, Form, Input } from 'antd';
import { createSupplier } from '../../api/suppliers';
import type { SupplierCreate } from '../../types/supplier';
import { getApiErrorMessage } from '../../utils/apiError';

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
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Название"
        name="name"
        rules={[{ required: true, message: 'Введите название' }]}
      >
        <Input maxLength={255} />
      </Form.Item>

      <Form.Item
        label="ИНН"
        name="inn"
        rules={[
          { required: true, message: 'Введите ИНН' },
          {
            pattern: /^\d{10}(\d{2})?$/,
            message: 'ИНН должен содержать 10 или 12 цифр'
          }
        ]}
      >
        <Input maxLength={12} />
      </Form.Item>

      <Form.Item
        label="Контактное лицо"
        name="contact_person"
        rules={[{ required: true, message: 'Введите контактное лицо' }]}
      >
        <Input maxLength={255} />
      </Form.Item>

      <Form.Item
        label="Адрес"
        name="address"
        rules={[{ required: true, message: 'Введите адрес' }]}
      >
        <Input maxLength={255} />
      </Form.Item>

      <Form.Item
        label="Телефон"
        name="phone"
        rules={[
          { required: true, message: 'Введите телефон' },
          { min: 5, max: 32, message: 'Телефон должен содержать от 5 до 32 символов' }
        ]}
      >
        <Input maxLength={32} />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ type: 'email', message: 'Введите корректный Email' }]}
      >
        <Input />
      </Form.Item>

      <Flex
        justify="flex-end"
        gap="small"
      >
        <Button onClick={onCancel}>Отмена</Button>

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
