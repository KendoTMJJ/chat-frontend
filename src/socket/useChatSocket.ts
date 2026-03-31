// src/socket/useChatSocket.ts
import { useEffect } from "react";
import { socket } from "./socket";

interface ChatJoinedPayload {
  conversationId: string;
  timeoutMinutes: number;
  lastActivityAt: string;
}

interface SessionExpiredPayload {
  reason: string;
  message: string;
}

export interface ConfirmationPayload {
  nombre: string;
  correo: string;
  motivo: string;
}

interface UseChatSocketProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onChatJoined: (data: ChatJoinedPayload) => void;
  onChatExpired: () => void;
  onHistory: (history: any[]) => void;
  onMessage: (payload: any) => void;
  onSessionError?: (payload: { message: string }) => void;
  onSessionExpired?: (payload: SessionExpiredPayload) => void;
  /** El back confirma que la conversación fue escalada y guardada en BD */
  onChatEscalated?: (payload: { conversationId: string }) => void;
  /**
   * El back pide que el front entre en modo "esperando motivo".
   * El mensaje de texto lo envía n8n por /chat/bot-reply normalmente.
   * Este evento solo sirve para que el front ajuste su estado si lo necesita.
   */
  onShowEscalateButton?: () => void;
  /** El back envía los datos recopilados para que el usuario los confirme */
  onShowConfirmation?: (payload: ConfirmationPayload) => void;
}

export const useChatSocket = ({
  onConnect,
  onDisconnect,
  onChatJoined,
  onChatExpired,
  onHistory,
  onMessage,
  onSessionError,
  onSessionExpired,
  onChatEscalated,
  onShowEscalateButton,
  onShowConfirmation,
}: UseChatSocketProps) => {
  useEffect(() => {
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-joined", onChatJoined);
    socket.on("load-history", onHistory);
    socket.on("on-message", onMessage);

    socket.on("session-expired", (payload: SessionExpiredPayload) => {
      onChatExpired();
      onSessionExpired?.(payload);
    });

    socket.on("session-error", (payload: { message: string }) => {
      onSessionError?.(payload);
    });

    socket.on("chat-escalated", (payload: { conversationId: string }) => {
      onChatEscalated?.(payload);
    });

    // El back emite esto cuando inicia el flujo de escalado.
    // El front puede usarlo para deshabilitar los chips o cambiar el placeholder.
    socket.on("show-escalate-button", () => {
      onShowEscalateButton?.();
    });

    // El back envía los datos recopilados para que el usuario los confirme antes
    // de finalizar el escalado.
    socket.on("show-confirmation", (payload: ConfirmationPayload) => {
      onShowConfirmation?.(payload);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat-joined", onChatJoined);
      socket.off("load-history", onHistory);
      socket.off("on-message", onMessage);
      socket.off("session-expired");
      socket.off("session-error");
      socket.off("chat-escalated");
      socket.off("show-escalate-button");
      socket.off("show-confirmation");
    };
  }, []);
};
