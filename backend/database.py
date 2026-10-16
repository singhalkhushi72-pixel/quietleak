import sqlite3
import os
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from backend.models import (
    calculate_monthly_equivalent,
    calculate_annual_equivalent,
    SubscriptionResponse,
    SubscriptionCreate,
    SubscriptionUpdate,
    PotentialLeak,
    CategorySpend,
    DashboardSummary
)

import shutil

ORIGINAL_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "quietleak.db")

if os.environ.get("VERCEL"):
    DB_DIR = "/tmp/quietleak_data"
    DB_PATH = os.path.join(DB_DIR, "quietleak.db")
    if not os.path.exists(DB_PATH):
        os.makedirs(DB_DIR, exist_ok=True)
        if os.path.exists(ORIGINAL_DB_PATH):
            try:
                shutil.copy2(ORIGINAL_DB_PATH, DB_PATH)
            except Exception:
                pass
else:
    DB_PATH = ORIGINAL_DB_PATH

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        plan_name TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        billing_frequency TEXT NOT NULL,
        category TEXT NOT NULL,
        next_renewal_date TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'Credit Card',
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        last_used_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        company TEXT,
        subscribed_plan TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        billing_frequency TEXT NOT NULL,
        category TEXT NOT NULL,
        next_billing_date TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'Credit Card',
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        last_active_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    conn.commit()

    # Ensure customer columns exist in subscriptions table
    cursor.execute("PRAGMA table_info(subscriptions)")
    sub_cols = [r["name"] for r in cursor.fetchall()]
    for col in ["customer_name", "customer_email", "customer_phone", "plan_name"]:
        if col not in sub_cols:
            try:
                cursor.execute(f"ALTER TABLE subscriptions ADD COLUMN {col} TEXT")
            except Exception:
                pass
    conn.commit()
    
    # Check if empty, seed default data
    cursor.execute("SELECT COUNT(*) as count FROM customers")
    cust_count = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM subscriptions")
    sub_count = cursor.fetchone()["count"]
    if cust_count == 0 or sub_count == 0:
        seed_sample_data(conn)
    conn.close()

