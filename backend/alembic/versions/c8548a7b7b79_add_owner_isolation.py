"""add_owner_isolation

Revision ID: c8548a7b7b79
Revises: 001
Create Date: 2025-11-12 09:32:05.011231

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'c8548a7b7b79'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Check if columns already exist (for idempotency)
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # Create a default owner if none exists (for fresh databases)
    result = conn.execute(sa.text("SELECT COUNT(*) FROM owners"))
    owner_count = result.scalar()
    if owner_count == 0:
        # Create default owner with hashed password for "password123"
        conn.execute(sa.text("""
            INSERT INTO owners (email, password_hash, company_name)
            VALUES ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3LOXzVSz4u', 'Default Company')
        """))

    # Add owner_id to brands table
    brands_columns = [col['name'] for col in inspector.get_columns('brands')]
    if 'owner_id' not in brands_columns:
        op.add_column('brands', sa.Column('owner_id', sa.Integer(), nullable=True))
        # Set default owner_id for existing records (use first owner)
        op.execute("UPDATE brands SET owner_id = (SELECT MIN(id) FROM owners) WHERE owner_id IS NULL")
        op.alter_column('brands', 'owner_id', nullable=False)
        op.create_foreign_key('fk_brands_owner', 'brands', 'owners', ['owner_id'], ['id'], ondelete='RESTRICT')
        op.create_index('idx_brands_owner', 'brands', ['owner_id'])

        # Drop old unique constraint on name, create new composite one
        op.drop_constraint('brands_name_key', 'brands', type_='unique')
        op.create_unique_constraint('uq_brands_name_owner', 'brands', ['name', 'owner_id'])

    # Add owner_id to gear table
    gear_columns = [col['name'] for col in inspector.get_columns('gear')]
    if 'owner_id' not in gear_columns:
        op.add_column('gear', sa.Column('owner_id', sa.Integer(), nullable=True))
        # Set default owner_id for existing records (use first owner)
        op.execute("UPDATE gear SET owner_id = (SELECT MIN(id) FROM owners) WHERE owner_id IS NULL")
        op.alter_column('gear', 'owner_id', nullable=False)
        op.create_foreign_key('fk_gear_owner', 'gear', 'owners', ['owner_id'], ['id'], ondelete='RESTRICT')
        op.create_index('idx_gear_owner', 'gear', ['owner_id'])

    # Add owner_id to customers table
    customers_columns = [col['name'] for col in inspector.get_columns('customers')]
    if 'owner_id' not in customers_columns:
        op.add_column('customers', sa.Column('owner_id', sa.Integer(), nullable=True))
        # Set default owner_id for existing records (use first owner)
        op.execute("UPDATE customers SET owner_id = (SELECT MIN(id) FROM owners) WHERE owner_id IS NULL")
        op.alter_column('customers', 'owner_id', nullable=False)
        op.create_foreign_key('fk_customers_owner', 'customers', 'owners', ['owner_id'], ['id'], ondelete='RESTRICT')
        op.create_index('idx_customers_owner', 'customers', ['owner_id'])

        # Drop old unique constraint on phone, create new composite one
        op.drop_constraint('customers_phone_key', 'customers', type_='unique')
        op.create_unique_constraint('uq_customers_phone_owner', 'customers', ['phone', 'owner_id'])

    # Add owner_id to rentals table
    rentals_columns = [col['name'] for col in inspector.get_columns('rentals')]
    if 'owner_id' not in rentals_columns:
        op.add_column('rentals', sa.Column('owner_id', sa.Integer(), nullable=True))
        # Set default owner_id for existing records (use first owner)
        op.execute("UPDATE rentals SET owner_id = (SELECT MIN(id) FROM owners) WHERE owner_id IS NULL")
        op.alter_column('rentals', 'owner_id', nullable=False)
        op.create_foreign_key('fk_rentals_owner', 'rentals', 'owners', ['owner_id'], ['id'], ondelete='RESTRICT')
        op.create_index('idx_rentals_owner', 'rentals', ['owner_id'])


def downgrade():
    # Remove owner isolation
    op.drop_constraint('fk_rentals_owner', 'rentals', type_='foreignkey')
    op.drop_index('idx_rentals_owner', table_name='rentals')
    op.drop_column('rentals', 'owner_id')

    op.drop_constraint('uq_customers_phone_owner', 'customers', type_='unique')
    op.create_unique_constraint('customers_phone_key', 'customers', ['phone'])
    op.drop_constraint('fk_customers_owner', 'customers', type_='foreignkey')
    op.drop_index('idx_customers_owner', table_name='customers')
    op.drop_column('customers', 'owner_id')

    op.drop_constraint('fk_gear_owner', 'gear', type_='foreignkey')
    op.drop_index('idx_gear_owner', table_name='gear')
    op.drop_column('gear', 'owner_id')

    op.drop_constraint('uq_brands_name_owner', 'brands', type_='unique')
    op.create_unique_constraint('brands_name_key', 'brands', ['name'])
    op.drop_constraint('fk_brands_owner', 'brands', type_='foreignkey')
    op.drop_index('idx_brands_owner', table_name='brands')
    op.drop_column('brands', 'owner_id')
