"""create contacts table

Revision ID: 20260428_2300
Revises: 20260428_2240
Create Date: 2026-04-28 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from core.types.guid import GUID

# revision identifiers, used by Alembic.
revision = '20260428_2300'
down_revision = '20260428_2240'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'contacts',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=False),
        sa.Column('subject', sa.Text(), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        schema='public',
    )
    op.create_index('ix_contacts_email', 'contacts', ['email'], schema='public')
    op.create_index('ix_contacts_created_at', 'contacts', ['created_at'], schema='public')


def downgrade() -> None:
    op.drop_table('contacts', schema='public')
