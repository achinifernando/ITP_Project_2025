import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/profile.css";
import profilepic from "../assets/profilepic.jpg"

function UpdateProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    profileImageUrl: "",
    phone: "",
    companyName: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams(); // get id from route

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setPhotoPreview(
            res.data.profileImageUrl
              ? `http://localhost:5000/files/${res.data.profileImageUrl}`
              : null
          );
        })
        .catch((err) => console.error(err));
    }
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result); // show base64 preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (selectedFile) formData.append("profileImage", selectedFile);
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone);
      formData.append("companyName", user.companyName);

      const res = await axios.put("http://localhost:5000/client/updateProfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Save latest user in localStorage
      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Profile updated successfully!");
      navigate("/profilePage"); // redirect back
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="profile-main">
      <h3>Update Profile</h3>

      {/* Profile Image */}
      <div className="profile-form-group">
        <label>Profile Image</label>
        <div className="photo-upload">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="photo-img" />
          ) : (
            <img src={profilepic} alt="default" className="photo-img" />
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>
      </div>

      {/* Form Inputs */}
      <div className="profile-form-group">
        <label>Name</label>
        <input type="text" name="name" value={user.name} onChange={handleChange} />
      </div>

      <div className="profile-form-group">
        <label>Email</label>
        <input type="text" name="email" value={user.email} onChange={handleChange} />
      </div>

      <div className="profile-form-group">
        <label>Phone</label>
        <input type="text" name="phone" value={user.phone} onChange={handleChange} />
      </div>

      <div className="profile-form-group">
        <label>Company Name</label>
        <input
          type="text"
          name="companyName"
          value={user.companyName}
          onChange={handleChange}
        />
      </div>

      <button className="btn-save" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

export default UpdateProfilePage;
