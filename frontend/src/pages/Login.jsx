import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import "./Login.css";
import AuthNav from "../components/AuthNav";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await apiPost("/auth/login", { email, password });
      localStorage.setItem("token", res.access_token);
      setMsg("Eingeloggt.");
      navigate("/dashboard");
    } catch (err) {
      setMsg(err.message || "Login fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="loginPage">
      <div className="loginCard">
       <AuthNav />
        <div className="loginHeader">
          <h1 className="loginTitle">Login</h1>
          <p className="loginSubtitle">Melde dich an, um deine Dokumente zu verwalten.</p>
        </div>

        <form className="loginForm" onSubmit={submit}>
          <label className="loginLabel">
            E-Mail
            <input
              className="loginInput"
              type="email"
              placeholder="name@domain.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="loginLabel">
            Passwort
            <input
              className="loginInput"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="loginButton" type="submit" disabled={loading}>
            {loading ? "Anmelden..." : "Anmelden"}
          </button>

          {msg ? (
            <div className={`loginMessage ${msg.toLowerCase().includes("eingeloggt") ? "ok" : "error"}`}>
              {msg}
            </div>
          ) : null}
        </form>

        <div className="loginFooter">
          <span>Noch kein Konto?</span>
          <Link className="loginLink" to="/register">
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
