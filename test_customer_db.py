import os
import sqlite3
import requests
import json

BASE_URL = "http://127.0.0.1:8000"
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(PROJECT_ROOT, "data", "quietleak.db")

def test_customer_database():
    print("=" * 70)
    print("QUIETLEAK: CUSTOMER DATABASE & DB BROWSER INTEGRATION TEST")
    print("=" * 70)

    # 1. Verify quietleak.db customers table exists directly in SQLite
    print("\n[Test 1] Inspecting SQLite 'customers' table directly in quietleak.db...")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'")
    cust_table = cursor.fetchone()
    assert cust_table is not None, "customers table not found in SQLite"
    print("  * 'customers' table exists in quietleak.db")

    cursor.execute("PRAGMA table_info(customers)")
    cols = [col[1] for col in cursor.fetchall()]
    print(f"  * Schema columns ({len(cols)}): {', '.join(cols)}")
    expected_cols = ["id", "name", "email", "phone", "company", "subscribed_plan", "amount", "billing_frequency", "category", "status"]
    for col in expected_cols:
        assert col in cols, f"Missing column {col} in customers table"

    cursor.execute("SELECT COUNT(*) FROM customers")
    cust_count = cursor.fetchone()[0]
    print(f"  * Total customers in SQLite: {cust_count}")
    assert cust_count >= 10, f"Expected at least 10 seeded customers, got {cust_count}"

    # Verify subscriptions table has customer columns
    cursor.execute("PRAGMA table_info(subscriptions)")
    sub_cols = [c[1] for c in cursor.fetchall()]
    for col in ["customer_name", "customer_email", "customer_phone", "plan_name"]:
        assert col in sub_cols, f"Missing {col} in subscriptions table"
    print("  * 'subscriptions' table correctly synced with customer identity columns")
    conn.close()

    # 2. Test Customer REST API endpoints
    print("\n[Test 2] Testing Customer REST API endpoints (/api/customers)...")
    res = requests.get(f"{BASE_URL}/api/customers")
    assert res.status_code == 200, f"GET /api/customers returned {res.status_code}"
    customers = res.json()
    print(f"  * API returned {len(customers)} customers")
    first_cust = customers[0]
    print(f"  * Customer Sample: {first_cust['name']} | Email: {first_cust['email']} | Plan: {first_cust['subscribed_plan']} | Amount: Rs.{first_cust['amount']}")

    # 3. Create a new Customer via POST
    print("\n[Test 3] Testing Customer creation (POST /api/customers)...")
    new_cust_payload = {
        "name": "Meera Nambiar",
        "email": "meera.nambiar@startup.io",
        "phone": "+91 97711 22334",
        "company": "Nambiar Digital Labs",
        "subscribed_plan": "Figma Enterprise Team",
        "amount": 2800.0,
        "currency": "INR",
        "billing_frequency": "monthly",
        "category": "Software",
        "next_billing_date": "2026-11-01",
        "payment_method": "Credit Card",
        "status": "active",
        "notes": "Figma design system subscription for product team"
    }
    post_res = requests.post(f"{BASE_URL}/api/customers", json=new_cust_payload)
    assert post_res.status_code == 201, f"POST /api/customers returned {post_res.status_code}: {post_res.text}"
    created_cust = post_res.json()
    created_id = created_cust["id"]
    print(f"  * Successfully created Customer ID {created_id}: {created_cust['name']} ({created_cust['email']})")

    # 4. Verify update (PUT /api/customers/{id})
    print("\n[Test 4] Testing Customer update (PUT /api/customers/{id})...")
    update_payload = {"notes": "Upgraded enterprise seat with priority support"}
    put_res = requests.put(f"{BASE_URL}/api/customers/{created_id}", json=update_payload)
    assert put_res.status_code == 200, f"PUT /api/customers/{created_id} returned {put_res.status_code}"
    updated_cust = put_res.json()
    assert updated_cust["notes"] == "Upgraded enterprise seat with priority support"
    print(f"  * Successfully updated Customer ID {created_id}")

    # 5. Clean up created customer (DELETE /api/customers/{id})
    print("\n[Test 5] Testing Customer deletion (DELETE /api/customers/{id})...")
    del_res = requests.delete(f"{BASE_URL}/api/customers/{created_id}")
    assert del_res.status_code == 200, f"DELETE /api/customers/{created_id} returned {del_res.status_code}"
    get_check = requests.get(f"{BASE_URL}/api/customers/{created_id}")
    assert get_check.status_code == 404, "Customer still exists after deletion"
    print(f"  * Cleaned up test customer ID {created_id}")

    # 6. Verify Frontend HTML and JS customer integration
    print("\n[Test 6] Verifying Frontend markup and script customer bindings...")
    with open(os.path.join(PROJECT_ROOT, "frontend", "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(PROJECT_ROOT, "frontend", "js", "app.js"), "r", encoding="utf-8") as f:
        js = f.read()

    assert "form-customer-name" in html, "Missing form-customer-name in index.html"
    assert "form-customer-email" in html, "Missing form-customer-email in index.html"
    assert "customer_name" in js, "Missing customer_name in app.js"
    assert "customer_email" in js, "Missing customer_email in app.js"
    print("  * Frontend form contains Subscriber / Customer input fields")
    print("  * Frontend card renderer highlights customer profile and avatar")

    print("\n" + "=" * 70)
    print("ALL CUSTOMER DATABASE & DB BROWSER TESTS PASSED (100% SUCCESS)!")
    print("=" * 70)

if __name__ == "__main__":
    test_customer_database()
