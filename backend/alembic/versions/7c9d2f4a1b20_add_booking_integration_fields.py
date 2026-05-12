"""add booking integration fields

Revision ID: 7c9d2f4a1b20
Revises: bbe9ae349aa5
Create Date: 2026-05-08 10:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c9d2f4a1b20"
down_revision: Union[str, Sequence[str], None] = "bbe9ae349aa5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("brand", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("model", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("issue_details", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("price_min", sa.Float(), nullable=True))
    op.add_column("orders", sa.Column("price_max", sa.Float(), nullable=True))
    op.add_column("orders", sa.Column("district", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("village", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("address_line", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("pincode", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("nearby_location", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("landmark", sa.String(), nullable=True))
    op.add_column("orders", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("orders", sa.Column("longitude", sa.Float(), nullable=True))
    op.add_column("orders", sa.Column("alternate_phone", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "alternate_phone")
    op.drop_column("orders", "longitude")
    op.drop_column("orders", "latitude")
    op.drop_column("orders", "landmark")
    op.drop_column("orders", "nearby_location")
    op.drop_column("orders", "pincode")
    op.drop_column("orders", "address_line")
    op.drop_column("orders", "village")
    op.drop_column("orders", "district")
    op.drop_column("orders", "price_max")
    op.drop_column("orders", "price_min")
    op.drop_column("orders", "issue_details")
    op.drop_column("orders", "model")
    op.drop_column("orders", "brand")
