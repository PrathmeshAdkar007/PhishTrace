import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://localhost:5000";


function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}


function upper(value) {
  if (!value) {
    return "N/A";
  }

  return String(value)
    .replaceAll("_", " ")
    .toUpperCase();
}


function CaseDetails() {
  const { caseId } = useParams();

  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =================================================
     LOAD CASE SUMMARY
  ================================================= */

  const loadSummary = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_BASE}/api/cases/${caseId}/summary`,
        {
          method: "GET",

          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to load case summary (${response.status})`
        );
      }

      setSummary(data);

    } catch (err) {
      console.error(
        "Case summary error:",
        err
      );

      setError(
        err.message ||
          "Failed to load case investigation."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSummary();
  }, [caseId]);


  /* =================================================
     LOADING
  ================================================= */

  if (loading) {
    return (
      <div className="loading-screen">

        <div>

          <h2>
            Loading Investigation...
          </h2>

          <p>
            Fetching complete case information
            from the PhishTrace backend.
          </p>

        </div>

      </div>
    );
  }


  /* =================================================
     ERROR
  ================================================= */

  if (error) {
    return (
      <div className="error-screen">

        <div className="card-dark">

          <h2>
            Unable to Load Case
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/cases")
            }
          >
            Back to Cases
          </button>

        </div>

      </div>
    );
  }


  /* =================================================
     CASE NOT FOUND
  ================================================= */

  if (!summary || !summary.case) {
    return (
      <div className="error-screen">

        <div className="card-dark">

          <h2>
            Case Not Found
          </h2>

          <p>
            The requested investigation could not
            be found.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/cases")
            }
          >
            Back to Cases
          </button>

        </div>

      </div>
    );
  }


  const caseData = summary.case;


  /* =================================================
     COUNTS
  ================================================= */

  const emailCount =
    summary.counts?.emails || 0;

  const indicatorCount =
    summary.counts?.indicators || 0;

  const threatIntelCount =
    summary.counts?.threat_intelligence || 0;

  const findingCount =
    summary.counts?.findings || 0;

  const affectedUserCount =
    summary.counts?.affected_users || 0;

  const containmentCount =
    summary.counts?.containment_actions || 0;

  const mitreCount =
    summary.counts?.mitre_mappings || 0;


  /* =================================================
     DATA
  ================================================= */

  const findings =
    summary.findings || [];

  const affectedUsers =
    summary.affected_users || [];

  const containmentActions =
    summary.containment_actions || [];

  const threatIntel =
    summary.threat_intelligence || [];

  const mitreMappings =
    summary.mitre_mappings || [];


  /* =================================================
     CONTAINMENT COUNTS
  ================================================= */

  const completedActions =
    containmentActions.filter(
      (action) =>
        String(
          action.status || ""
        ).toLowerCase() === "completed"
    );


  /* =================================================
     RISK SCORE
  ================================================= */

  const riskScore =
    caseData.risk_score ??
    (
      String(
        caseData.severity || ""
      ).toLowerCase() === "critical"
        ? 90
        : String(
            caseData.severity || ""
          ).toLowerCase() === "high"
        ? 75
        : String(
            caseData.severity || ""
          ).toLowerCase() === "medium"
        ? 50
        : String(
            caseData.severity || ""
          ).toLowerCase() === "low"
        ? 25
        : "N/A"
    );


  /* =================================================
     PAGE
  ================================================= */

  return (
    <div className="page case-details-page">


      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar case-details-topbar">

        <div>

          <div className="page-eyebrow">
            SOC INVESTIGATION WORKSPACE
          </div>

          <h2>
            Case Investigation
          </h2>

          <p>
            Complete phishing investigation details
          </p>

        </div>


        <div className="case-badge">
          {caseData.case_number ||
            `CASE-${caseId}`}
        </div>

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="case-navigation-buttons">

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/cases")
          }
        >
          ← Back to Cases
        </button>


        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate(
              `/cases/${caseId}/timeline`
            )
          }
        >
          View Timeline
        </button>

      </div>


      {/* =================================================
          CASE HEADER
      ================================================= */}

      <section className="card-dark case-header">

        <div className="case-header-main">

          <div className="small-label">

            {String(
              caseData.status || ""
            ).toLowerCase() === "closed"

              ? "CLOSED INVESTIGATION"

              : "ACTIVE INVESTIGATION"}

          </div>


          <h1>
            {caseData.title ||
              "Untitled Investigation"}
          </h1>


          <p>
            {caseData.description ||
              "No case description available."}
          </p>


          <div className="case-meta">

            <div>

              <span>
                Case ID
              </span>

              <strong>
                {caseData.case_number ||
                  `CASE-${caseId}`}
              </strong>

            </div>


            <div>

              <span>
                Created
              </span>

              <strong>
                {formatDate(
                  caseData.created_at
                )}
              </strong>

            </div>

          </div>

        </div>


        <div className="case-status">

          <span
            className={`severity ${String(
              caseData.severity || ""
            ).toLowerCase()}`}
          >
            {upper(
              caseData.severity
            )}
          </span>


          <span
            className={`status ${String(
              caseData.status || ""
            ).toLowerCase()}`}
          >
            {upper(
              caseData.status
            )}
          </span>

        </div>

      </section>


      {/* =================================================
          INVESTIGATION OVERVIEW
      ================================================= */}

      <div className="case-overview-header">

        <div>

          <h3>
            Investigation Overview
          </h3>

          <p>
            Key evidence and investigation
            activity for this case.
          </p>

        </div>


        <div className="overview-status">

          <span className="overview-status-dot">
            ●
          </span>

          {String(
            caseData.status || ""
          ).toLowerCase() === "closed"

            ? "Investigation Closed"

            : "Investigation Active"}

        </div>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid case-stats-grid">

        <StatCard
          label="Emails"
          value={emailCount}
          icon="✉"
          onClick={() =>
            navigate("/emails")
          }
        />


        <StatCard
          label="Indicators"
          value={indicatorCount}
          icon="◎"
          onClick={() =>
            navigate("/threat-intelligence")
          }
        />


        <StatCard
          label="Threat Intel"
          value={threatIntelCount}
          icon="◉"
          onClick={() =>
            navigate(
              "/threat-intelligence"
            )
          }
        />


        <StatCard
          label="Findings"
          value={findingCount}
          icon="⚠"
          onClick={() =>
            navigate("/findings")
          }
        />


        <StatCard
          label="Affected Users"
          value={affectedUserCount}
          icon="♟"
          onClick={() =>
            navigate(
              "/affected-users"
            )
          }
        />


        <StatCard
          label="MITRE Mappings"
          value={mitreCount}
          icon="⚔"
          onClick={() =>
            navigate("/mitre")
          }
        />

      </div>


      {/* =================================================
          MAIN CONTENT GRID
      ================================================= */}

      <div className="dashboard-grid case-details-grid">


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div>


          {/* =================================================
              FINDINGS
          ================================================= */}

          <section
            className="card-dark clickable-section"
            role="button"
            tabIndex={0}
            onClick={() =>
              navigate("/findings")
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();

                navigate("/findings");
              }
            }}
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


              <small>
                {findingCount}
              </small>

            </div>


            {findings.length ? (

              <div className="findings-list">

                {findings.map(
                  (finding) => (

                    <div
                      className="finding"
                      key={finding.id}
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

                          <span className="tag">
                            {upper(
                              finding.severity
                            )}
                          </span>


                          {finding.confidence && (

                            <span className="tag">
                              Confidence:{" "}
                              {upper(
                                finding.confidence
                              )}
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="empty-state">
                No findings recorded for this
                investigation.
              </div>

            )}

          </section>


          {/* =================================================
              MITRE ATT&CK
          ================================================= */}

          <section
            className="card-dark clickable-section"
            role="button"
            tabIndex={0}
            onClick={() =>
              navigate("/mitre")
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();

                navigate("/mitre");
              }
            }}
          >

            <div className="section-header">

              <div>

                <h3>
                  MITRE ATT&CK
                </h3>

                <small>
                  Techniques mapped to this
                  investigation
                </small>

              </div>


              <small>
                {mitreCount}
              </small>

            </div>


            {mitreMappings.length ? (

              <div className="mitre-grid">

                {mitreMappings.map(
                  (mapping) => (

                    <div
                      className="mitre-card"
                      key={mapping.id}
                    >

                      <div className="technique-id">
                        {mapping.technique_id ||
                          "N/A"}
                      </div>


                      <h4>
                        {mapping.technique_name ||
                          "Unknown Technique"}
                      </h4>


                      <div className="tactic">
                        {mapping.tactic ||
                          "Unknown Tactic"}
                      </div>


                      {mapping.description && (

                        <p>
                          {mapping.description}
                        </p>

                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="empty-state">
                No MITRE mappings found.
              </div>

            )}

          </section>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div>


          {/* =================================================
              RISK ASSESSMENT
          ================================================= */}

          <section className="card-dark risk-card investigation-section">

            <div className="section-header">

              <div>

                <h3>
                  Risk Assessment
                </h3>

                <small>
                  Current case risk and
                  investigation status
                </small>

              </div>

            </div>


            <div className="risk-score-overview">


              {/* Risk Score */}

              <div className="risk-score-value">
                {riskScore}
              </div>


              {/* Risk Information */}

              <div className="risk-score-info">

                <div className="risk-label">
                  Risk Score
                </div>


                <div className="risk-severity-text">
                  Current investigation severity
                </div>


                <div
                  className={`risk-severity-badge ${String(
                    caseData.severity || ""
                  ).toLowerCase()}`}
                >
                  {upper(
                    caseData.severity
                  )}
                </div>

              </div>

            </div>


            {/* Investigation Details */}

            <div className="risk-details-grid">


              <div className="risk-detail-item">

                <span className="risk-detail-label">
                  Case Status
                </span>

                <strong
                  className={`risk-detail-value status-${String(
                    caseData.status || ""
                  ).toLowerCase()}`}
                >
                  {upper(
                    caseData.status
                  )}
                </strong>

              </div>


              <div className="risk-detail-item">

                <span className="risk-detail-label">
                  Findings
                </span>

                <strong className="risk-detail-value">
                  {findingCount}
                </strong>

              </div>


              <div className="risk-detail-item">

                <span className="risk-detail-label">
                  Malicious Indicators
                </span>

                <strong className="risk-detail-value">
                  {threatIntelCount}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              THREAT INTELLIGENCE
          ================================================= */}

          <section
            className="card-dark clickable-section"
            role="button"
            tabIndex={0}
            onClick={() =>
              navigate(
                "/threat-intelligence"
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();

                navigate(
                  "/threat-intelligence"
                );
              }
            }}
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


              <small>
                {threatIntelCount}
              </small>

            </div>


            {threatIntel.length ? (

              <div className="table-responsive">

                <table className="threat-table">

                  <thead>

                    <tr>

                      <th>
                        Indicator
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Verdict
                      </th>

                      <th>
                        Score
                      </th>

                      <th>
                        Confidence
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {threatIntel.map(
                      (result) => (

                        <tr key={result.id}>

                          <td>

                            <code>
                              {result.indicator ||
                                result.value ||
                                "Unknown"}
                            </code>

                          </td>


                          <td>
                            {result.indicator_type ||
                              "Unknown"}
                          </td>


                          <td>

                            <span
                              className={`verdict ${
                                String(
                                  result.verdict || ""
                                ).toLowerCase() ===
                                "malicious"

                                  ? "malicious"

                                  : ""
                              }`}
                            >
                              {upper(
                                result.verdict
                              )}
                            </span>

                          </td>


                          <td>
                            {result.score ?? "—"}
                          </td>


                          <td>
                            {result.confidence ||
                              "—"}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="empty-state">
                No threat intelligence results
                found.
              </div>

            )}

          </section>


          {/* =================================================
              AFFECTED USERS
          ================================================= */}

          <section className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Affected Users
                </h3>

                <small>
                  Users associated with this
                  investigation
                </small>

              </div>


              <small>
                {affectedUserCount}
              </small>

            </div>


            {affectedUsers.length ? (

              <div className="findings-list">

                {affectedUsers.map(
                  (user) => (

                    <div
                      className="user-card"
                      key={user.id}
                    >

                      <div className="user-avatar">

                        {String(
                          user.display_name ||
                          user.user_email ||
                          "U"
                        )
                          .split(" ")
                          .map(
                            (name) =>
                              name.charAt(0)
                          )
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}

                      </div>


                      <div>

                        <h5>
                          {user.display_name ||
                            "Unknown User"}
                        </h5>


                        <p>
                          {user.user_email ||
                            "No email available"}
                        </p>


                        <div className="finding-tags">

                          {user.department && (

                            <span className="tag">
                              {user.department}
                            </span>

                          )}


                          {user.impact_status && (

                            <span className="tag">
                              {upper(
                                user.impact_status
                              )}
                            </span>

                          )}

                        </div>

                      </div>


                      <div className="user-status">

                        {upper(
                          user.impact_status ||
                          "unknown"
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="empty-state">
                No affected users have been
                recorded.
              </div>

            )}

          </section>


          {/* =================================================
              CONTAINMENT ACTIONS
          ================================================= */}

          <section className="card-dark">

            <div className="section-header">

              <div>

                <h3>
                  Containment Actions
                </h3>

                <small>
                  Response actions performed
                  during the investigation
                </small>

              </div>


              <small className="success-text">
                {completedActions.length} COMPLETED
              </small>

            </div>


            {containmentActions.length ? (

              <div className="findings-list">

                {containmentActions.map(
                  (action) => (

                    <div
                      className="containment"
                      key={action.id}
                    >

                      <div className="containment-icon">
                        ✓
                      </div>


                      <div>

                        <h5>
                          {upper(
                            action.action_type ||
                            "Containment Action"
                          )}
                        </h5>


                        {action.notes && (

                          <p>
                            {action.notes}
                          </p>

                        )}


                        {action.target && (

                          <p>

                            Target:{" "}

                            <code>
                              {action.target}
                            </code>

                          </p>

                        )}


                        {action.created_at && (

                          <small>
                            {formatDate(
                              action.created_at
                            )}
                          </small>

                        )}

                      </div>


                      <div className="completed">

                        {upper(
                          action.status ||
                          "completed"
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="empty-state">
                No containment actions found.
              </div>

            )}

          </section>


          {/* Small summary */}

          <div className="case-details-summary">

            <span>
              {containmentCount} response actions
            </span>

            <span>
              {completedActions.length} completed
            </span>

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
          Case Investigation
        </span>

      </footer>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon,
  onClick,
}) {
  return (
    <div
      className={`stat-card ${
        onClick
          ? "clickable-stat"
          : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
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


export default CaseDetails;