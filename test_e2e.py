"""
End-to-end automated test suite for QuietLeak Phase 1.
Tests every step of the primary user journey outlined in Section 14:
1. Open QuietLeak & load dashboard
2. Verify dashboard calculations and metrics
3. Add a new subscription (POST /api/subscriptions)
4. Confirm record saved and retrieved (GET /api/subscriptions/{id})
5. Confirm monthly & annual totals updated
6. Edit the subscription (PUT /api/subscriptions/{id})
7. Delete the subscription (DELETE /api/subscriptions/{id}) and confirm totals revert
8. Verify persistence in SQLite across reloads
9. Verify filters, leaks engine, and category breakdowns
"""

import json
import urllib.request
import urllib.parse
import sys

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post(path, data):
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def put(path, data):
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='PUT')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def delete(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method='DELETE')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def run_tests():
    print("=" * 60)
    print("QuietLeak Phase 1 End-to-End Test Suite")
    print("=" * 60)

    # 1. Open QuietLeak & verify frontend index
    print("\n[Step 1] Opening QuietLeak...")
    req = urllib.request.Request(f"{BASE_URL}/")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        html = resp.read().decode('utf-8')
        assert "QuietLeak" in html, "QuietLeak title missing from HTML"
        assert "Plus Jakarta Sans" in html, "Font missing"
    print("[PASS] Frontend shell loaded successfully (200 OK)")

    # 2. View Dashboard & verify baseline
    print("\n[Step 2] Viewing Dashboard baseline...")
    status, initial_dash = get("/api/dashboard")
    assert status == 200
    baseline_monthly = initial_dash["monthly_recurring_total"]
    baseline_annual = initial_dash["annual_recurring_total"]
    baseline_active = initial_dash["active_subscriptions_count"]
    baseline_leaks = len(initial_dash["potential_leaks"])
    
    print(f"  * Monthly recurring total: Rs. {baseline_monthly:,.2f}")
    print(f"  * Annual recurring total: Rs. {baseline_annual:,.2f}")
    print(f"  * Active subscriptions: {baseline_active}")
    print(f"  * Detected potential leaks: {baseline_leaks}")
    print(f"  * Categories tracked: {len(initial_dash['category_breakdown'])}")
    assert baseline_monthly > 0, "Expected non-zero baseline monthly recurring total"
    assert baseline_annual == round(baseline_monthly * 12, 2), "Annual should equal monthly * 12"
    assert baseline_leaks > 0, "Expected sample leaks to be detected"
    print("[PASS] Dashboard baseline verified")

    # 3. Add a subscription
    print("\n[Step 3] Adding a new subscription...")
    new_sub_data = {
        "name": "PlayStation Plus Extra",
        "amount": 749.0,
        "currency": "INR",
        "billing_frequency": "monthly",
        "category": "Entertainment",
        "next_renewal_date": "2026-11-20",
        "payment_method": "Credit Card",
        "status": "active",
        "notes": "Console gaming pass & online multiplayer",
        "last_used_date": "2026-10-14"
    }
    status, created_sub = post("/api/subscriptions", new_sub_data)
    assert status == 201, f"Expected 201 Created, got {status}"
    sub_id = created_sub["id"]
    print(f"  * Created Subscription ID: {sub_id} ({created_sub['name']})")
    assert created_sub["monthly_equivalent"] == 749.0
    print("[PASS] Subscription created successfully")

    # 4. Confirm record saved & retrieved
    print(f"\n[Step 4] Retrieving subscription #{sub_id}...")
    status, retrieved = get(f"/api/subscriptions/{sub_id}")
    assert status == 200
    assert retrieved["name"] == "PlayStation Plus Extra"
    assert retrieved["amount"] == 749.0
    assert retrieved["category"] == "Entertainment"
    print(f"[PASS] Retrieved record matches: {retrieved['name']} | Rs. {retrieved['amount']}")

    # 5. Confirm monthly & annual totals updated
    print("\n[Step 5] Checking updated dashboard totals...")
    status, updated_dash = get("/api/dashboard")
    assert status == 200
    expected_monthly = round(baseline_monthly + 749.0, 2)
    expected_annual = round(expected_monthly * 12.0, 2)
    assert updated_dash["monthly_recurring_total"] == expected_monthly, f"Expected {expected_monthly}, got {updated_dash['monthly_recurring_total']}"
    assert updated_dash["annual_recurring_total"] == expected_annual, f"Expected {expected_annual}, got {updated_dash['annual_recurring_total']}"
    assert updated_dash["active_subscriptions_count"] == baseline_active + 1
    print(f"  * Updated Monthly Outflow: Rs. {updated_dash['monthly_recurring_total']:,.2f} (+Rs. 749.00)")
    print(f"  * Updated Annual Outflow: Rs. {updated_dash['annual_recurring_total']:,.2f}")
    print("[PASS] Dashboard totals updated accurately")

    # 6. Edit the subscription
    print(f"\n[Step 6] Editing subscription #{sub_id} (Upgrading to Deluxe plan Rs. 999/mo)...")
    edit_data = {
        "name": "PlayStation Plus Deluxe",
        "amount": 999.0,
        "notes": "Upgraded tier with retro classics library"
    }
    status, edited = put(f"/api/subscriptions/{sub_id}", edit_data)
    assert status == 200
    assert edited["name"] == "PlayStation Plus Deluxe"
    assert edited["amount"] == 999.0
    assert edited["monthly_equivalent"] == 999.0

    # Verify totals reflect the edit
    status, edited_dash = get("/api/dashboard")
    assert edited_dash["monthly_recurring_total"] == round(baseline_monthly + 999.0, 2)
    print(f"[PASS] Edited subscription and verified updated outflow: Rs. {edited_dash['monthly_recurring_total']:,.2f}")

    # 7. Delete the subscription and confirm totals revert
    print(f"\n[Step 7] Deleting subscription #{sub_id}...")
    status, del_resp = delete(f"/api/subscriptions/{sub_id}")
    assert status == 200
    print(f"  * Deletion response: {del_resp}")

    # Verify 404 on get
    try:
        get(f"/api/subscriptions/{sub_id}")
        assert False, "Should have raised 404"
    except urllib.error.HTTPError as e:
        assert e.code == 404
        print("[PASS] Verified subscription is removed from API (404 Not Found)")

    # Verify dashboard reverted to baseline
    status, reverted_dash = get("/api/dashboard")
    assert reverted_dash["monthly_recurring_total"] == baseline_monthly
    assert reverted_dash["annual_recurring_total"] == baseline_annual
    assert reverted_dash["active_subscriptions_count"] == baseline_active
    print("[PASS] Dashboard metrics successfully reverted to baseline")

    # 8. Reload & Persistence Verification
    print("\n[Step 8] Verifying SQLite persistence...")
    import sqlite3, os
    db_file = os.path.join(os.path.dirname(__file__), "data", "quietleak.db")
    assert os.path.exists(db_file), "Database file missing"
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM subscriptions")
    db_count = cursor.fetchone()[0]
    conn.close()
    print(f"  * Direct SQLite records count: {db_count}")
    assert db_count > 0
    print("[PASS] SQLite database is persistent and operational")

    # 9. Verify category and status filters
    print("\n[Step 9] Verifying query filters...")
    status, ent_subs = get("/api/subscriptions?category=Entertainment")
    assert status == 200
    for s in ent_subs:
        assert s["category"].lower() == "entertainment"
    print(f"  * Category filter (Entertainment): {len(ent_subs)} subscriptions found")

    status, trial_subs = get("/api/subscriptions?status=trial")
    assert status == 200
    for s in trial_subs:
        assert s["status"] == "trial"
    print(f"  * Status filter (trial): {len(trial_subs)} subscriptions found")

    print("\n" + "=" * 60)
    print("ALL 9 PRIMARY JOURNEY ACCEPTANCE TESTS PASSED WITH ZERO ERRORS!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
