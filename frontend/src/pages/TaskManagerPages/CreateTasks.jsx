import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { PRIORITY_DATA } from "../../utils/data";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import SelectUsersImproved from "../../components/inputs/SelectUsersImproved";
import "../../CSS/TaskManagerCSS/CreateTasks.css";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    orderID: "",
    title: "",
    description: "",
    bodyType: "",
    priority: "Low",
    dueDate: "",
    assignedTo: [],
    templateId: "", // Add template selection
    todoChecklist: [],
  });

  const [templates, setTemplates] = useState([]); // State for templates
  const [orders, setOrders] = useState([]); // State for orders
  const [selectedOrder, setSelectedOrder] = useState(null); // Selected order details
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  /** ----------------------------
   * Helpers
   * ---------------------------- */
  const handleValueChange = (field, value) => {
    setTaskData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearData = () => {
    setTaskData({
      orderID: "",
      title: "",
      description: "",
      bodyType: "",
      priority: "Low",
      dueDate: "",
      assignedTo: [],
      templateId: "",
      todoChecklist: [],
    });
    setSelectedOrder(null);
  };

  /** ----------------------------
   * Fetch Templates
   * ---------------------------- */
  const fetchTemplates = useCallback(async () => {
    try {
      setFetchingTemplates(true);
      const response = await axiosInstance.get(API_PATHS.CHECKLIST_TEMPLATES.GET_TEMPLATES);
      setTemplates(response.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setFetchingTemplates(false);
    }
  }, []);

  /** ----------------------------
   * Fetch Orders
   * ---------------------------- */
  const fetchOrders = useCallback(async () => {
    try {
      setFetchingOrders(true);
      const response = await axiosInstance.get("http://localhost:5000/admin-orders");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setFetchingOrders(false);
    }
  }, []);

  /** ----------------------------
   * Handle Order Selection
   * ---------------------------- */
  const handleOrderSelect = (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      setTaskData(prev => ({
        ...prev,
        orderID: "",
      }));
      return;
    }

    const order = orders.find(o => o._id === orderId);
    if (order) {
      setSelectedOrder(order);
      setTaskData(prev => ({
        ...prev,
        orderID: order._id,
        title: `Order ${order._id} - ${order.lorryType?.typeName || order.lorryType?.name || 'Task'}`,
        description: `Process order for ${order.companyName}\nLorry Category: ${order.lorryCategory?.typeName || order.lorryCategory?.category || 'N/A'}\nLorry Type: ${order.lorryType?.typeName || order.lorryType?.name || 'N/A'}\nQuantity: ${order.quantity}`,
        bodyType: order.lorryType?._id || "",
      }));
    }
  };

  /** ----------------------------
   * API Calls
   * ---------------------------- */
  const getTaskDetailsByID = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      );

      if (response.data) {
        const taskInfo = response.data;

        setTaskData({
          orderID: taskInfo.orderID || "",
          title: taskInfo.title || "",
          description: taskInfo.description || "",
          bodyType: taskInfo.bodyType || "",
          priority: taskInfo.priority || "Low",
          dueDate: taskInfo.dueDate
            ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
            : "",
          assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
          templateId: taskInfo.templateId || "", // Include template ID if exists
          todoChecklist: taskInfo.todoChecklist || [],
        });
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Failed to fetch task details");
    }
  }, [taskId]);

  const createTask = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
      });

      toast.success("Task created successfully");
      clearData();
      navigate("/admin/tasks"); // Redirect to tasks page
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
  setLoading(true);

  try {
    const payload = {
      ...taskData,
      dueDate: new Date(taskData.dueDate).toISOString(),
    };

    console.log("🔄 Updating task:", { taskId, payload });

    const { data } = await axiosInstance.put(
      API_PATHS.TASKS.UPDATE_TASK(taskId),
      payload
    );

    if (!data) {
      throw new Error("Empty response from server");
    }

    toast.success("✅ Task updated successfully");
    navigate("/admin/tasks");
  } catch (error) {
    console.error("❌ Update error:", error);

    if (error.response) {
      const { status, data } = error.response;
      console.error("📡 Server response:", data);
      toast.error(`Failed to update task: ${data.message || status}`);
    } else if (error.request) {
      console.error("📭 No response received:", error.request);
      toast.error("No response from server. Please check your connection.");
    } else {
      toast.error(`Unexpected error: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};


  const deleteTask = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
      setOpenDeleteAlert(false);
    }
  };

  /** ----------------------------
   * Submit
   * ---------------------------- */
  const handleSubmit = () => {
    setError("");

    if (!taskData.title.trim()) return setError("Title is required.");
    if (!taskData.description.trim())
      return setError("Description is required.");
    if (!taskData.dueDate) return setError("Due date is required.");
    if (!taskData.assignedTo.length)
      return setError("Task must be assigned to at least one member.");

    taskId ? updateTask() : createTask();
  };

  /** ----------------------------
   * Effects
   * ---------------------------- */
  useEffect(() => {
    fetchTemplates(); // Fetch templates on component mount
    fetchOrders(); // Fetch orders on component mount
    if (taskId) getTaskDetailsByID();
  }, [taskId, getTaskDetailsByID, fetchTemplates, fetchOrders]);

  /** ----------------------------
   * JSX
   * ---------------------------- */
  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="create-task-container">
        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-overlay">
            <div className="spinner">Loading...</div>
          </div>
        )}

        {openDeleteAlert && (
          <div className="delete-alert-modal">
            <div className="delete-alert-content">
              <h3>Delete Task</h3>
              <p>
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>
              <div className="delete-alert-buttons">
                <button
                  className="cancel-delete-btn"
                  onClick={() => setOpenDeleteAlert(false)}
                >
                  Cancel
                </button>
                <button className="confirm-delete-btn" onClick={deleteTask}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="create-task-header">
            <h2 className="create-task-title">
              {taskId ? "Update Task" : "Create Task"}
            </h2>

            {taskId && (
              <button
                className="delete-task-btn"
                onClick={() => setOpenDeleteAlert(true)}
              >
                <i className="fa-trash">Delete</i>
              </button>
            )}
          </div>

          {/* Order Selection */}
          <div className="form-group">
            <label className="form-label">Select Order (Optional)</label>
            <select
              className="form-input"
              value={taskData.orderID}
              onChange={({ target }) => handleOrderSelect(target.value)}
              disabled={fetchingOrders}
            >
              <option value="">Select an order (optional)</option>
              {orders.map((order) => (
                <option key={order._id} value={order._id}>
                  {order._id} - {order.companyName} - {order.lorryType?.typeName || order.lorryType?.name || 'N/A'} (Qty: {order.quantity})
                </option>
              ))}
            </select>
            {fetchingOrders && (
              <small>Loading orders...</small>
            )}
            {selectedOrder && (
              <div className="order-details-preview">
                <small>
                  <strong>Order Details:</strong><br/>
                  Company: {selectedOrder.companyName}<br/>
                  Contact: {selectedOrder.userName} - {selectedOrder.phoneNumber}<br/>
                  Lorry: {selectedOrder.lorryCategory?.typeName || selectedOrder.lorryCategory?.category} - {selectedOrder.lorryType?.typeName || selectedOrder.lorryType?.name}<br/>
                  Status: {selectedOrder.status}
                </small>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              placeholder="Create App UI"
              className="form-input"
              value={taskData.title}
              onChange={({ target }) =>
                handleValueChange("title", target.value)
              }
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              placeholder="Describe task"
              className="form-textarea"
              rows={4}
              value={taskData.description}
              onChange={({ target }) =>
                handleValueChange("description", target.value)
              }
            />
          </div>

          {/* Lorry body type */}
          <div className="form-group">
            <label className="form-label">Body Type</label>
            <input
              placeholder="Dry Freight Box Truck Body"
              className="form-input"
              value={taskData.bodyType}
              onChange={({ target }) =>
                handleValueChange("bodyType", target.value)
              }
            />
          </div>

          {/* Priority + Due Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <SelectDropdown
                options={PRIORITY_DATA}
                value={taskData.priority}
                onChange={(value) => handleValueChange("priority", value)}
                placeholder="Select Priority"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="form-input date-input"
                type="date"
                value={taskData.dueDate}
                onChange={({ target }) =>
                  handleValueChange("dueDate", target.value)
                }
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="form-group">
            <label className="form-label">Checklist Template (Optional)</label>
            <select
              className="form-input"
              value={taskData.templateId}
              onChange={({ target }) =>
                handleValueChange("templateId", target.value)
              }
              disabled={fetchingTemplates}
            >
              <option value="">Select a template (optional)</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
            {fetchingTemplates && (
              <small>Loading templates...</small>
            )}
            {taskData.templateId && (
              <small className="template-help">
                Selected template will pre-populate the checklist for this task
              </small>
            )}
          </div>

          {/* Assign Users */}
          <div className="form-group assign-users-wrapper">
            <label className="form-label">Assign Team Members</label>
            <SelectUsersImproved
              selectedUsers={taskData.assignedTo}
              setSelectedUsers={(users) =>
                handleValueChange("assignedTo", users)
              }
            />
          </div>

          {/* Submit */}
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : taskId
              ? "Update Task"
              : "Create Task"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;