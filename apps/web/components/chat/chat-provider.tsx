"use client";

import type { MessageRecord, ThreadSummary } from "@limbu/chat";
import {
  archiveThreadApi,
  consumeSseStream,
  createThreadApi,
  deleteThreadApi,
  editMessageApi,
  fetchMessages,
  fetchThreads,
  pinThreadApi,
  renameThreadApi,
  searchThreads,
  sendMessageApi,
} from "@/lib/chat/client";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

type ChatState = {
  threads: ThreadSummary[];
  threadsCursor: string | null;
  threadsLoading: boolean;
  showArchived: boolean;
  searchQuery: string;
  messages: MessageRecord[];
  messagesCursor: string | null;
  messagesLoading: boolean;
  messagesHasMore: boolean;
  streaming: boolean;
  streamingContent: string;
  sidebarOpen: boolean;
  error: string | null;
  editingMessageId: string | null;
};

type ChatAction =
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_SIDEBAR"; open: boolean }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_ARCHIVED"; show: boolean }
  | { type: "THREADS_LOADING" }
  | { type: "THREADS_LOADED"; threads: ThreadSummary[]; nextCursor: string | null; append?: boolean }
  | { type: "MESSAGES_LOADING" }
  | { type: "MESSAGES_LOADED"; messages: MessageRecord[]; nextCursor: string | null; hasMore: boolean; prepend?: boolean }
  | { type: "ADD_MESSAGE"; message: MessageRecord }
  | { type: "UPDATE_MESSAGE"; message: MessageRecord }
  | { type: "TRUNCATE_AFTER"; messageId: string }
  | { type: "STREAM_START" }
  | { type: "STREAM_DELTA"; content: string }
  | { type: "STREAM_END" }
  | { type: "SET_EDITING"; messageId: string | null };

const initialState: ChatState = {
  threads: [],
  threadsCursor: null,
  threadsLoading: false,
  showArchived: false,
  searchQuery: "",
  messages: [],
  messagesCursor: null,
  messagesLoading: false,
  messagesHasMore: false,
  streaming: false,
  streamingContent: "",
  sidebarOpen: false,
  error: null,
  editingMessageId: null,
};

function reducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.open };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_ARCHIVED":
      return { ...state, showArchived: action.show };
    case "THREADS_LOADING":
      return { ...state, threadsLoading: true };
    case "THREADS_LOADED": {
      const threads = action.append
        ? [...state.threads, ...action.threads]
        : action.threads;
      return { ...state, threadsLoading: false, threads, threadsCursor: action.nextCursor };
    }
    case "MESSAGES_LOADING":
      return { ...state, messagesLoading: true };
    case "MESSAGES_LOADED": {
      const messages = action.prepend
        ? [...action.messages, ...state.messages]
        : action.messages;
      return {
        ...state,
        messagesLoading: false,
        messages,
        messagesCursor: action.nextCursor,
        messagesHasMore: action.hasMore,
      };
    }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.message.id ? action.message : m,
        ),
        editingMessageId: null,
      };
    case "TRUNCATE_AFTER": {
      const index = state.messages.findIndex((m) => m.id === action.messageId);
      return index >= 0
        ? { ...state, messages: state.messages.slice(0, index + 1) }
        : state;
    }
    case "STREAM_START":
      return { ...state, streaming: true, streamingContent: "" };
    case "STREAM_DELTA":
      return { ...state, streamingContent: state.streamingContent + action.content };
    case "STREAM_END":
      return {
        ...state,
        streaming: false,
        streamingContent: "",
      };
    case "SET_EDITING":
      return { ...state, editingMessageId: action.messageId };
    default:
      return state;
  }
}

