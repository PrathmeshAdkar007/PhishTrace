import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function Cases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD CASES
  ===================================================== */

  const loadCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/cases`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load cases (${response.status})`
        );
      }

      const data = await response.json();

      setCases(data.cases || []);
    } catch (err) {
      console.error("Cases API error:", err);

      setError(
        err.message || "Failed to load cases."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  /* =====================================================
     VIEW CASE
  ===================================================== */

  const viewCase = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  /* =====================================================
     CLOSE CASE
  ===================================================== */

  const closeCase = async (caseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this case?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/cases/${caseId}/close`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to close case"
        );
      }

      await loadCases();

      alert("Case closed successfully.");
    } catch (err) {
      console.error("Close case error:", err);

      setError(
        err.message || "Failed to close case."
      );
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <h2>Loading Cases...</h2>

          <p>
            Fetching investigations from the
            PhishTrace backend.
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>
          <h2>Cases</h2>

          <p>
            Phishing investigations and case management
          </p>
        </div>

        <div className="case-badge">
          {cases.length} CASE
          {cases.length !== 1 ? "S" : ""}
        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="card-dark error-message">

          <strong>
            Error
          </strong>

          <p>
            {error}
          </p>

        </div>
      )}


      {/* =================================================
          CASE LIST
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Investigation Cases
            </h3>

            <small>
              All PhishTrace investigations
            </small>
          </div>

          <small>
            {cases.length} total
          </small>

        </div>


        {cases.length === 0 ? (

          <div className="empty-state">

            <h3>
              No cases found
            </h3>

            <p>
              There are currently no investigation
              cases in the database.
            </p>

          </div>

        ) : (

          <div className="cases-list">

            {cases.map((caseItem) => (

              <div
                className="case-list-item"
                key={caseItem.id}
              >

                {/* =================================================
                    CASE INFORMATION
                ================================================= */}

                <div className="case-list-main">

                  <div className="case-number">
                    {caseItem.case_number}
                  </div>

                  <h3>
                    {caseItem.title}
                  </h3>

                  <p>
                    {caseItem.description ||
                      "No description available."}
                  </p>

                  <div className="case-list-meta">

                    <span>
                      Created{" "}
                      {formatDate(
                        caseItem.created_at
                      )}
                    </span>

                  </div>

                </div>


                {/* =================================================
                    CASE STATUS
                ================================================= */}

                <div className="case-list-status">

                  <span
                    className={`severity ${
                      caseItem.severity === "critical"
                        ? "critical"
                        : ""
                    }`}
                  >
                    {upper(caseItem.severity)}
                  </span>

                  <span
                    className={`status ${
                      caseItem.status === "closed"
                        ? ""
                        : "case-open"
                    }`}
                  >
                    {upper(caseItem.status)}
                  </span>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="case-list-actions">

                  <button
                    className="secondary-button"
                    onClick={() =>
                      viewCase(caseItem.id)
                    }
                  >
                    View Case
                  </button>


                  {caseItem.status !== "closed" && (

                    <button
                      className="danger-button"
                      onClick={() =>
                        closeCase(caseItem.id)
                      }
                    >
                      Close
                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          Case Management
        </span>

      </footer>

    </div>
  );
}

export default Cases;