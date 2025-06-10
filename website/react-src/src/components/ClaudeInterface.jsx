import { useReducer, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import useChat from "./hooks/useChat";
import ErrorBoundary from "./common/ErrorBoundary";
import { api } from "./services/api";
import styles from "./styles/ClaudeInterface.module.css";

// Constants
const WELCOME_MESSAGE = {
  id: 1,
  type: "assistant",
  content:
    "Xin chào! Tôi là Claude, trợ lý AI của Anthropic. Tôi có thể giúp bạn với nhiều tác vụ khác nhau như viết văn, phân tích, toán học, lập trình và nhiều hơn nữa. Bạn cần tôi giúp gì hôm nay?",
  time: new Date().toISOString(),
};

const NO_CONVERSATION_MESSAGE = {
  id: 1,
  type: "assistant",
  content: "Vui lòng chọn một cuộc trò chuyện để bắt đầu.",
  time: new Date().toISOString(),
};

const ERROR_MESSAGE = {
  id: 1,
  type: "assistant",
  content: "Không thể tải chi tiết cuộc trò chuyện. Vui lòng thử lại.",
  time: new Date().toISOString(),
};

// Reducer for state management
const initialState = {
  conversations: [],
  selectedConversationId: null,
  selectedConversation: null,
  loading: false,
  error: null,
  message: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "SET_SELECTED_CONVERSATION_ID":
      return { ...state, selectedConversationId: action.payload };
    case "SET_SELECTED_CONVERSATION":
      return { ...state, selectedConversation: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    default:
      return state;
  }
};

const ClaudeInterface = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    conversations,
    selectedConversationId,
    selectedConversation,
    loading,
    error,
    message,
  } = state;
  const navigate = useNavigate();
  const { messages, setMessages, sendMessage } = useChat(
    selectedConversationId
  );
  const isInitialized = useRef(false);

  const setConversations = useCallback(
    (data) => dispatch({ type: "SET_CONVERSATIONS", payload: data }),
    []
  );
  const setSelectedConversationId = useCallback(
    (id) => dispatch({ type: "SET_SELECTED_CONVERSATION_ID", payload: id }),
    []
  );
  const setSelectedConversation = useCallback(
    (data) => dispatch({ type: "SET_SELECTED_CONVERSATION", payload: data }),
    []
  );
  const setLoading = useCallback(
    (value) => dispatch({ type: "SET_LOADING", payload: value }),
    []
  );
  const setError = useCallback(
    (value) => dispatch({ type: "SET_ERROR", payload: value }),
    []
  );
  const setMessage = useCallback(
    (value) => dispatch({ type: "SET_MESSAGE", payload: value }),
    []
  );

  const hasMessages = useMemo(
    () => messages && messages.length > 0,
    [messages]
  );
  const isValidConversation = useMemo(
    () => selectedConversation && selectedConversationId,
    [selectedConversation, selectedConversationId]
  );

  const handleError = useCallback(
    (error, context = "") => {
      console.error(`Error ${context}:`, error);
      const errorMsg = `Lỗi ${context}: ${error.message || "Có lỗi xảy ra"}`;
      setError(errorMsg);
      toast.error(errorMsg, { autoClose: 5000 });
    },
    [setError]
  );

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const { ok, data } = await api.getConversations(navigate);
      if (ok) {
        const conversationsWithLastMessage = Array.isArray(data)
          ? data.map((conv) => ({
              ...conv,
              lastMessage:
                conv.messages?.length > 0
                  ? conv.messages[conv.messages.length - 1].content
                  : null,
            }))
          : [];
        setConversations(conversationsWithLastMessage);
        return conversationsWithLastMessage;
      } else {
        handleError(
          new Error(data?.message || "Không thể tải danh sách cuộc trò chuyện"),
          "khi lấy cuộc trò chuyện"
        );
        return [];
      }
    } catch (error) {
      handleError(error, "khi lấy cuộc trò chuyện");
      return [];
    }
  }, [navigate, handleError, setConversations]);

  const fetchAllConversationMessages = useCallback(async () => {
    if (!conversations || conversations.length === 0) return;

    try {
      setError(null);
      setLoading(true);

      const messagePromises = conversations.map(async (conversation) => {
        const { ok, data } = await api.getMessages(conversation.id, navigate);
        if (ok) {
          return {
            conversationId: conversation.id,
            messages: Array.isArray(data) ? data : [],
          };
        } else {
          throw new Error(
            data?.message ||
              `Không thể tải tin nhắn cho cuộc trò chuyện ${conversation.id}`
          );
        }
      });

      const results = await Promise.allSettled(messagePromises);

      const updatedConversations = conversations.map((conversation) => {
        const result = results.find(
          (r) =>
            r.status === "fulfilled" &&
            r.value.conversationId === conversation.id
        );
        if (result && result.status === "fulfilled") {
          return {
            ...conversation,
            messages: result.value.messages,
          };
        }
        return conversation;
      });

      setConversations(updatedConversations);

      if (selectedConversationId) {
        const selectedConv = updatedConversations.find(
          (conv) => conv.id === selectedConversationId
        );
        if (selectedConv) {
          setSelectedConversation(selectedConv);
          setMessages(
            selectedConv.messages.length === 0
              ? [WELCOME_MESSAGE]
              : selectedConv.messages
          );
        }
      }
    } catch (error) {
      handleError(error, "khi tải tất cả tin nhắn cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  }, [
    conversations,
    navigate,
    handleError,
    setConversations,
    setSelectedConversation,
    setMessages,
    selectedConversationId,
    setLoading,
    setError,
  ]);

  const fetchConversationDetail = useCallback(
    async (id, skipLoading = false) => {
      if (!id) return;
      try {
        if (!skipLoading) setLoading(true);
        setError(null);
        const { ok, data } = await api.getConversation(id, navigate);
        if (ok) {
          setSelectedConversation(data);
          const serverMessages = Array.isArray(data.messages)
            ? data.messages
            : [];
          setMessages(
            serverMessages.length === 0 ? [WELCOME_MESSAGE] : serverMessages
          );
        } else {
          setSelectedConversation(null);
          setMessages([ERROR_MESSAGE]);
          handleError(
            new Error(
              data?.message || "Không thể tải chi tiết cuộc trò chuyện"
            ),
            "khi tải chi tiết"
          );
        }
      } catch (error) {
        setSelectedConversation(null);
        setMessages([ERROR_MESSAGE]);
        handleError(error, "khi tải chi tiết cuộc trò chuyện");
      } finally {
        if (!skipLoading) setLoading(false);
      }
    },
    [navigate, setMessages, handleError, setSelectedConversation, setLoading]
  );

  const createNewConversation = useCallback(
    async ({ title }) => {
      try {
        setError(null);
        const { ok, data } = await api.createConversation(title, navigate);
        if (ok) {
          await fetchConversations();
          setSelectedConversationId(data.id);
          toast.success("Cuộc trò chuyện mới đã được tạo!");
          return data;
        } else {
          handleError(
            new Error(data?.message || "Không thể tạo cuộc trò chuyện"),
            "khi tạo cuộc trò chuyện"
          );
          return null;
        }
      } catch (error) {
        handleError(error, "khi tạo cuộc trò chuyện");
        return null;
      }
    },
    [navigate, handleError, fetchConversations, setSelectedConversationId]
  );

  // New function to auto-create conversation if none exists
  const ensureConversationExists = useCallback(async () => {
    try {
      setLoading(true);
      const currentConversations = await fetchConversations();
      
      if (!currentConversations || currentConversations.length === 0) {
        console.log("Không có cuộc trò chuyện nào, tạo cuộc trò chuyện mới...");
        const newConversation = await createNewConversation({ 
          title: "Cuộc trò chuyện mới" 
        });
        
        if (newConversation) {
          console.log("Đã tạo và chọn cuộc trò chuyện mới:", newConversation.id);
          return newConversation;
        }
      } else {
        // If conversations exist but none is selected, select the first one
        if (!selectedConversationId && currentConversations.length > 0) {
          const firstConversation = currentConversations[0];
          setSelectedConversationId(firstConversation.id);
          console.log("Chọn cuộc trò chuyện đầu tiên:", firstConversation.id);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Lỗi khi đảm bảo cuộc trò chuyện tồn tại:", error);
      handleError(error, "khi kiểm tra cuộc trò chuyện");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchConversations, createNewConversation, selectedConversationId, setSelectedConversationId, setLoading, handleError]);

  const handleEditConversation = useCallback(
    async (id, title) => {
      try {
        setError(null);
        const res = await api.updateConversation(id, title, navigate);
        if (res.ok) {
          await fetchConversations();
          toast.success("Tiêu đề cuộc trò chuyện đã được cập nhật!");
        } else {
          handleError(
            new Error(
              res.data?.message || "Không thể cập nhật cuộc trò chuyện"
            ),
            "khi cập nhật cuộc trò chuyện"
          );
        }
      } catch (error) {
        handleError(error, "khi cập nhật cuộc trò chuyện");
      }
    },
    [navigate, fetchConversations, handleError]
  );

  // Improved handleDeleteConversation with immediate state updates
  const handleDeleteConversation = useCallback(
    async (id) => {
      try {
        setError(null);
        
        // Immediately update state if the deleted conversation is currently selected
        if (selectedConversationId === id) {
          setSelectedConversationId(null);
          setSelectedConversation(null);
          setMessages([NO_CONVERSATION_MESSAGE]);
        }
        
        // Remove the conversation from the list immediately to prevent API calls with deleted ID
        const updatedConversations = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversations);
        
        const res = await api.deleteConversation(id, navigate);
        if (res.ok) {
          // Refresh conversations from server
          const refreshedConversations = await fetchConversations();
          
          // If no conversations left after deletion, create a new one
          if (!refreshedConversations || refreshedConversations.length === 0) {
            await ensureConversationExists();
          }
          
          toast.success("Cuộc trò chuyện đã được xóa!");
        } else {
          // If API call failed, restore the conversation to the list
          setConversations(conversations);
          // Restore selected conversation if it was the deleted one
          if (selectedConversationId === id) {
            setSelectedConversationId(id);
            const restoredConversation = conversations.find(conv => conv.id === id);
            if (restoredConversation) {
              setSelectedConversation(restoredConversation);
              setMessages(restoredConversation.messages || [WELCOME_MESSAGE]);
            }
          }
          handleError(
            new Error(res.data?.message || "Không thể xóa cuộc trò chuyện"),
            "khi xóa cuộc trò chuyện"
          );
        }
      } catch (error) {
        // If error occurs, restore the conversation to the list
        setConversations(conversations);
        // Restore selected conversation if it was the deleted one
        if (selectedConversationId === id) {
          setSelectedConversationId(id);
          const restoredConversation = conversations.find(conv => conv.id === id);
          if (restoredConversation) {
            setSelectedConversation(restoredConversation);
            setMessages(restoredConversation.messages || [WELCOME_MESSAGE]);
          }
        }
        handleError(error, "khi xóa cuộc trò chuyện");
      }
    },
    [
      navigate,
      fetchConversations,
      selectedConversationId,
      conversations,
      handleError,
      setSelectedConversationId,
      setSelectedConversation,
      setMessages,
      setConversations,
      ensureConversationExists,
    ]
  );

  const handleSendMessage = useCallback(async () => {
    if (!selectedConversationId) {
      toast.warn("Vui lòng chọn cuộc trò chuyện.");
      return;
    }
    if (!message.trim()) {
      toast.warn("Vui lòng nhập tin nhắn.");
      return;
    }
    try {
      setError(null);
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        type: "user",
        content: message,
        time: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      setMessage("");

      const { ok, data } = await api.sendMessage(
        message,
        navigate,
        selectedConversationId
      );

      if (ok) {
        const res = await api.getMessages(selectedConversationId, navigate);
        if (res.ok) {
          setMessages(res.data || []);
          console.log("Tin nhắn mới từ server:", res.data);
        } else {
          handleError(
            new Error("Không thể tải tin nhắn mới"),
            "khi lấy tin nhắn mới"
          );
        }
        await fetchConversations();
      } else {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== optimisticMessage.id)
        );
        handleError(
          new Error(data?.message || "Gửi tin nhắn thất bại"),
          "khi gửi tin nhắn"
        );
      }
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== optimisticMessage.id)
      );
      handleError(error, "khi gửi tin nhắn");
    }
  }, [
    selectedConversationId,
    message,
    navigate,
    handleError,
    setMessage,
    fetchConversations,
    setMessages,
  ]);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;
      try {
        setError(null);
        const { ok, data } = await api.uploadFile(file, navigate);
        if (ok) {
          toast.success("Tải file thành công!");
        } else {
          handleError(
            new Error(data?.message || "Tải file thất bại"),
            "khi tải file"
          );
        }
      } catch (error) {
        handleError(error, "khi tải file");
      }
    },
    [navigate, handleError]
  );

  const handleLogout = useCallback(async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
    try {
      setError(null);
      const { ok, data } = await api.logout(navigate);
      if (ok) {
        navigate("/login");
        toast.success("Đăng xuất thành công!");
      } else {
        handleError(
          new Error(data?.message || "Lỗi đăng xuất"),
          "khi đăng xuất"
        );
      }
    } catch (error) {
      handleError(error, "khi đăng xuất");
    }
  }, [navigate, handleError]);

  const handleConversationSelect = useCallback(
    (conversationId) => {
      if (conversationId !== selectedConversationId) {
        setSelectedConversationId(conversationId);
      }
    },
    [selectedConversationId, setSelectedConversationId]
  );

  const handleUpload = useCallback(
    (e) => {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
        e.target.value = null;
      }
    },
    [handleFileUpload]
  );

  // Initialize the application
  useEffect(() => {
    if (!isInitialized.current) {
      const initialize = async () => {
        await ensureConversationExists();
        isInitialized.current = true;
      };
      initialize();
    }
  }, [ensureConversationExists]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationDetail(selectedConversationId);
    } else {
      setSelectedConversation(null);
      setMessages([NO_CONVERSATION_MESSAGE]);
    }
  }, [
    selectedConversationId,
    fetchConversationDetail,
    setMessages,
    setSelectedConversation,
  ]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  const sidebarProps = useMemo(
    () => ({
      conversations,
      selectedConversationId,
      handleLogout,
      createNewConversation,
      handleEditConversation,
      handleDeleteConversation,
      handleConversationSelect,
    }),
    [
      conversations,
      selectedConversationId,
      handleLogout,
      createNewConversation,
      handleEditConversation,
      handleDeleteConversation,
      handleConversationSelect,
    ]
  );

  const messageInputProps = useMemo(
    () => ({
      message,
      setMessage,
      handleSendMessage,
      handleUpload,
      disabled: loading,
    }),
    [message, setMessage, handleSendMessage, handleUpload, loading]
  );

  return (
    <ErrorBoundary>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <div className={styles.container}>
        <Sidebar {...sidebarProps} />
        <div className={styles.mainContent}>
          <MessageList messages={messages} loading={loading} error={error} />
          {selectedConversationId && <MessageInput {...messageInputProps} />}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ClaudeInterface;