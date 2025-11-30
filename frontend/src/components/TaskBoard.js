import React, { useState } from 'react';
import TaskColumn from './TaskColumn';
import './TaskBoard.css';

const STATUSES = [
  { id: 'todo', label: 'To Do', statusValue: 'To Do', description: '', color: '#666' },
  { id: 'inprogress', label: 'In Progress', statusValue: 'In Progress', description: '', color: '#ff6b35' },
  { id: 'completed', label: 'Completed', statusValue: 'Completed', description: '', color: '#28a745' }
];

function TaskBoard({ tasks, onUpdateTask, onDeleteTask, projectColorMap }) {
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Try to get taskId from dataTransfer
    let taskId = e.dataTransfer.getData('taskId');
    
    // Fallback to text/plain if taskId is empty
    if (!taskId) {
      taskId = e.dataTransfer.getData('text/plain');
    }
    
    // Try to get from draggedTask if dataTransfer failed
    if (!taskId && draggedTask && draggedTask.id) {
      taskId = String(draggedTask.id);
    }
    
    // Validate taskId (can be number or UUID string)
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Invalid task ID from drop:', {
        taskId,
        draggedTask,
        dataTransferTypes: e.dataTransfer.types
      });
      setDraggedTask(null);
      return;
    }
    
    // Use draggedTask to check current status
    if (draggedTask && draggedTask.status === newStatus) {
      // Already in the correct status, no need to update
      setDraggedTask(null);
      return;
    }
    
    // Update the task status (taskId can be string UUID or number)
    console.log('Updating task:', taskId, 'to status:', newStatus);
    onUpdateTask(taskId, { status: newStatus });
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragStart = (e, task) => {
    // Validate task before setting
    if (task && task.id) {
      setDraggedTask(task);
    } else {
      console.error('Invalid task in handleDragStart:', task);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="task-board">
      {STATUSES.map(status => {
        const statusTasks = tasks(status.statusValue);
        return (
          <TaskColumn
            key={status.id}
            title={status.label}
            description={status.description}
            tasks={statusTasks}
            statusColor={status.color}
            statusValue={status.statusValue}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggedTask={draggedTask}
            projectColorMap={projectColorMap}
          />
        );
      })}
    </div>
  );
}

export default TaskBoard;

