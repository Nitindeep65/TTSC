from fastapi import FastAPI
import uvicorn


app = FastAPI(
    title="Z",
    description="A Twitter clone",
)

@app.get("/")
async def hi():
    return "hi. i am a five-year-old learning backend dev... with fast api"


if __name__ == "__main__":
    uvicorn.run(app=app)