import asyncio
from faker import Faker
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .database import AsyncSessionLocal, engine, Base
from .models import Customer
from .crud import get_customer_count

fake = Faker()

async def _populate_customer_data(db: AsyncSession, num_records: int = 10000):
  """
  Internal helper to populate customer data
  """
  print(f"Starting to populate {num_records} customer records...")
  generated_emails = set()
  customers_to_add = []

  # Get existing emails to avoid collision
  existing_emails_result = await db.execute(select(Customer.email))
  existing_emails_in_db = set(existing_emails_result.scalars().all())
  generated_emails.update(existing_emails_in_db)

  for i in range(num_records):
    attempts = 0
    while attempts < num_records * 2 : # Safety break for too many collisions
      name = fake.name()
      email = fake.unique.email()
      age = fake.random_int(min=18, max=80)
      
      if email not in generated_emails:
        generated_emails.add(email)
        customers_to_add.append(Customer(name=name, email=email, age=age))
        break
      attempts += 1
    else: # If while loop finishes due to attempts limit - this might happen if num_records is very large relative to email domain space with Faker's unique
      print(f"Warning: Could not generate a unique email after {attempts} attempts for record {i+1}. Skipping this record.")

    if not customers_to_add:
      print("No new unique customer records were generated to add.")
      return 0
  try:
    db.add_all(customers_to_add)
    await db.commit()
    print(f"Successfully added {len(customers_to_add)} new customer records.")
    return len(customers_to_add)
  except Exception as e:
    await db.rollback()
    print(f"Error during bulk insert: {e}. No records were added in this batch.")
    raise Exception(f"Bulk insert failed: {e}") from e

async def populate_database(num_records: int):
  """
  Main logic to populate database
  """
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)

  async with AsyncSessionLocal() as db:
    initial_count = await get_customer_count(db)
    print(f"Attempting to add {num_records} new records. Current count: {initial_count}.")
    try:
      added_count = await _populate_customer_data(db, num_records)
      if added_count == 0 and num_records > 0:
        return f"Attempted to add {num_records} records, but {added_count} new unique records were generated/added. This might be due to email collisions or reaching generation limits. Initial count: {initial_count}. New total: {await get_customer_count(db)}"    
      return f"Successfully added {added_count} new records. Initial count: {initial_count}. New total: {await get_customer_count(db)}"
    except Exception as e:
      return f"Adding records failed: {str(e)}. Initial count: {initial_count}. Current total: {await get_customer_count(db)}"

async def clear_database():
  """
  Clears all data from the customers table
  Uses TRUNCATE for efficiency and to reset auto-increment
  """
  async with AsyncSessionLocal() as db:
    async with db.begin(): 
      try:
        await db.execute(text("TRUNCATE TABLE customers"))
        await db.commit()
        return f"Successfully truncated the 'customers' table."
      except Exception as e:
        await db.rollback()
        return f"Failed to truncate 'customers' table: {str(e)}"