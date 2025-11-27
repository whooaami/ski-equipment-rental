from pydantic import BaseModel, EmailStr, ConfigDict

class OwnerRegister(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    password: str
    company_name: str | None = None

class OwnerLogin(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    password: str

class GearCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    type: str
    brand_id: int
    size: str | None = None
    hourly_price: float
    daily_price: float
    notes: str | None = None

class CustomerCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str
    phone: str
    notes: str | None = None

class CustomerUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str | None = None
    phone: str | None = None
    notes: str | None = None

class RentalCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    gear_id: int
    customer_id: int
    rental_type: str  # 'hourly' або 'daily'
    duration: int  # кількість годин або днів

class RentalReturn(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    condition_score: int  # 1-5
    comment: str | None = None

class BrandCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str

class BrandUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