type ChatContextValue = {
  state: ChatState;
  activeThreadId: string | null;
  refreshThreads: () => Promise<void>;
  loadMoreThreads: () => Promise<void>;
  loadMessages: (threadId: string) => Promise<void>;
  loadOlderMessages: (threadId: string) => Promise<void>;
  createConversation: () => Promise<void>;
  renameConversation: (threadId: string, title: string) => Promise<void>;
  deleteConversation: (threadId: string) => Promise<void>;
  archiveConversation: (threadId: string, archived: boolean) => Promise<void>;
  pinConversation: (threadId: string, pinned: boolean) => Promise<void>;
  sendMessage: (threadId: string, content: string) => Promise<void>;
  editMessage: (threadId: string, messageId: string, content: string) => Promise<void>;
  regenerateMessage: (threadId: string, messageId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setShowArchived: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setEditingMessageId: (id: string | null) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  activeThreadId,
  children,
}: {
  activeThreadId: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshThreads = useCallback(async () => {
    dispatch({ type: "THREADS_LOADING" });
    try {
      const data = state.searchQuery.trim()
        ? await searchThreads(state.searchQuery.trim())
        : await fetchThreads({ archived: state.showArchived });
      dispatch({ type: "THREADS_LOADED", threads: data.threads, nextCursor: data.nextCursor });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to load conversations" });
      dispatch({ type: "THREADS_LOADED", threads: [], nextCursor: null });
    }
  }, [state.searchQuery, state.showArchived]);

  const loadMoreThreads = useCallback(async () => {
    if (!state.threadsCursor || state.threadsLoading) return;
    dispatch({ type: "THREADS_LOADING" });
    try {
      const data = await fetchThreads({
        archived: state.showArchived,
        cursor: state.threadsCursor,
        search: state.searchQuery.trim() || undefined,
      });
      dispatch({
        type: "THREADS_LOADED",
        threads: data.threads,
        nextCursor: data.nextCursor,
        append: true,
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to load more" });
    }
  }, [state.threadsCursor, state.threadsLoading, state.showArchived, state.searchQuery]);

  const loadMessages = useCallback(async (threadId: string) => {
    dispatch({ type: "MESSAGES_LOADING" });
    try {
      const data = await fetchMessages(threadId);
      dispatch({
        type: "MESSAGES_LOADED",
        messages: data.messages,
        nextCursor: data.nextCursor,
        hasMore: data.hasMore,
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to load messages" });
      dispatch({ type: "MESSAGES_LOADED", messages: [], nextCursor: null, hasMore: false });
    }
  }, []);

  const loadOlderMessages = useCallback(
    async (threadId: string) => {
      if (!state.messagesCursor || state.messagesLoading) return;
      dispatch({ type: "MESSAGES_LOADING" });
      try {
        const data = await fetchMessages(threadId, state.messagesCursor);
        dispatch({
          type: "MESSAGES_LOADED",
          messages: data.messages,
          nextCursor: data.nextCursor,
          hasMore: data.hasMore,
          prepend: true,
        });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to load older messages" });
      }
    },
    [state.messagesCursor, state.messagesLoading],
  );

  const streamReply = useCallback(async (threadId: string, userMessageId: string) => {
    dispatch({ type: "STREAM_START" });
    try {
      await consumeSseStream(
        `/api/chat/threads/${threadId}/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMessageId }),
        },
        {
          onDelta: (content) => dispatch({ type: "STREAM_DELTA", content }),
          onDone: async () => {
            dispatch({ type: "STREAM_END" });
            await loadMessages(threadId);
            await refreshThreads();
          },
          onError: (message) => {
            dispatch({ type: "SET_ERROR", error: message });
            dispatch({ type: "STREAM_END" });
          },
        },
      );
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Streaming failed" });
      dispatch({ type: "STREAM_END" });
    }
  }, [loadMessages, refreshThreads]);

  const sendMessage = useCallback(
    async (threadId: string, content: string) => {
      const message = await sendMessageApi(threadId, content);
      dispatch({ type: "ADD_MESSAGE", message });
      await refreshThreads();
      await streamReply(threadId, message.id);
    },
    [refreshThreads, streamReply],
  );

  const regenerateMessage = useCallback(
    async (threadId: string, messageId: string) => {
      dispatch({ type: "TRUNCATE_AFTER", messageId });
      dispatch({ type: "STREAM_START" });
      try {
        await consumeSseStream(
          `/api/chat/threads/${threadId}/messages/${messageId}/regenerate`,
          { method: "POST" },
          {
            onDelta: (content) => dispatch({ type: "STREAM_DELTA", content }),
            onDone: async () => {
              dispatch({ type: "STREAM_END" });
              await loadMessages(threadId);
              await refreshThreads();
            },
            onError: (message) => {
              dispatch({ type: "SET_ERROR", error: message });
              dispatch({ type: "STREAM_END" });
            },
          },
        );
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Regenerate failed" });
        dispatch({ type: "STREAM_END" });
      }
    },
    [loadMessages, refreshThreads],
  );

  const createConversation = useCallback(async () => {
    const thread = await createThreadApi();
    await refreshThreads();
    router.push(`/chat/${thread.id}`);
  }, [router, refreshThreads]);

  const renameConversation = useCallback(
    async (threadId: string, title: string) => {
      await renameThreadApi(threadId, title);
      await refreshThreads();
    },
    [refreshThreads],
  );

  const deleteConversation = useCallback(
    async (threadId: string) => {
      await deleteThreadApi(threadId);
      await refreshThreads();
      if (activeThreadId === threadId) router.push("/chat");
    },
    [activeThreadId, refreshThreads, router],
  );

  const archiveConversation = useCallback(
    async (threadId: string, archived: boolean) => {
      await archiveThreadApi(threadId, archived);
      await refreshThreads();
      if (archived && activeThreadId === threadId) router.push("/chat");
    },
    [activeThreadId, refreshThreads, router],
  );

  const pinConversation = useCallback(
    async (threadId: string, pinned: boolean) => {
      await pinThreadApi(threadId, pinned);
      await refreshThreads();
    },
    [refreshThreads],
  );

  const editMessage = useCallback(
    async (threadId: string, messageId: string, content: string) => {
      const message = await editMessageApi(threadId, messageId, content);
      dispatch({ type: "UPDATE_MESSAGE", message });
      await loadMessages(threadId);
      await refreshThreads();
    },
    [loadMessages, refreshThreads],
  );

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void refreshThreads();
    }, 250);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [state.searchQuery, state.showArchived, refreshThreads]);

  useEffect(() => {
    if (activeThreadId) {
      void loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  useEffect(() => {
    if (!activeThreadId) return;
    const pending = sessionStorage.getItem("pendingChatMessage");
    if (!pending) return;
    sessionStorage.removeItem("pendingChatMessage");
    void sendMessage(activeThreadId, pending);
  }, [activeThreadId, sendMessage]);

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      activeThreadId,
      refreshThreads,
      loadMoreThreads,
      loadMessages,
      loadOlderMessages,
      createConversation,
      renameConversation,
      deleteConversation,
      archiveConversation,
      pinConversation,
      sendMessage,
      editMessage,
      regenerateMessage,
      setSearchQuery: (query) => dispatch({ type: "SET_SEARCH", query }),
      setShowArchived: (show) => dispatch({ type: "SET_ARCHIVED", show }),
      setSidebarOpen: (open) => dispatch({ type: "SET_SIDEBAR", open }),
      setEditingMessageId: (messageId) => dispatch({ type: "SET_EDITING", messageId }),
    }),
    [
      state,
      activeThreadId,
      refreshThreads,
      loadMoreThreads,
      loadMessages,
      loadOlderMessages,
      createConversation,
      renameConversation,
      deleteConversation,
      archiveConversation,
      pinConversation,
      sendMessage,
      editMessage,
      regenerateMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
