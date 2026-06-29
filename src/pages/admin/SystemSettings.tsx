import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Settings, Loader2, Save, Bell } from "lucide-react";

const themeColors = [
  { color: "#4f46e5", name: "靛蓝" },
  { color: "#10b981", name: "翡翠绿" },
  { color: "#f59e0b", name: "琥珀色" },
  { color: "#ef4444", name: "红色" },
  { color: "#8b5cf6", name: "紫色" },
  { color: "#ec4899", name: "粉色" },
];

export default function SystemSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getSystemSettings.useQuery();

  const [formData, setFormData] = useState({
    siteName: "",
    siteLogo: "",
    workStartTime: "09:00",
    workEndTime: "18:00",
    timezone: "Asia/Shanghai",
    themeColor: "#4f46e5",
    chatPosition: "right" as "left" | "right",
    chatWindowSize: "standard" as "compact" | "standard" | "large",
    notifyNewChat: "yes" as "yes" | "no",
    notifyHumanTransfer: "yes" as "yes" | "no",
    notifyMethod: "in_app" as "email" | "in_app" | "both",
    notifyEmail: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        siteLogo: settings.siteLogo || "",
        workStartTime: settings.workStartTime || "09:00",
        workEndTime: settings.workEndTime || "18:00",
        timezone: settings.timezone || "Asia/Shanghai",
        themeColor: settings.themeColor || "#4f46e5",
        chatPosition: (settings.chatPosition as "left" | "right") || "right",
        chatWindowSize: (settings.chatWindowSize as "compact" | "standard" | "large") || "standard",
        notifyNewChat: (settings.notifyNewChat as "yes" | "no") || "yes",
        notifyHumanTransfer: (settings.notifyHumanTransfer as "yes" | "no") || "yes",
        notifyMethod: (settings.notifyMethod as "email" | "in_app" | "both") || "in_app",
        notifyEmail: settings.notifyEmail || "",
      });
    }
  }, [settings]);

  const updateMutation = trpc.settings.updateSystemSettings.useMutation({
    onSuccess: () => {
      utils.settings.getSystemSettings.invalidate();
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-[#9ca3af]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">系统设置</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">配置系统的基本参数和外观</p>
      </div>

      {/* 网站信息 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-[#4f46e5] rounded-full" />
          <h3 className="text-base font-semibold text-[#111827]">网站信息</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">网站名称</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">网站 Logo URL</label>
            <input
              type="text"
              value={formData.siteLogo}
              onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
            />
            {formData.siteLogo && (
              <img src={formData.siteLogo} alt="Logo预览" className="mt-2 h-10 object-contain" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">工作时间（开始）</label>
              <input
                type="time"
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">工作时间（结束）</label>
              <input
                type="time"
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">时区</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
              >
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 聊天窗口外观 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-[#4f46e5] rounded-full" />
          <h3 className="text-base font-semibold text-[#111827]">聊天窗口外观</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">主题色</label>
            <div className="flex gap-3">
              {themeColors.map((tc) => (
                <button
                  key={tc.color}
                  onClick={() => setFormData({ ...formData, themeColor: tc.color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.themeColor === tc.color
                      ? "ring-2 ring-offset-2 ring-[#111827] scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: tc.color }}
                  title={tc.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">聊天窗口位置</label>
            <div className="flex gap-3">
              {[
                { value: "right" as const, label: "右下角" },
                { value: "left" as const, label: "左下角" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, chatPosition: opt.value })}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    formData.chatPosition === opt.value
                      ? "border-[#4f46e5] bg-[#e0e7ff] text-[#4f46e5]"
                      : "border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8f9fa]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">聊天窗口尺寸</label>
            <div className="flex gap-3">
              {[
                { value: "compact" as const, label: "紧凑" },
                { value: "standard" as const, label: "标准" },
                { value: "large" as const, label: "宽大" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, chatWindowSize: opt.value })}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    formData.chatWindowSize === opt.value
                      ? "border-[#4f46e5] bg-[#e0e7ff] text-[#4f46e5]"
                      : "border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8f9fa]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-[#4f46e5] rounded-full" />
          <h3 className="text-base font-semibold text-[#111827]">通知设置</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6b7280]" />
              <span className="text-sm text-[#111827]">新对话通知</span>
            </div>
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  notifyNewChat: formData.notifyNewChat === "yes" ? "no" : "yes",
                })
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.notifyNewChat === "yes" ? "bg-[#4f46e5]" : "bg-[#d1d5db]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  formData.notifyNewChat === "yes" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6b7280]" />
              <span className="text-sm text-[#111827]">待人工接入通知</span>
            </div>
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  notifyHumanTransfer: formData.notifyHumanTransfer === "yes" ? "no" : "yes",
                })
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.notifyHumanTransfer === "yes" ? "bg-[#4f46e5]" : "bg-[#d1d5db]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  formData.notifyHumanTransfer === "yes" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">通知方式</label>
            <select
              value={formData.notifyMethod}
              onChange={(e) =>
                setFormData({ ...formData, notifyMethod: e.target.value as "email" | "in_app" | "both" })
              }
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
            >
              <option value="in_app">站内消息</option>
              <option value="email">邮件</option>
              <option value="both">邮件 + 站内消息</option>
            </select>
          </div>

          {(formData.notifyMethod === "email" || formData.notifyMethod === "both") && (
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">通知邮箱</label>
              <input
                type="email"
                value={formData.notifyEmail}
                onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
                placeholder="admin@example.com"
                className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
              />
            </div>
          )}
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="h-10 px-6 bg-[#4f46e5] text-white text-sm font-medium rounded-md hover:bg-[#4338ca] disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          保存设置
        </button>
      </div>

      {updateMutation.isSuccess && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border-l-4 border-[#10b981] p-4 flex items-center gap-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div className="w-5 h-5 rounded-full bg-[#ecfdf5] flex items-center justify-center">
            <Settings className="w-3 h-3 text-[#10b981]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">保存成功</p>
            <p className="text-xs text-[#6b7280]">系统设置已更新</p>
          </div>
        </div>
      )}
    </div>
  );
}
