import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = "http://localhost:5000";


// =====================================================
// FORMAT DATE
// =====================================================

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


// =====================================================
// FORMAT TEXT
// =====================================================

function upper(value) {

  if (!value) {
    return "N/A";
  }

  return String(value)
    .replaceAll("_", " ")
    .toUpperCase();

}


// =====================================================
// GET VERDICT CLASS
// =====================================================

function getVerdictClass(verdict) {

  const value =
    String(verdict || "unknown").toLowerCase();

  if (value === "malicious") {
    return "malicious";
  }

  if (value === "suspicious") {
    return "suspicious";
  }

  if (
    value === "safe" ||
    value === "benign"
  ) {
    return "safe";
  }

  return "unknown";

}


// =====================================================
// THREAT INTELLIGENCE COMPONENT
// =====================================================

function ThreatIntelligence() {

  const navigate = useNavigate();


  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD THREAT INTELLIGENCE
  // =====================================================

  const loadThreatIntelligence = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        `${API_BASE_URL}/api/threat-intelligence`,
        {
          method: "GET",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          `Failed to load threat intelligence (${response.status})`
        );

      }


      setResults(
        data.results || []
      );


    } catch (err) {

      console.error(
        "Threat intelligence API error:",
        err
      );


      setError(
        err.message ||
        "Failed to load threat intelligence."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    loadThreatIntelligence();

  }, []);


  // =====================================================
  // OPEN THREAT INTELLIGENCE DETAILS
  // =====================================================

  const viewResult = (resultId) => {

    navigate(
      `/threat-intelligence/${resultId}`
    );

  };


  // =====================================================
  // KEYBOARD NAVIGATION
  // =====================================================

  const handleResultKeyDown = (
    event,
    resultId
  ) => {

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {

      event.preventDefault();

      viewResult(resultId);

    }

  };


  // =====================================================
  // GET INDICATOR INFORMATION
  // =====================================================

  const getIndicatorValue = (result) => {

    return (
      result.raw_response?.indicator ||
      result.indicator ||
      "Unknown indicator"
    );

  };


  const getIndicatorType = (result) => {

    return (
      result.raw_response?.indicator_type ||
      result.indicator_type ||
      "Unknown"
    );

  };


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
            Loading Threat Intelligence...
          </h2>

          <p>
            Fetching threat intelligence results
            from the PhishTrace backend.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  const maliciousCount = results.filter(
    (result) =>
      result.verdict?.toLowerCase() ===
      "malicious"
  ).length;


  const suspiciousCount = results.filter(
    (result) =>
      result.verdict?.toLowerCase() ===
      "suspicious"
  ).length;


  const highConfidenceCount = results.filter(
    (result) =>
      result.confidence?.toLowerCase() ===
      "high"
  ).length;


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="page threat-intel-page">


      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>

          <h2>
            Threat Intelligence
          </h2>

          <p>
            Indicator analysis and threat intelligence
            enrichment results
          </p>

        </div>


        <div className="case-badge">

          {results.length} RESULT
          {results.length !== 1
            ? "S"
            : ""}

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="card-dark error-message">

          <strong>
            Unable to Load Threat Intelligence
          </strong>

          <p>
            {error}
          </p>


          <button
            type="button"
            className="secondary-button"
            onClick={loadThreatIntelligence}
          >
            Try Again
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY STATISTICS
      ================================================= */}

      <div className="stats-grid">


        {/* TOTAL RESULTS */}

        <div className="stat-card">

          <div className="stat-icon">
            ◉
          </div>


          <div>

            <div className="stat-value">
              {results.length}
            </div>

            <div className="stat-label">
              Total Results
            </div>

          </div>

        </div>


        {/* MALICIOUS */}

        <div className="stat-card">

          <div className="stat-icon">
            !
          </div>


          <div>

            <div className="stat-value">
              {maliciousCount}
            </div>

            <div className="stat-label">
              Malicious
            </div>

          </div>

        </div>


        {/* SUSPICIOUS */}

        <div className="stat-card">

          <div className="stat-icon">
            !
          </div>


          <div>

            <div className="stat-value">
              {suspiciousCount}
            </div>

            <div className="stat-label">
              Suspicious
            </div>

          </div>

        </div>


        {/* HIGH CONFIDENCE */}

        <div className="stat-card">

          <div className="stat-icon">
            ✓
          </div>


          <div>

            <div className="stat-value">
              {highConfidenceCount}
            </div>

            <div className="stat-label">
              High Confidence
            </div>

          </div>

        </div>


      </div>


      {/* =================================================
          THREAT INTELLIGENCE RESULTS
      ================================================= */}

      <div className="card-dark">


        <div className="section-header">

          <div>

            <h3>
              Threat Intelligence Results
            </h3>

            <small>
              Reputation and enrichment results
              for investigation indicators
            </small>

          </div>


          <small>
            {maliciousCount} malicious
          </small>

        </div>


        {/* EMPTY STATE */}

        {results.length === 0 ? (

          <div className="empty-state">

            <h3>
              No threat intelligence results
            </h3>

            <p>
              No threat intelligence analysis
              results are currently available.
            </p>

          </div>

        ) : (

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

                  <th>
                    Provider
                  </th>

                </tr>

              </thead>


              <tbody>

                {results.map((result) => (

                  <tr
                    key={result.id}
                    className="threat-table-row"
                    onClick={() =>
                      viewResult(result.id)
                    }
                    onKeyDown={(event) =>
                      handleResultKeyDown(
                        event,
                        result.id
                      )
                    }
                    role="button"
                    tabIndex={0}
                    title="View threat intelligence details"
                  >

                    {/* INDICATOR */}

                    <td>

                      <code>
                        {getIndicatorValue(result)}
                      </code>

                    </td>


                    {/* TYPE */}

                    <td>

                      {upper(
                        getIndicatorType(result)
                      )}

                    </td>


                    {/* VERDICT */}

                    <td>

                      <span
                        className={`verdict ${getVerdictClass(
                          result.verdict
                        )}`}
                      >

                        {upper(
                          result.verdict
                        )}

                      </span>

                    </td>


                    {/* SCORE */}

                    <td>

                      {result.score !== null &&
                      result.score !== undefined
                        ? result.score
                        : "—"}

                    </td>


                    {/* CONFIDENCE */}

                    <td>

                      {upper(
                        result.confidence
                      )}

                    </td>


                    {/* PROVIDER */}

                    <td>

                      {result.provider ||
                        "local"}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =================================================
          DETAILED ANALYSIS
      ================================================= */}

      <div className="card-dark">


        <div className="section-header">

          <div>

            <h3>
              Analysis
            </h3>

            <small>
              Threat intelligence reasoning and
              evidence for each indicator
            </small>

          </div>

        </div>


        {results.length === 0 ? (

          <div className="empty-state">

            <p>
              No detailed threat intelligence
              analysis is currently available.
            </p>

          </div>

        ) : (

          <div className="findings-list">

            {results.map((result) => {

              const verdictClass =
                getVerdictClass(
                  result.verdict
                );


              const isDangerous =
                result.verdict
                  ?.toLowerCase() ===
                  "malicious" ||
                result.verdict
                  ?.toLowerCase() ===
                  "suspicious";


              return (

                <div
                  className="finding threat-analysis-card threat-clickable-card"
                  key={`analysis-${result.id}`}
                  onClick={() =>
                    viewResult(result.id)
                  }
                  onKeyDown={(event) =>
                    handleResultKeyDown(
                      event,
                      result.id
                    )
                  }
                  role="button"
                  tabIndex={0}
                  title="View threat intelligence details"
                >


                  {/* INDICATOR ICON */}

                  <div
                    className={`finding-indicator ${
                      isDangerous
                        ? "danger"
                        : ""
                    }`}
                  >

                    {isDangerous
                      ? "!"
                      : "✓"}

                  </div>


                  {/* CONTENT */}

                  <div>

                    <h5>

                      {result.verdict
                        ?.toLowerCase() ===
                      "malicious"

                        ? "Malicious indicator detected"

                        : result.verdict
                            ?.toLowerCase() ===
                          "suspicious"

                        ? "Suspicious indicator detected"

                        : "Threat intelligence analysis"}

                    </h5>


                    <p>

                      <strong>
                        {getIndicatorValue(
                          result
                        )}
                      </strong>

                      {" — "}

                      {result.notes ||
                        "No analysis notes available."}

                    </p>


                    {/* TAGS */}

                    <div className="finding-tags">


                      <span
                        className={`tag ${
                          verdictClass ===
                          "malicious"

                            ? "severity-tag"

                            : ""
                        }`}
                      >

                        {upper(
                          result.verdict
                        )}

                      </span>


                      {result.score !== null &&
                      result.score !== undefined && (

                        <span className="tag">

                          SCORE{" "}
                          {result.score}

                        </span>

                      )}


                      <span className="tag">

                        {upper(
                          result.confidence
                        )}

                        {" "}
                        CONFIDENCE

                      </span>


                      <span className="tag">

                        {upper(
                          result.provider ||
                          "local"
                        )}

                      </span>


                      <span className="tag">

                        {upper(
                          getIndicatorType(
                            result
                          )
                        )}

                      </span>


                    </div>


                    {/* CHECKED TIME */}

                    {result.checked_at && (

                      <small className="finding-time">

                        Checked{" "}

                        {formatDate(
                          result.checked_at
                        )}

                      </small>

                    )}

                  </div>


                  {/* VIEW ARROW */}

                  <div className="finding-arrow">

                    →

                  </div>

                </div>

              );

            })}

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
          Threat Intelligence
        </span>

      </footer>


    </div>

  );

}


export default ThreatIntelligence;