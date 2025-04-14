import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function TaskCreation({ isOpen, onClose, onSubmit }) {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [teamId, setTeamId] = useState('');
  const [assignmentType, setAssignmentType] = useState('user'); // 'user' or 'team'
  const [priority, setPriority] = useState('Low');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [userTeams, setUserTeams] = useState({});
  const { user: assignedBy } = useAuth();

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

    async function fetchTeams() {
      const token = localStorage.getItem('Authentication');
      try {
        const response = await axios.get('http://localhost:8383/api/team/teams', {
          headers: { Authentication: token },
        });
        setTeams(response.data.teams || []);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    }

    async function fetchUserTeams() {
      const token = localStorage.getItem('Authentication');
      try {
        const response = await axios.get('http://localhost:8383/api/team/userteams', {
          headers: { Authentication: token },
        });
        
        // Create a mapping of user IDs to their team IDs
        const teamMap = {};
        if (Array.isArray(response.data)) {
          response.data.forEach(item => {
            if (item && item.user_id && item.team_id) {
              teamMap[item.user_id] = item.team_id;
            }
          });
        }
        
        setUserTeams(teamMap);
      } catch (err) {
        console.error('Error fetching user teams:', err);
        // Initialize with empty mapping instead of failing completely
        setUserTeams({});
      }
    }

    async function fetchProjects() {
      const token = localStorage.getItem('Authentication');
      try {
        const response = await axios.get('http://localhost:8383/api/project/getpj', {
          headers: { Authentication: token },
        });
        setProjects(response.data.message.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    }

    if (isOpen) {
      fetchUsers();
      fetchTeams();
      fetchUserTeams();
      fetchProjects();
    }
  }, [isOpen]);

  // When a user is selected, automatically select their team if they have one
  useEffect(() => {
    if (assignmentType === 'user' && assignedUser && userTeams[assignedUser]) {
      setTeamId(userTeams[assignedUser]);
    }
  }, [assignedUser, userTeams, assignmentType]);

  // When assignment type changes, reset the relevant fields
  useEffect(() => {
    if (assignmentType === 'user') {
      setTeamId('');
    } else {
      setAssignedUser('');
    }
  }, [assignmentType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (assignmentType === 'user' && !assignedUser) {
      setError('Please select a user to assign this task');
      return;
    }

    if (assignmentType === 'team' && !teamId) {
      setError('Please select a team to assign this task');
      return;
    }

    const taskData = {
      project_id: projectId,
      title,
      description,
      priority,
      due_date: dueDate,
      assigned_by: assignedBy,
      // Set assigned_user and team_id based on assignment type
      assigned_user: assignmentType === 'user' ? assignedUser : null,
      team_id: assignmentType === 'team' ? teamId : userTeams[assignedUser] || null,
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
    setTeamId('');
    setAssignmentType('user');
    setPriority('Low');
    setDueDate('');
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
          <div className="mb-3">
            <label htmlFor="projectId" className="block text-xs font-medium text-[#222831] mb-1">
              Project
            </label>
            <select
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
              required
            >
              <option value="">Select a project</option>
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.id || project.projectId} value={project.id || project.projectId}>
                    {project.title}
                  </option>
                ))
              ) : (
                <option disabled>Loading projects...</option>
              )}
            </select>
          </div>

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
              required
            />
          </div>

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

          <div className="mb-3">
            <label className="block text-xs font-medium text-[#222831] mb-1">
              Assign To
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="assignUser"
                  name="assignmentType"
                  value="user"
                  checked={assignmentType === 'user'}
                  onChange={() => setAssignmentType('user')}
                  className="mr-1.5"
                />
                <label htmlFor="assignUser" className="text-sm">User</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="assignTeam"
                  name="assignmentType"
                  value="team"
                  checked={assignmentType === 'team'}
                  onChange={() => setAssignmentType('team')}
                  className="mr-1.5"
                />
                <label htmlFor="assignTeam" className="text-sm">Team</label>
              </div>
            </div>
          </div>

          {assignmentType === 'user' && (
            <div className="mb-3">
              <label htmlFor="assignedUser" className="block text-xs font-medium text-[#222831] mb-1">
                Assigned User
              </label>
              <select
                id="assignedUser"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                required={assignmentType === 'user'}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.email || user.username}
                  </option>
                ))}
              </select>
              {assignedUser && userTeams[assignedUser] && (
                <p className="text-xs text-gray-500 mt-1">
                  Team: {teams.find(t => t.team_id === userTeams[assignedUser])?.team_name || 'Unknown'}
                </p>
              )}
              {assignedUser && !userTeams[assignedUser] && (
                <p className="text-xs text-amber-500 mt-1">
                  Note: This user is not assigned to a team.
                </p>
              )}
            </div>
          )}

          {assignmentType === 'team' && (
            <div className="mb-3">
              <label htmlFor="teamId" className="block text-xs font-medium text-[#222831] mb-1">
                Assigned Team
              </label>
              <select
                id="teamId"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
                required={assignmentType === 'team'}
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.team_id} value={team.team_id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          <div className="mb-3">
            <label htmlFor="dueDate" className="block text-xs font-medium text-[#222831] mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ADB5]"
            />
          </div>

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