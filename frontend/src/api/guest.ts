import { apiFetch } from './client';
import type { Booking, BookingInput, EventType, OwnerProfile, TimeSlot } from '../types';

export const getProfile = () =>
  apiFetch<OwnerProfile>('/api/profile');

export const listEventTypes = () =>
  apiFetch<EventType[]>('/api/event-types');

export const getEventType = (id: string) =>
  apiFetch<EventType>(`/api/event-types/${id}`);

export const getAvailableSlots = (id: string, startDate?: string) => {
  const params = startDate ? `?startDate=${startDate}` : '';
  return apiFetch<TimeSlot[]>(`/api/event-types/${id}/slots${params}`);
};

export const createBooking = (body: BookingInput) =>
  apiFetch<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const getBooking = (id: string) =>
  apiFetch<Booking>(`/api/bookings/${id}`);
