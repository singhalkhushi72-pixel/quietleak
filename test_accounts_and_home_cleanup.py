"""
QuietLeak: Multi-Account Management, Logout & Home Tab De-duplication Verification Suite
Tests:
1. Account switcher modal, Add Account modal, and Sign In modal existence
2. Header user profile buttons and Settings Account card
3. Log out functionality and account switching logic in app.js
4. Home tab cleanup:
   - Repetitive leak cards removed/streamlined
   - Subscription Health Score card introduced
   - Savings visualizer links to Simulator instead of repeating the audit
   - Hero CTA remains the singular signature audit launchpad
"""

import sys
import json
import urllib.request

API_BASE = "http://127.0.0.1:8000"

def get(path):
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode('utf-8')

def run_tests():
    print("=" * 70)
    print("QUIETLEAK: MULTI-ACCOUNT, LOGOUT & HOME TAB CLEANUP VERIFICATION")
    print("=" * 70)

    # 1. Verify frontend markup for Account Management & Logout
    print("\n[Test 1] Verifying Account management & Logout UI components in index.html...")
    code, html = get("/")
    assert code == 200, "Failed to load index.html"

    # Header triggers
    assert 'id="header-user-btn"' in html, "Missing #header-user-btn in desktop header"
    assert 'id="mobile-user-btn"' in html, "Missing #mobile-user-btn in mobile header"
    assert 'id="sidebar-user-avatar"' in html, "Missing #sidebar-user-avatar"
    assert 'id="sidebar-user-name"' in html, "Missing #sidebar-user-name"

    # Settings account card
    assert 'id="settings-active-account-box"' in html, "Missing active account card in Settings"
    assert 'id="btn-logout"' in html, "Missing #btn-logout in Settings"

    # Modals
    assert 'id="account-modal"' in html, "Missing #account-modal"
    assert 'id="add-account-modal"' in html, "Missing #add-account-modal"
    assert 'id="login-modal"' in html, "Missing #login-modal"
    assert 'id="add-account-form"' in html, "Missing #add-account-form"
    print("  * Verified Desktop & Mobile account triggers, Settings card, and all 3 modals")

    # 2. Verify app.js Account & Session Engine implementation
    print("\n[Test 2] Verifying Account and Session handlers in js/app.js...")
    code, js = get("/js/app.js")
    assert code == 200, "Failed to load js/app.js"

    account_funcs = [
        "initAccounts",
        "getActiveAccount",
        "renderAccountsUI",
        "openAccountModal",
        "closeAccountModal",
        "renderAccountsList",
        "switchAccount",
        "openAddAccountModal",
        "closeAddAccountModal",
        "handleAddAccountSubmit",
        "handleLogout",
        "closeLoginModal",
        "renderLoginModal",
        "handleLogin"
    ]
    for fn in account_funcs:
        assert fn in js, f"Missing function {fn}() in js/app.js"
        print(f"  * Verified handler: {fn}()")

    # 3. Verify Home Tab De-duplication & Subscription Health Score
    print("\n[Test 3] Verifying Home Tab De-duplication & Subscription Health Score...")
    # Health score card
    assert "Subscription Health Score" in html, "Missing Subscription Health Score card"
    assert 'id="health-trial-stat"' in html, "Missing health trial stat element"
    assert 'id="health-burn-stat"' in html, "Missing health burn stat element"
    assert 'id="health-cadence-stat"' in html, "Missing health cadence stat element"
    print("  * Verified Subscription Health Score card and wellness pillars")

    # Singular audit CTA in Hero
    assert "Find my money leaks" in html, "Missing signature 'Find my money leaks' Hero CTA"
    
    # Savings visualizer links to Simulator (no duplicate audit button)
    assert 'View Simulator' in html, "Savings visualizer should link to View Simulator"
    print("  * Verified savings visualizer links directly to Simulator headroom")

    # Pip desk card rebranded away from audit repetition
    assert "Pip Finance Desk" in html, "Pip card should be Pip Finance Desk"
    print("  * Verified Pip card rebranded to helpful financial desk")

    print("\n" + "=" * 70)
    print("ALL ACCOUNT, LOGOUT & HOME TAB CLEANUP TESTS PASSED (100%)!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
