import os
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Conexão MongoDB
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'gastos_db')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Criar a aplicação principal do FastAPI
app = FastAPI()

# ⚠️ O CORS PRECISA SER ADICIONADO AQUI (ANTES DOS ROUTERS E ROTAS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite requisições da Vercel e de qualquer origem
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    try:
        expenses = await db.expenses.find().to_list(1000)
        return [Expense(**e) for e in expenses]
    except Exception as e:
        logger.error(f"Erro ao buscar despesas no MongoDB: {e}")
        return []

# 2. Criar uma nova despesa
@api_router.post("/expenses", response_model=Expense)
async def create_expense(input_data: ExpenseCreate):
    try:
        expense_dict = input_data.dict()
        if not expense_dict.get("id"):
            expense_dict["id"] = str(uuid.uuid4())
        if not expense_dict.get("createdAt"):
            expense_dict["createdAt"] = datetime.utcnow().isoformat()
            
        await db.expenses.insert_one(expense_dict)
        return Expense(**expense_dict)
    except Exception as e:
        logger.error(f"Erro ao inserir despesa no MongoDB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. Atualizar uma despesa
@api_router.put("/expenses/{expense_id}", response_model=Expense)
async def update_expense(expense_id: str, patch: ExpenseUpdate):
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar despesa no MongoDB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 4. Eliminar uma despesa
@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    try:
        result = await db.expenses.delete_one({"id": expense_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Despesa não encontrada")
        return {"message": "Despesa eliminada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao eliminar despesa no MongoDB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Inclui o router com o prefixo /api
app.include_router(api_router)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
