# QuietLeak 💧 — Phase 2: The Delight Layer

> **Your money deserves better.**  
> Find the little expenses quietly draining your wallet. A premium personal finance application that helps users discover forgotten subscriptions, track recurring expenses, identify silent financial leaks, and understand their possible savings.

---

## 🌟 Overview & Delight Vision

QuietLeak merges consumer fintech polish with playful personal finance discovery:

$$\text{Discover the leak} \longrightarrow \text{Understand the cost} \longrightarrow \text{Take control} \longrightarrow \text{See the potential savings}$$

- Discovering forgotten expenses feels like uncovering hidden money.
- Saving money feels rewarding and empowering through subtle celebrations and confetti feedback.
- The interface stays fast, lightweight, and clutter-free without generic dashboards or heavy external frameworks.

---

## ✨ Phase 2: The Delight Layer Features

### 1. Memorable Welcome Experience
- **Headline:** *"Your money deserves better."*
- **Supporting Copy:** *"Find the little expenses quietly draining your wallet."*
- **Visual Motif:** Animated SVG showing a dripping coin leak transforming into a sparkling savings vault.
- **Direct Calls to Action:** **"Find My Leaks"** (triggers the Discovery Audit moment directly) and **"Explore Demo"**.
- Fully skippable; remembers dismissal in `localStorage`.

### 2. Dashboard as a Living Experience
- **Dynamic Personalized Greeting:** Welcomes user by name with time-of-day greeting plus rotating inspiring messages (e.g. *"Let's make your money work harder."*, *"Your wallet called. It has a question."*, *"A little review today. More money tomorrow."*).
- **Smart Contextual Highlights Bar:** Evaluates real application data to surface timely notifications:
  - Upcoming renewals scheduled within the next 7 days.
  - Inactive/unused services flagged (>45 days since last active).
  - Imminent trial conversions.
  - Potential monthly savings milestones.
- **"Money you could get back" Card:** Prominently highlights estimated potential monthly savings with an animated progress meter comparing savings against total recurring outflow, plus a direct *"See what's leaking →"* action.
- **Calm & Encouraging Empty States:** Displays reassuring positive messaging when no renewals or leaks are found.

### 3. Signature Delight: The QuietLeak Discovery Moment
- Activated via **"Find My Leaks"** or **"Start Subscription Audit"**.
- Displays an animated 4-step discovery sequence with a live progress bar:
  1. *Reviewing recurring expenses & commitments...*
  2. *Checking upcoming renewals & billing cycles...*
  3. *Looking for subscriptions marked unused...*
  4. *Calculating non-overlapping potential savings...*
- Transitions into the **Discovery Reveal**:
  - Summarizes detected leaks and potential monthly/annual recovery.
  - Staggered findings cards explaining **why** each item was flagged.
  - Direct audit controls: **"Keep Active"**, **"Pause Service"**, or **"Mark as Cancelled"**.
  - Celebratory confetti burst when completing an audit or taking action.

### 4. Interactive Savings Simulator: "What if I stopped paying?"
- Dedicated interactive planner on the **Insights & Leaks** screen.
- Selectable checklist of all active subscriptions.
- **Instant Dynamic Recalculation:**
  - Selected subscriptions count.
  - Simulated monthly savings.
  - 12-month compounded annual recovery.
  - Visual spend comparison meter comparing current outflow vs. simulated reduced outflow.
- Convenience **"Select All"** and **"Reset"** controls.
- Explicitly states that estimates are hypothetical planning aids and do not cancel external services.

### 5. Delightful Subscription Interaction System
- **Frequency Selectable Chips:** Modern interactive chips (`Monthly`, `Yearly`, `Quarterly`, `Weekly`).
- **Dynamic Live Cost Preview:** As you type the amount or switch frequencies, displays real-time calculated outflow (e.g. `Equivalent: ₹1,200/mo • ₹14,400/yr`).
- **Inline Validation:** Instant feedback positioned directly beside form inputs.
- **Savings Celebrations:** Low-overhead canvas confetti burst and positive toasts when negotiating a lower cost or pausing an expense.
- **Clear Deletion Confirmation:** Explains exact monthly outflow reduction before deletion; distinguishes deleting a record from confirming an external cancellation.

