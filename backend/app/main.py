from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.health import router as health_router
from app.api.diagnose import router as diagnose_router
from app.api.evaluate import router as evaluate_router
from app.api.execute import router as execute_router
from app.api.webhooks import router as webhooks_router
from app.api.metrics import router as metrics_router
from app.api.activity import router as activity_router
from app.api.batch import router as batch_router
from app.api.payments import router as payments_router
from app.api.demo import router as demo_router, ensure_demo_fixtures
from app.database import engine, Base, SessionLocal
from app.models import Payment
import app.models  # Ensures SQLAlchemy models are registered before table creation

# Initialize SQLite tables (for early setup/verification)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and demo fixtures are valid & unexpired
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        total_p = db.query(Payment).count()
        if total_p == 0:
            from scripts.generate_payments import generate_synthetic_payments
            generate_synthetic_payments(count=100)
        ensure_demo_fixtures(db, force_reset_state=False)
    except Exception as e:
        print(f"Startup initialization notice: {e}")
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="RecoveryPilot API — AI Revenue Recovery Agent",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS for React frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(diagnose_router)
app.include_router(evaluate_router)
app.include_router(execute_router)
app.include_router(webhooks_router)
app.include_router(metrics_router)
app.include_router(activity_router)
app.include_router(batch_router)
app.include_router(payments_router)
app.include_router(demo_router)




@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/health"
    }
