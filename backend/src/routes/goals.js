import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const { name, target_amount, deadline } = req.body;
  if (!name || !target_amount) {
    return res.status(400).json({ error: "name and target_amount are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO goals (user_id, name, target_amount, deadline)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.userId, name, target_amount, deadline || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create goal" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY id DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch goals" });
  }
});

// Add money saved toward a goal
router.post("/:id/save", async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: "amount is required" });
  try {
    const result = await pool.query(
      `UPDATE goals SET saved_amount = saved_amount + $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [amount, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Goal not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update goal" });
  }
});

export default router;
