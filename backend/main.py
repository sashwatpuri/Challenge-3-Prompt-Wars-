import os
import sqlite3
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext

# Try to load environment variables from .env file
for env_path in [".env", "../.env", "backend/.env"]:
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    # Use setdefault to preserve existing environment variables
                    os.environ.setdefault(k.strip(), v.strip())

# Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "carbonmind_ai_secure_token_key_2026")
if SECRET_KEY == "carbonmind_ai_secure_token_key_2026":
    import warnings
    warnings.warn(
        "JWT_SECRET_KEY is using the default development fallback key. "
        "Please configure a custom JWT_SECRET_KEY in your production environment.",
        UserWarning
    )
ALGORITHM = "HS256"
DB_FILE = "backend.db"
ELECTRICITY_EMISSION_FACTOR = 0.82

# Safe Context Manager for SQLite database connections
class DBConnection:
    def __enter__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self.conn.execute("PRAGMA foreign_keys = ON;")
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()

app = FastAPI(
    title="CarbonMind AI - Backend Services",
    description="REST API for Carbon Footprint calculations, profiling, and persistent user dashboards.",
    version="1.0.0"
)

# Enable CORS for React integration
allowed_origins_str = os.environ.get("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if allowed_origins_str != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password Hashing utility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ----------------- Models -----------------
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class ProfileData(BaseModel):
    transport: str
    food: str
    electricity: float
    shopping: float
    waste: str

class RecommendationInput(BaseModel):
    action: str
    reason: str
    impact_score: int

class CarbonHistoryInput(BaseModel):
    total_emission: float
    carbon_score: int

class ChallengeInput(BaseModel):
    challenge: str
    difficulty: str
    estimated_co2_reduction: str
    completion_reward: int

# ----------------- Database Setup -----------------
def init_db():
    with DBConnection() as conn:
        cursor = conn.cursor()
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Profiles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                user_id INTEGER PRIMARY KEY,
                transport TEXT NOT NULL,
                food TEXT NOT NULL,
                electricity REAL NOT NULL,
                shopping REAL NOT NULL,
                waste TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        # Recommendations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                reason TEXT NOT NULL,
                impact_score INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        # Carbon history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS carbon_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total_emission REAL NOT NULL,
                carbon_score INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        # Challenges table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS challenges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                challenge TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                estimated_co2_reduction TEXT NOT NULL,
                completion_reward INTEGER NOT NULL,
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        """)
        # Create indexes for optimal search query performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_carbon_history_user_id ON carbon_history(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id)")
        conn.commit()

init_db()

# ----------------- JWT Helpers -----------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication header"
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed"
            )
        return {"id": user_id, "username": username}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature is expired or invalid"
        )

# ----------------- Authentication Routes -----------------
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister):
    try:
        with DBConnection() as conn:
            cursor = conn.cursor()
            hashed = pwd_context.hash(user.password)
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (user.username, hashed)
            )
            conn.commit()
            user_id = cursor.lastrowid
            token = create_access_token({"sub": user.username, "id": user_id})
            return {"access_token": token, "token_type": "bearer", "username": user.username}
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )

@app.post("/api/auth/login")
def login(user: UserLogin):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (user.username,))
        row = cursor.fetchone()

    if not row or not pwd_context.verify(user.password, row[2]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    token = create_access_token({"sub": row[1], "id": row[0]})
    return {"access_token": token, "token_type": "bearer", "username": row[1]}

# ----------------- Profile CRUD Routes -----------------
@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT transport, food, electricity, shopping, waste FROM profiles WHERE user_id = ?",
            (current_user["id"],)
        )
        row = cursor.fetchone()

    if not row:
        return {"profile": None}

    return {
        "profile": {
            "transport": row[0],
            "food": row[1],
            "electricity": row[2],
            "shopping": row[3],
            "waste": row[4]
        }
    }

@app.post("/api/profile")
def save_profile(profile: ProfileData, current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO profiles (user_id, transport, food, electricity, shopping, waste, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                transport=excluded.transport,
                food=excluded.food,
                electricity=excluded.electricity,
                shopping=excluded.shopping,
                waste=excluded.waste,
                updated_at=CURRENT_TIMESTAMP
            """,
            (current_user["id"], profile.transport, profile.food, profile.electricity, profile.shopping, profile.waste)
        )
        conn.commit()
    return {"message": "Profile synced successfully"}

