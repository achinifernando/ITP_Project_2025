// import React, { useState } from "react";
// import { FaTimes, FaBars } from "react-icons/fa";
// import AttendanceSideMenu from "../layouts/attendanceSidebar";
// import "../../CSS/AttendanceCSS/AttendanceDashboard.css";


// const NavBar = ({ activeMenu, onMenuToggle, user }) => {
//   const [openSideMenu, setOpenSideMenu] = useState(false);

//   const toggleSideMenu = () => {
//     setOpenSideMenu((prev) => !prev);
//     if (onMenuToggle) {
//       onMenuToggle(!openSideMenu);
//     }
//   };

//   return (
//     <div className="navbar">
//       <div className="navbar-content">
//         <button
//           className="menu-toggle-btn"
//           onClick={toggleSideMenu}
//           aria-label="Toggle menu"
//         >
//           {openSideMenu ? (
//             <FaTimes className="menu-icon" />
//           ) : (
//             <FaBars className="menu-icon" />
//           )}
//         </button>

//         <h2 className="navbar-title">Attendance System</h2>
//       </div>

//       {openSideMenu && (
//         <div className="side-menu-container">
//           <AttendanceSideMenu
//             activeMenu={activeMenu}
//           />
//         </div>
//       )}

//       {openSideMenu && (
//         <div
//           className="menu-overlay"
//           onClick={toggleSideMenu}
//         />
//       )}
//     </div>
//   );
// };

// export default NavBar;