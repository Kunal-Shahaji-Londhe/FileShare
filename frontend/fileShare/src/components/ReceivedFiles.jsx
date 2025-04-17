// components/ReceivedFiles.jsx
import { motion } from 'framer-motion';
import { FiDownload, FiTrash2 } from 'react-icons/fi';

export default function ReceivedFiles({ receivedFiles, isInitiator, onRemoveFile }) {
  const handleDownload = (file) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(file.url);
  };

  // Only show received files for the receiver
  if (receivedFiles.length === 0 || isInitiator) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-soft"
    >
      <h3 className="text-xl font-semibold mb-4">Received Files</h3>
      <div className="space-y-4">
        {receivedFiles.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-dark-600/50 rounded-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FiDownload className="text-blue-500" />
              </div>
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-gray-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(file)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FiDownload />
                Download
              </button>
              <button
                onClick={() => onRemoveFile(index)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <FiTrash2 />
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
