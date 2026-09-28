```javascript
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

// ===============================
// SmartSpend API Routes
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/alerts", alertRoutes);


// ===============================
// Backend Health Check
// ===============================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmartSpend Backend"
  });
});


// ===============================
// ML Service Health Check
// ===============================

app.get("/api/ml/health", async (req, res) => {
  try {
    const response = await fetch(
      "https://smartspend-2-rsz7.onrender.com/health"
    );

    const data = await response.json();

    res.status(response.status).json({
      status: "ok",
      ml_service: data
    });

  } catch (error) {
    console.error("ML health check error:", error);

    res.status(503).json({
      status: "error",
      message: "ML service is unavailable",
      error: error.message
    });
  }
});


// ===============================
// ML Prediction
// ===============================

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
          description: description
        })
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (error) {
    console.error("ML prediction error:", error);

    res.status(500).json({
      error: "Could not connect to ML service",
      details: error.message
    });
  }
});


// ===============================
// Start Server
// ===============================

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(
    `SmartSpend Backend running on port ${port}`
  );
});
```
