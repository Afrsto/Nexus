import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import ChatList from "@/components/chat/ChatList";
import ChatView from "@/components/chat/ChatView";
import EmptyState from "@/components/common/EmptyState";
import { useChatStore } from "@/store/useChatStore";

export default function ChatsPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const setActiveChat = useChatStore((s) => s.setActiveChat);

  useEffect(() => {
    if (!chatId) {
      setActiveChat(null);
      return;
    }
    const id = Number(chatId);
    const chat = useChatStore.getState().chats.find((c) => c.id === id);
    if (chat) {
      setActiveChat(chat);
    } else {
      navigate(ROUTES.CHATS, { replace: true });
    }
  }, [chatId, setActiveChat, navigate]);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div
        className={chatId ? "hide-mobile" : ""}
        style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}
      >
        <ChatList />
      </div>

      {chatId ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ChatView chatId={chatId} />
        </div>
      ) : (
        <div
          className="hide-mobile"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <EmptyState
            icon={<ChatBubbleIcon />}
            title="Select a conversation"
            description="Choose a chat from the list to start messaging"
          />
        </div>
      )}
    </div>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
