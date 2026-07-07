const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

const jsonPath = path.join(__dirname, "..", "data", "actualites.json");

function getJsonFallback() {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    return [];
  }
}

function safeId(value) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : NaN;
}

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const [rows] = await pool.query(
      "SELECT * FROM actualites WHERE est_publie = 1 ORDER BY date_publication DESC LIMIT ?",
      [limit]
    );
    res.json(rows);
  } catch {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const rows = getJsonFallback()
        .filter(a => a.est_publie)
        .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication))
        .slice(0, limit);
      res.json(rows);
    } catch {
      res.status(500).json({ error: "Erreur lors de la récupération des actualités." });
    }
  }
});

router.get("/:id", async (req, res) => {
  const id = safeId(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID invalide." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM actualites WHERE id = ? AND est_publie = 1 LIMIT 1",
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Actualité introuvable." });
    res.json(rows[0]);
  } catch {
    try {
      const row = getJsonFallback().find(a => a.id === id && a.est_publie);
      if (!row) return res.status(404).json({ error: "Actualité introuvable." });
      res.json(row);
    } catch {
      res.status(500).json({ error: "Erreur lors de la récupération de l'actualité." });
    }
  }
});

module.exports = router;
