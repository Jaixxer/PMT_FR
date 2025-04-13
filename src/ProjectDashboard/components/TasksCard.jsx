import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser } from 'react-icons/fa';

const TasksCard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  // Helper function for safe date parsing
  const parseDateSafely = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error parsing date:", dateString);
      return null;
    }
  };

  // Helper function to sort tasks
  const sortTasks = (tasks) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    return tasks.sort((a, b) => {
      // Sort by due date (tasks due today first)
      const aDueDate = parseDateSafely(a.due_date);
      const bDueDate = parseDateSafely(b.due_date);

      // Handle null due dates (place them at the end)
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

  // Fetch tasks from the API
  const fetchTasks = async () => {
    try {
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
      
      // Add null check with optional chaining and additional error handling
      const fetchedTasks = response.data?.tasks?.map((task) => {
        // Format due date safely
        const formattedDate = task.due_date ? parseDateSafely(task.due_date) : 'No Due Date';
        
        return {
          ...task,
          due_date: formattedDate,
          status: 'Not Completed',
        };
      }) || [];

      setTasks(sortTasks(fetchedTasks));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[480px] bg-white border-[2px] border-[#393E46] rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-gray-400 text-base">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[480px] bg-white border-[2px] border-[#393E46] rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="px-6 py-5 border-b border-[#EEEEEE] flex justify-between items-center">
        <h3 className="text-xl font-medium text-[#222831]">Tasks</h3>
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
      
      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
        {tasks.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-base">
            No tasks available
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              className="bg-white border border-[#EEEEEE] rounded-lg p-4 hover:shadow-md transition-all duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-medium text-[#222831] truncate max-w-[180px]">{task.title}</h4>
                <div
                  className={`h-3 w-3 rounded-full ${
                    task.priority === 'High'
                      ? 'bg-red-500'
                      : task.priority === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`}
                  title={`${task.priority} Priority`}
                ></div>
              </div>
              
              {/* Assigned User */}
              <div className="flex items-center text-sm text-[#393E46] mb-2">
                <FaUser size={12} className="mr-1.5 text-[#393E46]" />
                <span className="truncate">
                  {task.assigned_user?.name || 'Unassigned'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-[#393E46]">
                  Due: {task.due_date}
                </div>
                <div
                  className={`text-sm px-3 py-1 rounded-full ${
                    task.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-[#393E46]'
                  }`}
                >
                  {task.status}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksCard;