from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import os

# Load environment variables from .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)
DATABASE_URL = os.getenv("DATABASE_URL")

# Create an asynchronous engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a base class for declarative models
Base = declarative_base()

# Create a sessionmaker for creating AsyncSession instances
AsyncSessionLocal = async_sessionmaker(
  bind=engine,
  expire_on_commit=False
)

# Dependency to get a DB session
async def get_db():
  async with AsyncSessionLocal() as session:
    yield session

# Function to create database tables
async def create_tables():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)