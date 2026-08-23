import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

const CASE_ID = 1;


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

function upper(value) {
  if (!value) {
    return "N/A";
  }

  return String(value)
    .replaceAll("_", " ")
    .toUpperCase();
}


// =========================================================
// CONTAINMENT ACTIONS
// =========================================================

function ContainmentActions() {

  const [actions, setActions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);


  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    action_type: "",
    target: "",
    status: "pending",
    performed_by: "",
    notes: "",
  });


  // =========================================================
  // LOAD ACTIONS
  // =========================================================

  const loadActions = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        `${API_BASE}/api/cases/${CASE_ID}/containment-actions`,
        {
          method: "GET",

          // IMPORTANT:
          // Sends Flask session cookie
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
          `Failed to load containment actions (${response.status})`
        );

      }


      setActions(
        data.containment_actions || []
      );


    } catch (err) {

      console.error(
        "Containment actions error:",
        err
      );


      setError(
        err.message ||
        "Failed to load containment actions."
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {

    loadActions();

  }, []);


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };


  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setFormData({

      action_type: "",

      target: "",

      status: "pending",

      performed_by: "",

      notes: "",

    });


    setEditingId(null);

    setShowForm(false);

  };


  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddForm = () => {

    setEditingId(null);

    setFormData({

      action_type: "",

      target: "",

      status: "pending",

      performed_by: "",

      notes: "",

    });

    setError("");

    setShowForm(true);

  };


  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!formData.action_type.trim()) {

      setError(
        "Action type is required."
      );

      return;

    }


    try {

      setSaving(true);

      setError("");


      const isEditing =
        editingId !== null;


      const url = isEditing

        ? `${API_BASE}/api/containment-actions/${editingId}`

        : `${API_BASE}/api/cases/${CASE_ID}/containment-actions`;


      const method = isEditing
        ? "PUT"
        : "POST";


      const response = await fetch(
        url,
        {
          method,

          // IMPORTANT:
          // Sends Flask session cookie
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({

            action_type:
              formData.action_type,

            target:
              formData.target || null,

            status:
              formData.status,

            performed_by:
              formData.performed_by || null,

            notes:
              formData.notes || null,

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          `Failed to save containment action (${response.status})`
        );

      }


      resetForm();


      await loadActions();


    } catch (err) {

      console.error(
        "Save containment action error:",
        err
      );


      setError(
        err.message ||
        "Failed to save containment action."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // EDIT ACTION
  // =========================================================

  const handleEdit = (action) => {

    setEditingId(action.id);


    setFormData({

      action_type:
        action.action_type || "",

      target:
        action.target || "",

      status:
        action.status || "pending",

      performed_by:
        action.performed_by || "",

      notes:
        action.notes || "",

    });


    setError("");

    setShowForm(true);


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  };


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
            Loading Containment Actions...
          </h2>

          <p>
            Fetching response actions from
            the PhishTrace backend.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  const pendingCount =
    actions.filter(
      (action) =>
        action.status === "pending"
    ).length;


  const inProgressCount =
    actions.filter(
      (action) =>
        action.status === "in_progress"
    ).length;


  const completedCount =
    actions.filter(
      (action) =>
        action.status === "completed"
    ).length;


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="page">


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="topbar">

        <div>

          <h2>
            Containment Actions
          </h2>

          <p>
            Security response actions for
            the investigation
          </p>

        </div>


        <div className="case-badge">

          {actions.length} ACTION
          {actions.length !== 1
            ? "S"
            : ""}

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

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


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="stats-grid">


        {/* PENDING */}

        <div className="stat-card">

          <div className="stat-icon">
            !
          </div>

          <div>

            <div className="stat-value">
              {pendingCount}
            </div>

            <div className="stat-label">
              Pending
            </div>

          </div>

        </div>


        {/* IN PROGRESS */}

        <div className="stat-card">

          <div className="stat-icon">
            →
          </div>

          <div>

            <div className="stat-value">
              {inProgressCount}
            </div>

            <div className="stat-label">
              In Progress
            </div>

          </div>

        </div>


        {/* COMPLETED */}

        <div className="stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>

            <div className="stat-value">
              {completedCount}
            </div>

            <div className="stat-label">
              Completed
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          RESPONSE ACTIONS
      ===================================================== */}

      <div className="card-dark">


        <div className="section-header">


          <div>

            <h3>
              Response Actions
            </h3>

            <small>
              Case PH-2026-0001
            </small>

          </div>


          <button
            type="button"
            className="primary-button"
            onClick={() => {

              if (showForm) {

                resetForm();

              } else {

                openAddForm();

              }

            }}
          >

            {showForm
              ? "Cancel"
              : "+ Add Action"}

          </button>


        </div>


        {/* ===================================================
            FORM
        =================================================== */}

        {showForm && (

          <form
            className="containment-form"
            onSubmit={handleSubmit}
          >


            {/* ACTION TYPE */}

            <div className="form-group">

              <label>
                Action Type
              </label>


              <select
                name="action_type"
                value={
                  formData.action_type
                }
                onChange={handleChange}
                required
              >

                <option value="">
                  Select action
                </option>


                <option value="disable_user_account">
                  Disable User Account
                </option>


                <option value="block_domain">
                  Block Malicious Domain
                </option>


                <option value="block_sender">
                  Block Sender
                </option>


                <option value="quarantine_email">
                  Quarantine Email
                </option>


                <option value="reset_password">
                  Reset Password
                </option>


                <option value="isolate_endpoint">
                  Isolate Endpoint
                </option>


                <option value="remove_email">
                  Remove Email
                </option>


                <option value="other">
                  Other
                </option>

              </select>

            </div>


            {/* TARGET */}

            <div className="form-group">

              <label>
                Target
              </label>


              <input
                type="text"
                name="target"
                value={
                  formData.target
                }
                onChange={handleChange}
                placeholder="e.g. micr0soft-support.com"
              />

            </div>


            {/* STATUS */}

            <div className="form-group">

              <label>
                Status
              </label>


              <select
                name="status"
                value={
                  formData.status
                }
                onChange={handleChange}
              >

                <option value="pending">
                  Pending
                </option>


                <option value="in_progress">
                  In Progress
                </option>


                <option value="completed">
                  Completed
                </option>

              </select>

            </div>


            {/* PERFORMED BY */}

            <div className="form-group">

              <label>
                Performed By
              </label>


              <input
                type="text"
                name="performed_by"
                value={
                  formData.performed_by
                }
                onChange={handleChange}
                placeholder="e.g. testadmin"
              />

            </div>


            {/* NOTES */}

            <div className="form-group">

              <label>
                Notes
              </label>


              <textarea
                name="notes"
                value={
                  formData.notes
                }
                onChange={handleChange}
                placeholder="Add investigation or response notes..."
                rows="4"
              />

            </div>


            {/* FORM BUTTONS */}

            <div className="form-actions">


              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Action"
                  : "Create Action"}

              </button>


              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
                disabled={saving}
              >

                Cancel

              </button>


            </div>


          </form>

        )}

      </div>


      {/* =====================================================
          ACTION LOG
      ===================================================== */}

      <div className="card-dark">


        <div className="section-header">


          <div>

            <h3>
              Containment Action Log
            </h3>

            <small>
              Actions performed during
              incident response
            </small>

          </div>


          <span>
            {actions.length} recorded
          </span>


        </div>


        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {actions.length === 0 ? (

          <div className="empty-state">

            <div className="stat-icon">
              ✓
            </div>


            <h3>
              No containment actions
            </h3>


            <p>
              No security response actions
              have been recorded for this
              case yet.
            </p>


            <button
              type="button"
              className="primary-button"
              onClick={openAddForm}
            >

              + Add First Action

            </button>

          </div>

        ) : (

          /* =================================================
             ACTION LIST
          ================================================= */

          <div className="containment-list">


            {actions.map((action) => (


              <div
                className="containment-card"
                key={action.id}
              >


                {/* INDICATOR */}

                <div className="finding-indicator">
                  !
                </div>


                <div className="finding-content">


                  {/* TITLE */}

                  <h5>
                    {upper(
                      action.action_type
                    )}
                  </h5>


                  {/* TARGET */}

                  <p>
                    {action.target ||
                      "No target specified"}
                  </p>


                  {/* TAGS */}

                  <div className="finding-tags">


                    <span className="tag severity-tag">

                      {upper(
                        action.status
                      )}

                    </span>


                    {action.performed_by && (

                      <span className="tag">

                        BY:{" "}
                        {action.performed_by}

                      </span>

                    )}

                  </div>


                  {/* NOTES */}

                  {action.notes && (

                    <div className="case-description">

                      <span>
                        Notes
                      </span>

                      <p>
                        {action.notes}
                      </p>

                    </div>

                  )}


                  {/* METADATA */}

                  <div className="case-list-meta">


                    <span>
                      Action ID: #{action.id}
                    </span>


                    <span>
                      Created:{" "}
                      {formatDate(
                        action.created_at
                      )}
                    </span>


                    {action.performed_at && (

                      <span>
                        Completed:{" "}
                        {formatDate(
                          action.performed_at
                        )}
                      </span>

                    )}

                  </div>


                  {/* EDIT */}

                  <div className="form-actions">

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        handleEdit(action)
                      }
                    >
                      Edit
                    </button>

                  </div>


                </div>

              </div>

            ))}


          </div>

        )}

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer>

        <span>
          PhishTrace SOC v1.0
        </span>

        <span>
          Containment & Response
        </span>

      </footer>


    </div>

  );

}


export default ContainmentActions;