"""Initial migration with all models

Revision ID: ec2bda80af6f
Revises: 
Create Date: 2026-04-24 11:06:47.204530

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid


# revision identifiers, used by Alembic.
revision: str = 'ec2bda80af6f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('firstName', sa.String(), nullable=False),
        sa.Column('lastName', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('email', name='uq_users_email'),
        sa.Index('ix_users_email', 'email'),
        sa.Index('created_at_idx', 'created_at'),
        sa.Index('updated_at_idx', 'updated_at'),
        sa.Index('active_idx', 'active'),
        sa.Index('role_idx', 'role'),
        schema='public'
    )
    
    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('name', name='uq_categories_name'),
        sa.UniqueConstraint('slug', name='uq_categories_slug'),
        sa.Index('ix_categories_name', 'name'),
        sa.Index('ix_categories_slug', 'slug'),
        sa.Index('ix_categories_created_at', 'created_at'),
        sa.Index('ix_categories_updated_at', 'updated_at'),
        schema='public'
    )
    
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('name', name='uq_tags_name'),
        sa.UniqueConstraint('slug', name='uq_tags_slug'),
        sa.Index('ix_tags_name', 'name'),
        sa.Index('ix_tags_slug', 'slug'),
        sa.Index('ix_tags_created_at', 'created_at'),
        sa.Index('ix_tags_updated_at', 'updated_at'),
        schema='public'
    )
    
    # Create posts table
    op.create_table(
        'posts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('excerpt', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('coverImage', sa.String(), nullable=False),
        sa.Column('authorId', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('readingTime', sa.Integer(), nullable=False),
        sa.Column('likes', sa.Integer(), nullable=False),
        sa.Column('views', sa.Integer(), nullable=False),
        sa.Column('isPublished', sa.Boolean(), nullable=False),
        sa.Column('featured', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['authorId'], ['public.users.id'], ondelete='CASCADE'),
        sa.Index('ix_posts_authorId', 'authorId'),
        sa.Index('ix_posts_created_at', 'created_at'),
        sa.Index('ix_posts_updated_at', 'updated_at'),
        sa.Index('ix_posts_isPublished', 'isPublished'),
        sa.Index('ix_posts_featured', 'featured'),
        sa.Index('ix_posts_likes', 'likes'),
        sa.Index('ix_posts_views', 'views'),
        sa.Index('ix_posts_readingTime', 'readingTime'),
        schema='public'
    )
    
    # Create post_category association table
    op.create_table(
        'post_category',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.ForeignKeyConstraint(['post_id'], ['public.posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['public.categories.id'], ondelete='CASCADE'),
        sa.Index('ix_post_category_post_id', 'post_id'),
        sa.Index('ix_post_category_category_id', 'category_id'),
        schema='public'
    )
    
    # Create post_tag association table
    op.create_table(
        'post_tag',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tag_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.ForeignKeyConstraint(['post_id'], ['public.posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['public.tags.id'], ondelete='CASCADE'),
        sa.Index('ix_post_tag_post_id', 'post_id'),
        sa.Index('ix_post_tag_tag_id', 'tag_id'),
        schema='public'
    )
    
    # Create comments table
    op.create_table(
        'comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('post_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('author_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('likes', sa.Integer(), nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['public.posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['author_id'], ['public.users.id'], ondelete='CASCADE'),
        sa.Index('ix_comments_post_id', 'post_id'),
        sa.Index('ix_comments_author_id', 'author_id'),
        sa.Index('ix_comments_parent_id', 'parent_id'),
        sa.Index('ix_comments_created_at', 'created_at'),
        sa.Index('ix_comments_likes', 'likes'),
        schema='public'
    )


def downgrade() -> None:
    op.drop_table('comments', schema='public')
    op.drop_table('post_tag', schema='public')
    op.drop_table('post_category', schema='public')
    op.drop_table('posts', schema='public')
    op.drop_table('tags', schema='public')
    op.drop_table('categories', schema='public')
    op.drop_table('users', schema='public')

