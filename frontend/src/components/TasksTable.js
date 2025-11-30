import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import AddTaskModal from './AddTaskModal';
import './TasksTable.css';

function TasksTable({ tasks, onUpdateTask, onDeleteTask, onAddTask, stats, projectColorMap, hideHeader = false, externalSearchTerm, externalPriorityFilter, externalStatusFilter }) {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use external filters if provided (when used in dashboard), otherwise use internal state
  const effectiveSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm;
  const effectivePriorityFilter = externalPriorityFilter !== undefined ? externalPriorityFilter : priorityFilter;
  const effectiveStatusFilter = externalStatusFilter !== undefined ? externalStatusFilter : null;

  useEffect(() => {
    filterTasks();
  }, [tasks, effectiveSearchTerm, effectivePriorityFilter, effectiveStatusFilter]);

  const filterTasks = () => {
    let filtered = tasks || [];

    if (effectiveSearchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(effectiveSearchTerm.toLowerCase()))
      );
    }

    if (effectivePriorityFilter !== 'All Priority' && effectivePriorityFilter !== 'All Priorities') {
      filtered = filtered.filter(task => task.priority === effectivePriorityFilter);
    }

    if (effectiveStatusFilter && effectiveStatusFilter !== 'All Status') {
      filtered = filtered.filter(task => task.status === effectiveStatusFilter);
    }

    setFilteredTasks(filtered);
  };

  const toggleRow = (taskId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddTask = async (taskData) => {
    try {
      await onAddTask(taskData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await onUpdateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') {
      return (
        <div className="status-icon completed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      );
    }
    return <div className="status-icon pending"></div>;
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'In Progress':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'To Do':
        return { bg: '#e0e7ff', color: '#3730a3' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={`tasks-table-page ${hideHeader ? 'dashboard-mode' : ''}`}>
      {!hideHeader && (
        <div className="table-header">
          <div className="table-header-top">
            <h1>All Tasks</h1>
            <button className="new-task-btn" onClick={() => setIsModalOpen(true)}>+ New Task</button>
          </div>
          <div className="table-filters">
            <div className="search-container">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={effectiveSearchTerm}
                onChange={(e) => {
                  if (externalSearchTerm === undefined) {
                    setSearchTerm(e.target.value);
                  }
                }}
                className="search-input"
                disabled={externalSearchTerm !== undefined}
              />
            </div>
            <select
              className="filter-select"
              value={effectivePriorityFilter === 'All Priority' ? 'All Priorities' : effectivePriorityFilter}
              onChange={(e) => {
                if (externalPriorityFilter === undefined) {
                  setPriorityFilter(e.target.value);
                }
              }}
              disabled={externalPriorityFilter !== undefined}
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="task-summary">
            <span>Total: {stats?.total || 0}</span>
            <span>To Do: {stats?.byStatus?.['To Do'] || 0}</span>
            <span>In Progress: {stats?.byStatus?.['In Progress'] || 0}</span>
            <span>Completed: {stats?.byStatus?.['Completed'] || 0}</span>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>TASK</th>
              <th>PROJECT</th>
              <th>STAGE</th>
              <th>PRIORITY</th>
              <th>ASSIGNEE</th>
              <th>DUE DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isExpanded = expandedRows.has(task.id);
                const priorityStyle = getPriorityColor(task.priority);
                const statusStyle = getStatusColor(task.status);
                const tags = task.tags ? (typeof task.tags === 'string' ? task.tags.split(',').map(t => t.trim()) : task.tags) : [];
                
                // Get project color
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

                return (
                  <React.Fragment key={task.id}>
                    <tr 
                      className="table-row"
                      style={{
                        borderLeft: projectColor ? `4px solid ${projectColor}` : undefined
                      }}
                    >
                      <td>
                        <div className="drag-handle">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="9" cy="5" r="1" />
                            <circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="15" cy="5" r="1" />
                            <circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>
                      </td>
                      <td>
                        <div className="task-cell">
                          <button
                            className="expand-btn"
                            onClick={() => toggleRow(task.id)}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                          <span className="task-name">{task.title}</span>
                        </div>
                      </td>
                      <td>
                        {tags.length > 0 ? (
                          <div className="project-cell">
                            {tags.map((tag, index) => (
                              <span key={index} className="project-tag">{tag}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-project">—</span>
                        )}
                      </td>
                      <td>
                        <select
                          className="stage-select"
                          value={task.status}
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            borderColor: statusStyle.color
                          }}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <span
                          className="priority-tag"
                          style={{
                            backgroundColor: priorityStyle.bg,
                            color: priorityStyle.color,
                            borderColor: priorityStyle.border
                          }}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        {task.assigned_to ? (
                          <div className="assignee-cell">
                            <div className="assignee-avatar-table">
                              {getInitials(task.assigned_to)}
                            </div>
                            <span>{task.assigned_to}</span>
                          </div>
                        ) : (
                          <span className="no-assignee">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {task.due_date ? (
                          <div className={`due-date-cell ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        ) : (
                          <span className="no-date">No date</span>
                        )}
                      </td>
                      <td>
                        {getStatusIcon(task.status)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="8">
                          <div className="expanded-content">
                            <div className="expanded-section">
                              <h4>Description</h4>
                              <p>{task.description || 'No description'}</p>
                            </div>
                            {tags.length > 0 && (
                              <div className="expanded-section">
                                <h4>Project</h4>
                                <div className="tags-list">
                                  {tags.map((tag, index) => (
                                    <span key={index} className="tag-item">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTask}
        />
      )}
    </div>
  );
}

export default TasksTable;

