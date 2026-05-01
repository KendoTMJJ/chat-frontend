// src/hooks/useHelpdeskResponses.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export interface HelpdeskCategory {
  id:            number;
  intent:        string;
  display_label: string;
  pdf_url:       string | null;
  description:   string | null;
}

export interface CreateHelpdeskCategoryDto {
  intent:       string;
  pdf_url?:     string | null;
  description?: string | null;
}

export interface UpdateHelpdeskCategoryDto {
  pdf_url?:     string | null;
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

  const create = async (dto: CreateHelpdeskCategoryDto) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${SERVER_URL}/admin/helpdesk/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      if (res.status === 401) return logout();
      if (!res.ok) throw new Error();
      setSuccessMsg("Categoría creada correctamente.");
      await fetchAll();
    } catch {
      setError("Error al crear la categoría.");
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
        headers: getAuthHeaders(),
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

  return { categories, loading, saving, error, successMsg, create, update, remove, refresh: fetchAll };
};
