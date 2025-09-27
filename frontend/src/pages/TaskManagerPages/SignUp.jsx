import React, { useState, useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import ProfilePhotoSelector from "../../components/inputs/ProfilePhotoSelector";
import "../../CSS/TaskManagerCSS/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../components/context/userContext";

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateContactNumber = (number) => {
    return /^[0-9]{10}$/.test(number);
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!validateContactNumber(contactNumber)) {
      setError("Please enter a valid 10-digit contact number.");
      setIsLoading(false);
      return;
    }

    if (!address.trim()) {
      setError("Please enter your address.");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    setError("");

    try {
      let profileImageUrl = "";

      if (profilePic) {
        try {
          const imgUploadRes = await uploadImage(profilePic);
          profileImageUrl = imgUploadRes.imageUrl || "";
        } catch (error) {
          setError("Image upload failed. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        contactNumber,
        address,
        password,
        adminInviteToken: adminInviteToken || undefined,
        profileImage: profileImageUrl || undefined,
      });

      const { token, role, user, employeeId } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser({ ...user, token, employeeId });

        // Show employee ID to user
        alert(`Registration successful! Your Employee ID is: ${employeeId}`);

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "hr_manager") {
          navigate("/attendance/dashboard");
        } else if (role === "company_manager") {
          navigate("/company-manager-dashboard");
        } else if (role === "inventory_manager") {
          navigate("/inventory");
        } else if (role === "dispatch_manager") {
          navigate("/dispatchDashboard");
        } else {
          navigate("/user/dashboard");
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
      <div className="signup-form">
        <h3 className="welcome">Create an Account</h3>
        <p className="signup-p">
          Join us today by entering your details below.
        </p>
        <p className="employee-id-note">
          Your Employee ID will be automatically generated (e.g., 001, 002, 003)
        </p>

        <form onSubmit={handleSignUp}>
          <label className="form-label">Profile Photo</label>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <label className="form-label" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError("");
            }}
          />

          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
          />

          <label className="form-label" htmlFor="contactNumber">
            Contact Number
          </label>
          <input
            id="contactNumber"
            name="contactNumber"
            type="tel"
            placeholder="Enter your 10-digit contact number"
            value={contactNumber}
            onChange={(e) => {
              setContactNumber(e.target.value);
              if (error) setError("");
            }}
            maxLength="10"
          />

          <label className="form-label" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (error) setError("");
            }}
            rows="3"
          />

          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Min 6 Characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "SIGNING UP..." : "SIGN UP"}
          </button>

          <p className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="login-text">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
