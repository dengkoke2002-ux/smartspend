import { useState } from "react";
import AuthForm from "./components/AuthForm.jsx";
import Dashboard from "./components/Dashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <AuthForm onAuth={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
