import { useNavigate, useLocation } from "react-router-dom";
import "./HomeNav.css";

const NAV_ITEMS = [
  { label: "Übersicht",   path: "/dashboard" },
  { label: "Dokumente",   path: "/documents" },
  { label: "Timeline",    path: "/documents?view=timeline" },
  { label: "Arzt/Praxis", path: "/documents?view=provider" },
  { label: "Rezepte",     path: "/documents?view=medication" },
  { label: "Zeugnisse",   path: "/documents?view=doctorNote" },
];

export default function HomeNav() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const current = pathname + search;

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
            className={`dashNavBtn${current === path || (path === "/documents" && pathname === "/documents" && !search) ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
        <button className="dashNewBtn" type="button" onClick={() => navigate("/documents?new=1")}>
          + Neuer Bericht
        </button>
      </nav>

      <div className="dashTopbarRight">
        <button className="dashLogout" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
