from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    hashed_password: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    settings: Optional[str] = "{}"

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    service_type: str
    pickup: str
    dropoff: str
    fare: float = 0.0
    status: str = "created"
    created_at: Optional[datetime] = None
    meta: Optional[str] = None
