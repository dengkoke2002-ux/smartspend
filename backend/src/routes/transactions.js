import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth); // every route below requires a valid JWT

// Add a transaction
router.post("/", async (req, res) => {
  const { amount, category, description, txn_date } = req.body;
  if (!amount || !category) {
    return res.status(400).json({ error: "amount and category are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, category, description, txn_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
       RETURNING *`,
      [req.userId, amount, category, description || null, txn_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add transaction" });
  }
});

// List all transactions for the logged-in user
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY txn_date DESC, id DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch transactions" });
  }
});

// Totals grouped by category — feeds the dashboard pie chart
router.get("/summary", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, SUM(amount)::float AS total
       FROM transactions
       WHERE user_id = $1
       GROUP BY category
       ORDER BY total DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not compute summary" });
  }
});

export default router;
