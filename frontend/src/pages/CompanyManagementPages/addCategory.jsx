import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AddCategory() {


  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  function sendData(e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("category", category);
  formData.append("description", description);
  formData.append("image", image);

  axiosInstance.post("http://localhost:5000/admin-categories/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  .then(() => {
    alert("Category Added");
  })
  .catch((err) => {
    alert("Error: " + err.message);
  });
}



  return (
    <div className="container">
      <form onSubmit={sendData}>
        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            className="form-control"
            id="category"
            placeholder="Enter category"
            onChange={(e)=>{
              setCategory(e.target.value);

            }}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            className="form-control"
            id="description"
            placeholder="Enter description"
            onChange={(e)=>{
              setDescription(e.target.value);
            }}
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            className="form-control-file"
            id="image"
            accept="image/*"
            onChange={(e)=>{
              setImage(e.target.files[0]);
            }}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}
