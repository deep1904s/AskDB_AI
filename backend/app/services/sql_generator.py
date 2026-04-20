import requests
import re
import os
from app.services.cache import get_cache, set_cache

OLLAMA_URL = os.getenv("OLLAMA_URL")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5-coder:3b")


# -------------------------------
# 🔍 Extract SQL safely
# -------------------------------
def extract_sql(text):
    text = text.replace("```sql", "").replace("```", "").strip()
    text = text.replace("SQL:", "").replace("sql:", "").strip()

    # Handle CTE (WITH queries)
    if text.lower().startswith("with"):
        if not text.endswith(";"):
            text += ";"
        return text

    # fallback SELECT
    match = re.search(r"(SELECT .*?;)", text, re.IGNORECASE | re.DOTALL)

    if match:
        return match.group(1).strip()

    if "SELECT" in text:
        return text[text.find("SELECT"):].strip()

    return text.strip()


# -------------------------------
# 🛡️ SQL Safety Validator
# -------------------------------
def validate_sql(query):
    forbidden = ["drop", "delete", "update", "insert", "alter", "truncate"]

    q = query.lower()
    for word in forbidden:
        if word in q:
            raise Exception("❌ Dangerous query blocked!")

    return query


# -------------------------------
# 🧠 Schema Guard
# -------------------------------
def enforce_schema(sql_query, schema, table_name):
    columns = [col.strip().split()[0] for col in schema.split(",")]

    allowed_keywords = [
        "select", "from", "where", "and", "or", "join", "on",
        "group", "by", "order", "limit", "with", "as", "over",
        "partition", "row_number", "min", "max", "avg", "sum",
        "count", "distinct", "desc", "asc", "between", "like",
        "in", "not", "null", "is", "case", "when", "then", "else",
        "end", "having", "offset", "cast", "coalesce", "upper",
        "lower", "trim", "length", "substring", "concat", "round",
        "date", "extract", "year", "month", "day", "now", "current_date",
        "inner", "left", "right", "outer", "cross", "full", "union",
        "all", "exists", "any", "true", "false"
    ]

    tokens = re.findall(r"\b[a-zA-Z_]+\b", sql_query)

    for word in tokens:
        if word.lower() in allowed_keywords:
            continue
        if word.lower() == table_name.lower():
            continue
        if word not in columns:
            print(f"⚠️ Possible invalid column detected: {word}")

    return sql_query


# -------------------------------
# 🧠 Generate SQL (DYNAMIC TABLE)
# -------------------------------
def generate_sql(question, schema, table_name):

    # Cache key includes table name so different tables don't share cached queries
    cache_key = f"{table_name}:{question}"

    # ⚡ REDIS CACHE CHECK
    cached = get_cache(cache_key)
    if cached:
        print("⚡ Redis cache hit")
        return cached

    # 🔥 DYNAMIC PROMPT — uses actual table name and schema
    prompt = f"""
You are an expert PostgreSQL SQL generator.

STRICT RULES:
- Return ONLY SQL query
- No explanation
- No markdown
- Use ONLY column names from schema
- DO NOT invent column names
- Column names are case-sensitive
- The table name is exactly: {table_name}

Table:
{table_name}({schema})

IMPORTANT:
- Use EXACT column names from schema
- The table to query is: {table_name}
- Detect date columns automatically
- For "first hire" → use MIN(date_column)
- For "top N" → use ORDER BY + LIMIT
- For "top N per group" → use ROW_NUMBER()
- For "show all records" → use SELECT * FROM {table_name}

Question:
{question}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )

        if response.status_code != 200:
            raise Exception("LLM API error")

        raw_output = response.json().get("response", "")

        print(f"🧠 RAW OUTPUT (table: {table_name}):\n", raw_output)

        # 🔍 Extract SQL
        sql_query = extract_sql(raw_output)

        # 🛡️ Validate SQL
        sql_query = validate_sql(sql_query)

        # 🔥 Schema enforcement
        sql_query = enforce_schema(sql_query, schema, table_name)

        print(f"🧠 FINAL SQL (table: {table_name}):\n", sql_query)

        # ⚡ STORE IN REDIS
        set_cache(cache_key, sql_query)

        return sql_query

    except Exception as e:
        print("❌ SQL GENERATION ERROR:", e)
        return f"ERROR: {str(e)}"