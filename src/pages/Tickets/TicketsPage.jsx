import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaFilter, FaSearch, FaSortAmountDown, FaSortAmountUp,
  FaBug, FaStar, FaTasks, FaArrowUp, FaUser, FaClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Status color mapping
  const statusColors = {
    'Open': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Review': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800'
  };

  // Priority color mapping
  const priorityColors = {
    'Low': 'bg-teal-500 text-white',
    'Medium': 'bg-amber-500 text-white',
    'High': 'bg-red-500 text-white'
  };

  // Type icon mapping
  const typeIcons = {
    'Bug': <FaBug className="text-red-600" />,
    'Feature': <FaStar className="text-amber-500" />,
    'Task': <FaTasks className="text-blue-600" />,
    'Improvement': <FaArrowUp className="text-green-600" />
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'No due date';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Check if a due date is approaching or overdue
  const getDueDateStatus = (dueDateStr) => {
    if (!dueDateStr) return '';
    
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    
    // Clear time portion for accurate day comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 font-medium'; // Overdue
    if (diffDays <= 2) return 'text-amber-600 font-medium'; // Due soon
    return ''; // Regular
  };

  // Fetch tickets from the API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('Authentication');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      // TODO: Replace with actual project ID (from context or route params)
      // For now we're using a hardcoded project ID
      const response = await axios.post(
        'http://localhost:8383/api/ticket/gettickets',
        { project_id: "259624da-1917-42e2-8d30-834e0a68b875" },
        { headers: { Authentication: token } }
      );
      
      if (response.data?.tickets) {
        setTickets(response.data.tickets);
        setError(null);
      } else {
        setTickets([]);
        setError('No tickets found');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter and sort tickets
  const getFilteredTickets = () => {
    return tickets
      .filter(ticket => {
        // Apply status filter if set
        if (filterStatus && ticket.status !== filterStatus) return false;
        
        // Apply priority filter if set
        if (filterPriority && ticket.priority !== filterPriority) return false;
        
        // Apply search query if set
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            ticket.title?.toLowerCase().includes(query) ||
            ticket.description?.toLowerCase().includes(query) ||
            ticket.assigned_user?.name?.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by creation date
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setSearchQuery('');
    setShowFilters(false);
  };

  const filteredTickets = getFilteredTickets();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#222831]">Tickets</h1>
        <p className="text-[#393E46] mt-2">Manage and track all project tickets</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="bg-white border border-gray-300 rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
            />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              showFilters 
                ? 'bg-[#00ADB5] text-white' 
                : 'bg-white border border-gray-300 text-[#393E46] hover:bg-gray-50'
            }`}
          >
            <FaFilter size={14} />
            <span>Filters</span>
          </button>
          
          {/* Sort Button */}
          <button
            onClick={toggleSortOrder}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center gap-2 text-[#393E46] hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'desc' ? (
              <>
                <FaSortAmountDown size={14} />
                <span>Newest</span>
              </>
            ) : (
              <>
                <FaSortAmountUp size={14} />
                <span>Oldest</span>
              </>
            )}
          </button>
        </div>
        
        {/* Create Ticket Button */}
        <Link to="/tickets/create">
          <button className="px-4 py-2 bg-[#00ADB5] text-white rounded-md flex items-center gap-2 hover:bg-[#00969e] transition-colors">
            <FaPlus size={14} />
            <span>Create Ticket</span>
          </button>
        </Link>
      </div>
      
      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-wrap gap-4 items-end">
              {/* Status Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              {/* Priority Filter */}
              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#00ADB5] focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ADB5]"></div>
        </div>
      ) : error && tickets.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-[#00ADB5] text-white rounded-md hover:bg-[#00969e] transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No tickets match your filters</p>
          {(filterStatus || filterPriority || searchQuery) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket, index) => (
                <motion.tr 
                  key={ticket.ticket_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Ticket Details */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <div className="text-lg mr-3 mt-0.5">
                        {typeIcons[ticket.type] || <FaTasks className="text-gray-400" />}
                      </div>
                      <div>
                        <div className="font-medium text-[#222831]">{ticket.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.description}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                      {ticket.status || 'Unknown'}
                    </span>
                  </td>
                  
                  {/* Priority */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800'}`}>
                      {ticket.priority || 'Unknown'}
                    </span>
                  </td>
                  
                  {/* Assigned To */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.assigned_user?.name || 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Due Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-2" />
                      <span className={`text-sm ${getDueDateStatus(ticket.due_date)}`}>
                        {formatDate(ticket.due_date)}
                      </span>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/tickets/${ticket.ticket_id}`} className="text-[#00ADB5] hover:text-[#00969e] mr-4">
                      View
                    </Link>
                    <Link to={`/tickets/edit/${ticket.ticket_id}`} className="text-gray-600 hover:text-gray-900">
                      Edit
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;