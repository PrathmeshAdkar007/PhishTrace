import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5000";

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

function ThreatIntelligenceDetails() {

  const { resultId } = useParams();

  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // LOAD ALL RESULTS AND FIND REQUESTED RESULT
  // =====================================================

  useEffect(() => {

    const loadResult = async () => {

      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          `${API_BASE_URL}/api/threat-intelligence`
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.error ||
            "Failed to load threat intelligence."
          );

        }


        const results = data.results || [];


        const selectedResult = results.find(
          (item) =>
            String(item.id) === String(resultId)
        );


        if (!selectedResult) {

          throw new Error(
            "Threat intelligence result not found."
          );

        }


        setResult(selectedResult);


      } catch (err) {

        console.error(
          "Threat intelligence details error:",
          err
        );


        setError(
          err.message ||
          "Failed to load threat intelligence details."
        );


      } finally {

        setLoading(false);

      }

    };


    loadResult();

  }, [resultId]);


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
            Fetching detailed threat intelligence
            information.
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
              navigate("/threat-intelligence")
            }
          >
            ← Back to Threat Intelligence
          </button>

        </div>

      </div>

    );

  }


  if (!result) {

    return (

      <div className="page">

        <div className="card-dark empty-state">

          <h3>
            Result not found
          </h3>


          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/threat-intelligence")
            }
          >
            ← Back to Threat Intelligence
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // EXTRACT INDICATOR INFORMATION
  // =====================================================

  const indicatorValue =
    result.raw_response?.indicator ||
    "Unknown indicator";


  const indicatorType =
    result.raw_response?.indicator_type ||
    "Unknown";


  const analysis =
    result.raw_response?.analysis ||
    {};


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
            Threat Intelligence Details
          </h2>

          <p>
            Detailed indicator threat analysis
          </p>

        </div>


        <div className="case-badge">

          RESULT #{result.id}

        </div>

      </div>


      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        className="secondary-button"
        onClick={() =>
          navigate("/threat-intelligence")
        }
      >
        ← Back to Threat Intelligence
      </button>


      {/* =================================================
          MAIN SUMMARY
      ================================================= */}

      <div className="card-dark">


        <div className="section-header">

          <div>

            <small>
              {upper(indicatorType)}
            </small>


            <h3>
              {indicatorValue}
            </h3>

          </div>


          <span
            className={`tag severity-tag ${
              result.verdict?.toLowerCase() ===
              "malicious"
                ? "critical"
                : ""
            }`}
          >

            {upper(result.verdict)}

          </span>

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="detail-section">

          <h4>
            Analysis
          </h4>


          <p>

            {result.notes ||
              analysis.reason ||
              "No analysis notes available."}

          </p>

        </div>


        {/* =================================================
            DETAILS GRID
        ================================================= */}

        <div className="details-grid">


          {/* RESULT ID */}

          <div className="detail-box">

            <span>
              Result ID
            </span>

            <strong>
              #{result.id}
            </strong>

          </div>


          {/* INDICATOR ID */}

          <div className="detail-box">

            <span>
              Indicator ID
            </span>

            <strong>
              #{result.indicator_id}
            </strong>

          </div>


          {/* INDICATOR */}

          <div className="detail-box">

            <span>
              Indicator
            </span>

            <strong>
              {indicatorValue}
            </strong>

          </div>


          {/* TYPE */}

          <div className="detail-box">

            <span>
              Indicator Type
            </span>

            <strong>
              {upper(indicatorType)}
            </strong>

          </div>


          {/* VERDICT */}

          <div className="detail-box">

            <span>
              Verdict
            </span>

            <strong>
              {upper(result.verdict)}
            </strong>

          </div>


          {/* SCORE */}

          <div className="detail-box">

            <span>
              Threat Score
            </span>

            <strong>
              {result.score !== null &&
              result.score !== undefined
                ? result.score
                : "N/A"}
            </strong>

          </div>


          {/* CONFIDENCE */}

          <div className="detail-box">

            <span>
              Confidence
            </span>

            <strong>
              {upper(result.confidence)}
            </strong>

          </div>


          {/* PROVIDER */}

          <div className="detail-box">

            <span>
              Provider
            </span>

            <strong>
              {result.provider || "local"}
            </strong>

          </div>


          {/* CHECKED */}

          <div className="detail-box">

            <span>
              Checked
            </span>

            <strong>
              {formatDate(result.checked_at)}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          ANALYSIS RESULT
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Threat Analysis Result
            </h3>

            <small>
              Result generated by the local threat
              intelligence provider
            </small>

          </div>

        </div>


        <div className="findings-list">


          <div className="finding">

            <div
              className={`finding-indicator ${
                result.verdict?.toLowerCase() ===
                "malicious"
                  ? "danger"
                  : ""
              }`}
            >
              !
            </div>


            <div className="finding-content">

              <h5>
                {result.verdict?.toLowerCase() ===
                "malicious"
                  ? "Malicious indicator detected"
                  : "Threat intelligence analysis completed"}
              </h5>


              <p>

                {analysis.reason ||
                  result.notes ||
                  "No analysis reason available."}

              </p>


              <div className="finding-tags">


                <span
                  className={`tag ${
                    result.verdict?.toLowerCase() ===
                    "malicious"
                      ? "severity-tag"
                      : ""
                  }`}
                >
                  {upper(result.verdict)}
                </span>


                <span className="tag">

                  SCORE{" "}
                  {result.score !== null &&
                  result.score !== undefined
                    ? result.score
                    : "N/A"}

                </span>


                <span className="tag">

                  {upper(result.confidence)}
                  {" "}
                  CONFIDENCE

                </span>


                <span className="tag">

                  {result.provider || "local"}

                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RAW THREAT INTELLIGENCE RESPONSE
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Raw Intelligence Response
            </h3>

            <small>
              Original response returned by the
              threat intelligence provider
            </small>

          </div>

        </div>


        <pre className="evidence-block">

          {JSON.stringify(
            result.raw_response,
            null,
            2
          )}

        </pre>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          Threat Intelligence Analysis
        </span>

      </footer>

    </div>

  );

}


export default ThreatIntelligenceDetails;