// components/ConnectionCard.jsx
import { motion } from 'framer-motion';
import { FiLink, FiX } from 'react-icons/fi';

const ConnectionCard = ({ connected, status, onCreateRoom, onDisconnect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-semibold text-white"
        >
          Connection Status
        </motion.h2>
        <div className="flex items-center space-x-2">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} 
          />
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-dark-300"
          >
            {status}
          </motion.span>
        </div>
      </div>

      {!connected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateRoom}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-glow hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <FiLink className="w-5 h-5" />
          <span>Create New Room</span>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDisconnect}
          className="w-full py-3 px-4 bg-dark-600 text-white rounded-xl font-medium hover:bg-dark-500 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <FiX className="w-5 h-5" />
          <span>Disconnect</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default ConnectionCard;
  