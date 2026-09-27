import { useEffect, useState } from "react";
import {
  setBudget,
  getBudgets,
  getForecast,
  createGoal,
  getGoals,
  saveTowardGoal,
} from "../api.js";

export default function BudgetsAndGoals() {
  const [budgets, setBudgets] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [goals, setGoals] = useState([]);

  const [budgetForm, setBudgetForm] = useState({ category: "Food", monthly_limit: "" });
  const [goalForm, setGoalForm] = useState({ name: "", target_amount: "", deadline: "" });

  async function refresh() {
    setBudgets(await getBudgets());
    setForecast(await getForecast());
    setGoals(await getGoals());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSetBudget(e) {
    e.preventDefault();
    await setBudget(budgetForm.category, parseFloat(budgetForm.monthly_limit));
    setBudgetForm({ ...budgetForm, monthly_limit: "" });
    refresh();
  }

  async function handleCreateGoal(e) {
    e.preventDefault();
    await createGoal(goalForm.name, parseFloat(goalForm.target_amount), goalForm.deadline || null);
    setGoalForm({ name: "", target_amount: "", deadline: "" });
    refresh();
  }

  async function handleSave(goalId) {
    const amount = prompt("How much did you save toward this goal?");
    if (!amount) return;
    await saveTowardGoal(goalId, parseFloat(amount));
    refresh();
  }

  return (
    <div style={{ margin: "30px 0", borderTop: "1px solid #ccc", paddingTop: 20 }}>
      <h3>Budgets</h3>
      <form onSubmit={handleSetBudget} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select
          value={budgetForm.category}
          onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
        >
          {["Food", "Rent", "Travel", "Subscriptions", "Shopping", "Other"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="Monthly limit"
          type="number"
          value={budgetForm.monthly_limit}
          onChange={(e) => setBudgetForm({ ...budgetForm, monthly_limit: e.target.value })}
          required
        />
        <button type="submit">Set budget</button>
      </form>

      {budgets.map((b) => {
        const pct = Math.min(100, Math.round((b.spent_this_month / b.monthly_limit) * 100));
        const over = b.spent_this_month > b.monthly_limit;
        return (
          <div key={b.category} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>{b.category}</span>
              <span>
                ₹{b.spent_this_month} / ₹{b.monthly_limit} {over && "⚠️ over budget"}
              </span>
            </div>
            <div style={{ background: "#eee", height: 8, borderRadius: 4 }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: over ? "#ef4444" : "#4f46e5",
                  height: 8,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        );
      })}

      {forecast && (
        <p style={{ marginTop: 16 }}>
          <strong>Month-end forecast:</strong> at your current pace, you're on track to spend
          about ₹{forecast.projectedTotal} this month (₹{forecast.spentSoFar} so far, day{" "}
          {forecast.dayOfMonth} of {forecast.daysInMonth}).
        </p>
      )}

      <h3 style={{ marginTop: 30 }}>Savings goals</h3>
      <form onSubmit={handleCreateGoal} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Goal name (e.g. New laptop)"
          value={goalForm.name}
          onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
          required
        />
        <input
          placeholder="Target amount"
          type="number"
          value={goalForm.target_amount}
          onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
          required
        />
        <input
          type="date"
          value={goalForm.deadline}
          onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
        />
        <button type="submit">Add goal</button>
      </form>

      {goals.map((g) => {
        const pct = Math.min(100, Math.round((g.saved_amount / g.target_amount) * 100));
        return (
          <div key={g.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>
                {g.name} {g.deadline && `(by ${g.deadline})`}
              </span>
              <span>
                ₹{g.saved_amount} / ₹{g.target_amount}{" "}
                <button onClick={() => handleSave(g.id)} style={{ marginLeft: 8 }}>
                  Add savings
                </button>
              </span>
            </div>
            <div style={{ background: "#eee", height: 8, borderRadius: 4 }}>
              <div style={{ width: `${pct}%`, background: "#22c55e", height: 8, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
