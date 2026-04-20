from sqlalchemy import inspect
from app.database import engine


def get_schema():
    """Get schema for ALL tables in the database."""
    inspector = inspect(engine)
    schema_text = ""

    tables = inspector.get_table_names()

    if not tables:
        return "No tables found in database."

    for table in tables:
        columns = inspector.get_columns(table)
        col_names = [col["name"] for col in columns]
        schema_text += f"\nTable: {table}\nColumns: {', '.join(col_names)}\n"

    return schema_text


def get_schema_for_table(table_name: str):
    """Get schema for a SPECIFIC table only."""
    inspector = inspect(engine)

    tables = inspector.get_table_names()
    if table_name not in tables:
        return None

    columns = inspector.get_columns(table_name)
    col_info = []
    for col in columns:
        col_type = str(col.get("type", "TEXT"))
        col_info.append(f"{col['name']} ({col_type})")

    return ", ".join(col_info)