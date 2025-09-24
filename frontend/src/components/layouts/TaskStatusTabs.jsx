import React from "react";
import "../../CSS/TaskManagerCSS/TaskStatusTabs.css";

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-scroll">
        {tabs.map((tab) => (
          <button 
            key={tab.label} 
            className={`tab-button ${activeTab === tab.label ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.label)}
          >
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
              <span className={`tab-count ${activeTab === tab.label ? 'active' : ''}`}>
                {tab.count}
              </span>
            </div>
            {activeTab === tab.label && (
              <div className="active-indicator"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusTabs;