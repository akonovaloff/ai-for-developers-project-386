import { apiFetch } from './client';
import type { Booking, EventType, EventTypeInput } from '../types';

export const adminListEventTypes = () =>
  apiFetch<EventType[]>('/admin/event-types');

export const adminCreateEventType = (body: EventTypeInput) =>
  apiFetch<EventType>('/admin/event-types', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const adminUpdateEventType = (id: string, body: EventTypeInput) =>
  apiFetch<EventType>(`/admin/event-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const adminDeleteEventType = (id: string) =>
  apiFetch<void>(`/admin/event-types/${id}`, { method: 'DELETE' });

export const adminListBookings = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return apiFetch<Booking[]>(`/admin/bookings${qs ? `?${qs}` : ''}`);
};

export const adminCancelBooking = (id: string) =>
  apiFetch<void>(`/admin/bookings/${id}`, { method: 'DELETE' });
