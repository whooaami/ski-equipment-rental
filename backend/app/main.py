from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func
from datetime import datetime, timedelta
from pydantic import BaseModel
from app import get_db, Owner, Gear, Customer, Rental, Brand, OwnerRegister, OwnerLogin, GearCreate, CustomerCreate, CustomerUpdate, RentalCreate, RentalReturn, BrandCreate, BrandUpdate, hash_password, verify_password, create_token, verify_token

app = FastAPI(title="Ski Rental API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_owner(authorization: str = Header(), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    owner_id = verify_token(token)
    return db.query(Owner).filter(Owner.id == owner_id).first()

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}

@app.post("/register")
def register(data: OwnerRegister, db: Session = Depends(get_db)):
    owner = Owner(email=data.email, password_hash=hash_password(data.password), company_name=data.company_name)
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return {"id": owner.id, "email": owner.email, "token": create_token(owner.id)}

@app.post("/login")
def login(data: OwnerLogin, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.email == data.email).first()
    if not owner or not verify_password(data.password, owner.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "id": owner.id,
        "email": owner.email,
        "company_name": owner.company_name,
        "token": create_token(owner.id)
    }

@app.get("/gear")
def get_gear(
    type: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 10,
    owner: Owner = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    query = db.query(Gear).options(joinedload(Gear.brand)).filter(Gear.owner_id == owner.id)
    if type:
        query = query.filter(Gear.type == type)
    if status:
        query = query.filter(Gear.status == status)

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    gear = query.limit(page_size).offset(offset).all()

    return {
        "items": gear,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@app.post("/gear")
def create_gear(data: GearCreate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    gear = Gear(**data.dict(), owner_id=owner.id)
    db.add(gear)
    db.commit()
    db.refresh(gear)
    return gear

@app.put("/gear/{id}")
def update_gear(id: int, data: GearCreate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    gear = db.query(Gear).filter(Gear.id == id, Gear.owner_id == owner.id).first()
    if not gear:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(gear, key, value)
    db.commit()
    db.refresh(gear)
    return gear

@app.delete("/gear/{id}")
def delete_gear(id: int, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    gear = db.query(Gear).filter(Gear.id == id, Gear.owner_id == owner.id).first()
    if not gear:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(gear)
    db.commit()
    return {"message": "Deleted"}

@app.get("/customers")
def get_customers(
    search: str | None = None,
    page: int = 1,
    page_size: int = 10,
    owner: Owner = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    query = db.query(Customer).filter(Customer.owner_id == owner.id)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Customer.full_name.ilike(search_pattern)) |
            (Customer.phone.ilike(search_pattern))
        )

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    customers = query.limit(page_size).offset(offset).all()

    return {
        "items": customers,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@app.post("/customers")
def create_customer(data: CustomerCreate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    # Перевірка унікальності телефону в межах власника
    existing = db.query(Customer).filter(Customer.phone == data.phone, Customer.owner_id == owner.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Клієнт з таким номером телефону вже існує")

    customer = Customer(**data.dict(), owner_id=owner.id)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@app.put("/customers/{id}")
def update_customer(id: int, data: CustomerUpdate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id, Customer.owner_id == owner.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Клієнта не знайдено")

    # Якщо оновлюється телефон, перевірити унікальність в межах власника
    if data.phone and data.phone != customer.phone:
        existing = db.query(Customer).filter(Customer.phone == data.phone, Customer.owner_id == owner.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Клієнт з таким номером телефону вже існує")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    return customer

@app.delete("/customers/{id}")
def delete_customer(id: int, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id, Customer.owner_id == owner.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Клієнта не знайдено")
    db.delete(customer)
    db.commit()
    return {"message": "Deleted"}

# Helper функція для форматування відповіді rental
def format_rental_response(rental: Rental, db: Session):
    gear = db.query(Gear).filter(Gear.id == rental.gear_id).first()
    customer = db.query(Customer).filter(Customer.id == rental.customer_id).first()
    brand = db.query(Brand).filter(Brand.id == gear.brand_id).first() if gear else None

    is_overdue = False
    if not rental.return_at and rental.due_at < datetime.utcnow():
        is_overdue = True

    return {
        "id": rental.id,
        "gear_id": rental.gear_id,
        "customer_id": rental.customer_id,
        "start_at": rental.start_at.isoformat() if rental.start_at else None,
        "due_at": rental.due_at.isoformat() if rental.due_at else None,
        "return_at": rental.return_at.isoformat() if rental.return_at else None,
        "rental_type": rental.rental_type,
        "total_price": float(rental.total_price),
        "condition_score": rental.condition_score,
        "comment": rental.comment,
        "created_at": rental.created_at.isoformat() if rental.created_at else None,
        "gear": {
            "id": gear.id,
            "type": gear.type,
            "brand": brand.name if brand else None,
            "size": gear.size
        },
        "customer": {
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone
        },
        "is_overdue": is_overdue
    }

@app.get("/rentals")
def get_rentals(
    status: str | None = None,
    customer_id: int | None = None,
    gear_id: int | None = None,
    page: int = 1,
    page_size: int = 10,
    owner: Owner = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    query = db.query(Rental).filter(Rental.owner_id == owner.id)

    if status == 'active':
        query = query.filter(Rental.return_at.is_(None))
    elif status == 'completed':
        query = query.filter(Rental.return_at.isnot(None))
    elif status == 'overdue':
        query = query.filter(
            Rental.return_at.is_(None),
            Rental.due_at < func.now()
        )

    if customer_id:
        query = query.filter(Rental.customer_id == customer_id)
    if gear_id:
        query = query.filter(Rental.gear_id == gear_id)

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    rentals = query.order_by(Rental.created_at.desc()).limit(page_size).offset(offset).all()

    return {
        "items": [format_rental_response(r, db) for r in rentals],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@app.post("/rentals")
def create_rental(data: RentalCreate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    # 1. Перевірити що gear існує та доступний (в межах власника)
    gear = db.query(Gear).filter(Gear.id == data.gear_id, Gear.owner_id == owner.id).first()
    if not gear:
        raise HTTPException(status_code=404, detail="Спорядження не знайдено")
    if gear.status != "available":
        raise HTTPException(status_code=400, detail="Спорядження недоступне для оренди")

    # 2. Перевірити що customer існує (в межах власника)
    customer = db.query(Customer).filter(Customer.id == data.customer_id, Customer.owner_id == owner.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Клієнта не знайдено")

    # 3. Валідація rental_type
    if data.rental_type not in ['hourly', 'daily']:
        raise HTTPException(status_code=400, detail="Тип оренди має бути 'hourly' або 'daily'")

    # 4. Валідація duration
    if data.duration <= 0:
        raise HTTPException(status_code=400, detail="Тривалість має бути більше 0")

    # 5. Розрахувати ціну та дати
    start_at = datetime.utcnow()

    if data.rental_type == 'hourly':
        total_price = float(gear.hourly_price) * data.duration
        due_at = start_at + timedelta(hours=data.duration)
    else:  # daily
        total_price = float(gear.daily_price) * data.duration
        due_at = start_at + timedelta(days=data.duration)

    # 6. Створити оренду
    rental = Rental(
        gear_id=data.gear_id,
        customer_id=data.customer_id,
        start_at=start_at,
        due_at=due_at,
        rental_type=data.rental_type,
        total_price=total_price,
        owner_id=owner.id
    )
    db.add(rental)

    # 7. Змінити статус gear на 'rented'
    gear.status = "rented"

    db.commit()
    db.refresh(rental)

    return format_rental_response(rental, db)

@app.post("/rentals/{id}/return")
def return_rental(id: int, data: RentalReturn, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    # 1. Знайти оренду (в межах власника)
    rental = db.query(Rental).filter(Rental.id == id, Rental.owner_id == owner.id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Оренду не знайдено")

    # 2. Перевірити що оренда ще активна
    if rental.return_at:
        raise HTTPException(status_code=400, detail="Спорядження вже повернуто")

    # 3. Валідація condition_score
    if data.condition_score < 1 or data.condition_score > 5:
        raise HTTPException(status_code=400, detail="Оцінка стану має бути від 1 до 5")

    # 4. Оновити оренду
    rental.return_at = datetime.utcnow()
    rental.condition_score = data.condition_score
    rental.comment = data.comment

    # 5. Змінити статус gear на основі condition_score
    gear = db.query(Gear).filter(Gear.id == rental.gear_id, Gear.owner_id == owner.id).first()
    if gear:
        # Якщо оцінка 1 зірка - спорядження зламане
        if data.condition_score == 1:
            gear.status = "broken"
        else:
            gear.status = "available"

    db.commit()
    db.refresh(rental)

    return format_rental_response(rental, db)

@app.get("/rentals/{id}")
def get_rental(id: int, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    rental = db.query(Rental).filter(Rental.id == id, Rental.owner_id == owner.id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Оренду не знайдено")
    return format_rental_response(rental, db)

@app.get("/brands")
def get_brands(
    page: int = 1,
    page_size: int = 10,
    owner: Owner = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    query = db.query(Brand).filter(Brand.owner_id == owner.id).order_by(Brand.name)

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    brands = query.limit(page_size).offset(offset).all()

    return {
        "items": brands,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@app.post("/brands")
def create_brand(data: BrandCreate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    # Перевірка унікальності в межах власника
    existing = db.query(Brand).filter(Brand.name == data.name, Brand.owner_id == owner.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Бренд з такою назвою вже існує")

    brand = Brand(**data.dict(), owner_id=owner.id)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand

@app.put("/brands/{id}")
def update_brand(id: int, data: BrandUpdate, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == id, Brand.owner_id == owner.id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Бренд не знайдено")

    # Перевірка унікальності (виключаючи поточний бренд) в межах власника
    existing = db.query(Brand).filter(Brand.name == data.name, Brand.owner_id == owner.id, Brand.id != id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Бренд з такою назвою вже існує")

    brand.name = data.name
    db.commit()
    db.refresh(brand)
    return brand

@app.delete("/brands/{id}")
def delete_brand(id: int, owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == id, Brand.owner_id == owner.id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Бренд не знайдено")

    # Перевірити чи немає спорядження з цим брендом (власника)
    gear_count = db.query(Gear).filter(Gear.brand_id == id, Gear.owner_id == owner.id).count()
    if gear_count > 0:
        raise HTTPException(status_code=400, detail=f"Неможливо видалити бренд. Є {gear_count} одиниць спорядження з цим брендом")

    db.delete(brand)
    db.commit()
    return {"message": "Deleted"}

# ============= ANALYTICS ENDPOINTS =============

@app.get("/analytics/dashboard")
def get_dashboard_analytics(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Основні метрики для dashboard"""

    # Підрахунок спорядження (власника)
    total_gear = db.query(Gear).filter(Gear.owner_id == owner.id).count()
    available_gear = db.query(Gear).filter(Gear.owner_id == owner.id, Gear.status == 'available').count()
    broken_gear = db.query(Gear).filter(Gear.owner_id == owner.id, Gear.status == 'broken').count()

    # Спорядження в оренді - розділяємо на активні та прострочені
    # Активні = gear.status='rented' + його оренда НЕ прострочена
    rented_gear_ids = db.query(Gear.id).filter(
        Gear.owner_id == owner.id,
        Gear.status == 'rented'
    ).all()
    rented_gear_ids = [g.id for g in rented_gear_ids]

    now = datetime.utcnow()
    active_rented_gear = 0
    overdue_rented_gear = 0

    for gear_id in rented_gear_ids:
        # Знайти активну оренду для цього gear
        rental = db.query(Rental).filter(
            Rental.gear_id == gear_id,
            Rental.return_at.is_(None)
        ).first()

        if rental:
            if rental.due_at < now:
                overdue_rented_gear += 1
            else:
                active_rented_gear += 1

    # Підрахунок клієнтів (власника)
    total_customers = db.query(Customer).filter(Customer.owner_id == owner.id).count()
    new_customers_month = db.query(Customer).filter(
        Customer.owner_id == owner.id,
        Customer.created_at >= datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    ).count()

    # Підрахунок орend (власника)
    active_rentals = db.query(Rental).filter(Rental.owner_id == owner.id, Rental.return_at.is_(None)).count()
    overdue_rentals = db.query(Rental).filter(
        Rental.owner_id == owner.id,
        Rental.return_at.is_(None),
        Rental.due_at < datetime.utcnow()
    ).count()

    # Виручка за різні періоди (власника)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = datetime.utcnow() - timedelta(days=7)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    revenue_today = db.query(func.sum(Rental.total_price)).filter(
        Rental.owner_id == owner.id,
        Rental.created_at >= today_start
    ).scalar() or 0

    revenue_week = db.query(func.sum(Rental.total_price)).filter(
        Rental.owner_id == owner.id,
        Rental.created_at >= week_start
    ).scalar() or 0

    revenue_month = db.query(func.sum(Rental.total_price)).filter(
        Rental.owner_id == owner.id,
        Rental.created_at >= month_start
    ).scalar() or 0

    # Середня оцінка стану (власника)
    avg_condition = db.query(func.avg(Rental.condition_score)).filter(
        Rental.owner_id == owner.id,
        Rental.condition_score.isnot(None)
    ).scalar() or 0

    # % зайнятості (активні + прострочені)
    total_in_use = active_rented_gear + overdue_rented_gear
    occupancy_rate = (total_in_use / total_gear * 100) if total_gear > 0 else 0

    return {
        "equipment": {
            "total": total_gear,
            "available": available_gear,
            "rented": active_rented_gear,
            "overdue": overdue_rented_gear,
            "broken": broken_gear,
            "occupancy_rate": round(occupancy_rate, 1)
        },
        "customers": {
            "total": total_customers,
            "new_this_month": new_customers_month
        },
        "rentals": {
            "active": active_rentals,
            "overdue": overdue_rentals
        },
        "revenue": {
            "today": float(revenue_today),
            "week": float(revenue_week),
            "month": float(revenue_month)
        },
        "quality": {
            "avg_condition_score": round(float(avg_condition), 2) if avg_condition else 0
        }
    }

@app.get("/analytics/equipment/popular")
def get_popular_equipment(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Статистика популярного спорядження"""

    # TOP-10 за кількістю орend (власника)
    popular_by_count = db.query(
        Gear,
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('total_revenue')
    ).filter(Gear.owner_id == owner.id)\
     .outerjoin(Rental, (Gear.id == Rental.gear_id) & (Rental.owner_id == owner.id))\
     .group_by(Gear.id)\
     .order_by(func.count(Rental.id).desc())\
     .limit(10)\
     .all()

    top_equipment = []
    for gear, count, revenue in popular_by_count:
        # Завантажити brand окремо
        brand = db.query(Brand).filter(Brand.id == gear.brand_id, Brand.owner_id == owner.id).first() if gear.brand_id else None

        top_equipment.append({
            "id": gear.id,
            "type": gear.type,
            "brand": brand.name if brand else None,
            "size": gear.size,
            "rental_count": count or 0,
            "total_revenue": float(revenue) if revenue else 0,
            "hourly_price": float(gear.hourly_price),
            "daily_price": float(gear.daily_price)
        })

    # Розподіл по типах (власника)
    type_distribution = db.query(
        Gear.type,
        func.count(Gear.id).label('count')
    ).filter(Gear.owner_id == owner.id).group_by(Gear.type).all()

    types_stats = {type_name: count for type_name, count in type_distribution}

    # Розподіл по брендах (власника)
    brand_distribution = db.query(
        Brand.name,
        func.count(Gear.id).label('count')
    ).join(Gear, (Brand.id == Gear.brand_id) & (Gear.owner_id == owner.id))\
     .filter(Brand.owner_id == owner.id)\
     .group_by(Brand.name)\
     .order_by(func.count(Gear.id).desc())\
     .all()

    brands_stats = [{"name": name, "count": count} for name, count in brand_distribution]

    return {
        "top_equipment": top_equipment,
        "by_type": types_stats,
        "by_brand": brands_stats
    }

@app.get("/analytics/customers/top")
def get_top_customers(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Статистика топ клієнтів"""

    # TOP-10 клієнтів за кількістю орend (власника)
    top_customers = db.query(
        Customer,
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('total_spent'),
        func.max(Rental.created_at).label('last_rental')
    ).filter(Customer.owner_id == owner.id)\
     .outerjoin(Rental, (Customer.id == Rental.customer_id) & (Rental.owner_id == owner.id))\
     .group_by(Customer.id)\
     .order_by(func.count(Rental.id).desc())\
     .limit(10)\
     .all()

    customers_list = []
    for customer, count, spent, last_rental in top_customers:
        customers_list.append({
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "rental_count": count or 0,
            "total_spent": float(spent) if spent else 0,
            "last_rental": last_rental.isoformat() if last_rental else None
        })

    # Нові клієнти за місяць (власника)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_customers = db.query(Customer).filter(
        Customer.owner_id == owner.id,
        Customer.created_at >= month_start
    ).count()

    return {
        "top_customers": customers_list,
        "new_this_month": new_customers
    }

@app.get("/analytics/revenue")
def get_revenue_analytics(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Деталі виручки для графіків"""

    # Виручка по днях за останні 30 днів (власника)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    daily_revenue = db.query(
        func.date(Rental.created_at).label('date'),
        func.sum(Rental.total_price).label('revenue')
    ).filter(Rental.owner_id == owner.id, Rental.created_at >= thirty_days_ago)\
     .group_by(func.date(Rental.created_at))\
     .order_by(func.date(Rental.created_at))\
     .all()

    revenue_by_day = [
        {"date": date.isoformat(), "revenue": float(revenue)}
        for date, revenue in daily_revenue
    ]

    # Розподіл по типу оренди (власника)
    revenue_by_type = db.query(
        Rental.rental_type,
        func.sum(Rental.total_price).label('revenue'),
        func.count(Rental.id).label('count')
    ).filter(Rental.owner_id == owner.id).group_by(Rental.rental_type).all()

    by_rental_type = {
        rental_type: {"revenue": float(revenue), "count": count}
        for rental_type, revenue, count in revenue_by_type
    }

    # Розподіл по типу спорядження (власника)
    revenue_by_gear_type = db.query(
        Gear.type,
        func.sum(Rental.total_price).label('revenue'),
        func.count(Rental.id).label('count')
    ).join(Rental, (Gear.id == Rental.gear_id) & (Rental.owner_id == owner.id))\
     .filter(Gear.owner_id == owner.id)\
     .group_by(Gear.type)\
     .all()

    by_gear_type = [
        {"type": gear_type, "revenue": float(revenue), "count": count}
        for gear_type, revenue, count in revenue_by_gear_type
    ]

    return {
        "daily": revenue_by_day,
        "by_rental_type": by_rental_type,
        "by_gear_type": by_gear_type
    }

@app.get("/analytics/overdue")
def get_overdue_rentals(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Список прострочених орend"""

    # Прострочені оренди (не повернуті і due_at < NOW) (власника)
    overdue = db.query(Rental).filter(
        Rental.owner_id == owner.id,
        Rental.return_at.is_(None),
        Rental.due_at < datetime.utcnow()
    ).order_by(Rental.due_at).all()

    overdue_list = []
    for rental in overdue:
        gear = db.query(Gear).filter(Gear.id == rental.gear_id, Gear.owner_id == owner.id).first()
        customer = db.query(Customer).filter(Customer.id == rental.customer_id, Customer.owner_id == owner.id).first()
        brand = db.query(Brand).filter(Brand.id == gear.brand_id, Brand.owner_id == owner.id).first() if gear else None

        # Розрахувати скільки днів прострочено
        days_overdue = (datetime.utcnow() - rental.due_at).days

        overdue_list.append({
            "rental_id": rental.id,
            "start_at": rental.start_at.isoformat(),
            "due_at": rental.due_at.isoformat(),
            "days_overdue": days_overdue,
            "rental_type": rental.rental_type,
            "total_price": float(rental.total_price),
            "customer": {
                "id": customer.id,
                "full_name": customer.full_name,
                "phone": customer.phone
            },
            "gear": {
                "id": gear.id,
                "type": gear.type,
                "brand": brand.name if brand else None,
                "size": gear.size
            }
        })

    return {
        "overdue_rentals": overdue_list,
        "count": len(overdue_list)
    }

@app.get("/analytics/brands/performance")
def get_brand_performance(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Детальна аналітика по брендах"""

    # Отримати всі бренди з їх метриками (власника)
    brands = db.query(Brand).filter(Brand.owner_id == owner.id).all()

    total_gear = db.query(Gear).filter(Gear.owner_id == owner.id).count()
    total_revenue = db.query(func.sum(Rental.total_price)).filter(Rental.owner_id == owner.id).scalar() or 0
    total_rentals = db.query(Rental).filter(Rental.owner_id == owner.id).count()

    brand_stats = []

    for brand in brands:
        # Кількість спорядження бренду (власника)
        gear_count = db.query(Gear).filter(Gear.brand_id == brand.id, Gear.owner_id == owner.id).count()

        # Кількість орend цього бренду (власника)
        rental_count = db.query(Rental).join(
            Gear, Rental.gear_id == Gear.id
        ).filter(Gear.brand_id == brand.id, Rental.owner_id == owner.id, Gear.owner_id == owner.id).count()

        # Загальна виручка від бренду (власника)
        brand_revenue = db.query(func.sum(Rental.total_price)).join(
            Gear, Rental.gear_id == Gear.id
        ).filter(Gear.brand_id == brand.id, Rental.owner_id == owner.id, Gear.owner_id == owner.id).scalar() or 0

        # Середня оцінка стану після повернення (власника)
        avg_condition = db.query(func.avg(Rental.condition_score)).join(
            Gear, Rental.gear_id == Gear.id
        ).filter(
            Gear.brand_id == brand.id,
            Rental.owner_id == owner.id,
            Gear.owner_id == owner.id,
            Rental.condition_score.isnot(None)
        ).scalar() or 0

        # Поточна зайнятість (скільки спорядження в оренді) (власника)
        rented_count = db.query(Gear).filter(
            Gear.brand_id == brand.id,
            Gear.owner_id == owner.id,
            Gear.status == 'rented'
        ).count()

        # Відсоток зайнятості
        utilization_rate = (rented_count / gear_count * 100) if gear_count > 0 else 0

        # Відсоток попиту (% від загальних орend)
        demand_percentage = (rental_count / total_rentals * 100) if total_rentals > 0 else 0

        # Відсоток виручки
        revenue_percentage = (float(brand_revenue) / float(total_revenue) * 100) if total_revenue > 0 else 0

        # Середня виручка на одиницю спорядження
        avg_revenue_per_item = float(brand_revenue) / gear_count if gear_count > 0 else 0

        brand_stats.append({
            "brand_id": brand.id,
            "brand_name": brand.name,
            "equipment_count": gear_count,
            "rental_count": rental_count,
            "total_revenue": float(brand_revenue),
            "avg_condition_score": round(float(avg_condition), 2) if avg_condition else 0,
            "rented_count": rented_count,
            "available_count": gear_count - rented_count,
            "utilization_rate": round(utilization_rate, 1),
            "demand_percentage": round(demand_percentage, 1),
            "revenue_percentage": round(revenue_percentage, 1),
            "avg_revenue_per_item": round(avg_revenue_per_item, 2)
        })

    # Сортувати за виручкою (від найбільшої до найменшої)
    brand_stats.sort(key=lambda x: x['total_revenue'], reverse=True)

    return {
        "brands": brand_stats,
        "summary": {
            "total_brands": len(brands),
            "total_equipment": total_gear,
            "total_revenue": float(total_revenue),
            "total_rentals": total_rentals
        }
    }

@app.get("/analytics/rentals/time-patterns")
def get_time_patterns(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Аналітика паттернів орend за часом"""

    # 1. Розподіл по днях тижня (0=Monday, 6=Sunday) (власника)
    day_of_week_data = db.query(
        func.extract('dow', Rental.created_at).label('day_of_week'),
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('revenue')
    ).filter(Rental.owner_id == owner.id)\
     .group_by(func.extract('dow', Rental.created_at))\
     .order_by(func.extract('dow', Rental.created_at))\
     .all()

    # Мапінг днів тижня на українські назви (PostgreSQL: 0=Sunday, 1=Monday, ..., 6=Saturday)
    day_names_pg = {
        0: 'Неділя',
        1: 'Понеділок',
        2: 'Вівторок',
        3: 'Середа',
        4: 'Четвер',
        5: 'П\'ятниця',
        6: 'Субота'
    }

    by_day_of_week = []
    for day, count, revenue in day_of_week_data:
        by_day_of_week.append({
            "day_of_week": int(day),
            "day_name": day_names_pg.get(int(day), 'Невідомо'),
            "rental_count": count,
            "revenue": float(revenue) if revenue else 0
        })

    # 2. Розподіл по годинах (0-23) (власника)
    hour_data = db.query(
        func.extract('hour', Rental.created_at).label('hour'),
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('revenue')
    ).filter(Rental.owner_id == owner.id)\
     .group_by(func.extract('hour', Rental.created_at))\
     .order_by(func.extract('hour', Rental.created_at))\
     .all()

    by_hour = []
    for hour, count, revenue in hour_data:
        by_hour.append({
            "hour": int(hour),
            "rental_count": count,
            "revenue": float(revenue) if revenue else 0
        })

    # 3. Місячні тренди (останні 12 місяців) (власника)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)

    monthly_data = db.query(
        func.extract('year', Rental.created_at).label('year'),
        func.extract('month', Rental.created_at).label('month'),
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('revenue')
    ).filter(Rental.owner_id == owner.id, Rental.created_at >= twelve_months_ago)\
     .group_by(
        func.extract('year', Rental.created_at),
        func.extract('month', Rental.created_at)
    ).order_by(
        func.extract('year', Rental.created_at),
        func.extract('month', Rental.created_at)
    ).all()

    # Назви місяців українською
    month_names = {
        1: 'Січень', 2: 'Лютий', 3: 'Березень', 4: 'Квітень',
        5: 'Травень', 6: 'Червень', 7: 'Липень', 8: 'Серпень',
        9: 'Вересень', 10: 'Жовтень', 11: 'Листопад', 12: 'Грудень'
    }

    by_month = []
    for year, month, count, revenue in monthly_data:
        month_key = f"{int(year)}-{int(month):02d}"
        by_month.append({
            "year": int(year),
            "month": int(month),
            "month_name": month_names.get(int(month), 'Невідомо'),
            "month_key": month_key,
            "rental_count": count,
            "revenue": float(revenue) if revenue else 0
        })

    # 4. Піковий час (найпопулярніший день і година)
    peak_day = max(by_day_of_week, key=lambda x: x['rental_count']) if by_day_of_week else None
    peak_hour = max(by_hour, key=lambda x: x['rental_count']) if by_hour else None
    best_month = max(by_month, key=lambda x: x['revenue']) if by_month else None

    return {
        "by_day_of_week": by_day_of_week,
        "by_hour": by_hour,
        "by_month": by_month,
        "insights": {
            "peak_day": peak_day,
            "peak_hour": peak_hour,
            "best_month": best_month
        }
    }

@app.get("/analytics/equipment/idle")
def get_idle_equipment(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Спорядження, яке простоює більше 7 днів"""

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    # Знайти спорядження, яке доступне (не в оренді) (власника)
    available_gear = db.query(Gear).filter(Gear.owner_id == owner.id, Gear.status == 'available').all()

    idle_equipment = []

    for gear in available_gear:
        # Знайти останню оренду цього спорядження (власника)
        last_rental = db.query(Rental).filter(
            Rental.gear_id == gear.id,
            Rental.owner_id == owner.id,
            Rental.return_at.isnot(None)
        ).order_by(Rental.return_at.desc()).first()

        # Якщо оренд немає взагалі, або остання оренда була більше 7 днів тому
        if not last_rental:
            days_idle = (datetime.utcnow() - gear.created_at).days
            last_used = None
        else:
            days_idle = (datetime.utcnow() - last_rental.return_at).days
            last_used = last_rental.return_at

        # Якщо простоює більше 7 днів
        if days_idle >= 7:
            brand = db.query(Brand).filter(Brand.id == gear.brand_id, Brand.owner_id == owner.id).first()

            # Розрахувати втрачену виручку (opportunity cost)
            # Припускаємо що могли б здавати 1 раз на день по daily_price
            lost_revenue = float(gear.daily_price) * days_idle

            idle_equipment.append({
                "gear_id": gear.id,
                "type": gear.type,
                "brand": brand.name if brand else None,
                "size": gear.size,
                "hourly_price": float(gear.hourly_price),
                "daily_price": float(gear.daily_price),
                "days_idle": days_idle,
                "last_used": last_used.isoformat() if last_used else None,
                "potential_lost_revenue": round(lost_revenue, 2)
            })

    # Сортувати за днями простою (від найбільшої до найменшої)
    idle_equipment.sort(key=lambda x: x['days_idle'], reverse=True)

    # Підрахувати загальну втрачену виручку
    total_lost_revenue = sum(item['potential_lost_revenue'] for item in idle_equipment)

    return {
        "idle_equipment": idle_equipment,
        "count": len(idle_equipment),
        "total_potential_lost_revenue": round(total_lost_revenue, 2)
    }

@app.get("/analytics/customers/segmentation")
def get_customer_segmentation(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Сегментація клієнтів: VIP, Regular, Occasional"""

    # Отримати всіх клієнтів з їх статистикою (власника)
    customers_stats = db.query(
        Customer,
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('total_spent'),
        func.max(Rental.created_at).label('last_rental')
    ).filter(Customer.owner_id == owner.id)\
     .outerjoin(Rental, (Customer.id == Rental.customer_id) & (Rental.owner_id == owner.id))\
     .group_by(Customer.id)\
     .all()

    vip_customers = []
    regular_customers = []
    occasional_customers = []

    for customer, rental_count, total_spent, last_rental in customers_stats:
        customer_data = {
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "rental_count": rental_count or 0,
            "total_spent": float(total_spent) if total_spent else 0,
            "last_rental": last_rental.isoformat() if last_rental else None
        }

        # Сегментація: VIP (>= 5 орend), Regular (2-4 оренди), Occasional (1 оренда)
        if rental_count >= 5:
            vip_customers.append(customer_data)
        elif rental_count >= 2:
            regular_customers.append(customer_data)
        elif rental_count >= 1:
            occasional_customers.append(customer_data)

    # Сортувати кожен сегмент за витратами
    vip_customers.sort(key=lambda x: x['total_spent'], reverse=True)
    regular_customers.sort(key=lambda x: x['total_spent'], reverse=True)
    occasional_customers.sort(key=lambda x: x['total_spent'], reverse=True)

    return {
        "vip": {
            "customers": vip_customers,
            "count": len(vip_customers),
            "total_revenue": sum(c['total_spent'] for c in vip_customers)
        },
        "regular": {
            "customers": regular_customers,
            "count": len(regular_customers),
            "total_revenue": sum(c['total_spent'] for c in regular_customers)
        },
        "occasional": {
            "customers": occasional_customers,
            "count": len(occasional_customers),
            "total_revenue": sum(c['total_spent'] for c in occasional_customers)
        },
        "summary": {
            "total_customers": len(vip_customers) + len(regular_customers) + len(occasional_customers),
            "vip_percentage": round(len(vip_customers) / (len(vip_customers) + len(regular_customers) + len(occasional_customers)) * 100, 1) if (len(vip_customers) + len(regular_customers) + len(occasional_customers)) > 0 else 0
        }
    }

@app.get("/analytics/customers/problematic")
def get_problematic_customers(owner: Owner = Depends(get_current_owner), db: Session = Depends(get_db)):
    """Клієнти з низькою оцінкою стану спорядження (< 3.0)"""

    # Знайти клієнтів з середньою оцінкою < 3.0 (власника)
    customers_condition = db.query(
        Customer,
        func.avg(Rental.condition_score).label('avg_condition'),
        func.count(Rental.id).label('rental_count'),
        func.sum(Rental.total_price).label('total_spent')
    ).join(Rental, (Customer.id == Rental.customer_id) & (Rental.owner_id == owner.id))\
     .filter(Customer.owner_id == owner.id, Rental.condition_score.isnot(None))\
     .group_by(Customer.id)\
     .having(func.avg(Rental.condition_score) < 3.0)\
     .order_by(func.avg(Rental.condition_score))\
     .all()

    problematic_list = []
    for customer, avg_condition, rental_count, total_spent in customers_condition:
        problematic_list.append({
            "id": customer.id,
            "full_name": customer.full_name,
            "phone": customer.phone,
            "avg_condition_score": round(float(avg_condition), 2),
            "rental_count": rental_count,
            "total_spent": float(total_spent) if total_spent else 0
        })

    return {
        "problematic_customers": problematic_list,
        "count": len(problematic_list)
    }

# ============= SEED ENDPOINTS (для заповнення БД) =============

class BrandSeed(BaseModel):
    name: str
    owner_id: int

class GearSeed(BaseModel):
    type: str
    brand_id: int
    size: str | None = None
    status: str = "available"
    hourly_price: float
    daily_price: float
    notes: str | None = None
    owner_id: int

class CustomerSeed(BaseModel):
    full_name: str
    phone: str
    notes: str | None = None
    owner_id: int

class RentalSeed(BaseModel):
    gear_id: int
    customer_id: int
    start_at: str  # ISO format datetime
    due_at: str  # ISO format datetime
    return_at: str | None = None  # ISO format datetime
    rental_type: str
    total_price: float
    condition_score: int | None = None
    comment: str | None = None
    owner_id: int

@app.post("/seed/brands")
def seed_brand(data: BrandSeed, db: Session = Depends(get_db)):
    """Seed endpoint - створення бренду без автентифікації"""
    brand = Brand(name=data.name, owner_id=data.owner_id)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand

@app.post("/seed/gear")
def seed_gear(data: GearSeed, db: Session = Depends(get_db)):
    """Seed endpoint - створення спорядження без автентифікації"""
    gear = Gear(**data.dict())
    db.add(gear)
    db.commit()
    db.refresh(gear)
    return gear

@app.post("/seed/customers")
def seed_customer(data: CustomerSeed, db: Session = Depends(get_db)):
    """Seed endpoint - створення клієнта без автентифікації"""
    customer = Customer(**data.dict())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@app.post("/seed/rentals")
def seed_rental(data: RentalSeed, db: Session = Depends(get_db)):
    """Seed endpoint - створення оренди без автентифікації"""
    from datetime import datetime as dt

    rental = Rental(
        gear_id=data.gear_id,
        customer_id=data.customer_id,
        start_at=dt.fromisoformat(data.start_at.replace('Z', '+00:00')),
        due_at=dt.fromisoformat(data.due_at.replace('Z', '+00:00')),
        return_at=dt.fromisoformat(data.return_at.replace('Z', '+00:00')) if data.return_at else None,
        rental_type=data.rental_type,
        total_price=data.total_price,
        condition_score=data.condition_score,
        comment=data.comment,
        owner_id=data.owner_id
    )
    db.add(rental)
    db.commit()
    db.refresh(rental)
    return rental

@app.patch("/seed/gear/{gear_id}/status")
def update_gear_status(gear_id: int, status_data: dict, db: Session = Depends(get_db)):
    """Seed endpoint - оновлення статусу спорядження без автентифікації"""
    gear = db.query(Gear).filter(Gear.id == gear_id).first()
    if not gear:
        raise HTTPException(status_code=404, detail="Gear not found")

    new_status = status_data.get("status")
    if new_status not in ["available", "rented", "broken"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    gear.status = new_status
    db.commit()
    db.refresh(gear)
    return gear
