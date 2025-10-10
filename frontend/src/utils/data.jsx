import React from "react";

// Admin Side Menu Data
export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: <i className="fa-solid fa-chart-line"></i>,
    path: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Manage Tasks",
    icon: <i className="fa-solid fa-tasks"></i>,
    path: "/admin/tasks",
  },
  {
    id: "03",
    label: "Create Task",
    icon: <i className="fa-solid fa-plus-circle"></i>,
    path: "/admin/create-task",
  },
  {
    id: "04",
    label: "Team Members",
    icon: <i className="fa-solid fa-user-group"></i>,
    path: "/admin/team-members",
  },
  {
    id: "05",
    label: "Manage Templates",
    icon: <i className="fa-solid fa-list-check"></i>,
    path: "/admin/templates",
  },
  {
    id: "06",
    label: "Logout",
    icon: <i className="fa-solid fa-arrow-right-from-bracket"></i>,
    path: "logout",
  },
];

// User Side Menu Data
export const SIDE_MENU_USER_DATA = [
  {
    id: "01",
    label: "User Dashboard",
    icon: <i className="fa-solid fa-chart-pie"></i>,
    path: "/user/dashboard",
  },
  {
    id: "02",
    label: "My Tasks",
    icon: <i className="fa-solid fa-clipboard-list"></i>,
    path: "/user/task-details",
  },
  {
    id: "03",
    label: "Payroll",
    icon: <i className="fa-solid fa-money-bill-wave"></i>,
    path: "/user/payroll",
  },
  {
    id: "04",
    label: "Logout",
    icon: <i className="fa-solid fa-arrow-right-from-bracket"></i>,
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
    icon: <i className="fa-solid fa-chart-line"></i>,
    path: "/attendance/dashboard",
  },
  {
    id: "02",
    label: "Employees",
    icon: <i className="fa-solid fa-user-tie"></i>,
    path: "/attendance/employees",
  },
  {
    id: "03",
    label: "Leaves",
    icon: <i className="fa-solid fa-calendar-xmark"></i>,
    path: "/attendance/leaves",
  },
  {
    id: "04",
    label: "Attendance",
    icon: <i className="fa-solid fa-clipboard-user"></i>,
    path: "/attendance/mark",
  },
  {
    id: "05",
    label: "Reports",
    icon: <i className="fa-solid fa-file-chart-column"></i>,
    path: "/attendance/reports",
  },
  {
    id: "06",
    label: "Logout",
    icon: <i className="fa-solid fa-arrow-right-from-bracket"></i>,
    path: "logout",
  },
];