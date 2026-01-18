import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api/client";
import "./Register.css";
import AuthNav from "../components/AuthNav";


export default function Register() {
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
      await apiPost("/auth/register", { email, password });
      setMsg("Registrierung erfolgreich. Du kannst dich jetzt einloggen.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMsg(err.message || "Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="registerCard">
       <AuthNav />
        <div className="registerHeader">
          <h1 className="registerTitle">Registrieren</h1>
          <p className="registerSubtitle">
            Erstelle ein Konto, um deine medizinischen Dokumente sicher zu verwalten.
          </p>
        </div>

        <form className="registerForm" onSubmit={submit}>
          <label className="registerLabel">
            E-Mail
            <input
              className="registerInput"
              type="email"
              placeholder="name@domain.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="registerLabel">
            Passwort
            <input
              className="registerInput"
              type="password"
              placeholder="Mindestens 8 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button className="registerButton" type="submit" disabled={loading}>
            {loading ? "Registrieren..." : "Registrieren"}
          </button>

          {msg ? (
            <div
              className={`registerMessage ${
                msg.toLowerCase().includes("erfolgreich") ? "ok" : "error"
              }`}
            >
              {msg}
            </div>
          ) : null}
        </form>

        <div className="registerFooter">
          <span>Bereits ein Konto?</span>
          <Link className="registerLink" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
