import { User } from "lucide-react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import styles from "./styles/MessageList.module.css";
import { memo } from "react";

const MessageItem = ({ message, style }) => (
  <div style={style}>
    {message.question && (
      <div className={`${styles.message} ${styles.userMessage}`}>
        <div className={styles.userQuestion}>
          <strong></strong> {message.question}
        </div>
        <div className={`${styles.messageAvatar} ${styles.userAvatar}`}>
          <User size={18} />
        </div>
      </div>
    )}
    <div
      className={`${styles.message} ${
        message.type === "user" ? styles.userMessage : styles.assistantMessage
      }`}
    >
      {message.type === "assistant" && (
        <div className={`${styles.messageAvatar} ${styles.assistantAvatar}`}>
          <User size={18} />
        </div>
      )}
      <div className={styles.messageContent}>
        {message.content}
        {message.time && (
          <div className={styles.messageTime}>
            {new Date(message.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
      {message.type === "user" && (
        <div className={`${styles.messageAvatar} ${styles.userAvatar}`}>
          <User size={18} />
        </div>
      )}
    </div>
  </div>
);

const MessageList = ({ messages, loading }) => {
  if (loading) {
    return <div className={styles.chatMessages}>Đang tải...</div>;
  }

  return (
    <div className={styles.chatMessages}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={messages.length}
            itemSize={100}
          >
            {({ index, style }) => <MessageItem message={messages[index]} style={style} />}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default memo(MessageList);