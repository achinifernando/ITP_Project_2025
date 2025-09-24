import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../CSS/login.css";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateField = (name, value) => {
    let errMsg = "";

    if (name === "email") {
      if (!value.trim()) errMsg = "Email is required.";
      else if (!isValidEmail(value)) errMsg = "Please enter a valid email address.";
    }

    if (name === "password") {
      if (!value.trim()) errMsg = "Password is required.";
      else if (value.length < 8) errMsg = "Password must be at least 8 characters."; // ✅ Fixed
    }

    setError((prev) => ({ ...prev, [name]: errMsg }));
    return errMsg === "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError({});

    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/client/login", {
        email,
        password,
      });

      const { token, client } = response.data;
      const { password: _, ...safeClient } = client;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(safeClient));

      navigate("/home");
    } catch (err) {
      setError({ general: err.response?.data?.message || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-form">
        <h3 className="welcome">Welcome Back</h3>
        <p className="login-p">Please enter your details to log in</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              value={email}
              onChange={({ target }) => {
                setEmail(target.value);
                if (error.email) setError((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="john@example.com"
              type="email"
              required
            />
            {error.email && <div className="error-message">{error.email}</div>}
          </div>

          <div className="input-group">
            <input
              value={password}
              onChange={({ target }) => {
                setPassword(target.value);
                if (error.password) setError((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Min 8 characters"
              type="password"
              required
              minLength="8"
            />
            {error.password && <div className="error-message">{error.password}</div>}
          </div>

          {error.general && <div className="error-message">{error.general}</div>}

          <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>

          <p className="signup-link">
            Don’t have an account?{" "}
            <Link to="/signup" className="signup-text">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
