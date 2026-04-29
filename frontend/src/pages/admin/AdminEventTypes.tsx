import {
  ActionIcon, Alert, Button, Group, Loader, Modal,
  NumberInput, Stack, Table, Text, Textarea, TextInput, Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  adminCreateEventType, adminDeleteEventType,
  adminListEventTypes, adminUpdateEventType,
} from '../../api/admin';
import type { EventType, EventTypeInput } from '../../types';

interface FormValues {
  name: string;
  description: string;
  durationMinutes: number | '';
}

function EventTypeForm({
  initial,
  loading,
  onSubmit,
}: {
  initial?: EventType;
  loading: boolean;
  onSubmit: (v: EventTypeInput) => void;
}) {
  const form = useForm<FormValues>({
    initialValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      durationMinutes: initial?.durationMinutes ?? 30,
    },
    validate: {
      name: (v) => v.trim().length < 2 ? 'Введите название' : null,
      durationMinutes: (v) => (v === '' || Number(v) < 5) ? 'Минимум 5 минут' : null,
    },
  });

  return (
    <form onSubmit={form.onSubmit((v) => onSubmit({ ...v, durationMinutes: Number(v.durationMinutes) }))}>
      <Stack gap="sm">
        <TextInput label="Название" required {...form.getInputProps('name')} />
        <Textarea label="Описание" autosize minRows={2} {...form.getInputProps('description')} />
        <NumberInput label="Длительность (мин)" required min={5} step={5} {...form.getInputProps('durationMinutes')} />
        <Button type="submit" loading={loading}>{initial ? 'Сохранить' : 'Создать'}</Button>
      </Stack>
    </form>
  );
}

export default function AdminEventTypes() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-event-types'],
    queryFn: adminListEventTypes,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-event-types'] });

  const createMutation = useMutation({
    mutationFn: adminCreateEventType,
    onSuccess: () => { invalidate(); setModalOpen(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: EventTypeInput }) => adminUpdateEventType(id, body),
    onSuccess: () => { invalidate(); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: adminDeleteEventType,
    onSuccess: invalidate,
  });

  if (isLoading) return <Loader />;
  if (error) return <Alert color="red">Не удалось загрузить данные</Alert>;

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={3}>Типы событий</Title>
        <Button onClick={() => setModalOpen(true)}>+ Добавить</Button>
      </Group>

      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Название</Table.Th>
            <Table.Th>Длительность</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.map((et) => (
            <Table.Tr key={et.id}>
              <Table.Td>
                <Text fw={500}>{et.name}</Text>
                <Text size="xs" c="dimmed">{et.description}</Text>
              </Table.Td>
              <Table.Td>{et.durationMinutes} мин</Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <ActionIcon variant="subtle" onClick={() => setEditing(et)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    loading={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(et.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Новый тип события">
        <EventTypeForm
          loading={createMutation.isPending}
          onSubmit={(v) => createMutation.mutate(v)}
        />
      </Modal>

      <Modal opened={!!editing} onClose={() => setEditing(null)} title="Редактировать тип события">
        {editing && (
          <EventTypeForm
            initial={editing}
            loading={updateMutation.isPending}
            onSubmit={(v) => updateMutation.mutate({ id: editing.id, body: v })}
          />
        )}
      </Modal>
    </>
  );
}
