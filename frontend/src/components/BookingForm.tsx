import { Button, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface FormValues {
  guestName: string;
  guestEmail: string;
  notes: string;
}

interface Props {
  loading: boolean;
  onSubmit: (values: { guestName: string; guestEmail: string; notes?: string }) => void;
}

export default function BookingForm({ loading, onSubmit }: Props) {
  const form = useForm<FormValues>({
    initialValues: { guestName: '', guestEmail: '', notes: '' },
    validate: {
      guestName: (v) => v.trim().length < 2 ? 'Введите имя' : null,
      guestEmail: (v) => /^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректный email',
    },
  });

  return (
    <form noValidate onSubmit={form.onSubmit((v) => onSubmit({ ...v, notes: v.notes || undefined }))}>
      <Stack gap="sm">
        <TextInput label="Ваше имя" placeholder="Иван Иванов" required {...form.getInputProps('guestName')} />
        <TextInput label="Email" placeholder="ivan@example.com" required {...form.getInputProps('guestEmail')} />
        <Textarea label="Комментарий" placeholder="Необязательно" autosize minRows={2} {...form.getInputProps('notes')} />
        <Button type="submit" loading={loading}>Забронировать</Button>
      </Stack>
    </form>
  );
}
