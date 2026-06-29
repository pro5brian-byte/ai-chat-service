import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Conversations from "./pages/admin/Conversations";
import Knowledge from "./pages/admin/Knowledge";
import AiSettings from "./pages/admin/AiSettings";
import SystemSettings from "./pages/admin/SystemSettings";
import { useAuth } from "./hooks/useAuth";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/conversations"
        element={
          <AdminRoute>
            <Conversations />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/knowledge"
        element={
          <AdminRoute>
            <Knowledge />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ai-settings"
        element={
          <AdminRoute>
            <AiSettings />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <SystemSettings />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
