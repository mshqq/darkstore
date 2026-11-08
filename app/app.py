from auth import router as auth
from config import settings
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from inventory import router as inventory
from orders import router as orders
from products import router as products
from purchasing import router as purchasing
from sales import router as sales
from suppliers import router as suppliers

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")


app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(sales.router)
app.include_router(purchasing.router)
app.include_router(suppliers.router)
app.include_router(orders.router)
app.include_router(auth.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": f"Welcome to {settings.app_name}", "docs": "/api/docs"}


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check() -> dict[str, str]:
    return {"status": "ok"}
