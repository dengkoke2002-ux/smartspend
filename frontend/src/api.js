const BASE = "https://smartspend-oydm.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signup(name, email, password) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function addTransaction(data) {
  const res = await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getTransactions() {
  const res = await fetch(`${BASE}/transactions`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${BASE}/transactions/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function setBudget(category, monthly_limit) {
  const res = await fetch(`${BASE}/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ category, monthly_limit }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getBudgets() {
  const res = await fetch(`${BASE}/budgets`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getForecast() {
  const res = await fetch(`${BASE}/budgets/forecast`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function createGoal(name, target_amount, deadline) {
  const res = await fetch(`${BASE}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name, target_amount, deadline }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getGoals() {
  const res = await fetch(`${BASE}/goals`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function saveTowardGoal(goalId, amount) {
  const res = await fetch(`${BASE}/goals/${goalId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}