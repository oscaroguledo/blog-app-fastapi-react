"""Merge heads: addindexes20260428 + 20260428_2300

Revision ID: 20260428_2315
Revises: 20260428_2300, addindexes20260428
Create Date: 2026-04-28 23:15:00.000000

This is an Alembic merge migration to resolve multiple heads.
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision = '20260428_2315'
down_revision = ('20260428_2300', 'addindexes20260428')
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Merge revision: no-op
    pass


def downgrade() -> None:
    # No-op downgrade for merge revision
    pass
