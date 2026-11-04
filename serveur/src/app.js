require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const db = require("./db");

const app = express();

app.use(express.json());

// pour que react puisse appeler le serveur
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// route pour tester si la bd marche
app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM utilisateurs");
    res.json({ total: rows[0].total });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("serveur demarre sur le port " + process.env.PORT);
});
