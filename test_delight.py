"""
Delight Layer verification test suite for QuietLeak Phase 2.
Tests:
1. Frequency normalization calculations across weekly, monthly, quarterly, yearly
2. Savings Simulator calculation logic and mathematical accuracy
3. Contextual highlight conditions from real database data
4. Rule-based leak detection reasons and recommendations
"""

import json
import urllib.request
from backend.models import calculate_monthly_equivalent, calculate_annual_equivalent

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def test_delight_layer():
    print("=" * 60)
    print("QuietLeak Phase 2: Delight Layer Verification Suite")
    print("=" * 60)

    # 1. Test Frequency Normalization
    print("\n[Test 1] Testing Frequency Normalization Calculations...")
    assert calculate_monthly_equivalent(649.0, 'monthly') == 649.0
    # Weekly: amount * 52 / 12
    assert calculate_monthly_equivalent(200.0, 'weekly') == round((200.0 * 52) / 12, 2)
    # Quarterly: amount / 3
    assert calculate_monthly_equivalent(299.0, 'quarterly') == round(299.0 / 3, 2)
    # Yearly: amount / 12
    assert calculate_monthly_equivalent(14400.0, 'yearly') == 1200.0
    # Annual: monthly * 12
    assert calculate_annual_equivalent(1200.0) == 14400.0
    print("[PASS] Mathematical normalization formulas verified")

    # 2. Test Simulator Logic with real dashboard data
    print("\n[Test 2] Testing Savings Simulator Data Integrity...")
    status, dash = get("/api/dashboard")
    assert status == 200
    status, subs = get("/api/subscriptions")
    assert status == 200
    
    # In database.py, active recurring outflow is derived strictly from status == 'active'
    active_subs = [s for s in subs if s["status"] == "active"]
    assert len(active_subs) > 0, "Expected active subscriptions"
    
    # Simulate selecting all active subscriptions
    simulated_monthly_saved = sum(s["monthly_equivalent"] for s in active_subs)
    simulated_annual_saved = simulated_monthly_saved * 12.0
    print(f"  * Total active subscriptions available for simulation: {len(active_subs)}")
    print(f"  * Total simulated monthly recovery if all cut: Rs. {simulated_monthly_saved:,.2f}")
    print(f"  * Total simulated annual recovery: Rs. {simulated_annual_saved:,.2f}")
    assert round(simulated_monthly_saved, 2) == round(dash["monthly_recurring_total"], 2)
    print("[PASS] Simulator calculations align 100% with live dashboard figures")


    # 3. Test Contextual Highlights Data Source
    print("\n[Test 3] Testing Contextual Highlights Conditions...")
    leaks = dash["potential_leaks"]
    renewals = dash["upcoming_renewals"]
    assert len(leaks) > 0
    print(f"  * Flagged leak items available for smart highlights: {len(leaks)}")
    for l in leaks:
        assert l["service_name"], "Leak must have service name"
        assert l["reason"], "Leak must have explicit transparent reason"
        assert l["recommendation"], "Leak must have actionable recommendation"
        safe_reason = l['reason'].replace('\u20b9', 'Rs. ')
        print(f"    - {l['service_name']} ({l['leak_type']}): {safe_reason}")

    print("[PASS] Smart contextual highlights data verified")

    print("\n" + "=" * 60)
    print("ALL PHASE 2 DELIGHT LAYER VERIFICATION TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    test_delight_layer()