# ----------------- Recommendations History CRUD -----------------
@app.get("/api/recommendations")
def get_recommendations(current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, action, reason, impact_score, created_at FROM recommendations WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],)
        )
        rows = cursor.fetchall()
    return {
        "recommendations": [
            {
                "id": r[0],
                "action": r[1],
                "reason": r[2],
                "impact_score": r[3],
                "created_at": r[4]
            } for r in rows
        ]
    }

@app.post("/api/recommendations")
def add_recommendation(rec: RecommendationInput, current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO recommendations (user_id, action, reason, impact_score) VALUES (?, ?, ?, ?)",
            (current_user["id"], rec.action, rec.reason, rec.impact_score)
        )
        conn.commit()
        rec_id = cursor.lastrowid
    return {"id": rec_id, "message": "Recommendation saved successfully"}

# ----------------- Carbon History CRUD -----------------
@app.get("/api/history")
def get_history(current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, total_emission, carbon_score, created_at FROM carbon_history WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],)
        )
        rows = cursor.fetchall()
    return {
        "history": [
            {
                "id": h[0],
                "total_emission": h[1],
                "carbon_score": h[2],
                "created_at": h[3]
            } for h in rows
        ]
    }

@app.post("/api/history")
def add_history(history: CarbonHistoryInput, current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO carbon_history (user_id, total_emission, carbon_score) VALUES (?, ?, ?)",
            (current_user["id"], history.total_emission, history.carbon_score)
        )
        conn.commit()
        history_id = cursor.lastrowid
    return {"id": history_id, "message": "Carbon footprint log recorded"}

# ----------------- Weekly Challenges CRUD -----------------
@app.get("/api/challenges")
def get_challenges(current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, challenge, difficulty, estimated_co2_reduction, completion_reward, completed, created_at FROM challenges WHERE user_id = ? ORDER BY created_at DESC",
            (current_user["id"],)
        )
        rows = cursor.fetchall()
    return {
        "challenges": [
            {
                "id": c[0],
                "challenge": c[1],
                "difficulty": c[2],
                "estimated_co2_reduction": c[3],
                "completion_reward": c[4],
                "completed": bool(c[5]),
                "created_at": c[6]
            } for c in rows
        ]
    }

@app.post("/api/challenges")
def add_challenge(challenge: ChallengeInput, current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO challenges (user_id, challenge, difficulty, estimated_co2_reduction, completion_reward) VALUES (?, ?, ?, ?, ?)",
            (current_user["id"], challenge.challenge, challenge.difficulty, challenge.estimated_co2_reduction, challenge.completion_reward)
        )
        conn.commit()
        challenge_id = cursor.lastrowid
    return {"id": challenge_id, "message": "Challenge added successfully"}

@app.post("/api/challenges/{challenge_id}/complete")
def complete_challenge(challenge_id: int, current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE challenges SET completed = 1 WHERE id = ? AND user_id = ?",
            (challenge_id, current_user["id"])
        )
        conn.commit()
    return {"message": "Challenge marked as completed"}

# ----------------- Carbon Analytics Endpoint -----------------
@app.get("/api/analytics")
def get_analytics(current_user: dict = Depends(get_current_user)):
    with DBConnection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT total_emission, carbon_score, created_at FROM carbon_history WHERE user_id = ? ORDER BY created_at ASC",
            (current_user["id"],)
        )
        rows = cursor.fetchall()

    if not rows:
        return {
            "averageEmission": 0.0,
            "bestMonth": "None",
            "totalReduction": 0.0,
            "currentCarbonScore": 0,
            "trend": "stable"
        }

    emissions = [r[0] for r in rows]
    scores = [r[1] for r in rows]
    avg_emission = sum(emissions) / len(emissions)
    current_score = scores[-1]

    # Group emissions by month
    months_map = {}
    for r in rows:
        dt_str = r[2]
        try:
            dt = datetime.strptime(dt_str.split(".")[0], "%Y-%m-%d %H:%M:%S")
            month_name = dt.strftime("%B")
        except Exception:
            month_name = "June"
        
        if month_name not in months_map:
            months_map[month_name] = []
        months_map[month_name].append(r[0])
    
    best_month = "None"
    lowest_avg = float('inf')
    for month, vals in months_map.items():
        avg_val = sum(vals) / len(vals)
        if avg_val < lowest_avg:
            lowest_avg = avg_val
            best_month = month

    # Total reduction: first entry vs last entry
    total_reduction = max(0.0, emissions[0] - emissions[-1])

    # Trend calculation
    trend = "stable"
    if len(emissions) > 1:
        if emissions[-1] < emissions[0]:
            trend = "decreasing"
        elif emissions[-1] > emissions[0]:
            trend = "increasing"

    return {
        "averageEmission": round(avg_emission, 2),
        "bestMonth": best_month,
        "totalReduction": round(total_reduction, 2),
        "currentCarbonScore": current_score,
        "trend": trend
      }

