import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:5000";

function ThreatIntelligence() {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load indicators and their threat intelligence
   */
  const loadThreatIntelligence = async () => {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------
      // Get indicators belonging to Email ID 3
      // --------------------------------------------------

      const indicatorsResponse = await fetch(
        `${API_BASE_URL}/api/emails/3/indicators`
      );

      if (!indicatorsResponse.ok) {
        throw new Error(
          `Failed to load indicators (${indicatorsResponse.status})`
        );
      }

      const indicatorsData = await indicatorsResponse.json();

      const indicatorList = indicatorsData.indicators || [];

      // --------------------------------------------------
      // Get threat intelligence for every indicator
      // --------------------------------------------------

      const enrichedIndicators = await Promise.all(
        indicatorList.map(async (indicator) => {
          try {
            let response = await fetch(
              `${API_BASE_URL}/api/indicators/${indicator.id}/threat-intel`
            );

            if (!response.ok) {
              return {
                ...indicator,
                verdict: "unknown",
                score: null,
                confidence: "unknown",
                provider: "local",
                notes: "Threat intelligence result unavailable.",
                checked_at: null,
              };
            }

            let data = await response.json();

            let results = data.results || [];

            /*
             * If no threat-intelligence result exists yet,
             * run the local analysis automatically.
             */
            if (results.length === 0) {
              const analysisResponse = await fetch(
                `${API_BASE_URL}/api/indicators/${indicator.id}/threat-intel`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (analysisResponse.ok) {
                const analysisData =
                  await analysisResponse.json();

                if (analysisData.result) {
                  results = [analysisData.result];
                }
              }
            }

            const latestResult = results[0];

            if (!latestResult) {
              return {
                ...indicator,
                verdict: "unknown",
                score: null,
                confidence: "unknown",
                provider: "local",
                notes: "No threat intelligence result available.",
                checked_at: null,
              };
            }

            return {
              ...indicator,

              verdict:
                latestResult.verdict || "unknown",

              score:
                latestResult.score ?? null,

              confidence:
                latestResult.confidence || "unknown",

              provider:
                latestResult.provider || "local",

              notes:
                latestResult.notes ||
                "No analysis notes available.",

              checked_at:
                latestResult.checked_at || null,
            };
          } catch (indicatorError) {
            console.error(
              `Threat intelligence error for indicator ${indicator.id}:`,
              indicatorError
            );

            return {
              ...indicator,
              verdict: "unknown",
              score: null,
              confidence: "unknown",
              provider: "local",
              notes: "Unable to retrieve threat intelligence.",
              checked_at: null,
            };
          }
        })
      );

      setIndicators(enrichedIndicators);
    } catch (err) {
      console.error(
        "Threat intelligence API error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreatIntelligence();
  }, []);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <h2>Loading Threat Intelligence...</h2>

          <p>
            Analyzing indicators using the PhishTrace
            threat intelligence provider.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Calculated statistics
  // --------------------------------------------------

  const maliciousCount = indicators.filter(
    (indicator) =>
      indicator.verdict?.toLowerCase() === "malicious"
  ).length;

  const suspiciousCount = indicators.filter(
    (indicator) =>
      indicator.verdict?.toLowerCase() === "suspicious"
  ).length;

  const highConfidenceCount = indicators.filter(
    (indicator) =>
      indicator.confidence?.toLowerCase() === "high"
  ).length;

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="page">

      {/* TOP BAR */}

      <div className="topbar">

        <div>
          <h2>
            Threat Intelligence
          </h2>

          <p>
            Indicator analysis and threat intelligence
            results
          </p>
        </div>

        <div className="case-badge">
          {indicators.length} INDICATOR
          {indicators.length !== 1 ? "S" : ""}
        </div>

      </div>


      {/* ERROR */}

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


      {/* SUMMARY */}

      <div className="stats-grid">

        {/* TOTAL */}

        <div className="stat-card">

          <div className="stat-icon">
            ⌁
          </div>

          <div>
            <div className="stat-value">
              {indicators.length}
            </div>

            <div className="stat-label">
              Indicators
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


      {/* THREAT INTELLIGENCE TABLE */}

      <div className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Threat Intelligence Results
            </h3>

            <small>
              Local threat intelligence provider
            </small>
          </div>

          <small>
            {maliciousCount} malicious
          </small>

        </div>


        {indicators.length === 0 ? (

          <div className="empty-state">

            <h3>
              No indicators found
            </h3>

            <p>
              No indicators are currently available
              for threat intelligence analysis.
            </p>

          </div>

        ) : (

          <div className="threat-table-wrapper">

            <table className="threat-table">

              <thead>

                <tr>
                  <th>Indicator</th>
                  <th>Type</th>
                  <th>Verdict</th>
                  <th>Score</th>
                  <th>Confidence</th>
                  <th>Provider</th>
                </tr>

              </thead>


              <tbody>

                {indicators.map((indicator) => (

                  <tr key={indicator.id}>

                    <td>
                      <code>
                        {indicator.value}
                      </code>
                    </td>

                    <td>
                      {indicator.indicator_type}
                    </td>

                    <td>

                      <span
                        className={`verdict ${
                          indicator.verdict?.toLowerCase() ===
                          "malicious"
                            ? "malicious"
                            : ""
                        }`}
                      >
                        {String(
                          indicator.verdict || "unknown"
                        ).toUpperCase()}
                      </span>

                    </td>

                    <td>
                      {indicator.score !== null &&
                      indicator.score !== undefined
                        ? indicator.score
                        : "—"}
                    </td>

                    <td>
                      {String(
                        indicator.confidence || "unknown"
                      ).toUpperCase()}
                    </td>

                    <td>
                      {indicator.provider || "local"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* DETAILED ANALYSIS */}

      <div className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Analysis
            </h3>

            <small>
              Threat intelligence reasoning for each
              indicator
            </small>
          </div>

        </div>


        <div className="findings-list">

          {indicators.map((indicator) => (

            <div
              className="finding"
              key={`finding-${indicator.id}`}
            >

              <div
                className={`finding-indicator ${
                  indicator.verdict?.toLowerCase() ===
                  "malicious"
                    ? "danger"
                    : ""
                }`}
              >
                !
              </div>


              <div>

                <h5>
                  {indicator.verdict?.toLowerCase() ===
                  "malicious"
                    ? "Malicious indicator detected"
                    : "Indicator analysis completed"}
                </h5>


                <p>

                  <strong>
                    {indicator.value}
                  </strong>

                  {" — "}

                  {indicator.notes ||
                    "No analysis notes available."}

                </p>


                <div className="finding-tags">

                  <span
                    className={`tag ${
                      indicator.verdict?.toLowerCase() ===
                      "malicious"
                        ? "severity-tag"
                        : ""
                    }`}
                  >
                    {String(
                      indicator.verdict || "unknown"
                    ).toUpperCase()}
                  </span>


                  {indicator.score !== null &&
                    indicator.score !== undefined && (

                    <span className="tag">
                      SCORE {indicator.score}
                    </span>

                  )}


                  <span className="tag">
                    {String(
                      indicator.confidence || "unknown"
                    ).toUpperCase()}{" "}
                    CONFIDENCE
                  </span>


                  <span className="tag">
                    {indicator.provider || "local"}
                  </span>

                </div>


                {indicator.checked_at && (

                  <small className="finding-time">

                    Checked{" "}

                    {new Date(
                      indicator.checked_at
                    ).toLocaleString()}

                  </small>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* FOOTER */}

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