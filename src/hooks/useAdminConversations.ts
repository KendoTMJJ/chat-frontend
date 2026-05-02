// src/hooks/useAdminConversations.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface ConversationSummary {
  conversationId: string;
  userId: string;
  nombre: string | null;
  correo: string | null;
  status: "active" | "closed" | "expired" | "escalated";
  title: string | null;
  context: string | null;
  lastMessage: string;
  updatedAt: string;
  startedAt: string;
}

export interface ChatMessage {
  codMessage: string;
  sender: "user" | "bot";
  message: string;
  createAt: string;
}

export const useAdminConversations = () => {
  const { getAuthHeaders, logout } = useAuth();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/admin/conversations`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data);
    } catch {
      setError("No se pudieron cargar las bitácoras.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchHistory = async (id: string) => {
    setChatHistory([]);
    try {
      const res = await fetch(`${SERVER_URL}/admin/history/${id}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChatHistory(data);
    } catch (err) {
      console.error("Error cargando historial", err);
    }
  };

  const closeConversation = async (id: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/admin/conversations/${id}/close`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      // Actualizar estado local optimistamente
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === id ? { ...c, status: "closed" as const } : c,
        ),
      );
    } catch (err) {
      console.error("Error cerrando conversación", err);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/admin/conversations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      // Eliminar del estado local
      setConversations((prev) => prev.filter((c) => c.conversationId !== id));
    } catch (err) {
      console.error("Error eliminando conversación", err);
    }
  };

  return {
    conversations,
    chatHistory,
    loading,
    error,
    fetchHistory,
    refetch: fetchConversations,
    closeConversation,
    deleteConversation,
  };
};
