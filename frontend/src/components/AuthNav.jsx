import { Link, useLocation } from "react-router-dom";
import "./AuthNav.css";

export default function AuthNav() {
  const { pathname } = useLocation();

  return (
    <div className="authNav">
      <Link
        to="/login"
        className={pathname === "/login" ? "active" : ""}
      >
        Login
      </Link>
      <Link
        to="/register"
        className={pathname === "/register" ? "active" : ""}
      >
        Registrieren
      </Link>
    </div>
  );
}
