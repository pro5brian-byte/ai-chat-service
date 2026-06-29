import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Brain, Loader2, Save } from "lucide-react";

export default function AiSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getAiSettings.useQuery();

  const [formData, setFormData] = useState({
    aiName: "",
    welcomeMessage: "",
    transferKeywords: "",
    temperature: 0.7,
    maxResponseLength: 200,
    responseLanguage: "auto",
    matchThreshold: 0.6,
    unknownReplyTemplate: "",
    autoEndMinutes: 30,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        aiName: settings.aiName || "",
        welcomeMessage: settings.welcomeMessage || "",
        transferKeywords: settings.transferKeywords || "",
        temperature: settings.temperature || 0.7,
        maxResponseLength: settings.maxResponseLength || 200,
        responseLanguage: settings.responseLanguage || "auto",
        matchThreshold: settings.matchThreshold || 0.6,
        unknownReplyTemplate: settings.unknownReplyTemplate || "",
        autoEndMinutes: settings.autoEndMinutes || 30,
      });
    }
  }, [settings]);

  const updateMutation = trpc.settings.updateAiSettings.useMutation({
    onSuccess: () => {
      utils.settings.getAiSettings.invalidate();
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
        <h1 className="text-xl font-semibold text-[#111827]">AI 设置</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">配置 AI 客服的行为和回复参数</p>
      </div>

      {/* 基础设置 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-[#4f46e5] rounded-full" />
          <h3 className="text-base font-semibold text-[#111827]">基础设置</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">AI 名称</label>
            <input
              type="text"
              value={formData.aiName}
              onChange={(e) => setFormData({ ...formData, aiName: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">欢迎语</label>
            <textarea
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              转人工关键词
              <span className="text-[#6b7280] font-normal ml-1">
                （当访客发送以下关键词时，自动提示转接人工客服）
              </span>
            </label>
            <input
              type="text"
              value={formData.transferKeywords}
              onChange={(e) => setFormData({ ...formData, transferKeywords: e.target.value })}
              placeholder="如: 人工、客服、转人工"
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
            />
          </div>
        </div>
      </div>

      {/* 回复参数 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-[#4f46e5] rounded-full" />
          <h3 className="text-base font-semibold text-[#111827]">回复参数</h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#111827]"> creativity (Temperature)</label>
              <span className="text-sm text-[#4f46e5] font-medium">{formData.temperature}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#e5e7eb] rounded-full appearance-none cursor-pointer accent-[#4f46e5]"
            />
            <div className="flex justify-between text-xs text-[#9ca3af] mt-1">
              <span>精确</span>
              <span>创意</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#111827]">最大回复长度</label>
              <span className="text-sm text-[#4f46e5] font-medium">{formData.maxResponseLength} 字</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={formData.maxResponseLength}
              onChange={(e) => setFormData({ ...formData, maxResponseLength: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#e5e7eb] rounded-full appearance-none cursor-pointer accent-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">回复语言</label>
            <select
              value={formData.responseLanguage}
              onChange={(e) => setFormData({ ...formData, responseLanguage: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
            >
              <option value="auto">自动检测</option>
              <option value="zh">中文</option>
              <option value="en">英文</option>
            </select>
          </div>
        </div>
      </div>

      {/* 高级设置 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-[#4f46e5] rounded-full" />
          <h3 className="text-base font-semibold text-[#111827]">高级设置</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#111827]">知识库匹配阈值</label>
              <span className="text-sm text-[#4f46e5] font-medium">{formData.matchThreshold}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={formData.matchThreshold}
              onChange={(e) => setFormData({ ...formData, matchThreshold: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#e5e7eb] rounded-full appearance-none cursor-pointer accent-[#4f46e5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">未知问题回复模板</label>
            <textarea
              value={formData.unknownReplyTemplate}
              onChange={(e) => setFormData({ ...formData, unknownReplyTemplate: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">
              自动结束对话时间（分钟）
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={formData.autoEndMinutes}
              onChange={(e) => setFormData({ ...formData, autoEndMinutes: parseInt(e.target.value) })}
              className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
            />
          </div>
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
            <Brain className="w-3 h-3 text-[#10b981]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">保存成功</p>
            <p className="text-xs text-[#6b7280]">AI 设置已更新</p>
          </div>
        </div>
      )}
    </div>
  );
}