---

## 🎨 Visual Identity & Color Palette

- **Warm Ivory Background:** `#FFF9F2`
- **Coral Accent (Leaks & Primary Action):** `#FF6B4A`
- **Savings Lime (Positive Outcomes & Recovery):** `#C8F169`
- **Soft Lavender (Secondary Insights):** `#DCD2FF`
- **Dark Ink Text:** `#22251F`
- **Soft Grey Surfaces:** `#E7E9E1`
- **White:** `#FFFFFF`

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** HTML5, Tailwind CSS (via Play CDN for prototype / compiled for production), Vanilla JavaScript (zero external UI dependencies).
- **Backend:** Python 3.10+ and FastAPI.
- **Database:** SQLite (`data/quietleak.db`) for lightweight, local-first persistence.
- **API Testing:** Postman compatible with interactive Swagger docs at `/docs`.

```
quietleak/
├── backend/
│   ├── __init__.py
│   ├── main.py          # FastAPI application, static mounts & REST routes
│   ├── database.py      # SQLite connection, queries, seeds & leak engine
│   └── models.py        # Pydantic schemas, normalization & validation
├── frontend/
│   ├── index.html       # Single-page application shell with responsive layout
│   ├── css/
│   │   └── style.css    # Design system, micro-interactions, canvas & chip styles
│   └── js/
│       └── app.js       # Client state, animations, simulator & discovery engine
├── data/
│   └── quietleak.db     # SQLite database file
├── test_e2e.py          # Primary user journey test suite (9 acceptance steps)
├── test_delight.py      # Phase 2 Delight Layer verification suite
├── requirements.txt     # Python dependencies
└── README.md            # Documentation & setup guide
```

---

## 🧮 Normalized Recurring Calculations

Subscriptions with varying billing cycles are mathematically normalized to monthly and annual equivalents:

- **Weekly:** $\text{Monthly Equivalent} = \frac{\text{Amount} \times 52}{12}$
- **Monthly:** $\text{Monthly Equivalent} = \text{Amount}$
- **Quarterly:** $\text{Monthly Equivalent} = \frac{\text{Amount}}{3}$
- **Yearly:** $\text{Monthly Equivalent} = \frac{\text{Amount}}{12}$
- **Annual Outflow:** $\text{Monthly Equivalent} \times 12$

---

## 🔍 Transparent Rules-Based Leak Engine

1. **Unused / Forgotten Subscriptions:** Flagged when `last_used_date` is > 45 days ago while remaining active.
2. **Upcoming Trial Expirations:** Flagged when an active trial has $\le 7\text{ days}$ before auto-converting into a paid recurring bill.
3. **High-Cost Outliers:** Flagged when monthly equivalent is $\ge ₹2,500\text{/mo}$ or substantially higher than category average.
4. **Approaching Annual Renewals:** Flagged when a large annual payment renews within 14 days.
5. **Stale Paused Services:** Flagged when paused services linger indefinitely.

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- Python 3.10+ installed
- Web browser (Chrome, Edge, Firefox, Safari)

### 2. Install Dependencies
```powershell
cd C:\Users\khush\.gemini\antigravity\scratch\quietleak
pip install -r requirements.txt
```

### 3. Launch the Backend Server
```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

### 4. Access the Application
- **QuietLeak Web App:** Open [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/) in your browser.
- **Interactive API Documentation:** Open [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs) to test endpoints via Swagger UI or Postman.

### 5. Run Verification Test Suites
```powershell
# Primary user journey acceptance test (9 steps)
python test_e2e.py

# Delight layer calculations, simulator & highlights test
python test_delight.py
```

---

## 🧪 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Centralized metrics, totals, leaks & category breakdown |
| `GET` | `/api/subscriptions` | List subscriptions (supports `category`, `status`, `search`) |
| `GET` | `/api/subscriptions/{id}` | Retrieve specific subscription details |
| `POST` | `/api/subscriptions` | Create a new recurring subscription |
| `PUT` | `/api/subscriptions/{id}` | Update an existing subscription |
| `DELETE` | `/api/subscriptions/{id}` | Delete a subscription |
| `POST` | `/api/reset-data` | Restore demonstration dataset |
