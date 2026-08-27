import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const API_BASE = "http://localhost:5000";


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  label,
  value,
  icon,
  onClick,
}) {

  return (

    <div
      className={`stat-card ${
        onClick ? "clickable-stat" : ""
      }`}

      onClick={onClick}

      role={
        onClick
          ? "button"
          : undefined
      }

      tabIndex={
        onClick
          ? 0
          : undefined
      }

      onKeyDown={(event) => {

        if (
          onClick &&
          (
            event.key === "Enter" ||
            event.key === " "
          )
        ) {

          event.preventDefault();

          onClick();

        }

      }}

    >

      <div className="stat-icon">
        {icon}
      </div>


      <div>

        <div className="stat-value">
          {value}
        </div>


        <div className="stat-label">
          {label}
        </div>

      </div>

    </div>

  );

}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {

  const navigate = useNavigate();


  const [cases, setCases] =
    useState([]);

  const [findings, setFindings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);

        setError("");


        const [
          casesResponse,
          findingsResponse,
        ] = await Promise.all([

          fetch(
            `${API_BASE}/api/cases`,
            {
              credentials: "include",
            }
          ),

          fetch(
            `${API_BASE}/api/findings`,
            {
              credentials: "include",
            }
          ),

        ]);


        if (!casesResponse.ok) {

          throw new Error(
            `Cases API request failed with status ${casesResponse.status}`
          );

        }


        if (!findingsResponse.ok) {

          throw new Error(
            `Findings API request failed with status ${findingsResponse.status}`
          );

        }


        const casesData =
          await casesResponse.json();


        const findingsData =
          await findingsResponse.json();


        setCases(
          casesData.cases || []
        );


        setFindings(
          findingsData.findings || []
        );

      } catch (err) {

        console.error(
          "Dashboard API error:",
          err
        );

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }


    loadDashboard();

  }, []);


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <div className="loading-screen">

        <div>

          <h2>
            Loading PhishTrace...
          </h2>


          <p>
            Fetching security investigation data
            from the backend.
          </p>

        </div>

      </div>

    );

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (error) {

    return (

      <div className="error-screen">

        <div className="card-dark">

          <h2>
            Unable to load dashboard
          </h2>


          <p>
            The PhishTrace frontend could not
            load the security investigation data.
          </p>


          <p className="danger-text">
            {error}
          </p>


          <p>
            Make sure your Flask backend is
            running on:
          </p>


          <code>
            http://localhost:5000
          </code>

        </div>

      </div>

    );

  }


  // ===================================================
  // CALCULATIONS
  // ===================================================

  const totalCases =
    cases.length;


  const openCases =
    cases.filter(
      (caseItem) =>
        String(
          caseItem.status || ""
        ).toLowerCase() !==
        "closed"
    );


  const closedCases =
    cases.filter(
      (caseItem) =>
        String(
          caseItem.status || ""
        ).toLowerCase() ===
        "closed"
    );


  const criticalCases =
    cases.filter(
      (caseItem) =>
        String(
          caseItem.severity || ""
        ).toLowerCase() ===
        "critical"
    );


  const highCases =
    cases.filter(
      (caseItem) =>
        String(
          caseItem.severity || ""
        ).toLowerCase() ===
        "high"
    );


  const criticalFindings =
    findings.filter(
      (finding) =>
        String(
          finding.severity || ""
        ).toLowerCase() ===
        "critical"
    );


  const highFindings =
    findings.filter(
      (finding) =>
        String(
          finding.severity || ""
        ).toLowerCase() ===
        "high"
    );


  const mediumFindings =
    findings.filter(
      (finding) =>
        String(
          finding.severity || ""
        ).toLowerCase() ===
        "medium"
    );


  const lowFindings =
    findings.filter(
      (finding) =>
        String(
          finding.severity || ""
        ).toLowerCase() ===
        "low"
    );


  // ===================================================
  // SORT RECENT CASES
  // ===================================================

  const recentCases =
    [...cases]
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )
      .slice(0, 5);


  // ===================================================
  // SORT RECENT FINDINGS
  // ===================================================

  const recentFindings =
    [...findings]
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )
      .slice(0, 5);


  // ===================================================
  // DATE FORMATTER
  // ===================================================

  const formatDate = (
    value
  ) => {

    if (!value) {

      return "N/A";

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "N/A";

    }


    return date.toLocaleString();

  };


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div className="page">


      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>

          <h2>
            Security Dashboard
          </h2>


          <p>
            Real-time overview of phishing
            investigations and security findings
          </p>

        </div>


        <div className="case-badge">

          SOC OVERVIEW

        </div>

      </div>


      {/* =================================================
          DASHBOARD HEADER
      ================================================= */}

      <div className="card-dark dashboard-overview">

        <div>

          <div className="small-label">

            PHISHTRACE SECURITY OPERATIONS

          </div>


          <h1>
            Investigation Overview
          </h1>


          <p>

            Monitor active phishing investigations,
            security findings, and incident severity
            across your environment.

          </p>

        </div>


        <div className="dashboard-overview-status">

          <span className="status">

            {openCases.length}
            {" "}
            ACTIVE CASE
            {openCases.length !== 1
              ? "S"
              : ""}

          </span>

        </div>

      </div>


      {/* =================================================
          MAIN STATISTICS
      ================================================= */}

      <div className="stats-grid">


        <StatCard
          label="Total Cases"
          value={totalCases}
          icon="◉"
          onClick={() =>
            navigate("/cases")
          }
        />


        <StatCard
          label="Open Cases"
          value={openCases.length}
          icon="◌"
          onClick={() =>
            navigate("/cases")
          }
        />


        <StatCard
          label="Critical Cases"
          value={criticalCases.length}
          icon="⚠"
          onClick={() =>
            navigate("/cases")
          }
        />


        <StatCard
          label="High Severity"
          value={highCases.length}
          icon="▲"
          onClick={() =>
            navigate("/cases")
          }
        />


        <StatCard
          label="Total Findings"
          value={findings.length}
          icon="!"
          onClick={() =>
            navigate("/findings")
          }
        />


        <StatCard
          label="Closed Cases"
          value={closedCases.length}
          icon="✓"
          onClick={() =>
            navigate("/cases")
          }
        />

      </div>


      {/* =================================================
          DASHBOARD GRID
      ================================================= */}

      <div className="dashboard-grid">


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div>


          {/* =================================================
              RECENT INVESTIGATIONS
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Recent Investigations
                </h3>


                <small>
                  Latest phishing cases
                  created in PhishTrace
                </small>

              </div>


              <button
                type="button"
                className="dashboard-action-button"
                onClick={() =>
                  navigate("/cases")
                }
              >

                View All

              </button>

            </div>


            {recentCases.length === 0 ? (

              <p className="page-description">

                No investigations have been
                created yet.

              </p>

            ) : (

              <div className="findings-list">

                {recentCases.map(
                  (caseItem) => (

                    <div
                      className="finding dashboard-item-clickable"
                      key={caseItem.id}

                      onClick={() =>
                        navigate(
                          `/cases/${caseItem.id}`
                        )
                      }

                      role="button"

                      tabIndex={0}

                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {

                          event.preventDefault();

                          navigate(
                            `/cases/${caseItem.id}`
                          );

                        }

                      }}

                      title="Open investigation"
                    >

                      <div className="finding-indicator">

                        {String(
                          caseItem.severity ||
                          "unknown"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>


                      <div>

                        <h5>

                          {caseItem.title ||
                            "Untitled Investigation"}

                        </h5>


                        <p>

                          {caseItem.description ||
                            "No description available."}

                        </p>


                        <div className="finding-tags">

                          <span className="tag">

                            {caseItem.case_number ||
                              `CASE-${caseItem.id}`}

                          </span>


                          <span className="tag severity-tag">

                            {String(
                              caseItem.severity ||
                              "unknown"
                            ).toUpperCase()}

                          </span>


                          <span className="tag">

                            {String(
                              caseItem.status ||
                              "unknown"
                            ).toUpperCase()}

                          </span>

                        </div>


                        <small>

                          Created:
                          {" "}

                          {formatDate(
                            caseItem.created_at
                          )}

                        </small>

                      </div>


                      <div className="dashboard-item-arrow">
                        →
                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              RECENT SECURITY FINDINGS
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Recent Security Findings
                </h3>


                <small>
                  Latest findings generated
                  during investigations
                </small>

              </div>


              <button
                type="button"
                className="dashboard-action-button"
                onClick={() =>
                  navigate("/findings")
                }
              >

                View All

              </button>

            </div>


            <div className="case-detail-grid">

              <div>

                <span>
                  Critical
                </span>

                <strong>
                  {criticalFindings.length}
                </strong>

              </div>


              <div>

                <span>
                  High
                </span>

                <strong>
                  {highFindings.length}
                </strong>

              </div>


              <div>

                <span>
                  Medium
                </span>

                <strong>
                  {mediumFindings.length}
                </strong>

              </div>


              <div>

                <span>
                  Low
                </span>

                <strong>
                  {lowFindings.length}
                </strong>

              </div>

            </div>


            {recentFindings.length === 0 ? (

              <p className="page-description">

                No security findings have been
                recorded yet.

              </p>

            ) : (

              <div className="findings-list">

                {recentFindings.map(
                  (finding) => (

                    <div
                      className="finding dashboard-item-clickable"
                      key={finding.id}

                      onClick={() =>
                        navigate(
                          `/findings/${finding.id}`
                        )
                      }

                      role="button"

                      tabIndex={0}

                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {

                          event.preventDefault();

                          navigate(
                            `/findings/${finding.id}`
                          );

                        }

                      }}

                      title="Open finding details"
                    >

                      <div className="finding-indicator">
                        !
                      </div>


                      <div>

                        <h5>

                          {finding.title ||
                            "Security Finding"}

                        </h5>


                        <p>

                          {finding.description ||
                            "No description available."}

                        </p>


                        <div className="finding-tags">

                          <span className="tag severity-tag">

                            {String(
                              finding.severity ||
                              "unknown"
                            ).toUpperCase()}

                          </span>


                          {finding.confidence && (

                            <span className="tag">

                              Confidence:
                              {" "}

                              {String(
                                finding.confidence
                              ).toUpperCase()}

                            </span>

                          )}

                        </div>

                      </div>


                      <div className="dashboard-item-arrow">
                        →
                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div>


          {/* =================================================
              SECURITY POSTURE
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Security Posture
                </h3>


                <small>
                  Current investigation overview
                </small>

              </div>

            </div>


            <div className="risk-score">

              <div className="score">

                {criticalCases.length > 0
                  ? "90"
                  : highCases.length > 0
                  ? "75"
                  : openCases.length > 0
                  ? "50"
                  : "25"}

              </div>


              <div className="score-label">
                CURRENT RISK SCORE
              </div>

            </div>


            <div className="risk-breakdown">

              <div>

                <span>
                  Total Cases
                </span>

                <strong>
                  {totalCases}
                </strong>

              </div>


              <div>

                <span>
                  Active Cases
                </span>

                <strong>
                  {openCases.length}
                </strong>

              </div>


              <div>

                <span>
                  Critical Findings
                </span>

                <strong>
                  {criticalFindings.length}
                </strong>

              </div>


              <div>

                <span>
                  High Findings
                </span>

                <strong>
                  {highFindings.length}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              CASE SEVERITY OVERVIEW
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Case Severity Overview
                </h3>


                <small>
                  Distribution of investigations
                  by severity
                </small>

              </div>

            </div>


            <div className="risk-breakdown">

              <div>

                <span>
                  Critical
                </span>

                <strong>
                  {criticalCases.length}
                </strong>

              </div>


              <div>

                <span>
                  High
                </span>

                <strong>
                  {highCases.length}
                </strong>

              </div>


              <div>

                <span>
                  Open
                </span>

                <strong>
                  {openCases.length}
                </strong>

              </div>


              <div>

                <span>
                  Closed
                </span>

                <strong>
                  {closedCases.length}
                </strong>

              </div>

            </div>


            <button
              type="button"
              className="dashboard-action-button dashboard-full-button"
              onClick={() =>
                navigate("/cases")
              }
            >

              View Investigations

            </button>

          </div>


          {/* =================================================
              FINDINGS SUMMARY
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Findings Summary
                </h3>


                <small>
                  Security issues identified
                  across all investigations
                </small>

              </div>

            </div>


            <div className="risk-breakdown">

              <div>

                <span>
                  Total
                </span>

                <strong>
                  {findings.length}
                </strong>

              </div>


              <div>

                <span>
                  Critical
                </span>

                <strong>
                  {criticalFindings.length}
                </strong>

              </div>


              <div>

                <span>
                  High
                </span>

                <strong>
                  {highFindings.length}
                </strong>

              </div>


              <div>

                <span>
                  Medium
                </span>

                <strong>
                  {mediumFindings.length}
                </strong>

              </div>

            </div>


            <button
              type="button"
              className="dashboard-action-button dashboard-full-button"
              onClick={() =>
                navigate("/findings")
              }
            >

              View All Findings

            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>


        <span>
          {totalCases}
          {" "}
          Investigation
          {totalCases !== 1
            ? "s"
            : ""}

        </span>

      </footer>

    </div>

  );

}


export default Dashboard;