import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Set (or update) a budget for a category
router.post("/", async (req, res) => {
  const { category, monthly_limit } = req.body;
  if (!category || !monthly_limit) {
    return res.status(400).json({ error: "category and monthly_limit are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, monthly_limit)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category) DO UPDATE SET monthly_limit = $3
       RETURNING *`,
      [req.userId, category, monthly_limit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save budget" });
  }
});

// Get all budgets with how much has been spent this month per category
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.category, b.monthly_limit,
              COALESCE(SUM(t.amount) FILTER (
                WHERE date_trunc('month', t.txn_date) = date_trunc('month', CURRENT_DATE)
              ), 0)::float AS spent_this_month
       FROM budgets b
       LEFT JOIN transactions t
         ON t.user_id = b.user_id AND t.category = b.category
       WHERE b.user_id = $1
       GROUP BY b.category, b.monthly_limit
       ORDER BY b.category`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch budgets" });
  }
});

// Simple month-end forecast: (spent so far / days elapsed) * days in month
router.get("/forecast", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::float AS spent_this_month
       FROM transactions
       WHERE user_id = $1
         AND date_trunc('month', txn_date) = date_trunc('month', CURRENT_DATE)`,
      [req.userId]
    );
    const spentSoFar = result.rows[0].spent_this_month;

    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const projectedTotal = dayOfMonth > 0 ? (spentSoFar / dayOfMonth) * daysInMonth : 0;

    res.json({
      spentSoFar,
      dayOfMonth,
      daysInMonth,
      projectedTotal: Math.round(projectedTotal * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not compute forecast" });
  }
});

export default router;
