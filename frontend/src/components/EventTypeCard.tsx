import { Badge, Card, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import type { EventType } from '../types';

interface Props {
  eventType: EventType;
  onClick: () => void;
}

export default function EventTypeCard({ eventType, onClick }: Props) {
  return (
    <UnstyledButton onClick={onClick} style={{ display: 'block', width: '100%' }}>
      <Card withBorder radius="md" padding="lg" style={{ cursor: 'pointer' }}>
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Title order={4}>{eventType.name}</Title>
            <Badge leftSection={<IconClock size={12} />} variant="light">
              {eventType.durationMinutes} мин
            </Badge>
          </Group>
          <Text c="dimmed" size="sm">{eventType.description}</Text>
        </Stack>
      </Card>
    </UnstyledButton>
  );
}
