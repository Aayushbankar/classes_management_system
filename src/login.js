import React, { useState, useEffect } from "react";
import "./login.css";
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-body');
    return () => document.body.classList.remove('login-body');
  }, []);


  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store tokens in localStorage
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        setError("");
        navigate("/app/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      setError("Connection error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* Watermark */}
      <img src={logo} alt="watermark" className="watermark" />

      <form className="login-card" onSubmit={handleSubmit}>

        {/* Logo Top */}
        <img src={logo} alt="logo" className="top-logo" />

        <h2>Eklavya Classes</h2>

        {error && <div className="error-box">{error}</div>}

        {/* Username */}
        <div className="input-box">
          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="input-box">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
          <span onClick={() => setShowPassword(!showPassword)}>👁</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;