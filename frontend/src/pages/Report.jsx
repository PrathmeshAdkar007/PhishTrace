import { useEffect, useState } from "react";
import "./Report.css";

function Report() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(
      "http://localhost:5000/api/cases/1/report",
      {
        credentials: "include",
      }
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load report"
          );
        }

        return data;
      })
      .then((data) => {
        setReport(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  if (error) {
    return (
      <div className="page-container">
        <h1>Incident Report</h1>

        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-container">
        <div className="loading-message">
          Loading incident report...
        </div>
      </div>
    );
  }

  const {
    case: caseData,
    executive_summary,
    risk_assessment,
    counts,
    emails,
    indicators,
    threat_intelligence,
    findings,
    affected_users,
    containment_actions,
    mitre_mappings,
  } = report;

  return (
    <div className="page-container">

      {/* ================================================= */}
      {/* REPORT HEADER */}
      {/* ================================================= */}

      <div className="report-header">

        <div>
          <p className="page-eyebrow">
            CASE INVESTIGATION REPORT
          </p>

          <h1>
            Incident Report
          </h1>

          <p className="page-subtitle">
            Complete investigation and incident response summary
          </p>
        </div>

        <div className="report-case-number">
          {caseData.case_number}
        </div>

      </div>


      {/* ================================================= */}
      {/* CASE INFORMATION */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Case Information
        </h2>

        <div className="report-grid">

          <div className="report-item">
            <span>Case Title</span>

            <strong>
              {caseData.title}
            </strong>
          </div>

          <div className="report-item">
            <span>Case Number</span>

            <strong>
              {caseData.case_number}
            </strong>
          </div>

          <div className="report-item">
            <span>Severity</span>

            <strong className="severity-value">
              {caseData.severity}
            </strong>
          </div>

          <div className="report-item">
            <span>Status</span>

            <strong>
              {caseData.status}
            </strong>
          </div>

        </div>

        {caseData.description && (
          <div className="report-description">

            <span>Description</span>

            <p>
              {caseData.description}
            </p>

          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* EXECUTIVE SUMMARY */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Executive Summary
        </h2>

        <div className="summary-list">

          <p>
            {executive_summary.overview}
          </p>

          <p>
            {executive_summary.risk_summary}
          </p>

          <p>
            {executive_summary.threat_summary}
          </p>

          <p>
            {executive_summary.impact_summary}
          </p>

          <p>
            {executive_summary.containment_summary}
          </p>

          <p>
            {executive_summary.mitre_summary}
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* RISK ASSESSMENT */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Risk Assessment
        </h2>

        <div className="risk-report-section">

          <div className="risk-score-circle">

            <strong>
              {risk_assessment.risk_score}
            </strong>

            <span>
              /100
            </span>

          </div>

          <div>

            <p className="risk-label">
              Overall Risk Level
            </p>

            <h3>
              {risk_assessment.risk_severity}
            </h3>

            <p>
              The calculated risk score is based on
              the severity of investigation findings.
            </p>

          </div>

        </div>

        {risk_assessment.breakdown && (

          <div className="report-grid risk-breakdown">

            <div className="report-item">
              <span>Critical</span>

              <strong>
                {risk_assessment.breakdown.critical}
              </strong>
            </div>

            <div className="report-item">
              <span>High</span>

              <strong>
                {risk_assessment.breakdown.high}
              </strong>
            </div>

            <div className="report-item">
              <span>Medium</span>

              <strong>
                {risk_assessment.breakdown.medium}
              </strong>
            </div>

            <div className="report-item">
              <span>Low</span>

              <strong>
                {risk_assessment.breakdown.low}
              </strong>
            </div>

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* INVESTIGATION STATISTICS */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Investigation Statistics
        </h2>

        <div className="statistics-grid">

          <div className="stat-box">
            <strong>
              {counts.emails}
            </strong>

            <span>
              Emails
            </span>
          </div>

          <div className="stat-box">
            <strong>
              {counts.indicators}
            </strong>

            <span>
              Indicators
            </span>
          </div>

          <div className="stat-box">
            <strong>
              {counts.threat_intelligence}
            </strong>

            <span>
              Threat Intelligence
            </span>
          </div>

          <div className="stat-box">
            <strong>
              {counts.findings}
            </strong>

            <span>
              Findings
            </span>
          </div>

          <div className="stat-box">
            <strong>
              {counts.affected_users}
            </strong>

            <span>
              Affected Users
            </span>
          </div>

          <div className="stat-box">
            <strong>
              {counts.containment_actions}
            </strong>

            <span>
              Containment Actions
            </span>
          </div>

          <div className="stat-box">
            <strong>
              {counts.mitre_mappings}
            </strong>

            <span>
              MITRE Mappings
            </span>
          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* FINDINGS */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Investigation Findings
        </h2>

        {findings.length === 0 ? (

          <p className="empty-report">
            No findings available.
          </p>

        ) : (

          <div className="report-list">

            {findings.map((finding) => (

              <div
                className="report-list-item"
                key={finding.id}
              >

                <div>

                  <strong>
                    {finding.title}
                  </strong>

                  {finding.description && (
                    <p>
                      {finding.description}
                    </p>
                  )}

                </div>

                <span className="report-badge">
                  {finding.severity}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* INDICATORS */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Indicators of Compromise
        </h2>

        {indicators.length === 0 ? (

          <p className="empty-report">
            No indicators identified.
          </p>

        ) : (

          <div className="report-list">

            {indicators.map((indicator) => (

              <div
                className="report-list-item"
                key={indicator.id}
              >

                <div>

                  <strong>
                    {indicator.value}
                  </strong>

                  <p>
                    Type: {indicator.indicator_type}
                  </p>

                </div>

                <span className="report-badge">
                  {indicator.confidence || "Unknown"}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* THREAT INTELLIGENCE */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Threat Intelligence Results
        </h2>

        {threat_intelligence.length === 0 ? (

          <p className="empty-report">
            No threat intelligence results available.
          </p>

        ) : (

          <div className="report-list">

            {threat_intelligence.map((result) => (

              <div
                className="report-list-item"
                key={result.id}
              >

                <div>

                  <strong>
                    {result.verdict}
                  </strong>

                  <p>
                    Provider: {result.provider || "Local"}
                  </p>

                </div>

                <span className="report-badge">
                  Score: {result.threat_score}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* AFFECTED USERS */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Affected Users
        </h2>

        {affected_users.length === 0 ? (

          <p className="empty-report">
            No affected users identified.
          </p>

        ) : (

          <div className="report-list">

            {affected_users.map((user) => (

              <div
                className="report-list-item"
                key={user.id}
              >

                <div>

                  <strong>
                    {user.email || user.name || "Affected User"}
                  </strong>

                  {user.notes && (
                    <p>
                      {user.notes}
                    </p>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* CONTAINMENT */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          Containment Actions
        </h2>

        {containment_actions.length === 0 ? (

          <p className="empty-report">
            No containment actions recorded.
          </p>

        ) : (

          <div className="report-list">

            {containment_actions.map((action) => (

              <div
                className="report-list-item"
                key={action.id}
              >

                <div>

                  <strong>
                    {action.action_type}
                  </strong>

                  <p>
                    {action.target}
                  </p>

                </div>

                <span className="report-badge">
                  {action.status}
                </span>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ================================================= */}
      {/* MITRE ATT&CK */}
      {/* ================================================= */}

      <div className="report-card">

        <h2>
          MITRE ATT&CK Mapping
        </h2>

        {mitre_mappings.length === 0 ? (

          <p className="empty-report">
            No MITRE ATT&CK techniques mapped.
          </p>

        ) : (

          <div className="report-list">

            {mitre_mappings.map((mapping) => (

              <div
                className="report-list-item"
                key={mapping.id}
              >

                <div>

                  <strong>
                    {mapping.technique_id}
                    {" — "}
                    {mapping.technique_name}
                  </strong>

                  {mapping.tactic && (
                    <p>
                      Tactic: {mapping.tactic}
                    </p>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Report;