import { AppShell, Container, NavLink, Title } from '@mantine/core';
import { IconCalendar, IconList } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="sm">
        <Title order={4} mb="md" px="xs">Панель владельца</Title>
        <NavLink
          label="Типы событий"
          leftSection={<IconList size={16} />}
          active={location.pathname === '/admin'}
          onClick={() => navigate('/admin')}
        />
        <NavLink
          label="Бронирования"
          leftSection={<IconCalendar size={16} />}
          active={location.pathname === '/admin/bookings'}
          onClick={() => navigate('/admin/bookings')}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="md">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
