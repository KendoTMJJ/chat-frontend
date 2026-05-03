import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useProfile = () => {
  const { getAuthHeaders, logout } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearFeedback = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    clearFeedback();
    try {
      const res = await fetch(`${SERVER_URL}/admin/profile`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setProfile(await res.json());
    } catch {
      setError("No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (name: string, email: string) => {
    setSaving(true);
    clearFeedback();
    try {
      const res = await fetch(`${SERVER_URL}/admin/profile`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProfile(updated);
      setSuccessMsg("Perfil actualizado correctamente.");
    } catch {
      setError("No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    setSaving(true);
    clearFeedback();
    try {
      const res = await fetch(`${SERVER_URL}/admin/change-password`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.status === 401) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Contraseña actual incorrecta.");
        return false;
      }
      if (!res.ok) throw new Error();
      setSuccessMsg("Contraseña cambiada correctamente.");
      return true;
    } catch {
      setError("No se pudo cambiar la contraseña.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, error, successMsg, updateProfile, changePassword, clearFeedback };
};
