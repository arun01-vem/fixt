import base64
import re
import hashlib
import hmac
import json
import os
import time
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
import models, schemas
from database import engine, Base, get_db
from datetime import date


Base.metadata.create_all(bind=engine)

app = FastAPI(title="FIXT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_TOKEN_SECRET = os.getenv("ADMIN_TOKEN_SECRET", "change-this-secret")
ADMIN_TOKEN_TTL_SECONDS = int(os.getenv("ADMIN_TOKEN_TTL_SECONDS", "86400"))
ALLOWED_ORDER_STATUSES = {
    "pending_verification",
    "confirmed",
    "in_progress",
    "ready_to_deliver",
    "delivered",
    "completed",
    "cancelled",
}
ACTIVE_ORDER_STATUSES = {
    "pending_verification",
    "confirmed",
    "in_progress",
    "ready_to_deliver",
}
INDIAN_MOBILE_RE = re.compile(r"^[6-9]\d{9}$")
DUMMY_PHONE_VALUES = {
    "9999999999",
    "8888888888",
    "7777777777",
    "6666666666",
    "1234567890",
    "0123456789",
}
ORDER_RATE_WINDOW_SECONDS = 3600
MAX_ORDER_ATTEMPTS_PER_HOUR = 100
PHONE_ORDER_ATTEMPTS: dict[str, list[float]] = {}
IP_ORDER_ATTEMPTS: dict[str, list[float]] = {}


def _sign_payload(payload: dict) -> str:
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = hmac.new(ADMIN_TOKEN_SECRET.encode("utf-8"), payload_json, hashlib.sha256).digest()
    encoded_payload = base64.urlsafe_b64encode(payload_json).decode("utf-8").rstrip("=")
    encoded_signature = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    return f"{encoded_payload}.{encoded_signature}"


def _verify_token(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 2:
        raise HTTPException(status_code=401, detail="Invalid token format")

    encoded_payload, encoded_signature = parts
    payload_json = base64.urlsafe_b64decode(encoded_payload + "=" * (-len(encoded_payload) % 4))
    signature = base64.urlsafe_b64decode(encoded_signature + "=" * (-len(encoded_signature) % 4))
    expected_signature = hmac.new(ADMIN_TOKEN_SECRET.encode("utf-8"), payload_json, hashlib.sha256).digest()

    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    payload = json.loads(payload_json.decode("utf-8"))
    if payload.get("exp", 0) < int(time.time()):
        raise HTTPException(status_code=401, detail="Token expired")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload


def require_admin(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    return _verify_token(token)


def _validate_indian_mobile(phone: str):
    if not INDIAN_MOBILE_RE.fullmatch(phone):
        raise HTTPException(status_code=422, detail="Enter a valid Indian mobile number.")
    if phone in DUMMY_PHONE_VALUES or len(set(phone)) == 1:
        raise HTTPException(status_code=422, detail="This mobile number looks invalid. Please enter a real number.")


def _check_rate_limit(store: dict[str, list[float]], key: str):
    return

@app.get("/health")
def health_check():
    return {"status": "FIXT API is running"}


@app.post("/admin/login", response_model=schemas.AdminLoginResponse)
def admin_login(payload: schemas.AdminLoginRequest):
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    now = int(time.time())
    token = _sign_payload({
        "sub": payload.username,
        "role": "admin",
        "iat": now,
        "exp": now + ADMIN_TOKEN_TTL_SECONDS,
    })
    return schemas.AdminLoginResponse(
        access_token=token,
        expires_in=ADMIN_TOKEN_TTL_SECONDS,
    )

@app.post("/customers/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    normalized_phone = customer.phone.strip()
    _validate_indian_mobile(normalized_phone)

    existing = db.query(models.Customer).filter(
        models.Customer.phone == normalized_phone
    ).first()
    if existing:
        return existing
    new_customer = models.Customer(
        name=customer.name,
        phone=normalized_phone
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@app.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, request: Request, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    _validate_indian_mobile(customer.phone)
    if order.alternate_phone:
        _validate_indian_mobile(order.alternate_phone.strip())

    client_ip = request.client.host if request.client else "unknown"
    # _check_rate_limit(PHONE_ORDER_ATTEMPTS, customer.phone)
    # _check_rate_limit(IP_ORDER_ATTEMPTS, client_ip)

    existing_active_order = db.query(models.Order).filter(
        models.Order.customer_id == order.customer_id,
        models.Order.status.in_(ACTIVE_ORDER_STATUSES),
    ).first()
    if existing_active_order:
        raise HTTPException(
            status_code=409,
            detail=f"An active booking already exists for this number ({existing_active_order.order_number}).",
        )
    
    today = date.today().strftime("%Y%m%d")
    prefix = f"FIXT-{today}-"
    
    count = db.query(models.Order).filter(
        models.Order.order_number.like(f"{prefix}%")
    ).count()
    
    order_number = f"{prefix}{str(count + 1).zfill(4)}"
    
    new_order = models.Order(
        device=order.device,
        brand=order.brand,
        model=order.model,
        issue=order.issue,
        issue_details=order.issue_details,
        booking_date=order.booking_date,
        slot=order.slot,
        customer_id=order.customer_id,
        estimated_price=order.estimated_price,
        price_min=order.price_min,
        price_max=order.price_max,
        district=order.district,
        village=order.village,
        address_line=order.address_line,
        pincode=order.pincode,
        nearby_location=order.nearby_location,
        landmark=order.landmark,
        latitude=order.latitude,
        longitude=order.longitude,
        alternate_phone=order.alternate_phone,
        status="pending_verification",
        order_number=order_number
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    db.add(
        models.OrderStatusEvent(
            order_id=new_order.id,
            status=new_order.status,
        )
    )
    db.commit()
    return new_order

@app.get("/slots/availability")
def get_slot_availability(date: str, db: Session = Depends(get_db)):
    # date format should be YYYY-MM-DD
    results = db.query(models.Order.slot, func.count(models.Order.id)).filter(
        models.Order.booking_date == date,
        models.Order.status.in_(ACTIVE_ORDER_STATUSES)
    ).group_by(models.Order.slot).all()
    
    return {slot: count for slot, count in results}

@app.get("/orders/{order_number}", response_model=schemas.AdminOrder)
def get_order(order_number: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).options(joinedload(models.Order.status_events)).filter(
        models.Order.order_number == order_number
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.get("/orders/{order_number}/timeline", response_model=list[schemas.OrderStatusEvent])
def get_order_timeline(order_number: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return (
        db.query(models.OrderStatusEvent)
        .filter(models.OrderStatusEvent.order_id == order.id)
        .order_by(models.OrderStatusEvent.changed_at.asc())
        .all()
    )


@app.get("/admin/orders", response_model=list[schemas.AdminOrder], dependencies=[Depends(require_admin)])
def list_orders(
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.Order)
        .options(joinedload(models.Order.customer), joinedload(models.Order.status_events))
        .order_by(models.Order.created_at.desc())
    )
    if status:
        query = query.filter(models.Order.status == status)
    return query.all()


@app.patch("/orders/{order_id}/status", response_model=schemas.Order, dependencies=[Depends(require_admin)])
def update_order_status(order_id: str, payload: schemas.OrderStatusUpdateRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: Updating order {order_id} with payload: {payload.dict()}")
    try:
        if payload.status not in ALLOWED_ORDER_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid order status: {payload.status}")

        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        print(f"DEBUG: Current order status: {order.status}, current repair_cost: {order.repair_cost}")

        if order.status == payload.status:
            if payload.repair_cost is not None:
                order.repair_cost = payload.repair_cost
                db.commit()
                db.refresh(order)
                print(f"DEBUG: Saved repair_cost {payload.repair_cost} to order {order_id}")
            return order

        order.status = payload.status
        if payload.repair_cost is not None:
            order.repair_cost = payload.repair_cost
        
        db.commit()
        db.refresh(order)
        print(f"DEBUG: Updated order {order_id} to status {order.status} and repair_cost {order.repair_cost}")
        db.add(
            models.OrderStatusEvent(
                order_id=order.id,
                status=order.status,
            )
        )
        db.commit()
        return order
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating order: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while updating status")


@app.delete("/orders/{order_id}", dependencies=[Depends(require_admin)])
def delete_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted permanently"}
