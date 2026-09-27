import { useEffect, useState } from "react";

const BASE = "https://smartspend-oydm.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getAlerts() {
  const res = await fetch(`${BASE}/alerts`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(() => setAlerts([]));
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div style={{ margin: "20px 0" }}>
      <h3>Notifications</h3>
      {alerts.map((a, i) => {
        if (a.type === "budget_warning") {
          return (
            <div
              key={i}
              style={{
                background: a.overBudget ? "#fee2e2" : "#fef3c7",
                border: `1px solid ${a.overBudget ? "#ef4444" : "#f59e0b"}`,
                borderRadius: 6,
                padding: "8px 12px",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              {a.overBudget ? "🚨" : "⚠️"} <strong>{a.category}</strong>: you've spent ₹{a.spent} of
              your ₹{a.limit} budget ({a.percent}%){a.overBudget ? " — over budget!" : " — almost at your limit"}
            </div>
          );
        }
        if (a.type === "subscription") {
          return (
            <div
              key={i}
              style={{
                background: "#eef2ff",
                border: "1px solid #4f46e5",
                borderRadius: 6,
                padding: "8px 12px",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              🔁 Looks like a recurring charge: <strong>{a.description}</strong> — about ₹{a.avgAmount}, seen in{" "}
              {a.monthsSeen} different months. Still need it?
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}