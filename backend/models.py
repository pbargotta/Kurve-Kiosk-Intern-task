from sqlalchemy import Column, Integer, String
from .database import Base

class Customer(Base):
  __tablename__ = "customers"

  # Define the table structure
  id = Column(Integer, primary_key=True, index=True, autoincrement=True)
  name = Column(String(255), index=True, nullable=False) 
  age = Column(Integer, nullable=False)
  email = Column(String(255), unique=True, index=True, nullable=False) 