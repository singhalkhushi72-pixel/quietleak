from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime

VALID_FREQUENCIES = {"weekly", "monthly", "quarterly", "yearly"}
VALID_STATUSES = {"active", "trial", "paused", "cancelled"}

def calculate_monthly_equivalent(amount: float, billing_frequency: str) -> float:
    """Normalize recurring costs to a monthly equivalent."""
    freq = billing_frequency.lower()
    if freq == "weekly":
        return round((amount * 52.0) / 12.0, 2)
    elif freq == "monthly":
        return round(amount, 2)
    elif freq == "quarterly":
        return round(amount / 3.0, 2)
    elif freq == "yearly":
        return round(amount / 12.0, 2)
    return round(amount, 2)

def calculate_annual_equivalent(monthly_amount: float) -> float:
    """Calculate annual recurring expenditure from monthly equivalent."""
    return round(monthly_amount * 12.0, 2)

class SubscriptionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Service / Customer plan name")
    customer_name: Optional[str] = Field(default=None, max_length=100, description="Customer name")
    customer_email: Optional[str] = Field(default=None, max_length=100, description="Customer email")
    customer_phone: Optional[str] = Field(default=None, max_length=50, description="Customer phone")
    plan_name: Optional[str] = Field(default=None, max_length=100, description="Subscribed plan name")
    amount: float = Field(..., gt=0, description="Recurring cost amount")
    currency: str = Field(default="INR", max_length=10, description="Currency code")
    billing_frequency: str = Field(..., description="weekly, monthly, quarterly, or yearly")
    category: str = Field(..., min_length=1, max_length=50, description="Subscription category")
    next_renewal_date: str = Field(..., description="Next renewal date in YYYY-MM-DD format")
    payment_method: str = Field(default="Credit Card", max_length=50, description="Payment method")
    status: str = Field(default="active", description="active, trial, paused, or cancelled")
    notes: Optional[str] = Field(default=None, max_length=500, description="Optional notes")
    last_used_date: Optional[str] = Field(default=None, description="Optional last-used date in YYYY-MM-DD format")

    @field_validator("billing_frequency")
    @classmethod
    def validate_frequency(cls, v: str) -> str:
        freq = v.strip().lower()
        if freq not in VALID_FREQUENCIES:
            raise ValueError(f"Billing frequency must be one of {list(VALID_FREQUENCIES)}")
        return freq

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        stat = v.strip().lower()
        if stat not in VALID_STATUSES:
            raise ValueError(f"Status must be one of {list(VALID_STATUSES)}")
        return stat

    @field_validator("next_renewal_date")
    @classmethod
    def validate_renewal_date(cls, v: str) -> str:
        try:
            date.fromisoformat(v)
        except Exception:
            raise ValueError("next_renewal_date must be a valid date in YYYY-MM-DD format")
        return v

    @field_validator("last_used_date")
    @classmethod
    def validate_last_used_date(cls, v: Optional[str]) -> Optional[str]:
        if v:
            try:
                date.fromisoformat(v)
            except Exception:
                raise ValueError("last_used_date must be a valid date in YYYY-MM-DD format")
        return v

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    customer_name: Optional[str] = Field(default=None, max_length=100)
    customer_email: Optional[str] = Field(default=None, max_length=100)
    customer_phone: Optional[str] = Field(default=None, max_length=50)
    plan_name: Optional[str] = Field(default=None, max_length=100)
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, max_length=10)
    billing_frequency: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=50)
    next_renewal_date: Optional[str] = None
    payment_method: Optional[str] = Field(default=None, max_length=50)
    status: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    last_used_date: Optional[str] = None

    @field_validator("billing_frequency")
    @classmethod
    def validate_frequency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            freq = v.strip().lower()
            if freq not in VALID_FREQUENCIES:
                raise ValueError(f"Billing frequency must be one of {list(VALID_FREQUENCIES)}")
            return freq
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stat = v.strip().lower()
            if stat not in VALID_STATUSES:
                raise ValueError(f"Status must be one of {list(VALID_STATUSES)}")
            return stat
        return v

    @field_validator("next_renewal_date")
    @classmethod
    def validate_renewal_date(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            try:
                date.fromisoformat(v)
            except Exception:
                raise ValueError("next_renewal_date must be a valid date in YYYY-MM-DD format")
        return v

    @field_validator("last_used_date")
    @classmethod
    def validate_last_used_date(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "":
            try:
                date.fromisoformat(v)
            except Exception:
                raise ValueError("last_used_date must be a valid date in YYYY-MM-DD format")
            return v
        return None

class SubscriptionResponse(SubscriptionBase):
    id: int
    monthly_equivalent: float
    annual_equivalent: float
    created_at: str
    updated_at: str

class CategorySpend(BaseModel):
    category: str
    monthly_amount: float
    annual_amount: float
    percentage: float
    count: int

class PotentialLeak(BaseModel):
    subscription_id: int
    service_name: str
    category: str
    monthly_amount: float
    reason: str
    leak_type: str  # e.g., "unused", "trial_ending", "annual_renewal", "high_cost", "paused"
    recommendation: str
    severity: str   # "high", "medium", "low"

class DashboardSummary(BaseModel):
    monthly_recurring_total: float
    annual_recurring_total: float
    active_subscriptions_count: int
    trial_count: int
    paused_count: int
    cancelled_count: int
    total_subscriptions_count: int
    potential_savings_monthly: float
    potential_savings_annual: float
    potential_leaks: List[PotentialLeak]
    upcoming_renewals: List[SubscriptionResponse]
    category_breakdown: List[CategorySpend]

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Customer full name")
    email: str = Field(..., min_length=3, max_length=100, description="Customer email address")
    phone: Optional[str] = Field(default=None, max_length=50, description="Customer phone number")
    company: Optional[str] = Field(default=None, max_length=100, description="Customer company or organization")
    subscribed_plan: str = Field(..., min_length=1, max_length=100, description="Subscribed plan tier")
    amount: float = Field(..., gt=0, description="Recurring subscription amount")
    currency: str = Field(default="INR", max_length=10, description="Currency code")
    billing_frequency: str = Field(default="monthly", description="weekly, monthly, quarterly, or yearly")
    category: str = Field(..., min_length=1, max_length=50, description="Subscription category")
    next_billing_date: str = Field(..., description="Next billing / renewal date in YYYY-MM-DD format")
    payment_method: str = Field(default="Credit Card", max_length=50, description="Payment method")
    status: str = Field(default="active", description="active, trial, paused, or cancelled")
    notes: Optional[str] = Field(default=None, max_length=500, description="Optional notes")
    last_active_date: Optional[str] = Field(default=None, description="Optional last active date in YYYY-MM-DD format")

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[str] = Field(default=None, min_length=3, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=50)
    company: Optional[str] = Field(default=None, max_length=100)
    subscribed_plan: Optional[str] = Field(default=None, min_length=1, max_length=100)
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, max_length=10)
    billing_frequency: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=50)
    next_billing_date: Optional[str] = None
    payment_method: Optional[str] = Field(default=None, max_length=50)
    status: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=500)
    last_active_date: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    monthly_equivalent: float
    annual_equivalent: float
    created_at: str
    updated_at: str

