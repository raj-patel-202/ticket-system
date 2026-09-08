from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    user_type: Literal["buyer", "organizer"] = "buyer"

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    u_id: int
    username: str
    email: str
    user_type: str
    created_at: str

class EventCreate(BaseModel):
    event_name: str = Field(..., min_length=2, max_length=120)
    event_type: Literal["concert", "theater", "sport"]
    venue: str = Field(..., min_length=2, max_length=150)
    time: str # ISO or datetime string
    capacity: int = Field(50, ge=10, le=120, description="Capacity between 10 and 120 seats")
    price_per_ticket: float = Field(..., gt=0.0)
    subtitle: Optional[str] = ""

class EventOut(BaseModel):
    event_id: int
    user_id: int
    event_name: str
    event_type: str
    venue: str
    time: str
    capacity: int
    sold_tickets: int
    price_per_ticket: float
    current_price: float
    hike_percent: float
    demand_trend: str
    subtitle: Optional[str] = ""
    status: str
    created_at: str

class TicketPurchaseRequest(BaseModel):
    event_id: int
    seat_positions: List[str] = Field(..., min_length=1)

class TicketPurchaseResponse(BaseModel):
    success: bool
    message: str
    event_id: int
    event_name: str
    ticket_codes: List[str]
    total_price: float
    seats: List[str]
