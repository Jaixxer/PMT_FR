import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Fixed import path
import { 
  FaSearch, FaFilter, FaUser, FaCalendarAlt, FaExclamationCircle, 
  FaCheck, FaClock, FaChevronDown, FaChevronUp, FaChevronRight, // Added missing icon
  FaTimes, FaSortAmountDown, FaSortAmountUp, FaEye, FaEdit, 
  FaTrash, FaSort, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';

const TaskPage = () => {
  // States
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortOrder, setSortOrder] = useState({ field: 'due_date', direction: 'asc' });
  
  // Filter options
  const [filters, setFilters] = useState({
    priority: [],
    status: [],
    dueDate: null,
    assignee: null
  });
  
  // Filter option arrays
  const priorityOptions = ['High', 'Medium', 'Low'];
  const statusOptions = ['Not Started', 'In Progress', 'Under Review', 'Completed'];
  const dueDateOptions = [
    { label: 'Overdue', value: 'overdue' },
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'No due date', value: 'none' }
  ];
  
  // Helper function for safe date parsing
  const parseDateSafely = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return null;
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'No Due Date') return 'No due date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'No due date';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'No due date';
    }
  };
  
  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('Authentication');
      
      const response = await axios.post(
        'http://localhost:8383/api/tasks/gettasks',
        {
          project_id: '259624da-1917-42e2-8d30-834e0a68b875'
        },
        {
          headers: {
            Authentication: token
          }
        }
      );
      
      const fetchedTasks = response.data?.tasks?.map((task) => {
        const formattedDate = task.due_date ? task.due_date : 'No Due Date';
        
        return {
          ...task,
          due_date: formattedDate,
          status: task.status || 'Not Started',
          expanded: false
        };
      }) || [];
      
      setTasks(fetchedTasks);
      setFilteredTasks(fetchedTasks);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to tasks
  const applyFilters = () => {
    let result = [...tasks];
    const activeFilterLabels = [];
    
    // Search filter
    if (searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      activeFilterLabels.push(`Search: "${searchQuery}"`);
    }
    
    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter(task => filters.priority.includes(task.priority));
      activeFilterLabels.push(`Priority: ${filters.priority.join(', ')}`);
    }
    
    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status));
      activeFilterLabels.push(`Status: ${filters.status.join(', ')}`);
    }
    
    // Due date filter
    if (filters.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const monthStart = new Date(today);
      monthStart.setDate(1);
      
      result = result.filter(task => {
        if (filters.dueDate === 'none') {
          return !task.due_date || task.due_date === 'No Due Date';
        }
        
        const dueDate = parseDateSafely(task.due_date);
        if (!dueDate) return filters.dueDate === 'none';
        
        switch (filters.dueDate) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'week':
            return dueDate >= weekStart && dueDate <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          case 'month':
            const nextMonthStart = new Date(monthStart);
            nextMonthStart.setMonth(monthStart.getMonth() + 1);
            return dueDate >= monthStart && dueDate < nextMonthStart;
          default:
            return true;
        }
      });
      
      const option = dueDateOptions.find(o => o.value === filters.dueDate);
      activeFilterLabels.push(`Due: ${option?.label || filters.dueDate}`);
    }
    
    // Assignee filter
    if (filters.assignee) {
      result = result.filter(task => 
        task.assigned_user?.name === filters.assignee || 
        (!task.assigned_user && filters.assignee === 'Unassigned')
      );
      activeFilterLabels.push(`Assignee: ${filters.assignee}`);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const field = sortOrder.field;
      
      // Handle different field types for sorting
      if (field === 'due_date') {
        const dateA = parseDateSafely(a[field]) || new Date(8640000000000000); // Max date if no due date
        const dateB = parseDateSafely(b[field]) || new Date(8640000000000000);
        return sortOrder.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } 
      else if (field === 'priority') {
        const priorityMap = { High: 3, Medium: 2, Low: 1 };
        const valA = priorityMap[a[field]] || 0;
        const valB = priorityMap[b[field]] || 0;
        return sortOrder.direction === 'asc' ? valA - valB : valB - valA;
      }
      else {
        const valA = a[field] || '';
        const valB = b[field] || '';
        return sortOrder.direction === 'asc' 
          ? valA.toString().localeCompare(valB.toString())
          : valB.toString().localeCompare(valA.toString());
      }
    });
    
    setFilteredTasks(result);
    setActiveFilters(activeFilterLabels);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priority: [],
      status: [],
      dueDate: null,
      assignee: null
    });
    setSearchQuery('');
    setActiveFilters([]);
    setFilteredTasks(tasks);
  };
  
  // Remove a single filter
  const removeFilter = (filterType) => {
    const updatedFilters = { ...filters };
    
    if (filterType.startsWith('Priority')) {
      updatedFilters.priority = [];
    } else if (filterType.startsWith('Status')) {
      updatedFilters.status = [];
    } else if (filterType.startsWith('Due')) {
      updatedFilters.dueDate = null;
    } else if (filterType.startsWith('Assignee')) {
      updatedFilters.assignee = null;
    } else if (filterType.startsWith('Search')) {
      setSearchQuery('');
    }
    
    setFilters(updatedFilters);
  };
  
  // Toggle item selection in array filters
  const toggleArrayFilter = (filterType, value) => {
    const updatedFilters = { ...filters };
    
    if (updatedFilters[filterType].includes(value)) {
      updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== value);
    } else {
      updatedFilters[filterType] = [...updatedFilters[filterType], value];
    }
    
    setFilters(updatedFilters);
  };
  
  // Change sorting
  const handleSort = (field) => {
    if (sortOrder.field === field) {
      setSortOrder({
        field,
        direction: sortOrder.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortOrder({ field, direction: 'asc' });
    }
  };
  
  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-teal-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Status color and icon mapping
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Completed':
        return { 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-800',
          icon: <FaCheck className="mr-1" />
        };
      case 'In Progress':
        return { 
          bgColor: 'bg-yellow-100', 
          textColor: 'text-yellow-800',
          icon: <FaClock className="mr-1" /> 
        };
      case 'Under Review':
        return { 
          bgColor: 'bg-purple-100', 
          textColor: 'text-purple-800',
          icon: <FaEye className="mr-1" /> 
        };
      default:
        return { 
          bgColor: 'bg-gray-100', 
          textColor: 'text-[#393E46]',
          icon: <FaClock className="mr-1" /> 
        };
    }
  };
  
  // Due date status and color
  const getDueDateStatus = (dateString) => {
    if (!dateString || dateString === 'No Due Date') {
      return { 
        status: 'No due date',
        color: 'text-gray-500' 
      };
    }
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if due date is in the past
    if (dueDate < today) {
      return { 
        status: 'Overdue',
        color: 'text-red-600',
        icon: <FaExclamationTriangle className="mr-1 text-red-600" />
      };
    }
    
    // Check if due date is today
    if (dueDate.toDateString() === today.toDateString()) {
      return { 
        status: 'Due today',
        color: 'text-amber-600',
        icon: <FaExclamationCircle className="mr-1 text-amber-600" />
      };
    }
    
    // Check if due date is within next 3 days
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    if (dueDate <= threeDaysLater) {
      return { 
        status: 'Due soon',
        color: 'text-amber-500',
        icon: <FaClock className="mr-1 text-amber-500" />
      };
    }
    
    return { 
      status: 'Upcoming',
      color: 'text-blue-600',
      icon: <FaCalendarAlt className="mr-1 text-blue-600" />
    };
  };
  
  // Toggle task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };
  
  // Get unique assignees for filter
  const getUniqueAssignees = () => {
    const assignees = new Set();
    assignees.add('Unassigned');
    
    tasks.forEach(task => {
      if (task.assigned_user?.name) {
        assignees.add(task.assigned_user.name);
      }
    });
    
    return Array.from(assignees);
  };
  
  // Effect to fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Effect to apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [tasks, filters, searchQuery, sortOrder]);
  
  return (
    <div className="min-h-screen bg-[#EEEEEE]/30 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#222831]">Project Tasks</h1>
        <p className="text-[#393E46] mt-1">Manage and track all tasks across your project</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-grow max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
          
          {/* Filter Toggle Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== null) 
                ? 'bg-[#00ADB5]/10 border-[#00ADB5]/30 text-[#00ADB5]' 
                : 'border-gray-200 text-[#393E46]'
            } hover:bg-[#00ADB5]/20 transition-colors`}
          >
            <FaFilter className="mr-2" />
            Filters
            {showFilters ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
          
          {/* Sort Button */}
          <div className="relative">
            <button 
              onClick={() => handleSort('due_date')}
              className="flex items-center px-4 py-2 rounded-lg border border-gray-200 text-[#393E46] hover:bg-gray-50 transition-colors"
            >
              {sortOrder.direction === 'asc' ? <FaSortAmountUp className="mr-2" /> : <FaSortAmountDown className="mr-2" />}
              {sortOrder.field === 'due_date' && 'Due Date'}
              {sortOrder.field === 'priority' && 'Priority'}
              {sortOrder.field === 'status' && 'Status'}
              {sortOrder.field === 'title' && 'Title'}
            </button>
            
            {/* Sort Options Menu */}
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
              <div className="py-1">
                <button 
                  onClick={() => handleSort('due_date')} 
                  className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 ${sortOrder.field === 'due_date' ? 'text-[#00ADB5]' : 'text-[#393E46]'}`}
                >
                  <FaSort className="mr-2" />
                  Due Date
                </button>
                <button 
                  onClick={() => handleSort('priority')}
                  className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 ${sortOrder.field === 'priority' ? 'text-[#00ADB5]' : 'text-[#393E46]'}`}
                >
                  <FaSort className="mr-2" />
                  Priority
                </button>
                <button 
                  onClick={() => handleSort('status')}
                  className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 ${sortOrder.field === 'status' ? 'text-[#00ADB5]' : 'text-[#393E46]'}`}
                >
                  <FaSort className="mr-2" />
                  Status
                </button>
                <button 
                  onClick={() => handleSort('title')}
                  className={`flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 ${sortOrder.field === 'title' ? 'text-[#00ADB5]' : 'text-[#393E46]'}`}
                >
                  <FaSort className="mr-2" />
                  Title
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4 pt-4 border-t border-gray-100">
                {/* Priority Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                  <div className="space-y-1">
                    {priorityOptions.map(priority => (
                      <label key={priority} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priority.includes(priority)}
                          onChange={() => toggleArrayFilter('priority', priority)}
                          className="rounded text-[#00ADB5] focus:ring-[#00ADB5] mr-2"
                        />
                        <div className={`h-2 w-2 rounded-full mr-2 ${getPriorityColor(priority)}`}></div>
                        <span className="text-sm text-[#393E46]">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Status Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                  <div className="space-y-1">
                    {statusOptions.map(status => {
                      const statusInfo = getStatusInfo(status);
                      return (
                        <label key={status} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => toggleArrayFilter('status', status)}
                            className="rounded text-[#00ADB5] focus:ring-[#00ADB5] mr-2"
                          />
                          <span className={`text-sm flex items-center ${statusInfo.textColor}`}>
                            {statusInfo.icon}
                            {status}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                {/* Due Date Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Due Date</h4>
                  <div className="space-y-1">
                    {dueDateOptions.map(option => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="dueDate"
                          checked={filters.dueDate === option.value}
                          onChange={() => setFilters({ ...filters, dueDate: option.value })}
                          className="rounded-full text-[#00ADB5] focus:ring-[#00ADB5] mr-2"
                        />
                        <span className="text-sm text-[#393E46]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Assignee Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assignee</h4>
                  <div className="space-y-1">
                    {getUniqueAssignees().map(assignee => (
                      <label key={assignee} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="assignee"
                          checked={filters.assignee === assignee}
                          onChange={() => setFilters({ ...filters, assignee: assignee })}
                          className="rounded-full text-[#00ADB5] focus:ring-[#00ADB5] mr-2"
                        />
                        <div className="flex items-center">
                          <FaUser size={12} className="mr-1.5 text-[#393E46]" />
                          <span className="text-sm text-[#393E46]">{assignee}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-[#393E46] hover:text-[#00ADB5] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div 
                key={index}
                className="bg-[#00ADB5]/10 text-[#00ADB5] text-sm px-3 py-1 rounded-full flex items-center"
              >
                <span>{filter}</span>
                <button 
                  onClick={() => removeFilter(filter)}
                  className="ml-2 hover:text-[#393E46] transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            {activeFilters.length > 1 && (
              <button 
                onClick={clearAllFilters}
                className="text-sm text-[#393E46] hover:text-[#00ADB5] transition-colors px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Tasks Table/List */}
      <div className="bg-white rounded-xl shadow-md">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-base">
            Loading tasks...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">
            {error}
            <button 
              onClick={fetchTasks}
              className="mt-4 px-4 py-2 bg-[#00ADB5] text-white rounded-lg hover:bg-[#00ADB5]/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-base">
            No tasks match your filters.
            {activeFilters.length > 0 && (
              <button 
                onClick={clearAllFilters}
                className="block mx-auto mt-4 px-4 py-2 bg-[#00ADB5] text-white rounded-lg hover:bg-[#00ADB5]/90 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Task</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('priority')}>
                      Priority
                      {sortOrder.field === 'priority' && (
                        sortOrder.direction === 'asc' ? 
                          <FaChevronUp className="ml-1" size={12} /> : 
                          <FaChevronDown className="ml-1" size={12} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                      Status
                      {sortOrder.field === 'status' && (
                        sortOrder.direction === 'asc' ? 
                          <FaChevronUp className="ml-1" size={12} /> : 
                          <FaChevronDown className="ml-1" size={12} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('due_date')}>
                      Due Date
                      {sortOrder.field === 'due_date' && (
                        sortOrder.direction === 'asc' ? 
                          <FaChevronUp className="ml-1" size={12} /> : 
                          <FaChevronDown className="ml-1" size={12} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Assignee</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const statusInfo = getStatusInfo(task.status);
                  const dueDateInfo = getDueDateStatus(task.due_date);
                  
                  return (
                    <React.Fragment key={task.id}>
                      <tr 
                        className={`hover:bg-gray-50 ${expandedTask === task.id ? 'bg-gray-50' : ''}`}
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {expandedTask === task.id ? 
                              <FaChevronDown className="text-gray-400 mr-2" /> : 
                              <FaChevronRight className="text-gray-400 mr-2" />
                            }
                            <div>
                              <div className="font-medium text-[#222831]">{task.title}</div>
                              {!expandedTask === task.id && task.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`h-3 w-3 rounded-full ${getPriorityColor(task.priority)} mr-2`}></div>
                            <span>{task.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                            {statusInfo.icon}
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center ${dueDateInfo.color}`}>
                            {dueDateInfo.icon && dueDateInfo.icon}
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {task.assigned_user ? (
                              <>
                                <div className="w-6 h-6 rounded-full bg-[#00ADB5]/20 flex items-center justify-center text-[#00ADB5] text-xs mr-2">
                                  {task.assigned_user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate max-w-[100px]">{task.assigned_user.name}</span>
                              </>
                            ) : (
                              <span className="text-gray-500">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('View task:', task.id);
                              }}
                              className="p-1 text-[#393E46] hover:text-[#00ADB5] transition-colors"
                            >
                              <FaEye size={16} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Edit task:', task.id);
                              }}
                              className="p-1 text-[#393E46] hover:text-[#00ADB5] transition-colors"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Delete task:', task.id);
                              }}
                              className="p-1 text-[#393E46] hover:text-red-500 transition-colors"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      <AnimatePresence>
                        {expandedTask === task.id && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="border-l-2 border-[#00ADB5] pl-4">
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
                                  {task.description || 'No description provided'}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Task Details</h4>
                                    <div className="space-y-1">
                                      <div className="flex">
                                        <span className="text-sm text-gray-500 w-24">Created:</span>
                                        <span className="text-sm">{formatDate(task.created_at || new Date())}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="text-sm text-gray-500 w-24">Last Updated:</span>
                                        <span className="text-sm">{formatDate(task.updated_at || new Date())}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="text-sm text-gray-500 w-24">Task ID:</span>
                                        <span className="text-sm">{task.id}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Actions</h4>
                                    <div className="flex space-x-2">
                                      <button className="px-3 py-1 bg-[#00ADB5] text-white text-sm rounded hover:bg-[#00ADB5]/90 transition-colors">
                                        Update Status
                                      </button>
                                      <button className="px-3 py-1 bg-[#393E46] text-white text-sm rounded hover:bg-[#393E46]/90 transition-colors">
                                        Reassign
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPage;