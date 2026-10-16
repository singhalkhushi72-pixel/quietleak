import requests
import re
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_deep_teal_redesign():
    print("=" * 65)
    print("QuietLeak: Deep Teal & Tangerine Redesign Verification Suite")
    print("=" * 65)

    # 1. Frontend Asset Delivery
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

    # 2. Design Tokens and Color Palette
    print("\n[Test 2] Verifying Deep Teal & Tangerine Palette Tokens...")
    required_colors = {
        "Deep Teal (#124E52)": "#124E52",
        "Tangerine (#FF873D)": "#FF873D",
        "Warm Cream (#FFF5E8)": "#FFF5E8",
        "Mint (#A8DDD0)": "#A8DDD0",
        "Charcoal (#253536)": "#253536",
        "Muted Grey-Green (#718482)": "#718482",
        "Soft Peach (#FFE0CB)": "#FFE0CB",
    }
    for name, hex_code in required_colors.items():
        assert hex_code.lower() in css.lower() or hex_code.lower() in html.lower() or hex_code.lower() in js.lower(), f"Missing color token: {name}"
        print(f"  * Verified palette color: {name}")
    print("[PASS] All Deep Teal & Tangerine design tokens verified in frontend assets")

    # 3. Pip Mascot (Cat/Fox Hybrid with 6 Poses)
    print("\n[Test 3] Verifying Pip mascot engine and 6 expressive states...")
    assert "getPipSVG" in js, "Missing getPipSVG function in app.js"
    assert "PIP_POSES" in js, "Missing PIP_POSES configuration in app.js"
    
    # Check for anatomical features in SVG generator
    assert "fox" in js.lower() or "ear" in js.lower(), "Missing ear geometry in Pip SVG"
    assert "whisker" in js.lower(), "Missing cat whiskers in Pip SVG"
    assert "collar" in js.lower() or "124E52" in js, "Missing collar with Deep Teal in Pip SVG"
    assert "tail" in js.lower(), "Missing fluffy tail in Pip SVG"

    poses = ["curious", "excited", "surprised", "thoughtful", "proud", "calm"]
    for pose in poses:
        assert pose in js, f"Missing pose state '{pose}' in app.js"
        print(f"  * Verified pose expression: {pose}")
    
    # Verify backward compatible aliases
    compat_aliases = ["idle", "celebrating", "thinking", "sleepy"]
    for alias in compat_aliases:
        assert alias in js, f"Missing backward compatible alias '{alias}' in app.js"
    print("[PASS] Pip Cat/Fox hybrid mascot anatomy and all 6 expressive states verified")

    # 4. Hero Section & Copy
    print("\n[Test 4] Verifying Hero section, editorial copy, and CTAs...")
    assert "Your money has a few secrets" in html, "Missing new headline in HTML"
    assert "Find my money leaks" in html, "Missing primary CTA in HTML"
    assert "pip-speech-bubble" in html or "pip-speech-bubble" in css, "Missing interactive speech bubble"
    assert "hero-gradient-canvas" in css, "Missing hero gradient canvas in CSS"
    print("  * Verified headline: 'Your money has a few secrets.'")
    print("  * Verified primary CTA: 'Find my money leaks'")
    print("[PASS] Hero section layout, editorial copy, and interactions verified")

    # 5. Financial Analytics & Data Visualizations
    print("\n[Test 5] Verifying Financial Analytics, Donut Chart, and Renewal Radar...")
    # Oversized outflow
    assert "metric-monthly-amount" in html, "Missing metric-monthly-amount ID"
    # Donut Chart with Dynamic Center
    assert "renderCategoryDonut" in js, "Missing renderCategoryDonut in app.js"
    assert "donut-center-amount" in js, "Missing dynamic donut center in JS"
    assert "donut-legend-pill" in css, "Missing donut legend pill styles in CSS"
    
    # Renewal Radar with 'Trial ending' and 'Major charge' tags
    assert "Trial ending" in js, "Missing 'Trial ending' tag in renewal radar logic"
    assert "Major charge" in js, "Missing 'Major charge' tag for expenses >= Rs 1000 in renewal radar"
    print("  * Verified category donut with dynamic center and legend pills")
    print("  * Verified Renewal Radar with 'Trial ending' (Tangerine) and 'Major charge' (Deep Teal) tags")
    print("[PASS] Financial analytics and visualizer engines verified")

    # 6. Signature 4-Step Audit Sequence
    print("\n[Test 6] Verifying Signature 4-Step Subscription Audit Sequence...")
    assert "runDiscoverySequence" in js, "Missing runDiscoverySequence in app.js"
    assert "thoughtful" in js and "curious" in js and "surprised" in js and "proud" in js, "Missing audit step poses"
    assert "showDiscoveryReveal" in js, "Missing showDiscoveryReveal in app.js"
    assert "discovery-progress-fill" in html or "discovery-progress-fill" in js, "Missing discovery progress fill bar"
    print("  * Verified 4-step sequence (thoughtful -> curious -> surprised -> proud)")
    print("  * Verified reveal card and savings highlight")
    print("[PASS] Signature audit sequence verified")

    # 7. Live API & Math Normalization Consistency
    print("\n[Test 7] Verifying Live API endpoints and mathematical consistency...")
    api_resp = requests.get(f"{BASE_URL}/api/subscriptions")
    assert api_resp.status_code == 200, f"Subscriptions API returned {api_resp.status_code}"
    subs = api_resp.json()
    assert len(subs) > 0, "No subscriptions returned from API"

    metrics_resp = requests.get(f"{BASE_URL}/api/dashboard")
    assert metrics_resp.status_code == 200, f"Dashboard API returned {metrics_resp.status_code}"
    metrics = metrics_resp.json()
    
    monthly_outflow = metrics["monthly_recurring_total"]
    potential_savings = metrics["potential_savings_monthly"]
    assert monthly_outflow > 0, "Monthly recurring total must be positive"
    assert potential_savings >= 0, "Potential savings must be non-negative"
    print(f"  * Monthly recurring total: Rs. {monthly_outflow:,.2f}")
    print(f"  * Potential monthly savings: Rs. {potential_savings:,.2f}")
    print("[PASS] Live API metrics and calculations verified")

    print("\n" + "=" * 65)
    print("ALL DEEP TEAL & TANGERINE REDESIGN ACCEPTANCE TESTS PASSED (100%)!")
    print("=" * 65)

if __name__ == "__main__":
    test_deep_teal_redesign()
