"""Add PolicySettings and update Offer created_by

Revision ID: 6f9a5b6c7d8e
Revises: 5e8f4ae2f5b2
Create Date: 2026-10-08 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6f9a5b6c7d8e'
down_revision = '5e8f4ae2f5b2'
branch_labels = None
depends_on = None

def upgrade():
    # Create policy_settings table
    op.create_table('policy_settings',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('key', sa.String(), nullable=False),
    sa.Column('value', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_policy_settings_key'), 'policy_settings', ['key'], unique=True)

    # Update offers.created_by to point to users.id instead of admins.id
    op.drop_constraint('offers_created_by_fkey', 'offers', type_='foreignkey')
    op.create_foreign_key(None, 'offers', 'users', ['created_by'], ['id'])

def downgrade():
    # Revert offers.created_by
    op.drop_constraint(None, 'offers', type_='foreignkey')
    op.create_foreign_key('offers_created_by_fkey', 'offers', 'admins', ['created_by'], ['id'])

    # Drop policy_settings table
    op.drop_index(op.f('ix_policy_settings_key'), table_name='policy_settings')
    op.drop_table('policy_settings')
