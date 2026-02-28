import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite Database
  const db = new Database("app.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT
    )
  `);

  // Seed data if empty
  const count = db.prepare("SELECT COUNT(*) as count FROM items").get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare("INSERT INTO items (name, description, category) VALUES (?, ?, ?)");
    const seedData = [
      ["Apple iPhone 15", "Latest smartphone from Apple", "Electronics"],
      ["Samsung Galaxy S23", "High-end Android smartphone", "Electronics"],
      ["Sony WH-1000XM5", "Noise-canceling headphones", "Audio"],
      ["MacBook Pro 14", "Powerful laptop for professionals", "Computing"],
      ["Dell XPS 13", "Compact and powerful ultrabook", "Computing"],
      ["Nintendo Switch", "Hybrid gaming console", "Gaming"],
      ["PlayStation 5", "Next-gen gaming console", "Gaming"],
      ["Logitech MX Master 3S", "Ergonomic productivity mouse", "Accessories"],
      ["Keychron K2", "Mechanical wireless keyboard", "Accessories"],
      ["Kindle Paperwhite", "E-reader for book lovers", "Electronics"]
    ];
    seedData.forEach(item => insert.run(item[0], item[1], item[2]));
  }

  app.use(express.json());

  // Search API Endpoint (Predictive/Suggestions)
  app.get("/api/search", (req, res) => {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    try {
      const stmt = db.prepare("SELECT * FROM items WHERE name LIKE ? OR description LIKE ? LIMIT 5");
      const results = stmt.all(`%${query}%`, `%${query}%`);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Secure Google Sheets Proxy using Service Account
  app.get("/api/sheets/:spreadsheetId/:range", async (req, res) => {
    const { spreadsheetId, range } = req.params;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      return res.status(500).json({ 
        error: "Google Service Account credentials not configured on server.",
        details: "Please ensure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set."
      });
    }

    try {
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
      });

      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("Sheets proxy error:", error);
      res.status(error.code || 500).json({ 
        error: "Failed to fetch data from Google Sheets.",
        message: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
