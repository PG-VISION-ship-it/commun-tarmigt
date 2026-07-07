const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

const jsonPath = path.join(__dirname, "..", "data", "services.json");

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
    let sql = "SELECT * FROM services";
    const params = [];
    if (req.query.categorie) {
      sql += " WHERE categorie = ?";
      params.push(req.query.categorie);
    }
    sql += " ORDER BY ordre_affichage ASC, id ASC LIMIT ?";
    params.push(Math.min(Number(req.query.limit) || 50, 100));
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      let rows = getJsonFallback().slice();
      if (req.query.categorie) {
        rows = rows.filter(s => s.categorie === req.query.categorie);
      }
      rows.sort((a, b) => a.ordre_affichage - b.ordre_affichage || a.id - b.id);
      res.json(rows.slice(0, limit));
    } catch {
      res.status(500).json({ error: "Erreur lors de la récupération des services." });
    }
  }
});

router.get("/:id", async (req, res) => {
  const id = safeId(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID invalide." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM services WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Service introuvable." });
    res.json(rows[0]);
  } catch {
    try {
      const row = getJsonFallback().find(s => s.id === id);
      if (!row) return res.status(404).json({ error: "Service introuvable." });
      res.json(row);
    } catch {
      res.status(500).json({ error: "Erreur lors de la récupération du service." });
    }
  }
});

module.exports = router;
