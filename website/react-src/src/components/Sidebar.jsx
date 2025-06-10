import { useState, useCallback } from "react";
import { LogOut, Plus, Settings, HelpCircle } from "lucide-react";
import { toast } from "react-toastify";
import ConversationList from "./ConversationList";
import styles from "./styles/Sidebar.module.css";

const Sidebar = ({
  conversations,
  selectedConversationId,
  handleLogout,
  createNewConversation,
  handleEditConversation,
  handleDeleteConversation,
  handleConversationSelect,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editConversationId, setEditConversationId] = useState(null);

  const handleCreateConversation = useCallback(async () => {
    if (conversationTitle.trim()) {
      await createNewConversation({ title: conversationTitle });
      setConversationTitle("");
      setShowModal(false);
      toast.success("Cuộc trò chuyện mới đã được tạo!");
    }
  }, [conversationTitle, createNewConversation]);

  const openEditModal = useCallback((id, title) => {
    setEditConversationId(id);
    setEditTitle(title);
    setShowEditModal(true);
  }, []);

  const handleConfirmEdit = useCallback(async () => {
    if (editTitle.trim() && editConversationId) {
      await handleEditConversation(editConversationId, editTitle.trim());
      setShowEditModal(false);
      setEditTitle("");
      setEditConversationId(null);
      toast.success("Tiêu đề cuộc trò chuyện đã được cập nhật!");
    }
  }, [editTitle, editConversationId, handleEditConversation]);

  const handleKeyPressCreate = useCallback(
    (e) => {
      if (e.key === "Enter" && conversationTitle.trim()) {
        handleCreateConversation();
      } else if (e.key === "Escape") {
        setShowModal(false);
        setConversationTitle("");
      }
    },
    [conversationTitle, handleCreateConversation]
  );

  const handleKeyPressEdit = useCallback(
    (e) => {
      if (e.key === "Enter" && editTitle.trim()) {
        handleConfirmEdit();
      } else if (e.key === "Escape") {
        setShowEditModal(false);
        setEditTitle("");
        setEditConversationId(null);
      }
    },
    [editTitle, handleConfirmEdit]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setConversationTitle("");
  }, []);

  const handleEditModalClose = useCallback(() => {
    setShowEditModal(false);
    setEditTitle("");
    setEditConversationId(null);
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Anthropic Claude</h3>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          <span className="ms-1">Đăng xuất</span>
        </button>
      </div>
      <button
        className={styles.newConversationButton}
        onClick={() => setShowModal(true)}
      >
        <Plus size={16} /> Cuộc trò chuyện mới
      </button>
      <ConversationList
        conversations={conversations || []}
        selectedConversationId={selectedConversationId}
        onConversationSelect={handleConversationSelect}
        onEdit={openEditModal}
        onDelete={handleDeleteConversation}
      />
      <div className={styles.bottomMenu}>
        <div className={styles.bottomMenuItem}>
          <Settings size={16} /> Cài đặt
        </div>
        <div className={styles.bottomMenuItem}>
          <HelpCircle size={16} /> Trợ giúp
        </div>
      </div>
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Đặt tên cuộc trò chuyện</h4>
              <button
                className={styles.modalCloseButton}
                onClick={handleModalClose}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  onKeyDown={handleKeyPressCreate}
                  placeholder="Nhập tên cuộc trò chuyện..."
                  className={styles.modalInput}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleModalClose}
                className={`${styles.modalButton} ${styles.cancelButton}`}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateConversation}
                className={`${styles.modalButton} ${styles.confirmButton}`}
                disabled={!conversationTitle.trim()}
              >
                Tạo cuộc trò chuyện
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={handleEditModalClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Sửa tiêu đề cuộc trò chuyện</h4>
              <button
                className={styles.modalCloseButton}
                onClick={handleEditModalClose}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPressEdit}
                  placeholder="Nhập tiêu đề mới..."
                  className={styles.modalInput}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleEditModalClose}
                className={`${styles.modalButton} ${styles.cancelButton}`}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmEdit}
                className={`${styles.modalButton} ${styles.confirmButton}`}
                disabled={!editTitle.trim()}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;