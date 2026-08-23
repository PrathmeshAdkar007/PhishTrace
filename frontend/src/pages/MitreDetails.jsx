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

function MitreDetails() {
  const { mappingId } = useParams();
  const navigate = useNavigate();

  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMapping = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/mitre/${mappingId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              `Failed to load MITRE mapping (${response.status})`
          );
        }

        setMapping(data.mapping);
      } catch (err) {
        console.error(
          "MITRE details error:",
          err
        );

        setError(
          err.message ||
            "Failed to load MITRE mapping."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMapping();
  }, [mappingId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="brand-icon">
            P
          </div>

          <h2>
            Loading MITRE Mapping...
          </h2>

          <p>
            Fetching MITRE ATT&CK technique
            details.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="page">
        <div className="card-dark error-message">
          <strong>
            Error
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/mitre")
            }
          >
            ← Back to MITRE ATT&CK
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!mapping) {
    return (
      <div className="page">
        <div className="card-dark empty-state">
          <h3>
            MITRE mapping not found
          </h3>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/mitre")
            }
          >
            ← Back to MITRE ATT&CK
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>
          <h2>
            MITRE Technique Details
          </h2>

          <p>
            Detailed MITRE ATT&CK mapping
            analysis
          </p>
        </div>

        <div className="case-badge">
          MAPPING #{mapping.id}
        </div>

      </div>


      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        className="secondary-button"
        onClick={() =>
          navigate("/mitre")
        }
      >
        ← Back to MITRE ATT&CK
      </button>


      {/* =================================================
          TECHNIQUE SUMMARY
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <small>
              MITRE ATT&CK TECHNIQUE
            </small>

            <h3>
              {mapping.technique_name ||
                "Unknown Technique"}
            </h3>

          </div>

          <span className="tag">
            {mapping.technique_id ||
              "Unknown"}
          </span>

        </div>


        {/* TECHNIQUE ID */}

        <div className="detail-section">

          <h4>
            Technique ID
          </h4>

          <p>
            {mapping.technique_id ||
              "N/A"}
          </p>

        </div>


        {/* DESCRIPTION */}

        <div className="detail-section">

          <h4>
            Description
          </h4>

          <p>
            {mapping.description ||
              "No description available."}
          </p>

        </div>

      </div>


      {/* =================================================
          MAPPING INFORMATION
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Mapping Information
            </h3>

            <small>
              Investigation mapping details
            </small>

          </div>

        </div>


        <div className="details-grid">

          <div className="detail-box">

            <span>
              Mapping ID
            </span>

            <strong>
              #{mapping.id}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Finding ID
            </span>

            <strong>
              #{mapping.finding_id ||
                "N/A"}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Technique
            </span>

            <strong>
              {mapping.technique_id ||
                "N/A"}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Tactic
            </span>

            <strong>
              {mapping.tactic ||
                "N/A"}
            </strong>

          </div>


          <div className="detail-box">

            <span>
              Created
            </span>

            <strong>
              {formatDate(
                mapping.created_at
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          EVIDENCE
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Evidence
            </h3>

            <small>
              Evidence associated with this
              MITRE mapping
            </small>

          </div>

        </div>


        <div className="evidence-block">

          {typeof mapping.evidence === "object"
            ? JSON.stringify(
                mapping.evidence,
                null,
                2
              )
            : mapping.evidence ||
              "No evidence available."}

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
          MITRE ATT&CK Analysis
        </span>

      </footer>

    </div>
  );
}

export default MitreDetails;