import redis

# Connect Redis
r = redis.Redis(host='localhost', port=6379, db=0)

def get_cache(key):
    value = r.get(key)
    if value:
        return value.decode()
    return None

def set_cache(key, value):
    r.set(key, value, ex=300)  # expire in 5 min

def clear_cache():
    """Clear all cached queries — called when a new dataset is uploaded."""
    try:
        r.flushdb()
        print("🗑️ Redis cache cleared")
    except Exception as e:
        print(f"⚠️ Failed to clear Redis cache: {e}")