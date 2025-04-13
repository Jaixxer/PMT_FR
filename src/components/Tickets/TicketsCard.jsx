import React, { useEffect, useState, useRef } from 'react';
import { 
  FaUser, FaClock, FaExternalLinkAlt, FaEdit, FaTrash, FaEllipsisV, 
  FaBug, FaStar, FaTasks, FaArrowUp 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TicketsCard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  // Status color mapping
  const statusColors = {
    'Open': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Review': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800'
  };

  // Priority color mapping
  const priorityColors = {
    'Low': 'bg-teal-500',
    'Medium': 'bg-amber-500',
    'High': 'bg-red-500'
  };

  // Type icon mapping using professional FontAwesome icons
  const typeIcons = {
    'Bug': <FaBug className="text-red-600" />,
    'Feature': <FaStar className="text-amber-500" />,
    'Task': <FaTasks className="text-blue-600" />,
    'Improvement': <FaArrowUp className="text-green-600" />
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

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
      console.error("Error parsing date:", dateString);
      return 'No due date';
    }
  };

  // Sort tickets by priority and due date
  const sortTickets = (ticketsArray) => {
    const today = new Date().toISOString().split('T')[0];
    
    return ticketsArray.sort((a, b) => {
      // Sort by due date (tickets due today first)
      const aDueDate = a.due_date ? new Date(a.due_date).toISOString().split('T')[0] : null;
      const bDueDate = b.due_date ? new Date(b.due_date).toISOString().split('T')[0] : null;
      
      // Handle null due dates
      if (aDueDate === null && bDueDate !== null) return 1;
      if (aDueDate !== null && bDueDate === null) return -1;
      
      // Sort by today's date first
      if (aDueDate === today && bDueDate !== today) return -1;
      if (aDueDate !== today && bDueDate === today) return 1;
      
      // Sort by priority (High > Medium > Low)
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      if (priorityOrder[a.priority] < priorityOrder[b.priority]) return -1;
      if (priorityOrder[a.priority] > priorityOrder[b.priority]) return 1;
      
      return 0;
    });
  };

  // Fetch tickets from the API
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('Authentication');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      // Fixed API call structure - headers go in the third parameter
      const response = await axios.post(
        'http://localhost:8383/api/ticket/gettickets',
        { project_id: "259624da-1917-42e2-8d30-834e0a68b875" },
        { headers: { Authentication: token } }
      );
      
      // Process the tickets data
      const fetchedTickets = response.data?.tickets || [];
      setTickets(sortTickets(fetchedTickets));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Handle actions
  const handleView = (ticketId) => {
    console.log('View ticket:', ticketId);
    setActiveMenu(null);
    // Implement view action
  };

  const handleEdit = (ticketId) => {
    console.log('Edit ticket:', ticketId);
    setActiveMenu(null);
    // Implement edit action
  };

  const handleDelete = (ticketId) => {
    console.log('Delete ticket:', ticketId);
    setActiveMenu(null);
    // Implement delete action
  };

  // Toggle menu for a ticket
  const toggleMenu = (ticketId) => {
    if (activeMenu === ticketId) {
      setActiveMenu(null);
    } else {
      setActiveMenu(ticketId);
    }
  };

  if (loading) {
    return (
      <div className="w-80 h-[480px] bg-white border-[2px] border-[#393E46] rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-gray-400 text-base">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 h-[480px] bg-white border-[2px] border-[#393E46] rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-red-500 text-base px-4 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-80 h-[320px] bg-white border-[2px] border-[#393E46] rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-[#EEEEEE] flex justify-between items-center">
        <h3 className="text-xl font-medium text-[#222831]">Tickets</h3>
        <div className="relative">
          <button 
            className="text-[#393E46] hover:text-[#222831] text-sm font-medium"
            onClick={() => setShowLegend(!showLegend)}
          >
            Priority Legend
          </button>
          
          <AnimatePresence>
            {showLegend && (
              <motion.div
                className="absolute right-0 top-8 bg-white border-[1px] border-[#393E46] shadow-md rounded-lg p-3 z-50 w-48"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2 text-sm">
                  <p className="font-medium mb-1 text-[#222831]">Priority Colors:</p>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <span>High Priority</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                    <span>Medium Priority</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-teal-500 mr-2"></div>
                    <span>Low Priority</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
        {tickets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-base">
            No tickets available
          </div>
        ) : (
          tickets.map((ticket, index) => (
            <motion.div
              key={ticket.ticket_id || index}
              className="bg-white border border-[#EEEEEE] rounded-lg p-3 hover:shadow-md transition-all duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Ticket Header with professional icon */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg">
                    {typeIcons[ticket.type] || <FaTasks className="text-gray-400" />}
                  </span>
                  <h4 className="text-base font-medium text-[#222831] truncate max-w-[160px]">
                    {ticket.title || 'Untitled Ticket'}
                  </h4>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    priorityColors[ticket.priority] || 'bg-gray-400'
                  }`}
                  title={`${ticket.priority || 'Unknown'} Priority`}
                ></div>
              </div>
              
              {/* Status */}
              <div className="mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  statusColors[ticket.status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status || 'Unknown'}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-sm text-[#393E46] line-clamp-2 mb-2">
                {ticket.description || 'No description provided'}
              </p>
              
              {/* Footer Info */}
              <div className="flex justify-between items-center mt-2">
                {/* Assigned User */}
                <div className="flex items-center text-xs text-[#393E46]">
                  <FaUser size={10} className="mr-1 text-[#393E46]" />
                  <span className="truncate max-w-[100px]">
                    {ticket.assigned_user?.name || 'Unassigned'}
                  </span>
                </div>
                
                {/* Due Date */}
                <div className="flex items-center text-xs text-[#393E46]">
                  <FaClock size={10} className="mr-1" />
                  <span>{formatDate(ticket.due_date)}</span>
                </div>
              </div>
              
              {/* Action Buttons with Three-Dot Menu */}
              <div className="mt-2 pt-2 border-t border-[#EEEEEE] flex justify-end">
                <div className="relative" ref={menuRef}>
                  {/* View button remains directly accessible */}
                  <motion.button
                    onClick={() => handleView(ticket.ticket_id)}
                    className="p-1.5 text-[#393E46] hover:text-[#00ADB5] transition-colors ml-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaExternalLinkAlt size={12} />
                  </motion.button>
                  
                  {/* Three dots menu button */}
                  <motion.button
                    onClick={() => toggleMenu(ticket.ticket_id)}
                    className="p-1.5 text-[#393E46] hover:text-[#222831] transition-colors ml-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEllipsisV size={12} />
                  </motion.button>
                  
                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {activeMenu === ticket.ticket_id && (
                      <motion.div
                        className="absolute right-0 bottom-full mb-1 bg-white border border-[#EEEEEE] shadow-md rounded-md py-1 z-50"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <button
                          onClick={() => handleEdit(ticket.ticket_id)}
                          className="flex items-center px-4 py-2 text-sm text-[#393E46] hover:bg-[#EEEEEE] w-full text-left"
                        >
                          <FaEdit size={12} className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.ticket_id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-[#EEEEEE] w-full text-left"
                        >
                          <FaTrash size={12} className="mr-2" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketsCard;