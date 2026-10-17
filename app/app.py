from contextlib import asynccontextmanager

from config import settings
from database import init_db
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from suppliers.router.product_router import router as products_router
from suppliers.router.stock_router import router as stock_router
from suppliers.router.supplier_router import router as suppliers_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")

app.include_router(suppliers_router)
app.include_router(products_router)
app.include_router(stock_router)


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_name}", "docs": "/api/docs"}


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "ok"}
