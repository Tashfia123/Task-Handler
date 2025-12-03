import React, { useState, useEffect, useMemo } from 'react';
import './TaskDetailPanel.css';

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const PRIORITY_BADGE = {
  High: { color: '#b91c1c', bg: '#fee2e2' },
  Medium: { color: '#b45309', bg: '#ffedd5' },
  Low: { color: '#047857', bg: '#d1fae5' }
};

function TaskDetailPanel({ task, isOpen, onClose, onUpdateTask, onDeleteTask }) {
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || STATUS_OPTIONS[0],
        priority: task.priority || PRIORITY_OPTIONS[1],
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        tagsInput: task.tags
          ? (Array.isArray(task.tags) ? task.tags.join(', ') : task.tags)
          : '',
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      });
      setError('');
    } else {
      setFormData(null);
    }
  }, [task]);

  const tagList = useMemo(() => {
    if (!formData?.tagsInput) return [];
    return formData.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }, [formData]);

  if (!task || !formData) {
    return (
      <div className={`task-panel-shell ${isOpen ? 'open' : ''}`} aria-hidden />
    );
  }

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Completed' ? 'In Progress' : 'Completed'
    }));
  };

  const handleSubtaskChange = (index, changes) => {
    setFormData(prev => {
      const next = [...prev.subtasks];
      next[index] = { ...next[index], ...changes };
      return { ...prev, subtasks: next };
    });
  };

  const handleAddSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [
        ...(prev.subtasks || []),
        { id: Date.now(), text: '', completed: false },
      ],
    }));
  };

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    const cleanedSubtasks = Array.isArray(formData.subtasks)
      ? formData.subtasks
          .map(st => ({
            id: st.id || Date.now(),
            text: (st.text || '').trim(),
            completed: Boolean(st.completed),
          }))
          .filter(st => st.text.length > 0)
      : [];

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
      priority: formData.priority,
      assigned_to: formData.assigned_to.trim() || null,
      due_date: formData.due_date || null,
      tags: tagList,
      subtasks: cleanedSubtasks,
    };

    try {
      setSaving(true);
      await onUpdateTask(task.id, payload);
      onClose();
    } catch (err) {
      console.error('Panel save failed:', err);
      setError(err?.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) {
      onDeleteTask(task.id);
    }
  };

  const priorityBadge = PRIORITY_BADGE[formData.priority] || PRIORITY_BADGE.Medium;

  return (
    <div className={`task-panel-shell ${isOpen ? 'open' : ''}`}>
      <div className="task-panel-backdrop" onClick={onClose} />
      <aside className="task-panel" role="dialog" aria-modal="true">
        <div className="task-panel-header">
          <div className="task-panel-breadcrumbs">
            <span>Board</span>
            <span>/</span>
            <span>{task.status}</span>
          </div>
          <button className="panel-close-btn" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>

        <div className="task-panel-body">
          <input
            className="panel-title-input"
            value={formData.title}
            name="title"
            onChange={handleFieldChange}
            placeholder="Task title"
          />

          <div className="panel-meta-row">
            <label className="panel-checkbox">
              <input
                type="checkbox"
                checked={formData.status === 'Completed'}
                onChange={handleStatusToggle}
              />
              <span>Mark as done</span>
            </label>
            <div
              className="panel-priority-pill"
              style={{ color: priorityBadge.color, background: priorityBadge.bg }}
            >
              {formData.priority} priority
            </div>
          </div>

          <div className="panel-fields-grid">
            <label className="panel-field">
              <span>Status</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleFieldChange}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="panel-field">
              <span>Priority</span>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleFieldChange}
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="panel-field">
              <span>Due date</span>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleFieldChange}
              />
            </label>
            <label className="panel-field">
              <span>Assignee</span>
              <input
                type="text"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleFieldChange}
                placeholder="Add a teammate"
              />
            </label>
          </div>

          <section className="panel-section">
            <h4>Subtasks</h4>
            {formData.subtasks && formData.subtasks.map((subtask, index) => (
              <div key={subtask.id || index} className="subtask-row">
                <label className="panel-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(subtask.completed)}
                    onChange={(e) =>
                      handleSubtaskChange(index, { completed: e.target.checked })
                    }
                  />
                  <input
                    type="text"
                    value={subtask.text || ''}
                    onChange={(e) =>
                      handleSubtaskChange(index, { text: e.target.value })
                    }
                    placeholder="Subtask"
                  />
                </label>
                <button
                  type="button"
                  className="panel-delete-btn"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="panel-secondary-btn"
              onClick={handleAddSubtask}
            >
              + Add subtask
            </button>
          </section>

          <section className="panel-section">
            <h4>Project tags</h4>
            <input
              type="text"
              name="tagsInput"
              value={formData.tagsInput}
              onChange={handleFieldChange}
              placeholder="Design, Backend, Marketing"
            />
            {tagList.length > 0 && (
              <div className="panel-tags-preview">
                {tagList.map(tag => (
                  <span key={tag} className="panel-tag-chip">{tag}</span>
                ))}
              </div>
            )}
          </section>

          {error && <div className="panel-error">{error}</div>}
        </div>

        <div className="task-panel-footer">
          <button className="panel-delete-btn" onClick={handleDelete}>
            Delete
          </button>
          <div className="panel-footer-actions">
            <button className="panel-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="panel-primary-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default TaskDetailPanel;

