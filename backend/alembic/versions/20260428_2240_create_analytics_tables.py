"""create analytics tables

Revision ID: 20260428_2240
Revises: d948cbbc7be1
Create Date: 2026-04-28 22:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from core.types.guid import GUID

# revision identifiers, used by Alembic.
revision = '20260428_2240'
down_revision = 'd948cbbc7be1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'page_views',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('post_id', GUID(), sa.ForeignKey('public.posts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('visitor_id', sa.String(), nullable=False),
        sa.Column('path', sa.String(), nullable=False),
        sa.Column('referrer', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        schema='public',
    )
    op.create_index('ix_page_views_post_id', 'page_views', ['post_id'], schema='public')
    op.create_index('ix_page_views_created_at', 'page_views', ['created_at'], schema='public')
    op.create_index('ix_page_views_visitor_id', 'page_views', ['visitor_id'], schema='public')

    op.create_table(
        'daily_view_stats',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False, unique=True),
        sa.Column('total_views', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('unique_visitors', sa.Integer(), nullable=False, server_default='0'),
        schema='public',
    )
    op.create_index('ix_daily_view_stats_date', 'daily_view_stats', ['date'], schema='public', unique=True)


def downgrade() -> None:
    op.drop_table('daily_view_stats', schema='public')
    op.drop_table('page_views', schema='public')
