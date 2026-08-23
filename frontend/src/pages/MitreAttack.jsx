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
// MITRE ATT&CK COMPONENT
// =========================================================

function MitreAttack() {

  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // LOAD MITRE MAPPINGS
  // =========================================================

  useEffect(() => {

    const loadMitreMappings = async () => {

      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          `${API_BASE}/api/mitre`,
          {
            method: "GET",

            // IMPORTANT:
            // Sends the Flask authentication session cookie.
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
            Fetching technique mappings from the
            PhishTrace backend.
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


  const primaryTechnique =
    mappings.length > 0
      ? mappings[0].technique_id || "—"
      : "—";


  const primaryTactic =
    mappings.length > 0
      ? mappings[0].tactic || "—"
      : "—";


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
            MITRE ATT&CK
          </h2>

          <p>
            Attack technique mapping for the
            investigation
          </p>

        </div>


        <div className="case-badge">

          {mappingCount} TECHNIQUE
          {mappingCount !== 1 ? "S" : ""}

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
          SUMMARY STATS
      ================================================= */}

      <div className="stats-grid">


        {/* MAPPINGS */}

        <div className="stat-card">

          <div className="stat-icon">
            ⚔
          </div>

          <div>

            <div className="stat-value">
              {mappingCount}
            </div>

            <div className="stat-label">
              Mappings
            </div>

          </div>

        </div>


        {/* TECHNIQUE */}

        <div className="stat-card">

          <div className="stat-icon">
            →
          </div>

          <div>

            <div className="stat-value">
              {primaryTechnique}
            </div>

            <div className="stat-label">
              Technique
            </div>

          </div>

        </div>


        {/* TACTIC */}

        <div className="stat-card">

          <div className="stat-icon">
            ◉
          </div>

          <div>

            <div className="stat-value">
              {primaryTactic}
            </div>

            <div className="stat-label">
              Tactic
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          TECHNIQUE MAPPINGS
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Technique Mappings
            </h3>

            <small>
              MITRE ATT&CK classification
            </small>

          </div>


          <small>

            {techniques.length} unique technique
            {techniques.length !== 1
              ? "s"
              : ""}

          </small>

        </div>


        {/* EMPTY STATE */}

        {mappings.length === 0 ? (

          <div className="empty-state">

            <h3>
              No MITRE mappings found
            </h3>

            <p>
              No MITRE ATT&CK techniques have
              been mapped to the investigation
              yet.
            </p>

          </div>

        ) : (

          <div className="mitre-grid">

            {mappings.map(
              (mapping) => (

                <div
                  className="mitre-card clickable-card"

                  key={mapping.id}

                  onClick={() =>
                    navigate(
                      `/mitre/${mapping.id}`
                    )
                  }

                  role="button"

                  tabIndex={0}

                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {

                      event.preventDefault();

                      navigate(
                        `/mitre/${mapping.id}`
                      );

                    }

                  }}
                >


                  {/* TECHNIQUE ID */}

                  <div className="technique-id">

                    {mapping.technique_id ||
                      "Unknown"}

                  </div>


                  {/* TECHNIQUE NAME */}

                  <h4>

                    {mapping.technique_name ||
                      "Unknown Technique"}

                  </h4>


                  {/* TACTIC */}

                  <div className="tactic">

                    {mapping.tactic ||
                      "Tactic not specified"}

                  </div>


                  {/* DESCRIPTION */}

                  <p>

                    {mapping.description ||
                      "No technique description available."}

                  </p>


                  {/* EVIDENCE */}

                  {mapping.evidence && (

                    <div className="case-description">

                      <span>
                        Evidence
                      </span>

                      <p>
                        {typeof mapping.evidence === "object"
                          ? JSON.stringify(
                              mapping.evidence
                            )
                          : mapping.evidence}
                      </p>

                    </div>

                  )}


                  {/* TAGS */}

                  <div className="finding-tags">

                    <span className="tag">

                      {mapping.technique_id}

                    </span>


                    {mapping.tactic && (

                      <span className="tag">

                        {mapping.tactic}

                      </span>

                    )}

                  </div>


                  {/* MAPPING INFORMATION */}

                  <div className="case-list-meta">

                    <span>

                      Mapping ID: {mapping.id}

                    </span>


                    {mapping.finding_id && (

                      <span>

                        Finding ID:{" "}
                        {mapping.finding_id}

                      </span>

                    )}


                    {mapping.created_at && (

                      <span>

                        Created{" "}

                        {formatDate(
                          mapping.created_at
                        )}

                      </span>

                    )}

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

        <div className="card-dark">

          <div className="section-header">

            <div>

              <h3>
                ATT&CK Overview
              </h3>

              <small>
                Techniques identified in this
                investigation
              </small>

            </div>

          </div>


          <div className="case-detail-grid">


            <div>

              <span>
                Case
              </span>

              <strong>
                PH-2026-0001
              </strong>

            </div>


            <div>

              <span>
                Total Mappings
              </span>

              <strong>
                {mappingCount}
              </strong>

            </div>


            <div>

              <span>
                Unique Techniques
              </span>

              <strong>
                {techniques.length}
              </strong>

            </div>


            <div>

              <span>
                Tactics
              </span>

              <strong>
                {tactics.length}
              </strong>

            </div>

          </div>


          {/* TECHNIQUE LIST */}

          <div className="finding-tags">

            {techniques.map(
              (technique) => (

                <span
                  className="tag"
                  key={technique}
                >

                  {technique}

                </span>

              )
            )}

          </div>

        </div>

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