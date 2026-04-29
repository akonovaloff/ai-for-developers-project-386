import { Alert, Badge, Button, Container, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { getBooking } from '../api/guest';

export default function ConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId!),
    enabled: !!bookingId,
  });

  if (isLoading) return <Container pt="xl"><Loader /></Container>;
  if (error || !booking) return <Container pt="xl"><Alert color="red">Бронирование не найдено</Alert></Container>;

  return (
    <Container size="xs" py="xl">
      <Stack gap="lg" align="center">
        <IconCheck size={48} color="green" />
        <Title order={2}>Встреча забронирована!</Title>

        <Paper withBorder radius="md" p="lg" w="100%">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={500}>{booking.eventTypeName}</Text>
              <Badge variant="light">{booking.durationMinutes} мин</Badge>
            </Group>
            <Text>{dayjs(booking.startTime).format('D MMMM YYYY, HH:mm')}</Text>
            <Text c="dimmed" size="sm">{booking.guestName} · {booking.guestEmail}</Text>
            {booking.notes && <Text size="sm">{booking.notes}</Text>}
          </Stack>
        </Paper>

        <Button variant="subtle" onClick={() => navigate('/')}>На главную</Button>
      </Stack>
    </Container>
  );
}
