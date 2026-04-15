from fastapi import APIRouter, Form
from sqlalchemy import text
from app.database import engine
from app.services.sql_generator import generate_sql
from app.services.schema_service import get_schema
from fastapi import Request
from app.core.limiter import limiter
router = APIRouter()

@router.post("/ask")
@limiter.limit("5/minute")
async def ask(request: Request, question: str = Form(...)):
    try:
        schema = get_schema()

        sql_query = generate_sql(question, schema)

        # Safety check
        if any(word in sql_query.lower() for word in ["drop", "delete", "truncate"]):
            return {"error": "Dangerous query blocked"}

        with engine.connect() as conn:
            result = conn.execute(text(sql_query))
            rows = [dict(row._mapping) for row in result]

        return {
            "question": question,
            "sql_query": sql_query,
            "results": rows
        }

    except Exception as e:
        return {
            "error": str(e)
        }