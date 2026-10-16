"""
QuietLeak: Web Audio Sound Engine & Clean Subscriptions Interface Verification
Tests:
1. Web Audio API SoundEngine implementation & sound cues
2. Sound toggles (Desktop header, Mobile header, Settings)
3. Irrelevant Customers tab cleanly removed:
   - Desktop and Mobile navigation restored to "Subscriptions"
   - Screen C restored to pure Subscriptions layout
   - Customer view switchers, customer KPI banner, and customer modals removed
4. Subscriptions management and API integrity preserved
"""

import sys
import json
import urllib.request
import urllib.error

API_BASE = "http://127.0.0.1:8000"

def get(path):
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode('utf-8')

def run_tests():
    print("=" * 70)
    print("QUIETLEAK: SOUND ENGINE & SUBSCRIPTIONS INTERFACE VERIFICATION")
    print("=" * 70)

    # 1. Verify frontend markup for Sound Controls
    print("\n[Test 1] Verifying frontend markup for Sound Controls...")
    code, html = get("/")
    assert code == 200, "Failed to load index.html"

    # Sound controls
    assert 'id="sound-toggle-desktop"' in html, "Missing #sound-toggle-desktop in header"
    assert 'id="sound-toggle-mobile"' in html, "Missing #sound-toggle-mobile in mobile header"
    assert 'id="pref-sound-toggle"' in html, "Missing #pref-sound-toggle in Settings screen"
    print("  * Verified Sound toggles: desktop header, mobile header, and settings")

    # 2. Verify that Customer tab and customer modals have been removed
    print("\n[Test 2] Verifying Customers tab has been cleanly removed...")
    assert 'Customers & Subs' not in html, "Customers & Subs label still present in index.html"
    assert 'id="btn-view-customers"' not in html, "Customer switcher #btn-view-customers still present"
    assert 'id="customer-kpi-banner"' not in html, "#customer-kpi-banner still present"
    assert 'id="customers-grid"' not in html, "#customers-grid still present"
    assert 'id="customer-detail-modal"' not in html, "#customer-detail-modal still present"
    assert 'id="customer-modal"' not in html, "#customer-modal still present"
    
    # Subscriptions restored cleanly
    assert 'id="nav-btn-subscriptions"' in html, "Missing #nav-btn-subscriptions"
    assert 'id="subscriptions-grid"' in html, "Missing #subscriptions-grid"
    assert 'id="subscriptions-empty-state"' in html, "Missing #subscriptions-empty-state"
    print("  * Verified navigation and Screen C restored to pure Subscriptions interface")
    print("  * Verified all customer modals and directory grids removed")

    # 3. Verify app.js SoundEngine implementation
    print("\n[Test 3] Verifying SoundEngine in js/app.js...")
    code, js = get("/js/app.js")
    assert code == 200, "Failed to load js/app.js"
    assert "class SoundEngine" in js, "SoundEngine class not found in js/app.js"
    assert "AudioContext" in js or "webkitAudioContext" in js, "Web Audio API AudioContext not used"
    
    sound_types = ['click', 'pop', 'modal-open', 'modal-close', 'success', 'pip', 'theme', 'celebration', 'step', 'delete', 'toggle']
    for st in sound_types:
        assert f"'{st}'" in js or f'"{st}"' in js, f"Missing sound cue definition for '{st}'"
        print(f"  * Verified synthesized sound cue: '{st}'")
    
    assert "playUiSound" in js, "playUiSound helper function not found"
    assert "toggleSound" in js, "toggleSound helper function not found"
    print("  * Verified SoundEngine synthesis and public sound triggers")

    # 4. Verify Subscriptions API
    print("\n[Test 4] Verifying Subscriptions backend API...")
    code, subs_json = get("/api/subscriptions")
    assert code == 200
    subs = json.loads(subs_json)
    print(f"  * Subscriptions count in database: {len(subs)}")
    assert len(subs) > 0, "No subscriptions in database"

    code, dash_json = get("/api/dashboard")
    assert code == 200
    dash = json.loads(dash_json)
    print(f"  * Monthly recurring spend: Rs.{dash['monthly_recurring_total']}")
    print(f"  * Potential leak savings: Rs.{dash['potential_savings_monthly']}")

    print("\n" + "=" * 70)
    print("ALL SOUND ENGINE & SUBSCRIPTIONS VERIFICATION TESTS PASSED (100%)!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
