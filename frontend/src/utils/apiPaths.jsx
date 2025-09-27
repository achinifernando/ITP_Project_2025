export const BASE_URL = "http://localhost:5000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Register a new user (admin or member)
    LOGIN: "/api/auth/login", // Authenticate user and return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    UPLOAD_IMAGE: "/api/auth/upload-image"
  },

  USERS: {
    GET_ALL_USERS: "/api/users", // Get all users (admins only)
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID
    CREATE_USER: "/api/users", // Create a new user (admin only)
    UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user details
    DELETE_USER: (userId) => `/api/users/${userId}`, // Delete a user
  },

  TASKS: {
    GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get dashboard data
    GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get user dashboard data
    GET_ALL_TASKS: "/api/tasks", // GET ALL TASKS (ADMIN: ALL, USER: ONLY ASSIGNED TASKS)
    GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID
    CREATE_TASK: "/api/tasks", // Create a new task
    UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task details
    DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete task (admin only)
    UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update task status
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update todo checklist
  },

  CHECKLIST_TEMPLATES: {
    GET_TEMPLATES: "/checklist-templates",
    GET_TEMPLATE_BY_ID: (id) => `/checklist-templates/${id}`,
    CREATE_TEMPLATE: "/checklist-templates",
    DELETE_TEMPLATE: (id) => `/checklist-templates/${id}`,
  },

//   CHECKLIST_TEMPLATES: {
//   GET_TEMPLATES: "/api/checklist-templates",
//   GET_TEMPLATE_BY_ID: (id) => `/api/checklist-templates/${id}`,
//   CREATE_TEMPLATE: "/api/checklist-templates",
//   DELETE_TEMPLATE: (id) => `/api/checklist-templates/${id}`,
// },

  REPORTS: {
    EXPORT_TASKS: "/api/reports/export/tasks", // Download all tasks as an excel/pdf report
    EXPORT_USERS: "/api/reports/export/users", // Download user-task report
  },

  ATTENDANCE: {
    SEND_OTP: "/api/attendance/send-otp",
    VERIFY_OTP: "/api/attendance/verify-otp",
    CREATE_ATTENDANCE: "/api/attendance",
  },

  LEAVES: {
    GET_MY_LEAVES: "/api/leaves/my",
    GET_ALL_LEAVES: "/api/leaves/all", 
    CREATE_LEAVE: "/api/leaves",
    UPDATE_LEAVE_STATUS: (id) => `/api/leaves/${id}/status`,
  },

};

// Fixed the API_BASE reference to use BASE_URL
const API_BASE = BASE_URL;

async function handle(res) {
  if (!res.ok) {
    let msg = '';
    try { 
      msg = await res.text(); 
    } catch (error) {
      // Handle text parsing error
    }
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

function getAuthHeaders() {
  const token = localStorage.getItem('token'); // or wherever you store the token
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
export const api = {
   get: (path) => 
    fetch(`${API_BASE}${path}`, { 
      headers: getAuthHeaders(),
      credentials: 'include' 
    }).then(handle),
  
  post: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(handle),
  
  put: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(handle),
  
  patch: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(handle),
  
  delete: (path) =>
    fetch(`${API_BASE}${path}`, { 
      method: 'DELETE', 
      headers: getAuthHeaders(),
      credentials: 'include'
    }).then(handle),
};