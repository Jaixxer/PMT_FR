import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, FaCalendarAlt, FaExclamationTriangle,
  FaBug, FaStar, FaTasks, FaArrowUp 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  // Form fields
  const [ticketData, setTicketData] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    type: 'Task',
    assigned_user: '',
    team_id: '',
    due_date: '',
    // Using hardcoded project ID for now - in a real app this would come from context/params
    project_id: '259624da-1917-42e2-8d30-834e0a68b875'
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Type options with icons
  const typeOptions = [
    { value: 'Bug', label: 'Bug', icon: <FaBug className="text-red-600" /> },
    { value: 'Feature', label: 'Feature', icon: <FaStar className="text-amber-500" /> },
    { value: 'Task', label: 'Task', icon: <FaTasks className="text-blue-600" /> },
    { value: 'Improvement', label: 'Improvement', icon: <FaArrowUp className="text-green-600" /> }
  ];

  // Status options
  const statusOptions = ['Open', 'In Progress', 'Review', 'Completed'];

  // Priority options
  const priorityOptions = ['Low', 'Medium', 'High'];

  // Load teams and users for assignment
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('Authentication');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        // Fetch teams
        const teamsResponse = await axios.get(
          'http://localhost:8383/api/team/teams',
          { headers: { Authentication: token } }
        );
        
        if (teamsResponse.data?.teams) {
          setTeams(teamsResponse.data.teams);
        }

        // Fetch users - Updated to use the correct endpoint from TaskCreation component
        const usersResponse = await axios.get(
          'http://localhost:8383/api/info/all',
          { headers: { Authentication: token } }
        );
        
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load teams and users.');
      }
    }

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData({
      ...ticketData,
      [name]: value
    });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!ticketData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!ticketData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Due date validation - must be current date or future date
    if (ticketData.due_date) {
      const dueDate = new Date(ticketData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part for accurate day comparison
      
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('Authentication');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:8383/api/ticket/createticket',
        ticketData,
        { headers: { Authentication: token } }
      );

      if (response.data?.message) {
        setSuccess(true);
        // Reset form or navigate to ticket list
        setTimeout(() => {
          navigate('/tickets');
        }, 1500);
      } else {
        setError('Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError(error.response?.data?.error || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#222831]">Create New Ticket</h1>
          <p className="text-[#393E46] mt-2">Create a new ticket for tracking bugs, features and tasks</p>
        </div>
        <Link to="/tickets" className="inline-flex items-center text-[#393E46] hover:text-[#222831] transition-colors">
          <FaArrowLeft className="mr-2" />
          Back to Tickets
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ticket created successfully! Redirecting to tickets list...
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Ticket Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Ticket Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={ticketData.title}
            onChange={handleChange}
            placeholder="Enter ticket title"
            className={`block w-full rounded-md border ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={ticketData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the ticket in detail"
            className={`block w-full rounded-md border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent`}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Two columns for Status, Priority, Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={ticketData.status}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={ticketData.priority}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type with icons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ticket Type
          </label>
          <div className="flex flex-wrap gap-4">
            {typeOptions.map(type => (
              <div key={type.value} className="flex-1 min-w-[100px]">
                <label 
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                    ticketData.type === type.value
                      ? 'border-[#00ADB5] bg-[#00adb51a]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={ticketData.type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-xl mb-2">{type.icon}</div>
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Two columns for Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Assigned User */}
          <div>
            <label htmlFor="assigned_user" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To User
            </label>
            <select
              id="assigned_user"
              name="assigned_user"
              value={ticketData.assigned_user}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.uid} value={user.uid}>{user.username}</option>
              ))}
            </select>
          </div>

          {/* Team */}
          <div>
            <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 mb-1">
              Assign To Team
            </label>
            <select
              id="team_id"
              name="team_id"
              value={ticketData.team_id}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-6">
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={ticketData.due_date}
              onChange={handleChange}
              className={`block w-full rounded-md border ${
                errors.due_date ? 'border-red-300' : 'border-gray-300'
              } shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent`}
            />
          </div>
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Link to="/tickets">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#00ADB5] text-white rounded-md hover:bg-[#00969e] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;