from datetime import date

from fastapi import APIRouter, HTTPException, Query

import store
from models import Booking, EventType, EventTypeInput

router = APIRouter(prefix="/admin")


@router.get("/event-types", response_model=list[EventType])
def list_event_types():
    return store.list_event_types()


@router.post("/event-types", response_model=EventType, status_code=201)
def create_event_type(body: EventTypeInput):
    return store.create_event_type(body.model_dump())


@router.put("/event-types/{id}", response_model=EventType)
def update_event_type(id: str, body: EventTypeInput):
    et = store.update_event_type(id, body.model_dump())
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")
    return et


@router.delete("/event-types/{id}", status_code=204)
def delete_event_type(id: str):
    if not store.delete_event_type(id):
        raise HTTPException(status_code=404, detail="Event type not found")


@router.get("/bookings", response_model=list[Booking])
def list_bookings(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
):
    return store.list_bookings(from_date=from_date, to_date=to_date)


@router.delete("/bookings/{id}", status_code=204)
def cancel_booking(id: str):
    if not store.cancel_booking(id):
        raise HTTPException(status_code=404, detail="Booking not found")
