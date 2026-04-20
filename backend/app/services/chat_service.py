import requests
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5-coder:3b")


def classify_intent(question: str, has_previous_results: bool = False) -> str:
    """
    Classify user intent. Priority order:
    1. general_chat — greetings, meta questions
    2. follow_up_analytics — references previous results (only if results exist)
    3. data_query — asks for data from the database
    """
    q = question.strip().lower()

    # ── 1. EXACT CHAT MATCHES (greetings, short phrases) ──
    chat_exact = [
        "hi", "hello", "hey", "yo", "sup", "hii", "hiii",
        "how are you", "how are you?", "what's up", "whats up",
        "good morning", "good evening", "good night", "good afternoon",
        "thanks", "thank you", "thank u", "thx",
        "bye", "goodbye", "see you", "see ya",
        "what can you do", "who are you", "what is askdb",
        "how do you work", "how does this work",
        "nice", "cool", "great", "awesome", "okay", "ok", "sure",
        "help", "help me", "please help", "can you help",
    ]
    stripped = q.rstrip("?!., ")
    if stripped in chat_exact:
        return "general_chat"

    # ── 2. GENERAL KNOWLEDGE / EXPLANATION (not about data) ──
    general_knowledge_patterns = [
        "what is sql", "what is a database", "what is csv",
        "explain sql", "explain database", "explain csv",
        "what is postgres", "what is postgresql",
        "how does sql work", "what are joins",
        "what is a primary key", "what is a foreign key",
        "tell me about sql", "tell me about databases",
        "what is an api", "what is rest api",
    ]
    for pattern in general_knowledge_patterns:
        if pattern in q:
            return "general_chat"

    # ── 3. FOLLOW-UP ANALYTICS (only if previous results exist) ──
    if has_previous_results:
        follow_up_phrases = [
            "summarize", "summary", "summarise",
            "analyze this", "analyze these", "analyse",
            "explain this", "explain these", "explain the result",
            "what does this mean", "what do these mean",
            "infer", "inference", "insight", "insights",
            "based on this", "based on these", "based on the above",
            "based on above", "based on the result", "based on results",
            "from the above", "from above", "from these results",
            "from the result", "from this data", "from this output",
            "above result", "above data", "above output",
            "the result", "these results", "this result",
            "previous result", "previous data", "previous output",
            "can you tell me more", "tell me more",
            "what can you say", "what do you think",
            "which is better", "which is best", "which is highest",
            "which one should", "suitable for me", "recommend",
            "conclusion", "conclude", "wrap up",
            "pattern", "observation", "notable",
            "interpret", "interpretation",
        ]
        for phrase in follow_up_phrases:
            if phrase in q:
                return "follow_up_analytics"

        # Short follow-up references
        if len(q.split()) <= 6 and any(w in q for w in [
            "why", "how", "elaborate", "more", "detail", "meaning"
        ]):
            return "follow_up_analytics"

    # ── 4. DATA QUERY (asks for database data) ──
    data_phrases = [
        "show me", "show all", "list all", "list the", "get all", "get me",
        "find all", "find the", "fetch", "display",
        "select", "count", "average", "avg ", "total",
        "how many", "how much",
        "group by", "order by", "sort by",
        "top ", "bottom ", "first ", "last ",
        "highest", "lowest", "most", "least",
        "above ", "below ", "greater than", "less than",
        "between", "records", "rows",
        "give me", "what is the", "what are the",
        "who has", "who is", "which",
        "where ", "filter",
    ]
    for phrase in data_phrases:
        if phrase in q:
            return "data_query"

    # ── 5. FALLBACK ──
    word_count = len(q.split())
    if word_count <= 3:
        return "general_chat"

    # If previous results exist and nothing else matched, lean towards follow-up
    if has_previous_results and word_count <= 10:
        return "follow_up_analytics"

    return "data_query"


def generate_chat_response(question: str) -> str:
    """General conversational response."""
    prompt = f"""You are AskDB, a friendly AI-powered database assistant.

Rules:
- Keep it concise (2-3 sentences).
- Do NOT mention any model names, architectures, or technical details about yourself.
- You are simply "AskDB" — an AI database assistant.
- If greeted, greet back and offer to help with data.
- If asked what you can do: "Upload CSV files, ask questions in plain English, get SQL queries and results."
- If asked about SQL/databases, explain clearly and briefly.
- Do NOT generate SQL here.
- Do NOT use code blocks.

User: {question}

AskDB:"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=15
        )
        if response.status_code == 200:
            raw = response.json().get("response", "").strip()
            if raw:
                raw = raw.replace("```", "").strip()
                lines = [l.strip() for l in raw.split("\n") if l.strip()]
                return " ".join(lines[:4])
    except Exception as e:
        print(f"⚠️ Chat error: {e}")

    return _fallback_chat(question)


def generate_analytics_response(question: str, context: dict) -> str:
    """Analyze previous query results and respond conversationally."""
    if not context or not context.get("results"):
        return "I don't have any previous results to analyze. Please run a data query first, then ask me to analyze it."

    # Only send first 15 rows to LLM to prevent timeout
    limited_results = context["results"][:15]
    total_rows = len(context["results"])
    results_json = json.dumps(limited_results, indent=2, default=str)
    prev_question = context.get("question", "unknown")
    prev_sql = context.get("sql", "unknown")

    prompt = f"""You are AskDB, an expert data analyst AI assistant.

