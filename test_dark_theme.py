import requests
import re
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_dark_theme():
    print("=" * 65)
    print("QuietLeak: Dark Theme Settings & Interaction Verification Suite")
    print("=" * 65)

    # 1. Static asset delivery
    print("\n[Test 1] Testing static asset delivery...")
    html_resp = requests.get(f"{BASE_URL}/")
    assert html_resp.status_code == 200, f"HTML returned {html_resp.status_code}"
    html = html_resp.text

    css_resp = requests.get(f"{BASE_URL}/css/style.css")
    assert css_resp.status_code == 200, f"CSS returned {css_resp.status_code}"
    css = css_resp.text

    js_resp = requests.get(f"{BASE_URL}/js/app.js")
    assert js_resp.status_code == 200, f"JS returned {js_resp.status_code}"
    js = js_resp.text
    print("[PASS] HTML, CSS, and JS static assets loaded successfully")

    # 2. Settings screen Dark Theme UI
    print("\n[Test 2] Verifying Appearance & Theme Card in Settings...")
    assert 'id="settings-theme-card"' in html, "Missing #settings-theme-card in HTML"
    assert "Appearance & Theme" in html, "Missing 'Appearance & Theme' heading in HTML"
    assert 'id="theme-quick-switch"' in html, "Missing #theme-quick-switch toggle in Settings"
    assert 'id="theme-opt-light"' in html, "Missing #theme-opt-light card in Settings"
    assert 'id="theme-opt-dark"' in html, "Missing #theme-opt-dark card in Settings"
    assert 'id="theme-opt-system"' in html, "Missing #theme-opt-system card in Settings"
    print("  * Verified Appearance & Theme card in Settings")
    print("  * Verified 3 theme options: Light Mode, Dark Mode, System Sync")
    print("  * Verified quick toggle switch in Settings")
    print("[PASS] Settings screen Dark Theme UI markup verified")

    # 3. Quick Header Toggles
    print("\n[Test 3] Verifying Desktop and Mobile Header Quick Toggles...")
    assert 'id="theme-toggle-desktop"' in html, "Missing #theme-toggle-desktop in header"
    assert 'id="theme-toggle-mobile"' in html, "Missing #theme-toggle-mobile in header"
    assert "toggleTheme()" in html, "Missing toggleTheme() onclick triggers in header"
    print("  * Verified desktop header toggle: #theme-toggle-desktop")
    print("  * Verified mobile header toggle: #theme-toggle-mobile")
    print("[PASS] Header quick theme toggle buttons verified")

    # 4. Anti-FOUC and Tailwind Configuration
    print("\n[Test 4] Verifying Tailwind dark mode and anti-FOUC initialization...")
    assert "darkMode: 'class'" in html or 'darkMode: "class"' in html, "Tailwind config missing darkMode: 'class'"
    assert "quietleak_theme" in html, "Missing anti-FOUC theme loader in <head>"
    print("  * Verified Tailwind darkMode: 'class' configuration")
    print("  * Verified anti-FOUC script in HTML <head>")
    print("[PASS] Anti-FOUC and Tailwind dark mode engine verified")

    # 5. Theme Engine in app.js
    print("\n[Test 5] Verifying Theme Engine implementation in app.js...")
    theme_functions = ["initTheme", "applyTheme", "setTheme", "toggleTheme", "toggleDarkSwitch", "updateThemeUI"]
    for fn in theme_functions:
        assert fn in js, f"Missing function {fn} in app.js"
        print(f"  * Verified theme function: {fn}()")
    assert "initTheme()" in js, "Missing initTheme() call during DOMContentLoaded"
    print("[PASS] Theme engine functions and DOM initialization verified")

    # 6. Dark Theme CSS Design System
    print("\n[Test 6] Verifying Dark Theme CSS Design System in style.css...")
    dark_selectors = [
        "html.dark",
        "body.dark",
        "html.dark header",
        "html.dark nav",
        "html.dark .card-soft",
        "html.dark .pip-speech-bubble",
        "html.dark input",
        "html.dark .donut-legend-pill",
        "html.dark .theme-option-card",
    ]
    for sel in dark_selectors:
        assert sel in css, f"Missing dark selector {sel} in style.css"
        print(f"  * Verified dark selector: {sel}")
    print("[PASS] Dark Theme CSS design rules and component styling verified")

    print("\n" + "=" * 65)
    print("ALL DARK THEME SETTINGS & INTEGRATION TESTS PASSED (100%)!")
    print("=" * 65)

if __name__ == "__main__":
    test_dark_theme()
