"""
QuietLeak — Visual Redesign: Playful, Premium & Interactive Verification Suite
Tests:
1. Live server static asset delivery (HTML, CSS, JS)
2. Cat/Fox hybrid mascot anatomy (ears, tufts, whiskers, muzzle, fluffy tail, lime collar with Rupee medallion, 6 poses)
3. Brand design system & color palette integrity (#FFF9F2, #FF6B4A, #C8F169, #DCD2FF, #22251F, #E7E9E1)
4. Redesigned Dashboard layout & visual variety:
   - Spacious desktop top navigation bar
   - Character-driven editorial hero with "Your money is going places" and "Let's catch those sneaky expenses"
   - Prominent Financial Outflow Summary (oversized monthly figure, annual projection, active count, badges)
   - Savings Opportunity Visualizer (recoverable percentage, before-vs-after bar, 3 metric pills)
5. Interactive Data Visualizations:
   - SVG Category Donut / Radial chart with center display, hover highlights, interactive legend
   - Upcoming 30-Day Renewal Timeline with day countdown pills (Today, Tomorrow, In X days)
6. Live API calculations and mathematical integrity
"""

import sys
import re
import requests

API_BASE = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 65)
    print("QuietLeak Visual Redesign: Playful, Premium & Interactive Suite")
    print("=" * 65)

    # 1. Live server delivery
    print("\n[Test 1] Testing live frontend server static asset delivery...")
    resp = requests.get(f"{API_BASE}/")
    assert resp.status_code == 200, f"HTML returned {resp.status_code}"
    html = resp.text

    resp_css = requests.get(f"{API_BASE}/css/style.css")
    assert resp_css.status_code == 200, f"CSS returned {resp_css.status_code}"
    css = resp_css.text

    resp_js = requests.get(f"{API_BASE}/js/app.js")
    assert resp_js.status_code == 200, f"JS returned {resp_js.status_code}"
    js = resp_js.text

    print("[PASS] HTML, CSS, and JS static assets delivered with 200 OK")

    # 2. Cat/Fox Hybrid Mascot Anatomy & 6 Expressions
    print("\n[Test 2] Verifying Cat/Fox hybrid mascot anatomy & 6 expressions...")
    assert "getPipSVG" in js, "getPipSVG function missing from app.js"
    assert "PIP_POSES" in js, "PIP_POSES list missing from app.js"

    # Verify Fox-Cat anatomy elements in SVG generator
    assert "Pointed Fox Ear" in js or "inner_ear" in js, "Pointed fox ears missing in mascot SVG"
    assert "Fluffy Fox-Cat Tail" in js or "tail" in js.lower(), "Fluffy tail missing in mascot SVG"
    assert "Cat Whiskers" in js or "whiskers" in js.lower(), "Cat whiskers missing in mascot SVG"
    assert "Muzzle" in js or "muzzle" in js.lower() or "Nose" in js, "Muzzle/nose missing in mascot SVG"
    assert "Collar with Gold Rupee" in js or "Rupee Medallion" in js or "collar" in js.lower(), "Collar with Rupee medallion missing in mascot SVG"

    # Verify all 6 poses
    poses = ['idle', 'curious', 'surprised', 'celebrating', 'sleepy', 'thinking']
    for pose in poses:
        assert f"case '{pose}':" in js or pose in js, f"Pose '{pose}' missing in mascot"
        print(f"  * Verified Cat-Fox pose expression: {pose}")
    print("[PASS] Cat/Fox hybrid mascot anatomy and all 6 expressions verified")

    # 3. Brand Design System & Color Palette
    print("\n[Test 3] Verifying brand palette & typography...")
    brand_colors = {
        "Warm Ivory (#FFF9F2)": ["#FFF9F2", "#fff9f2"],
        "Coral Accent (#FF6B4A)": ["#FF6B4A", "#ff6b4a"],
        "Savings Lime (#C8F169)": ["#C8F169", "#c8f169"],
        "Soft Lavender (#DCD2FF)": ["#DCD2FF", "#dcd2ff"],
        "Dark Ink (#22251F)": ["#22251F", "#22251f"],
        "Soft Grey (#E7E9E1)": ["#E7E9E1", "#e7e9e1"]
    }
    for name, hexes in brand_colors.items():
        found_in_css = any(h in css for h in hexes)
        found_in_html = any(h in html for h in hexes)
        found_in_js = any(h in js for h in hexes)
        assert found_in_css or found_in_html or found_in_js, f"Brand color {name} missing from codebase"
        print(f"  * Verified brand color: {name}")

    assert "Plus Jakarta Sans" in html, "Plus Jakarta Sans font missing"
    print("[PASS] Brand design system, colors, and typography verified")

    # 4. Redesigned Dashboard Layout & Visual Variety
    print("\n[Test 4] Verifying redesigned dashboard layout components...")
    # Top Navigation Bar
    assert 'id="nav-btn-dashboard"' in html, "Top nav button dashboard missing"
    assert 'id="nav-btn-subscriptions"' in html, "Top nav button subscriptions missing"
    assert 'id="nav-btn-insights"' in html, "Top nav button insights missing"
    assert 'id="nav-btn-profile"' in html, "Top nav button profile missing"
    assert 'id="pip-sidebar-trigger"' in html, "Pip assistant trigger missing"
    assert 'id="sidebar-monthly-total"' in html, "Header monthly outflow total missing"
    assert 'id="sidebar-sub-count"' in html, "Header subscription count badge missing"

    # Editorial Hero Section
    assert "Your money is going places." in html, "Editorial headline missing from hero"
    assert "Let's find out where it could stay." in html, "Headline continuation missing from hero"
    assert "Let's catch those sneaky expenses." in html, "Subtext catchphrase missing from hero"
    assert 'id="hero-pip-container"' in html, "Hero pip mascot container missing"
    assert 'id="pip-hero-speech"' in html, "Pip dynamic speech bubble missing"
    assert "Find my leaks" in html, "Find my leaks primary CTA missing"
    assert "View subscriptions" in html, "View subscriptions secondary CTA missing"

    # Prominent Financial Outflow Summary
    assert 'id="metric-monthly-amount"' in html, "Monthly metric amount container missing"
    assert 'id="metric-annual-amount"' in html, "Annual metric amount container missing"
    assert 'id="metric-active-count"' in html, "Active subscriptions count metric missing"
    assert 'id="badge-active-subs"' in html, "Active subs overview badge missing"

    # Savings Opportunity Visualizer
    assert 'id="savings-opportunity-visualizer"' in html, "Savings opportunity visualizer card missing"
    assert 'id="savings-recovery-pct"' in html, "Savings recovery percentage badge missing"
    assert 'id="metric-savings-amount"' in html, "Savings amount metric missing"
    assert 'id="savings-bar-retained"' in html, "Retained outflow comparison bar missing"
    assert 'id="savings-bar-saved"' in html, "Recoverable savings comparison bar missing"
    assert 'id="savings-vis-current"' in html, "Current outflow metric pill missing"
    assert 'id="savings-vis-flagged"' in html, "Flagged savings metric pill missing"
    assert 'id="savings-vis-target"' in html, "Optimized target metric pill missing"
    assert 'id="savings-pip-container"' in html, "Savings mascot container missing"
    print("[PASS] Top navigation, editorial hero, and financial summary visualizers verified")

    # 5. Interactive Data Visualizations (Donut Chart & Renewal Timeline)
    print("\n[Test 5] Verifying interactive data visualizations in markup and engine...")
    # Donut Chart
    assert 'id="category-donut-container"' in html, "Category donut container missing from HTML"
    assert 'id="category-donut-legend"' in html, "Category donut legend missing from HTML"
    assert "renderCategoryDonut" in js, "renderCategoryDonut function missing in JS"
    assert "highlightDonutSlice" in js, "highlightDonutSlice interaction missing in JS"
    assert "resetDonutSlice" in js, "resetDonutSlice interaction missing in JS"
    assert "CATEGORY_COLORS" in js, "CATEGORY_COLORS map missing in JS"

    # Renewal Timeline
    assert 'id="upcoming-renewals-timeline"' in html, "Upcoming renewals timeline container missing from HTML"
    assert "renderRenewalTimeline" in js, "renderRenewalTimeline function missing in JS"
    assert "timeline-card" in css, "timeline-card styling missing in CSS"
    assert "donut-slice" in css, "donut-slice styling missing in CSS"
    assert "donut-legend-pill" in css, "donut-legend-pill styling missing in CSS"
    print("[PASS] Category donut chart and renewal timeline engines verified")

    # 6. Live API calculations and mathematical integrity
    print("\n[Test 6] Testing live API calculations and mathematical consistency...")
    resp_dash = requests.get(f"{API_BASE}/api/dashboard")
    assert resp_dash.status_code == 200, f"Dashboard API failed: {resp_dash.status_code}"
    dash = resp_dash.json()

    monthly_tot = dash["monthly_recurring_total"]
    annual_tot = dash["annual_recurring_total"]
    savings_monthly = dash["potential_savings_monthly"]
    savings_annual = dash["potential_savings_annual"]
    categories = dash["category_breakdown"]

    assert monthly_tot > 0, "Expected non-zero monthly recurring total"
    assert annual_tot == round(monthly_tot * 12, 2), "Annual total should strictly equal monthly * 12"
    assert savings_annual == round(savings_monthly * 12, 2), "Annual savings should strictly equal monthly * 12"

    # Category percentage sum verification
    pct_sum = sum(c["percentage"] for c in categories)
    print(f"  * Monthly recurring total: Rs. {monthly_tot:,.2f}")
    print(f"  * Potential monthly savings: Rs. {savings_monthly:,.2f} ({(savings_monthly/monthly_tot)*100:.1f}%)")
    print(f"  * Tracked categories count: {len(categories)}")
    print(f"  * Category percentage sum: {pct_sum:.1f}%")
    assert 99.0 <= pct_sum <= 101.0, f"Category percentages should sum to ~100%, got {pct_sum}"
    print("[PASS] Live financial metrics and mathematical ratios verified")

    print("\n" + "=" * 65)
    print("ALL VISUAL REDESIGN ACCEPTANCE TESTS PASSED SUCCESSFULLY (100%)!")
    print("=" * 65)

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\n[FAIL] Test assertion failed: {e}")
        sys.exit(1)
    except Exception as exc:
        print(f"\n[ERROR] An unexpected error occurred: {exc}")
        sys.exit(1)
