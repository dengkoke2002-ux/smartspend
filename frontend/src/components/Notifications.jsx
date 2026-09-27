import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { addTransaction, getTransactions, getSummary } from "../api.js";
import UploadCsv from "./UploadCsv.jsx";
import BudgetsAndGoals from "./BudgetsAndGoals.jsx";
import Notifications from "./Notifications.jsx";

const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899"];

export default function Dashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "Food", description: "" });

  async function refresh() {
    setTransactions(await getTransactions());
    setSummary(await getSummary());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    await addTransaction({ ...form, amount: parseFloat(form.amount) });
    setForm({ amount: "", category: "Food", description: "" });
    refresh();
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Hi, {user.name}</h2>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            onLogout();
          }}
        >
          Log out
        </button>
      </div>

      <Notifications />

      <UploadCsv onImported={refresh} />

      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, margin: "20px 0" }}>
        <input
          placeholder="Amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {["Food", "Rent", "Travel", "Subscriptions", "Shopping", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      {summary.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={summary} dataKey="total" nameKey="category" outerRadius={100} label>
              {summary.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      <h3>Recent transactions</h3>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.txn_date} — {t.category} — ₹{t.amount} {t.description && `(${t.description})`}
          </li>
        ))}
      </ul>

      <BudgetsAndGoals />
    </div>
  );
}