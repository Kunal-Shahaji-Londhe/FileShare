// components/DownloadButton.jsx
export default function DownloadButton({ file }) {
    const download = () => {
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    };
  
    return (
      <button
        onClick={download}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
      >
        Download
      </button>
    );
  }
  