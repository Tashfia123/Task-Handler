import React from 'react';
import './StatsCards.css';

function StatsCards({ stats }) {
  const getStatusCount = (status) => {
    return stats.byStatus[status] || 0;
  };

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-label">To Do</div>
          <div className="stat-value">{getStatusCount('To Do')}</div>
        </div>
        <div className="stat-icon gray">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-label">In Progress</div>
          <div className="stat-value orange">{getStatusCount('In Progress')}</div>
        </div>
        <div className="stat-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-label">Completed</div>
          <div className="stat-value green">{getStatusCount('Completed')}</div>
        </div>
        <div className="stat-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <div className="stat-label">Overdue</div>
          <div className="stat-value red">{stats.overdue}</div>
        </div>
        <div className="stat-icon red">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;

