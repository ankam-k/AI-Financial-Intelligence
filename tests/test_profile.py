"""Profile endpoint behaviour."""

from __future__ import annotations

from fastapi.testclient import TestClient


class TestReadProfile:
    def test_first_request_creates_the_local_profile(self, client: TestClient) -> None:
        response = client.get("/api/profile")

        assert response.status_code == 200
        body = response.json()
        assert body["display_name"] == "Local User"
        assert body["timezone"] == "Asia/Kolkata"
        assert body["currency"] == "INR"
        assert body["id"]

    def test_repeated_requests_return_the_same_profile(self, client: TestClient) -> None:
        first = client.get("/api/profile").json()
        second = client.get("/api/profile").json()

        assert first["id"] == second["id"], "the local profile must not be recreated"


class TestUpdateProfile:
    def test_updates_the_display_name(self, client: TestClient) -> None:
        response = client.patch("/api/profile", json={"display_name": "Pranay"})

        assert response.status_code == 200
        assert response.json()["display_name"] == "Pranay"
        assert client.get("/api/profile").json()["display_name"] == "Pranay"

    def test_omitted_fields_are_left_untouched(self, client: TestClient) -> None:
        client.patch("/api/profile", json={"display_name": "Pranay"})

        response = client.patch("/api/profile", json={"timezone": "Asia/Kolkata"})

        assert response.json()["display_name"] == "Pranay"

    def test_rejects_an_unknown_field(self, client: TestClient) -> None:
        response = client.patch("/api/profile", json={"emial": "typo@example.com"})

        assert response.status_code == 422, "extra='forbid' should catch typos"

    def test_rejects_a_blank_display_name(self, client: TestClient) -> None:
        assert client.patch("/api/profile", json={"display_name": ""}).status_code == 422


class TestDeleteAllData:
    def test_the_next_request_starts_a_genuinely_fresh_profile(
        self, client: TestClient
    ) -> None:
        original_id = client.get("/api/profile").json()["id"]

        assert client.delete("/api/profile/data").status_code == 204
        assert client.get("/api/profile").json()["id"] != original_id

    def test_removes_every_record_the_profile_owned(self, client: TestClient) -> None:
        """Deletion is real and cascading — there is no soft-delete flag on
        user data (05_Database_Design.md §8, SRS-8.6)."""
        client.post(
            "/api/expenses", json={"expense_date": "2026-07-20", "amount_paise": 15000}
        )
        client.post("/api/check-ins", json={"log_date": "2026-07-20", "exercise": True})
        client.post(
            "/api/life-events",
            json={"event_type": "TRAVEL", "title": "Goa", "start_date": "2026-07-20"},
        )

        client.delete("/api/profile/data")

        assert client.get("/api/expenses").json() == []
        assert client.get("/api/check-ins").json() == []
        assert client.get("/api/life-events").json() == []
