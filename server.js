const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const actualitesRouter = require("./routes/actualites");
const servicesRouter = require("./routes/services");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de requêtes. Veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim();
}

app.use("/api/actualites", actualitesRouter);
app.use("/api/services", servicesRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", commune: "Tarmigt" });
});

app.post("/api/contact", contactLimiter, (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }
  const entry = {
    id: Date.now(),
    name: sanitize(name),
    email: sanitize(email),
    phone: sanitize(phone || ""),
    subject: sanitize(subject),
    message: sanitize(message),
    date: new Date().toISOString(),
  };
  const filePath = path.join(__dirname, "data", "contacts.json");
  let entries = [];
  try { entries = JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { /* empty */ }
  entries.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf-8");
  res.status(201).json({ success: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur de la Commune de Tarmigt lancé sur http://localhost:${PORT}`);
});