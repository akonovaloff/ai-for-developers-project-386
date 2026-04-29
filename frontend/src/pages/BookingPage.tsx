import { Alert, Badge, Button, Container, Divider, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBooking, getAvailableSlots, getEventType } from '../api/guest';
import { ApiRequestError } from '../api/client';
import BookingForm from '../components/BookingForm';
import SlotPicker from '../components/SlotPicker';
import type { TimeSlot } from '../types';

dayjs.locale('ru');

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [conflictError, setConflictError] = useState(false);

  const eventTypeQuery = useQuery({
    queryKey: ['event-type', eventTypeId],
    queryFn: () => getEventType(eventTypeId!),
    enabled: !!eventTypeId,
  });

  const slotsQuery = useQuery({
    queryKey: ['slots', eventTypeId, selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null],
    queryFn: () => getAvailableSlots(eventTypeId!, dayjs(selectedDate!).format('YYYY-MM-DD')),
    enabled: !!selectedDate && !!eventTypeId,
  });

  const slotsForDay = (slotsQuery.data ?? []).filter(
    (s) => selectedDate && dayjs(s.startTime).isSame(dayjs(selectedDate), 'day'),
  );

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => navigate(`/booking/${booking.id}`),
    onError: (err) => {
      if (err instanceof ApiRequestError && err.status === 409) {
        setConflictError(true);
        setSelectedSlot(null);
      }
    },
  });

  const today = dayjs().startOf('day').toDate();
  const maxDate = dayjs().add(14, 'day').toDate();

  function handleDateChange(value: string | null) {
    setSelectedDate(value);
    setSelectedSlot(null);
    setConflictError(false);
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setConflictError(false);
  }

  function handleSubmit(values: { guestName: string; guestEmail: string; notes?: string }) {
    if (!selectedSlot || !eventTypeId) return;
    mutation.mutate({ ...values, eventTypeId, startTime: selectedSlot.startTime });
  }

  if (eventTypeQuery.isLoading) return <Container pt="xl"><Loader /></Container>;
  if (eventTypeQuery.error) return <Container pt="xl"><Alert color="red">Тип события не найден</Alert></Container>;

  const et = eventTypeQuery.data!;

  return (
    <Container size="sm" py="xl">
      <Button variant="subtle" mb="md" onClick={() => navigate('/')}>← Назад</Button>

      <Stack gap="lg">
        <div>
          <Group gap="sm" align="center">
            <Title order={2}>{et.name}</Title>
            <Badge variant="light">{et.durationMinutes} мин</Badge>
          </Group>
          <Text c="dimmed" mt={4}>{et.description}</Text>
        </div>

        <div>
          <Text fw={500} mb="xs">Выберите дату</Text>
          <DatePicker
            locale="ru"
            minDate={today}
            maxDate={maxDate}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        {selectedDate && (
          <>
            <Divider />
            <div>
              <Text fw={500} mb="xs">
                Доступные слоты — {dayjs(selectedDate).format('D MMMM')}
              </Text>
              {slotsQuery.isLoading ? <Loader size="sm" /> : (
                <SlotPicker
                  slots={slotsForDay}
                  selected={selectedSlot}
                  onSelect={handleSlotSelect}
                />
              )}
            </div>
          </>
        )}

        {conflictError && (
          <Alert color="orange">Этот слот уже занят — выберите другое время</Alert>
        )}

        {selectedSlot && (
          <>
            <Divider />
            <div>
              <Text fw={500} mb="xs">
                Ваши данные — {dayjs(selectedSlot.startTime).format('D MMMM, HH:mm')}
              </Text>
              <BookingForm loading={mutation.isPending} onSubmit={handleSubmit} />
            </div>
          </>
        )}
      </Stack>
    </Container>
  );
}
