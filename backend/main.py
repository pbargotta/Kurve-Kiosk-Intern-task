from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .database import engine, Base, create_tables, get_db, AsyncSessionLocal
from . import models

# Lifespan context manager for startup/shutdown events
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Startup
  print("Application startup: Creating database tables if they don't exist")
  async with engine.begin() as conn:
    # Ensure all models are imported so Base.metadata knows about them
    #  models.Customer is alraedy imported via 'from . import models'
    await conn.run_sync(Base.metadata.create_all)
  print("Database tables checked/created")
  yield
  # Shutdown
  print("Application shutdown")
  await engine.dispose() # Properly close the engine's connection pool


# Create FastAPI app with lifespan context manager
app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
  return {"message": "Hello World!"}

# Endpoint to test database connection
@app.get("/api/test-db")
async def test_db_connection(db: AsyncSession = Depends(get_db)):
  try:
    result = await db.execute(models.Customer.__table__.select().limit(1))
    _ = result.scalars().first() # Fetch one row
    return {"status": "successful"}
  except Exception as e:
    return {"status": "failed", "error": str(e)}