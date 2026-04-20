from fastapi import APIRouter, Form
from sqlalchemy import text
from app.database import engine
from app.services.sql_generator import generate_sql
from app.services.schema_service import get_schema_for_table
from app.services.active_table import get_active_table, set_last_context, get_last_context
from app.services.chat_service import classify_intent, generate_chat_response, generate_analytics_response
from fastapi import Request
from app.core.limiter import limiter

router = APIRouter()

@router.post("/ask")
@limiter.limit("5/minute")
async def ask(request: Request, question: str = Form(...)):
    try:
        # Step 1: Classify intent
        intent = classify_intent(question)
        print(f"🎯 Intent: {intent} | Question: {question}")

        # Step 2: Handle general chat
        if intent == "general_chat":
            chat_response = generate_chat_response(question)
            return {
                "question": question,
                "intent": "general_chat",
                "response": chat_response,
                "sql_query": None,
                "results": None
            }
            
        # Step 3: Handle follow-up analytics
        if intent == "follow_up_analytics":
            context = get_last_context()
            analytics_response = generate_analytics_response(question, context)
            return {
                "question": question,
                "intent": "follow_up_analytics",
                "response": analytics_response,
                "sql_query": None,
                "results": None
            }

        # Step 4: Handle data query
        active_table = get_active_table()

        if not active_table:
            return {
                "question": question,
                "intent": "data_query",
                "response": "No dataset uploaded yet. Please upload a CSV file first using the sidebar, then ask your question again.",
                "sql_query": None,
                "results": None
            }

        # Get schema for the active table only
        schema = get_schema_for_table(active_table)

        if not schema:
            return {
                "question": question,
                "intent": "data_query",
                "response": f"Table '{active_table}' not found in database. Please re-upload your CSV.",
                "sql_query": None,
                "results": None
            }

        # Generate SQL using the active table name and its schema
        sql_query = generate_sql(question, schema, active_table)

        # Check for generation errors
        if sql_query.startswith("ERROR:"):
            return {
                "question": question,
                "intent": "data_query",
                "response": "Sorry, I had trouble generating SQL for that question. Could you rephrase it?",
                "sql_query": None,
                "results": None
            }

        # Safety check
        if any(word in sql_query.lower() for word in ["drop", "delete", "truncate"]):
            return {
                "question": question,
                "intent": "data_query",
                "response": "That query was blocked for safety reasons. I can only run SELECT queries.",
                "sql_query": None,
                "results": None
            }

        with engine.connect() as conn:
            result = conn.execute(text(sql_query))
            rows = [dict(row._mapping) for row in result]
            
        # Save context for follow-up analytics
        set_last_context(question, sql_query, rows)

        return {
            "question": question,
            "intent": "data_query",
            "response": f"Here are the results from your '{active_table}' dataset:",
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