# System Architecture - FitMaster AI

## 1. Architectural Overview
FitMaster AI implements a decoupled, polyglot microservice and client-server architecture composed of three primary tiers:

```mermaid
graph TD
    subgraph Client Tier ["Frontend (Vanilla HTML5 / CSS3 / ES6 JS)"]
        UI[Responsive Modern Dark/Navy UI]
        API_JS[Vanilla Fetch API Client (api.js)]
        UI --> API_JS
    end

    subgraph Backend Tier ["Primary Backend (Node.js & Express)"]
        GW[Express REST API Gateway]
        AUTH[JWT & Auth Middleware]
        CTRL[Domain Controllers]
        SVC[Business Logic Services]
        
        API_JS -->|HTTP / JSON + JWT| GW
        GW --> AUTH
        AUTH --> CTRL
        CTRL --> SVC
    end

    subgraph Data Tier ["Relational Database (MySQL 8.0+)"]
        DB[(fitmaster_ai DB)]
        SVC -->|mysql2 Connection Pool / Parameterized SQL| DB
    end

    subgraph AI Tier ["AI & Analytics Microservice (FastAPI & Python)"]
        FAST_API[FastAPI Server]
        GAP_ENG[Nutrition Gap Analyzer]
        ML_MODEL[Scikit-Learn / Keras Models]
        MPL_GEN[Matplotlib Analytics Engine]
        CV_MOD[OpenCV CV Research Module]
        
        SVC -->|Internal REST Calls| FAST_API
        FAST_API --> GAP_ENG
        FAST_API --> ML_MODEL
        FAST_API --> MPL_GEN
        FAST_API --> CV_MOD
    end
```

## 2. Component Interaction & Data Flow
1. **User Authentication & Session Management**:
   - The user submits registration/login credentials from `login.html` / `register.html`.
   - Node.js backend validates input via `express-validator`, hashes/verifies password with `bcryptjs`, and issues a signed JSON Web Token (JWT).
   - The client stores the JWT in `localStorage` and transmits it in the `Authorization: Bearer <token>` header for subsequent requests.

2. **Dietary Tracking & Meal Calculation**:
   - User searches foods via `/api/foods/search?q=apple`.
   - Node.js queries the indexed MySQL `foods` table using SQL parameterized searches.
   - User selects an item and inputs serving size in grams ($g$).
   - The frontend/backend dynamically scales nutritional values:
     $$\text{Value} = \frac{\text{Value}_{\text{per 100g}} \times \text{Quantity (g)}}{100}$$
   - The meal item is saved in `meals` and `meal_items` relational tables.

3. **AI Recommendations & Gap Analysis**:
   - User requests recommendations or accesses the dashboard.
   - Node.js fetches today's accumulated macros, target goals from `nutrition_goals`, and queries candidate foods from MySQL.
   - Node.js passes user profile, goal deficits, and candidate food inventory to the Python FastAPI microservice.
   - The Python service executes the ML model (or rule-based engine fallback), ranks suitable food items to close the nutrient deficit, and returns explanations.

4. **Server-Side Matplotlib Data Visualization**:
   - When viewing `progress.html` or dashboard analytics, Node.js triggers Python `/analytics/generate`.
   - The Python service queries or receives aggregated historical intake data, generates publication-quality charts using Matplotlib, saves them into `ai-service/generated_charts/`, and returns chart metadata/URLs.
   - The Node.js backend serves or proxies these images to the client browser.
