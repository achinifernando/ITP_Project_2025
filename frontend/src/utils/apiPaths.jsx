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

  USER: {
    UPDATE_PROFILE: "/api/users/profile/update", // Update user's own profile
    RESET_PASSWORD: "/api/users/profile/reset-password", // Reset user's own password
  },

  TASKS: {
    GET_DASHBOARD_DATA: "/api/tasks/dashboard-data",
    GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",
    GET_TEAM_MEMBERS_WITH_TASKS: "/api/tasks/team-members-with-tasks",
    GET_ALL_TASKS: "/api/tasks",
    GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`,
    CREATE_TASK: "/api/tasks",
    UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Make sure this matches your route
    DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,
    UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`,
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
   EXPORT_TASKS: "/api/reports/export/tasks",
   EXPORT_USERS: "/api/reports/export/users",
   EXPORT_ATTENDANCE: "/api/reports/export/attendance", // Added missing slash
   EXPORT_EMPLOYEES: "/api/reports/export/employees",
 },

   ATTENDANCE: {
   SEND_OTP: "/api/attendance/send-otp",
   VERIFY_OTP: "/api/attendance/verify-otp",
   CREATE_ATTENDANCE: "/api/attendance",
   GET_TODAY: "/api/attendance/today", //display attendance of that day
   GET_ALL: "/api/attendance/all",
 },
  LEAVES: {
    GET_MY_LEAVES: "/api/leaves/my",
    GET_ALL_LEAVES: "/api/leaves/all", 
    CREATE_LEAVE: "/api/leaves",
    UPDATE_LEAVE_STATUS: (id) => `/api/leaves/${id}/status`,
  },
  PAYROLL: {
    GET_MY_PAYROLL: "/admin-payrolls/my-payroll",
    GENERATE_PAYROLL: "/admin-payrolls/generate",
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

export const updateTaskStatus = (taskId, status) => {
  return api.patch(API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId), { status });
}

export const deleteTask = (taskId) => {
  return api.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
}