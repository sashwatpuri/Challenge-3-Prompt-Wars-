# CarbonMind AI 🌿

CarbonMind AI is a premium, interactive Carbon Footprint Awareness and Optimization Platform designed for the Indian context. It empowers users to analyze, simulate, track, and reduce their personal carbon footprint through an AI-powered checklist, a visual Carbon Twin simulator, a gamified milestone system, and an intelligent sustainability chatbot.

---

## 🚀 Key Features

*   **Premium Data Collection Questionnaire**: A step-by-step slider/selection interface detailing lifestyle habits across Transportation, Food, Electricity, Shopping, and Waste.
*   **Ranked Action Plan**: Recommends personalized, high-impact lifestyle modifications ranked by transparent difficulty-to-reduction ratios.
*   **Carbon Twin & What-If Sandbox**: A visual, side-by-side simulator comparing your **Current Twin** to a **Future Twin** in real-time as you tweak transport, food, electricity, and shopping parameters.
*   **Gamified Progress Tracking**: Keep active daily commute streaks, check off weekly green challenges, and unlock milestone badges (e.g. *Eco Starter*, *Green Commuter*, *Carbon Reducer*).
*   **Hybrid AI Assistant Chatbot**: A floating widget containing a chatbot. It integrates with **Google's Gemini 1.5 Flash API** to answer any complex query contextually using your live carbon profile, falling back safely to a localized rule-based engine if the API key is not configured.

---

## 🇮🇳 India-Specific Localization

This project is tailored specifically for India-based carbon metrics and economics:
*   **Currencies & Estimates**: Fully calibrated in Indian Rupees (`₹`).
*   **Electricity Grid Intensity**: Set to **`0.82 kg CO₂e / kWh`** (adapted for India's coal-heavy grid index according to the Central Electricity Authority).
*   **Utility Cost Savings**: Calculated using an average Indian tariff rate of **`₹7.00 per kWh`**.
*   **Consumer Purchases**: Savings modelled on an average cost of **`₹2,500`** per consumer product saved.
*   **Commute Savings**: Models yearly transport savings up to `₹1,50,000` (e.g., active vs. driving).

---

## 🛠️ Local Development & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Set Up the Environment
Create a `.env` file at the root of the project to set your Gemini API key (optional but recommended for the chatbot):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 2. Start the Backend (FastAPI)
1. Navigate to the root directory.
2. Activate the Python virtual environment:
   ```powershell
   venv\Scripts\Activate.ps1
   ```
3. Run the FastAPI development server:
   ```bash
   python .\backend\main.py
   ```
   *The backend will boot on `http://127.0.0.1:8000`.*

### 3. Start the Frontend (Vite + React)
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Launch the frontend developer server:
   ```bash
   npm run dev
   ```
   *The app will be available on `http://localhost:5173`.*

---

## 📦 Production Deployment (Vercel)

The project includes a production-ready [vercel.json](vercel.json) configured to deploy the Vite frontend and FastAPI backend together as unified services:
```json
{
    "experimentalServices": {
        "frontend": {
            "routePrefix": "/",
            "framework": "vite"
        },
        "backend": {
            "entrypoint": "backend/main.py",
            "routePrefix": "/_/backend"
        }
    }
}
```
*Frontend requests targeting the backend are automatically routed to `/_/backend/api/...` without CORS conflicts.*
