import uuid
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

import store
from models import Booking, BookingInput, EventType, OwnerProfile, TimeSlot

router = APIRouter(prefix="/api")

OWNER_PROFILE = OwnerProfile(
    id="owner-1",
    name="Иван Петров",
    bio="Консультант по карьере",
    timezone="Europe/Moscow",
)

_WORK_START = time(9, 0)
_WORK_END = time(18, 0)
_BOOKING_WINDOW_DAYS = 14


@router.get("/profile", response_model=OwnerProfile)
def get_profile():
    return OWNER_PROFILE


@router.get("/event-types", response_model=list[EventType])
def list_event_types():
    return store.list_event_types()


@router.get("/event-types/{id}", response_model=EventType)
def get_event_type(id: str):
    et = store.get_event_type(id)
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")
    return et


@router.get("/event-types/{id}/slots", response_model=list[TimeSlot])
def get_available_slots(id: str, startDate: date | None = None):
    et = store.get_event_type(id)
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")

    tz = ZoneInfo(OWNER_PROFILE.timezone)
    now_utc = datetime.now(timezone.utc)
    window_end_utc = now_utc + timedelta(days=_BOOKING_WINDOW_DAYS)
    booked = store.get_booked_start_times()

    start_day = startDate or now_utc.astimezone(tz).date()
    slots: list[TimeSlot] = []

    current_day = start_day
    while current_day <= window_end_utc.astimezone(tz).date():
        if current_day.weekday() < 5:  # пн–пт
            slot_dt = datetime.combine(current_day, _WORK_START, tzinfo=tz)
            day_end = datetime.combine(current_day, _WORK_END, tzinfo=tz)

            while slot_dt + timedelta(minutes=et.durationMinutes) <= day_end:
                slot_utc = slot_dt.astimezone(timezone.utc)
                slot_end_utc = (slot_dt + timedelta(minutes=et.durationMinutes)).astimezone(timezone.utc)
                if slot_utc > now_utc and slot_utc not in booked:
                    slots.append(TimeSlot(startTime=slot_utc, endTime=slot_end_utc))
                slot_dt += timedelta(minutes=et.durationMinutes)

        current_day += timedelta(days=1)

    return slots


@router.post("/bookings", status_code=201, response_model=Booking)
def create_booking(body: BookingInput):
    et = store.get_event_type(body.eventTypeId)
    if not et:
        raise HTTPException(status_code=400, detail="Event type not found")

    now_utc = datetime.now(timezone.utc)
    start_utc = body.startTime.astimezone(timezone.utc) if body.startTime.tzinfo else body.startTime.replace(tzinfo=timezone.utc)

    if start_utc <= now_utc:
        raise HTTPException(status_code=400, detail="Start time must be in the future")
    if start_utc > now_utc + timedelta(days=_BOOKING_WINDOW_DAYS):
        raise HTTPException(status_code=400, detail="Start time must be within 14 days")

    if start_utc in store.get_booked_start_times():
        return JSONResponse(
            status_code=409,
            content={"message": "Slot is already taken", "code": "SLOT_CONFLICT"},
        )

    booking = Booking(
        id=str(uuid.uuid4()),
        eventTypeId=et.id,
        eventTypeName=et.name,
        durationMinutes=et.durationMinutes,
        startTime=start_utc,
        endTime=start_utc + timedelta(minutes=et.durationMinutes),
        guestName=body.guestName,
        guestEmail=body.guestEmail,
        notes=body.notes,
        createdAt=now_utc,
    )
    store.create_booking(booking)
    return booking


@router.get("/bookings/{id}", response_model=Booking)
def get_booking(id: str):
    booking = store.get_booking(id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
