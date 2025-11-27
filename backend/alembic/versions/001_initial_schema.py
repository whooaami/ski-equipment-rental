"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-08

"""
from alembic import op
import sqlalchemy as sa


revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Define ENUM types
    gear_type_enum = sa.Enum('ski', 'skate', 'sled', name='gear_type_enum')
    gear_status_enum = sa.Enum('available', 'rented', 'broken', name='gear_status_enum')
    rental_type_enum = sa.Enum('hourly', 'daily', name='rental_type_enum')

    # Table: owners
    op.create_table(
        'owners',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_owners_email', 'owners', ['email'])

    # Table: brands
    op.create_table(
        'brands',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_brands_name', 'brands', ['name'])

    # Seed initial brands
    brands_table = sa.table(
        'brands',
        sa.column('name', sa.String)
    )

    op.bulk_insert(brands_table, [
        {'name': 'Rossignol'},
        {'name': 'Atomic'},
        {'name': 'Fischer'},
        {'name': 'Salomon'},
        {'name': 'Head'},
        {'name': 'Nordica'},
        {'name': 'K2'},
        {'name': 'Elan'},
        {'name': 'Volkl'},
        {'name': 'Інший'},
    ])

    # Table: gear
    op.create_table(
        'gear',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('type', gear_type_enum, nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('size', sa.String(20), nullable=True),
        sa.Column('status', gear_status_enum, nullable=False, server_default='available'),
        sa.Column('hourly_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('daily_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ondelete='RESTRICT'),
        sa.CheckConstraint('hourly_price > 0', name='check_hourly_price_positive'),
        sa.CheckConstraint('daily_price > 0', name='check_daily_price_positive'),
    )
    op.create_index('idx_gear_status', 'gear', ['status'])
    op.create_index('idx_gear_type', 'gear', ['type'])
    op.create_index('idx_gear_brand', 'gear', ['brand_id'])

    # Table: customers
    op.create_table(
        'customers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), unique=True, nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now(), nullable=False),
    )
    op.create_index('idx_customers_phone', 'customers', ['phone'])
    op.create_index('idx_customers_name', 'customers', ['full_name'])

    # Table: rentals
    op.create_table(
        'rentals',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('gear_id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('start_at', sa.TIMESTAMP, nullable=False),
        sa.Column('due_at', sa.TIMESTAMP, nullable=False),
        sa.Column('return_at', sa.TIMESTAMP, nullable=True),
        sa.Column('rental_type', rental_type_enum, nullable=False),
        sa.Column('total_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('condition_score', sa.Integer(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['gear_id'], ['gear.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='CASCADE'),
        sa.CheckConstraint('due_at > start_at', name='check_due_after_start'),
        sa.CheckConstraint('condition_score BETWEEN 1 AND 5', name='check_condition_score_range'),
    )
    op.create_index('idx_rentals_gear', 'rentals', ['gear_id'])
    op.create_index('idx_rentals_customer', 'rentals', ['customer_id'])
    op.create_index('idx_rentals_dates', 'rentals', ['start_at', 'due_at'])


def downgrade():
    op.drop_table('rentals')
    op.drop_table('customers')
    op.drop_table('gear')
    op.drop_table('brands')
    op.drop_table('owners')
