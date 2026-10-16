import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.models import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    DashboardSummary,
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse
)
from backend.database import (
    init_db,
    get_subscriptions,
    get_subscription,
    create_subscription,
    update_subscription,
    delete_subscription,
    get_dashboard_data,
    seed_sample_data,
    get_customers,
    get_customer,
    create_customer,
    update_customer,
    delete_customer
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed default sample data on startup
    init_db()
    yield

app = FastAPI(
    title="QuietLeak API",
    description="Premium Personal Finance & Subscription Leak Detection API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Postman and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

# --- API Endpoints ---

@app.get("/api", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def api_health():
    """Health check endpoint for Vercel and monitoring."""
    return {"status": "ok", "service": "QuietLeak API", "version": "1.0.0"}

@app.get("/api/dashboard", response_model=DashboardSummary, tags=["Dashboard"])
def get_dashboard():
    """Returns centrally calculated recurring metrics, category spend, upcoming renewals, and transparent leak detection."""
    try:
        return get_dashboard_data()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate dashboard data: {str(e)}"
        )

@app.get("/api/subscriptions", response_model=List[SubscriptionResponse], tags=["Subscriptions"])
def list_subscriptions(
    category: Optional[str] = Query(None, description="Filter by category (e.g. Entertainment, Software)"),
    status: Optional[str] = Query(None, description="Filter by status (active, trial, paused, cancelled)"),
    search: Optional[str] = Query(None, description="Search term in name or notes")
):
    """Retrieve subscriptions with optional category, status, and text search filters."""
    try:
        return get_subscriptions(category=category, status=status, search=search)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve subscriptions: {str(e)}"
        )

@app.get("/api/subscriptions/{subscription_id}", response_model=SubscriptionResponse, tags=["Subscriptions"])
def get_subscription_detail(subscription_id: int):
    """Retrieve a single subscription by unique ID."""
    sub = get_subscription(subscription_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID {subscription_id} not found"
        )
    return sub

@app.post("/api/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED, tags=["Subscriptions"])
def add_subscription(subscription: SubscriptionCreate):
    """Create a new recurring subscription."""
    try:
        new_sub = create_subscription(subscription)
        return new_sub
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Creation failed: {str(e)}")

@app.put("/api/subscriptions/{subscription_id}", response_model=SubscriptionResponse, tags=["Subscriptions"])
def edit_subscription(subscription_id: int, subscription: SubscriptionUpdate):
    """Update an existing subscription."""
    existing = get_subscription(subscription_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID {subscription_id} not found"
        )
    try:
        updated = update_subscription(subscription_id, subscription)
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Update failed: {str(e)}")

@app.delete("/api/subscriptions/{subscription_id}", status_code=status.HTTP_200_OK, tags=["Subscriptions"])
def remove_subscription(subscription_id: int):
    """Delete a subscription."""
    existing = get_subscription(subscription_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription with ID {subscription_id} not found"
        )
    success = delete_subscription(subscription_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete record")
    return {"message": "Subscription successfully deleted", "id": subscription_id}

@app.post("/api/reset-data", tags=["Admin / Demo"])
def reset_sample_data_endpoint():
    """Resets database to demonstration sample data."""
    try:
        seed_sample_data()
        return {"message": "Database reset to standard sample data successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# --- Customer Endpoints ---

@app.get("/api/customers", response_model=List[CustomerResponse], tags=["Customers"])
def list_customers(
    category: Optional[str] = Query(None, description="Filter customers by category"),
    status: Optional[str] = Query(None, description="Filter customers by status (active, trial, paused, cancelled)"),
    search: Optional[str] = Query(None, description="Search customer name, email, or plan")
):
    """Retrieve all customers from SQLite database."""
    try:
        return get_customers(category=category, status=status, search=search)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve customers: {str(e)}")

@app.get("/api/customers/{customer_id}", response_model=CustomerResponse, tags=["Customers"])
def get_customer_detail(customer_id: int):
    """Retrieve a single customer by unique ID."""
    cust = get_customer(customer_id)
    if not cust:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with ID {customer_id} not found")
    return cust

@app.post("/api/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, tags=["Customers"])
def add_customer(customer: CustomerCreate):
    """Add a new customer to the database."""
    try:
        return create_customer(customer)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Customer creation failed: {str(e)}")

@app.put("/api/customers/{customer_id}", response_model=CustomerResponse, tags=["Customers"])
def edit_customer(customer_id: int, customer: CustomerUpdate):
    """Update an existing customer."""
    existing = get_customer(customer_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with ID {customer_id} not found")
    try:
        updated = update_customer(customer_id, customer)
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Customer update failed: {str(e)}")

@app.delete("/api/customers/{customer_id}", status_code=status.HTTP_200_OK, tags=["Customers"])
def remove_customer(customer_id: int):
    """Delete a customer record."""
    existing = get_customer(customer_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with ID {customer_id} not found")
    success = delete_customer(customer_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete customer")
    return {"message": "Customer successfully deleted", "id": customer_id}

# --- Static Frontend Delivery ---
if os.path.exists(FRONTEND_DIR):
    css_dir = os.path.join(FRONTEND_DIR, "css")
    js_dir = os.path.join(FRONTEND_DIR, "js")
    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/", include_in_schema=False)
    def serve_frontend():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
