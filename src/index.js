require("dotenv").config();
const cors = require('cors');
const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3001;
const PORT_SERVER = process.env.PORT_SERVER || 3000;

console.log({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// יצירת חיבור לבסיס הנתונים
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// בדיקת חיבור לבסיס הנתונים
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});
app.use(cors());
app.use(express.json());

// 📌 1. נתיב לקבלת X מילים
app.get("/words/:count", (req, res) => {
   console.log("heree"); 
  const count = parseInt(req.params.count, 10);
  if (isNaN(count) || count <= 0) {
    return res.status(400).json({ error: "Invalid count parameter" });
  }

  const query = `SELECT * FROM words
where
not exists (SELECT id FROM word_to_learn WHERE word_id = words.id)
AND
NOT EXISTS (SELECT id FROM word_not_need_to_learn WHERE word_id = words.id)LIMIT ?`;
  db.query(query, [count], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// 📌 2. נתיב לעדכון ערך לפי id
app.put("/word/:id", (req, res) => {
  const { id } = req.params;
  const { flag } = req.body;

  if (typeof flag !== "number") {
    return res.status(400).json({ error: "Invalid flag value" });
  }
  let tbl = '';
  
  if (flag == 1) {
    tbl = 'word_not_need_to_learn';
  }
  else {
    tbl = 'word_to_learn';
  }

  const query = `INSERT IGNORE INTO ${tbl} (word_id) VALUES (?) `;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({ message: "Word updated successfully", query: query, id:id });
  });
});

// הפעלת השרת
app.listen(PORT_SERVER, () => {
  console.log(`Server running on http://localhost:${PORT_SERVER}`);
});