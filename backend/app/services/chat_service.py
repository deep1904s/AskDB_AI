import requests
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen2.5-coder:3b")


def classify_intent(question: str) -> str:
    """
    Classify whether the user's question is a data query, general chat, or a follow-up analytical question.
    Returns: 'data_query', 'general_chat', or 'follow_up_analytics'
    """
    question_lower = question.strip().lower()

    # Keywords that suggest referring to previous results
    follow_up_keywords = [
        "above", "these results", "this result", "from the output", "from above",
        "based on", "infer", "analytics of", "analyze above", "analyze these",
        "what can you say about", "tell me about these", "explain these",
        "summarize these", "summarize above"
    ]

    # Quick keyword-based classification for obvious cases
    data_keywords = [
        "show", "list", "get", "find", "select", "count", "average", "avg",
        "sum", "total", "max", "min", "top", "bottom", "how many", "how much",
        "group by", "order by", "sort", "filter", "where", "between",
        "records", "rows", "data", "table", "column", "field",
        "revenue", "sales", "price", "salary", "amount", "quantity",
        "customer", "product", "order", "employee", "department",
        "highest", "lowest", "most", "least", "greater", "less", "equal",
        "query", "fetch", "display", "what is the", "what are the", "who has",
        "who is the", "which", "give me", "tell me about the data", "from the data",
        "in the database", "from the table", "from my data",
        "percentage", "ratio", "distribution" # analyze/compare moved to follow-up potentially, but leaving some here
    ]

    chat_keywords = [
        "hi", "hello", "hey", "how are you", "what's up", "good morning",
        "good evening", "good night", "thanks", "thank you", "bye",
        "goodbye", "what can you do", "who are you", "help me",
        "what is askdb", "how do you work", "how does this work",
        "nice", "cool", "great", "awesome", "okay", "ok", "sure",
        "please help", "can you help"
    ]

    # 1. Check for follow-up analytics
    for keyword in follow_up_keywords:
        if keyword in question_lower:
            return "follow_up_analytics"

    # 2. Check for exact chat matches first
    for keyword in chat_keywords:
        if question_lower == keyword or question_lower.rstrip("?!. ") == keyword:
            return "general_chat"

    # 3. Check for data keywords (generates SQL)
    for keyword in data_keywords:
        if keyword in question_lower:
            return "data_query"

    # If ambiguous, default to data_query if there's an active table
    # For very short messages (< 4 words) with no data keywords, treat as chat
    word_count = len(question_lower.split())
    if word_count <= 3:
        return "general_chat"

    # Default to data query for longer questions
    return "data_query"


def generate_analytics_response(question: str, context: dict) -> str:
    """
    Generate an analytical response based on the previous query results.
    """
    if not context or not context.get('results'):
        return "I don't have any previous results to analyze. Please ask a data query first, then ask me to analyze the results."

    # Convert results to a readable string format (max 50 rows to fit in context)
    results_str = json.dumps(context['results'], indent=2)
    last_query = context.get('question', 'Unknown')
    last_sql = context.get('sql', 'Unknown')

    prompt = f"""You are AskDB, an expert data analyst AI.
The user previously asked: "{last_query}"
I ran this SQL: {last_sql}
And got these results (up to 50 rows shown):
```json
{results_str}
```

Now, the user is asking a follow-up question based on these results:
User: {question}

Analyze the provided JSON results and answer the user's question directly.
Rules:
- Be concise but analytical.
- Refer to specific data points from the provided JSON results.
- Do NOT generate new SQL. Just analyze the data provided above.
- Do NOT output markdown code blocks unless showing a small snippet of data.
- Speak conversationally.
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
            return "Sorry, I had trouble analyzing those results."

        raw = response.json().get("response", "").strip()
        return raw if raw else "I couldn't draw any conclusions from those results."

    except Exception as e:
        print(f"⚠️ Analytics generation error: {e}")
        return "Sorry, there was an error trying to analyze those results."


def generate_chat_response(question: str) -> str:
    """
    Generate a general conversational response as an AI database assistant.
    """
    prompt = f"""You are AskDB, a friendly and helpful AI-powered database assistant.

Your personality:
- Professional yet friendly
- You specialize in helping users query and analyze their data
- You can answer general questions about yourself and your capabilities
- Keep responses concise (2-3 sentences max)
- You help users upload CSV files and ask questions about their data in plain English
- You convert natural language to SQL and return results

RULES:
- Do NOT generate SQL in this response
- Do NOT use markdown code blocks
- Respond naturally and conversationally
- If asked what you can do, mention: uploading CSV files, asking questions in English, getting SQL + results
- If greeted, greet back warmly and offer to help with data

User: {question}

AskDB:"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=15
        )

        if response.status_code != 200:
            return get_fallback_response(question)

        raw = response.json().get("response", "").strip()

        # Clean up the response
        if raw:
            # Remove any accidental SQL or code blocks
            raw = raw.replace("```", "").strip()
            # Take only first paragraph to keep it concise
            lines = [l.strip() for l in raw.split("\n") if l.strip()]
            return " ".join(lines[:3])

        return get_fallback_response(question)

    except Exception as e:
        print(f"⚠️ Chat generation error: {e}")
        return get_fallback_response(question)


def get_fallback_response(question: str) -> str:
    """Fallback responses when LLM is unavailable."""
    q = question.strip().lower()

    if any(w in q for w in ["hi", "hello", "hey"]):
        return "Hey there! 👋 I'm AskDB, your AI database assistant. Upload a CSV file and ask me anything about your data in plain English!"

    if any(w in q for w in ["how are you", "what's up"]):
        return "I'm doing great, thanks for asking! Ready to help you analyze your data. Got a CSV to explore? 📊"

    if any(w in q for w in ["what can you do", "help", "what is askdb", "who are you"]):
        return "I'm AskDB — I help you query databases using plain English. Just upload a CSV file, ask a question like 'Show me top 5 customers by revenue', and I'll generate the SQL and return the results instantly! ⚡"

    if any(w in q for w in ["thanks", "thank you"]):
        return "You're welcome! Let me know if you need anything else. Happy to help with your data! 😊"

    if any(w in q for w in ["bye", "goodbye"]):
        return "Goodbye! Come back anytime you need help with your data. 👋"

    return "I'm AskDB, your AI-powered database assistant. I can help you analyze data — just upload a CSV and ask questions in plain English! How can I help you today?"
