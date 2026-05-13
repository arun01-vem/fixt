"""create order_status_events table and add repair_cost

Revision ID: c87c80d32cc3
Revises: ea3807bc04ee
Create Date: 2026-05-13 16:30:19.366830

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c87c80d32cc3'
down_revision: Union[str, Sequence[str], None] = 'ea3807bc04ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add repair_cost to orders
    op.add_column('orders', sa.Column('repair_cost', sa.Float(), nullable=True))
    
    # Create order_status_events table
    op.create_table(
        'order_status_events',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('order_id', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('order_status_events')
    op.drop_column('orders', 'repair_cost')
