import { Alert, Container, Loader, SimpleGrid, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listEventTypes, getProfile } from '../api/guest';
import EventTypeCard from '../components/EventTypeCard';
import OwnerProfile from '../components/OwnerProfile';

export default function LandingPage() {
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const eventTypesQuery = useQuery({
    queryKey: ['event-types'],
    queryFn: listEventTypes,
  });

  if (profileQuery.isLoading || eventTypesQuery.isLoading) {
    return <Container pt="xl"><Loader /></Container>;
  }

  if (profileQuery.error || eventTypesQuery.error) {
    return (
      <Container pt="xl">
        <Alert color="red">Не удалось загрузить данные</Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      {profileQuery.data && <OwnerProfile profile={profileQuery.data} />}
      <Title order={3} mb="md">Типы встреч</Title>
      <SimpleGrid cols={1} spacing="sm">
        {eventTypesQuery.data?.map((et) => (
          <EventTypeCard
            key={et.id}
            eventType={et}
            onClick={() => navigate(`/book/${et.id}`)}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}
