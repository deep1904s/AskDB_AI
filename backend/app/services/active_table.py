import os
import json

# In-memory state for the active table and conversation context
_active_table = None
_last_results = None
_last_sql = None
_last_question = None


def get_active_table():
    """Get the name of the most recently uploaded table."""
    return _active_table


def set_active_table(table_name: str):
    """Set the most recently uploaded table as the active table."""
    global _active_table
    _active_table = table_name
    print(f"✅ Active table set to: {table_name}")


def get_last_context():
    """Get the last query results for follow-up analytics."""
    return {
        "question": _last_question,
        "sql": _last_sql,
        "results": _last_results,
        "table": _active_table,
    }


def set_last_context(question: str, sql: str, results: list):
    """Store the last query context for follow-up analytics."""
    global _last_question, _last_sql, _last_results
    _last_question = question
    _last_sql = sql
    # Store max 20 rows to keep LLM context fast (prevents timeout)
    _last_results = results[:20] if results else None
    _total_row_count = len(results) if results else 0
    print(f"📝 Context saved: {len(results) if results else 0} rows")


def clear_context():
    """Clear conversation context (on new upload)."""
    global _last_question, _last_sql, _last_results
    _last_question = None
    _last_sql = None
    _last_results = None
