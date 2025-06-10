import { Send, FileUp } from "lucide-react";
import styles from "./styles/MessageInput.module.css";
import { memo, useCallback } from "react";

const MessageInput = ({
  message,
  setMessage,
  handleSendMessage,
  handleUpload,
  disabled,
}) => {
  const handleChange = useCallback((e) => setMessage(e.target.value), [setMessage]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className={`${styles.inputContainer} ${disabled ? styles.disabled : ""}`}>
      <textarea
        placeholder="Nhập tin nhắn..."
        className={styles.messageInput}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
      ></textarea>
      <label
        htmlFor="pdf-upload"
        className={`${styles.uploadButton} ${disabled ? styles.disabled : ""}`}
        title="Tải lên file PDF"
      >
        <FileUp size={20} />
      </label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={handleUpload}
        disabled={disabled}
      />
      <button
        className={`${styles.sendButton} ${!message.trim() || disabled ? styles.disabled : ""}`}
        onClick={handleSendMessage}
        disabled={!message.trim() || disabled}
        aria-label="Gửi tin nhắn"
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default memo(MessageInput);