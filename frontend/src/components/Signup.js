import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../CSS/signup.css";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
const [profilePic, setProfilePic] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      let fieldError = "";

      switch (name) {
        case "firstName":
        case "lastName":
        case "phone":
        case "companyName":
          if (!value.trim()) fieldError = "This field is required";
          break;
        case "email":
          if (!isValidEmail(value)) fieldError = "Invalid email address";
          break;
        case "password":
          if (value.length < 8) fieldError = "Password must be at least 8 characters";
          break;
        case "confirmPassword":
          if (value !== updatedData.password) fieldError = "Passwords do not match";
          break;
        default:
          break;
      }

      setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldError }));
      return updatedData;
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    const allErrors = {};
    ["firstName", "lastName", "phone", "companyName", "email", "password", "confirmPassword"].forEach((field) => {
      if (!formData[field].trim()) allErrors[field] = "Required";
    });
    if (formData.password !== formData.confirmPassword) allErrors.confirmPassword = "Passwords do not match";
    if (!isValidEmail(formData.email)) allErrors.email = "Invalid email";

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.companyName,
      };

      const response = await axios.post(
        "http://localhost:5000/client/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      alert(response.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response || err.message);
      setErrors({ submit: err.response?.data?.message || "Registration failed" });
    }
  };

  return (
<AuthLayout>
    <div className="register-main">
      <div className="register-right">
        <div className="register-right-container">

          <div className="register-center">
            <h2>Create an account</h2>
            <p>Sign up to get started</p>
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <form onSubmit={handleSubmit}>
            <input type="text" name="firstName" placeholder="First Name"
              value={formData.firstName} onChange={handleChange} />
            {errors.firstName && <span className="error">{errors.firstName}</span>}

            <input type="text" name="lastName" placeholder="Last Name"
              value={formData.lastName} onChange={handleChange} />
            {errors.lastName && <span className="error">{errors.lastName}</span>}

            <input type="text" name="phone" placeholder="Phone Number"
              value={formData.phone} onChange={handleChange} />
            {errors.phone && <span className="error">{errors.phone}</span>}

            <input type="text" name="companyName" placeholder="Company Name"
              value={formData.companyName} onChange={handleChange} />
            {errors.companyName && <span className="error">{errors.companyName}</span>}

            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}

            <input type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange} />
            {errors.password && <span className="error">{errors.password}</span>}

            <input type="password" name="confirmPassword" placeholder="Confirm Password"
              value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

            <button type="submit">Submit</button>
          </form>

          <p className="register-bottom-p">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
    </AuthLayout>
  );
}
