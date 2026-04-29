export interface OwnerProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  timezone: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeInput {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  notes?: string;
  createdAt: string;
}

export interface BookingInput {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
  notes?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
