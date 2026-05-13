import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "sqlite:///./phase6_bootstrap.db")
os.environ.setdefault("ADMIN_USERNAME", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "admin123")
os.environ.setdefault("ADMIN_TOKEN_SECRET", "phase6-secret")

import main  # noqa: E402
import models  # noqa: E402


@pytest.fixture()
def client(tmp_path: Path):
    db_file = tmp_path / "phase6_test.db"
    engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    models.Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[main.get_db] = override_get_db

    # Clear rate limit dictionaries before each test
    main.PHONE_ORDER_ATTEMPTS.clear()
    main.IP_ORDER_ATTEMPTS.clear()

    with TestClient(main.app) as test_client:
        yield test_client

    main.app.dependency_overrides.clear()
    models.Base.metadata.drop_all(bind=engine)


def _create_customer(client: TestClient, phone: str = "9123456789") -> dict:
    response = client.post(
        "/customers/",
        json={"name": "Test Customer", "phone": phone},
    )
    assert response.status_code == 200
    return response.json()


def _create_order(client: TestClient, customer_id: str) -> dict:
    response = client.post(
        "/orders/",
        json={
            "customer_id": customer_id,
            "device": "Samsung Galaxy S23",
            "brand": "Samsung",
            "model": "Galaxy S23",
            "issue": "Battery Drain",
            "issue_details": "Battery drains quickly",
            "estimated_price": 1800,
            "price_min": 500,
            "price_max": 1800,
            "district": "Jagtial",
            "village": "Jagtial",
            "address_line": "Near Clock Tower",
            "pincode": "505327",
            "nearby_location": "Main Road",
            "landmark": "Bus Stand",
            "latitude": 18.79,
            "longitude": 78.91,
            "alternate_phone": "9988776655",
            "slot": "12PM - 2PM",
        },
    )
    assert response.status_code == 200
    return response.json()


def _admin_token(client: TestClient) -> str:
    response = client.post(
        "/admin/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "FIXT API is running"


def test_create_customer_reuses_phone(client: TestClient):
    first = _create_customer(client, phone="9012345678")
    second = _create_customer(client, phone="9012345678")
    assert first["id"] == second["id"]


def test_create_order_and_fetch_by_order_number(client: TestClient):
    customer = _create_customer(client)
    created_order = _create_order(client, customer_id=customer["id"])

    assert created_order["order_number"].startswith("FIXT-")
    assert created_order["status"] == "pending_verification"
    assert created_order["price_min"] == 500
    assert created_order["price_max"] == 1800

    fetched = client.get(f"/orders/{created_order['order_number']}")
    assert fetched.status_code == 200
    fetched_body = fetched.json()
    assert fetched_body["order_number"] == created_order["order_number"]
    assert fetched_body["device"] == "Samsung Galaxy S23"
    assert fetched_body["district"] == "Jagtial"


def test_admin_login_and_orders_list(client: TestClient):
    customer = _create_customer(client, phone="9876543210")
    _create_order(client, customer_id=customer["id"])

    token = _admin_token(client)
    response = client.get(
        "/admin/orders",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_order_status_success(client: TestClient):
    customer = _create_customer(client, phone="9000000001")
    order = _create_order(client, customer_id=customer["id"])
    token = _admin_token(client)

    response = client.patch(
        f"/orders/{order['id']}/status",
        json={"status": "in_progress"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"


def test_update_order_status_with_repair_cost_saves_cost(client: TestClient):
    customer = _create_customer(client, phone="9000000003")
    order = _create_order(client, customer_id=customer["id"])
    token = _admin_token(client)

    response = client.patch(
        f"/orders/{order['id']}/status",
        json={"status": "in_progress", "repair_cost": 2200},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "in_progress"
    assert body["repair_cost"] == 2200

    fetched = client.get(f"/orders/{order['order_number']}")
    assert fetched.status_code == 200
    assert fetched.json()["repair_cost"] == 2200


def test_update_order_status_rejects_invalid_value(client: TestClient):
    customer = _create_customer(client, phone="9000000002")
    order = _create_order(client, customer_id=customer["id"])
    token = _admin_token(client)

    response = client.patch(
        f"/orders/{order['id']}/status",
        json={"status": "shipped"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "Invalid order status" in response.json()["detail"]
