import React, { useRef, useState } from "react";
import "../../CSS/TaskManagerCSS/profilephotoselector.css";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="profile-photo-selector">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {/* Preview or placeholder */}
      {previewUrl ? (
        <div className="preview-wrapper">
          <img
            src={previewUrl}
            alt="Profile Preview"
            className="profile-preview"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="remove-btn"
          >
            <span className="icon-x"></span>
          </button>
        </div>
      ) : (
        <div className="placeholder" onClick={onChooseFile}>
          <span className="icon-user"></span>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={onChooseFile}
        className="upload-btn"
      >
        <span className="icon-upload">
          <span className="icon-upload-line"></span>
        </span>
        Upload
      </button>
    </div>
  );
};

export default ProfilePhotoSelector;
