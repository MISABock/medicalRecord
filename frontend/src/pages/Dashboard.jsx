import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import HomeNav from "../components/HomeNav";

export default function Dashboard() {
  const navigate = useNavigate();

  const go = (path) => navigate(path);

  return (
    <div className="dashPage">
      <HomeNav />

      <main className="dashMain">
        <section className="dashHero">
          <h1 className="dashHeroTitle">Dashboard</h1>
          <p className="dashHeroText">
            Wähle einen Bereich aus. Später kommt hier deine Timeline, Suche und Upload Übersicht hin.
          </p>
        </section>

        <section className="dashGrid">
          <button className="dashCard" onClick={() => go("/documents")}>
            <div className="dashCardTitle">Dokumente</div>
            <div className="dashCardText">Alle Berichte, Befunde und PDFs an einem Ort.</div>
          </button>

          <button className="dashCard" onClick={() => go("/timeline")}>
            <div className="dashCardTitle">Timeline</div>
            <div className="dashCardText">Chronologische Sicht auf deine Untersuchungen.</div>
          </button>

          <button className="dashCard" onClick={() => go("/search")}>
            <div className="dashCardTitle">Suche</div>
            <div className="dashCardText">Finde Begriffe, Werte und Dokumente in Sekunden.</div>
          </button>

          <button className="dashCard" onClick={() => go("/settings")}>
            <div className="dashCardTitle">Einstellungen</div>
            <div className="dashCardText">Sicherheit, Export, Zugriff und Datenschutz.</div>
          </button>
        </section>
      </main>
    </div>
  );
}
