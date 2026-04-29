import { ActionIcon, Alert, Badge, Group, Loader, Table, Text, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { adminCancelBooking, adminListBookings } from '../../api/admin';

export default function AdminBookings() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminListBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: adminCancelBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }),
  });

  if (isLoading) return <Loader />;
  if (error) return <Alert color="red">Не удалось загрузить бронирования</Alert>;

  return (
    <>
      <Title order={3} mb="md">Бронирования</Title>

      {data?.length === 0 && <Text c="dimmed">Нет предстоящих бронирований</Text>}

      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Гость</Table.Th>
            <Table.Th>Событие</Table.Th>
            <Table.Th>Дата и время</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.map((b) => (
            <Table.Tr key={b.id}>
              <Table.Td>
                <Text fw={500}>{b.guestName}</Text>
                <Text size="xs" c="dimmed">{b.guestEmail}</Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="light">{b.eventTypeName}</Badge>
                <Text size="xs" c="dimmed">{b.durationMinutes} мин</Text>
              </Table.Td>
              <Table.Td>{dayjs(b.startTime).format('D MMM YYYY, HH:mm')}</Table.Td>
              <Table.Td>
                <Group justify="flex-end">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    loading={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(b.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