def seed_sample_data(conn=None):
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True
        
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subscriptions")
    cursor.execute("DELETE FROM customers")
    
    # Use today's date for dynamic relative dates
    today = date.today()
    now_iso = datetime.now().isoformat()
    
    sample_customers = [
        {
            "customer_name": "Aarav Sharma",
            "customer_email": "aarav.sharma@gmail.com",
            "customer_phone": "+91 98201 11223",
            "company": "Sharma Tech Consultancy",
            "name": "Netflix Premium (4K)",
            "plan_name": "Netflix Premium (4K)",
            "amount": 649.0,
            "currency": "INR",
            "billing_frequency": "monthly",
            "category": "Entertainment",
            "next_renewal_date": (today + timedelta(days=4)).isoformat(),
            "payment_method": "Credit Card",
            "status": "active",
            "notes": "Customer Aarav Sharma - 4K Ultra HD family pass",
            "last_used_date": (today - timedelta(days=2)).isoformat(),
        },
        {
            "customer_name": "Priya Patel",
            "customer_email": "priya.patel@healthfit.in",
            "customer_phone": "+91 98765 43210",
            "company": "Patel Healthcare",
            "name": "Cultpass ELITE Gym",
            "plan_name": "Cultpass ELITE Gym",
            "amount": 14400.0,
            "currency": "INR",
            "billing_frequency": "yearly",
            "category": "Health & Fitness",
            "next_renewal_date": (today + timedelta(days=18)).isoformat(),
            "payment_method": "Credit Card",
            "status": "active",
            "notes": "Customer Priya Patel - Annual gym membership pass",
            "last_used_date": (today - timedelta(days=62)).isoformat(),
        },
        {
            "customer_name": "Rohan Mehta",
            "customer_email": "rohan.mehta@soundwave.org",
            "customer_phone": "+91 91234 56789",
            "company": "SoundWave Studios",
            "name": "Spotify Individual",
            "plan_name": "Spotify Individual",
            "amount": 119.0,
            "currency": "INR",
            "billing_frequency": "monthly",
            "category": "Entertainment",
            "next_renewal_date": (today + timedelta(days=11)).isoformat(),
            "payment_method": "UPI AutoPay",
            "status": "active",
            "notes": "Customer Rohan Mehta - Daily commuter streaming playlist",
            "last_used_date": (today - timedelta(days=1)).isoformat(),
        },
        {
            "customer_name": "Ananya Deshmukh",
            "customer_email": "ananya.d@shoppershub.in",
            "customer_phone": "+91 99887 76655",
            "company": "Deshmukh Retail",
            "name": "Amazon Prime",
            "plan_name": "Amazon Prime",
            "amount": 1499.0,
            "currency": "INR",
            "billing_frequency": "yearly",
            "category": "Lifestyle",
            "next_renewal_date": (today + timedelta(days=7)).isoformat(),
            "payment_method": "Amazon Pay UPI",
            "status": "active",
            "notes": "Customer Ananya Deshmukh - Prime Video & priority delivery",
            "last_used_date": (today - timedelta(days=5)).isoformat(),
        },
        {
            "customer_name": "Vikramaditya Sen",
            "customer_email": "vikram.sen@designstudio.io",
            "customer_phone": "+91 97654 32109",
            "company": "Sen Creative Lab",
            "name": "Adobe Creative Cloud",
            "plan_name": "Adobe Creative Cloud",
            "amount": 4230.0,
            "currency": "INR",
            "billing_frequency": "monthly",
            "category": "Software",
            "next_renewal_date": (today + timedelta(days=21)).isoformat(),
            "payment_method": "Corporate Card",
            "status": "active",
            "notes": "Customer Vikramaditya Sen - Full suite designer pass",
            "last_used_date": (today - timedelta(days=35)).isoformat(),
        },
        {
            "customer_name": "Kavita Rao",
            "customer_email": "kavita.rao@consulting.com",
            "customer_phone": "+91 94567 89012",
            "company": "Rao Analytics",
            "name": "ChatGPT Plus",
            "plan_name": "ChatGPT Plus",
            "amount": 1999.0,
            "currency": "INR",
            "billing_frequency": "monthly",
            "category": "Productivity",
            "next_renewal_date": (today + timedelta(days=14)).isoformat(),
            "payment_method": "Credit Card",
            "status": "active",
            "notes": "Customer Kavita Rao - AI research & pair programming",
            "last_used_date": (today - timedelta(days=0)).isoformat(),
        },
        {
            "customer_name": "Deepak Verma",
            "customer_email": "deepak.verma@icloud.com",
            "customer_phone": "+91 93456 78901",
            "company": "Verma Logistics",
            "name": "Apple iCloud+ (200GB)",
            "plan_name": "Apple iCloud+ (200GB)",
            "amount": 219.0,
            "currency": "INR",
            "billing_frequency": "monthly",
            "category": "Utilities",
            "next_renewal_date": (today + timedelta(days=16)).isoformat(),
            "payment_method": "Apple ID UPI",
            "status": "active",
            "notes": "Customer Deepak Verma - Cloud storage & device backups",
            "last_used_date": (today - timedelta(days=3)).isoformat(),
        },
        {
            "customer_name": "Sneha Kulkarni",
            "customer_email": "sneha.k@language.edu",
            "customer_phone": "+91 91234 98765",
            "company": "Kulkarni Academy",
            "name": "Duolingo Super Trial",
            "plan_name": "Duolingo Super Trial",
            "amount": 499.0,
            "currency": "INR",
            "billing_frequency": "monthly",
            "category": "Education",
            "next_renewal_date": (today + timedelta(days=3)).isoformat(),
            "payment_method": "Google Play",
            "status": "trial",
            "notes": "Customer Sneha Kulkarni - 14-day free trial ending soon",
            "last_used_date": (today - timedelta(days=4)).isoformat(),
        },
        {
            "customer_name": "Nikhil Kapoor",
            "customer_email": "nikhil.k@theken-reader.in",
            "customer_phone": "+91 92345 67890",
            "company": "Kapoor Media",
            "name": "The Ken Annual Subscription",
            "plan_name": "The Ken Annual Subscription",
            "amount": 3250.0,
            "currency": "INR",
            "billing_frequency": "yearly",
            "category": "Media",
            "next_renewal_date": (today + timedelta(days=45)).isoformat(),
            "payment_method": "Net Banking",
            "status": "paused",
            "notes": "Customer Nikhil Kapoor - Paused long-form journalism pass",
            "last_used_date": (today - timedelta(days=95)).isoformat(),
        },
        {
            "customer_name": "Aditya Joshi",
            "customer_email": "aditya.joshi@gamingzone.in",
            "customer_phone": "+91 90123 45678",
            "company": "Joshi Interactive",
            "name": "Disney+ Hotstar Super",
            "plan_name": "Disney+ Hotstar Super",
            "amount": 299.0,
            "currency": "INR",
            "billing_frequency": "quarterly",
            "category": "Entertainment",
            "next_renewal_date": (today + timedelta(days=28)).isoformat(),
            "payment_method": "UPI AutoPay",
            "status": "cancelled",
            "notes": "Customer Aditya Joshi - Cancelled after World Cup",
            "last_used_date": (today - timedelta(days=40)).isoformat(),
        }
    ]
    
    for item in sample_customers:
        cursor.execute("""
        INSERT INTO subscriptions (
            name, customer_name, customer_email, customer_phone, plan_name,
            amount, currency, billing_frequency, category,
            next_renewal_date, payment_method, status, notes, last_used_date,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["name"], item["customer_name"], item["customer_email"], item["customer_phone"], item["plan_name"],
            item["amount"], item["currency"], item["billing_frequency"], item["category"],
            item["next_renewal_date"], item["payment_method"], item["status"], item["notes"],
            item["last_used_date"], now_iso, now_iso
        ))

        cursor.execute("""
        INSERT INTO customers (
            name, email, phone, company, subscribed_plan,
            amount, currency, billing_frequency, category,
            next_billing_date, payment_method, status, notes, last_active_date,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["customer_name"], item["customer_email"], item["customer_phone"], item["company"], item["plan_name"],
            item["amount"], item["currency"], item["billing_frequency"], item["category"],
            item["next_renewal_date"], item["payment_method"], item["status"], item["notes"],
            item["last_used_date"], now_iso, now_iso
        ))
        
    conn.commit()
    if should_close:
        conn.close()

