import React, { useState } from 'react';
import './TaskCard.css';

function TaskCard({ task, onUpdateTask, onDeleteTask, onDragStart, onDragEnd, isDragging, projectColorMap }) {

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#fff4e6', color: '#ff6b35', border: '#ff6b35' };
      case 'Medium':
        return { bg: '#e3f2fd', color: '#2196f3', border: '#2196f3' };
      case 'Low':
        return { bg: '#e8f5e9', color: '#4caf50', border: '#4caf50' };
      default:
        return { bg: '#f5f5f5', color: '#757575', border: '#757575' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = () => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'Completed';
  };

  const priorityStyle = getPriorityColor(task.priority);
  const tags = task.tags ? (typeof task.tags === 'string' ? task.tags.split(',').map(t => t.trim()) : task.tags) : [];
  
  // Get project color - use first project's color if multiple
  const getProjectColor = () => {
    if (!tags.length || !projectColorMap) return null;
    for (const tag of tags) {
      if (projectColorMap.has(tag)) {
        return projectColorMap.get(tag);
      }
    }
    return null;
  };
  
  const projectColor = getProjectColor();
  // Overdue takes precedence, then project color
  const borderColor = isOverdue() ? '#dc3545' : (projectColor || undefined);

  return (
    <div
      className={`task-card ${isOverdue() ? 'overdue' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        borderLeft: borderColor ? `4px solid ${borderColor}` : undefined
      }}
      draggable
      onDragStart={(e) => {
        // Ensure task.id is valid (can be number or UUID string)
        if (!task || task.id === undefined || task.id === null) {
          console.error('Invalid task for drag:', task);
          e.preventDefault();
          return;
        }
        
        // Convert task.id to string (handles both numbers and UUIDs)
        const taskId = String(task.id);
        
        if (!taskId || taskId === 'undefined' || taskId === 'null') {
          console.error('Task ID is invalid:', task.id);
          e.preventDefault();
          return;
        }
        
        // Set the task ID in dataTransfer
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.setData('text/plain', taskId); // Fallback
        
        // Notify parent component
        if (onDragStart) {
          onDragStart(e, task);
        }
      }}
      onDragEnd={() => {
        if (onDragEnd) onDragEnd();
      }}
    >
      {task.status === 'Completed' && (
        <div className="task-completed-indicator">✓</div>
      )}
      <div className="task-card-header">
        <div className="task-title">{task.title}</div>
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          title="Delete task"
        >
          ×
        </button>
      </div>
      {task.description && (
        <div className="task-description">{task.description}</div>
      )}
      {tags.length > 0 && (
        <div className="task-project-section">
          <span className="task-project-label">Project:</span>
          <div className="task-tags">
            {tags.map((tag, index) => (
              <span key={index} className="task-tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
      <div className="task-footer">
        <div className="task-meta">
          {task.assigned_to && (
            <div className="task-assignee">
              <div className="assignee-avatar">
                {task.assigned_to.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="assignee-name">{task.assigned_to}</span>
            </div>
          )}
          {task.due_date && (
            <div className={`task-due-date ${isOverdue() ? 'overdue' : ''}`}>
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
        <div
          className="priority-badge"
          style={{
            backgroundColor: priorityStyle.bg,
            color: priorityStyle.color,
            borderColor: priorityStyle.border
          }}
        >
          {task.priority}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;

