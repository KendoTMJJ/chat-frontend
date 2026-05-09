// src/hooks/useHelpdeskResponses.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export interface HelpdeskCategory {
  id:            number;
  intent:        string;
  display_label: string;
  has_document:  boolean;
  document_url:  string | null;
  description:   string | null;
}

export interface CreateHelpdeskCategoryDto {
  intent:       string;
  description?: string | null;
}

export interface UpdateHelpdeskCategoryDto {
  description?: string | null;
}

export const useHelpdeskCategories = () => {
  const { getAuthHeaders, logout } = useAuth();
  const [categories, setCategories] = useState<HelpdeskCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setCategories(await res.json());
    } catch {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (dto: CreateHelpdeskCategoryDto): Promise<number | null> => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      if (res.status === 401) { logout(); return null; }
      if (!res.ok) throw new Error();
      const created = await res.json();
      setSuccessMsg("Categoría creada correctamente.");
      await fetchAll();
      return created.id as number;
    } catch {
      setError("Error al crear la categoría.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: number, dto: UpdateHelpdeskCategoryDto) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories/${id}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setSuccessMsg("Categoría actualizada correctamente.");
      await fetchAll();
    } catch {
      setError("Error al actualizar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setSuccessMsg("Categoría eliminada correctamente.");
      await fetchAll();
    } catch {
      setError("Error al eliminar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async (id: number, file: File) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { Authorization } = getAuthHeaders() as { Authorization: string; "Content-Type": string };
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories/${id}/document`, {
        method: "POST",
        headers: { Authorization },
        body: form,
      });
      if (res.status === 401) return logout();
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Error al subir el documento.");
      }
      setSuccessMsg("Documento subido correctamente.");
      await fetchAll();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir el documento.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (id: number) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories/${id}/document`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setSuccessMsg("Documento eliminado correctamente.");
      await fetchAll();
    } catch {
      setError("Error al eliminar el documento.");
    } finally {
      setSaving(false);
    }
  };

  return {
    categories,
    loading,
    saving,
    error,
    successMsg,
    create,
    update,
    remove,
    uploadDocument,
    deleteDocument,
    refresh: fetchAll,
  };
};
