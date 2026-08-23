import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

function Cases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FILTER STATE
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================
  // LOAD CASES
  // =====================================================

  const loadCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/cases`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to load cases (${response.status})`
        );
      }

      setCases(data.cases || []);

    } catch (err) {
      console.error("Cases API error:", err);

      setError(
        err.message ||
          "Failed to load cases."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  // =====================================================
  // FILTER CASES
  // =====================================================

  const filteredCases = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return cases.filter((caseItem) => {

      const matchesSearch =
        !search ||
        String(caseItem.case_number || "")
          .toLowerCase()
          .includes(search) ||
        String(caseItem.title || "")
          .toLowerCase()
          .includes(search) ||
        String(caseItem.description || "")
          .toLowerCase()
          .includes(search);

      const matchesSeverity =
        severityFilter === "all" ||
        caseItem.severity === severityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        caseItem.status === statusFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });

  }, [
    cases,
    searchTerm,
    severityFilter,
    statusFilter,
  ]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSeverityFilter("all");
    setStatusFilter("all");
  };

  const filtersActive =
    searchTerm.trim() !== "" ||
    severityFilter !== "all" ||
    statusFilter !== "all";

  // =====================================================
  // VIEW CASE
  // =====================================================

  const viewCase = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  // =====================================================
  // CLOSE CASE
  // =====================================================

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
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to close case"
        );
      }

      await loadCases();

      alert(
        "Case closed successfully."
      );

    } catch (err) {
      console.error(
        "Close case error:",
        err
      );

      setError(
        err.message ||
          "Failed to close case."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div>

          <h2>
            Loading Cases...
          </h2>

          <p>
            Fetching investigations from the
            PhishTrace backend.
          </p>

        </div>
      </div>
    );
  }

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
            Cases
          </h2>

          <p>
            Phishing investigations and
            case management
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
          SEARCH & FILTERS
      ================================================= */}

      <div className="card-dark case-filters">

        <div className="section-header">

          <div>

            <h3>
              Search & Filter Cases
            </h3>

            <small>
              Find investigations by case details,
              severity, or status
            </small>

          </div>

          {filtersActive && (
            <button
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

        </div>

        <div className="case-filter-grid">

          {/* SEARCH */}

          <div className="filter-field filter-search">

            <label htmlFor="case-search">
              Search
            </label>

            <input
              id="case-search"
              type="text"
              placeholder="Case number, title, or description..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

          {/* SEVERITY */}

          <div className="filter-field">

            <label htmlFor="severity-filter">
              Severity
            </label>

            <select
              id="severity-filter"
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Severities
              </option>

              <option value="critical">
                Critical
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>

            </select>

          </div>

          {/* STATUS */}

          <div className="filter-field">

            <label htmlFor="status-filter">
              Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Statuses
              </option>

              <option value="open">
                Open
              </option>

              <option value="closed">
                Closed
              </option>

              <option value="investigating">
                Investigating
              </option>

              <option value="contained">
                Contained
              </option>

            </select>

          </div>

        </div>

      </div>

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

              {filtersActive
                ? `Showing ${filteredCases.length} of ${cases.length} cases`
                : "All PhishTrace investigations"}

            </small>

          </div>

          <small>

            {filteredCases.length} result
            {filteredCases.length !== 1
              ? "s"
              : ""}

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

        ) : filteredCases.length === 0 ? (

          <div className="empty-state">

            <h3>
              No matching cases
            </h3>

            <p>
              No investigation cases match your
              current search and filters.
            </p>

            <button
              className="secondary-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="cases-list">

            {filteredCases.map(
              (caseItem) => (

                <div
                  className="case-list-item"
                  key={caseItem.id}
                >

                  {/* CASE INFORMATION */}

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

                  {/* CASE STATUS */}

                  <div className="case-list-status">

                    <span
                      className={`severity ${
                        caseItem.severity ===
                        "critical"
                          ? "critical"
                          : ""
                      }`}
                    >
                      {upper(
                        caseItem.severity
                      )}
                    </span>

                    <span
                      className={`status ${
                        caseItem.status ===
                        "closed"
                          ? ""
                          : "case-open"
                      }`}
                    >
                      {upper(
                        caseItem.status
                      )}
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div className="case-list-actions">

                    <button
                      className="secondary-button"
                      onClick={() =>
                        viewCase(
                          caseItem.id
                        )
                      }
                    >
                      View Case
                    </button>

                    {caseItem.status !==
                      "closed" && (

                      <button
                        className="danger-button"
                        onClick={() =>
                          closeCase(
                            caseItem.id
                          )
                        }
                      >
                        Close
                      </button>

                    )}

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
          Case Management
        </span>

      </footer>

    </div>
  );
}

export default Cases;