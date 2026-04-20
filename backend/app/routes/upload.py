from fastapi import APIRouter, UploadFile, File
import pandas as pd
from app.database import engine
from app.services.active_table import set_active_table, clear_context
from app.services.cache import clear_cache

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file, encoding="latin1")

        # Clean column names
        df.columns = df.columns.str.strip().str.lower()

        # Table name from file
        table_name = file.filename.split(".")[0].lower().replace(" ", "_").replace("-", "_")

        # Store in PostgreSQL (replaces if table already exists)
        df.to_sql(table_name, con=engine, if_exists="replace", index=False)

        # Set this as the active table for queries
        set_active_table(table_name)

        # Clear Redis cache so old queries don't return stale results
        clear_cache()

        # Clear conversation context (old results no longer relevant)
        clear_context()

        print(f"✅ Uploaded '{file.filename}' → table '{table_name}' ({len(df)} rows, {len(df.columns)} columns)")

        return {
            "message": "Upload successful",
            "table": table_name,
            "columns": list(df.columns),
            "row_count": len(df)
        }

    except Exception as e:
        print(f"❌ Upload error: {e}")
        return {"error": str(e)}