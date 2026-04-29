from datetime import datetime, timedelta, timezone

import pytest
from starlette.testclient import TestClient


FUTURE = (datetime.now(timezone.utc) + timedelta(days=1, hours=3)).strftime("%Y-%m-%dT%H:%M:%SZ")
FAR_FUTURE = (datetime.now(timezone.utc) + timedelta(days=20)).strftime("%Y-%m-%dT%H:%M:%SZ")
PAST = (datetime.now(timezone.utc) - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")


# --- Profile ---

def test_get_profile(client: TestClient):
    r = client.get("/api/profile")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "owner-1"
    assert data["timezone"] == "Europe/Moscow"


# --- Event types ---

def test_list_event_types_returns_seed_data(client: TestClient):
    r = client.get("/api/event-types")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_get_event_type(client: TestClient):
    r = client.get("/api/event-types/et-1")
    assert r.status_code == 200
    assert r.json()["durationMinutes"] == 30


def test_get_event_type_not_found(client: TestClient):
    r = client.get("/api/event-types/unknown")
    assert r.status_code == 404


# --- Slots ---

def test_get_slots_returns_list(client: TestClient):
    r = client.get("/api/event-types/et-1/slots")
    assert r.status_code == 200
    slots = r.json()
    assert len(slots) > 0
    assert "startTime" in slots[0]
    assert "endTime" in slots[0]


def test_get_slots_excludes_past(client: TestClient):
    r = client.get("/api/event-types/et-1/slots")
    now = datetime.now(timezone.utc)
    for slot in r.json():
        assert datetime.fromisoformat(slot["startTime"]) > now


def test_get_slots_excludes_booked(client: TestClient):
    slots = client.get("/api/event-types/et-1/slots").json()
    slot_time = slots[0]["startTime"]

    client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": slot_time,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    })

    slots_after = client.get("/api/event-types/et-1/slots").json()
    booked_times = {s["startTime"] for s in slots_after}
    assert slot_time not in booked_times


def test_get_slots_not_found(client: TestClient):
    r = client.get("/api/event-types/unknown/slots")
    assert r.status_code == 404


# --- Bookings ---

def test_create_booking(client: TestClient):
    r = client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": FUTURE,
        "guestName": "Иван Иванов",
        "guestEmail": "ivan@example.com",
        "notes": "Тест",
    })
    assert r.status_code == 201
    data = r.json()
    assert data["guestName"] == "Иван Иванов"
    assert data["eventTypeName"] == "Консультация 30 мин"
    assert data["durationMinutes"] == 30
    assert "id" in data


def test_create_booking_conflict(client: TestClient):
    payload = {
        "eventTypeId": "et-1",
        "startTime": FUTURE,
        "guestName": "Первый",
        "guestEmail": "a@a.com",
    }
    client.post("/api/bookings", json=payload)

    r = client.post("/api/bookings", json={**payload, "guestName": "Второй", "guestEmail": "b@b.com"})
    assert r.status_code == 409
    assert r.json()["code"] == "SLOT_CONFLICT"


def test_create_booking_past_time(client: TestClient):
    r = client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": PAST,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    })
    assert r.status_code == 400


def test_create_booking_too_far(client: TestClient):
    r = client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": FAR_FUTURE,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    })
    assert r.status_code == 400


def test_create_booking_unknown_event_type(client: TestClient):
    r = client.post("/api/bookings", json={
        "eventTypeId": "unknown",
        "startTime": FUTURE,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    })
    assert r.status_code == 400


def test_get_booking(client: TestClient):
    created = client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": FUTURE,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    }).json()

    r = client.get(f"/api/bookings/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


def test_get_booking_not_found(client: TestClient):
    r = client.get("/api/bookings/unknown")
    assert r.status_code == 404
