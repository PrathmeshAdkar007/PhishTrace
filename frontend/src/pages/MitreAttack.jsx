import { useEffect, useState } from "react";

function MitreAttack() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Current investigation case
  const CASE_ID = 1;

  /* =========================
     LOAD MITRE MAPPINGS
  ========================= */

  const loadMitreMappings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:5000/api/cases/${CASE_ID}/summary`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load MITRE mappings (${response.status})`
        );
      }

      const data = await response.json();

      setMappings(data.mitre_mappings || []);
    } catch (err) {
      console.error("MITRE ATT&CK API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMitreMappings();
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <h2>Loading MITRE ATT&CK...</h2>

          <p>
            Fetching technique mappings from the
            PhishTrace backend.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     CALCULATED VALUES
  ========================= */

  const mappingCount = mappings.length;

  const techniques = [
    ...new Set(
      mappings
        .map((mapping) => mapping.technique_id)
        .filter(Boolean)
    ),
  ];

  const tactics = [
    ...new Set(
      mappings
        .map((mapping) => mapping.tactic)
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

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="page">

      {/* =========================
          TOP BAR
      ========================= */}

      <div className="topbar">

        <div>
          <h2>
            MITRE ATT&CK
          </h2>

          <p>
            Attack technique mapping for the investigation
          </p>
        </div>

        <div className="case-badge">
          {mappingCount} TECHNIQUE
          {mappingCount !== 1 ? "S" : ""}
        </div>

      </div>


      {/* =========================
          ERROR
      ========================= */}

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


      {/* =========================
          SUMMARY
      ========================= */}

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


      {/* =========================
          TECHNIQUE MAPPINGS
      ========================= */}

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
            {techniques.length !== 1 ? "s" : ""}
          </small>

        </div>


        {/* EMPTY STATE */}

        {mappings.length === 0 ? (

          <div className="empty-state">

            <h3>
              No MITRE mappings found
            </h3>

            <p>
              No MITRE ATT&CK techniques have been
              mapped to the findings for this case yet.
            </p>

          </div>

        ) : (

          <div className="mitre-grid">

            {mappings.map((mapping) => (

              <div
                className="mitre-card"
                key={mapping.id}
              >

                {/* TECHNIQUE ID */}

                <div className="technique-id">
                  {mapping.technique_id || "Unknown"}
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
                      {typeof mapping.evidence ===
                      "string"
                        ? mapping.evidence
                        : JSON.stringify(
                            mapping.evidence
                          )}
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
                      Finding ID: {mapping.finding_id}
                    </span>
                  )}

                  {mapping.created_at && (
                    <span>
                      Created{" "}
                      {new Date(
                        mapping.created_at
                      ).toLocaleString()}
                    </span>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* =========================
          ATT&CK OVERVIEW
      ========================= */}

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

            {techniques.map((technique) => (

              <span
                className="tag"
                key={technique}
              >
                {technique}
              </span>

            ))}

          </div>

        </div>

      )}


      {/* =========================
          FOOTER
      ========================= */}

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