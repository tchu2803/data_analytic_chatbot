import { useState, useCallback } from "react";
import { toast } from "react-toastify";

const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleChange = useCallback((e) => {
    setFile(e.target.files[0]);
  }, []);

  const handleUpload = useCallback(() => {
    if (file && onUpload) {
      onUpload(file);
      setFile(null);
      toast.success("File đã được chọn để tải lên!");
    }
  }, [file, onUpload]);

  return (
    <div className="upload-container">
      <input
        type="file"
        accept="application/pdf"
        id="pdf-upload"
        onChange={handleChange}
      />
      <button
        onClick={handleUpload}
        disabled={!file}
        className={file ? "" : "disabled"}
      >
        Upload PDF
      </button>
    </div>
  );
};

export default FileUpload;