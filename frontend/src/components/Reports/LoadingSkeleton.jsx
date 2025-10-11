import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="reports-grid">
      <div className="reports-card">
        <div className="reports-card-pulse" />
        <div className="reports-card-space">
          <div className="reports-card-pulse" style={{ width: '14rem' }} />
          <div className="reports-card-pulse" style={{ width: '12rem' }} />
          <div className="reports-card-pulse" style={{ width: '15rem' }} />
        </div>
      </div>
    </div>
  );
}
