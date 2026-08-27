import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";


// =========================================================
// FORMAT DATE
// =========================================================

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


// =========================================================
// FORMAT TEXT
// =========================================================

function formatLabel(value) {

  if (!value) {
    return "Not specified";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


// =========================================================
// MITRE ATT&CK COMPONENT
// =========================================================

function MitreAttack() {

  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // LOAD MITRE MAPPINGS
  // =========================================================

  const loadMitreMappings =
    async () => {

      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          `${API_BASE}/api/mitre`,
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
            `Failed to load MITRE mappings (${response.status})`
          );

        }


        setMappings(
          data.mappings || []
        );


      } catch (err) {

        console.error(
          "MITRE ATT&CK API error:",
          err
        );


        setError(
          err.message ||
          "Failed to load MITRE ATT&CK mappings."
        );


      } finally {

        setLoading(false);

      }

    };


  // =========================================================
  // LOAD ON PAGE OPEN
  // =========================================================

  useEffect(() => {

    loadMitreMappings();

  }, []);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="loading-screen">

        <div>

          <div className="brand-icon">
            P
          </div>

          <h2>
            Loading MITRE ATT&CK...
          </h2>

          <p>
            Fetching attack technique mappings
            from the PhishTrace backend.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // CALCULATED VALUES
  // =========================================================

  const mappingCount =
    mappings.length;


  const techniques = [

    ...new Set(

      mappings
        .map(
          (mapping) =>
            mapping.technique_id
        )
        .filter(Boolean)

    ),

  ];


  const tactics = [

    ...new Set(

      mappings
        .map(
          (mapping) =>
            mapping.tactic
        )
        .filter(Boolean)

    ),

  ];


  const evidenceCount =
    mappings.filter(
      (mapping) =>
        mapping.evidence
    ).length;


  const primaryMapping =
    mappings.length > 0
      ? mappings[0]
      : null;


  const primaryTechnique =
    primaryMapping?.technique_id ||
    "—";


  const primaryTactic =
    primaryMapping?.tactic ||
    "—";


  // =========================================================
  // OPEN MAPPING
  // =========================================================

  const openMapping =
    (mappingId) => {

      navigate(
        `/mitre/${mappingId}`
      );

    };


  // =========================================================
  // KEYBOARD NAVIGATION
  // =========================================================

  const handleKeyDown =
    (event, mappingId) => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openMapping(mappingId);

      }

    };


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="page mitre-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="topbar">

        <div>

          <div className="page-kicker">
            ATTACK ANALYSIS
          </div>

          <h2>
            MITRE ATT&CK
          </h2>

          <p>
            Map observed attacker behaviour
            to tactics, techniques, and
            supporting investigation evidence.
          </p>

        </div>


        <div className="case-badge">

          {mappingCount} MAPPING
          {mappingCount !== 1
            ? "S"
            : ""}

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="card-dark error-message">

          <div>

            <strong>
              Unable to load MITRE ATT&CK
            </strong>

            <p>
              {error}
            </p>

          </div>


          <button
            type="button"
            className="secondary-button"
            onClick={loadMitreMappings}
          >
            Retry
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      {!error && (

        <>


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="mitre-summary-grid">


            <div className="mitre-summary-card">

              <div className="summary-icon">
                ◎
              </div>

              <div>

                <strong>
                  {mappingCount}
                </strong>

                <span>
                  Total Mappings
                </span>

              </div>

            </div>


            <div className="mitre-summary-card">

              <div className="summary-icon">
                ⌘
              </div>

              <div>

                <strong>
                  {techniques.length}
                </strong>

                <span>
                  Unique Techniques
                </span>

              </div>

            </div>


            <div className="mitre-summary-card">

              <div className="summary-icon">
                ◈
              </div>

              <div>

                <strong>
                  {tactics.length}
                </strong>

                <span>
                  ATT&CK Tactics
                </span>

              </div>

            </div>


            <div className="mitre-summary-card">

              <div className="summary-icon">
                ✓
              </div>

              <div>

                <strong>
                  {evidenceCount}
                </strong>

                <span>
                  Evidence Supported
                </span>

              </div>

            </div>


          </div>


          {/* =================================================
              ATTACK PATH OVERVIEW
          ================================================= */}

          {mappings.length > 0 && (

            <div className="card-dark mitre-path-card">


              <div className="section-header">

                <div>

                  <h3>
                    Observed Attack Path
                  </h3>

                  <small>
                    Primary MITRE ATT&CK behaviour
                    identified during the investigation
                  </small>

                </div>

              </div>


              <div className="mitre-attack-flow">


                <div className="attack-flow-step">

                  <span>
                    TACTIC
                  </span>

                  <strong>
                    {formatLabel(
                      primaryTactic
                    )}
                  </strong>

                </div>


                <div className="attack-flow-arrow">
                  →
                </div>


                <div className="attack-flow-step">

                  <span>
                    TECHNIQUE
                  </span>

                  <strong>
                    {primaryTechnique}
                  </strong>

                </div>


                <div className="attack-flow-arrow">
                  →
                </div>


                <div className="attack-flow-step">

                  <span>
                    EVIDENCE
                  </span>

                  <strong>
                    {primaryMapping?.evidence
                      ? "Supported"
                      : "Recorded"}
                  </strong>

                </div>


              </div>


              {primaryMapping?.technique_name && (

                <div className="primary-technique-name">

                  <span>
                    PRIMARY TECHNIQUE
                  </span>

                  <h4>
                    {
                      primaryMapping.technique_name
                    }
                  </h4>

                </div>

              )}


            </div>

          )}


          {/* =================================================
              TECHNIQUE MAPPINGS
          ================================================= */}

          <div className="card-dark mitre-mappings-section">


            <div className="section-header">

              <div>

                <h3>
                  Technique Mappings
                </h3>

                <small>
                  MITRE ATT&CK classifications
                  identified from investigation findings
                </small>

              </div>


              <small className="section-count">

                {mappingCount} mapping
                {mappingCount !== 1
                  ? "s"
                  : ""}

              </small>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {mappings.length === 0 ? (

              <div className="empty-state mitre-empty-state">

                <div className="empty-state-icon">
                  ◌
                </div>

                <h3>
                  No MITRE mappings found
                </h3>

                <p>
                  No MITRE ATT&CK techniques
                  have been mapped to the
                  investigation yet.
                </p>

              </div>

            ) : (

              <div className="mitre-mapping-list">


                {mappings.map(
                  (mapping) => (

                    <div
                      className="mitre-mapping-card clickable-card"
                      key={mapping.id}
                      onClick={() =>
                        openMapping(
                          mapping.id
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) =>
                        handleKeyDown(
                          event,
                          mapping.id
                        )
                      }
                      title="Open MITRE mapping details"
                    >


                      {/* LEFT INDICATOR */}

                      <div className="mitre-card-indicator">

                        <span>
                          {mapping.evidence
                            ? "✓"
                            : "•"}
                        </span>

                      </div>


                      {/* MAIN CONTENT */}

                      <div className="mitre-card-content">


                        <div className="mitre-card-topline">

                          <div className="technique-id">

                            {
                              mapping.technique_id ||
                              "Unknown"
                            }

                          </div>


                          <div className="tactic">

                            {
                              formatLabel(
                                mapping.tactic
                              )
                            }

                          </div>

                        </div>


                        <h4>

                          {
                            mapping.technique_name ||
                            "Unknown Technique"
                          }

                        </h4>


                        <p className="mitre-description">

                          {
                            mapping.description ||
                            "No technique description available."
                          }

                        </p>


                        {/* EVIDENCE */}

                        {mapping.evidence && (

                          <div className="mitre-evidence">

                            <span className="mitre-evidence-label">
                              SUPPORTING EVIDENCE
                            </span>

                            <p>
                              {mapping.evidence}
                            </p>

                          </div>

                        )}


                        {/* META */}

                        <div className="mitre-card-meta">


                          <span>

                            Mapping ID:{" "}

                            <strong>
                              {mapping.id}
                            </strong>

                          </span>


                          {mapping.finding_id && (

                            <span>

                              Finding:{" "}

                              <strong>
                                {mapping.finding_id}
                              </strong>

                            </span>

                          )}


                          {mapping.created_at && (

                            <span>

                              Mapped:{" "}

                              <strong>

                                {
                                  formatDate(
                                    mapping.created_at
                                  )
                                }

                              </strong>

                            </span>

                          )}


                        </div>


                      </div>


                      {/* OPEN ARROW */}

                      <div className="mitre-card-action">

                        <span>
                          →
                        </span>

                        <small>
                          View details
                        </small>

                      </div>


                    </div>

                  )
                )}


              </div>

            )}


          </div>


          {/* =================================================
              ATT&CK OVERVIEW
          ================================================= */}

          {mappings.length > 0 && (

            <div className="card-dark mitre-overview-card">


              <div className="section-header">

                <div>

                  <h3>
                    ATT&CK Overview
                  </h3>

                  <small>
                    Techniques and tactics
                    identified in this investigation
                  </small>

                </div>

              </div>


              <div className="mitre-overview-grid">


                <div className="mitre-overview-stat">

                  <span>
                    Total Mappings
                  </span>

                  <strong>
                    {mappingCount}
                  </strong>

                </div>


                <div className="mitre-overview-stat">

                  <span>
                    Unique Techniques
                  </span>

                  <strong>
                    {techniques.length}
                  </strong>

                </div>


                <div className="mitre-overview-stat">

                  <span>
                    Tactics Observed
                  </span>

                  <strong>
                    {tactics.length}
                  </strong>

                </div>


                <div className="mitre-overview-stat">

                  <span>
                    Evidence Supported
                  </span>

                  <strong>
                    {evidenceCount}
                  </strong>

                </div>


              </div>


              {/* =================================================
                  TACTICS
              ================================================= */}

              {tactics.length > 0 && (

                <div className="mitre-tag-section">

                  <span className="mitre-group-label">
                    OBSERVED TACTICS
                  </span>


                  <div className="finding-tags">

                    {tactics.map(
                      (tactic) => (

                        <span
                          className="tag mitre-tactic-tag"
                          key={tactic}
                        >

                          {
                            formatLabel(
                              tactic
                            )
                          }

                        </span>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* =================================================
                  TECHNIQUES
              ================================================= */}

              {techniques.length > 0 && (

                <div className="mitre-tag-section">

                  <span className="mitre-group-label">
                    OBSERVED TECHNIQUES
                  </span>


                  <div className="finding-tags">

                    {techniques.map(
                      (technique) => (

                        <span
                          className="tag mitre-technique-tag"
                          key={technique}
                        >

                          {technique}

                        </span>

                      )
                    )}

                  </div>

                </div>

              )}


            </div>

          )}


        </>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          MITRE ATT&CK Mapping
        </span>

      </footer>


    </div>

  );

}


export default MitreAttack;