The user previously asked: "{prev_question}"
The SQL executed was: {prev_sql}
The query returned {total_rows} total rows. Here is a sample (first 15 rows):
{results_json}

Now the user asks: "{question}"

Rules:
- Analyze the data above and answer the user's follow-up question.
- Reference specific values, rows, and patterns from the data.
- Be insightful and analytical.
- Do NOT generate new SQL queries.
- Do NOT use code blocks.
- Do NOT reveal any model name or architecture.
- You are simply "AskDB".
- Keep the response focused and under 200 words.

AskDB:"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=60
        )
        if response.status_code == 200:
            raw = response.json().get("response", "").strip()
            if raw:
                return raw.replace("```", "").strip()
    except Exception as e:
        print(f"⚠️ Analytics error: {e}")

    return "Sorry, I had trouble analyzing those results. Could you rephrase your question?"


def generate_result_explanation(question: str, sql: str, results: list, table_name: str) -> str:
    """Generate a detailed explanation alongside SQL results."""
    if not results:
        return f"The query returned no results from the '{table_name}' table. Try rephrasing your question or checking the column names."

    # Send first 10 rows for a richer explanation
    results_preview = json.dumps(results[:10], indent=2, default=str)
    row_count = len(results)
    columns = list(results[0].keys()) if results else []

    prompt = f"""You are AskDB, an expert data analyst assistant.

The user asked: "{question}"
SQL executed: {sql}
Table: {table_name}
Columns: {', '.join(columns)}
Total rows returned: {row_count}
Sample data (first 10 rows):
{results_preview}

Write a detailed explanation of these results. Include:
1. A summary of what the query found (mention specific numbers/values)
2. Key patterns or observations from the data
3. Any notable insights

Rules:
- Be specific — reference actual values from the data
- Keep it 3-5 sentences
- Do NOT use code blocks or markdown
- Do NOT mention any model name
- Speak as "AskDB"

AskDB:"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=45
        )
        if response.status_code == 200:
            raw = response.json().get("response", "").strip()
            if raw:
                raw = raw.replace("```", "").strip()
                # Keep up to 6 lines of explanation
                lines = [l.strip() for l in raw.split("\n") if l.strip()]
                return " ".join(lines[:6])
    except Exception as e:
        print(f"⚠️ Explanation error: {e}")

    # Fallback: generate a basic explanation without LLM
    return _generate_basic_explanation(question, results, row_count, table_name, columns)


def _fallback_chat(question: str) -> str:
    q = question.strip().lower()
    if any(w in q for w in ["hi", "hello", "hey"]):
        return "Hey there! 👋 I'm AskDB, your AI database assistant. Upload a CSV and ask me anything about your data!"
    if any(w in q for w in ["how are you", "what's up"]):
        return "Doing great! Ready to help you with your data. 📊"
    if any(w in q for w in ["what can you do", "help", "who are you"]):
        return "I'm AskDB — upload a CSV, ask questions in plain English, and I'll generate SQL and return results instantly! ⚡"
    if any(w in q for w in ["thanks", "thank you"]):
        return "You're welcome! Happy to help with your data! 😊"
    if any(w in q for w in ["bye", "goodbye"]):
        return "Goodbye! Come back anytime. 👋"
    return "I'm AskDB, your AI database assistant. Upload a CSV and ask me anything about your data in plain English!"


def _generate_basic_explanation(question: str, results: list, row_count: int, table_name: str, columns: list) -> str:
    """Generate a basic explanation without LLM (fallback when LLM times out)."""
    parts = [f"Query returned {row_count} row{'s' if row_count != 1 else ''} from the '{table_name}' table."]

    # Try to find numeric columns and provide basic stats
    if results and len(results) > 0:
        sample = results[0]
        numeric_cols = []
        for col, val in sample.items():
            if isinstance(val, (int, float)):
                numeric_cols.append(col)

        if numeric_cols:
            col = numeric_cols[0]
            values = [r[col] for r in results if r.get(col) is not None and isinstance(r[col], (int, float))]
            if values:
                parts.append(f"The '{col}' values range from {min(values):,.2f} to {max(values):,.2f} (avg: {sum(values)/len(values):,.2f}).")

        parts.append(f"Columns returned: {', '.join(columns[:6])}{'...' if len(columns) > 6 else ''}.")

    return " ".join(parts)
