import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function TaskCreation({ isOpen, onClose, onSubmit }) {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [priority, setPriority] = useState('Low');
  const [dueDate, setDueDate] = useState(''); // New state for due_date
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]); // State to store project data
  const [error, setError] = useState(null);
  const { user: assignedBy } = useAuth(); // Get the uid from AuthContext

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem('Authentication');
      try {
        const response = await axios.get('http://localhost:8383/api/info/all', {
          headers: { Authentication: token },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }

    async function fetchProjects() {
      const token = localStorage.getItem('Authentication');
      try {
        const response = await axios.get('http://localhost:8383/api/project/getpj', {
          headers: { Authentication: token },
        });
        setProjects(response.data.message.projects || []); // Access projects from the message object
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    }

    fetchUsers();
    fetchProjects();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const taskData = {
      project_id: projectId, // Send projectId to the backend
      title,
      description,
      assigned_user: assignedUser,
      priority,
      due_date: dueDate, // Include due_date in the request
      assigned_by: assignedBy,
    };

    async function createTask() {
      try {
        const response = await axios.post('http://localhost:8383/api/task/createtask', taskData, {
          headers: { Authentication: localStorage.getItem('Authentication') },
        });
        console.log(response);
        onSubmit(response.data);
        resetForm();
      } catch (err) {
        console.error('Error creating task:', err);
        setError('Failed to create task');
      }
    }

    createTask();
  };

  const resetForm = () => {
    setProjectId('');
    setTitle('');
    setDescription('');
    setAssignedUser('');
    setPriority('Low');
    setDueDate(''); // Reset due_date
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#EEEEEE] rounded-lg p-5 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-[#222831]">Create New Task</h2>
          <button
            onClick={handleClose}
            className="text-[#393E46] hover:text-[#222831] text-lg"
          >
            ×
          </button>
        </div>

        {error && <p className="text-red-500 mb-3 text-xs">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Project ID Dropdown */}
          <div className="mb-3">
            <label htmlFor="projectId" className="block text-xs font-medium text-[#222831] mb-1">
              Project
            </label>
            <select
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)} // Set projectId when a project is selected
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
            >
              <option value="">Select a project</option>
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.title}
                  </option>
                ))
              ) : (
                <option disabled>Loading projects...</option>
              )}
            </select>
          </div>

          {/* Task Title */}
          <div className="mb-3">
            <label htmlFor="title" className="block text-xs font-medium text-[#222831] mb-1">
              Task Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
              placeholder="Enter task title"
            />
          </div>

          {/* Task Description */}
          <div className="mb-3">
            <label htmlFor="description" className="block text-xs font-medium text-[#222831] mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
              placeholder="Describe the task"
            ></textarea>
          </div>

          {/* Assigned User */}
          <div className="mb-3">
            <label htmlFor="assignedUser" className="block text-xs font-medium text-[#222831] mb-1">
              Assigned User
            </label>
            <select
              id="assignedUser"
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="mb-3">
            <label htmlFor="priority" className="block text-xs font-medium text-[#222831] mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label htmlFor="dueDate" className="block text-xs font-medium text-[#222831] mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} // Set due_date
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-[#393E46] text-[#393E46] text-sm rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#00ADB5] text-white text-sm rounded-md hover:bg-[#00ADB5]/90 focus:outline-none"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskCreation;