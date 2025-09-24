import React, { useState } from "react";
import TaskCard from "../../Cards/TaskCard";
import SelectChecklist from "../../inputs/SelectCheckList";

const TaskList = ({ tasks }) => {
  const [openChecklistTaskId, setOpenChecklistTaskId] = useState(null);

  const handleToggleChecklist = (taskId) => {
    setOpenChecklistTaskId((prev) => (prev === taskId ? null : taskId));
  };

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          taskId={task._id}
          title={task.title}
          description={task.description}
          priority={task.priority}
          status={task.status}
          progress={task.progress}
          createdAt={task.createdAt}
          dueDate={task.dueDate}
          assignedTo={task.assignedTo}
          completedTodoCount={task.completedTodoCount}
          totalChecklistCount={task.todoChecklist?.length || 0}
          onToggleChecklist={handleToggleChecklist}
          isChecklistOpen={openChecklistTaskId === task._id}
          checklistComponent={
            <SelectChecklist
              taskData={task} // ✅ only this task’s checklist
              setTaskData={() => {}} // read-only here
              handleValueChange={() => {}} // disable editing
            />
          }
        />
      ))}
    </div>
  );
};

export default TaskList;

