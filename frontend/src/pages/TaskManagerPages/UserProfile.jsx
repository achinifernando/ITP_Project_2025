import React, { useContext, useState, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../components/context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import "../../CSS/TaskManagerCSS/UserProfile.css";

const UserProfile = () => {
  useUserAuth();
  const { user, setUser } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    emergencyContact: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        emergencyContact: user.emergencyContact || "",
      });
    }
  }, [user]);

  // Handle profile input change
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.USER.UPDATE_PROFILE,
        profileData
      );

      if (response.data) {
        toast.success("Profile updated successfully!");
        // Update user context
        setUser({ ...user, ...profileData });
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...profileData }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.USER.RESET_PASSWORD,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      );

      if (response.data) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="My Profile" hideNavbar={true}>
      <div className="user-profile-container">
        <div className="profile-header">
          <h1 className="profile-title">👤 My Profile</h1>
          <p className="profile-subtitle">
            Manage your personal information and security settings
          </p>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="fa-solid fa-user"></i>
            Profile Information
          </button>
          <button
            className={`tab-button ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <i className="fa-solid fa-lock"></i>
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="profile-content">
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fa-solid fa-user"></i> Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fa-solid fa-envelope"></i> Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      disabled
                      placeholder="Enter your email"
                      title="Email cannot be changed"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <i className="fa-solid fa-phone"></i> Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateOfBirth">
                      <i className="fa-solid fa-calendar"></i> Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">
                      <i className="fa-solid fa-location-dot"></i> Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="emergencyContact">
                      <i className="fa-solid fa-phone-volume"></i> Emergency Contact
                    </label>
                    <input
                      type="tel"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleProfileChange}
                      placeholder="Emergency contact number"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="profile-content">
            <form onSubmit={handleResetPassword} className="profile-form">
              <div className="form-section">
                <h3 className="section-title">Change Password</h3>
                <p className="section-description">
                  Ensure your password is strong and secure. Use at least 6 characters.
                </p>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="currentPassword">
                      <i className="fa-solid fa-key"></i> Current Password *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">
                      <i className="fa-solid fa-lock"></i> New Password *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <i className="fa-solid fa-lock"></i> Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-shield-halved"></i> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
