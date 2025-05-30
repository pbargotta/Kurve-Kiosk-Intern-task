from fastapi import FastAPI, Depends, HTTPException, status, Query 
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from typing import List

from .database import engine, Base, get_db
from . import models, schemas, crud
from .dev_util import populate_database, clear_database

@asynccontextmanager
# This code runs ONCE when the application starts up
async def lifespan(app: FastAPI):
  print("Application startup: Creating database tables if they don't exist.")
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
  print("Database tables checked/created.")
  
  yield # The application runs while the lifespan context manager is "yielded"

  # This code runs ONCE when the application is shutting down
  print("Application shutdown.")
  await engine.dispose()

# FastAPI application instance
app = FastAPI(
  lifespan=lifespan,
  title="Kurve Kiosk Customer API"
)

# CORS Middleware setup
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True, 
  allow_methods=["*"],
  allow_headers=["*"],
)

# ---- Root Endpoint ---- #
@app.get("/")
async def root():
  return {"message": "Hello World!"}

# ---- Customer CRUD Endpoints ---- #

# CREATE Customer
@app.post("/api/customers/", response_model=schemas.Customer, status_code=status.HTTP_201_CREATED, tags=["Customers"])
async def create_new_customer(customer: schemas.CustomerCreate, db: AsyncSession = Depends(get_db)):
  """
  Create a new customer
  - **name**: Customer's name (required)
  - **age**: Customer's age (required, must be > 0)
  - **email**: Customer's email address (required, must be unique)
  """
  customer_by_email = await crud.get_customer_by_email(db, email=customer.email)
  if customer_by_email:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
  return await crud.create_customer(db=db, customer=customer)

# GET ALL Customers 
@app.get("/api/customers/", response_model=schemas.PaginatedCustomerResponse, tags=["Customers"])
async def get_customers_list(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100), db: AsyncSession = Depends(get_db)):
  """
  Retrieve a paginated list of customers.
  - **skip**: Number of records to skip (for pagination).
  - **limit**: Maximum number of records to return (for pagination).
  """
  customers = await crud.get_customers(db, skip=skip, limit=limit)
  return customers

# GET SINGLE Customer by ID
@app.get("/api/customers/{customer_id}", response_model=schemas.Customer, tags=["Customers"])
async def get_single_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
  """
  Retrieve a single customer by their ID
  """
  customer = await crud.get_customer(db, customer_id=customer_id)
  if customer is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
  return customer

# UPDATE Customer
@app.put("/api/customers/{customer_id}", response_model=schemas.Customer, tags=["Customers"])
async def update_existing_customer(customer_id: int, customer_update: schemas.CustomerUpdate, db: AsyncSession = Depends(get_db)):
  """
  Update an existing customer by their ID
  Allows partial updates (fields not provided will not be changed)
  Checks if the new email (if provided) is already in use by another customer
  """
  # Check if the customer exists
  existing_customer = await crud.get_customer(db, customer_id=customer_id)
  if existing_customer is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

  # If email is being updated, check if the new email is already taken by another user
  if customer_update.email and customer_update.email != existing_customer.email:
    customer_with_new_email = await crud.get_customer_by_email(db, email=customer_update.email)
    if customer_with_new_email and customer_with_new_email.id != customer_id:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New email already registered by another customer")

  # Proceed with the update
  updated_customer = await crud.update_customer(db=db, customer_id=customer_id, customer_update=customer_update)
  return updated_customer

# DELETE Customer
@app.delete("/api/customers/{customer_id}", response_model=schemas.Customer, tags=["Customers"])
async def delete_existing_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
  """
  Delete a customer by their ID
  """
  deleted_customer = await crud.delete_customer(db, customer_id=customer_id)
  if deleted_customer is None:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
  return deleted_customer


# ---- Populate database with up to 50,000 records to assess performance ---- #
@app.post("/api/dev/populate-db", 
          status_code=status.HTTP_200_OK, 
          tags=["Development"])
async def populate_db(
  num_records: int = Query(10000, ge=1, le=50000) # Max 50,000 for performance testing
):
  """
  Populates the database with a specified number of test customer records
  - **num_records**: Number of customer records to generate (default 10000).

  **Note:** This is a utility endpoint for development and testing. 
  Depending on `num_records`, this operation can take some time.
  """
  message = await populate_database(num_records=num_records)
  print(f"Population process finished. Message: {message}")

  if "failed" in message.lower() or "error" in message.lower():
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)
  
  return {"message": message}

# ---- Clear all customer records from the database ---- #
@app.post("/api/dev/clear-db",
        status_code=status.HTTP_200_OK,
        tags=["Developer Utilities"])
async def clear_db():
  """
  Clears all customer records from the database by truncating the 'customers' table.

  **Warning:** This operation is irreversible and will delete all customer data.
  Use with caution, primarily for development and testing purposes.
  """
  message = await clear_database()
  print(f"Clear customers process finished. Message: {message}")

  if "failed" in message.lower() or "error" in message.lower():
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)
  
  return {"message": message}