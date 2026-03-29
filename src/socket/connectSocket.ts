// src/socket/connectSocket.ts
import { socket } from "./socket";

type ChatContext = "posgrados" | "mesa_ayuda";

interface SendMessagePayload {
  message: string;
  context: ChatContext;
  meta?: {
    source: "text" | "quick_reply";
    optionId?: string;
  };
}

const getOrCreateUserId = () => {
  let userId = localStorage.getItem("user-id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("user-id", userId);
  }
  return userId;
};

const getOrCreateTabId = () => {
  let tabId = sessionStorage.getItem("tab-id");
  if (!tabId) {
    tabId = crypto.randomUUID();
    sessionStorage.setItem("tab-id", tabId);
  }
  return tabId;
};

export const connectSocket = (context: ChatContext) => {
  if (socket.connected) return;

  const userId = getOrCreateUserId();
  const tabId = getOrCreateTabId();

  socket.auth = { userId, tabId, context };

  socket.connect();
};

// Ahora acepta objeto con context en lugar de string plano
export const emitSendMessage = (payload: SendMessagePayload) => {
  if (!socket.connected) return;
  socket.emit("send-message", payload);
};
