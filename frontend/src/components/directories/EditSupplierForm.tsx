import { useUpdateSupplier } from '@/hooks/useUpdateSupplier';
import type { Supplier } from '@/types/supplier';
import { Button, Flex, Form, Input } from 'antd';

type EditSupplierFormValues = Pick<
  Supplier,
  'name' | 'inn' | 'contact_person' | 'address' | 'phone' | 'email'
>;

type EditSupplierFormProps = {
  supplier: Supplier;
  onCancel: () => void;
  onSuccess: () => void;
};

const EditSupplierForm = ({ supplier, onCancel, onSuccess }: EditSupplierFormProps) => {
  const updateMutation = useUpdateSupplier();

  const handleSubmit = (values: EditSupplierFormValues) => {
    updateMutation.mutate(
      { supplierId: supplier.id, data: { ...values, email: values.email?.trim() || null } },
      { onSuccess: () => onSuccess() }
    );
  };

  return (
    <Form<EditSupplierFormValues>
      layout="vertical"
      initialValues={{
        name: supplier.name,
        inn: supplier.inn,
        contact_person: supplier.contact_person,
        address: supplier.address,
        phone: supplier.phone,
        email: supplier.email
      }}
      disabled={updateMutation.isPending}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Название"
        name="name"
        rules={[{ required: true, whitespace: true, message: 'Введите название' }]}
      >
        <Input maxLength={255} />
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
        />
      </Form.Item>

      <Form.Item
        label="Контактное лицо"
        name="contact_person"
        rules={[{ required: true, whitespace: true, message: 'Введите контактное лицо' }]}
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
        <Input
          maxLength={32}
          inputMode="tel"
        />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ type: 'email', message: 'Введите корректный Email' }]}
      >
        <Input type="email" />
      </Form.Item>

      <Form.Item
        label="Адрес"
        name="address"
        rules={[{ required: true, whitespace: true, message: 'Введите адрес' }]}
      >
        <Input maxLength={255} />
      </Form.Item>

      <Flex
        gap={8}
        justify="flex-end"
      >
        <Button onClick={onCancel}>Отмена</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={updateMutation.isPending}
        >
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
};

export default EditSupplierForm;
