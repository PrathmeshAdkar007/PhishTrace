import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";

import "./App.css";

function Placeholder({ title }) {
  return (
    <div>
      <div className="topbar">
        <div>
          <h2>{title}</h2>
          <p>PhishTrace Security Operations Platform</p>
        </div>
      </div>

      <div className="card-dark placeholder-page">
        <h3>{title}</h3>
        <p>
          This module is ready to be connected to the PhishTrace backend.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <div className="brand">
            <div className="brand-icon">P</div>

            <div>
              <h4>PhishTrace</h4>
              <small>Security Operations</small>
            </div>
          </div>

          <nav className="navigation">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>▣</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/cases"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>◉</span>
              Cases
            </NavLink>

            <NavLink
              to="/emails"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>✉</span>
              Emails
            </NavLink>

            <NavLink
              to="/findings"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>⚠</span>
              Findings
            </NavLink>

            <NavLink
              to="/threat-intelligence"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>⌁</span>
              Threat Intelligence
            </NavLink>

            <NavLink
              to="/mitre"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span>⚔</span>
              MITRE ATT&CK
            </NavLink>

          </nav>

          <div className="sidebar-bottom">
            <div>● System Online</div>
            <small>PhishTrace SOC v1.0</small>
          </div>

        </aside>

        {/* MAIN */}
        <main className="main-content">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/cases"
              element={
                <Placeholder title="Cases" />
              }
            />

            <Route
              path="/emails"
              element={
                <Placeholder title="Emails" />
              }
            />

            <Route
              path="/findings"
              element={
                <Placeholder title="Findings" />
              }
            />

            <Route
              path="/threat-intelligence"
              element={
                <Placeholder title="Threat Intelligence" />
              }
            />

            <Route
              path="/mitre"
              element={
                <Placeholder title="MITRE ATT&CK" />
              }
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;