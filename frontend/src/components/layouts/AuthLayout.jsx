import React from "react";
import BG_IMG from "../../assets/truck2.jpg"; // background image
import "../../CSS/TaskManagerCSS/Login.css"; // import CSS file


const AuthLayout = ({ children }) => {
  return (
    <div
      className="auth-layout"
      style={{ backgroundImage: `url(${BG_IMG})` }}
    >
      <div className="auth-left">{children}</div>
    </div>
  );
};

export default AuthLayout;