def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    d = dict(row)
    m_eq = calculate_monthly_equivalent(d["amount"], d["billing_frequency"])
    a_eq = calculate_annual_equivalent(m_eq)
    d["monthly_equivalent"] = m_eq
    d["annual_equivalent"] = a_eq
    return d

def get_subscriptions(category: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM subscriptions WHERE 1=1"
    params = []
    
    if category and category.lower() != "all":
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)
        
    if status and status.lower() != "all":
        query += " AND LOWER(status) = LOWER(?)"
        params.append(status)
        
    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(notes) LIKE ?)"
        term = f"%{search.lower()}%"
        params.extend([term, term])
        
    query += " ORDER BY next_renewal_date ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def get_subscription(sub_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subscriptions WHERE id = ?", (sub_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row_to_dict(row)
    return None

def create_subscription(sub: SubscriptionCreate) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    cust_name = sub.customer_name or sub.name
    plan_name = sub.plan_name or sub.name
    cust_email = sub.customer_email or f"{cust_name.lower().replace(' ', '.')}@example.com"
    cursor.execute("""
    INSERT INTO subscriptions (
        name, customer_name, customer_email, customer_phone, plan_name,
        amount, currency, billing_frequency, category,
        next_renewal_date, payment_method, status, notes, last_used_date,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sub.name, cust_name, cust_email, sub.customer_phone, plan_name,
        sub.amount, sub.currency, sub.billing_frequency,
        sub.category, sub.next_renewal_date, sub.payment_method,
        sub.status, sub.notes, sub.last_used_date,
        now_iso, now_iso
    ))
    new_id = cursor.lastrowid

    # Also keep customers table synced
    try:
        cursor.execute("""
        INSERT INTO customers (
            name, email, phone, company, subscribed_plan,
            amount, currency, billing_frequency, category,
            next_billing_date, payment_method, status, notes, last_active_date,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cust_name, cust_email, sub.customer_phone or "", "Individual", plan_name,
            sub.amount, sub.currency, sub.billing_frequency, sub.category,
            sub.next_renewal_date, sub.payment_method, sub.status, sub.notes,
            sub.last_used_date, now_iso, now_iso
        ))
    except Exception:
        pass

    conn.commit()
    conn.close()
    return get_subscription(new_id)

def update_subscription(sub_id: int, sub: SubscriptionUpdate) -> Optional[Dict[str, Any]]:
    existing = get_subscription(sub_id)
    if not existing:
        return None
        
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    
    fields = []
    values = []
    for field, val in sub.model_dump(exclude_unset=True).items():
        fields.append(f"{field} = ?")
        values.append(val)
        
    if not fields:
        conn.close()
        return existing
        
    fields.append("updated_at = ?")
    values.append(now_iso)
    values.append(sub_id)
    
    query = f"UPDATE subscriptions SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return get_subscription(sub_id)

def delete_subscription(sub_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subscriptions WHERE id = ?", (sub_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# ==================== CUSTOMER CRUD FUNCTIONS ====================
def get_customers(category: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM customers WHERE 1=1"
    params = []
    if category and category.lower() != "all":
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)
    if status and status.lower() != "all":
        query += " AND LOWER(status) = LOWER(?)"
        params.append(status)
    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(subscribed_plan) LIKE ?)"
        term = f"%{search.lower()}%"
        params.extend([term, term, term])
    query += " ORDER BY name ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    res = []
    for r in rows:
        d = dict(r)
        d["monthly_equivalent"] = calculate_monthly_equivalent(d["amount"], d["billing_frequency"])
        d["annual_equivalent"] = calculate_annual_equivalent(d["monthly_equivalent"])
        res.append(d)
    return res

def get_customer(cust_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE id = ?", (cust_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        d = dict(row)
        d["monthly_equivalent"] = calculate_monthly_equivalent(d["amount"], d["billing_frequency"])
        d["annual_equivalent"] = calculate_annual_equivalent(d["monthly_equivalent"])
        return d
    return None

def create_customer(cust) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO customers (
        name, email, phone, company, subscribed_plan, amount, currency,
        billing_frequency, category, next_billing_date, payment_method,
        status, notes, last_active_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cust.name, cust.email, cust.phone, cust.company, cust.subscribed_plan,
        cust.amount, cust.currency, cust.billing_frequency, cust.category,
        cust.next_billing_date, cust.payment_method, cust.status, cust.notes,
        cust.last_active_date, now_iso, now_iso
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_customer(new_id)

def update_customer(cust_id: int, cust) -> Optional[Dict[str, Any]]:
    existing = get_customer(cust_id)
    if not existing:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now().isoformat()
    fields = []
    values = []
    for field, val in cust.model_dump(exclude_unset=True).items():
        fields.append(f"{field} = ?")
        values.append(val)
    if not fields:
        conn.close()
        return existing
    fields.append("updated_at = ?")
    values.append(now_iso)
    values.append(cust_id)
    query = f"UPDATE customers SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return get_customer(cust_id)

def delete_customer(cust_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customers WHERE id = ?", (cust_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_dashboard_data() -> DashboardSummary:
    """Calculates all central metrics for dashboard and leak detection."""
    subs = get_subscriptions()
    today = date.today()
    
    # Active recurring calculation:
    # Per instructions: "Use active subscriptions for the active recurring-cost summary. Keep cancelled subscriptions out of active recurring expenditure. Clearly distinguish trials, paused subscriptions, and upcoming renewals where applicable."
    active_subs = [s for s in subs if s["status"] == "active"]
    trial_subs = [s for s in subs if s["status"] == "trial"]
    paused_subs = [s for s in subs if s["status"] == "paused"]
    cancelled_subs = [s for s in subs if s["status"] == "cancelled"]
    
    # Monthly & annual total derived strictly from active subscriptions
    monthly_recurring_total = round(sum(s["monthly_equivalent"] for s in active_subs), 2)
    annual_recurring_total = round(monthly_recurring_total * 12.0, 2)
    
    # Category Breakdown (for active subscriptions)
    category_map: Dict[str, Dict[str, Any]] = {}
    for s in active_subs:
        cat = s["category"]
        if cat not in category_map:
            category_map[cat] = {"monthly": 0.0, "count": 0}
        category_map[cat]["monthly"] += s["monthly_equivalent"]
        category_map[cat]["count"] += 1
        
    category_breakdown: List[CategorySpend] = []
    for cat, data in category_map.items():
        m_amt = round(data["monthly"], 2)
        pct = round((m_amt / monthly_recurring_total * 100.0), 1) if monthly_recurring_total > 0 else 0.0
        category_breakdown.append(CategorySpend(
            category=cat,
            monthly_amount=m_amt,
            annual_amount=round(m_amt * 12.0, 2),
            percentage=pct,
            count=data["count"]
        ))
    category_breakdown.sort(key=lambda x: x.monthly_amount, reverse=True)
    
    # Upcoming Renewals:
    # Subscriptions renewing within next 30 days that are not cancelled
    upcoming: List[SubscriptionResponse] = []
    for s in subs:
        if s["status"] != "cancelled":
            try:
                r_date = date.fromisoformat(s["next_renewal_date"])
                diff = (r_date - today).days
                if 0 <= diff <= 30:
                    upcoming.append(SubscriptionResponse(**s))
            except Exception:
                pass
    upcoming.sort(key=lambda x: x.next_renewal_date)
    
    # Transparent Rule-Based Potential Leaks Detection:
    # Rule 1: Explicitly marked unused (> 45 days without usage)
    # Rule 2: Active trial ending within 7 days
    # Rule 3: High cost relative to category average (>= 1.5x category avg and >= 1500 INR/mo)
    # Rule 4: Approaching large annual renewal within 14 days
    # Rule 5: Paused subscription with no activity for > 60 days
    potential_leaks: List[PotentialLeak] = []
    potential_savings_monthly = 0.0
    
    for s in subs:
        if s["status"] == "cancelled":
            continue
            
        m_eq = s["monthly_equivalent"]
        sub_id = s["id"]
        name = s["name"]
        cat = s["category"]
        
        # Rule 1: Unused / Forgotten (last_used_date > 45 days ago)
        if s["last_used_date"]:
            try:
                l_date = date.fromisoformat(s["last_used_date"])
                days_since_used = (today - l_date).days
                if days_since_used >= 45 and s["status"] == "active":
                    potential_leaks.append(PotentialLeak(
                        subscription_id=sub_id,
                        service_name=name,
                        category=cat,
                        monthly_amount=m_eq,
                        reason=f"Last used {days_since_used} days ago. Paying for inactive access.",
                        leak_type="unused",
                        recommendation="Review usage or cancel to stop silent leakage.",
                        severity="high"
                    ))
                    potential_savings_monthly += m_eq
                    continue  # Avoid duplicate flag for same service
            except Exception:
                pass

        # Rule 2: Trial Ending Soon (trial status & renewal <= 7 days)
        if s["status"] == "trial":
            try:
                r_date = date.fromisoformat(s["next_renewal_date"])
                days_left = (r_date - today).days
                if days_left <= 7:
                    potential_leaks.append(PotentialLeak(
                        subscription_id=sub_id,
                        service_name=name,
                        category=cat,
                        monthly_amount=m_eq,
                        reason=f"Free trial ends in {days_left if days_left > 0 else 'today'}{' day' if days_left == 1 else ' days' if days_left > 1 else ''}. Converts to ₹{s['amount']:,.0f}/{s['billing_frequency']}.",
                        leak_type="trial_ending",
                        recommendation="Set a reminder or cancel now if you don't intend to stay subscribed.",
                        severity="high"
                    ))
                    potential_savings_monthly += m_eq
                    continue
            except Exception:
                pass

        # Rule 3: High cost outlier (>= 2500/mo or 2x category average)
        if s["status"] == "active" and m_eq >= 2500.0:
            potential_leaks.append(PotentialLeak(
                subscription_id=sub_id,
                service_name=name,
                category=cat,
                monthly_amount=m_eq,
                reason=f"Significant recurring expense (₹{m_eq:,.0f}/mo), representing substantial outflow.",
                leak_type="high_cost",
                recommendation="Audit tier, investigate team discount, or verify if lower tier meets your needs.",
                severity="medium"
            ))
            potential_savings_monthly += round(m_eq * 0.3, 2)  # Conservative partial savings estimate
            continue

        # Rule 4: Approaching Annual Renewal (within 14 days and yearly billing)
        if s["billing_frequency"] == "yearly" and s["status"] == "active":
            try:
                r_date = date.fromisoformat(s["next_renewal_date"])
                days_left = (r_date - today).days
                if 0 <= days_left <= 14:
                    potential_leaks.append(PotentialLeak(
                        subscription_id=sub_id,
                        service_name=name,
                        category=cat,
                        monthly_amount=m_eq,
                        reason=f"Substantial annual renewal of ₹{s['amount']:,.0f} due in {days_left} days.",
                        leak_type="annual_renewal",
                        recommendation="Evaluate if you plan to keep this service for another full 12 months.",
                        severity="medium"
                    ))
            except Exception:
                pass

        # Rule 5: Paused long-term
        if s["status"] == "paused":
            potential_leaks.append(PotentialLeak(
                subscription_id=sub_id,
                service_name=name,
                category=cat,
                monthly_amount=m_eq,
                reason="Subscription has been paused. Paused services often reactivate or get forgotten.",
                leak_type="paused",
                recommendation="Decide whether to formally cancel or resume service.",
                severity="low"
            ))
            potential_savings_monthly += m_eq

    potential_savings_monthly = round(potential_savings_monthly, 2)
    potential_savings_annual = round(potential_savings_monthly * 12.0, 2)
    
    return DashboardSummary(
        monthly_recurring_total=monthly_recurring_total,
        annual_recurring_total=annual_recurring_total,
        active_subscriptions_count=len(active_subs),
        trial_count=len(trial_subs),
        paused_count=len(paused_subs),
        cancelled_count=len(cancelled_subs),
        total_subscriptions_count=len(subs),
        potential_savings_monthly=potential_savings_monthly,
        potential_savings_annual=potential_savings_annual,
        potential_leaks=potential_leaks,
        upcoming_renewals=upcoming,
        category_breakdown=category_breakdown
    )
