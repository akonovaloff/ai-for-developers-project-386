from datetime import datetime
from pydantic import BaseModel


class OwnerProfile(BaseModel):
    id: str
    name: str
    bio: str
    avatarUrl: str | None = None
    timezone: str


class EventType(BaseModel):
    id: str
    name: str
    description: str
    durationMinutes: int


class EventTypeInput(BaseModel):
    name: str
    description: str
    durationMinutes: int


class TimeSlot(BaseModel):
    startTime: datetime
    endTime: datetime


class BookingInput(BaseModel):
    eventTypeId: str
    startTime: datetime
    guestName: str
    guestEmail: str
    notes: str | None = None


class Booking(BaseModel):
    id: str
    eventTypeId: str
    eventTypeName: str
    durationMinutes: int
    startTime: datetime
    endTime: datetime
    guestName: str
    guestEmail: str
    notes: str | None = None
    createdAt: datetime


class ApiError(BaseModel):
    message: str
    code: str | None = None
