import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Calendar,
  Download,
  Eye,
  Send,
  MessageCircle,
  X,
  Loader2,
  User,
  Bot,
  Phone,
  CheckCircle,
} from "lucide-react";

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "active", label: "进行中" },
  { value: "ended", label: "已结束" },
  { value: "pending_human", label: "待人工" },
  { value: "human_handling", label: "人工处理中" },
];

export default function Conversations() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.chat.listSessions.useQuery({
    status,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: sessionDetail } = trpc.chat.getSessionDetail.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId }
  );

  const replyMutation = trpc.chat.adminReply.useMutation({
    onSuccess: () => {
      setReplyContent("");
      setIsReplying(false);
      utils.chat.getSessionDetail.invalidate({ sessionId: selectedSessionId! });
      utils.chat.listSessions.invalidate();
    },
  });

  const takeOverMutation = trpc.chat.takeOver.useMutation({
    onSuccess: () => {
      utils.chat.getSessionDetail.invalidate({ sessionId: selectedSessionId! });
      utils.chat.listSessions.invalidate();
    },
  });

  const endSessionMutation = trpc.chat.endSession.useMutation({
    onSuccess: () => {
      utils.chat.listSessions.invalidate();
      utils.chat.getSessionDetail.invalidate({ sessionId: selectedSessionId! });
    },
  });

  const handleReply = () => {
    if (!replyContent.trim() || !selectedSessionId) return;
    setIsReplying(true);
    replyMutation.mutate({ sessionId: selectedSessionId, content: replyContent.trim() });
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-[#ecfdf5] text-[#10b981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            进行中
          </span>
        );
      case "ended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-[#f3f4f6] text-[#6b7280]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6b7280]" />
            已结束
          </span>
        );
      case "pending_human":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-[#fef3c7] text-[#92400e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            待人工
          </span>
        );
      case "human_handling":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-[#e0e7ff] text-[#4f46e5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
            人工处理中
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">对话管理</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">查看和管理所有客服对话</p>
      </div>

      {/* 搜索与筛选 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索访客或消息内容"
            className="w-full h-9 pl-9 pr-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#9ca3af]" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-2 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5]"
          />
          <span className="text-[#9ca3af]">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 px-2 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5]"
          />
        </div>

        <button className="ml-auto h-9 px-4 text-sm border border-[#e5e7eb] rounded-md hover:bg-[#f8f9fa] text-[#6b7280] flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          导出数据
        </button>
      </div>

      {/* 对话列表 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f8f9fa]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">访客</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">状态</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">消息数</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">来源</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">最后活动</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">满意度</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280]">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-[#9ca3af]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  加载中...
                </td>
              </tr>
            ) : data?.sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-[#9ca3af]">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-[#e5e7eb]" />
                  暂无对话记录
                </td>
              </tr>
            ) : (
              data?.sessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center text-xs font-semibold text-[#4f46e5]">
                        {session.visitorName?.charAt(0) || "访"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{session.visitorName}</p>
                        <p className="text-xs text-[#9ca3af]">ID: {session.visitorId.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(session.status)}</td>
                  <td className="px-4 py-3 text-sm text-[#111827]">{session.messageCount}</td>
                  <td className="px-4 py-3 text-sm text-[#6b7280]">{session.source}</td>
                  <td className="px-4 py-3 text-sm text-[#6b7280]">
                    {new Date(session.updatedAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">
                    {session.satisfaction ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <CheckCircle
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= session.satisfaction!
                                ? star <= 3
                                  ? "text-[#ef4444]"
                                  : star === 4
                                  ? "text-[#f59e0b]"
                                  : "text-[#10b981]"
                                : "text-[#e5e7eb]"
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#9ca3af]">未评价</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSessionId(session.id)}
                        className="text-xs text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看
                      </button>
                      {session.status === "pending_human" && (
                        <button
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            takeOverMutation.mutate({ sessionId: session.id });
                          }}
                          className="text-xs text-[#10b981] hover:text-[#059669] flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          接入
                        </button>
                      )}
                      {session.status !== "ended" && (
                        <button
                          onClick={() => endSessionMutation.mutate({ sessionId: session.id })}
                          className="text-xs text-[#6b7280] hover:text-[#ef4444] transition-colors"
                        >
                          结束
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 对话详情弹窗 */}
      {selectedSessionId && sessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedSessionId(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-[640px] max-h-[80vh] flex flex-col" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            {/* 弹窗标题 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center text-xs font-semibold text-[#4f46e5]">
                  {sessionDetail.session.visitorName?.charAt(0) || "访"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">{sessionDetail.session.visitorName}</h3>
                  <p className="text-xs text-[#6b7280]">{sessionDetail.session.source}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 消息区 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
              {sessionDetail.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {msg.sender !== "visitor" && (
                      <div className="w-6 h-6 rounded-full bg-[#e0e7ff] flex items-center justify-center flex-shrink-0">
                        {msg.sender === "ai" ? (
                          <Bot className="w-3.5 h-3.5 text-[#4f46e5]" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-[#4f46e5]" />
                        )}
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 text-sm ${
                        msg.sender === "visitor"
                          ? "bg-[#f3f4f6] rounded-2xl rounded-br-sm text-[#111827]"
                          : msg.sender === "human"
                          ? "bg-[#ecfdf5] rounded-2xl rounded-bl-sm text-[#111827]"
                          : "bg-[#eef2ff] rounded-2xl rounded-bl-sm text-[#111827]"
                      }`}
                    >
                      {msg.content}
                      <div className="text-[10px] text-[#9ca3af] mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {msg.sender === "visitor" && (
                      <div className="w-6 h-6 rounded-full bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-[#6b7280]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 回复输入 */}
            {sessionDetail.session.status !== "ended" && (
              <div className="p-4 border-t border-[#e5e7eb]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder="输入回复内容..."
                    className="flex-1 h-9 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || isReplying}
                    className="h-9 px-4 bg-[#4f46e5] text-white text-sm rounded-md hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  >
                    {isReplying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    发送
                  </button>
                </div>
              </div>
            )}

            {/* 访客信息侧边 */}
            <div className="px-5 py-3 border-t border-[#e5e7eb] bg-[#f8f9fa] rounded-b-xl">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#6b7280]">访客ID: </span>
                  <span className="text-[#111827]">{sessionDetail.session.visitorId.slice(-8)}</span>
                </div>
                <div>
                  <span className="text-[#6b7280]">来源: </span>
                  <span className="text-[#111827]">{sessionDetail.session.source}</span>
                </div>
                <div>
                  <span className="text-[#6b7280]">设备: </span>
                  <span className="text-[#111827]">{sessionDetail.session.device || "未知"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
