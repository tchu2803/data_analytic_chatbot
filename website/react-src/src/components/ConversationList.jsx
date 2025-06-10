import {
  MessageSquare,
  Edit2,
  Trash2,
  Clock,
  MoreVertical,
  Search,
  Pin,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import styles from "./styles/ConversationList.module.css";
import { debounce } from "lodash";
import { memo } from "react";

const ConversationList = ({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onEdit,
  onDelete,
}) => {
  const [showActionsFor, setShowActionsFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleActions = useCallback(
    (conversationId, e) => {
      e.stopPropagation();
      setShowActionsFor(
        showActionsFor === conversationId ? null : conversationId
      );
    },
    [showActionsFor]
  );

  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  const filteredConversations = useMemo(() => {
    // Đảm bảo conversations là mảng, nếu không trả về mảng rỗng
    if (!Array.isArray(conversations)) return [];

    // Nếu không có searchTerm, trả về toàn bộ mảng conversations
    if (!searchTerm) return conversations;

    // Lọc conversations theo title hoặc lastMessage
    return conversations.filter(
      (c) =>
        (c.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.lastMessage?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${Math.floor(diffInHours)} giờ trước`;
    if (diffInHours < 48) return "Hôm qua";
    return date.toLocaleDateString("vi-VN");
  };

  // Close actions menu when clicking outside
  const handleClickOutside = useCallback(() => {
    setShowActionsFor(null);
  }, []);

  return (
    <div className={styles.conversationList} onClick={handleClickOutside}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className={styles.searchInput}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations Container */}
      <div className={styles.conversationsContainer}>
        {filteredConversations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <MessageSquare size={48} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchTerm
                ? "Không tìm thấy cuộc trò chuyện"
                : "Chưa có cuộc trò chuyện"}
            </h3>
            <p className={styles.emptyText}>
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : "Bắt đầu cuộc trò chuyện đầu tiên của bạn"}
            </p>
          </div>
        ) : (
          <div className={styles.conversationsList}>
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                className={`${styles.conversationItem} ${
                  c.id === selectedConversationId ? styles.active : ""
                }`}
                onClick={() => onConversationSelect(c.id)}
              >
                {/* Avatar */}
                <div className={styles.conversationAvatar}>
                  <MessageSquare size={20} />
                  {c.isPinned && <Pin size={12} className={styles.pinIcon} />}
                </div>

                {/* Content */}
                <div className={styles.conversationContent}>
                  <div className={styles.conversationHeader}>
                    <h4 className={styles.conversationTitle}>
                      {c.title || "Cuộc trò chuyện không tiêu đề"}
                    </h4>
                    <div className={styles.conversationActions}>
                      <button
                        onClick={(e) => toggleActions(c.id, e)}
                        className={`${styles.actionToggle} ${
                          showActionsFor === c.id ? styles.active : ""
                        }`}
                        title="Tùy chọn"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {showActionsFor === c.id && (
                        <div className={styles.actionsMenu}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(c.id, c.title);
                              setShowActionsFor(null);
                            }}
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                            <span>Chỉnh sửa</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(c.id);
                              setShowActionsFor(null);
                            }}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Preview */}
                  {c.lastMessage && (
                    <div className={styles.messagePreview}>
                      <p className={styles.lastMessage}>{c.lastMessage}</p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className={styles.conversationMeta}>
                    <div className={styles.timeInfo}>
                      <Clock size={14} />
                      <span>{formatTime(c.updated_at)}</span>
                    </div>
                    {c.messageCount && (
                      <div className={styles.messageCount}>
                        {c.messageCount} tin nhắn
                      </div>
                    )}
                  </div>
                </div>

                {/* Unread Badge */}
                {c.unreadCount > 0 && (
                  <div className={styles.unreadBadge}>
                    {c.unreadCount > 9 ? "9+" : c.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ConversationList);