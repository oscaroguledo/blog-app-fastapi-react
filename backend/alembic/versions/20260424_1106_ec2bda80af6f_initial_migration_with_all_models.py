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
        sa.Column('bio', sa.String(), nullable=True),
        sa.Column('isActive', sa.Boolean(), nullable=False),
        sa.Column('isVerified', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Index('ix_users_email', 'email'),
        schema='public'
    )
    
    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Index('ix_categories_slug', 'slug'),
        schema='public'
    )
    
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Index('ix_tags_slug', 'slug'),
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
        sa.ForeignKeyConstraint(['authorId'], ['users.id'], ondelete='CASCADE'),
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
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
        sa.Index('ix_post_category_post_id', 'post_id'),
        sa.Index('ix_post_category_category_id', 'category_id'),
        schema='public'
    )
    
    # Create post_tag association table
    op.create_table(
        'post_tag',
        sa.Column('post_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tag_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
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
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
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

