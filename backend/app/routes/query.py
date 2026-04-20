from fastapi import APIRouter, Form
from sqlalchemy import text
from app.database import engine
from app.services.sql_generator import generate_sql
from app.services.schema_service import get_schema_for_table
from app.services.active_table import get_active_table, set_last_context, get_last_context
from app.services.chat_service import (
    classify_intent,
    generate_chat_response,
    generate_analytics_response,
    generate_result_explanation,
)
from fastapi import Request
from app.core.limiter import limiter

router = APIRouter()

@router.post("/ask")
@limiter.limit("5/minute")
async def ask(request: Request, question: str = Form(...)):
    try:
        # Check if we have previous results for context-aware classification
        last_context = get_last_context()
        has_previous = last_context.get("results") is not None

        # Step 1: Classify intent (context-aware)
        intent = classify_intent(question, has_previous_results=has_previous)
        print(f"🎯 Intent: {intent} | Has context: {has_previous} | Q: {question}")

        # ── GENERAL CHAT ──
        if intent == "general_chat":
            chat_response = generate_chat_response(question)
            return {
                "question": question,
                "intent": "general_chat",
                "response": chat_response,
                "sql_query": None,
                "results": None
            }

        # ── FOLLOW-UP ANALYTICS ──
        if intent == "follow_up_analytics":
            analytics_response = generate_analytics_response(question, last_context)
            return {
                "question": question,
                "intent": "follow_up_analytics",
                "response": analytics_response,
                "sql_query": None,
                "results": None
            }

        # ── DATA QUERY ──
        active_table = get_active_table()

        if not active_table:
            return {
                "question": question,
                "intent": "data_query",
                "response": "No dataset uploaded yet. Please upload a CSV file first using the sidebar, then ask your question again.",
                "sql_query": None,
                "results": None
            }

        schema = get_schema_for_table(active_table)

        if not schema:
            return {
                "question": question,
                "intent": "data_query",
                "response": f"Table '{active_table}' not found. Please re-upload your CSV.",
                "sql_query": None,
                "results": None
            }

        # Generate SQL
        sql_query = generate_sql(question, schema, active_table)

        if sql_query.startswith("ERROR:"):
            return {
                "question": question,
                "intent": "data_query",
                "response": "Sorry, I couldn't generate SQL for that. Could you rephrase?",
                "sql_query": None,
                "results": None
            }

        # Safety check
        if any(word in sql_query.lower() for word in ["drop", "delete", "truncate", "alter", "insert", "update"]):
            return {
                "question": question,
                "intent": "data_query",
                "response": "That query was blocked for safety. I can only run SELECT queries.",
                "sql_query": None,
                "results": None
            }

        # Execute query
        with engine.connect() as conn:
            result = conn.execute(text(sql_query))
            rows = [dict(row._mapping) for row in result]

        # Save context for follow-up questions
        set_last_context(question, sql_query, rows)

        # Generate explanation alongside results
        explanation = generate_result_explanation(question, sql_query, rows, active_table)

        return {
            "question": question,
            "intent": "data_query",
            "response": explanation,
            "sql_query": sql_query,
            "results": rows,
            "table": active_table
        }

    except Exception as e:
        print(f"❌ Query error: {e}")
        return {
            "question": question,
            "intent": "error",
            "response": f"Something went wrong: {str(e)}",
            "sql_query": None,
            "results": None
        }