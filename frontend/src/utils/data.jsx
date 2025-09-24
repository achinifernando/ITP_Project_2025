import React from "react";

// Admin Side Menu Data
export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: <i className="fa-solid fa-house"></i>,
    path: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Manage Tasks",
    icon: <i className="fa-solid fa-list-check"></i>,
    path: "/admin/tasks",
  },
  {
    id: "03",
    label: "Create Task",
    icon: <i className="fa-solid fa-file"></i>,
    path: "/admin/create-task",
  },
  {
    id: "04",
    label: "Team Members",
    icon: <i className="fa-solid fa-users"></i>,
    path: "/admin/users",
  },
  {
    id: "05",
    label: "Logout",
    icon: <i className="fa-solid fa-right-from-bracket"></i>,
    path: "logout",
  },
];

// User Side Menu Data
export const SIDE_MENU_USER_DATA = [
  {
    id: "01",
    label: "User Dashboard",
    icon: <i className="fa-solid fa-house"></i>,
    path: "/user/dashboard",
  },
  {
    id: "02",
    label: "My Tasks",
    icon: <i className="fa-solid fa-list-check"></i>,
    path: "/user/task-details",
  },
  {
    id: "03",
    label: "Logout",
    icon: <i className="fa-solid fa-right-from-bracket"></i>,
    path: "logout",
  },
];

// Priority Data
export const PRIORITY_DATA = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

// Status Data
export const STATUS_DATA = [
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

// HR Side Menu Data (with appropriate icons)
export const SIDE_MENU_HR_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: <i className="fa-solid fa-house"></i>,
    path: "/attendance/dashboard",
  },
  {
    id: "02",
    label: "Employees",
    icon: <i className="fa-solid fa-users"></i>,
    path: "/attendance/employees",
  },
  {
    id: "03",
    label: "Leaves",
    icon: <i className="fa-solid fa-calendar-day"></i>,
    path: "/attendance/leaves",
  },
  {
    id: "04",
    label: "Salary",
    icon: <i className="fa-solid fa-money-bill-wave"></i>,
    path: "/attendance/salary",
  },
  {
    id: "05",
    label: "Attendance",
    icon: <i className="fa-solid fa-clipboard-check"></i>,
    path: "/attendance/mark",
  },
  {
    id: "06",
    label: "Reports",
    icon: <i className="fa-solid fa-chart-bar"></i>,
    path: "/attendance/reports",
  },
  {
    id: "07",
    label: "Logout",
    icon: <i className="fa-solid fa-right-from-bracket"></i>,
    path: "logout",
  },
];