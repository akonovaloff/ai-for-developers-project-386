from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import admin, guest

app = FastAPI(title="CalBook API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5180",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(guest.router)
app.include_router(admin.router)
