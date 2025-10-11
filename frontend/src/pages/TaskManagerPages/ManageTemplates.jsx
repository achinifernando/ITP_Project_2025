import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import "../../CSS/TaskManagerCSS/ManageTemplates.css";

const ManageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    items: [{ text: "" }],
  });

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.CHECKLIST_TEMPLATES.GET_TEMPLATES);
      setTemplates(response.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle form changes
  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index].text = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { text: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Create or update template
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    const validItems = formData.items.filter((item) => item.text.trim() !== "");
    if (validItems.length === 0) {
      toast.error("At least one checklist item is required");
      return;
    }

    try {
      setLoading(true);
      if (editingTemplate) {
        // Update existing template
        await axiosInstance.put(
          API_PATHS.CHECKLIST_TEMPLATES.GET_TEMPLATE_BY_ID(editingTemplate._id),
          { ...formData, items: validItems }
        );
        toast.success("Template updated successfully");
      } else {
        // Create new template
        await axiosInstance.post(API_PATHS.CHECKLIST_TEMPLATES.CREATE_TEMPLATE, {
          ...formData,
          items: validItems,
        });
        toast.success("Template created successfully");
      }

      fetchTemplates();
      closeModal();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(API_PATHS.CHECKLIST_TEMPLATES.DELETE_TEMPLATE(id));
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for creating/editing
  const openModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        items: template.items.length > 0 ? template.items : [{ text: "" }],
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        items: [{ text: "" }],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      items: [{ text: "" }],
    });
  };

  return (
    <DashboardLayout activeMenu="Manage Templates">
      <div className="manage-templates-container">
        <div className="templates-header">
          <h1>Checklist Templates</h1>
          <button className="create-template-btn" onClick={() => openModal()}>
            + Create Template
          </button>
        </div>

        {loading && <div className="loading-spinner">Loading...</div>}

        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template._id} className="template-card">
              <div className="template-card-header">
                <h3>{template.name}</h3>
                <div className="template-actions">
                  <button
                    className="edit-btn"
                    onClick={() => openModal(template)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(template._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="template-items">
                <p className="items-count">{template.items.length} items</p>
                <ul>
                  {template.items.slice(0, 5).map((item, index) => (
                    <li key={index}>{item.text}</li>
                  ))}
                  {template.items.length > 5 && (
                    <li className="more-items">
                      +{template.items.length - 5} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}

          {templates.length === 0 && !loading && (
            <div className="no-templates">
              <p>No templates found. Create your first template!</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingTemplate ? "Edit Template" : "Create Template"}</h2>
                <button className="close-btn" onClick={closeModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Vehicle Maintenance Checklist"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Checklist Items</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="item-input-group">
                      <input
                        type="text"
                        placeholder={`Item ${index + 1}`}
                        value={item.text}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeItem(index)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Saving..." : editingTemplate ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTemplates;
