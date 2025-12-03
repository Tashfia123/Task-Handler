import React, { useState } from 'react';
import TaskCard from './TaskCard';
import './TaskColumn.css';

function TaskColumn({ 
  title, 
  description, 
  tasks, 
  statusColor, 
  statusValue,
  onUpdateTask, 
  onDeleteTask,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedTask,
  projectColorMap,
  onSelectTask
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    if (onDragOver) onDragOver(e);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDrop) {
      onDrop(e, statusValue);
    }
  };

  return (
    <div 
      className={`task-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-section">
          <h3 className="column-title" style={{ color: statusColor }}>
            {title}
          </h3>
          <span className="task-count">{tasks.length}</span>
        </div>
        {description && (
          <div className="column-description">{description}</div>
        )}
      </div>
      <div className="column-content">
        {tasks.length === 0 ? (
          <div className="empty-column">No tasks.</div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onDragStart={(e, task) => {
                // TaskCard already handles dataTransfer, just notify parent
                if (onDragStart) onDragStart(e, task);
              }}
              onDragEnd={() => {
                if (onDragEnd) onDragEnd();
              }}
              isDragging={draggedTask?.id === task.id}
              projectColorMap={projectColorMap}
              onSelectTask={onSelectTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskColumn;

