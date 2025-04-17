// src/App.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiDownload, FiShare2, FiX, FiCheck } from 'react-icons/fi';
import Header from './components/Header';
import RoomInfo from './components/RoomInfo';
import ConnectionCard from './components/ConnectionCard';
import FileTransfer from './components/FileTransfer';
import ReceivedFiles from './components/ReceivedFiles';
import useWebRTC from './hooks/useWebRTC';

function App() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [file, setFile] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [status, setStatus] = useState('Not Connected');
  const [showFileTransfer, setShowFileTransfer] = useState(false);

  // Check if joining from a shared URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      setRoomInfo({
        roomId,
        shareUrl: window.location.href,
      });
      setIsInitiator(false);
      setShowFileTransfer(true); // Show file transfer UI for joiner
    }
  }, []);

  const { connected, sendFile, progress } = useWebRTC(
    roomInfo?.roomId,
    isInitiator,
    (receivedFile) => {
      setReceivedFiles((prev) => [...prev, receivedFile]);
    },
    (status) => {
      setStatus(status);
      if (status === 'Connected') {
        setShowFileTransfer(true);
      }
    }
  );

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 8);
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    setRoomInfo({ roomId, shareUrl });
    setIsInitiator(true);
    setShowFileTransfer(true); // Show file transfer UI for creator
  };

  const handleDisconnect = () => {
    setRoomInfo(null);
    setIsInitiator(false);
    setFile(null);
    setReceivedFiles([]);
    setSentFiles([]);
    setStatus('Not Connected');
    setShowFileTransfer(false);
  };

  const handleRemoveFile = (index) => {
    setReceivedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendFile = (file) => {
    setSentFiles(prev => [...prev, {
      name: file.name,
      size: file.size,
      date: new Date().toLocaleString()
    }]);
    setFile(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 text-white"
    >
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Header />
        
        <AnimatePresence>
          {roomInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-dark-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
            >
              <RoomInfo roomInfo={roomInfo} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-dark-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
        >
          <ConnectionCard
            connected={connected}
            status={status}
            onCreateRoom={handleCreateRoom}
            onDisconnect={handleDisconnect}
          />
        </motion.div>

        <AnimatePresence>
          {showFileTransfer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <motion.div
                className="bg-dark-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FileTransfer
                  file={file}
                  setFile={setFile}
                  sendFile={sendFile}
                  progress={progress}
                  isInitiator={isInitiator}
                  connected={connected}
                  onSendComplete={handleSendFile}
                  sentFiles={sentFiles}
                />
              </motion.div>

              <motion.div
                className="bg-dark-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ReceivedFiles 
                  receivedFiles={receivedFiles} 
                  isInitiator={isInitiator} 
                  onRemoveFile={handleRemoveFile} 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default App;
