from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, Numeric, ForeignKey, CheckConstraint, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class GearType(str, enum.Enum):
    ski = "ski"
    skate = "skate"
    sled = "sled"

class GearStatus(str, enum.Enum):
    available = "available"
    rented = "rented"
    broken = "broken"

class RentalType(str, enum.Enum):
    hourly = "hourly"
    daily = "daily"

class Owner(Base):
    __tablename__ = "owners"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    company_name = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    brands = relationship("Brand", back_populates="owner")
    gear = relationship("Gear", back_populates="owner")
    customers = relationship("Customer", back_populates="owner")
    rentals = relationship("Rental", back_populates="owner")

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey('owners.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationship
    owner = relationship("Owner", back_populates="brands")

class Gear(Base):
    __tablename__ = "gear"

    id = Column(Integer, primary_key=True)
    type = Column(SQLEnum(GearType, name="gear_type_enum"), nullable=False, index=True)
    brand_id = Column(Integer, ForeignKey('brands.id', ondelete='RESTRICT'), nullable=False)
    size = Column(String(20))
    status = Column(SQLEnum(GearStatus, name="gear_status_enum"), nullable=False, server_default="available", index=True)
    hourly_price = Column(Numeric(10, 2), nullable=False)
    daily_price = Column(Numeric(10, 2), nullable=False)
    notes = Column(Text)
    owner_id = Column(Integer, ForeignKey('owners.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    brand = relationship("Brand")
    owner = relationship("Owner", back_populates="gear")

    __table_args__ = (
        CheckConstraint('hourly_price > 0', name='check_hourly_price_positive'),
        CheckConstraint('daily_price > 0', name='check_daily_price_positive'),
    )

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    full_name = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=False, index=True)
    notes = Column(Text)
    owner_id = Column(Integer, ForeignKey('owners.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationship
    owner = relationship("Owner", back_populates="customers")

class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True)
    gear_id = Column(Integer, ForeignKey('gear.id', ondelete='CASCADE'), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey('customers.id', ondelete='CASCADE'), nullable=False, index=True)
    start_at = Column(TIMESTAMP, nullable=False, index=True)
    due_at = Column(TIMESTAMP, nullable=False, index=True)
    return_at = Column(TIMESTAMP)
    rental_type = Column(SQLEnum(RentalType, name="rental_type_enum"), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    condition_score = Column(Integer)
    comment = Column(Text)
    owner_id = Column(Integer, ForeignKey('owners.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationship
    owner = relationship("Owner", back_populates="rentals")

    __table_args__ = (
        CheckConstraint('due_at > start_at', name='check_due_after_start'),
        CheckConstraint('condition_score BETWEEN 1 AND 5', name='check_condition_score_range'),
    )
