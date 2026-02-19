import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate("/");
  };

  return (
    <main className="login-page">
      <form onSubmit={submit} className="card">
        <h1>Sign in</h1>
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}
