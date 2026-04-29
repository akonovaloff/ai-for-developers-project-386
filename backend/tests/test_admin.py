from datetime import datetime, timedelta, timezone

from starlette.testclient import TestClient


FUTURE = (datetime.now(timezone.utc) + timedelta(days=1, hours=3)).strftime("%Y-%m-%dT%H:%M:%SZ")


# --- Event types ---

def test_create_event_type(client: TestClient):
    r = client.post("/admin/event-types", json={
        "name": "Новый тип",
        "description": "Описание",
        "durationMinutes": 45,
    })
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Новый тип"
    assert "id" in data


def test_update_event_type(client: TestClient):
    r = client.put("/admin/event-types/et-1", json={
        "name": "Обновлённое название",
        "description": "Новое описание",
        "durationMinutes": 45,
    })
    assert r.status_code == 200
    assert r.json()["name"] == "Обновлённое название"
    assert r.json()["durationMinutes"] == 45


def test_update_event_type_not_found(client: TestClient):
    r = client.put("/admin/event-types/unknown", json={
        "name": "X",
        "description": "X",
        "durationMinutes": 30,
    })
    assert r.status_code == 404


def test_delete_event_type(client: TestClient):
    r = client.delete("/admin/event-types/et-1")
    assert r.status_code == 204
    assert client.get("/api/event-types/et-1").status_code == 404


def test_delete_event_type_not_found(client: TestClient):
    r = client.delete("/admin/event-types/unknown")
    assert r.status_code == 404


# --- Bookings ---

def test_list_bookings_empty(client: TestClient):
    r = client.get("/admin/bookings")
    assert r.status_code == 200
    assert r.json() == []


def test_list_bookings_returns_upcoming(client: TestClient):
    client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": FUTURE,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    })
    r = client.get("/admin/bookings")
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_cancel_booking(client: TestClient):
    created = client.post("/api/bookings", json={
        "eventTypeId": "et-1",
        "startTime": FUTURE,
        "guestName": "Тест",
        "guestEmail": "t@t.com",
    }).json()

    r = client.delete(f"/admin/bookings/{created['id']}")
    assert r.status_code == 204
    assert client.get(f"/api/bookings/{created['id']}").status_code == 404


def test_cancel_booking_not_found(client: TestClient):
    r = client.delete("/admin/bookings/unknown")
    assert r.status_code == 404
