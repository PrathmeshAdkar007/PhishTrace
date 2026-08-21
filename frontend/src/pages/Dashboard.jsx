import { useEffect, useState } from "react";

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
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

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const CASE_ID = 1;

  /* =========================
     LOAD CASE SUMMARY
  ========================= */

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

        const result = await response.json();

        setData(result);
      } catch (err) {
        console.error("Dashboard API error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <h2>Loading PhishTrace...</h2>

          <p>
            Fetching investigation data from the backend.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="error-screen">
        <div className="card-dark">

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            The PhishTrace frontend could not connect
            to the Flask backend.
          </p>

          <p className="danger-text">
            {error}
          </p>

          <p>
            Make sure your Flask backend is running on:
          </p>

          <code>
            http://127.0.0.1:5000
          </code>

        </div>
      </div>
    );
  }

  /* =========================
     SAFETY CHECK
  ========================= */

  if (!data || !data.case) {
    return (
      <div className="error-screen">
        <div className="card-dark">

          <h2>
            No investigation data
          </h2>

          <p>
            The backend returned an empty case summary.
          </p>

        </div>
      </div>
    );
  }

  /* =========================
     DATA
  ========================= */

  const caseData = data.case;

  const counts = data.counts || {};

  const emails = data.emails || [];

  const indicators = data.indicators || [];

  const findings = data.findings || [];

  const threatIntel =
    data.threat_intelligence || [];

  const affectedUsers =
    data.affected_users || [];

  const containmentActions =
    data.containment_actions || [];

  const mitreMappings =
    data.mitre_mappings || [];


  /* =========================
     THREAT INTELLIGENCE
     BACKEND DATA IS NESTED
     INSIDE raw_response
  ========================= */

  const getThreatIndicator = (result) => {
    return (
      result.raw_response?.indicator ||
      result.indicator ||
      result.value ||
      "Unknown"
    );
  };

  const getThreatIndicatorType = (result) => {
    return (
      result.raw_response?.indicator_type ||
      result.indicator_type ||
      "Unknown"
    );
  };


  /* =========================
     CALCULATIONS
  ========================= */

  const maliciousThreatIntel =
    threatIntel.filter(
      (result) =>
        String(result.verdict || "").toLowerCase() ===
        "malicious"
    );

  const criticalFindings =
    findings.filter(
      (finding) =>
        String(finding.severity || "").toLowerCase() ===
        "critical"
    );

  const highFindings =
    findings.filter(
      (finding) =>
        String(finding.severity || "").toLowerCase() ===
        "high"
    );

  const mediumFindings =
    findings.filter(
      (finding) =>
        String(finding.severity || "").toLowerCase() ===
        "medium"
    );

  const lowFindings =
    findings.filter(
      (finding) =>
        String(finding.severity || "").toLowerCase() ===
        "low"
    );

  const completedActions =
    containmentActions.filter(
      (action) =>
        String(action.status || "").toLowerCase() ===
        "completed"
    );


  /* =========================
     RISK LEVEL
  ========================= */

  const riskLevel =
    String(caseData.severity || "unknown").toUpperCase();


  /* =========================
     PAGE
  ========================= */

  return (
    <div className="page">

      {/* =========================
          TOP BAR
      ========================= */}

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


      {/* =========================
          CASE HEADER
      ========================= */}

      <div className="card-dark case-header">

        <div>

          <div className="small-label">

            {String(caseData.status).toLowerCase() ===
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
                  : "Unknown"}
              </strong>
            </div>

          </div>

        </div>


        <div className="case-status">

          <span
            className={`severity ${
              String(caseData.severity).toLowerCase() ===
              "critical"
                ? "critical"
                : ""
            }`}
          >
            {riskLevel}
          </span>

          <span className="status">
            {String(
              caseData.status || "unknown"
            ).toUpperCase()}
          </span>

        </div>

      </div>


      {/* =========================
          STATISTICS
      ========================= */}

      <div className="stats-grid">

        <StatCard
          icon="✉"
          value={
            counts.emails ??
            emails.length
          }
          label="Emails"
        />

        <StatCard
          icon="⌁"
          value={
            counts.indicators ??
            indicators.length
          }
          label="Indicators"
        />

        <StatCard
          icon="◉"
          value={
            counts.threat_intelligence ??
            threatIntel.length
          }
          label="Threat Intel"
        />

        <StatCard
          icon="⚠"
          value={
            counts.findings ??
            findings.length
          }
          label="Findings"
        />

        <StatCard
          icon="♟"
          value={
            counts.affected_users ??
            affectedUsers.length
          }
          label="Affected Users"
        />

        <StatCard
          icon="⚔"
          value={
            counts.mitre_mappings ??
            mitreMappings.length
          }
          label="MITRE Mappings"
        />

      </div>


      {/* =========================
          FINDINGS + RISK
      ========================= */}

      <div className="dashboard-grid">

        {/* FINDINGS */}

        <div className="card-dark">

          <div className="section-header">

            <div>

              <h3>
                Investigation Findings
              </h3>

              <small>
                {findings.length} findings identified
              </small>

            </div>

          </div>


          <div className="findings-list">

            {findings.length === 0 ? (

              <p className="page-description">
                No findings have been recorded for
                this case.
              </p>

            ) : (

              findings.map((finding) => (

                <div
                  className="finding"
                  key={finding.id}
                >

                  <div className="finding-indicator">
                    !
                  </div>

                  <div className="finding-content">

                    <h5>
                      {finding.title}
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

                      <span className="tag">
                        {finding.finding_type ||
                          "Finding"}
                      </span>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>


        {/* RISK */}

        <div className="card-dark risk-card">

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
              {riskLevel}
            </div>

          </div>


          <div className="risk-breakdown">

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

        </div>

      </div>


      {/* =========================
          THREAT INTELLIGENCE
      ========================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Threat Intelligence
            </h3>

            <small>
              Indicator analysis results
            </small>

          </div>

          <span className="tag severity-tag">
            {maliciousThreatIntel.length} MALICIOUS
          </span>

        </div>


        <div className="threat-table-wrapper">

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

              {threatIntel.length === 0 ? (

                <tr>

                  <td colSpan="5">
                    No threat intelligence results.
                  </td>

                </tr>

              ) : (

                threatIntel.map((result) => (

                  <tr key={result.id}>

                    <td>

                      <code>
                        {getThreatIndicator(result)}
                      </code>

                    </td>

                    <td>
                      {getThreatIndicatorType(result)}
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
                        {String(
                          result.verdict ||
                          "unknown"
                        ).toUpperCase()}
                      </span>

                    </td>

                    <td>
                      {result.score ?? "—"}
                    </td>

                    <td>
                      {result.confidence || "—"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================
          AFFECTED USERS
      ========================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Affected Users
            </h3>

            <small>
              Users associated with this investigation
            </small>

          </div>

          <span>
            {affectedUsers.length} affected user
            {affectedUsers.length !== 1 ? "s" : ""}
          </span>

        </div>


        {affectedUsers.length === 0 ? (

          <p className="page-description">
            No affected users have been recorded.
          </p>

        ) : (

          affectedUsers.map((user) => (

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
                      {user.impact_status}
                    </span>
                  )}

                </div>

              </div>


              <div className="user-status">
                {String(
                  user.impact_status ||
                  "UNKNOWN"
                ).toUpperCase()}
              </div>

            </div>

          ))

        )}

      </div>


      {/* =========================
          CONTAINMENT ACTIONS
      ========================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Containment Actions
            </h3>

            <small>
              Response actions performed during investigation
            </small>

          </div>

          <span className="success-text">
            {completedActions.length} COMPLETED
          </span>

        </div>


        {containmentActions.length === 0 ? (

          <p className="page-description">
            No containment actions recorded.
          </p>

        ) : (

          containmentActions.map((action) => (

            <div
              className="containment"
              key={action.id}
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

            </div>

          ))

        )}

      </div>


      {/* =========================
          MITRE ATT&CK
      ========================= */}

      <div className="card-dark">

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
            {mitreMappings.length !== 1 ? "s" : ""}
          </span>

        </div>


        {mitreMappings.length === 0 ? (

          <p className="page-description">
            No MITRE ATT&CK mappings recorded.
          </p>

        ) : (

          <div className="mitre-grid">

            {mitreMappings.map((mapping) => (

              <div
                className="mitre-card"
                key={mapping.id}
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

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =========================
          FOOTER
      ========================= */}

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