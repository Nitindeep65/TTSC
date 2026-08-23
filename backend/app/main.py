from fastapi import FastAPI
from app.routers import clarification, database
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

app = FastAPI(title="Text-to-SQL Clarification & Query Engine API")
app.include_router(clarification.router)
app.include_router(database.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def health():
    return { "message" : "main server is running"}