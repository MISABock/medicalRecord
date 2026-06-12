import { useNavigate, useLocation } from "react-router-dom";
import "./HomeNav.css";

const NAV_ITEMS = [
  { label: "Übersicht",    path: "/dashboard" },
  { label: "Dokumente",    path: "/documents" },
];

export default function HomeNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="dashTopbar">
      <div className="dashBrand" onClick={() => navigate("/")} role="button" tabIndex={0}>
        <div className="dashTitle">MedicalRecord</div>
        <div className="dashSubtitle">Deine Dokumente. Deine Übersicht.</div>
      </div>

      <nav className="dashNav">
        {NAV_ITEMS.map(({ label, path }) => (
          <button
            key={path}
            className={`dashNavBtn${pathname === path ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="dashTopbarRight">
        <button className="dashLogout" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
