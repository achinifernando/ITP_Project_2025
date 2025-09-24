import React, { useState, useContext } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import ProfilePhotoSelector from "../../inputs/ProfilePhotoSelector";
import "../../../CSS/TaskManagerCSS/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { UserContext } from "../../../context/userContext";

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Image upload function
  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_IMAGE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      
      // Upload image if present
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
        password,
        adminInviteToken: adminInviteToken || undefined,
        profileImage: profileImageUrl || undefined
      });

      const { token, role, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser({ ...user, token });

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/dashboard");
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
        <p className="signup-p">Join us today by entering your details below.</p>

        <form onSubmit={handleSignUp}>
          <label className="form-label">Profile Photo</label>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <label className="form-label" htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError("");
            }}
          />

          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
          />

          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min 8 Characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
          />

          <label className="form-label" htmlFor="adminInviteToken">Admin Invite Token (Optional)</label>
          <input
            id="adminInviteToken"
            type="text"
            placeholder="6 Digit Code"
            value={adminInviteToken}
            onChange={(e) => setAdminInviteToken(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "SIGNING UP..." : "SIGN UP"}
          </button>

          <p className="login-link">
            Already have an account?{" "}
            <Link to="/Companylogin" className="login-text">Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;