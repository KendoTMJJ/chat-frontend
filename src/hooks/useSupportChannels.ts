// src/hooks/useSupportChannels.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface SupportChannel {
  id: string;
  context: "posgrados" | "mesa_ayuda";
  intent: string | null;
  whatsapp: string;
  email: string;
  updatedAt: string;
}

export const useSupportChannels = () => {
  const { getAuthHeaders, logout } = useAuth();
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/support-channels/show`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChannels(data);
    } catch {
      setError("No se pudieron cargar los canales de soporte.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, []);

  const createChannel = async (channel: {
    context: "posgrados" | "mesa_ayuda";
    intent?: string | null;
    whatsapp: string;
    email: string;
  }) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/support-channels/create`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...channel,
          intent: channel.intent?.trim() || null,
        }),
      });
      if (res.status === 401) return logout();
      if (res.status === 400) {
        setError("Ya existe un canal con ese contexto e intent.");
        await fetchChannels();
        return;
      }
      if (!res.ok) throw new Error();
      setSuccessMsg("Canal creado correctamente.");
      await fetchChannels();
    } catch {
      setError("Error al crear el canal.");
    } finally {
      setSaving(false);
    }
  };

  const deleteChannel = async (id: string) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/support-channels/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setSuccessMsg("Canal eliminado correctamente.");
      await fetchChannels();
    } catch {
      setError("Error al eliminar el canal.");
    } finally {
      setSaving(false);
    }
  };

  const updateChannel = async (channel: SupportChannel) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/support-channels/update`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(channel),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setSuccessMsg("Canal actualizado correctamente.");
      await fetchChannels();
    } catch {
      setError("Error al actualizar el canal.");
    } finally {
      setSaving(false);
    }
  };

  return {
    channels,
    loading,
    saving,
    error,
    successMsg,
    createChannel,
    updateChannel,
    deleteChannel,
    refetch: fetchChannels,
  };
};
