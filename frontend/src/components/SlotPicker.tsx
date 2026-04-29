import { Button, Group, Text } from '@mantine/core';
import dayjs from 'dayjs';
import type { TimeSlot } from '../types';

interface Props {
  slots: TimeSlot[];
  selected: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export default function SlotPicker({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return <Text c="dimmed">Нет доступных слотов на этот день</Text>;
  }

  return (
    <Group gap="xs" wrap="wrap">
      {slots.map((slot) => {
        const label = dayjs(slot.startTime).format('HH:mm');
        const isSelected = selected?.startTime === slot.startTime;
        return (
          <Button
            key={slot.startTime}
            variant={isSelected ? 'filled' : 'outline'}
            size="sm"
            onClick={() => onSelect(slot)}
          >
            {label}
          </Button>
        );
      })}
    </Group>
  );
}
