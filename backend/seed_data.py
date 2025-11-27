#!/usr/bin/env python3
"""
Скрипт для заповнення БД тестовими даними з двома власниками.
Генерує різноманітні дані для статистики та аналітики.
"""

import requests
import random
from datetime import datetime, timedelta, timezone
from faker import Faker
import string

# Конфігурація
BASE_URL = "http://localhost:8001"
fake = Faker(['uk_UA'])  # Українська локалізація

# Реалістичні назви лижних брендів
SKI_BRANDS = [
    "Rossignol", "Atomic", "Fischer", "Salomon", "Head", "Nordica",
    "K2", "Elan", "Volkl", "Blizzard", "Dynastar", "Stockli",
    "Scott", "Black Crows", "Line", "Armada", "Faction", "4FRNT",
    "Movement", "ZAG", "DPS"
]

# Коментарі для орend
RENTAL_COMMENTS = [
    "Все чудово", "Дуже задоволений", "Відмінний стан",
    "Трохи подряпане", "Є незначні пошкодження", "Потребує ремонту",
    "Ідеальний стан", "Як нове", "Невеликі сліди використання",
    None, None, None  # Більшість орend без коментарів
]

def generate_password():
    """Генерує випадковий пароль"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(12))

def create_owner(email, password, company_name):
    """Створює власника та повертає його дані"""
    response = requests.post(f"{BASE_URL}/register", json={
        "email": email,
        "password": password,
        "company_name": company_name
    })
    response.raise_for_status()
    data = response.json()
    return {
        "id": data["id"],
        "email": data["email"],
        "password": password,
        "company_name": company_name,
        "token": data["token"]
    }

def create_brands(owner_id, count):
    """Створює бренди для власника"""
    brands = []
    brand_names = random.sample(SKI_BRANDS, min(count, len(SKI_BRANDS)))

    for name in brand_names:
        response = requests.post(f"{BASE_URL}/seed/brands", json={
            "name": name,
            "owner_id": owner_id
        })
        response.raise_for_status()
        brands.append(response.json())
        print(f"  ✓ Створено бренд: {name}")

    return brands

def create_gear(owner_id, brands, count):
    """Створює спорядження для власника"""
    gear_types = ["ski", "skate", "sled"]
    sizes = ["XS", "S", "M", "L", "XL", "36", "38", "40", "42", "44", "46"]

    gear_list = []

    for i in range(count):
        gear_type = random.choice(gear_types)
        brand = random.choice(brands)

        # Реалістичні ціни залежно від типу
        if gear_type == "ski":
            hourly_price = round(random.uniform(50, 200), 2)
            daily_price = round(hourly_price * 6, 2)  # Денна ціна вигідніша
        elif gear_type == "skate":
            hourly_price = round(random.uniform(30, 100), 2)
            daily_price = round(hourly_price * 5.5, 2)
        else:  # sled
            hourly_price = round(random.uniform(20, 80), 2)
            daily_price = round(hourly_price * 5, 2)

        # Всі товари створюються як доступні
        # Статус "broken" встановлюється тільки при поверненні з condition_score=1

        response = requests.post(f"{BASE_URL}/seed/gear", json={
            "type": gear_type,
            "brand_id": brand["id"],
            "size": random.choice(sizes) if random.random() > 0.1 else None,
            "status": "available",
            "hourly_price": hourly_price,
            "daily_price": daily_price,
            "notes": f"Спорядження #{i+1}" if random.random() > 0.7 else None,
            "owner_id": owner_id
        })
        response.raise_for_status()
        gear_list.append(response.json())

    print(f"  ✓ Створено {count} одиниць спорядження")
    return gear_list

def create_customers(owner_id, count):
    """Створює клієнтів для власника"""
    customers = []

    for i in range(count):
        # Генеруємо унікальний телефон
        phone = f"+380{random.randint(50, 99)}{random.randint(1000000, 9999999)}"

        response = requests.post(f"{BASE_URL}/seed/customers", json={
            "full_name": fake.name(),
            "phone": phone,
            "notes": fake.sentence() if random.random() > 0.8 else None,
            "owner_id": owner_id
        })
        response.raise_for_status()
        customers.append(response.json())

    print(f"  ✓ Створено {count} клієнтів")
    return customers

def create_rentals(owner_id, gear_list, customers, count):
    """Створює оренди з різноманітними даними для статистики"""
    rentals = []

    # Розподіл по місяцях (більше орend взимку)
    months_weights = {
        1: 15, 2: 15, 3: 10,  # Зима - пік сезону
        4: 5, 5: 3, 6: 2,      # Весна - спад
        7: 1, 8: 1, 9: 2,      # Літо - мінімум
        10: 5, 11: 10, 12: 15  # Осінь-зима - зростання
    }

    # Розподіл по днях тижня (більше на вихідних)
    weekday_weights = [1, 1, 1, 1, 2, 4, 4]  # Пн-Чт: 1, Пт: 2, Сб-Нд: 4

    # Використовуємо timezone-aware datetime
    now = datetime.now(timezone.utc)

    # Фільтруємо тільки доступні товари (не broken)
    available_gear = [g for g in gear_list if g["status"] == "available"]

    # Відстежуємо стан кожної одиниці спорядження
    gear_rental_count = {g["id"]: 0 for g in available_gear}

    # Визначаємо кількість просрочених орend (максимум 5 штук)
    overdue_count = min(5, max(1, int(count * 0.02)))  # Мінімум 1, максимум 5
    overdue_created = 0

    # Розподіл: 50% завершені, 47% активні, ~3% просрочені (макс 5)
    rental_statuses = (
        ["completed"] * int(count * 0.50) +
        ["active"] * int(count * 0.47) +
        ["overdue"] * overdue_count
    )
    # Доповнюємо до потрібної кількості
    while len(rental_statuses) < count:
        rental_statuses.append("completed")

    random.shuffle(rental_statuses)

    for i in range(count):
        # Вибираємо товар який ще не має активної оренди
        available_for_rental = [
            g for g in available_gear
            if gear_rental_count[g["id"]] == 0 or rental_statuses[i] == "completed"
        ]

        if not available_for_rental:
            # Якщо всі товари зайняті, беремо будь-який
            available_for_rental = available_gear

        if not available_for_rental:
            break  # Немає доступних товарів

        gear = random.choice(available_for_rental)
        customer = random.choice(customers)

        # Вибираємо випадковий місяць з ваговими коефіцієнтами
        month = random.choices(
            list(months_weights.keys()),
            weights=list(months_weights.values())
        )[0]

        # Генеруємо дату в межах наступного року (вперед від сьогодні)
        year = now.year if month >= now.month else now.year + 1
        day = random.randint(1, 28)  # Безпечний діапазон для всіх місяців

        # Корегуємо день тижня з ваговими коефіцієнтами
        temp_date = datetime(year, month, day, tzinfo=timezone.utc)
        attempts = 0
        while random.random() > weekday_weights[temp_date.weekday()] / 4 and attempts < 10:
            day = random.randint(1, 28)
            temp_date = datetime(year, month, day, tzinfo=timezone.utc)
            attempts += 1

        # Час початку оренди (9:00 - 18:00)
        hour = random.randint(9, 18)
        start_at = datetime(year, month, day, hour, random.randint(0, 59), tzinfo=timezone.utc)

        # Для завершених орend - переносимо в минуле
        rental_status = rental_statuses[i]
        if rental_status == "completed":
            # Завершені оренди були в минулому (останні 6 місяців)
            days_ago = random.randint(30, 180)
            start_at = now - timedelta(days=days_ago)
        elif rental_status == "active":
            # Активні оренди почалися нещодавно (1-7 днів тому)
            # Тривалість буде достатньою щоб due_at був у майбутньому
            days_ago = random.randint(1, 7)
            start_at = now - timedelta(days=days_ago)
        elif rental_status == "overdue":
            # Просрочені оренди почалися давно (15-30 днів тому)
            # З короткою тривалістю, щоб due_at був у минулому
            days_ago = random.randint(15, 30)
            start_at = now - timedelta(days=days_ago)

        # Тип та тривалість оренди
        rental_type = random.choice(["hourly", "hourly", "daily"])  # 66% погодинно, 33% подобово

        # Для активних орend - довші періоди щоб due_at був у майбутньому
        # Для просрочених - короткі періоди щоб due_at був у минулому
        if rental_status == "active":
            # Активні - тривалість 7-21 днів, щоб due_at точно був у майбутньому
            rental_type = "daily"
            duration = random.choice([7, 10, 14, 21])
            due_at = start_at + timedelta(days=duration)
        elif rental_status == "overdue":
            # Просрочені - короткі періоди 2-5 днів, щоб due_at був у минулому
            rental_type = random.choice(["hourly", "daily"])
            if rental_type == "hourly":
                duration = random.choice([2, 3, 4, 5])
                due_at = start_at + timedelta(hours=duration)
            else:
                duration = random.choice([1, 2, 3])
                due_at = start_at + timedelta(days=duration)
        else:
            # Завершені - стандартні періоди
            if rental_type == "hourly":
                duration = random.choice([2, 3, 4, 5, 6, 8])
                due_at = start_at + timedelta(hours=duration)
            else:
                duration = random.choice([1, 2, 3, 5, 7])
                due_at = start_at + timedelta(days=duration)

        # Розраховуємо ціну
        if rental_type == "hourly":
            total_price = float(gear["hourly_price"]) * duration
        else:
            total_price = float(gear["daily_price"]) * duration

        # Додаємо варіацію до ціни (±10%)
        total_price *= random.uniform(0.9, 1.1)
        total_price = round(total_price, 2)

        return_at = None
        condition_score = None
        comment = None

        if rental_status == "completed":
            # Оренда повернута
            # 80% повернуті вчасно, 20% з невеликою затримкою
            if random.random() < 0.8:
                # Повернуто вчасно (раніше або в день due_at)
                hours_before = random.randint(1, 12)
                return_at = due_at - timedelta(hours=hours_before)
            else:
                # Невелика затримка (1-2 дні)
                return_at = due_at + timedelta(days=random.randint(1, 2))

            # Оцінка стану (нормальний розподіл з середнім 4)
            condition_score = min(5, max(1, int(random.gauss(4, 0.8))))
            comment = random.choice(RENTAL_COMMENTS)

        elif rental_status == "active":
            # Активна оренда - return_at = None, due_at в майбутньому
            # Статус товару треба буде оновити на "rented"
            gear_rental_count[gear["id"]] = 1

        elif rental_status == "overdue":
            # Прострочена оренда - return_at = None, due_at в минулому
            # Статус товару треба буде оновити на "rented"
            gear_rental_count[gear["id"]] = 1
            overdue_created += 1

        # Створюємо оренду
        rental_data = {
            "gear_id": gear["id"],
            "customer_id": customer["id"],
            "start_at": start_at.isoformat().replace('+00:00', 'Z'),
            "due_at": due_at.isoformat().replace('+00:00', 'Z'),
            "return_at": return_at.isoformat().replace('+00:00', 'Z') if return_at else None,
            "rental_type": rental_type,
            "total_price": total_price,
            "condition_score": condition_score,
            "comment": comment,
            "owner_id": owner_id
        }

        response = requests.post(f"{BASE_URL}/seed/rentals", json=rental_data)
        response.raise_for_status()
        rentals.append(response.json())

        # Якщо оренда активна або прострочена - оновлюємо статус товару
        if rental_status in ["active", "overdue"]:
            update_response = requests.patch(
                f"{BASE_URL}/seed/gear/{gear['id']}/status",
                json={"status": "rented"}
            )
            if update_response.status_code == 200:
                gear["status"] = "rented"

    print(f"  ✓ Створено {len(rentals)} орend (завершені: {len([r for r in rental_statuses[:len(rentals)] if r == 'completed'])}, активні: {len([r for r in rental_statuses[:len(rentals)] if r == 'active'])}, просрочені: {overdue_created})")
    return rentals

def main():
    print("=" * 60)
    print("🎿 Скрипт заповнення БД для системи оренди лижного спорядження")
    print("=" * 60)
    print()

    # Створюємо двох власників
    print("📝 Створення власників...")

    owner1_password = generate_password()
    owner1 = create_owner(
        email="owner1@skirent.com",
        password=owner1_password,
        company_name="Alpine Ski Rental"
    )

    owner2_password = generate_password()
    owner2 = create_owner(
        email="owner2@skirent.com",
        password=owner2_password,
        company_name="Mountain Snow Equipment"
    )

    print()
    print("✅ ВЛАСНИКИ СТВОРЕНІ!")
    print("-" * 60)
    print(f"👤 Власник 1:")
    print(f"   Email: {owner1['email']}")
    print(f"   Пароль: {owner1['password']}")
    print(f"   Компанія: {owner1['company_name']}")
    print()
    print(f"👤 Власник 2:")
    print(f"   Email: {owner2['email']}")
    print(f"   Пароль: {owner2['password']}")
    print(f"   Компанія: {owner2['company_name']}")
    print("-" * 60)
    print()

    # Власник 1
    print(f"🏢 Заповнення даних для {owner1['company_name']}...")
    brands1_count = random.randint(5, 20)
    gear1_count = random.randint(50, 150)
    customers1_count = random.randint(50, 200)
    rentals1_count = random.randint(200, 300)

    brands1 = create_brands(owner1['id'], brands1_count)
    gear1 = create_gear(owner1['id'], brands1, gear1_count)
    customers1 = create_customers(owner1['id'], customers1_count)
    rentals1 = create_rentals(owner1['id'], gear1, customers1, rentals1_count)

    print(f"✅ Завершено для {owner1['company_name']}")
    print(f"   Брендів: {len(brands1)}, Спорядження: {len(gear1)}, Клієнтів: {len(customers1)}, Орend: {len(rentals1)}")
    print()

    # Власник 2
    print(f"🏢 Заповнення даних для {owner2['company_name']}...")
    brands2_count = random.randint(5, 20)
    gear2_count = random.randint(50, 150)
    customers2_count = random.randint(50, 200)
    rentals2_count = random.randint(200, 300)

    brands2 = create_brands(owner2['id'], brands2_count)
    gear2 = create_gear(owner2['id'], brands2, gear2_count)
    customers2 = create_customers(owner2['id'], customers2_count)
    rentals2 = create_rentals(owner2['id'], gear2, customers2, rentals2_count)

    print(f"✅ Завершено для {owner2['company_name']}")
    print(f"   Брендів: {len(brands2)}, Спорядження: {len(gear2)}, Клієнтів: {len(customers2)}, Орend: {len(rentals2)}")
    print()

    print("=" * 60)
    print("✨ ЗАПОВНЕННЯ БД ЗАВЕРШЕНО!")
    print("=" * 60)
    print()
    print("📋 ЗБЕРЕЖІТЬ ЦІ ПАРОЛІ:")
    print("-" * 60)
    print(f"Email: {owner1['email']}")
    print(f"Пароль: {owner1['password']}")
    print()
    print(f"Email: {owner2['email']}")
    print(f"Пароль: {owner2['password']}")
    print("-" * 60)
    print()
    print("🎉 Тепер можете увійти в систему та переглянути аналітику!")

if __name__ == "__main__":
    main()
