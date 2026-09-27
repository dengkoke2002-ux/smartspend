import { Router } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage() });

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// Fallback keyword rules — used only if the ML service is down/unreachable
function guessCategoryFallback(description = "") {
  const text = description.toLowerCase();
  if (/swiggy|zomato|restaurant|food|cafe/.test(text)) return "Food";
  if (/uber|ola|irctc|train|flight|travel/.test(text)) return "Travel";
  if (/rent|landlord/.test(text)) return "Rent";
  if (/netflix|spotify|prime|hotstar|subscription/.test(text)) return "Subscriptions";
  if (/amazon|flipkart|myntra|shopping/.test(text)) return "Shopping";
  return "Other";
}

// Calls the Python ML service. Falls back to keyword rules if it's
// unreachable or hasn't been trained yet, so the app never breaks.
async function categorize(description) {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (!res.ok) throw new Error("ML service error");
    const data = await res.json();
    return data.category;
  } catch (err) {
    console.warn("ML service unavailable, using fallback rules:", err.message);
    return guessCategoryFallback(description);
  }
}

router.post("/csv", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const csvText = req.file.buffer.toString("utf-8");
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const inserted = [];
    for (const row of records) {
      const date = row.date || row.Date || row.txn_date;
      const amount = parseFloat(row.amount || row.Amount || row.debit || row.Debit);
      const description = row.description || row.Description || row.narration || "";

      if (!date || isNaN(amount)) continue;

      const category = await categorize(description);

      const result = await pool.query(
        `INSERT INTO transactions (user_id, amount, category, description, txn_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.userId, amount, category, description, date]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json({ insertedCount: inserted.length, transactions: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not process CSV file" });
  }
});

export default router;
