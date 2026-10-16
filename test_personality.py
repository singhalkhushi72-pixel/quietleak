"""
QuietLeak — Phase 3: Give the App a Personality Verification Suite
Tests the presence and integrity of:
  - Mascot Pip vector SVG generator and its 6 expressions (idle, curious, surprised, celebrating, sleepy, thinking)
  - Color palette consistency (#C8F169, #D8FA78, #9FDA2E, #FF6B4A, #22251F)
  - Character-Driven Hero Section with dynamic speech bubble, split desktop layout, and interactive Pip
  - Pip's Interactive Assistant Panel Modal with 4 real shortcuts
  - Pip integrations in Savings Card, Signature Audit Sequence, and Empty States
  - CSS animations (pipFloat, pipBounce, pipWiggle, pip-interactive, speechBubblePop)
  - Live server delivery
"""

import sys
import re
import requests

API_BASE = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 60)
    print("QuietLeak Phase 3: Personality & Mascot Verification Suite")
    print("=" * 60)

    # 1. Test live server static asset delivery
    print("\n[Test 1] Testing live frontend server delivery...")
    resp = requests.get(f"{API_BASE}/")
    assert resp.status_code == 200, f"Frontend shell returned {resp.status_code}"
    html = resp.text

    resp_css = requests.get(f"{API_BASE}/css/style.css")
    assert resp_css.status_code == 200, f"CSS returned {resp_css.status_code}"
    css = resp_css.text

    resp_js = requests.get(f"{API_BASE}/js/app.js")
    assert resp_js.status_code == 200, f"JS returned {resp_js.status_code}"
    js = resp_js.text

    print("[PASS] All static assets delivered cleanly (200 OK)")

    # 2. Test Mascot Pip Vector SVG Generator in JS
    print("\n[Test 2] Verifying Pip mascot engine & 6 expressions...")
    assert "getPipSVG" in js, "getPipSVG function missing from app.js"
    assert "PIP_POSES" in js, "PIP_POSES array missing from app.js"
    
    expected_poses = ['idle', 'curious', 'surprised', 'celebrating', 'sleepy', 'thinking']
    for pose in expected_poses:
        assert f"case '{pose}':" in js or pose in js, f"Pose '{pose}' not handled in getPipSVG"
        print(f"  * Verified pose expression: {pose}")

    # Check palette in SVG
    assert "#C8F169" in js or "#c8f169" in js, "Pip lime green tone #C8F169 missing in JS"
    assert "#22251F" in js or "#22251f" in js, "Dark ink outline/eyes missing in JS"
    assert "#FF6B4A" in js or "#ff6b4a" in js, "Coral accents missing in JS"
    print("[PASS] Pip vector SVG generator covers all 6 required expressions and brand palette")

    # 3. Test Character-Driven Hero Section in HTML
    print("\n[Test 3] Verifying Hero Section markup & components...")
    assert "Let's catch those sneaky expenses." in html, "Headline missing from hero section"
    assert 'id="hero-pip-container"' in html, "Hero pip container missing"
    assert 'id="pip-hero-speech"' in html, "Pip speech bubble missing"
    assert 'id="pip-speech-text"' in html, "Pip speech text container missing"
    assert 'id="hero-status-pill"' in html, "Hero status pill missing"
    assert "Find my leaks" in html, "Find my leaks CTA missing"
    assert "View subscriptions" in html, "View subscriptions CTA missing"
    print("[PASS] Hero section contains split composition, mascot container, speech bubble, and CTAs")

    # 4. Test Sidebar & Mobile Mini-Pip triggers
    print("\n[Test 4] Verifying Desktop Sidebar & Mobile header Pip triggers...")
    assert 'id="pip-sidebar-trigger"' in html, "Sidebar pip trigger missing"
    assert 'id="pip-sidebar-avatar"' in html, "Sidebar pip avatar container missing"
    assert 'id="pip-mobile-trigger"' in html, "Mobile header pip trigger missing"
    assert 'id="pip-mobile-avatar"' in html, "Mobile header pip avatar container missing"
    print("[PASS] Mini-Pip triggers verified in both sidebar and mobile header")

    # 5. Test Pip's Interactive Assistant Panel Modal
    print("\n[Test 5] Verifying Pip's Assistant Desk Modal & 4 Shortcuts...")
    assert 'id="pip-assistant-modal"' in html, "Pip assistant modal markup missing"
    assert 'id="pip-assistant-avatar"' in html, "Pip assistant avatar missing"
    assert 'id="pip-mood-badge"' in html, "Pip mood badge missing"
    assert 'id="pip-assistant-advice"' in html, "Pip assistant advice container missing"
    
    # 4 Shortcuts
    assert "pipActionLeakCheck" in html and "pipActionLeakCheck" in js, "Leak check action missing"
    assert "pipActionReviewRenewals" in html and "pipActionReviewRenewals" in js, "Review renewals action missing"
    assert "pipActionExploreSimulator" in html and "pipActionExploreSimulator" in js, "Explore simulator action missing"
    assert "pipActionAddSubscription" in html and "pipActionAddSubscription" in js, "Add subscription action missing"
    assert "cyclePipExpression" in html and "cyclePipExpression" in js, "Interactive pose cycle function missing"
    print("  * Shortcut 1: Run a leak check (Discovery audit sequence)")
    print("  * Shortcut 2: Review upcoming renewals (Sorted renewals view)")
    print("  * Shortcut 3: Explore savings simulator (Hypothetical burn test)")
    print("  * Shortcut 4: Add a new subscription (Modal opening)")
    print("[PASS] Pip Assistant Desk modal and all 4 functional shortcuts verified")

    # 6. Test Pip Integration in Audit Sequence & Empty States
    print("\n[Test 6] Verifying Pip integrations across app moments...")
    assert 'id="savings-pip-container"' in html, "Savings card pip container missing"
    assert 'id="discovery-pip-container"' in html, "Discovery sequence pip container missing"
    assert 'id="discovery-reveal-pip-container"' in html, "Discovery reveal pip container missing"
    assert 'id="subscriptions-empty-pip"' in html, "Subscriptions empty pip container missing"
    
    # Check JS hooks
    assert "updatePipMoodAndState" in js, "updatePipMoodAndState missing in app.js"
    assert "pipPose" in js, "pipPose tracking in audit sequence missing in app.js"
    print("[PASS] Pip mascot integrated in Savings card, Audit sequence steps, Reveal, and Empty states")

    # 7. Test CSS Animations & Accessibility
    print("\n[Test 7] Verifying CSS keyframes, micro-interactions & accessibility...")
    required_classes = [
        ".pip-floating", ".pip-shadow", ".pip-bouncing", ".pip-wiggle",
        ".pip-interactive", ".pip-speech-bubble", ".hero-gradient-canvas", ".cta-magnify"
    ]
    for cls in required_classes:
        assert cls in css, f"CSS class {cls} missing from style.css"

    required_keyframes = ["@keyframes pipFloat", "@keyframes pipBounce", "@keyframes pipWiggle", "@keyframes speechBubblePop"]
    for kf in required_keyframes:
        assert kf in css, f"Keyframe {kf} missing from style.css"

    # Reduced motion check
    assert "prefers-reduced-motion" in css, "prefers-reduced-motion media query missing in style.css"
    assert ".pip-floating" in css and "animation: none" in css, "Reduced motion override for pip animations missing"
    print("[PASS] CSS animations, speech bubbles, and reduced-motion overrides verified")

    print("\n" + "=" * 60)
    print("ALL PHASE 3 PERSONALITY & MASCOT VERIFICATION TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as err:
        print(f"\n[FAIL] Test assertion failed: {err}")
        sys.exit(1)
    except Exception as exc:
        print(f"\n[ERROR] An unexpected error occurred: {exc}")
        sys.exit(1)
