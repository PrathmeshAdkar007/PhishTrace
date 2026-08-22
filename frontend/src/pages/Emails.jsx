import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

/* =========================================================
   HELPERS
========================================================= */

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

function formatResult(value) {
  if (!value) {
    return "N/A";
  }

  return String(value).toUpperCase();
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


/* =========================================================
   EMAILS COMPONENT
========================================================= */

function Emails() {

  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [emails, setEmails] = useState([]);

  const [authResults, setAuthResults] = useState({});

  const [indicatorResults, setIndicatorResults] =
    useState({});

  const [loading, setLoading] = useState(true);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [indicatorLoading, setIndicatorLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [authError, setAuthError] =
    useState("");

  const [indicatorError, setIndicatorError] =
    useState("");


  /* =======================================================
     LOAD EMAILS
  ======================================================= */

  const loadEmails = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/emails`
      );

      if (!response.ok) {

        throw new Error(
          `Failed to load emails (${response.status})`
        );

      }

      const data = await response.json();

      setEmails(data.emails || []);

    } catch (err) {

      console.error(
        "Emails API error:",
        err
      );

      setError(
        err.message ||
        "Failed to load emails."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     LOAD AUTHENTICATION
  ======================================================= */

  const loadAuthentication = async (emailList) => {

    try {

      setAuthLoading(true);
      setAuthError("");

      const results = await Promise.all(

        emailList.map(async (email) => {

          try {

            const response = await fetch(
              `${API_BASE}/api/emails/${email.id}/authentication`
            );

            if (!response.ok) {

              throw new Error(
                `Authentication request failed (${response.status})`
              );

            }

            const data =
              await response.json();

            return {

              emailId: email.id,

              authentication:
                data.authentication || null,

              error: null,

            };

          } catch (err) {

            console.error(
              `Authentication error for email ${email.id}:`,
              err
            );

            return {

              emailId: email.id,

              authentication: null,

              error: err.message,

            };

          }

        })

      );


      const authenticationMap = {};

      let failedRequests = 0;


      results.forEach((result) => {

        authenticationMap[result.emailId] =
          result.authentication;

        if (result.error) {
          failedRequests += 1;
        }

      });


      setAuthResults(
        authenticationMap
      );


      if (failedRequests > 0) {

        setAuthError(
          "Some email authentication results could not be loaded."
        );

      }

    } catch (err) {

      console.error(
        "Authentication loading error:",
        err
      );

      setAuthError(
        err.message ||
        "Failed to load authentication results."
      );

    } finally {

      setAuthLoading(false);

    }

  };


  /* =======================================================
     LOAD INDICATORS
  ======================================================= */

  const loadIndicators = async (emailList) => {

    try {

      setIndicatorLoading(true);
      setIndicatorError("");

      const results = await Promise.all(

        emailList.map(async (email) => {

          try {

            const response = await fetch(
              `${API_BASE}/api/emails/${email.id}/indicators`
            );

            if (!response.ok) {

              throw new Error(
                `Indicator request failed (${response.status})`
              );

            }

            const data =
              await response.json();

            return {

              emailId: email.id,

              indicators:
                data.indicators || [],

              error: null,

            };

          } catch (err) {

            console.error(
              `Indicator error for email ${email.id}:`,
              err
            );

            return {

              emailId: email.id,

              indicators: [],

              error: err.message,

            };

          }

        })

      );


      const indicatorMap = {};

      let failedRequests = 0;


      results.forEach((result) => {

        indicatorMap[result.emailId] =
          result.indicators;

        if (result.error) {
          failedRequests += 1;
        }

      });


      setIndicatorResults(
        indicatorMap
      );


      if (failedRequests > 0) {

        setIndicatorError(
          "Some email indicators could not be loaded."
        );

      }

    } catch (err) {

      console.error(
        "Indicator loading error:",
        err
      );

      setIndicatorError(
        err.message ||
        "Failed to load indicators."
      );

    } finally {

      setIndicatorLoading(false);

    }

  };


  /* =======================================================
     INITIAL EMAIL LOAD
  ======================================================= */

  useEffect(() => {

    loadEmails();

  }, []);


  /* =======================================================
     LOAD AUTH + INDICATORS
  ======================================================= */

  useEffect(() => {

    if (!loading) {

      if (emails.length > 0) {

        loadAuthentication(emails);

        loadIndicators(emails);

      } else {

        setAuthLoading(false);

        setIndicatorLoading(false);

      }

    }

  }, [loading, emails]);


  /* =======================================================
     OPEN EMAIL DETAILS
  ======================================================= */

  const openEmailDetails = (emailId) => {

    navigate(`/emails/${emailId}`);

  };


  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {

    return (

      <div className="loading-screen">

        <div>

          <h2>
            Loading Emails...
          </h2>

          <p>
            Fetching analyzed emails from the
            PhishTrace backend.
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     AUTHENTICATION STATISTICS
  ======================================================= */

  const authenticationList =
    Object.values(authResults);


  const authFailures =
    authenticationList.filter(
      (auth) =>
        auth &&
        (
          auth.spf_result === "fail" ||
          auth.dkim_result === "fail" ||
          auth.dmarc_result === "fail"
        )
    ).length;


  /* =======================================================
     INDICATOR STATISTICS
  ======================================================= */

  const allIndicators =
    Object.values(indicatorResults)
      .flat();


  const indicatorCount =
    allIndicators.length;


  const domainCount =
    allIndicators.filter(
      (indicator) =>
        indicator.indicator_type === "domain"
    ).length;


  const urlCount =
    allIndicators.filter(
      (indicator) =>
        indicator.indicator_type === "url"
    ).length;


  const ipCount =
    allIndicators.filter(
      (indicator) =>
        indicator.indicator_type === "ip"
    ).length;


  const hashCount =
    allIndicators.filter(
      (indicator) =>
        indicator.indicator_type === "hash"
    ).length;


  /* =======================================================
     PAGE
  ======================================================= */

  return (

    <div className="page">


      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>

          <h2>
            Emails
          </h2>

          <p>
            Phishing email analysis and authentication
            results
          </p>

        </div>


        <div className="case-badge">

          {emails.length} EMAIL
          {emails.length !== 1 ? "S" : ""}
          {" "}ANALYZED

        </div>

      </div>


      {/* =================================================
          GENERAL ERROR
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
          AUTH ERROR
      ================================================= */}

      {authError && (

        <div className="card-dark error-message">

          <strong>
            Authentication Warning
          </strong>

          <p>
            {authError}
          </p>

        </div>

      )}


      {/* =================================================
          INDICATOR ERROR
      ================================================= */}

      {indicatorError && (

        <div className="card-dark error-message">

          <strong>
            Indicator Warning
          </strong>

          <p>
            {indicatorError}
          </p>

        </div>

      )}


      {/* =================================================
          EMAIL STATISTICS
      ================================================= */}

      <div className="stats-grid">


        <div className="stat-card">

          <div className="stat-icon">
            ✉
          </div>

          <div>

            <div className="stat-value">
              {emails.length}
            </div>

            <div className="stat-label">
              Emails
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            ⚠
          </div>

          <div>

            <div className="stat-value">

              {
                authenticationList.filter(
                  (auth) =>
                    auth?.authentication_verdict ===
                    "suspicious"
                ).length
              }

            </div>

            <div className="stat-label">
              Suspicious
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            !
          </div>

          <div>

            <div className="stat-value">
              {authFailures}
            </div>

            <div className="stat-label">
              Auth Failures
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🔎
          </div>

          <div>

            <div className="stat-value">
              {indicatorCount}
            </div>

            <div className="stat-label">
              Indicators
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          NO EMAILS
      ================================================= */}

      {emails.length === 0 ? (

        <div className="card-dark empty-state">

          <h3>
            No emails found
          </h3>

          <p>
            There are currently no analyzed emails
            in the database.
          </p>

        </div>

      ) : (

        emails.map((email) => {

          const authentication =
            authResults[email.id] || null;


          const indicators =
            indicatorResults[email.id] || [];


          return (

            <div
              className="card-dark email-clickable-card"
              key={email.id}

              onClick={() =>
                openEmailDetails(email.id)
              }

              onKeyDown={(event) => {

                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {

                  event.preventDefault();

                  openEmailDetails(email.id);

                }

              }}

              role="button"
              tabIndex={0}

              title="Open email details"
            >


              {/* =================================================
                  EMAIL HEADER
              ================================================= */}

              <div className="section-header">

                <div>

                  <h3>
                    Analyzed Email
                  </h3>

                  <small>
                    Email ID {email.id}
                  </small>

                </div>


                <span className="severity critical">

                  SUSPICIOUS

                </span>

              </div>


              {/* =================================================
                  EMAIL INFORMATION
              ================================================= */}

              <div className="email-card">


                <div className="email-row">

                  <span>
                    Subject
                  </span>

                  <strong>
                    {email.subject || "N/A"}
                  </strong>

                </div>


                <div className="email-row">

                  <span>
                    Email ID
                  </span>

                  <strong>
                    {email.id}
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
                    Created
                  </span>

                  <strong>
                    {formatDate(email.created_at)}
                  </strong>

                </div>

              </div>


              {/* =================================================
                  RAW EMAIL
              ================================================= */}

              <div className="email-raw">

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


                <pre>
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

                      {formatResult(
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
                      Authentication results are not
                      available for this email.
                    </p>

                  </div>

                ) : (

                  <>

                    <div className="auth-grid">


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

                          {formatResult(
                            authentication.spf_result
                          )}

                        </div>

                      </div>


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

                          {formatResult(
                            authentication.dkim_result
                          )}

                        </div>

                      </div>


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

                          {formatResult(
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

                          {formatResult(
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

                          {formatResult(
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

                          {formatResult(
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
                      from the email
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

                              {formatResult(
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

                              {formatResult(
                                indicator.confidence
                              )}

                            </span>

                            <span className="status">

                              {formatResult(
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
                  INDICATOR SUMMARY
              ================================================= */}

              {indicators.length > 0 && (

                <div className="card-dark">

                  <div className="section-header">

                    <div>

                      <h3>
                        Indicator Summary
                      </h3>

                      <small>
                        Breakdown of extracted indicator
                        types
                      </small>

                    </div>

                  </div>


                  <div className="auth-grid">

                    <div className="auth-card">

                      <div className="auth-name">
                        Domains
                      </div>

                      <div className="auth-result">
                        {domainCount}
                      </div>

                    </div>


                    <div className="auth-card">

                      <div className="auth-name">
                        URLs
                      </div>

                      <div className="auth-result">
                        {urlCount}
                      </div>

                    </div>


                    <div className="auth-card">

                      <div className="auth-name">
                        IP Addresses
                      </div>

                      <div className="auth-result">
                        {ipCount}
                      </div>

                    </div>


                    <div className="auth-card">

                      <div className="auth-name">
                        Hashes
                      </div>

                      <div className="auth-result">
                        {hashCount}
                      </div>

                    </div>

                  </div>

                </div>

              )}

            </div>

          );

        })

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          Email Analysis
        </span>

      </footer>

    </div>

  );

}

export default Emails;