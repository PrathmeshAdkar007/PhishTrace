import { useState } from "react";


const API_BASE = "http://localhost:5000";


function Login({ onLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  // =================================================
  // LOGIN
  // =================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response = await fetch(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.error || "Login failed"
        );

        return;
      }


      // ---------------------------------------------
      // Login successful
      // ---------------------------------------------

      if (data.user) {

        onLogin(data.user);

      } else {

        setError(
          "Login succeeded but user information was not returned."
        );

      }


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to connect to the PhishTrace backend."
      );


    } finally {

      setLoading(false);

    }

  };


  // =================================================
  // PAGE
  // =================================================

  return (

    <div className="login-page">


      <div className="login-card">


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="login-brand">

          <div className="brand-icon">
            P
          </div>


          <h1>
            PhishTrace
          </h1>


          <p>
            Security Operations
          </p>

        </div>



        {/* =================================================
            LOGIN HEADER
        ================================================= */}

        <div className="login-header">

          <h2>
            Analyst Login
          </h2>


          <p>
            Sign in to access the SOC dashboard
          </p>

        </div>



        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="login-error">

            {error}

          </div>

        )}



        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>


          {/* USERNAME */}

          <div className="form-group">

            <label>
              Username
            </label>


            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              required
              autoComplete="username"
              disabled={loading}
            />

          </div>



          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>


            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              required
              autoComplete="current-password"
              disabled={loading}
            />

          </div>



          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>


        </form>


      </div>


    </div>

  );

}


export default Login;