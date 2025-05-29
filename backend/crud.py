from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, func 
from typing import Optional, List

from . import models, schemas

# ---- READ ---- #
async def get_customer(db: AsyncSession, customer_id: int) -> Optional[models.Customer]:
  """
  Retrieve a single customer by their ID
  """
  query = select(models.Customer).filter(models.Customer.id == customer_id)
  result = await db.execute(query)
  return result.scalars().first()

async def get_customer_by_email(db: AsyncSession, email: str) -> Optional[models.Customer]:
  """
  Retrieve a single customer by their email
  """
  query = select(models.Customer).filter(models.Customer.email == email)
  result = await db.execute(query)
  return result.scalars().first()

async def get_customers(db: AsyncSession, skip: int=0, limit: int=100) -> schemas.PaginatedCustomerResponse:
  """
  Retrieve a list of customers
  """
  query = select(models.Customer).offset(skip).limit(limit)
  result = await db.execute(query)
  records = result.scalars().all()
  total = await get_customer_count(db)

  return schemas.PaginatedCustomerResponse(records=records, total=total, skip=skip, limit=limit)

async def get_customer_count(db: AsyncSession) -> int:
  """
  Retrieve the total count of customers in the database
  """
  query = select(func.count()).select_from(models.Customer)
  result = await db.execute(query)
  return result.scalar_one_or_none() or 0

# ---- CREATE ---- #
async def create_customer(db: AsyncSession, customer: schemas.CustomerCreate) -> models.Customer:
  """
  Create a new customer in the database
  """
  # Create a new Customer model instance
  customer = models.Customer(
    name=customer.name,
    email=customer.email,
    age=customer.age
  )

  # Commit the changes to the database
  db.add(customer)
  await db.commit()
  await db.refresh(customer)
  return customer

# ---- UPDATE ---- #
async def update_customer(db: AsyncSession, customer_id: int, customer_update: schemas.CustomerUpdate) -> Optional[models.Customer]:
  """
  Update an existing customer
  """
  # Fetch the customer to be updated
  customer = await get_customer(db, customer_id)
  if not customer:
    return None

  # Only update the fields that were actually provided in the request
  update_data = customer_update.model_dump(exclude_unset=True)
  # If no fields were provided, return the existing customer
  if not update_data:
    return customer

  # Update the customer attributes
  for key, value in update_data.items():
    setattr(customer, key, value)

  # Commit the changes to the database
  db.add(customer)
  await db.commit() 
  await db.refresh(customer) 
  return customer

# ---- DELETE ---- #
async def delete_customer(db: AsyncSession, customer_id: int) -> Optional[models.Customer]:
  """
  Delete a customer by their ID. Returns the deleted customer object or None if not found
  """
  # Fetch the customer to be deleted
  customer = await get_customer(db, customer_id)
  if not customer:
    return None

  # Delete the customer
  await db.delete(customer)
  await db.commit()
  return customer