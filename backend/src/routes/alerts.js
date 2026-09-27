import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/alerts — returns budget warnings + detected recurring subscriptions
router.get("/", async (req, res) => {
  try {
    const alerts = [];

    // 1) Budget warnings: any category at 90%+ of its monthly limit
    const budgetResult = await pool.query(
      `SELECT b.category, b.monthly_limit,
              COALESCE(SUM(t.amount) FILTER (
                WHERE date_trunc('month', t.txn_date) = date_trunc('month', CURRENT_DATE)
              ), 0)::float AS spent_this_month
       FROM budgets b
       LEFT JOIN transactions t
         ON t.user_id = b.user_id AND t.category = b.category
       WHERE b.user_id = $1
       GROUP BY b.category, b.monthly_limit`,
      [req.userId]
    );

    for (const row of budgetResult.rows) {
      const pct = row.spent_this_month / row.monthly_limit;
      if (pct >= 0.9) {
        alerts.push({
          type: "budget_warning",
          category: row.category,
          spent: row.spent_this_month,
          limit: row.monthly_limit,
          percent: Math.round(pct * 100),
          overBudget: pct >= 1,
        });
      }
    }

    // 2) Recurring subscription detection: same description appearing in
    // 2+ different months with a similar amount (within 5%) — a simple,
    // explainable heuristic rather than a black-box model.
    const recurringResult = await pool.query(
      `SELECT description,
              COUNT(DISTINCT date_trunc('month', txn_date)) AS month_count,
              AVG(amount)::float AS avg_amount,
              MAX(txn_date) AS last_seen
       FROM transactions
       WHERE user_id = $1 AND description IS NOT NULL AND description != ''
       GROUP BY description
       HAVING COUNT(DISTINCT date_trunc('month', txn_date)) >= 2
          AND (MAX(amount) - MIN(amount)) <= (AVG(amount) * 0.05)
       ORDER BY last_seen DESC`,
      [req.userId]
    );

    for (const row of recurringResult.rows) {
      alerts.push({
        type: "subscription",
        description: row.description,
        avgAmount: Math.round(row.avg_amount * 100) / 100,
        monthsSeen: row.month_count,
      });
    }

    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not compute alerts" });
  }
});

export default router;
