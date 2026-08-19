import { useEffect, useState } from "react";

const API_URL =
  "http://127.0.0.1:5000/api/cases/1/summary";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        return response.json();
      })
      .then((result) => {
        console.log("PhishTrace summary:", result);
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* LOADING */
  if (loading) {
    return (
      <div className="loading-screen">
        <div
          className="spinner-border text-info"
          role="status"
        />

        <h4 className="mt-3">
          Loading PhishTrace...
        </h4>
      </div>
    );
  }

  /* ERROR */
  if (error) {
    return (
      <div className="error-screen">
        <div className="alert alert-danger">

          <h4>
            Unable to load PhishTrace
          </h4>

          <p>{error}</p>

          <hr />

          <p className="mb-0">
            Make sure the Flask backend is running on:
          </p>

          <code>
            http://127.0.0.1:5000
          </code>

        </div>
      </div>
    );
  }

  /* SAFETY CHECK */
  if (!data || !data.case) {
    return (
      <div className="error-screen">
        <div className="alert alert-warning">
          Backend returned unexpected data.
        </div>
      </div>
    );
  }

  const caseData = data.case;

  const counts = data.counts || {
    emails: data.emails?.length || 0,
    indicators: data.indicators?.length || 0,
    threat_intelligence:
      data.threat_intelligence?.length || 0,
    findings: data.findings?.length || 0,
    affected_users:
      data.affected_users?.length || 0,
    mitre_mappings:
      data.mitre_mappings?.length || 0,
  };

  const findings = data.findings || [];
  const threatIntel =
    data.threat_intelligence || [];
  const affectedUsers =
    data.affected_users || [];
  const containmentActions =
    data.containment_actions || [];
  const mitreMappings =
    data.mitre_mappings || [];

  return (
    <>

      {/* HEADER */}
      <header className="topbar">

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

      </header>


      {/* CASE HEADER */}
      <section className="case-header card-dark">

        <div>

          <div className="small-label">
            ACTIVE INVESTIGATION
          </div>

          <h1>
            {caseData.title}
          </h1>

          <p>
            {caseData.description}
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
                {new Date(
                  caseData.created_at
                ).toLocaleString()}
              </strong>
            </span>

          </div>

        </div>


        <div className="case-status">

          <span className="severity critical">
            {String(
              caseData.severity || "unknown"
            ).toUpperCase()}
          </span>

          <span className="status">
            {String(
              caseData.status || "unknown"
            ).toUpperCase()}
          </span>

        </div>

      </section>


      {/* STATISTICS */}
      <section className="stats-grid">

        <StatCard
          label="Emails"
          value={counts.emails}
          icon="✉"
        />

        <StatCard
          label="Indicators"
          value={counts.indicators}
          icon="⌁"
        />

        <StatCard
          label="Threat Intel"
          value={counts.threat_intelligence}
          icon="◉"
        />

        <StatCard
          label="Findings"
          value={counts.findings}
          icon="⚠"
        />

        <StatCard
          label="Affected Users"
          value={counts.affected_users}
          icon="♟"
        />

        <StatCard
          label="MITRE Mappings"
          value={counts.mitre_mappings}
          icon="⚔"
        />

      </section>


      {/* FINDINGS + RISK */}
      <section className="dashboard-grid">

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
              <p className="empty-state">
                No findings available.
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
                      {finding.description}
                    </p>

                    <div className="finding-tags">

                      <span className="tag">
                        {finding.finding_type}
                      </span>

                      <span className="tag severity-tag">
                        {finding.severity}
                      </span>

                      <span className="tag">
                        {finding.confidence}
                        {" "}confidence
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
              100
            </div>

            <div className="score-label">
              CRITICAL RISK
            </div>

          </div>


          <div className="risk-breakdown">

            <div>
              <span>Critical</span>
              <strong>1</strong>
            </div>

            <div>
              <span>High</span>
              <strong>3</strong>
            </div>

            <div>
              <span>Medium</span>
              <strong>0</strong>
            </div>

            <div>
              <span>Low</span>
              <strong>0</strong>
            </div>

          </div>

        </div>

      </section>


      {/* THREAT INTELLIGENCE */}
      <section className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Threat Intelligence
            </h3>

            <small>
              Indicators analysed by PhishTrace
            </small>
          </div>

        </div>


        <div className="table-responsive">

          <table className="table threat-table">

            <thead>

              <tr>
                <th>Indicator</th>
                <th>Type</th>
                <th>Provider</th>
                <th>Verdict</th>
                <th>Score</th>
                <th>Confidence</th>
              </tr>

            </thead>


            <tbody>

              {threatIntel.length === 0 ? (

                <tr>
                  <td colSpan="6">
                    No threat intelligence available.
                  </td>
                </tr>

              ) : (

                threatIntel.map((result) => (

                  <tr key={result.id}>

                    <td>
                      <code>
                        {result.indicator}
                      </code>
                    </td>

                    <td>
                      {result.indicator_type}
                    </td>

                    <td>
                      {result.provider}
                    </td>

                    <td>

                      <span className="verdict malicious">
                        {result.verdict}
                      </span>

                    </td>

                    <td>
                      <strong>
                        {result.score}
                      </strong>
                    </td>

                    <td>
                      {result.confidence}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* USERS + CONTAINMENT */}
      <section className="dashboard-grid">


        {/* AFFECTED USERS */}
        <div className="card-dark">

          <div className="section-header">

            <div>
              <h3>
                Affected Users
              </h3>

              <small>
                Users targeted by the campaign
              </small>
            </div>

          </div>


          {affectedUsers.length === 0 ? (

            <p className="empty-state">
              No affected users recorded.
            </p>

          ) : (

            affectedUsers.map((user) => (

              <div
                className="user-card"
                key={user.id}
              >

                <div className="user-avatar">
                  {user.display_name
                    ? user.display_name.charAt(0)
                    : "U"}
                </div>

                <div>

                  <h5>
                    {user.display_name}
                  </h5>

                  <p>
                    {user.user_email}
                  </p>

                  <span className="tag">
                    {user.department}
                  </span>

                </div>

                <div className="user-status">
                  {user.impact_status}
                </div>

              </div>

            ))

          )}

        </div>


        {/* CONTAINMENT */}
        <div className="card-dark">

          <div className="section-header">

            <div>
              <h3>
                Containment Actions
              </h3>

              <small>
                Actions taken by security
              </small>
            </div>

          </div>


          {containmentActions.length === 0 ? (

            <p className="empty-state">
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
                    {action.action_type}
                  </h5>

                  <p>
                    Target:{" "}
                    <code>
                      {action.target}
                    </code>
                  </p>

                  <small>
                    Performed by:{" "}
                    {action.performed_by}
                  </small>

                </div>

                <span className="completed">
                  {action.status}
                </span>

              </div>

            ))

          )}

        </div>

      </section>


      {/* MITRE ATT&CK */}
      <section className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              MITRE ATT&CK Mapping
            </h3>

            <small>
              Techniques associated with this investigation
            </small>
          </div>

        </div>


        {mitreMappings.length === 0 ? (

          <p className="empty-state">
            No MITRE ATT&CK mappings available.
          </p>

        ) : (

          <div className="mitre-grid">

            {mitreMappings.map((mapping) => (

              <div
                className="mitre-card"
                key={mapping.id}
              >

                <div className="technique-id">
                  {mapping.technique_id}
                </div>

                <h4>
                  {mapping.technique_name}
                </h4>

                <span className="tactic">
                  {mapping.tactic}
                </span>

                <p>
                  {mapping.description}
                </p>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* FOOTER */}
      <footer>

        <span>
          PhishTrace Security Operations Platform
        </span>

        <span>
          Backend: Flask + PostgreSQL
        </span>

      </footer>

    </>
  );
}


function StatCard({
  label,
  value,
  icon,
}) {
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


export default Dashboard;