// components/FileTransfer.jsx
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiSend, FiCheck } from 'react-icons/fi';

const FileTransfer = ({ file, setFile, sendFile, progress, isInitiator, connected, onSendComplete, sentFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localConnected, setLocalConnected] = useState(false);

  // Update local connected state when prop changes
  useEffect(() => {
    console.log('FileTransfer: Connected prop changed:', connected);
    setLocalConnected(connected);
  }, [connected]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, [setFile]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSendFile = () => {
    if (!connected) {
      alert('Please wait for the connection to be established before sending files.');
      return;
    }
    sendFile(file, () => {
      onSendComplete(file);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-white"
      >
        {isInitiator ? 'Send File' : 'Receive File'}
      </motion.h2>
      
      {isInitiator ? (
        <>
          {!file ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-400 hover:border-primary-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-3">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex justify-center"
                >
                  <FiUpload className="w-12 h-12 text-dark-300" />
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-dark-300"
                >
                  Drag and drop your file here, or{' '}
                  <label
                    htmlFor="file-upload"
                    className="text-primary-400 cursor-pointer hover:text-primary-300"
                  >
                    browse
                  </label>
                </motion.p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-600 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center"
                  >
                    <FiUpload className="w-5 h-5 text-primary-400" />
                  </motion.div>
                  <div>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white font-medium"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-dark-300"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-dark-500 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-dark-300" />
                </motion.button>
              </div>

              {progress > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-dark-300 mt-1 text-right"
                  >
                    {progress}% complete
                  </motion.p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendFile}
                disabled={!connected}
                className={`w-full mt-4 py-2 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium shadow-glow hover:shadow-lg transition-all duration-300 ${
                  !connected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {connected ? 'Send File' : 'Waiting for connection...'}
              </motion.button>
            </motion.div>
          )}

          {sentFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Sent Files</h3>
              <div className="space-y-3">
                {sentFiles.map((sentFile, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-dark-600/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <FiCheck className="text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">{sentFile.name}</div>
                        <div className="text-sm text-gray-400">
                          {(sentFile.size / (1024 * 1024)).toFixed(2)} MB • {sentFile.date}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-dark-600 rounded-xl p-6 text-center"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-4"
          >
            <FiSend className="w-12 h-12 text-secondary-400" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-dark-300"
          >
            Waiting for sender to share a file...
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileTransfer;
  