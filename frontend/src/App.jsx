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
import InvestigationTimeline from "./pages/InvestigationTimeline";

import Emails from "./pages/Emails";
import EmailDetails from "./pages/EmailDetails";

import Findings from "./pages/Findings";
import FindingDetails from "./pages/FindingDetails";

import AffectedUsers from "./pages/AffectedUsers";

import ThreatIntelligence from "./pages/ThreatIntelligence";
import ThreatIntelligenceDetails from "./pages/ThreatIntelligenceDetails";

import MitreAttack from "./pages/MitreAttack";
import MitreDetails from "./pages/MitreDetails";

import Campaigns from "./pages/Campaigns";

import ContainmentActions from "./pages/ContainmentActions";

import Report from "./pages/Report";

import Login from "./pages/login";

import "./App.css";


const API_BASE = "http://localhost:5000";


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

          `${API_BASE}/api/auth/me`,

          {
            credentials: "include",
          }

        );


        const data = await response.json();


        if (data.authenticated) {

          setUser(
            data.user
          );

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

          setUser(
            loggedInUser
          );

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

      const response = await fetch(

        `${API_BASE}/api/auth/logout`,

        {

          method: "POST",

          credentials: "include",

        }

      );


      if (!response.ok) {

        console.error(

          "Logout request failed:",

          response.status

        );

      }

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


          {/* =================================================
              BRAND
          ================================================= */}

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


            {/* AFFECTED USERS */}

            <NavLink

              to="/affected-users"

              className={navClass}

            >

              <span className="nav-icon">
                ♟
              </span>


              <span>
                Affected Users
              </span>

            </NavLink>


            {/* CONTAINMENT */}

            <NavLink

              to="/containment-actions"

              className={navClass}

            >

              <span className="nav-icon">
                🛡
              </span>


              <span>
                Containment
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


            {/* CAMPAIGNS */}

            <NavLink

              to="/campaigns"

              className={navClass}

            >

              <span className="nav-icon">
                ◈
              </span>


              <span>
                Campaigns
              </span>

            </NavLink>


            {/* REPORTS */}

            <NavLink

              to="/reports/1"

              className={navClass}

            >

              <span className="nav-icon">
                ▤
              </span>


              <span>
                Incident Report
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


            {/* INVESTIGATION TIMELINE */}

            <Route

              path="/cases/:caseId/timeline"

              element={<InvestigationTimeline />}

            />


            {/* EMAILS */}

            <Route

              path="/emails"

              element={<Emails />}

            />


            {/* EMAIL DETAILS */}

            <Route

              path="/emails/:emailId"

              element={<EmailDetails />}

            />


            {/* FINDINGS */}

            <Route

              path="/findings"

              element={<Findings />}

            />


            {/* FINDING DETAILS */}

            <Route

              path="/findings/:findingId"

              element={<FindingDetails />}

            />


            {/* AFFECTED USERS */}

            <Route

              path="/affected-users"

              element={<AffectedUsers />}

            />


            {/* CONTAINMENT ACTIONS */}

            <Route

              path="/containment-actions"

              element={<ContainmentActions />}

            />


            {/* THREAT INTELLIGENCE */}

            <Route

              path="/threat-intelligence"

              element={<ThreatIntelligence />}

            />


            {/* THREAT INTELLIGENCE DETAILS */}

            <Route

              path="/threat-intelligence/:resultId"

              element={<ThreatIntelligenceDetails />}

            />


            {/* MITRE ATT&CK */}

            <Route

              path="/mitre"

              element={<MitreAttack />}

            />


            {/* MITRE ATT&CK DETAILS */}

            <Route

              path="/mitre/:mappingId"

              element={<MitreDetails />}

            />


            {/* CAMPAIGNS */}

            <Route

              path="/campaigns"

              element={<Campaigns />}

            />


            {/* INCIDENT REPORT */}

            <Route

              path="/reports/:caseId"

              element={<Report />}

            />


            {/* FALLBACK */}

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