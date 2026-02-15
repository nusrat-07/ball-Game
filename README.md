# 🚗 Snowflake Car Runner Game

A web-based endless car runner game with a Snowflake-powered leaderboard system.

Players drive, collect coins, increase distance, and store high scores securely in Snowflake using a Node.js backend API.

---

## 🌟 Features

- 🎮 Endless runner car gameplay
- 🪙 Coin collection system
- 📏 Distance-based scoring
- 🏆 Top 10 global leaderboard
- ❄️ Snowflake cloud database integration
- 🌐 REST API backend (Node.js + Express)
- 🔒 Secure environment variable configuration

---

## 🛠️ Tech Stack

### 🎨 Frontend
- HTML5 Canvas
- JavaScript
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
car/
│
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env               # NOT pushed to GitHub
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

Inside the `/server` folder, create a file named:

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

⚠️ Important:
- Never push `.env` to GitHub
- Ensure `.gitignore` contains:

```
node_modules/
.env
```

---

## ❄️ Snowflake Setup

Run this inside Snowflake Worksheet:

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

### Start Backend Server

Inside `/server`:

```bash
node server.js
```

Expected output:

```
✅ Connected to Snowflake
✅ API running on http://localhost:3000
```

Test connection:

```
http://localhost:3000/health
```

---

### Run Frontend (Game)

Option 1:
Open `index.html` in your browser.

Option 2 (Recommended):

```bash
npm install -g live-server
live-server
```

Game will open at:

```
http://127.0.0.1:8080
```

---

## 🔌 API Endpoints

### ✅ Health Check
```
GET /health
```

---

### 📝 Save Score
```
POST /score
```

Example request body:

```json
{
  "name": "Player1",
  "distance": 1200,
  "coins": 25
}
```

---

### 🏆 Get Leaderboard
```
GET /leaderboard
```

Returns top 10 players ordered by highest distance.

---

## 🔄 How It Works

1. Player plays the game
2. Distance and coins are tracked in real time
3. On game over → score sent to backend
4. Backend inserts score into Snowflake
5. Leaderboard endpoint fetches top scores
6. Results displayed in modal

---

## 🔒 Security Best Practices

- Snowflake credentials stored in `.env`
- `.env` excluded via `.gitignore`
- Frontend never directly connects to database
- All database operations handled by backend API

---

## 📊 Database Schema

| Column      | Type      |
|-------------|-----------|
| NAME        | STRING    |
| DISTANCE    | NUMBER    |
| COINS       | NUMBER    |
| CREATED_AT  | TIMESTAMP |

---

## 🌍 Future Improvements

- Player authentication system
- Player profiles
- Daily / Weekly leaderboard
- Cloud deployment (Render / Railway)
- Frontend hosting (Vercel / Netlify)
- JWT authentication
- Docker containerization

---

## 🧠 Learning Outcomes

This project demonstrates:

- Full-stack integration
- Cloud database connectivity
- REST API development
- Secure credential management
- Frontend + backend architecture
- Real-time game score persistence

---

## 👩‍💻 Author

**Nusrat**  
GitHub: https://github.com/21mimia  

Built with ❤️ using Snowflake & Node.js

---

## 📜 License

This project is open-source and available under the MIT License.
