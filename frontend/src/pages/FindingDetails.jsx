import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

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

function FindingDetails() {
  const { findingId } = useParams();
  const navigate = useNavigate();

  const [finding, setFinding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFinding = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/findings/${findingId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load finding."
          );
        }

        setFinding(data.finding);
      } catch (err) {
        console.error("Finding details error:", err);

        setError(
          err.message || "Failed to load finding."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFinding();
  }, [findingId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <h2>Loading Finding...</h2>

          <p>
            Fetching finding details from the
            PhishTrace backend.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card-dark error-message">
          <strong>Error</strong>

          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/findings")}
          >
            Back to Findings
          </button>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="page">
        <div className="card-dark empty-state">
          <h3>Finding not found</h3>

          <button
            className="secondary-button"
            onClick={() => navigate("/findings")}
          >
            Back to Findings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      {/* TOP BAR */}

      <div className="topbar">

        <div>
          <h2>Finding Details</h2>

          <p>
            Detailed security finding analysis
          </p>
        </div>

        <div className="case-badge">
          FINDING #{finding.id}
        </div>

      </div>


      {/* BACK BUTTON */}

      <button
        className="secondary-button"
        onClick={() => navigate("/findings")}
      >
        ← Back to Findings
      </button>


      {/* FINDING SUMMARY */}

      <div className="card-dark">

        <div className="section-header">

          <div>
            <small>
              {upper(finding.finding_type)}
            </small>

            <h3>
              {finding.title}
            </h3>
          </div>

          <span
            className={`tag severity-tag ${
              finding.severity === "critical"
                ? "critical"
                : ""
            }`}
          >
            {upper(finding.severity)}
          </span>

        </div>


        {/* DESCRIPTION */}

        <div className="detail-section">

          <h4>
            Description
          </h4>

          <p>
            {finding.description ||
              "No description available."}
          </p>

        </div>


        {/* DETAILS */}

        <div className="details-grid">

          <div className="detail-box">

            <span>
              Finding ID
            </span>

            <strong>
              #{finding.id}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Case ID
            </span>

            <strong>
              {finding.case_id}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Finding Type
            </span>

            <strong>
              {upper(finding.finding_type)}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Severity
            </span>

            <strong>
              {upper(finding.severity)}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Confidence
            </span>

            <strong>
              {upper(finding.confidence)}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Created
            </span>

            <strong>
              {formatDate(finding.created_at)}
            </strong>

          </div>

        </div>

      </div>


      {/* EVIDENCE */}

      <div className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Evidence
            </h3>

            <small>
              Evidence associated with this finding
            </small>
          </div>

        </div>

        {finding.evidence ? (

          <pre className="evidence-block">
            {JSON.stringify(
              finding.evidence,
              null,
              2
            )}
          </pre>

        ) : (

          <div className="empty-state">
            <p>
              No evidence available.
            </p>
          </div>

        )}

      </div>


      {/* ANALYST NOTES */}

      <div className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Analyst Notes
            </h3>

            <small>
              Investigation notes recorded by PhishTrace
            </small>
          </div>

        </div>

        <p>
          {finding.analyst_notes ||
            "No analyst notes available."}
        </p>

      </div>


      {/* FOOTER */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          Finding Analysis
        </span>

      </footer>

    </div>
  );
}

export default FindingDetails;