from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from python_engine.api.streak_router import router as streak_router

app = FastAPI(
    title="A-Coach Sports Science & Telemetry Engine",
    description="High-performance deterministic athletic calculation engine powering endurance telemetry, biomechanics & periodization.",
    version="1.0.0",
)

# CORS configuration allowing requests from Next.js development and production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount domain calculation routers
app.include_router(streak_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "a-coach-python-sports-science-engine",
        "version": "1.0.0",
        "runtime": "Python 3.14+ (FastAPI)",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

