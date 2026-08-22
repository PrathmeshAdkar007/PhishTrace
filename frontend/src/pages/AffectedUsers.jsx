import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

const CASE_ID = 1;


function upper(value) {

  if (!value) {
    return "UNKNOWN";
  }

  return String(value)
    .replaceAll("_", " ")
    .toUpperCase();

}


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


function AffectedUsers() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [saving, setSaving] = useState(false);


  const [form, setForm] = useState({
    user_email: "",
    display_name: "",
    department: "",
    received_email: false,
    clicked_link: false,
    submitted_credentials: false,
    account_compromised: false,
    impact_status: "unknown",
    notes: "",
  });


  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_BASE}/api/cases/${CASE_ID}/affected-users`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to load affected users."
        );

      }

      setUsers(
        data.affected_users || []
      );

    } catch (err) {

      console.error(
        "Affected users error:",
        err
      );

      setError(
        err.message ||
        "Failed to load affected users."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadUsers();

  }, []);


  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

  };


  const resetForm = () => {

    setForm({
      user_email: "",
      display_name: "",
      department: "",
      received_email: false,
      clicked_link: false,
      submitted_credentials: false,
      account_compromised: false,
      impact_status: "unknown",
      notes: "",
    });

    setEditingUser(null);

  };


  const openAddForm = () => {

    resetForm();

    setShowForm(true);

  };


  const openEditForm = (user) => {

    setEditingUser(user);

    setForm({
      user_email:
        user.user_email || "",

      display_name:
        user.display_name || "",

      department:
        user.department || "",

      received_email:
        Boolean(user.received_email),

      clicked_link:
        Boolean(user.clicked_link),

      submitted_credentials:
        Boolean(
          user.submitted_credentials
        ),

      account_compromised:
        Boolean(
          user.account_compromised
        ),

      impact_status:
        user.impact_status ||
        "unknown",

      notes:
        user.notes || "",
    });

    setShowForm(true);

  };


  const closeForm = () => {

    setShowForm(false);

    resetForm();

  };


  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setSaving(true);

      setError("");

      let response;


      if (editingUser) {

        response = await fetch(
          `${API_BASE}/api/affected-users/${editingUser.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify(form),
          }
        );

      } else {

        response = await fetch(
          `${API_BASE}/api/cases/${CASE_ID}/affected-users`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify(form),
          }
        );

      }


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to save affected user."
        );

      }


      closeForm();

      await loadUsers();

    } catch (err) {

      console.error(
        "Save affected user error:",
        err
      );

      setError(
        err.message ||
        "Failed to save affected user."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="loading-screen">

        <div>

          <h2>
            Loading Affected Users...
          </h2>

          <p>
            Fetching affected users from
            the PhishTrace backend.
          </p>

        </div>

      </div>
    );

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  const compromisedUsers =
    users.filter(
      (user) =>
        user.account_compromised
    );

  const clickedUsers =
    users.filter(
      (user) =>
        user.clicked_link
    );

  const credentialUsers =
    users.filter(
      (user) =>
        user.submitted_credentials
    );

  const highImpactUsers =
    users.filter(
      (user) =>
        ["high", "critical"].includes(
          String(
            user.impact_status || ""
          ).toLowerCase()
        )
    );


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
            Affected Users
          </h2>

          <p>
            Users associated with the
            phishing investigation
          </p>

        </div>


        <div className="case-badge">

          {users.length} USER
          {users.length !== 1
            ? "S"
            : ""}

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
          ACTION BAR
      ================================================= */}

      <div className="page-actions">

        <button
          type="button"
          className="dashboard-action-button"
          onClick={openAddForm}
        >
          + Add Affected User
        </button>


        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            navigate("/")
          }
        >
          ← Dashboard
        </button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">


        <div className="stat-card">

          <div className="stat-icon">
            ♟
          </div>

          <div>

            <div className="stat-value">
              {users.length}
            </div>

            <div className="stat-label">
              Affected Users
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            !
          </div>

          <div>

            <div className="stat-value">
              {clickedUsers.length}
            </div>

            <div className="stat-label">
              Clicked Link
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            #
          </div>

          <div>

            <div className="stat-value">
              {credentialUsers.length}
            </div>

            <div className="stat-label">
              Credentials Submitted
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            ⚠
          </div>

          <div>

            <div className="stat-value">
              {compromisedUsers.length}
            </div>

            <div className="stat-label">
              Accounts Compromised
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      {showForm && (

        <div className="card-dark">

          <div className="section-header">

            <div>

              <h3>

                {editingUser
                  ? "Edit Affected User"
                  : "Add Affected User"}

              </h3>

              <small>
                Record user impact from
                the investigation
              </small>

            </div>

          </div>


          <form
            className="affected-user-form"
            onSubmit={handleSubmit}
          >


            {/* EMAIL */}

            <div className="form-group">

              <label>
                User Email *
              </label>

              <input
                type="email"
                name="user_email"
                value={form.user_email}
                onChange={handleChange}
                required
                placeholder="user@company.com"
              />

            </div>


            {/* NAME */}

            <div className="form-group">

              <label>
                Display Name
              </label>

              <input
                type="text"
                name="display_name"
                value={form.display_name}
                onChange={handleChange}
                placeholder="John Smith"
              />

            </div>


            {/* DEPARTMENT */}

            <div className="form-group">

              <label>
                Department
              </label>

              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Finance"
              />

            </div>


            {/* IMPACT STATUS */}

            <div className="form-group">

              <label>
                Impact Status
              </label>

              <select
                name="impact_status"
                value={form.impact_status}
                onChange={handleChange}
              >

                <option value="unknown">
                  Unknown
                </option>

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>

              </select>

            </div>


            {/* CHECKBOXES */}

            <div className="checkbox-grid">


              <label className="checkbox-item">

                <input
                  type="checkbox"
                  name="received_email"
                  checked={
                    form.received_email
                  }
                  onChange={handleChange}
                />

                <span>
                  Received phishing email
                </span>

              </label>


              <label className="checkbox-item">

                <input
                  type="checkbox"
                  name="clicked_link"
                  checked={
                    form.clicked_link
                  }
                  onChange={handleChange}
                />

                <span>
                  Clicked link
                </span>

              </label>


              <label className="checkbox-item">

                <input
                  type="checkbox"
                  name="submitted_credentials"
                  checked={
                    form.submitted_credentials
                  }
                  onChange={handleChange}
                />

                <span>
                  Submitted credentials
                </span>

              </label>


              <label className="checkbox-item">

                <input
                  type="checkbox"
                  name="account_compromised"
                  checked={
                    form.account_compromised
                  }
                  onChange={handleChange}
                />

                <span>
                  Account compromised
                </span>

              </label>

            </div>


            {/* NOTES */}

            <div className="form-group form-full">

              <label>
                Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Add investigation notes..."
              />

            </div>


            {/* BUTTONS */}

            <div className="form-actions">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingUser
                  ? "Update User"
                  : "Add User"}

              </button>


              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =================================================
          USERS
      ================================================= */}

      <div className="card-dark">

        <div className="section-header">

          <div>

            <h3>
              Investigation Users
            </h3>

            <small>
              Users affected by this case
            </small>

          </div>


          <span>
            {users.length} recorded
          </span>

        </div>


        {users.length === 0 ? (

          <div className="empty-state">

            <h3>
              No affected users
            </h3>

            <p>
              No users have been recorded
              for this investigation yet.
            </p>

            <button
              type="button"
              className="dashboard-action-button"
              onClick={openAddForm}
            >
              + Add First User
            </button>

          </div>

        ) : (

          <div className="affected-users-grid">

            {users.map((user) => (

              <div
                className="affected-user-card"
                key={user.id}
              >


                {/* HEADER */}

                <div className="affected-user-header">

                  <div className="user-avatar">
                    ♟
                  </div>


                  <div>

                    <h4>

                      {user.display_name ||
                        "Unnamed User"}

                    </h4>

                    <p>

                      {user.user_email}

                    </p>

                  </div>

                </div>


                {/* STATUS */}

                <div className="user-status-row">

                  <span className="tag">

                    {upper(
                      user.impact_status
                    )}

                  </span>


                  {user.account_compromised && (

                    <span className="tag severity-tag">

                      COMPROMISED

                    </span>

                  )}

                </div>


                {/* DETAILS */}

                <div className="user-details">

                  <div>

                    <span>
                      Department
                    </span>

                    <strong>
                      {user.department ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Received Email
                    </span>

                    <strong>

                      {user.received_email
                        ? "YES"
                        : "NO"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Clicked Link
                    </span>

                    <strong>

                      {user.clicked_link
                        ? "YES"
                        : "NO"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Credentials
                    </span>

                    <strong>

                      {user.submitted_credentials
                        ? "YES"
                        : "NO"}

                    </strong>

                  </div>

                </div>


                {/* NOTES */}

                {user.notes && (

                  <div className="user-notes">

                    <span>
                      Notes
                    </span>

                    <p>
                      {user.notes}
                    </p>

                  </div>

                )}


                {/* DATES */}

                <div className="case-list-meta">

                  <span>
                    First seen:{" "}
                    {formatDate(
                      user.first_seen
                    )}
                  </span>

                  <span>
                    Last seen:{" "}
                    {formatDate(
                      user.last_seen
                    )}
                  </span>

                </div>


                {/* ACTION */}

                <div className="user-card-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      openEditForm(user)
                    }
                  >
                    Edit
                  </button>

                </div>

              </div>

            ))}

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
          Affected User Management
        </span>

      </footer>

    </div>

  );

}


export default AffectedUsers;