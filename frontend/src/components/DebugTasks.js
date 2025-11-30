// Temporary debug component to see all tasks
import React from 'react';

function DebugTasks({ tasks }) {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h3>Debug: All Tasks ({tasks.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>ID</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Title</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Status</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>{String(task.id)}</td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>{task.title}</td>
              <td style={{ padding: '8px', border: '1px solid #ccc', color: task.status === 'To Do' ? 'blue' : task.status === 'In Progress' ? 'orange' : 'green' }}>
                {task.status || 'NO STATUS'}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>{task.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DebugTasks;

