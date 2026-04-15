from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# 🔥 RATE LIMIT IMPORTS
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from app.core.limiter import limiter
from app.routes.upload import router as upload_router
from app.routes.query import router as query_router

app = FastAPI()

# 🔥 CREATE LIMITER

# 🔥 ATTACH LIMITER TO APP
app.state.limiter = limiter

# 🔥 ADD MIDDLEWARE
app.add_middleware(SlowAPIMiddleware)

# 🔥 HANDLE RATE LIMIT ERROR CLEANLY
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"error": "🚫 Too many requests. Please slow down."}
    )

# 🌐 CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 ROUTES
app.include_router(upload_router)
app.include_router(query_router)

# 🏠 ROOT
@app.get("/")
def home():
    return {"message": "Backend running 🚀"}