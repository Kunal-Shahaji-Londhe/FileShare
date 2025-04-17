// components/Header.jsx
import { motion } from 'framer-motion';
import { FiShare2 } from 'react-icons/fi';

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex items-center space-x-3"
      >
        <motion.div
          className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <FiShare2 className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
          >
            FileShare
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-dark-300 text-sm"
          >
            Secure peer-to-peer file sharing
          </motion.p>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
  