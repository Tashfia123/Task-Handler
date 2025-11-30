import React from 'react';
import './ProgressOverview.css';

function ProgressOverview({ completionRate, thisWeekProgress }) {
  const weekPercentage = thisWeekProgress.total > 0 
    ? Math.round((thisWeekProgress.completed / thisWeekProgress.total) * 100)
    : 0;

  return (
    <div className="progress-overview">
      <div className="progress-header">
        <h3>This Week's Progress</h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <div className="progress-info">
        <span className="progress-text">
          {thisWeekProgress.completed} of {thisWeekProgress.total} tasks completed
        </span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${weekPercentage}%` }}
          ></div>
        </div>
        <div className="progress-percentage">{weekPercentage}%</div>
      </div>
      <div className="completion-rate">
        <span>Overall Completion Rate: {completionRate}%</span>
        <span>{thisWeekProgress.completed}/{thisWeekProgress.total} tasks done</span>
      </div>
    </div>
  );
}

export default ProgressOverview;

