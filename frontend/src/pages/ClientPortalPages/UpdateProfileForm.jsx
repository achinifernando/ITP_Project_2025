import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../CSS/ClientPortalCSS/profile.css";
import profilepic from "../../assets/profilepic.jpg"

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    companyName: false
  });

  const navigate = useNavigate();
  const { id } = useParams();

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

  // Validation functions
  const validateName = (name) => {
    if (!name?.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters long';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    if (!email?.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone?.trim()) return 'Phone number is required';
    // Sri Lankan phone number format: +94 XX XXX XXXX or 0XX XXX XXXX
    const phoneRegex = /^(\+94|0)[1-9][0-9]{8}$/;
    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanedPhone)) return 'Please enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)';
    return '';
  };

  const validateCompanyName = (companyName) => {
    if (!companyName?.trim()) return 'Company name is required';
    if (companyName.trim().length < 2) return 'Company name must be at least 2 characters long';
    return '';
  };

  const validateFile = (file) => {
    if (!file) return '';
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) return 'Please select a valid image file (JPEG, PNG, GIF)';
    if (file.size > 5 * 1024 * 1024) return 'Image size should be less than 5MB';
    return '';
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    
    if (touched.name || user.name) {
      newErrors.name = validateName(user.name);
    }
    
    if (touched.email || user.email) {
      newErrors.email = validateEmail(user.email);
    }
    
    if (touched.phone || user.phone) {
      newErrors.phone = validatePhone(user.phone);
    }
    
    if (touched.companyName || user.companyName) {
      newErrors.companyName = validateCompanyName(user.companyName);
    }
    
    if (selectedFile) {
      newErrors.profileImage = validateFile(selectedFile);
    }
    
    setErrors(newErrors);
  }, [user, touched, selectedFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Mark field as touched when user starts typing
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setErrors(prev => ({ ...prev, profileImage: '' }));
    }
  };

  const isFormValid = () => {
    return !errors.name && 
           !errors.email && 
           !errors.phone && 
           !errors.companyName && 
           !errors.profileImage &&
           user.name && 
           user.email && 
           user.phone && 
           user.companyName;
  };

  const handleSave = async () => {
    // Mark all fields as touched to show all errors
    setTouched({
      name: true,
      email: true,
      phone: true,
      companyName: true
    });

    if (!isFormValid()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

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

      localStorage.setItem("user", JSON.stringify(res.data));
      alert("Profile updated successfully!");
      navigate("/profilePage");
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
        {errors.profileImage && (
          <div className="error-message">{errors.profileImage}</div>
        )}
      </div>

      {/* Form Inputs */}
      <div className="profile-form-group">
        <label>Name *</label>
        <input 
          type="text" 
          name="name" 
          value={user.name} 
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name ? 'error' : ''}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <div className="error-message">{errors.name}</div>
        )}
      </div>

      <div className="profile-form-group">
        <label>Email *</label>
        <input 
          type="email" 
          name="email" 
          value={user.email} 
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? 'error' : ''}
          placeholder="example@domain.com"
        />
        {errors.email && (
          <div className="error-message">{errors.email}</div>
        )}
      </div>

      <div className="profile-form-group">
        <label>Phone *</label>
        <input 
          type="text" 
          name="phone" 
          value={user.phone} 
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.phone ? 'error' : ''}
          placeholder="0771234567 or +94771234567"
        />
        {errors.phone && (
          <div className="error-message">{errors.phone}</div>
        )}
        <div className="input-hint">
          Format: 0771234567 or +94771234567
        </div>
      </div>

      <div className="profile-form-group">
        <label>Company Name *</label>
        <input
          type="text"
          name="companyName"
          value={user.companyName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.companyName ? 'error' : ''}
          placeholder="Enter your company name"
        />
        {errors.companyName && (
          <div className="error-message">{errors.companyName}</div>
        )}
      </div>

      <button 
        className={`btn-save ${!isFormValid() ? 'btn-disabled' : ''}`} 
        onClick={handleSave}
        disabled={!isFormValid()}
      >
        Save Changes
      </button>

    
    </div>
  );
}

export default UpdateProfilePage;