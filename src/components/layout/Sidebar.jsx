import React, { useState, useEffect } from 'react';
import { FaHome, FaTasks, FaThLarge, FaUsers, FaTicketAlt, FaChevronLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router';

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [textVisible, setTextVisible] = useState(true);
  const location = useLocation();
  
  // Set initial dimensions for a smooth first render
  useEffect(() => {
    // This ensures everything is properly sized on first render
    document.documentElement.style.setProperty('--sidebar-width', expanded ? '220px' : '70px');
  }, []);

  const toggleSidebar = () => {
    if (expanded) {
      setTextVisible(false);
      // Give text time to fade out before collapsing sidebar
      setTimeout(() => setExpanded(false), 150);
    } else {
      setExpanded(true);
      // Wait for sidebar to expand before showing text
      setTimeout(() => setTextVisible(true), 250);
    }
  };

  const navItems = [
    { icon: <FaHome size={18} />, label: 'Home', path: '/' },
    { icon: <FaTasks size={18} />, label: 'Tasks', path: '/tasks' },
    { icon: <FaThLarge size={18} />, label: 'Board', path: '/board' },
    { icon: <FaUsers size={18} />, label: 'Team Management', path: '/team/members' },
    { icon: <FaTicketAlt size={18} />, label: 'Tickets', path: '/tickets' },
  ];

  return (
    <motion.div 
      className="fixed top-0 left-0 h-full bg-white shadow-md pt-16 border-r-[2px] border-[#393E46] z-40
                transition-all duration-300 ease-in-out hover:shadow-lg"
      initial={{ width: expanded ? 220 : 70 }}
      animate={{ width: expanded ? 220 : 70 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onAnimationStart={() => {
        // Update CSS variable when animation starts
        document.documentElement.style.setProperty('--sidebar-width', expanded ? '220px' : '70px');
      }}
    >
      <div className="flex flex-col h-full">
        <ul className="px-2 py-4 space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link to={item.path} key={index} className="block">
                <motion.li
                  className={`flex items-center justify-start px-4 py-3 cursor-pointer rounded-md
                            text-[#222831] hover:bg-[#EEEEEE] transition-all duration-300
                            ${isActive ? 'bg-[#EEEEEE] text-[#00ADB5]' : ''}`}
                  whileHover={{ 
                    backgroundColor: '#EEEEEE',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Fixed width icon container - always at the left */}
                  <div className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-[#00ADB5]' : 'text-[#222831] hover:text-[#00ADB5]'}`}>
                    {item.icon}
                  </div>
                  
                  {/* Text container that appears/disappears but doesn't shift icon position */}
                  <AnimatePresence mode="wait">
                    {expanded && (
                      <motion.div 
                        className="overflow-hidden ml-4"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ 
                          width: textVisible ? "auto" : 0,
                          opacity: textVisible ? 1 : 0
                        }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className={`text-sm font-medium whitespace-nowrap block ${isActive ? 'text-[#00ADB5]' : 'text-[#222831]'}`}>
                          {item.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              </Link>
            );
          })}
        </ul>

        <motion.div 
          className="mt-auto mb-6 px-4 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EEEEEE] text-[#222831] 
                        hover:bg-[#00ADB5] hover:text-white transition-all duration-300">
            <motion.div
              animate={{ rotate: expanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronLeft size={14} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;