from typing import List
from pydantic import BaseModel

# --- Pydantic Models ---
class OrderItem(BaseModel):
    id: str
    name: str
    qty: int
    price: float  # Changed from unitPrice

class Customer(BaseModel):
    name: str
    phone: str
    address: str
    notes: str

class Totals(BaseModel):
    subtotal: float
    delivery: float
    total: float  # Changed from grandTotal

class OrderRequest(BaseModel):
    items: List[OrderItem]
    customer: Customer
    totals: Totals
    