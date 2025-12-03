import React, { useState } from 'react';
import './AddTaskModal.css';

function AddTaskModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    status: 'To Do',
    assigned_to: '',
    due_date: '',
    tags: '',
    subtasks: [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        ...prev.subtasks,
        { id: Date.now(), text: '', completed: false },
      ],
    }));
  };

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
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
        description: null, // description replaced by checklist
        priority: formData.priority,
        status: formData.status,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null,
        tags: formData.tags || null,
        subtasks: cleanedSubtasks,
      };

      onSave(payload);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Task</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p className="modal-description">
          Create a new task for this batch. Fill in the details below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Subtasks</label>
            <div className="subtasks-container">
              {formData.subtasks.map((subtask, index) => (
                <div key={subtask.id || index} className="subtask-pill">
                  <div className="subtask-pill-border" />
                  <label className="subtask-pill-main">
                    <input
                      type="checkbox"
                      className="subtask-pill-checkbox"
                      checked={Boolean(subtask.completed)}
                      onChange={(e) =>
                        handleSubtaskChange(index, { completed: e.target.checked })
                      }
                    />
                    <input
                      type="text"
                      className="subtask-pill-input"
                      placeholder="Subtask"
                      value={subtask.text || ''}
                      onChange={(e) =>
                        handleSubtaskChange(index, { text: e.target.value })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="subtask-pill-remove"
                    onClick={() => handleRemoveSubtask(index)}
                    title="Remove subtask"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-subtask-btn"
                onClick={handleAddSubtask}
              >
                + Add subtask
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">
                Priority <span className="required">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={errors.priority ? 'error' : ''}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {errors.priority && <span className="error-message">{errors.priority}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Status <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? 'error' : ''}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {errors.status && <span className="error-message">{errors.status}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assigned_to">Assigned To</label>
            <input
              type="text"
              id="assigned_to"
              name="assigned_to"
              placeholder="Enter assignee name"
              value={formData.assigned_to}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              placeholder="Pick a date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Project</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="Enter project name (e.g., Frontend, Backend, Marketing)"
              value={formData.tags}
              onChange={handleChange}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Enter the project name for this task
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;

