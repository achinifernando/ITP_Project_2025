import React, { useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import "../../CSS/TaskManagerCSS/Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../components/context/userContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset error
    setError("");

    // Validate inputs
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Login API call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, role, ...userData } = response.data;

      if (token) {
        localStorage.setItem("token", token);

        // Update user context with the full user data
        if (updateUser) {
          updateUser({ ...userData, token, role });
        }

        // Redirect based on role (expanded for all roles)
        switch (role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "hr_manager":
            navigate("/attendance/dashboard");
            break;
          case "company_manager":
            navigate("/company-manager-dashboard");
            break;
          case "inventory_manager":
            navigate("/inventoryDashboard");
            break;
          case "dispatch_manager":
            navigate("/dispatchDashboard");
            break;
          case "member":
          case "employee":
            navigate("/user/dashboard");
            break;
          default:
            navigate("/login");
            setError("Unknown user role. Please contact administrator.");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
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
                if (error) setError(""); // Clear error when typing
              }}
              placeholder="john@example.com"
              type="email"
              required
            />
          </div>

          <div className="input-group">
            <input
              value={password}
              onChange={({ target }) => {
                setPassword(target.value);
                if (error) setError(""); // Clear error when typing
              }}
              placeholder="Min 8 characters"
              type="password"
              required
              minLength="8"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? "loading" : ""}
          >
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>

          <p className="signup-link">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-text">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
