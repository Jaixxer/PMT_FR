import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperclip } from 'react-icons/fa';
import axios from 'axios';

const CreateTicket = ({ isOpen, onClose, projectId }) => {
  // Form state with initial values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    type: 'Bug',
    assigned_user: '',
    team_id: '',
    due_date: '',
    project_id: "259624da-1917-42e2-8d30-834e0a68b875", // Static project ID as specified
    attachments: []
  });

  // UI state
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset component state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form and UI state
      setFormData({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Medium',
        type: 'Bug',
        assigned_user: '',
        team_id: '',
        due_date: '',
        project_id: "259624da-1917-42e2-8d30-834e0a68b875", // Static project ID
        attachments: []
      });
      
      setErrors({});
      setApiError(null);
      setSuccess(false);
      
      // Fetch required data
      fetchUsers();
      fetchTeams();
    }
  }, [isOpen]);

  // API calls using useCallback to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('Authentication');
    if (!token) {
      setApiError('Authentication token not found. Please log in again.');
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:8383/api/info/all', {
        headers: { Authentication: token },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setApiError(err.response?.data?.message || 'Failed to load users data.');
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    const token = localStorage.getItem('Authentication');
    if (!token) return;
    
    try {
      const response = await axios.get('http://localhost:8383/api/team/teams', {
        headers: { Authentication: token },
      });
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setApiError(err.response?.data?.message || 'Failed to load teams data.');
    }
  }, []);

  // Form field handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user makes changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length < files.length) {
      setErrors(prev => ({ 
        ...prev, 
        attachments: 'Some files exceed the maximum size of 10MB and were not added' 
      }));
    }
    
    setFormData(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...validFiles] 
    }));
  }, []);

  const removeFile = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove)
    }));
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission with updated API endpoint and format
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setApiError(null);
    
    const token = localStorage.getItem('Authentication');
    if (!token) {
      setApiError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      // Format the ticket data according to the specified pattern
      const ticketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        type: formData.type,
        assigned_user: formData.assigned_user,
        team_id: formData.team_id,
        due_date: formData.due_date,
        project_id: "259624da-1917-42e2-8d30-834e0a68b875", // Static project ID
        attachments: "" // Empty string as specified
      };
      
      // Make the API call to the correct endpoint
      const response = await axios.post('http://localhost:8383/api/ticket/createticket', ticketData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authentication': token 
        }
      });
      
      console.log('Ticket created successfully:', response.data);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error creating ticket:', err);
      setApiError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, onClose, validateForm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#222831] bg-opacity-50 flex items-center justify-center z-50" 
           role="dialog"
           aria-modal="true">
        <motion.div 
          className="border-[2px] border-[#393E46] rounded-lg bg-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#393E46] flex justify-between items-center">
            <h2 className="font-medium text-[25px] text-gray-800">Create New Ticket</h2>
            <button 
              onClick={onClose}
              className="text-[#393E46] hover:text-[#222831] transition-colors"
              aria-label="Close modal"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md"
                   role="alert">
                Ticket created successfully!
              </div>
            )}
            
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md"
                   role="alert">
                {apiError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Title Input */}
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder=" "
                  value={formData.title}
                  onChange={handleChange}
                  aria-invalid={errors.title ? "true" : "false"}
                  className={`peer border-2 ${errors.title ? 'border-red-300' : 'border-gray-300'} p-2.5 rounded-md w-full
                            transition-all duration-300 focus:border-[#00ADB5]
                            focus:outline-none focus:ring-2 focus:ring-[#00ADB5]`}
                />
                <span className="absolute left-3 top-2.5 transition-all duration-300 pointer-events-none text-gray-500
                               peer-focus:text-sm peer-focus:text-[#00ADB5] peer-focus:-top-2.5 peer-focus:bg-white peer-focus:px-1
                               peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base
                               peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-[#00ADB5] peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1">
                  Title <span className="text-red-500">*</span>
                </span>
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder=" "
                  value={formData.description}
                  onChange={handleChange}
                  className="peer border-2 border-gray-300 p-2.5 rounded-md w-full
                            transition-all duration-300 focus:border-[#00ADB5]
                            focus:outline-none focus:ring-2 focus:ring-[#00ADB5] resize-none"
                ></textarea>
                <span className="absolute left-3 top-2.5 transition-all duration-300 pointer-events-none text-gray-500
                               peer-focus:text-sm peer-focus:text-[#00ADB5] peer-focus:-top-2.5 peer-focus:bg-white peer-focus:px-1
                               peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base
                               peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:text-[#00ADB5] peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1">
                  Description
                </span>
              </div>

              {/* Status, Priority, Type - First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2.5 rounded-md w-full
                              transition-all duration-300 focus:border-[#00ADB5]
                              focus:outline-none focus:ring-2 focus:ring-[#00ADB5]
                              appearance-none bg-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <label htmlFor="status" className="absolute left-3 -top-2.5 text-sm font-medium text-[#00ADB5] bg-white px-1">
                    Status
                  </label>
                </div>

                {/* Priority */}
                <div className="relative">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2.5 rounded-md w-full
                              transition-all duration-300 focus:border-[#00ADB5]
                              focus:outline-none focus:ring-2 focus:ring-[#00ADB5]
                              appearance-none bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <label htmlFor="priority" className="absolute left-3 -top-2.5 text-sm font-medium text-[#00ADB5] bg-white px-1">
                    Priority
                  </label>
                </div>

                {/* Type */}
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2.5 rounded-md w-full
                              transition-all duration-300 focus:border-[#00ADB5]
                              focus:outline-none focus:ring-2 focus:ring-[#00ADB5]
                              appearance-none bg-white"
                  >
                    <option value="Bug">Bug</option>
                    <option value="Feature">Feature</option>
                    <option value="Task">Task</option>
                    <option value="Improvement">Improvement</option>
                  </select>
                  <label htmlFor="type" className="absolute left-3 -top-2.5 text-sm font-medium text-[#00ADB5] bg-white px-1">
                    Type
                  </label>
                </div>
              </div>

              {/* Assigned User, Team, Due Date - Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Assigned User */}
                <div className="relative">
                  <select
                    id="assigned_user"
                    name="assigned_user"
                    value={formData.assigned_user}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2.5 rounded-md w-full
                              transition-all duration-300 focus:border-[#00ADB5]
                              focus:outline-none focus:ring-2 focus:ring-[#00ADB5]
                              appearance-none bg-white"
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.uid} value={user.uid}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="assigned_user" className="absolute left-3 -top-2.5 text-sm font-medium text-[#00ADB5] bg-white px-1">
                    Assigned User
                  </label>
                </div>

                {/* Team */}
                <div className="relative">
                  <select
                    id="team_id"
                    name="team_id"
                    value={formData.team_id}
                    onChange={handleChange}
                    className="border-2 border-gray-300 p-2.5 rounded-md w-full
                              transition-all duration-300 focus:border-[#00ADB5]
                              focus:outline-none focus:ring-2 focus:ring-[#00ADB5]
                              appearance-none bg-white"
                  >
                    <option value="">Select Team</option>
                    {teams.map(team => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="team_id" className="absolute left-3 -top-2.5 text-sm font-medium text-[#00ADB5] bg-white px-1">
                    Team
                  </label>
                </div>

                {/* Due Date */}
                <div className="relative">
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} 
                    className="border-2 border-gray-300 p-2.5 rounded-md w-full
                              transition-all duration-300 focus:border-[#00ADB5]
                              focus:outline-none focus:ring-2 focus:ring-[#00ADB5]
                              appearance-none bg-white"
                  />
                  <label htmlFor="due_date" className="absolute left-3 -top-2.5 text-sm font-medium text-[#00ADB5] bg-white px-1">
                    Due Date
                  </label>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-[#222831] mb-2">
                  Attachments
                </label>
                
                <div className="relative border-2 border-dashed border-gray-300 rounded-md transition-all duration-300 hover:border-[#00ADB5] p-6">
                  <div className="flex flex-col items-center justify-center">
                    <FaPaperclip className="text-gray-500 mb-2" size={24} />
                    <p className="text-sm text-gray-500 mb-1">Drag & drop files here or click to browse</p>
                    <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="cursor-pointer absolute inset-0 opacity-0"
                    onChange={handleFileChange}
                  />
                </div>
                {errors.attachments && (
                  <p className="mt-1 text-xs text-red-500">{errors.attachments}</p>
                )}

                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-[#222831]">Selected Files:</p>
                    <div className="border-2 border-gray-300 rounded-md max-h-40 overflow-y-auto divide-y">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <FaPaperclip className="text-gray-500 mr-2" size={14} />
                            <span className="text-sm text-[#222831] truncate max-w-[200px]">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            aria-label={`Remove file ${file.name}`}
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer with action buttons */}
          <div className="px-6 py-4 border-t border-[#393E46] flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 text-[#222831] bg-gray-100 font-medium rounded-md
                        transition-all duration-300 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`bg-[#00ADB5] py-2.5 px-4 text-white font-medium rounded-md
                        transition-all duration-300 hover:bg-[#009da5]
                        active:scale-95 hover:shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTicket;