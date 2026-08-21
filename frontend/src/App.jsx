import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import Emails from "./pages/Emails";
import Findings from "./pages/Findings";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import MitreAttack from "./pages/MitreAttack";

import "./App.css";

function App() {
  const navClass = ({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`;

  return (
    <BrowserRouter>
      <div className="app">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="sidebar">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-icon">
              P
            </div>

            <div>
              <h4>PhishTrace</h4>

              <small>
                Security Operations
              </small>
            </div>

          </div>


          {/* NAVIGATION */}

          <nav className="navigation">

            <NavLink
              to="/"
              end
              className={navClass}
            >
              <span className="nav-icon">
                ▣
              </span>

              <span>
                Dashboard
              </span>
            </NavLink>


            <NavLink
              to="/cases"
              className={navClass}
            >
              <span className="nav-icon">
                ◉
              </span>

              <span>
                Cases
              </span>
            </NavLink>


            <NavLink
              to="/emails"
              className={navClass}
            >
              <span className="nav-icon">
                ✉
              </span>

              <span>
                Emails
              </span>
            </NavLink>


            <NavLink
              to="/findings"
              className={navClass}
            >
              <span className="nav-icon">
                ⚠
              </span>

              <span>
                Findings
              </span>
            </NavLink>


            <NavLink
              to="/threat-intelligence"
              className={navClass}
            >
              <span className="nav-icon">
                ⌁
              </span>

              <span>
                Threat Intelligence
              </span>
            </NavLink>


            <NavLink
              to="/mitre"
              className={navClass}
            >
              <span className="nav-icon">
                ⚔
              </span>

              <span>
                MITRE ATT&CK
              </span>
            </NavLink>

          </nav>


          {/* SIDEBAR FOOTER */}

          <div className="sidebar-bottom">

            <div className="system-online">
              <span>●</span>{" "}
              System Online
            </div>

            <small>
              PhishTrace SOC v1.0
            </small>

          </div>

        </aside>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="main-content">

          <Routes>

            {/* DASHBOARD */}

            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* CASE LIST */}

            <Route
              path="/cases"
              element={<Cases />}
            />


            {/* CASE DETAILS */}

            <Route
              path="/cases/:caseId"
              element={<CaseDetails />}
            />


            {/* EMAILS */}

            <Route
              path="/emails"
              element={<Emails />}
            />


            {/* FINDINGS */}

            <Route
              path="/findings"
              element={<Findings />}
            />


            {/* THREAT INTELLIGENCE */}

            <Route
              path="/threat-intelligence"
              element={<ThreatIntelligence />}
            />


            {/* MITRE ATT&CK */}

            <Route
              path="/mitre"
              element={<MitreAttack />}
            />


            {/* FALLBACK */}

            <Route
              path="*"
              element={<Dashboard />}
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;