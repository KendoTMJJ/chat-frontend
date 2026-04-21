import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import { AdminPage, Chat, HomePage } from "../pages";
import ProtectedRoute from "./ProtectedRoute";
import AdminLoginPage from "../pages/Admin/AdminLoginPage";
import ResetPasswordPage from "../pages/Admin/ResetPasswordPage";
import ChatPage from "../pages/Chat/ChatPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // 👇 SOLO para desarrolladores internos
      { path: "dev/chat", element: <ChatPage /> },

      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      { path: "login", element: <AdminLoginPage /> },
      { path: "admin/reset-password", element: <ResetPasswordPage /> },
    ],
  },

  // 👇 RUTA PÚBLICA LIMPIA (NO usa layout)
  {
    path: "/widget/chat",
    element: <Chat />,
  },
]);
