import { Avatar, Group, Stack, Text, Title } from '@mantine/core';
import type { OwnerProfile as OwnerProfileType } from '../types';

interface Props {
  profile: OwnerProfileType;
}

export default function OwnerProfile({ profile }: Props) {
  return (
    <Group gap="md" mb="xl">
      <Avatar src={profile.avatarUrl} size={72} radius="xl" color="blue">
        {profile.name.charAt(0)}
      </Avatar>
      <Stack gap={4}>
        <Title order={2}>{profile.name}</Title>
        <Text c="dimmed">{profile.bio}</Text>
      </Stack>
    </Group>
  );
}
