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


function resultClass(value) {
  if (!value) {
    return "";
  }

  const result = String(value).toLowerCase();

  if (
    result === "pass" ||
    result === "passed" ||
    result === "success"
  ) {
    return "success-text";
  }

  if (
    result === "fail" ||
    result === "failed" ||
    result === "suspicious" ||
    result === "malicious"
  ) {
    return "danger-text";
  }

  return "";
}


function EmailDetails() {

  const { emailId } = useParams();

  const navigate = useNavigate();


  const [email, setEmail] = useState(null);

  const [authentication, setAuthentication] =
    useState(null);

  const [indicators, setIndicators] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(true);

  const [indicatorLoading, setIndicatorLoading] =
    useState(true);


  // =========================================================
  // LOAD EMAIL
  // =========================================================

  const loadEmail = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_BASE}/api/emails/${emailId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          `Failed to load email (${response.status})`
        );

      }

      setEmail(data.email);

    } catch (err) {

      console.error(
        "Email details error:",
        err
      );

      setError(
        err.message ||
        "Failed to load email."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD AUTHENTICATION
  // =========================================================

  const loadAuthentication = async () => {

    try {

      setAuthLoading(true);

      const response = await fetch(
        `${API_BASE}/api/emails/${emailId}/authentication`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to load authentication."
        );

      }

      setAuthentication(
        data.authentication || null
      );

    } catch (err) {

      console.error(
        "Email authentication error:",
        err
      );

      setAuthentication(null);

    } finally {

      setAuthLoading(false);

    }

  };


  // =========================================================
  // LOAD INDICATORS
  // =========================================================

  const loadIndicators = async () => {

    try {

      setIndicatorLoading(true);

      const response = await fetch(
        `${API_BASE}/api/emails/${emailId}/indicators`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to load indicators."
        );

      }

      setIndicators(
        data.indicators || []
      );

    } catch (err) {

      console.error(
        "Email indicators error:",
        err
      );

      setIndicators([]);

    } finally {

      setIndicatorLoading(false);

    }

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadEmail();

    loadAuthentication();

    loadIndicators();

  }, [emailId]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="loading-screen">

        <div>

          <h2>
            Loading Email...
          </h2>

          <p>
            Fetching email investigation details
            from the PhishTrace backend.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // ERROR
  // =========================================================

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
              navigate("/emails")
            }
          >
            ← Back to Emails
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // EMAIL NOT FOUND
  // =========================================================

  if (!email) {

    return (

      <div className="page">

        <div className="card-dark empty-state">

          <h3>
            Email not found
          </h3>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate("/emails")
            }
          >
            ← Back to Emails
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="page">


      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>

          <h2>
            Email Details
          </h2>

          <p>
            Detailed phishing email investigation
          </p>

        </div>


        <div className="case-badge">

          EMAIL #{email.id}

        </div>

      </div>


      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        className="secondary-button"
        onClick={() =>
          navigate("/emails")
        }
      >
        ← Back to Emails
      </button>


      {/* =================================================
          EMAIL SUMMARY
      ================================================= */}

      <div className="card-dark">


        <div className="section-header">

          <div>

            <small>
              CASE #{email.case_id ?? "N/A"}
            </small>

            <h3>
              {email.subject ||
                "No Subject"}
            </h3>

          </div>


          <span className="severity critical">
            SUSPICIOUS
          </span>

        </div>


        <div className="email-card">


          <div className="email-row">

            <span>
              Email ID
            </span>

            <strong>
              #{email.id}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Case ID
            </span>

            <strong>
              {email.case_id ?? "N/A"}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Sender
            </span>

            <strong>
              {email.sender || "N/A"}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Recipient
            </span>

            <strong>
              {email.recipient || "N/A"}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Reply-To
            </span>

            <strong>
              {email.reply_to || "N/A"}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Return Path
            </span>

            <strong>
              {email.return_path || "N/A"}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Message ID
            </span>

            <strong>
              {email.message_id || "N/A"}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Received
            </span>

            <strong>
              {formatDate(
                email.received_at
              )}
            </strong>

          </div>


          <div className="email-row">

            <span>
              Created
            </span>

            <strong>
              {formatDate(
                email.created_at
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          RAW EMAIL
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Raw Email
            </h3>

            <small>
              Original email content received
              by PhishTrace
            </small>

          </div>

        </div>


        <pre className="email-raw-content">

          {email.raw_email ||
            "No raw email content available."}

        </pre>

      </div>


      {/* =================================================
          AUTHENTICATION
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Email Authentication
            </h3>

            <small>
              SPF, DKIM and DMARC analysis
            </small>

          </div>


          {authentication && (

            <span
              className={`severity ${
                authentication.authentication_verdict ===
                "suspicious"
                  ? "critical"
                  : ""
              }`}
            >

              {upper(
                authentication.authentication_verdict
              )}

            </span>

          )}

        </div>


        {authLoading ? (

          <div className="empty-state">

            <p>
              Loading authentication results...
            </p>

          </div>

        ) : !authentication ? (

          <div className="empty-state">

            <p>
              No authentication results available.
            </p>

          </div>

        ) : (

          <>

            <div className="auth-grid">


              {/* SPF */}

              <div className="auth-card">

                <div className="auth-name">
                  SPF
                </div>

                <div
                  className={`auth-result ${
                    resultClass(
                      authentication.spf_result
                    )
                  }`}
                >

                  {upper(
                    authentication.spf_result
                  )}

                </div>

              </div>


              {/* DKIM */}

              <div className="auth-card">

                <div className="auth-name">
                  DKIM
                </div>

                <div
                  className={`auth-result ${
                    resultClass(
                      authentication.dkim_result
                    )
                  }`}
                >

                  {upper(
                    authentication.dkim_result
                  )}

                </div>

              </div>


              {/* DMARC */}

              <div className="auth-card">

                <div className="auth-name">
                  DMARC
                </div>

                <div
                  className={`auth-result ${
                    resultClass(
                      authentication.dmarc_result
                    )
                  }`}
                >

                  {upper(
                    authentication.dmarc_result
                  )}

                </div>

              </div>

            </div>


            <div className="email-card">


              <div className="email-row">

                <span>
                  Authentication Verdict
                </span>

                <strong
                  className={
                    authentication.authentication_verdict ===
                    "suspicious"
                      ? "danger-text"
                      : "success-text"
                  }
                >

                  {upper(
                    authentication.authentication_verdict
                  )}

                </strong>

              </div>


              <div className="email-row">

                <span>
                  From Domain
                </span>

                <strong>
                  {authentication.from_domain ||
                    "N/A"}
                </strong>

              </div>


              <div className="email-row">

                <span>
                  Return Path Domain
                </span>

                <strong>
                  {authentication.return_path_domain ||
                    "N/A"}
                </strong>

              </div>


              <div className="email-row">

                <span>
                  DKIM Domain
                </span>

                <strong>
                  {authentication.dkim_domain ||
                    "N/A"}
                </strong>

              </div>


              <div className="email-row">

                <span>
                  DKIM Alignment
                </span>

                <strong
                  className={resultClass(
                    authentication.dkim_alignment
                  )}
                >

                  {upper(
                    authentication.dkim_alignment
                  )}

                </strong>

              </div>


              <div className="email-row">

                <span>
                  DMARC Alignment
                </span>

                <strong
                  className={resultClass(
                    authentication.dmarc_alignment
                  )}
                >

                  {upper(
                    authentication.dmarc_alignment
                  )}

                </strong>

              </div>


              <div className="email-row">

                <span>
                  Checked At
                </span>

                <strong>
                  {formatDate(
                    authentication.checked_at
                  )}
                </strong>

              </div>

            </div>


            <div className="email-analysis">

              <div className="section-header">

                <div>

                  <h3>
                    Authentication Analysis
                  </h3>

                </div>

              </div>

              <p>

                {authentication.analysis_notes ||
                  "No analysis notes available."}

              </p>

            </div>

          </>

        )}

      </div>


      {/* =================================================
          INDICATORS
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Extracted Indicators
            </h3>

            <small>
              Indicators automatically extracted
              from this email
            </small>

          </div>


          <span className="case-badge">

            {indicators.length}
            {" "}
            INDICATOR
            {indicators.length !== 1
              ? "S"
              : ""}

          </span>

        </div>


        {indicatorLoading ? (

          <div className="empty-state">

            <p>
              Loading indicators...
            </p>

          </div>

        ) : indicators.length === 0 ? (

          <div className="empty-state">

            <h3>
              No indicators found
            </h3>

            <p>
              No indicators have been extracted
              from this email.
            </p>

          </div>

        ) : (

          <div className="cases-list">

            {indicators.map(
              (indicator) => (

                <div
                  className="case-list-item"
                  key={indicator.id}
                >

                  <div className="case-list-main">

                    <div className="case-number">

                      {upper(
                        indicator.indicator_type
                      )}

                    </div>


                    <h3>
                      {indicator.value}
                    </h3>


                    <p>

                      {indicator.notes ||
                        "No additional notes available."}

                    </p>


                    <div className="case-list-meta">

                      <span>

                        Source:{" "}
                        {indicator.source ||
                          "N/A"}

                      </span>


                      <span>

                        First Seen:{" "}
                        {formatDate(
                          indicator.first_seen
                        )}

                      </span>

                    </div>

                  </div>


                  <div className="case-list-status">

                    <span className="severity">

                      {upper(
                        indicator.confidence
                      )}

                    </span>


                    <span className="status">

                      {upper(
                        indicator.indicator_type
                      )}

                    </span>

                  </div>

                </div>

              )
            )}

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
          Email Details
        </span>

      </footer>

    </div>

  );

}


export default EmailDetails;