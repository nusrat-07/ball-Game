import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import snowflake from "snowflake-sdk";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));

// ---------- Snowflake connection ----------
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  role: process.env.SNOWFLAKE_ROLE,
});

function connectSnowflake() {
  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });
}

function execSql(sqlText, binds = []) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: (err, stmt, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      },
    });
  });
}

// ---------- Health check ----------
app.get("/health", async (req, res) => {
  try {
    const rows = await execSql("SELECT CURRENT_TIMESTAMP() AS NOW");
    res.json({ ok: true, snowflake: rows?.[0]?.NOW ?? null });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// ---------- Save score (distance + coins) ----------
app.post("/api/score", async (req, res) => {
  try {
    const playerName = String(req.body.playerName || "Guest").slice(0, 24);
    const score = Number(req.body.score || 0);
    const coins = Number(req.body.coins || 0);

    if (!Number.isFinite(score) || score < 0) {
      return res.status(400).json({ ok: false, error: "Invalid score" });
    }
    if (!Number.isFinite(coins) || coins < 0) {
      return res.status(400).json({ ok: false, error: "Invalid coins" });
    }

    await execSql(
      `INSERT INTO GAME_SCORES (PLAYER_NAME, SCORE, COINS)
       VALUES (?, ?, ?)`,
      [playerName, score, coins]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// ---------- Leaderboard ----------
app.get("/api/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

    const rows = await execSql(
      `SELECT PLAYER_NAME, SCORE, COINS, CREATED_AT
       FROM GAME_SCORES
       ORDER BY SCORE DESC, CREATED_AT DESC
       LIMIT ?`,
      [limit]
    );

    res.json({ ok: true, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// ---------- Start ----------
const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await connectSnowflake();
    console.log("✅ Connected to Snowflake");

    app.listen(PORT, () => {
      console.log(`✅ API running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ Snowflake connection failed:", e);
    process.exit(1);
  }
})();
