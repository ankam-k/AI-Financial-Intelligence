"""Demo-mode endpoints."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings


@pytest.fixture
def demo_disabled():
    settings.demo_mode = False
    yield
    settings.demo_mode = True


class TestStatus:
    def test_it_reports_an_empty_database(self, client: TestClient) -> None:
        body = client.get("/api/demo/status").json()

        assert body["is_empty"] is True
        assert body["enabled"] is True

    def test_it_is_available_even_when_seeding_is_disabled(
        self, client: TestClient, demo_disabled
    ) -> None:
        """Reading what is loaded is not destructive."""
        body = client.get("/api/demo/status").json()

        assert body["enabled"] is False


class TestDesign:
    def test_it_publishes_the_planted_patterns(self, client: TestClient) -> None:
        """Exposed so a reviewer can check the associations on screen are the
        ones the generator set out to create."""
        body = client.get("/api/demo/design").json()

        pairs = {(p["habit"], p["category"]) for p in body["planted_patterns"]}
        assert ("exercise", "FOOD_DINING") in pairs

    def test_it_publishes_the_negative_controls(self, client: TestClient) -> None:
        body = client.get("/api/demo/design").json()

        assert set(body["negative_controls"]) == {"alcohol", "work_mode"}

    def test_it_publishes_the_seed(self, client: TestClient) -> None:
        assert client.get("/api/demo/design").json()["seed"] > 0


class TestSeeding:
    def test_it_loads_a_full_dataset(self, client: TestClient) -> None:
        body = client.post("/api/demo/seed").json()

        assert body["expenses"] > 300
        assert body["check_ins"] > 150
        assert body["events"] >= 3
        assert body["profile"]

    def test_the_seeded_data_produces_a_correlational_insight(
        self, client: TestClient
    ) -> None:
        """⭐ End to end, this is OEQ-004 closed: a T3 insight is reachable
        through the API, which it was not before this sprint."""
        client.post("/api/demo/seed")

        body = client.get("/api/insights").json()
        relationships = [
            i for i in body["insights"] if i["type"] == "BEHAVIOR_RELATIONSHIP"
        ]

        assert relationships, "no T3 insight — the demo does not demonstrate the product"
        assert relationships[0]["confidence"] >= 0.9

    def test_the_seeded_data_narrates(self, client: TestClient) -> None:
        client.post("/api/demo/seed")

        body = client.get("/api/narrations").json()
        types = {n["insight_type"] for n in body["narrations"]}

        assert "BEHAVIOR_RELATIONSHIP" in types

    def test_the_assistant_can_answer_from_it(self, client: TestClient) -> None:
        client.post("/api/demo/seed")

        body = client.post(
            "/api/chat", json={"question": "How has my gym routine affected my spending?"}
        ).json()

        assert body["status"] == "ANSWERED"
        assert body["citations"]

    def test_seeding_twice_does_not_double_the_data(self, client: TestClient) -> None:
        first = client.post("/api/demo/seed").json()
        second = client.post("/api/demo/seed").json()

        assert first["expenses"] == second["expenses"]

    def test_a_reference_date_can_be_pinned(self, client: TestClient) -> None:
        body = client.post("/api/demo/seed", params={"reference_date": "2026-07-28"}).json()

        assert body["latest"] == "2026-07-28"


class TestClearing:
    def test_it_removes_everything(self, client: TestClient) -> None:
        client.post("/api/demo/seed")

        body = client.request("DELETE", "/api/demo").json()

        assert body["is_empty"] is True
        assert client.get("/api/expenses").json() == []


class TestGating:
    def test_seeding_is_refused_when_demo_mode_is_off(
        self, client: TestClient, demo_disabled
    ) -> None:
        response = client.post("/api/demo/seed")

        assert response.status_code == 422
        assert "Demo mode is disabled" in response.json()["detail"]

    def test_clearing_is_refused_when_demo_mode_is_off(
        self, client: TestClient, demo_disabled
    ) -> None:
        assert client.request("DELETE", "/api/demo").status_code == 422

    def test_the_refusal_names_the_cli_alternative(
        self, client: TestClient, demo_disabled
    ) -> None:
        assert "python -m app.demo seed" in client.post("/api/demo/seed").json()["detail"]
