import requests
import re
import os
from app.services.cache import get_cache, set_cache

OLLAMA_URL = os.getenv("OLLAMA_URL")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5-coder:3b")


# -------------------------------
# 🔍 Extract SQL safely (FIXED)
# -------------------------------
def extract_sql(text):
    text = text.replace("```sql", "").replace("```", "").strip()
    text = text.replace("SQL:", "").replace("sql:", "").strip()

    # 🔥 HANDLE CTE (WITH queries)
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
# 🧠 Schema Guard (NEW 🔥)
# -------------------------------
def enforce_schema(sql_query, schema):
    columns = [col.strip().split()[0] for col in schema.split(",")]

    allowed_keywords = [
        "select", "from", "where", "and", "or", "join", "on",
        "group", "by", "order", "limit", "with", "as", "over",
        "partition", "row_number", "min", "max", "avg", "sum"
    ]

    tokens = re.findall(r"\b[a-zA-Z_]+\b", sql_query)

    for word in tokens:
        if word.lower() in allowed_keywords:
            continue
        if word not in columns and word != "employee_records":
            print(f"⚠️ Possible invalid column detected: {word}")

    return sql_query


# -------------------------------
# 🧠 Generate SQL
# -------------------------------
def generate_sql(question, schema):

    # ⚡ REDIS CACHE CHECK
    cached = get_cache(question)
    if cached:
        print("⚡ Redis cache hit")
        return cached

    # 🔥 IMPROVED PROMPT (DYNAMIC + STRICT)
    prompt = f"""
You are an expert PostgreSQL SQL generator.

STRICT RULES:
- Return ONLY SQL query
- No explanation
- No markdown
- Use ONLY column names from schema
- DO NOT invent column names
- Column names are case-sensitive

Table:
employee_records({schema})

IMPORTANT:
- Use EXACT column names from schema
- Detect date columns automatically
- For "first hire" → use MIN(date_column)
- For "top N" → use ORDER BY + LIMIT
- For "top N per group" → use ROW_NUMBER()

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

        print("🧠 RAW OUTPUT:\n", raw_output)

        # 🔍 Extract SQL
        sql_query = extract_sql(raw_output)

        # 🛡️ Validate SQL
        sql_query = validate_sql(sql_query)

        # 🔥 Schema enforcement
        sql_query = enforce_schema(sql_query, schema)

        print("🧠 FINAL SQL:\n", sql_query)

        # ⚡ STORE IN REDIS
        set_cache(question, sql_query)

        return sql_query

    except Exception as e:
        print("❌ SQL GENERATION ERROR:", e)
        return f"ERROR: {str(e)}"