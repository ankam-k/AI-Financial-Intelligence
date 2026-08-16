# AI Financial Intelligence Platform

> **Understand your financial behavior — not just where your money went.**

AI Financial Intelligence is a personal financial intelligence platform that helps users understand relationships between their **spending, daily habits, and life context**.

Instead of simply showing where money was spent, the platform builds a history of the user's financial behavior and identifies **statistically supported patterns** within that history.

For example:

> **Food & Dining spending was 42% higher during weeks when exercise wasn't recorded.**

The platform does not stop at presenting the result. Every insight can be opened to inspect the **underlying observations, statistical evidence, and interpretation** behind it.

The goal is simple:

> **Record → Build History → Analyze → Discover Insights → Inspect Evidence → Understand**

> 📘 **Running the app?** See the [**Complete Application & Flows Guide**](./APPLICATION_GUIDE.md)
> for verified run commands, every screen and its outputs, the end-to-end user
> flows, the full API reference with sample responses, and the design system.

---

## Table of Contents

* [What is the Problem?](#what-is-the-problem)
* [Our Approach](#our-approach)
* [How the Platform Works](#how-the-platform-works)
* [Core Features](#core-features)
* [User Journey](#user-journey)
* [The Insight Lifecycle](#the-insight-lifecycle)
* [Trust and Explainability](#trust-and-explainability)
* [Data Model](#data-model)
* [AI and Statistical Analysis](#ai-and-statistical-analysis)
* [Safety Boundaries](#safety-boundaries)
* [Application Structure](#application-structure)
* [Technology Stack](#technology-stack)
* [Architecture](#architecture)
* [Demo Mode](#15-demo-mode)
* [Privacy and Data Isolation](#privacy-and-data-isolation)
* [Current Product Status](#current-product-status)
* [Testing](#testing)
* [Running the Project](#running-the-project)
* [Project Philosophy](#project-philosophy)
* [Future Direction](#future-direction)

---

# What is the Problem?

Most personal finance applications answer:

> **"Where did my money go?"**

They show:

* spending categories
* transaction totals
* monthly summaries
* charts
* budgets

Those are useful, but they don't necessarily answer the questions people actually have about their behavior.

For example:

* Why did my food spending increase?
* Does my spending change during stressful periods?
* Does working from the office affect transportation costs?
* What happens to my spending during travel?
* Are there recurring relationships between my habits and expenses?
* Is there enough evidence to believe a pattern is actually meaningful?

AI Financial Intelligence approaches the problem differently.

Instead of treating financial data as isolated transactions, it looks at the **relationship between financial activity and the context surrounding it**.

---

# Our Approach

The platform combines three types of personal information:

### Financial activity

Examples:

* Food
* Transport
* Shopping
* Bills
* Entertainment
* Travel
* Other expenses

### Daily context

Examples:

* Sleep
* Exercise
* Home-cooked meals
* Stress
* Alcohol
* Work mode

### Life context

Examples:

* New job
* Vacation
* Moving
* Major purchase
* Exam period
* Travel
* Family events

These records form a personal history.

The analysis engine then examines that history for statistically supported relationships.

---

# How the Platform Works

```text
              USER
               │
               ▼
        ┌──────────────┐
        │    RECORD    │
        │              │
        │ Expenses     │
        │ Check-ins    │
        │ Life Context │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   HISTORY    │
        │              │
        │ Time-based   │
        │ observations │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   ANALYSIS   │
        │    ENGINE    │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   VALIDATED  │
        │   INSIGHTS   │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   EVIDENCE   │
        │              │
        │ Data         │
        │ Statistics   │
        │ Interpretation│
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   EXPLORE    │
        │              │
        │ Human/AI     │
        │ explanation  │
        └──────────────┘
```

---

# Core Features

## 1. Account and Authentication

Every real user gets an isolated account.

### User can

* Create an account
* Sign in
* Sign out
* Maintain personal preferences
* Access only their own financial history

### Output

After authentication, the user enters their own private financial workspace.

No user's expenses, check-ins, life events, or insights are shared with another account.

---

# 2. Personal Setup

During onboarding, users can optionally provide context that helps personalize the experience.

Examples:

* Life stage
* Income pattern
* Work context
* Household context
* Areas they want to understand
* Spending categories they want to track
* Habits they want to record

### Important

This is **contextual personalization**, not personality profiling.

The system does not assign labels such as:

> "You are a high spender."

or:

> "You have a particular financial personality."

The user's context only helps determine what is relevant to their experience.

### Output

A personalized tracking setup that determines:

* relevant categories
* relevant check-ins
* UI emphasis
* areas of interest

---

# 3. Expense Tracking

Users can record financial transactions directly.

Each expense contains information such as:

* Amount
* Category
* Description / merchant
* Date

Supported categories depend on the configured application data.

### Output

The user gets:

* Expense history
* Spending totals
* Category-level views
* Filtered transaction lists
* Data that can later participate in analysis

All financial amounts are represented internally using **integer paise**, avoiding floating-point money errors.

---

# 4. Daily Check-ins

Users can quickly record contextual information about their day.

Possible check-ins include:

* Sleep
* Exercise
* Home-cooked meals
* Stress
* Alcohol
* Work mode

The available check-ins can be personalized through tracking preferences.

### Three-state semantics

The system intentionally distinguishes:

```text
Unknown / Not recorded
        ≠
No
```

For example:

* `Unknown` means the user didn't record whether they exercised.
* `No` means the user explicitly recorded that they did not exercise.
* `Yes` means the user explicitly recorded that they exercised.

### Output

A structured daily context history that can later be compared with financial behavior.

---

# 5. Life & Context

Users can record events that may provide additional context around changes in their financial history.

Examples:

* Started a new job
* Vacation
* Moving
* Exam period
* Major purchase
* Travel
* Family event

### Output

A chronological life/context timeline.

This gives the analysis system additional context when examining changes in spending behavior.

---

# 6. History

The History view provides a chronological picture of everything the user has recorded.

It can bring together:

* Expenses
* Check-ins
* Life/context events

Example:

```text
August 16

₹450
Food
Expense

Good sleep
Exercise recorded
Check-in

Started new project
Life & Context
```

### Output

A single place where users can understand:

> **"What was happening around my financial activity?"**

---

# 7. Data Readiness

The platform does not immediately make behavioral claims when a user signs up.

A new account begins with:

```text
0 expenses
0 check-ins
0 life events
```

The application explains that more history is required before meaningful relationships can be identified.

### Output

The user can see their progress toward having enough usable history for analysis.

Instead of producing weak insights, the system waits for sufficient evidence.

---

# 8. Behavioral Analysis

This is the core intelligence layer.

The analysis engine examines relationships between:

* Spending categories
* Habits
* Time periods
* User-recorded context

The current analysis engine evaluates approximately:

> **84 hypotheses per analysis run**

based on combinations of habits and spending categories.

It uses hand-written statistical implementations including:

* Mann–Whitney
* Spearman
* Kruskal–Wallis

The analysis core is deliberately pure and I/O-free.

---

# 9. Statistical Gating

Finding a mathematical difference is not enough.

Every potential relationship must pass multiple gates before becoming an actual product insight.

The current system uses five major requirements:

1. Minimum history
2. Minimum observations per group
3. Logging coverage requirement
4. Minimum effect size
5. Multiple-comparison correction using Benjamini–Hochberg FDR

The configured FDR threshold is:

> **q = 0.10**

### Output

Only relationships that satisfy all required conditions become visible insights.

Everything else is suppressed.

There is intentionally no:

> "Low confidence insight"

category.

---

# 10. Insights

Validated relationships appear in the Insights section.

Example:

> **Food & Dining spending was 42% higher during weeks when exercise wasn't recorded.**

An insight can communicate:

* relationship
* magnitude
* observation period
* statistical strength
* relevant context

### Output

A human-readable, evidence-backed behavioral observation.

---

# 11. Evidence Drill-down

Every insight can be investigated.

Users can open:

> **View Evidence**

The evidence view can show:

### What was observed

The actual relationship.

### Underlying observations

The groups and observations used.

### Statistical analysis

For example:

* Mann–Whitney result
* observations
* weeks analyzed
* adjusted statistical result

### Interpretation

The system explicitly explains that the finding represents an association.

### Output

The user can move from:

> **"What did the system find?"**

to:

> **"Why does the system believe this?"**

without having to trust a black-box AI statement.

---

# 12. Explainable AI Narration

The optional local LLM is deliberately placed **after** statistical analysis.

The architecture is:

```text
Raw Data
   ↓
Analysis Engine
   ↓
Validated Insight Object
   ↓
LLM / Template Renderer
   ↓
Human-readable explanation
```

Not:

```text
Raw Data
   ↓
LLM
   ↓
Whatever the model says
```

The language model cannot establish a new financial fact.

It can only explain a fact that the analysis engine has already established.

---

# 13. AI Assistant / Explore

The platform includes an optional conversational exploration layer.

Users can ask questions about their recorded history.

Examples:

> "Why was my food spending higher?"

> "What patterns have appeared in my history?"

> "What happened around my vacation?"

The assistant uses already-established information.

### Output

A contextual explanation linked back to the user's evidence where appropriate.

The assistant is deliberately **secondary to the analytical system**.

---

# 14. AI Unavailable Mode

The application does not depend entirely on the LLM.

If the local AI system is unavailable:

> **AI narration is currently unavailable.**

The application continues to provide:

* validated insights
* statistical evidence
* data history
* deterministic explanations

The system can fall back to hand-written templates.

### Output

The core financial intelligence product continues functioning even when AI narration is disabled.

---

# 15. Demo Mode

The platform includes a dedicated demo experience.

Demo mode uses a **separate backend demo account**.

It is not synthetic data generated inside the frontend.

Demo users can explore:

* Overview
* Expenses
* Check-ins
* Life & Context
* Insights
* Evidence
* Explore

The interface clearly identifies:

> **DEMO MODE**

### Output

A complete sample experience without contaminating real user accounts.

---

# 16. Settings and Data Control

Users can manage supported account and personalization settings.

The data section provides appropriate controls for managing their recorded information.

The platform does not expose unsupported functionality through fake UI.

---

# User Journey

A typical user moves through the platform in a predictable, trust-building sequence.

```text
1. Discover
   └── Landing page or Explore Demo

2. Sign Up
   └── Create an isolated account

3. Personal Setup
   └── Optional onboarding context and tracking preferences

4. Record
   ├── Add expenses
   ├── Log daily check-ins
   └── Note life & context events

5. Build History
   └── Accumulate enough usable observations

6. Analyze
   └── Run behavioral analysis over the history

7. Discover Insights
   └── Review validated relationships

8. Inspect Evidence
   └── Drill down into data and statistics

9. Explore
   └── Ask the assistant about established findings
```

### Early experience

A brand-new user does not see fabricated insights. They see:

* their own recorded data
* progress toward data readiness
* a clear explanation of why analysis is not yet available

### Mature experience

Once enough history exists, the user gains:

* validated insights
* inspectable evidence
* contextual exploration

The journey is intentionally designed so that **trust is earned as history grows**, rather than promised up front.

---

# The Insight Lifecycle

Every insight passes through a defined lifecycle before a user ever sees it.

```text
┌────────────────────┐
│  1. Observation    │
│                    │
│  Raw records:      │
│  expenses,         │
│  check-ins,        │
│  life events       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  2. Hypothesis     │
│                    │
│  Candidate         │
│  relationships     │
│  (~84 per run)     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  3. Statistical    │
│     Test           │
│                    │
│  Mann–Whitney,     │
│  Spearman,         │
│  Kruskal–Wallis    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  4. Gating         │
│                    │
│  History, groups,  │
│  coverage,         │
│  effect size, FDR  │
└─────────┬──────────┘
          │
   Pass all gates?
          │
    ┌─────┴─────┐
    │           │
   No          Yes
    │           │
    ▼           ▼
Suppressed   ┌────────────────────┐
             │  5. Insight Object │
             │                    │
             │  Validated,        │
             │  evidence-backed   │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │  6. Narration      │
             │                    │
             │  LLM / template     │
             │  rendering          │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │  7. Presentation   │
             │                    │
             │  Insight + Evidence │
             │  shown to user      │
             └────────────────────┘
```

The lifecycle guarantees that:

* nothing weak reaches the user
* every visible claim is backed by an Insight object
* narration only ever describes an already-validated result

---

# Trust and Explainability

Trust is a first-class product feature.

The project follows several principles.

## 1. The analysis engine is the source of truth

Every number shown to a user originates from structured data or an established Insight object.

---

## 2. AI is downstream

The LLM cannot create new analytical conclusions.

It only renders already-established information.

---

## 3. No causal claims

If the system finds:

> Exercise and food spending are associated.

it cannot say:

> Exercise caused food spending to decrease.

---

## 4. Strict statistical gates

Weak relationships are suppressed instead of being presented as uncertain insights.

---

## 5. Evidence is inspectable

Users can drill down from an insight to the underlying evidence.

---

## 6. Deterministic analysis

The same inputs should produce the same analytical outputs.

---

# Data Model

The platform is organized around a small number of clear, user-scoped entities.

```text
User
 ├── Preferences        (personalization & tracking setup)
 ├── Expense[]          (financial transactions)
 ├── CheckIn[]          (daily context, three-state)
 ├── LifeEvent[]        (life & context timeline)
 └── Insight[]          (validated analytical results)
```

### User

The root of every data boundary. All other records belong to exactly one user.

### Preferences

Personalization and tracking configuration:

* relevant spending categories
* relevant check-ins
* onboarding context
* UI emphasis

### Expense

A single financial transaction:

* amount (**integer paise** — no floating-point money)
* category
* description / merchant
* date

### CheckIn

A daily contextual record using **three-state semantics**:

* `Unknown` — not recorded
* `No` — explicitly recorded as not done
* `Yes` — explicitly recorded as done

### LifeEvent

A dated life/context event that frames changes in financial behavior.

### Insight

A validated relationship produced by the analysis engine. Each Insight carries:

* the observed relationship
* magnitude / effect size
* observation period
* the statistical evidence used to justify it

### Isolation invariant

```text
Every query is scoped to a single user.
No entity is ever shared across users.
Demo data lives in a separate demo account.
```

This invariant is the foundation of both privacy and trust.

---

# AI and Statistical Analysis

The intelligence layer is deliberately split into two distinct responsibilities: **the analysis engine establishes facts**, and **the language model explains them**.

## The analysis engine

A pure, I/O-free core that evaluates candidate relationships across habits, spending categories, and time.

### Statistical methods

Hand-written implementations, avoiding NumPy/SciPy for the core:

* **Mann–Whitney U** — comparing spending between two groups (e.g. exercise vs. no exercise)
* **Spearman correlation** — monotonic relationships between ordered variables
* **Kruskal–Wallis** — comparing spending across more than two groups

### Effect size

A statistically significant difference must also be **large enough to matter**. Small, trivial differences are rejected even when significant.

### Multiple-comparison correction

With roughly **84 hypotheses per run**, uncorrected testing would surface false positives by chance alone. The engine applies **Benjamini–Hochberg FDR** control at:

> **q = 0.10**

so that the expected proportion of false discoveries stays bounded.

### Determinism

The same inputs always produce the same outputs. Analysis is reproducible and auditable.

## The language model

The optional local LLM (Ollama + Qwen2.5-7B) sits **downstream** of the engine.

```text
Validated Insight Object
          ↓
    LLM narration
          ↓
Human-readable explanation
```

### Constraints

* It **cannot** create a new financial fact.
* It **cannot** override or contradict the engine.
* It **only** renders an already-established Insight in natural language.

### Graceful degradation

If the model is unavailable, the system falls back to **hand-written templates**. Insights, evidence, and history continue to work without any AI narration.

The design principle is constant:

> **AI is downstream of truth. Statistics establish; the model explains.**

---

# Safety Boundaries

The platform is **not regulated financial advice**.

It does not tell users:

* what stocks to buy
* where to invest
* how to allocate capital
* what financial product to purchase
* what investment decision to make

The assistant includes a regulatory safety layer.

### Allowed

Questions about the user's own historical data.

Example:

> "How much did I spend on food?"

### Refused

Requests directing future capital allocation.

Example:

> "Where should I invest my savings?"

The boundary is enforced in application logic, not only through documentation.

---

# Privacy and Data Isolation

Each authenticated account has its own data boundary.

Conceptually:

```text
User A
 ├── Expenses
 ├── Check-ins
 ├── Life Events
 ├── Insights
 └── Preferences

User B
 ├── Expenses
 ├── Check-ins
 ├── Life Events
 ├── Insights
 └── Preferences
```

User A must never access User B's data.

The same principle applies to:

* expenses
* check-ins
* life events
* preferences
* insights
* analysis results

Demo data is isolated from real accounts.

---

# Application Structure

The product is organized around the following user-facing areas:

```text
PUBLIC
│
├── Landing
├── Login
├── Sign Up
└── Explore Demo
│
└── AUTHENTICATED
    │
    ├── Overview
    ├── Expenses
    ├── Check-in
    ├── Life & Context
    ├── Insights
    ├── History
    ├── Explore
    └── Settings
```

The core experience is:

```text
Expenses ───────┐
Check-ins ──────┼──→ History ──→ Analysis
Life & Context ─┘                    │
                                     ▼
                                  Insights
                                     │
                                     ▼
                                  Evidence
                                     │
                                     ▼
                                   Explore
```

---

# Architecture

The system is intentionally separated into layers.

```text
┌─────────────────────────────┐
│          Frontend           │
│      React + TypeScript     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│           API               │
│          FastAPI            │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌───────────────┐
│ Application  │  │ Authentication│
│   Services  │  │   & Isolation │
└──────┬──────┘  └───────────────┘
       │
       ▼
┌─────────────────────────────┐
│      Analysis Engine        │
│                             │
│ Statistical hypotheses      │
│ Gates                       │
│ FDR correction              │
│ Insight generation          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│           SQLite            │
└─────────────────────────────┘

Optional:

┌─────────────────────────────┐
│          Ollama             │
│       Qwen2.5-7B            │
└─────────────────────────────┘
```

---

# Technology Stack

## Backend

* Python
* FastAPI
* SQLAlchemy 2.0
* Pydantic
* SQLite
* PyJWT
* Argon2id authentication

## Analysis

* Pure Python statistical implementations
* Mann–Whitney
* Spearman
* Kruskal–Wallis
* Benjamini–Hochberg FDR

The analysis engine deliberately avoids NumPy/SciPy for its core statistical implementation.

## Frontend

* React
* TypeScript
* Vite
* Vitest
* MSW
* Hand-written SVG/data visualizations

## AI

* Ollama
* Qwen2.5-7B
* Optional
* Off by default

## Deployment

* Docker
* Docker Compose
* FastAPI backend
* Nginx
* Optional Ollama service

---

# Testing

Testing is treated as a product requirement rather than an afterthought.

The project includes tests covering areas such as:

* authentication
* authorization
* data isolation
* analysis
* FDR correction
* statistical gates
* safety guard
* demo behavior
* three-state habit semantics
* API behavior
* frontend components
* frontend API integration

The project also maintains a synthetic dataset with:

* planted relationships the engine should discover
* negative controls the engine should ignore

This provides an executable validation mechanism for the analysis engine.

---

# Current Product Status

The original V1 implementation covers:

* Data capture
* Analysis
* Statistical gating
* Narration
* Dashboard
* Assistant
* Demo experience

The V1.2 product direction extends this into a complete user-facing platform with:

* Real user authentication
* Per-user data isolation
* Personalization
* Generic onboarding
* Responsive application shell
* Expense management
* Check-ins
* Life & Context
* History
* Insights
* Evidence exploration
* Assistant/Explore
* Demo separation
* Mobile experience

The frontend is being developed around the existing backend contracts rather than creating a parallel mock application.

---

# Development Principles

## Documentation-first

Important architectural decisions are documented before implementation.

## Backend contract first

Frontend functionality must correspond to real backend capabilities.

## No invented functionality

If an API does not support a feature, the frontend does not pretend that it exists.

## Trust over engagement

The system would rather show no insight than show an unsupported insight.

## Evidence over explanation

Every important analytical claim should be traceable to evidence.

## AI downstream of truth

The model explains established findings rather than creating them.

## Generic by design

The product adapts to different users without reducing them to predefined financial personas.

---

# Running the Project

The platform runs as a containerized stack: a FastAPI backend, a React frontend served by Nginx, and an optional Ollama service for AI narration.

## Prerequisites

* Docker and Docker Compose
* (Optional) An Ollama-compatible host for local AI narration

## Quick start (Docker)

```bash
# From the repository root
docker compose -f docker/docker-compose.yml up --build
```

This builds and starts:

* the FastAPI backend
* the frontend served through Nginx
* the optional Ollama service (if enabled)

Once running, open the frontend in your browser and either **Explore Demo** or **Sign Up** to create an isolated account.

## Configuration

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

Environment configuration controls things like:

* the database location
* authentication secrets
* whether the optional AI service is enabled

The AI narration layer is **off by default** — the platform is fully functional without it.

## Local development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Running the tests

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

The test suites cover authentication, data isolation, statistical gating, FDR correction, the safety guard, demo behavior, and frontend components — see [Testing](#testing) for the full scope.

---

# Project Philosophy

The project is built around one principle:

> **A financial intelligence system should help people understand their own behavior without pretending to know more than their data supports.**

That means:

```text
Record what happened.
       ↓
Build enough history.
       ↓
Analyze systematically.
       ↓
Reject weak findings.
       ↓
Show validated relationships.
       ↓
Expose the evidence.
       ↓
Let the user decide what it means.
```

The platform does not tell users what they *should* do with their money.

It helps them understand **what their own history shows**.

---

# Future Direction

Potential future capabilities include:

* richer longitudinal analysis
* improved insight exploration
* more contextual life-event analysis
* feedback mechanisms for insight usefulness
* advanced data export
* stronger account/session management
* additional financial data sources
* broader deployment infrastructure
* product-level trust metrics

These should be added without compromising the project's core principles of:

**accuracy, evidence, privacy, explainability, and restraint.**

---

# The Product in One Sentence

> **AI Financial Intelligence is a personal financial intelligence platform that analyzes a user's spending, habits, and life context to uncover statistically supported behavioral patterns and lets the user inspect the evidence behind every important insight.**

---

# The Product in One Diagram

```text
                         USER
                          │
                          ▼
                ┌──────────────────┐
                │     RECORD       │
                │                  │
                │ Expenses         │
                │ Check-ins        │
                │ Life & Context   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │     HISTORY      │
                │                  │
                │ What happened?   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ ANALYSIS ENGINE  │
                │                  │
                │ Hypotheses       │
                │ Statistics       │
                │ Effect sizes     │
                │ Gates            │
                │ FDR correction   │
                └────────┬─────────┘
                         │
                  Only validated
                    findings
                         │
                         ▼
                ┌──────────────────┐
                │     INSIGHTS     │
                │                  │
                │ What relationship│
                │ was observed?    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │     EVIDENCE     │
                │                  │
                │ Data             │
                │ Statistics       │
                │ Interpretation   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │     EXPLORE      │
                │                  │
                │ Human-readable   │
                │ explanations     │
                └──────────────────┘
```

> **Record. Analyze. Verify. Understand.**
