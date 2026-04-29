"""Add indexes and materialized view for analytics

Revision ID: addindexes20260428
Revises: d948cbbc7be1
Create Date: 2026-04-28 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'addindexes20260428'
down_revision: Union[str, None] = 'd948cbbc7be1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add index to contacts.is_read to improve admin queries
    op.create_index('ix_contacts_is_read', 'contacts', ['is_read'], schema='public')

    # Create a materialized view for posts by category to speed aggregations
    op.execute('''
    CREATE MATERIALIZED VIEW IF NOT EXISTS public.posts_by_category AS
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      COUNT(p.id) AS post_count
    FROM public.categories c
    LEFT JOIN public.post_category pc ON c.id = pc.category_id
    LEFT JOIN public.posts p ON pc.post_id = p.id
    GROUP BY c.id, c.name;
    ''')

    # Add index on the materialized view for quick lookups
    op.create_index('ix_posts_by_category_category_id', 'posts_by_category', ['category_id'], unique=False, schema='public')


def downgrade() -> None:
    op.drop_index('ix_posts_by_category_category_id', table_name='posts_by_category', schema='public')
    op.execute('DROP MATERIALIZED VIEW IF EXISTS public.posts_by_category')
    op.drop_index('ix_contacts_is_read', table_name='contacts', schema='public')
