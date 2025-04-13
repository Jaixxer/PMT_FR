import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import TasksCard from './components/tasksCard';
import CreateTicket from '../components/Tickets/CreateTicket';
import TicketsCard from '../components/Tickets/TicketsCard';
import { FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import TaskCreation from '../Tasks/taskCreation';

const Dashboard = () => {
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEEEEE]/30">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <div 
          className="flex-1 p-6 mt-16 transition-all duration-300 ease-in-out"
          style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
        >
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#222831]">Project Dashboard</h1>
            <p className="text-[#393E46]">Welcome to your project management dashboard</p>
          </div>
          
          {/* Container with fixed height */}
          <div className="relative h-[calc(100vh-150px)]">
            {/* Tasks Card - Left 25% */}
            <div className="absolute left-0 top-0 bottom-0 w-1/4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-[#222831]">Project Tasks</h2>
                <motion.button 
                  className="p-2 bg-[#00ADB5] rounded-full text-white shadow-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsTaskOpen(true)} // Changed to open TaskCreation
                >
                  <FaPlus size={12} />
                </motion.button>
              </div>
              <TasksCard />
            </div>
            
            {/* Tickets Card - Exactly 50px offset from center, bottom 25% */}
            <div className="absolute" style={{ left: 'calc(50% + 50px)', bottom: '25%', transform: 'translateX(0)' }}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-[#222831]">Project Tickets</h2>
                <motion.button 
                  className="p-2 bg-[#00ADB5] rounded-full text-white shadow-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateTicketOpen(true)} // Changed to open CreateTicket
                >
                  <FaPlus size={12} />
                </motion.button>
              </div>
              <div className="horizontal-ticket-container">
                <TicketsCard />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <TaskCreation isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} />
      {/* Create Ticket Modal */}
      <CreateTicket 
        isOpen={isCreateTicketOpen} 
        onClose={() => setIsCreateTicketOpen(false)}
      />
      
      {/* Horizontal rectangular shape transformation for tickets card */}
      <style jsx>{`
        .horizontal-ticket-container {
          width: 40vw; /* Cover significant width of screen */
          transform-origin: left;
        }
        .horizontal-ticket-container > div {
          width: 100%;
          height: 320px; /* Less tall than before */
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
