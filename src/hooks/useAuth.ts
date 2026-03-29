import { useNavigate } from "react-router";

export const useAuth = () => {
  const navigate = useNavigate();

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const getAuthHeaders = () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      throw new Error("No hay token");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return { getAuthHeaders, logout };
};
