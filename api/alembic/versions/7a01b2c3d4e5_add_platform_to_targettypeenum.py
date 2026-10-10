"""Add platform to TargetTypeEnum

Revision ID: 7a01b2c3d4e5
Revises: 6f9a5b6c7d8e
Create Date: 2026-10-10 13:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7a01b2c3d4e5'
down_revision = '6f9a5b6c7d8e'
branch_labels = None
depends_on = None

def upgrade():
    # PostgreSQL requires ADD VALUE to be outside a transaction block if older than PG12, 
    # but we can use IF NOT EXISTS if supported. 
    # To be safe, we disable transactions for this execution if needed, but op.execute is usually fine.
    try:
        op.execute("COMMIT")
        op.execute("ALTER TYPE targettypeenum ADD VALUE IF NOT EXISTS 'platform'")
    except Exception as e:
        print(f"Enum value might already exist or auto-commit block not needed: {e}")
    
    # Make target_id nullable
    op.alter_column('feedback', 'target_id',
               existing_type=postgresql.UUID(as_uuid=True),
               nullable=True)

def downgrade():
    op.alter_column('feedback', 'target_id',
               existing_type=postgresql.UUID(as_uuid=True),
               nullable=False)
    # Note: Postgres does not support DROP VALUE for ENUMs.
