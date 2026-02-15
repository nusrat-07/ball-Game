# 🎮 Snowflake Endless Runner Game

A web-based endless runner game with a Snowflake-powered leaderboard system.

Players increase their score by surviving longer, collecting items, and competing for the highest distance on the global leaderboard.

---

## 🌟 Features

- 🎮 Endless runner gameplay
- 📏 Distance-based scoring
- 🪙 Coin / item collection
- 🏆 Top 10 leaderboard
- ❄️ Snowflake cloud database integration
- 🌐 REST API backend (Node.js + Express)
- 🔒 Secure environment variable configuration

---

## 🛠️ Tech Stack

### 🎨 Frontend
- HTML5 Canvas
- JavaScript (Vanilla JS)
- CSS3

### ⚙️ Backend
- Node.js
- Express.js
- Snowflake SDK
- dotenv
- CORS

### 🗄 Database
- Snowflake Cloud Data Platform

---

## 📂 Project Structure

```
project/
│
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env              # NOT pushed to GitHub
│
├── index.html
├── game.js
├── style.css
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/21mimia/car.git
cd car
```

---

### 2️⃣ Install Backend Dependencies

```bash
cd server
npm install
```

---

### 3️⃣ Configure Environment Variables

Inside `/server` folder create a file:

```
.env
```

Add:

```
PORT=3000

SNOWFLAKE_ACCOUNT=YOUR_ACCOUNT
SNOWFLAKE_USER=YOUR_USERNAME
SNOWFLAKE_PASSWORD=YOUR_PASSWORD
SNOWFLAKE_ROLE=ACCOUNTADMIN

SNOWFLAKE_WAREHOUSE=YOUR_WAREHOUSE
SNOWFLAKE_DATABASE=GAME_DB
SNOWFLAKE_SCHEMA=PUBLIC
```

⚠️ Never push `.env` to GitHub.

Make sure `.gitignore` contains:

```
node_modules/
.env
```

---

## ❄️ Snowflake Setup

Run inside Snowflake:

```sql
CREATE DATABASE IF NOT EXISTS GAME_DB;
USE DATABASE GAME_DB;
USE SCHEMA PUBLIC;

CREATE OR REPLACE TABLE SCORES (
  NAME STRING,
  DISTANCE NUMBER,
  COINS NUMBER,
  CREATED_AT TIMESTAMP
);
```

---

## ▶️ Running the Application

### Start Backend

Inside `/server`:

```bash
node server.js
```

Expected:

```
✅ Connected to Snowflake
✅ API running on http://localhost:3000
```

Test:

```
http://localhost:3000/health
```

---

### Run Frontend

Option 1:
Open `index.html`.

Option 2 (Recommended):

```bash
npm install -g live-server
live-server
```

Game runs at:

```
http://127.0.0.1:8080
```

---

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Save Score
```
POST /score
```

Example:

```json
{
  "name": "Player1",
  "distance": 1500,
  "coins": 30
}
```

### Leaderboard
```
GET /leaderboard
```

Returns top 10 players sorted by highest distance.

---

## 🔄 How It Works

1. Player starts the game
2. Score increases based on survival time / collected items
3. On game over → score sent to backend
4. Backend stores score in Snowflake
5. Leaderboard fetches top scores
6. Results displayed in modal

---

## 🔒 Security

- Snowflake credentials stored in `.env`
- `.env` excluded via `.gitignore`
- Frontend never directly connects to Snowflake
- Backend handles all database operations

---

## 🌍 Future Improvements

- Player authentication
- Personal best tracking
- Daily leaderboard
- Cloud deployment (Render / Railway)
- Frontend hosting (Vercel / Netlify)
- Real-time leaderboard updates

---

## 👩‍💻 Author

Nusrat  
GitHub: https://github.com/21mimia  

Built with ❤️ using Snowflake & Node.js
