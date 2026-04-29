import os
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text, and_, create_engine, func
from sqlalchemy.orm import DeclarativeBase, Session
from sqlalchemy.pool import StaticPool

from models import Booking, EventType

_raw_url = os.environ.get("DATABASE_URL", "sqlite:///:memory:")
DATABASE_URL = _raw_url.replace("postgres://", "postgresql://", 1)

_kwargs: dict = {}
if DATABASE_URL.startswith("sqlite"):
    _kwargs = {"connect_args": {"check_same_thread": False}, "poolclass": StaticPool}

engine = create_engine(DATABASE_URL, **_kwargs)


class Base(DeclarativeBase):
    pass


class EventTypeRow(Base):
    __tablename__ = "event_types"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    duration_minutes = Column(Integer, nullable=False)


class BookingRow(Base):
    __tablename__ = "bookings"
    id = Column(String, primary_key=True)
    event_type_id = Column(String, nullable=False)
    event_type_name = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    guest_name = Column(String, nullable=False)
    guest_email = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)


def init_db() -> None:
    Base.metadata.create_all(engine)
    with Session(engine) as s:
        if s.query(EventTypeRow).count() == 0:
            s.add_all([
                EventTypeRow(id="et-1", name="Консультация 30 мин", description="Разбор карьерных вопросов и планирование роста", duration_minutes=30),
                EventTypeRow(id="et-2", name="Стратегическая сессия", description="Глубокий разбор карьерной стратегии", duration_minutes=60),
            ])
            s.commit()


init_db()


def reset() -> None:
    with Session(engine) as s:
        s.query(BookingRow).delete()
        s.query(EventTypeRow).delete()
        s.commit()
    init_db()


def _to_event_type(row: EventTypeRow) -> EventType:
    return EventType(id=row.id, name=row.name, description=row.description, durationMinutes=row.duration_minutes)


def _to_booking(row: BookingRow) -> Booking:
    return Booking(
        id=row.id,
        eventTypeId=row.event_type_id,
        eventTypeName=row.event_type_name,
        durationMinutes=row.duration_minutes,
        startTime=row.start_time,
        endTime=row.end_time,
        guestName=row.guest_name,
        guestEmail=row.guest_email,
        notes=row.notes,
        createdAt=row.created_at,
    )


# --- Event types ---

def list_event_types() -> list[EventType]:
    with Session(engine) as s:
        return [_to_event_type(r) for r in s.query(EventTypeRow).all()]


def get_event_type(id: str) -> EventType | None:
    with Session(engine) as s:
        row = s.get(EventTypeRow, id)
        return _to_event_type(row) if row else None


def create_event_type(data: dict) -> EventType:
    with Session(engine) as s:
        row = EventTypeRow(id=str(uuid.uuid4()), name=data["name"], description=data["description"], duration_minutes=data["durationMinutes"])
        s.add(row)
        s.commit()
        s.refresh(row)
        return _to_event_type(row)


def update_event_type(id: str, data: dict) -> EventType | None:
    with Session(engine) as s:
        row = s.get(EventTypeRow, id)
        if not row:
            return None
        row.name = data["name"]
        row.description = data["description"]
        row.duration_minutes = data["durationMinutes"]
        s.commit()
        s.refresh(row)
        return _to_event_type(row)


def delete_event_type(id: str) -> bool:
    with Session(engine) as s:
        row = s.get(EventTypeRow, id)
        if not row:
            return False
        s.delete(row)
        s.commit()
        return True


# --- Bookings ---

def list_bookings(from_date: date | None = None, to_date: date | None = None) -> list[Booking]:
    now = datetime.now(timezone.utc)
    with Session(engine) as s:
        q = s.query(BookingRow).filter(BookingRow.start_time >= now)
        if from_date:
            q = q.filter(func.date(BookingRow.start_time) >= from_date)
        if to_date:
            q = q.filter(func.date(BookingRow.start_time) <= to_date)
        return [_to_booking(r) for r in q.order_by(BookingRow.start_time).all()]


def get_booking(id: str) -> Booking | None:
    with Session(engine) as s:
        row = s.get(BookingRow, id)
        return _to_booking(row) if row else None


def create_booking(booking: Booking) -> Booking:
    row = BookingRow(
        id=booking.id,
        event_type_id=booking.eventTypeId,
        event_type_name=booking.eventTypeName,
        duration_minutes=booking.durationMinutes,
        start_time=booking.startTime,
        end_time=booking.endTime,
        guest_name=booking.guestName,
        guest_email=booking.guestEmail,
        notes=booking.notes,
        created_at=booking.createdAt,
    )
    with Session(engine) as s:
        s.add(row)
        s.commit()
    return booking


def cancel_booking(id: str) -> bool:
    with Session(engine) as s:
        row = s.get(BookingRow, id)
        if not row:
            return False
        s.delete(row)
        s.commit()
        return True


def has_overlap(start: datetime, end: datetime) -> bool:
    with Session(engine) as s:
        return s.query(BookingRow).filter(
            and_(BookingRow.start_time < end, BookingRow.end_time > start)
        ).count() > 0
