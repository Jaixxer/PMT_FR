import React from 'react';
import { FaBell, FaQuestionCircle, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TopBar = () => {
  return (
    <div className="w-full h-16 bg-white fixed top-0 left-0 flex items-center justify-between px-6 
                  shadow-md z-50 border-b-[2px] border-[#393E46] transition-all duration-300 ease-in-out hover:shadow-lg">
      {/* Logo */}
      <motion.div 
        className="text-2xl font-bold text-[#222831]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        PMT
      </motion.div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <motion.div 
          className="text-[#393E46] hover:text-[#00ADB5] cursor-pointer transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaBell size={18} />
        </motion.div>

        {/* Help Icon */}
        <motion.div 
          className="text-[#393E46] hover:text-[#00ADB5] cursor-pointer transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaQuestionCircle size={18} />
        </motion.div>

        {/* Settings Icon */}
        <motion.div 
          className="text-[#393E46] hover:text-[#00ADB5] cursor-pointer transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaCog size={18} />
        </motion.div>

        {/* Profile Section */}
        <div className="flex items-center gap-3 ml-2">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#393E46] hover:border-[#00ADB5] transition-all duration-300">
            <img
              src="https://via.placeholder.com/40"
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#222831]">John Doe</span>
            <span className="text-xs text-[#393E46]">Project Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;