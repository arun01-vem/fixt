from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CustomerCreate(BaseModel):
    name: str
    phone: str

class Customer(CustomerCreate):
    id: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    device: str
    brand: Optional[str] = None
    model: Optional[str] = None
    issue: str
    issue_details: Optional[str] = None
    estimated_price: Optional[float] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    district: Optional[str] = None
    village: Optional[str] = None
    address_line: Optional[str] = None
    pincode: Optional[str] = None
    nearby_location: Optional[str] = None
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    alternate_phone: Optional[str] = None
    booking_date: Optional[str] = None
    slot: Optional[str] = None
    customer_id: str

class Order(OrderCreate):
    id: str
    order_number: Optional[str] = None
    status: str
    repair_cost: Optional[float] = None
    booking_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusEvent(BaseModel):
    id: str
    status: str
    changed_at: datetime

    class Config:
        from_attributes = True


class CustomerBrief(BaseModel):
    id: str
    name: str
    phone: str

    class Config:
        from_attributes = True


class AdminOrder(Order):
    customer: Optional[CustomerBrief] = None
    status_events: list[OrderStatusEvent] = []

    class Config:
        from_attributes = True


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class OrderStatusUpdateRequest(BaseModel):
    status: str
    repair_cost: Optional[float] = None
