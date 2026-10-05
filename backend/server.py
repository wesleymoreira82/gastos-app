from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Conexão MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()

api_router = APIRouter(prefix="/api")

# --- MODELOS DE DADOS PARA DESPESAS ---
class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str
    amount: float
    categoryId: str
    date: str
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ExpenseCreate(BaseModel):
    id: Optional[str] = None
    description: str
    amount: float
    categoryId: str
    date: str
    createdAt: Optional[str] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    categoryId: Optional[str] = None
    date: Optional[str] = None

# --- ROTAS DA API ---

@api_router.get("/")
async def root():
    return {"message": "API de Gastos Online"}

# 1. Listar todas as despesas
@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses():
    expenses = await db.expenses.find().to_list(1000)
    return [Expense(**e) for e in expenses]

# 2. Criar uma nova despesa
@api_router.post("/expenses", response_model=Expense)
async def create_expense(input_data: ExpenseCreate):
    expense_dict = input_data.dict()
    if not expense_dict.get("id"):
        expense_dict["id"] = str(uuid.uuid4())
    if not expense_dict.get("createdAt"):
        expense_dict["createdAt"] = datetime.utcnow().isoformat()
        
    await db.expenses.insert_one(expense_dict)
    return Expense(**expense_dict)

# 3. Atualizar uma despesa
@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, patch: ExpenseUpdate):
    update_data = {k: v for k, v in patch.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
        
    result = await db.expenses.find_one_and_update(
        {"id": expense_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    return Expense(**result)

# 4. Eliminar uma despesa
@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    return {"message": "Despesa eliminada com sucesso"}

# Inclui o router com prefixo /api
app.include_router(api_router)

# Configuração de CORS para permitir acesso do frontend Vercel / PWA
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
