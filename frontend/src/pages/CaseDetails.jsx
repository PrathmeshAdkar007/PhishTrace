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
      console.error("Case summary error:", err);

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
          <h2>Loading Investigation...</h2>

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
          <h2>Unable to Load Case</h2>

          <p>{error}</p>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/cases")}
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
          <h2>Case Not Found</h2>

          <p>
            The requested investigation could not
            be found.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/cases")}
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

  const mitreCount =
    summary.counts?.mitre_mappings || 0;

  /* =================================================
     PAGE
  ================================================= */

  return (
    <div className="page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">
        <div>
          <h2>Case Investigation</h2>

          <p>
            Complete phishing investigation details
          </p>
        </div>

        <div className="case-badge">
          {caseData.case_number}
        </div>
      </div>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        className="secondary-button back-button"
        onClick={() => navigate("/cases")}
      >
        ← Back to Cases
      </button>

      {/* =================================================
          CASE HEADER
      ================================================= */}

      <div className="card-dark case-header">
        <div>
          <div className="small-label">
            {upper(caseData.status)} INVESTIGATION
          </div>

          <h1>
            {caseData.title}
          </h1>

          <p>
            {caseData.description ||
              "No description available."}
          </p>

          <div className="case-meta">
            <span>
              Case ID:{" "}
              <strong>
                {caseData.case_number}
              </strong>
            </span>

            <span>
              Created:{" "}
              <strong>
                {formatDate(
                  caseData.created_at
                )}
              </strong>
            </span>
          </div>
        </div>

        <div className="case-status">
          <span
            className={`severity ${
              caseData.severity === "critical"
                ? "critical"
                : ""
            }`}
          >
            {upper(caseData.severity)}
          </span>

          <span className="status">
            {upper(caseData.status)}
          </span>
        </div>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">

        <StatCard
          label="Emails"
          value={emailCount}
          icon="✉"
          onClick={() => navigate("/emails")}
        />

        <StatCard
          label="Indicators"
          value={indicatorCount}
          icon="⌁"
          onClick={() =>
            navigate("/threat-intelligence")
          }
        />

        <StatCard
          label="Threat Intel"
          value={threatIntelCount}
          icon="◉"
          onClick={() =>
            navigate("/threat-intelligence")
          }
        />

        <StatCard
          label="Findings"
          value={findingCount}
          icon="⚠"
          onClick={() => navigate("/findings")}
        />

        <StatCard
          label="Affected Users"
          value={affectedUserCount}
          icon="♟"
          onClick={() =>
            navigate("/affected-users")
          }
        />

        <StatCard
          label="MITRE Mappings"
          value={mitreCount}
          icon="⚔"
          onClick={() => navigate("/mitre")}
        />

      </div>

      {/* =================================================
          MAIN INVESTIGATION GRID
      ================================================= */}

      <div className="dashboard-grid">

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div>

          {/* =================================================
              EMAILS
          ================================================= */}

          <section
            className="card-dark clickable-section"
            onClick={() => navigate("/emails")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                navigate("/emails");
              }
            }}
          >
            <div className="section-header">
              <div>
                <h3>Emails</h3>

                <small>
                  Phishing emails associated with
                  this case
                </small>
              </div>

              <small>
                {summary.emails?.length || 0}
              </small>
            </div>

            {summary.emails?.length ? (
              <div className="findings-list">

                {summary.emails.map((email) => (
                  <div
                    className="finding"
                    key={email.id}
                  >
                    <div className="finding-indicator">
                      ✉
                    </div>

                    <div>
                      <h5>
                        {email.subject ||
                          "Phishing Email"}
                      </h5>

                      <p>
                        From:{" "}
                        {email.sender_email ||
                          email.from_address ||
                          email.sender ||
                          "Unknown sender"}
                      </p>

                      <p>
                        To:{" "}
                        {email.recipient_email ||
                          email.to_address ||
                          email.recipient ||
                          "Unknown recipient"}
                      </p>

                      <div className="finding-tags">
                        <span className="tag">
                          {formatDate(
                            email.created_at ||
                            email.received_at
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="empty-state">
                No emails found.
              </div>
            )}
          </section>

          {/* =================================================
              THREAT INTELLIGENCE
          ================================================= */}

          <section
            className="card-dark clickable-section"
            onClick={() =>
              navigate("/threat-intelligence")
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
                  Intelligence results for
                  investigation indicators
                </small>
              </div>

              <small>
                {summary.threat_intelligence?.length ||
                  0}
              </small>
            </div>

            {summary.threat_intelligence?.length ? (
              <div className="findings-list">

                {summary.threat_intelligence.map(
                  (intel) => (
                    <div
                      className="finding"
                      key={intel.id}
                    >
                      <div className="finding-indicator">
                        !
                      </div>

                      <div>
                        <h5>
                          {intel.indicator ||
                            intel.indicator_value ||
                            "Unknown Indicator"}
                        </h5>

                        <p>
                          Provider:{" "}
                          {intel.provider ||
                            "Unknown"}
                        </p>

                        {intel.notes && (
                          <p>
                            {intel.notes}
                          </p>
                        )}

                        <div className="finding-tags">

                          <span className="tag">
                            Verdict:{" "}
                            {upper(
                              intel.verdict
                            )}
                          </span>

                          <span className="tag">
                            Confidence:{" "}
                            {upper(
                              intel.confidence
                            )}
                          </span>

                          <span className="tag">
                            Score:{" "}
                            {intel.score ?? "N/A"}
                          </span>

                        </div>
                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="empty-state">
                No threat intelligence found.
              </div>
            )}
          </section>

          {/* =================================================
              FINDINGS
          ================================================= */}

          <section
            className="card-dark clickable-section"
            onClick={() => navigate("/findings")}
            role="button"
            tabIndex={0}
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
                {summary.findings?.length || 0}
              </small>
            </div>

            {summary.findings?.length ? (
              <div className="findings-list">

                {summary.findings.map(
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
                            finding.name ||
                            `Finding #${finding.id}`}
                        </h5>

                        <p>
                          {finding.description ||
                            finding.evidence ||
                            "No description available."}
                        </p>

                        <div className="finding-tags">

                          {finding.severity && (
                            <span className="tag severity-tag">
                              {upper(
                                finding.severity
                              )}
                            </span>
                          )}

                          {finding.category && (
                            <span className="tag">
                              {upper(
                                finding.category
                              )}
                            </span>
                          )}

                          {finding.created_at && (
                            <span className="tag">
                              {formatDate(
                                finding.created_at
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
                No findings found.
              </div>
            )}
          </section>

          {/* =================================================
              MITRE ATT&CK
          ================================================= */}

          <section
            className="card-dark clickable-section"
            onClick={() => navigate("/mitre")}
            role="button"
            tabIndex={0}
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
                <h3>MITRE ATT&CK</h3>

                <small>
                  Techniques mapped to this
                  investigation
                </small>
              </div>

              <small>
                {summary.mitre_mappings?.length ||
                  0}
              </small>
            </div>

            {summary.mitre_mappings?.length ? (
              <div className="mitre-grid">

                {summary.mitre_mappings.map(
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
              RISK
          ================================================= */}

          <section className="card-dark risk-card">

            <div className="section-header">
              <div>
                <h3>
                  Risk Assessment
                </h3>

                <small>
                  Current case risk
                </small>
              </div>
            </div>

            <div className="risk-score">

              <div className="score">
                {caseData.severity === "critical"
                  ? "90"
                  : caseData.severity === "high"
                  ? "75"
                  : caseData.severity === "medium"
                  ? "50"
                  : "25"}
              </div>

              <div className="score-label">
                RISK SCORE
              </div>

            </div>

            <div className="risk-breakdown">

              <div>
                <span>Severity</span>

                <strong>
                  {upper(
                    caseData.severity
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {upper(
                    caseData.status
                  )}
                </strong>
              </div>

              <div>
                <span>Findings</span>

                <strong>
                  {findingCount}
                </strong>
              </div>

              <div>
                <span>Threat Intel</span>

                <strong>
                  {threatIntelCount}
                </strong>
              </div>

            </div>
          </section>

          {/* =================================================
              AFFECTED USERS
          ================================================= */}

          <section
            className="card-dark clickable-section"
            onClick={() =>
              navigate("/affected-users")
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
          >
            <div className="section-header">
              <div>
                <h3>
                  Affected Users
                </h3>

                <small>
                  Users associated with this case
                </small>
              </div>

              <small>
                {summary.affected_users?.length ||
                  0}
              </small>
            </div>

            {summary.affected_users?.length ? (
              <div className="findings-list">

                {summary.affected_users.map(
                  (user) => (
                    <div
                      className="user-card"
                      key={user.id}
                    >
                      <div className="user-avatar">
                        {(
                          user.display_name ||
                          user.user_email ||
                          "U"
                        )
                          .charAt(0)
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

                        {user.department && (
                          <p>
                            {user.department}
                          </p>
                        )}
                      </div>

                      <div className="user-status">
                        {upper(
                          user.impact_status ||
                          "targeted"
                        )}
                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="empty-state">
                No affected users found.
              </div>
            )}
          </section>

          {/* =================================================
              CONTAINMENT
          ================================================= */}

          <section
            className="card-dark clickable-section"
            onClick={() =>
              navigate("/containment-actions")
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
                  "/containment-actions"
                );
              }
            }}
          >
            <div className="section-header">
              <div>
                <h3>
                  Containment Actions
                </h3>

                <small>
                  Actions taken against the threat
                </small>
              </div>

              <small>
                {summary.containment_actions?.length ||
                  0}
              </small>
            </div>

            {summary.containment_actions?.length ? (
              <div className="findings-list">

                {summary.containment_actions.map(
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
  onClick
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