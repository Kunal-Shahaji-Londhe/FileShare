// components/RoomInfo.jsx
import { motion } from 'framer-motion';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { useState } from 'react';

const RoomInfo = ({ roomInfo }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomInfo.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Room Information</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-dark-300">Active</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-dark-300">Room ID</p>
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-dark-600 text-white px-4 py-2 rounded-lg font-mono">
            {roomInfo.roomId}
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-dark-300">Share Link</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={roomInfo.shareUrl}
            readOnly
            className="flex-1 bg-dark-600 text-white px-4 py-2 rounded-lg truncate"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="p-2 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
          >
            {copied ? (
              <FiCheck className="w-5 h-5 text-green-500" />
            ) : (
              <FiCopy className="w-5 h-5 text-dark-300" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoomInfo;
  