# ----------------- Emissions API Endpoint -----------------
@app.post("/api/calculate")
def calculate_emissions(profile: ProfileData):
    # Mirror carbonEngine logic for immediate REST calculations
    transport_factors = {"car": 2400, "hybrid": 1200, "ev": 500, "bus": 800, "metro": 400, "public_transit": 400, "bike": 0, "walking": 0, "active": 0}
    food_factors = {"high meat": 2200, "heavy_meat": 2200, "mixed": 1200, "vegetarian": 600, "vegan": 300}
    waste_factors = {"no_recycling": 800, "partial_recycling": 400, "full_recycling": 150, "zero_waste": 30}

    # Calculations
    trans_val = transport_factors.get(profile.transport.lower(), 2400)
    food_val = food_factors.get(profile.food.lower(), 1200)
    energy_val = profile.electricity * ELECTRICITY_EMISSION_FACTOR * 12
    shopping_val = profile.shopping * 10 * 12
    waste_val = waste_factors.get(profile.waste.lower(), 400)

    total_yearly = trans_val + food_val + energy_val + shopping_val + waste_val

    return {
        "report": {
            "transportEmission": {"monthly": round(trans_val/12, 2), "yearly": trans_val},
            "foodEmission": {"monthly": round(food_val/12, 2), "yearly": food_val},
            "energyEmission": {"monthly": round(energy_val/12, 2), "yearly": round(energy_val, 2)},
            "shoppingEmission": {"monthly": round(shopping_val/12, 2), "yearly": round(shopping_val, 2)},
            "wasteEmission": {"monthly": round(waste_val/12, 2), "yearly": waste_val},
            "totalEmission": {"monthly": round(total_yearly/12, 2), "yearly": round(total_yearly, 2)}
        }
    }

class ChatInput(BaseModel):
    message: str
    profile: Optional[Dict[str, Any]] = None
    emissions: Optional[Dict[str, Any]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None

def query_gemini(user_prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
    import urllib.request
    import json
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    data = {
        "contents": [{
            "parts": [{"text": user_prompt}]
        }]
    }
    if system_prompt:
        data["systemInstruction"] = {
            "parts": [{"text": system_prompt}]
        }
        
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode("utf-8"), 
        headers=headers, 
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Error querying Gemini: {e}")
        return None

@app.post("/api/chat")
def chatbot_chat(chat_input: ChatInput):
    profile_summary = f"Profile: {chat_input.profile}" if chat_input.profile else "No profile completed yet."
    emissions_summary = f"Emissions: {chat_input.emissions}" if chat_input.emissions else ""
    recs_summary = f"Ranked Recommendations: {chat_input.recommendations}" if chat_input.recommendations else ""
    
    system_prompt = f"""You are CarbonMind AI, a helpful sustainability assistant.
The user is in India (currencies in INR / Rupee ₹, electricity tariff avg ₹7/kWh, coal-heavy grid emissions index 0.82 kg CO2e/kWh).
User Context:
{profile_summary}
{emissions_summary}
{recs_summary}

Please answer the user's question. Keep your response concise, encouraging, friendly, and under 3-4 sentences.
Always maintain your persona as a sustainability advisor and answer in that context."""

    user_prompt = f"User Question: {chat_input.message}"
    
    response_text = query_gemini(user_prompt, system_prompt=system_prompt)
    if response_text:
        return {"response": response_text.strip(), "source": "gemini"}
    else:
        return {"response": None, "source": "fallback"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
