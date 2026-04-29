import uuid
from datetime import datetime, timezone

from models import Booking, EventType

_event_types: dict[str, EventType] = {}
_bookings: dict[str, Booking] = {}


def _seed() -> None:
    for et in [
        EventType(
            id="et-1",
            name="Консультация 30 мин",
            description="Разбор карьерных вопросов и планирование роста",
            durationMinutes=30,
        ),
        EventType(
            id="et-2",
            name="Стратегическая сессия",
            description="Глубокий разбор карьерной стратегии",
            durationMinutes=60,
        ),
    ]:
        _event_types[et.id] = et


_seed()


def reset() -> None:
    _event_types.clear()
    _bookings.clear()
    _seed()


# --- Event types ---

def list_event_types() -> list[EventType]:
    return list(_event_types.values())


def get_event_type(id: str) -> EventType | None:
    return _event_types.get(id)


def create_event_type(data: dict) -> EventType:
    et = EventType(id=str(uuid.uuid4()), **data)
    _event_types[et.id] = et
    return et


def update_event_type(id: str, data: dict) -> EventType | None:
    if id not in _event_types:
        return None
    et = EventType(id=id, **data)
    _event_types[id] = et
    return et


def delete_event_type(id: str) -> bool:
    return _event_types.pop(id, None) is not None


# --- Bookings ---

def list_bookings(
    from_date: datetime | None = None,
    to_date: datetime | None = None,
) -> list[Booking]:
    now = datetime.now(timezone.utc)
    result = [b for b in _bookings.values() if b.startTime >= now]
    if from_date:
        result = [b for b in result if b.startTime.date() >= from_date]
    if to_date:
        result = [b for b in result if b.startTime.date() <= to_date]
    return sorted(result, key=lambda b: b.startTime)


def get_booking(id: str) -> Booking | None:
    return _bookings.get(id)


def create_booking(booking: Booking) -> Booking:
    _bookings[booking.id] = booking
    return booking


def cancel_booking(id: str) -> bool:
    return _bookings.pop(id, None) is not None


def get_booked_start_times() -> set[datetime]:
    return {b.startTime for b in _bookings.values()}
