import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


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


  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const CASE_ID = 1;


  // ===================================================
  // LOAD CASE SUMMARY
  // ===================================================

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          `http://127.0.0.1:5000/api/cases/${CASE_ID}/summary`
        );


        if (!response.ok) {

          throw new Error(
            `API request failed with status ${response.status}`
          );

        }


        const result =
          await response.json();


        setData(result);

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
            Fetching investigation data
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
            connect to the Flask backend.
          </p>


          <p className="danger-text">
            {error}
          </p>


          <p>
            Make sure your Flask backend is
            running on:
          </p>


          <code>
            http://127.0.0.1:5000
          </code>

        </div>

      </div>

    );

  }


  // ===================================================
  // SAFETY CHECK
  // ===================================================

  if (
    !data ||
    !data.case
  ) {

    return (

      <div className="error-screen">

        <div className="card-dark">

          <h2>
            No investigation data
          </h2>


          <p>
            The backend returned an empty
            case summary.
          </p>

        </div>

      </div>

    );

  }


  // ===================================================
  // DATA
  // ===================================================

  const caseData =
    data.case;


  const counts =
    data.counts || {};


  const emails =
    data.emails || [];


  const indicators =
    data.indicators || [];


  const findings =
    data.findings || [];


  const threatIntel =
    data.threat_intelligence || [];


  const affectedUsers =
    data.affected_users || [];


  const containmentActions =
    data.containment_actions || [];


  const mitreMappings =
    data.mitre_mappings || [];


  // ===================================================
  // THREAT INTELLIGENCE HELPERS
  // ===================================================

  const getThreatIndicator = (
    result
  ) => {

    return (
      result.raw_response?.indicator ||
      result.indicator ||
      result.value ||
      "Unknown"
    );

  };


  const getThreatIndicatorType = (
    result
  ) => {

    return (
      result.raw_response?.indicator_type ||
      result.indicator_type ||
      "Unknown"
    );

  };


  // ===================================================
  // CALCULATIONS
  // ===================================================

  const maliciousThreatIntel =
    threatIntel.filter(
      (result) =>
        String(
          result.verdict || ""
        ).toLowerCase() ===
        "malicious"
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


  const completedActions =
    containmentActions.filter(
      (action) =>
        String(
          action.status || ""
        ).toLowerCase() ===
        "completed"
    );


  // ===================================================
  // RISK LEVEL
  // ===================================================

  const riskLevel =
    String(
      caseData.severity ||
      "unknown"
    ).toUpperCase();


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
            Phishing investigation overview
          </p>

        </div>


        <div className="case-badge">

          CASE {caseData.case_number}

        </div>

      </div>


      {/* =================================================
          CASE HEADER
      ================================================= */}

      <div className="card-dark case-header">

        <div>

          <div className="small-label">

            {String(
              caseData.status
            ).toLowerCase() ===
            "closed"

              ? "CLOSED INVESTIGATION"

              : "ACTIVE INVESTIGATION"}

          </div>


          <h1>
            {caseData.title}
          </h1>


          <p>
            {caseData.description ||
              "No case description available."}
          </p>


          <div className="case-meta">

            <div>

              Case ID:

              <strong>
                {" "}
                {caseData.case_number}
              </strong>

            </div>


            <div>

              Created:

              <strong>

                {" "}

                {caseData.created_at
                  ? new Date(
                      caseData.created_at
                    ).toLocaleString()
                  : "N/A"}

              </strong>

            </div>

          </div>

        </div>


        <div className="case-status">

          <span className="severity">
            {riskLevel}
          </span>


          <span className="status">

            {String(
              caseData.status ||
              "unknown"
            ).toUpperCase()}

          </span>

        </div>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">


        <StatCard
          label="Emails"
          value={
            counts.emails ??
            emails.length
          }
          icon="✉"
          onClick={() =>
            navigate("/emails")
          }
        />


        <StatCard
          label="Indicators"
          value={
            counts.indicators ??
            indicators.length
          }
          icon="⌁"
          onClick={() =>
            navigate(
              "/threat-intelligence"
            )
          }
        />


        <StatCard
          label="Threat Intel"
          value={
            counts.threat_intelligence ??
            threatIntel.length
          }
          icon="◉"
          onClick={() =>
            navigate(
              "/threat-intelligence"
            )
          }
        />


        <StatCard
          label="Findings"
          value={
            counts.findings ??
            findings.length
          }
          icon="⚠"
          onClick={() =>
            navigate("/findings")
          }
        />


        <StatCard
          label="Affected Users"
          value={
            counts.affected_users ??
            affectedUsers.length
          }
          icon="♟"
          onClick={() =>
            navigate(
              "/affected-users"
            )
          }
        />


        <StatCard
          label="MITRE Mappings"
          value={
            counts.mitre_mappings ??
            mitreMappings.length
          }
          icon="⚔"
          onClick={() =>
            navigate("/mitre")
          }
        />

      </div>


      {/* =================================================
          MAIN DASHBOARD GRID
      ================================================= */}

      <div className="dashboard-grid">


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div>


          {/* =================================================
              FINDINGS
          ================================================= */}

          <div
            className="card-dark clickable-section"
            onClick={() =>
              navigate("/findings")
            }
          >

            <div className="section-header">

              <div>

                <h3>
                  Investigation Findings
                </h3>


                <small>
                  Security findings identified
                  during analysis
                </small>

              </div>


              <span>

                {findings.length} finding
                {findings.length !== 1
                  ? "s"
                  : ""}

              </span>

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


            {findings.length === 0 ? (

              <p className="page-description">
                No findings recorded.
              </p>

            ) : (

              <div className="findings-list">

                {findings.map(
                  (finding) => (

                    <div
                      className="finding dashboard-item-clickable"
                      key={finding.id}

                      onClick={(event) => {

                        event.stopPropagation();

                        navigate(
                          `/findings/${finding.id}`
                        );

                      }}

                      role="button"

                      tabIndex={0}

                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {

                          event.preventDefault();

                          event.stopPropagation();

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
                            "Finding"}
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

                              Confidence:{" "}

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


          {/* =================================================
              THREAT INTELLIGENCE
          ================================================= */}

          <div
            className="card-dark clickable-section"
            onClick={() =>
              navigate(
                "/threat-intelligence"
              )
            }
          >

            <div className="section-header">

              <div>

                <h3>
                  Threat Intelligence
                </h3>


                <small>
                  Indicator reputation and
                  enrichment results
                </small>

              </div>


              <span>

                {threatIntel.length} result
                {threatIntel.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>


            <div className="case-detail-grid">

              <div>

                <span>
                  Malicious
                </span>

                <strong>
                  {maliciousThreatIntel.length}
                </strong>

              </div>


              <div>

                <span>
                  Total Results
                </span>

                <strong>
                  {threatIntel.length}
                </strong>

              </div>


              <div>

                <span>
                  Indicators
                </span>

                <strong>
                  {indicators.length}
                </strong>

              </div>

            </div>


            {threatIntel.length === 0 ? (

              <p className="page-description">
                No threat intelligence results
                recorded.
              </p>

            ) : (

              <div className="findings-list">

                {threatIntel.map(
                  (result) => (

                    <div
                      className="finding dashboard-item-clickable"
                      key={result.id}

                      onClick={(event) => {

                        event.stopPropagation();

                        navigate(
                          `/threat-intelligence/${result.id}`
                        );

                      }}

                      role="button"

                      tabIndex={0}

                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {

                          event.preventDefault();

                          event.stopPropagation();

                          navigate(
                            `/threat-intelligence/${result.id}`
                          );

                        }

                      }}

                      title="Open threat intelligence details"
                    >

                      <div className="finding-indicator">
                        !
                      </div>


                      <div>

                        <h5>
                          {getThreatIndicator(
                            result
                          )}
                        </h5>


                        <p>

                          Type:{" "}

                          {getThreatIndicatorType(
                            result
                          )}

                        </p>


                        {result.notes && (

                          <p>
                            {result.notes}
                          </p>

                        )}


                        <div className="finding-tags">

                          <span className="tag">

                            {String(
                              result.verdict ||
                              "unknown"
                            ).toUpperCase()}

                          </span>


                          <span className="tag">

                            Score:{" "}
                            {result.score ??
                              "N/A"}

                          </span>


                          <span className="tag">

                            {String(
                              result.confidence ||
                              "unknown"
                            ).toUpperCase()}

                          </span>

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


          {/* =================================================
              CONTAINMENT
          ================================================= */}

          <div
            className="card-dark clickable-section"
            onClick={() =>
              navigate(
                "/containment-actions"
              )
            }
          >

            <div className="section-header">

              <div>

                <h3>
                  Containment Actions
                </h3>


                <small>
                  Security response actions
                </small>

              </div>


              <span>

                {completedActions.length}
                {" "}completed

              </span>

            </div>


            {containmentActions.length === 0 ? (

              <p className="page-description">
                No containment actions recorded.
              </p>

            ) : (

              containmentActions.map(
                (action) => (

                  <div
                    className="containment dashboard-item-clickable"
                    key={action.id}

                    onClick={(event) => {

                      event.stopPropagation();

                      navigate(
                        "/containment-actions"
                      );

                    }}

                    role="button"

                    tabIndex={0}

                    onKeyDown={(event) => {

                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {

                        event.preventDefault();

                        event.stopPropagation();

                        navigate(
                          "/containment-actions"
                        );

                      }

                    }}

                    title="Open containment actions"
                  >

                    <div className="containment-icon">
                      ✓
                    </div>


                    <div>

                      <h5>
                        {action.action_type ||
                          "Containment Action"}
                      </h5>


                      <p>
                        {action.notes ||
                          "No additional notes."}
                      </p>


                      {action.target && (

                        <code>
                          {action.target}
                        </code>

                      )}


                      {action.performed_by && (

                        <>

                          <br />

                          <small>

                            Performed by{" "}

                            {action.performed_by}

                          </small>

                        </>

                      )}

                    </div>


                    <div className="completed">

                      {String(
                        action.status ||
                        "pending"
                      ).toUpperCase()}

                    </div>


                    <div className="dashboard-item-arrow">
                      →
                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div>


          {/* =================================================
              RISK ASSESSMENT
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Risk Assessment
                </h3>


                <small>
                  Current investigation risk
                </small>

              </div>

            </div>


            <div className="risk-score">

              <div className="score">

                {riskLevel === "CRITICAL"
                  ? "90"
                  : riskLevel === "HIGH"
                  ? "75"
                  : riskLevel === "MEDIUM"
                  ? "50"
                  : "25"}

              </div>


              <div className="score-label">
                RISK SCORE
              </div>

            </div>


            <div className="risk-breakdown">

              <div>

                <span>
                  Severity
                </span>

                <strong>
                  {riskLevel}
                </strong>

              </div>


              <div>

                <span>
                  Findings
                </span>

                <strong>
                  {findings.length}
                </strong>

              </div>


              <div>

                <span>
                  Malicious Intel
                </span>

                <strong>
                  {maliciousThreatIntel.length}
                </strong>

              </div>


              <div>

                <span>
                  Completed Actions
                </span>

                <strong>
                  {completedActions.length}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              AFFECTED USERS
          ================================================= */}

          <div className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Affected Users
                </h3>


                <small>
                  Users associated with
                  this investigation
                </small>

              </div>


              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >

                <span>
                  {affectedUsers.length}
                </span>


                <button
                  type="button"
                  className="dashboard-action-button"
                  onClick={() =>
                    navigate(
                      "/affected-users"
                    )
                  }
                >
                  Manage
                </button>

              </div>

            </div>


            {affectedUsers.length === 0 ? (

              <p className="page-description">

                No affected users recorded.

              </p>

            ) : (

              <div className="findings-list">

                {affectedUsers.map(
                  (user) => (

                    <div
                      className="finding dashboard-item-clickable"
                      key={user.id}

                      onClick={() =>
                        navigate(
                          "/affected-users"
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
                            "/affected-users"
                          );

                        }

                      }}

                      title="Manage affected users"
                    >

                      <div className="finding-indicator">
                        !
                      </div>


                      <div>

                        <h5>

                          {user.display_name ||
                            user.user_email ||
                            "Affected User"}

                        </h5>


                        <p>

                          {user.user_email ||
                            "No email available."}

                        </p>


                        {user.department && (

                          <p>
                            {user.department}
                          </p>

                        )}


                        <div className="finding-tags">

                          <span className="tag">

                            {String(
                              user.impact_status ||
                              "targeted"
                            ).toUpperCase()}

                          </span>

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


          {/* =================================================
              MITRE ATT&CK
          ================================================= */}

          <div
            className="card-dark clickable-section"
            onClick={() =>
              navigate("/mitre")
            }
          >

            <div className="section-header">

              <div>

                <h3>
                  MITRE ATT&CK
                </h3>


                <small>
                  Attack technique mappings
                </small>

              </div>


              <span>

                {mitreMappings.length} mapping

                {mitreMappings.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>


            {mitreMappings.length === 0 ? (

              <p className="page-description">

                No MITRE ATT&CK mappings
                recorded.

              </p>

            ) : (

              <div className="mitre-grid">

                {mitreMappings.map(
                  (mapping) => (

                    <div
                      className="mitre-card dashboard-item-clickable"
                      key={mapping.id}

                      onClick={(event) => {

                        event.stopPropagation();

                        navigate(
                          `/mitre/${mapping.id}`
                        );

                      }}

                      role="button"

                      tabIndex={0}

                      onKeyDown={(event) => {

                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {

                          event.preventDefault();

                          event.stopPropagation();

                          navigate(
                            `/mitre/${mapping.id}`
                          );

                        }

                      }}

                      title="Open MITRE mapping details"
                    >

                      <div className="technique-id">

                        {mapping.technique_id ||
                          "Unknown"}

                      </div>


                      <h4>

                        {mapping.technique_name ||
                          "Unknown Technique"}

                      </h4>


                      <div className="tactic">

                        {mapping.tactic ||
                          "Tactic not specified"}

                      </div>


                      <p>

                        {mapping.description ||
                          "No description available."}

                      </p>


                      <div className="finding-tags">

                        <span className="tag">

                          {mapping.technique_id}

                        </span>


                        {mapping.tactic && (

                          <span className="tag">

                            {mapping.tactic}

                          </span>

                        )}

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

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>


        <span>
          Case {caseData.case_number}
        </span>

      </footer>

    </div>

  );

}


export default Dashboard;