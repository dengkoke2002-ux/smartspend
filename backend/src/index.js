import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import uploadRoutes from "./routes/upload.js";
import budgetRoutes from "./routes/budgets.js";
import goalRoutes from "./routes/goals.js";
import alertRoutes from "./routes/alerts.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmartSpend Backend"
  });
});

// Test connection to SmartSpend ML service
app.get("/api/ml/health", async (req, res) => {
  try {
    const response = await fetch(
      "https://smartspend-2-rsz7.onrender.com/health"
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "ML service is unavailable",
      error: error.message
    });
  }
});

// Send expense description to ML service
app.post("/api/ml/predict", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        error: "description is required"
      });
    }

    const response = await fetch(
      "https://smartspend-2-rsz7.onrender.com/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description
        })
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Could not connect to ML service",
      details: error.message
    });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`SmartSpend backend running on port ${port}`);
});