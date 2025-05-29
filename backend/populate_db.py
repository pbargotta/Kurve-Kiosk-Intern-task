import asyncio
from faker import Faker
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import AsyncSessionLocal, engine, Base
from .models import Customer

fake = Faker()

async def get_customer_count(db: AsyncSession) -> int:
  result = await db.execute(select(Customer))
  return len(result.scalars().all())

async def _populate_customer_data(db: AsyncSession, num_records: int = 10000):
  """Internal helper to populate customer data"""
  print(f"Starting to populate {num_records} customer records...")
  generated_emails = set()
  customers_to_add = []

  for i in range(num_records):
      while True:
        name = fake.name()
        email = fake.unique.email() 
        age = fake.random_int(min=18, max=80)
        
        if email not in generated_emails:
          generated_emails.add(email)
          customers_to_add.append(Customer(name=name, email=email, age=age))
          break
      
      if (i + 1) % 1000 == 0:
        print(f"Generated {i + 1}/{num_records} records for batch insertion...")

  try:
    db.add_all(customers_to_add)
    await db.commit()
    print(f"Successfully added {len(customers_to_add)} new customer records.")
    return len(customers_to_add)
  except Exception as e:
    await db.rollback()
    print(f"Error during bulk insert: {e}. No records were added in this batch.")
    raise Exception(f"Bulk insert failed: {e}") from e

async def populate_database(num_records: int, force: bool):
  """
  Main logic to populate database.
  Ensures tables are created, checks current count, and populates if conditions met.
  Returns a status message.
  """
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)

  async with AsyncSessionLocal() as db:
    current_count = await get_customer_count(db)
    
    if current_count == 0 or force:
      if force and current_count > 0:
        message_prefix = f"Forcing data population. Current count: {current_count}."
      else:
        message_prefix = "Database is empty. Populating data."

      print(message_prefix)
      try:
        added_count = await _populate_customer_data(db, num_records)
        return f"{message_prefix} Successfully added {added_count} records. New total: {await get_customer_count(db)}"
      except Exception as e:
        return f"{message_prefix} Populatuing failed: {str(e)}"
    else:
      return f"Database is not empty (found {current_count} customers). Populating skipped. Use 'force=true' to override."