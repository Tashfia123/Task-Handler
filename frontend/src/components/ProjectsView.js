import React, { useMemo } from 'react';
import './ProjectsView.css';

// Color palette for projects
const PROJECT_COLORS = [
  '#ec4899', // Pink (for butterfly)
  '#10b981', // Green (for shufola)
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Violet
];

function ProjectsView({ tasks }) {
  // Group tasks by project
  const projectsData = useMemo(() => {
    const projectMap = new Map();
    const unassignedTasks = [];

    tasks.forEach(task => {
      if (task.tags) {
        const projectNames = typeof task.tags === 'string' 
          ? task.tags.split(',').map(t => t.trim()).filter(t => t)
          : task.tags.filter(t => t);
        
        if (projectNames.length > 0) {
          projectNames.forEach(projectName => {
            if (!projectMap.has(projectName)) {
              projectMap.set(projectName, {
                name: projectName,
                tasks: [],
                color: null
              });
            }
            projectMap.get(projectName).tasks.push(task);
          });
        } else {
          unassignedTasks.push(task);
        }
      } else {
        unassignedTasks.push(task);
      }
    });

    // Assign colors to projects
    const specialColors = {
      'butterfly': '#ec4899', // Pink
      'shufola': '#10b981',   // Green
    };

    const projectsList = Array.from(projectMap.values())
      .map((project, index) => {
        const color = specialColors[project.name.toLowerCase()] || PROJECT_COLORS[index % PROJECT_COLORS.length];
        return {
          ...project,
          color
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Add unassigned if there are any
    if (unassignedTasks.length > 0) {
      projectsList.push({
        name: 'Unassigned',
        tasks: unassignedTasks,
        color: '#9ca3af'
      });
    }

    return projectsList;
  }, [tasks]);

  const getStatusCount = (projectTasks, status) => {
    return projectTasks.filter(task => task.status === status).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10b981'; // Green
      case 'In Progress':
        return '#3b82f6'; // Blue
      case 'To Do':
        return '#f59e0b'; // Amber/Yellow
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Completed':
        return 'Done';
      case 'In Progress':
        return 'In Progress';
      case 'To Do':
        return 'To Do';
      default:
        return status;
    }
  };

  // Get recent tasks (last 3, sorted by most recent)
  const getRecentTasks = (projectTasks) => {
    return projectTasks
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at || 0);
        const dateB = new Date(b.updated_at || b.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 3);
  };

  return (
    <div className="projects-view">
      <div className="projects-view-header">
        <h1>Project Categories</h1>
        <p className="projects-count">{projectsData.length} unique categories</p>
      </div>
      <div className="projects-grid">
        {projectsData.map((project) => {
          const totalTasks = project.tasks.length;
          const inProgress = getStatusCount(project.tasks, 'In Progress');
          const completed = getStatusCount(project.tasks, 'Completed');
          const recentTasks = getRecentTasks(project.tasks);

          return (
            <div key={project.name} className="project-card" style={{ borderTopColor: project.color }}>
              <div className="project-card-header">
                <h3 className="project-name">{project.name}</h3>
              </div>
              <div className="project-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}</span>
                </div>
                <div className="stat-boxes">
                  <div className="stat-box in-progress">
                    <span className="stat-box-label">In Progress</span>
                    <span className="stat-box-value">{inProgress}</span>
                  </div>
                  <div className="stat-box completed">
                    <span className="stat-box-label">Completed</span>
                    <span className="stat-box-value">{completed}</span>
                  </div>
                </div>
              </div>
              <div className="recent-tasks">
                <h4 className="recent-tasks-title">RECENT TASKS</h4>
                <div className="recent-tasks-list">
                  {recentTasks.length > 0 ? (
                    recentTasks.map(task => (
                      <div key={task.id} className="recent-task-item">
                        <span className="task-title-text">{task.title}</span>
                        <span 
                          className="task-status-badge"
                          style={{ 
                            backgroundColor: getStatusColor(task.status) + '20',
                            color: getStatusColor(task.status),
                            borderColor: getStatusColor(task.status)
                          }}
                        >
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-recent-tasks">No tasks yet</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProjectsView;

