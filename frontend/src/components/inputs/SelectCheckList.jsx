import React, { useState, useEffect, useCallback } from "react";
import "../../CSS/TaskManagerCSS/SelectChecklist.css";
import axiosInstance from "../../utils/axiosInstance";

const SelectChecklist = ({ task, refreshTasks }) => {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChecklist = useCallback(async () => {
    if (!task?._id) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tasks/taskChecklist/${task._id}`);
      setChecklist(response.data);
    } catch (err) {
      console.error("Failed to fetch checklist:", err);
    } finally {
      setLoading(false);
    }
  }, [task?._id]);

  useEffect(() => {
    if (task && task.todoChecklist) {
      setChecklist(task.todoChecklist);
    } else {
      fetchChecklist();
    }
  }, [task, fetchChecklist]);

  const toggleItem = async (e, index) => {
    // Prevent the click event from propagating to parent elements
    e.stopPropagation();
    
    const updatedChecklist = [...checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setChecklist(updatedChecklist);

    try {
      await axiosInstance.put(`/tasks/${task._id}/todo`, {
        todoChecklist: updatedChecklist,
      });
      if (refreshTasks) {
        refreshTasks();
      }
    } catch (err) {
      console.error("Failed to update checklist:", err);
      setChecklist([...checklist]);
    }
  };

  const calculateProgress = () => {
    if (!checklist || !checklist.length) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  // Handle click on the checklist container to prevent propagation
  const handleChecklistClick = (e) => {
    e.stopPropagation();
  };

  if (loading) {
    return <div className="checklist-loading">Loading checklist...</div>;
  }

  return (
    <div className="checklist-container" onClick={handleChecklistClick}>
      {checklist && checklist.length > 0 ? (
        <>
          <div className="checklist-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {calculateProgress()}% Complete ({checklist.filter(item => item.completed).length}/{checklist.length})
            </span>
          </div>
          
          {checklist.map((item, idx) => (
            <div key={idx} className="checklist-item" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={item.completed || false}
                onChange={(e) => toggleItem(e, idx)}
                disabled={loading}
                onClick={(e) => e.stopPropagation()}
              />
              <span className={item.completed ? "completed" : ""}>
                {item.title}
              </span>
            </div>
          ))}
        </>
      ) : (
        <p className="no-checklist">No checklist items available</p>
      )}
    </div>
  );
};

export default SelectChecklist;