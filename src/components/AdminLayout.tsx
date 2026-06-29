import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Brain,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "仪表盘" },
  { path: "/admin/conversations", icon: MessageSquare, label: "对话管理" },
  { path: "/admin/knowledge", icon: BookOpen, label: "知识库" },
  { path: "/admin/ai-settings", icon: Brain, label: "AI 设置" },
  { path: "/admin/settings", icon: Settings, label: "系统设置" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 获取当前页面标题
  const currentNav = navItems.find((item) => location.pathname === item.path);
  const pageTitle = currentNav?.label || "管理后台";

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* 侧边栏 */}
      <aside className="w-60 bg-white border-r border-[#e5e7eb] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#e5e7eb]">
          <Shield className="w-5 h-5 text-[#4f46e5] mr-2" />
          <span className="text-sm font-semibold text-[#111827]">AI 智能客服系统</span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#e0e7ff] text-[#4f46e5] border-l-[3px] border-[#4f46e5]"
                    : "text-[#6b7280] hover:bg-[#f8f9fa]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 用户信息 */}
        <div className="p-3 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f8f9fa]">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center text-xs font-semibold text-[#4f46e5]">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate">{user?.name || "管理员"}</p>
              <p className="text-xs text-[#6b7280]">{user?.email || ""}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="p-1.5 rounded-md hover:bg-[#e5e7eb] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/admin/dashboard" className="text-[#6b7280] hover:text-[#4f46e5] transition-colors">
              管理后台
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span className="text-[#111827] font-medium">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-[#6b7280] hover:text-[#4f46e5] transition-colors"
              target="_blank"
            >
              查看网站
            </Link>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
