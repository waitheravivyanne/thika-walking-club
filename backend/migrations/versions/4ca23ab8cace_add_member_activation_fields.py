
"""Add member activation fields

Revision ID: 4ca23ab8cace
Revises: 50b607529ae1
Create Date: 2026-11-08 16:40:47.800644

"""

from alembic import op
import sqlalchemy as sa


# Revision identifiers
revision = '4ca23ab8cace'
down_revision = '50b607529ae1'
branch_labels = None
depends_on = None


def upgrade():
    """Add activation fields to the members table."""

    with op.batch_alter_table('members', schema=None) as batch_op:

        batch_op.add_column(
            sa.Column(
                'activation_token_hash',
                sa.String(length=64),
                nullable=True
            )
        )

        batch_op.add_column(
            sa.Column(
                'activation_expires_at',
                sa.DateTime(timezone=True),
                nullable=True
            )
        )

        batch_op.create_unique_constraint(
            'uq_members_activation_token_hash',
            ['activation_token_hash']
        )


def downgrade():
    """Remove activation fields from the members table."""

    with op.batch_alter_table('members', schema=None) as batch_op:

        batch_op.drop_constraint(
            'uq_members_activation_token_hash',
            type_='unique'
        )

        batch_op.drop_column('activation_expires_at')

        batch_op.drop_column('activation_token_hash')
