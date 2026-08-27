import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InvestigationTimeline.css";

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

function getEventIcon(eventType) {
  const type = String(eventType || "").toLowerCase();

  if (type.includes("email")) return "✉";
  if (type.includes("finding")) return "⚠";
  if (type.includes("indicator")) return "⌁";
  if (type.includes("threat")) return "◉";
  if (type.includes("user")) return "♟";
  if (type.includes("containment")) return "✓";
  if (type.includes("mitre")) return "⚔";
  if (type.includes("case")) return "▣";

  return "●";
}

function InvestigationTimeline() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =================================================
     LOAD TIMELINE
  ================================================= */

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/cases/${caseId}/timeline`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to load investigation timeline (${response.status})`
        );
      }

      setTimelineData(data);
    } catch (err) {
      console.error("Timeline error:", err);

      setError(
        err.message ||
          "Failed to load investigation timeline."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [caseId]);

  /* =================================================
     LOADING
  ================================================= */

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <h2>Loading Investigation Timeline...</h2>

          <p>
            Building the chronological investigation
            history from the PhishTrace backend.
          </p>
        </div>
      </div>
    );
  }

  /* =================================================
     ERROR
  ================================================= */

  if (error) {
    return (
      <div className="error-screen">
        <div className="card-dark">
          <h2>Unable to Load Timeline</h2>

          <p>{error}</p>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate(`/cases/${caseId}`)
            }
          >
            ← Back to Case
          </button>
        </div>
      </div>
    );
  }

  if (!timelineData) {
    return null;
  }

  const caseData = timelineData.case || {};
  const timeline = timelineData.timeline || [];
  const eventCounts =
    timelineData.event_counts || {};

  /* =================================================
     PAGE
  ================================================= */

  return (
    <div className="page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="topbar">

        <div>
          <h2>
            Investigation Timeline
          </h2>

          <p>
            Chronological history of this
            investigation
          </p>
        </div>

        <div className="case-badge">
          {caseData.case_number ||
            `CASE-${caseId}`}
        </div>

      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="case-navigation-buttons">

        <button
          type="button"
          className="secondary-button back-button"
          onClick={() =>
            navigate(`/cases/${caseId}`)
          }
        >
          ← Back to Case
        </button>

        <button
          type="button"
          className="timeline-button"
          onClick={loadTimeline}
        >
          ↻ Refresh Timeline
        </button>

      </div>

      {/* =================================================
          CASE SUMMARY
      ================================================= */}

      <section className="card-dark timeline-case-header">

        <div className="small-label">
          {upper(caseData.status)} INVESTIGATION
        </div>

        <h1>
          {caseData.title ||
            "Case Investigation"}
        </h1>

        <p>
          {caseData.description ||
            "No case description available."}
        </p>

        <div className="case-meta">

          <span>
            Case ID:{" "}
            <strong>
              {caseData.case_number ||
                caseId}
            </strong>
          </span>

          <span>
            Total Events:{" "}
            <strong>
              {timelineData.count ??
                timeline.length}
            </strong>
          </span>

        </div>

      </section>

      {/* =================================================
          EVENT SUMMARY
      ================================================= */}

      <section className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Investigation Activity
            </h3>

            <small>
              Evidence and actions recorded
              throughout the investigation
            </small>
          </div>

          <small>
            {timeline.length} events
          </small>

        </div>

        <div className="timeline-summary-grid">

          {Object.entries(eventCounts).map(
            ([type, count]) => (
              <div
                className="timeline-summary-card"
                key={type}
              >
                <div className="timeline-summary-value">
                  {count}
                </div>

                <div className="timeline-summary-label">
                  {upper(type)}
                </div>
              </div>
            )
          )}

        </div>

      </section>

      {/* =================================================
          TIMELINE
      ================================================= */}

      <section className="card-dark">

        <div className="section-header">

          <div>
            <h3>
              Timeline
            </h3>

            <small>
              Events are displayed in
              chronological order
            </small>
          </div>

        </div>

        {timeline.length ? (

          <div className="investigation-timeline">

            {timeline.map(
              (event, index) => {

                const eventDate =
                  event.timestamp ||
                  event.created_at ||
                  event.event_time ||
                  event.occurred_at ||
                  event.date;

                return (
                  <div
                    className="timeline-event"
                    key={
                      event.id ||
                      `${event.event_type}-${index}`
                    }
                  >

                    <div className="timeline-line">

                      <div className="timeline-dot">
                        {getEventIcon(
                          event.event_type
                        )}
                      </div>

                    </div>

                    <div className="timeline-content">

                      <div className="timeline-event-header">

                        <div>
                          <span className="timeline-event-type">
                            {upper(
                              event.event_type ||
                              "event"
                            )}
                          </span>

                          <h4>
                            {event.title ||
                              event.name ||
                              upper(
                                event.event_type ||
                                "Investigation Event"
                              )}
                          </h4>
                        </div>

                        <time>
                          {formatDate(
                            eventDate
                          )}
                        </time>

                      </div>

                      <p>
                        {event.description ||
                          event.message ||
                          "No description available."}
                      </p>

                      {event.metadata &&
                        Object.keys(
                          event.metadata
                        ).length > 0 && (

                        <div className="timeline-metadata">

                          {Object.entries(
                            event.metadata
                          ).map(
                            ([key, value]) => (
                              <div
                                className="timeline-metadata-item"
                                key={key}
                              >
                                <span>
                                  {upper(key)}
                                </span>

                                <strong>
                                  {typeof value ===
                                  "object"
                                    ? JSON.stringify(
                                        value
                                      )
                                    : String(
                                        value
                                      )}
                                </strong>
                              </div>
                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="empty-state">
            No timeline events found for this
            investigation.
          </div>

        )}

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          Investigation Timeline
        </span>

      </footer>

    </div>
  );
}

export default InvestigationTimeline;