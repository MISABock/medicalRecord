import { useNavigate } from "react-router-dom";
import "./HomeNav.css";

export default function HomeNav() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="dashTopbar">
      <button className="dashLogout" onClick={logout}>
        Logout
      </button>

      <div className="dashBrand">
        <div className="dashTitle">MedicalRecord</div>
        <div className="dashSubtitle">Deine Dokumente. Deine Übersicht.</div>
      </div>

      <div className="dashTopbarRight" />
    </header>
  );
}
