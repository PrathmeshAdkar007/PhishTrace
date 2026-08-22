import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import Emails from "./pages/Emails";
import Findings from "./pages/Findings";
import FindingDetails from "./pages/FindingDetails";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import MitreAttack from "./pages/MitreAttack";
import Login from "./pages/login";

import "./App.css";


function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // =================================================
  // CHECK EXISTING LOGIN SESSION
  // =================================================

  useEffect(() => {

    const checkAuthentication = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:5000/api/auth/me",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }

      } catch (error) {

        console.error(
          "Authentication check failed:",
          error
        );

        setUser(null);

      } finally {

        setLoading(false);

      }

    };


    checkAuthentication();

  }, []);


  // =================================================
  // LOADING
  // =================================================

  if (loading) {

    return (
      <div className="loading-screen">

        <div className="brand-icon">
          P
        </div>

        <h4>
          Loading PhishTrace...
        </h4>

      </div>
    );

  }


  // =================================================
  // LOGIN
  // =================================================

  if (!user) {

    return (
      <Login
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />
    );

  }


  // =================================================
  // NAVIGATION
  // =================================================

  const navClass = ({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`;


  // =================================================
  // LOGOUT
  // =================================================

  const handleLogout = async () => {

    try {

      await fetch(
        "http://127.0.0.1:5000/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    } finally {

      setUser(null);

    }

  };


  // =================================================
  // APPLICATION
  // =================================================

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

              <h4>
                PhishTrace
              </h4>

              <small>
                Security Operations
              </small>

            </div>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="navigation">

            {/* DASHBOARD */}

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


            {/* CASES */}

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


            {/* EMAILS */}

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


            {/* FINDINGS */}

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


            {/* THREAT INTELLIGENCE */}

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


            {/* MITRE ATT&CK */}

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


          {/* =================================================
              SIDEBAR FOOTER
          ================================================= */}

          <div className="sidebar-bottom">

            <div className="system-online">

              <span>
                ●
              </span>

              {" "}
              System Online

            </div>


            <small>
              {user.username} • {user.role}
            </small>


            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >

              Logout

            </button>

          </div>

        </aside>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="main-content">

          <Routes>


            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* =================================================
                CASE LIST
            ================================================= */}

            <Route
              path="/cases"
              element={<Cases />}
            />


            {/* =================================================
                CASE DETAILS
            ================================================= */}

            <Route
              path="/cases/:caseId"
              element={<CaseDetails />}
            />


            {/* =================================================
                EMAILS
            ================================================= */}

            <Route
              path="/emails"
              element={<Emails />}
            />


            {/* =================================================
                FINDINGS
            ================================================= */}

            <Route
              path="/findings"
              element={<Findings />}
            />


            {/* =================================================
                FINDING DETAILS
            ================================================= */}

            <Route
              path="/findings/:findingId"
              element={<FindingDetails />}
            />


            {/* =================================================
                THREAT INTELLIGENCE
            ================================================= */}

            <Route
              path="/threat-intelligence"
              element={<ThreatIntelligence />}
            />


            {/* =================================================
                MITRE ATT&CK
            ================================================= */}

            <Route
              path="/mitre"
              element={<MitreAttack />}
            />


            {/* =================================================
                FALLBACK
            ================================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>

  );

}


export default App;