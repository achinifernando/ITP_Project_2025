import React from "react";
//import "../../styles/TaskManagerCSS/InfoCard.css";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="info-card">
      <div className="info-card-icon">{icon}</div>
      <div className="info-card-content">
        <p className="info-card-label">{label}</p>
        <p className="info-card-value">{value}</p>
      </div>
    </div>
  );
};

export default InfoCard;
