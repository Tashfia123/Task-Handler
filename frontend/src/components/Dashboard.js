import React, { useState, useEffect, useMemo } from 'react';
import { taskService } from '../services/api';
import Sidebar from './Sidebar';
import ProjectsView from './ProjectsView';
import StatsCards from './StatsCards';
import ProgressOverview from './ProgressOverview';
import ControlPanel from './ControlPanel';
import TaskBoard from './TaskBoard';
import TasksTable from './TasksTable';
import AddTaskModal from './AddTaskModal';
import './Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    overdue: 0
  });
  const [currentView, setCurrentView] = useState('board');
  const [viewMode, setViewMode] = useState('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [dueDateFilter, setDueDateFilter] = useState('Due Date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskService.getAllTasks();
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await taskService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks([response.data, ...tasks]);
      await fetchStats();
      setIsModalOpen(false);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
      throw error;
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    // Validate taskId (can be number or UUID string)
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Invalid task ID:', taskId);
      return;
    }
    
    try {
      console.log('Updating task:', taskId, 'with updates:', updates);
      const response = await taskService.updateTask(taskId, updates);
      console.log('Update response:', response.data);
      
      // Use String comparison to handle both numbers and UUIDs
      setTasks(tasks.map(task => String(task.id) === String(taskId) ? response.data : task));
      await fetchStats();
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Task ID:', taskId);
      console.error('Updates:', updates);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      alert(`Failed to update task: ${errorMessage}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        // Use String comparison to handle both numbers and UUIDs
        setTasks(tasks.filter(task => String(task.id) !== String(taskId)));
        await fetchStats();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  // Extract project color map for task coloring
  const projectColorMap = useMemo(() => {
    const colorMap = new Map();
    const projectMap = new Map();
    
    tasks.forEach(task => {
      if (task.tags) {
        const projectNames = typeof task.tags === 'string' 
          ? task.tags.split(',').map(t => t.trim()).filter(t => t)
          : task.tags.filter(t => t);
        
        projectNames.forEach(projectName => {
          if (!projectMap.has(projectName)) {
            projectMap.set(projectName, 0);
          }
          projectMap.set(projectName, projectMap.get(projectName) + 1);
        });
      }
    });

    const PROJECT_COLORS = [
      '#ec4899', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
    ];

    const specialColors = {
      'butterfly': '#ec4899',
      'shufola': '#10b981',
    };

    Array.from(projectMap.entries()).forEach(([name, count], index) => {
      const color = specialColors[name.toLowerCase()] || PROJECT_COLORS[index % PROJECT_COLORS.length];
      colorMap.set(name, color);
    });

    return colorMap;
  }, [tasks]);


  const getTasksByStatus = (status) => {
    // For board view, apply search and priority filters but not status filter
    // (since we're already filtering by status in each column)
    let tasksToFilter = tasks;
    
    // Apply search filter
    if (searchTerm) {
      tasksToFilter = tasksToFilter.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'All Priority') {
      tasksToFilter = tasksToFilter.filter(task => task.priority === priorityFilter);
    }
    
    // Filter by the specific status for this column
    return tasksToFilter.filter(task => task.status === status);
  };

  const getCompletionRate = () => {
    if (stats.total === 0) return 0;
    const completed = stats.byStatus['Completed'] || 0;
    return Math.round((completed / stats.total) * 100);
  };

  const getThisWeekProgress = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return taskDate >= weekStart;
    });

    const completedThisWeek = thisWeekTasks.filter(task => task.status === 'Completed').length;
    return { completed: completedThisWeek, total: thisWeekTasks.length };
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="main-content">
        {currentView === 'board' && (
          <div className="dashboard">
            <div className="dashboard-container">
              <StatsCards stats={stats} />
              <ProgressOverview 
                completionRate={getCompletionRate()} 
                thisWeekProgress={getThisWeekProgress()}
              />
              <ControlPanel
                viewMode={viewMode}
                setViewMode={setViewMode}
                onAddTask={() => setIsModalOpen(true)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                dueDateFilter={dueDateFilter}
                setDueDateFilter={setDueDateFilter}
              />
              {viewMode === 'board' ? (
                <TaskBoard
                  tasks={getTasksByStatus}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  projectColorMap={projectColorMap}
                />
              ) : (
                <TasksTable
                  tasks={tasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleAddTask}
                  stats={stats}
                  projectColorMap={projectColorMap}
                  hideHeader={true}
                  externalSearchTerm={searchTerm}
                  externalPriorityFilter={priorityFilter}
                  externalStatusFilter={statusFilter}
                />
              )}
            </div>
            {isModalOpen && (
              <AddTaskModal
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddTask}
              />
            )}
          </div>
        )}
        {currentView === 'table' && (
          <TasksTable
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            stats={stats}
            projectColorMap={projectColorMap}
          />
        )}
        {currentView === 'projects' && (
          <ProjectsView tasks={tasks} />
        )}
        {currentView === 'analytics' && (
          <div className="analytics-view">
            <h1>Task Analytics</h1>
            <p>Analytics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

