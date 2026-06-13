import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const isActive = (path) =>
    current === path || (path === "/documents" && pathname === "/documents" && !search);

  return (
    <header className="dashTopbar">
      <div className="dashBrand" onClick={() => go("/")} role="button" tabIndex={0}>
        <div className="dashTitle">MedicalRecord</div>
        <div className="dashSubtitle">Deine Dokumente. Deine Übersicht.</div>
      </div>

      {/* Desktop nav */}
      <nav className="dashNav">
        {NAV_ITEMS.map(({ label, path }) => (
          <button key={path} className={`dashNavBtn${isActive(path) ? " active" : ""}`} onClick={() => go(path)}>
            {label}
          </button>
        ))}
        <button className="dashNewBtn" type="button" onClick={() => go("/documents?new=1")}>
          + Neuer Bericht
        </button>
      </nav>

      <div className="dashTopbarRight">
        <button className="dashLogout dashLogoutDesktop" onClick={logout}>Logout</button>

        {/* Mobile hamburger */}
        <button className="dashHamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menü">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="dashMobileMenu">
          {NAV_ITEMS.map(({ label, path }) => (
            <button key={path} className={`dashMobileItem${isActive(path) ? " active" : ""}`} onClick={() => go(path)}>
              {label}
            </button>
          ))}
          <button className="dashMobileItem dashMobileNew" onClick={() => go("/documents?new=1")}>
            + Neuer Bericht
          </button>
          <button className="dashMobileItem dashMobileLogout" onClick={() => { setMenuOpen(false); logout(); }}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
