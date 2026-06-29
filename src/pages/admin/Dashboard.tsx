import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6b7280"];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"7" | "30">("30");
  const { data: stats, isLoading } = trpc.stats.getDashboardStats.useQuery(
    { days: Number(timeRange) },
    { refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-5 animate-pulse">
              <div className="h-4 bg-[#e5e7eb] rounded w-20 mb-3" />
              <div className="h-8 bg-[#e5e7eb] rounded w-24 mb-2" />
              <div className="h-3 bg-[#e5e7eb] rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 bg-white rounded-xl border border-[#e5e7eb] p-5 animate-pulse h-80" />
          <div className="col-span-2 bg-white rounded-xl border border-[#e5e7eb] p-5 animate-pulse h-80" />
        </div>
      </div>
    );
  }

  const overview = stats?.overview;

  const statCards = [
    {
      title: "总对话数",
      value: overview?.totalConversations?.toLocaleString() || "0",
      change: `+${overview?.todayChange || 0}%`,
      isPositive: true,
      icon: MessageSquare,
    },
    {
      title: "今日对话",
      value: overview?.todayConversations?.toString() || "0",
      change: "+8.2%",
      isPositive: true,
      icon: Clock,
    },
    {
      title: "AI 解决率",
      value: `${overview?.aiResolutionRate || 0}%`,
      change: `+${overview?.aiResolutionChange || 0}%`,
      isPositive: true,
      icon: CheckCircle,
    },
    {
      title: "平均响应时间",
      value: `${overview?.avgResponseTime || 0}s`,
      change: "-15%",
      isPositive: true,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-5">
      {/* 页面标题 */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">仪表盘</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">查看客服系统运行数据</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-[#e5e7eb] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#4f46e5]" />
                </div>
                <span className="text-xs text-[#6b7280]">{card.title}</span>
              </div>
              <div className="text-2xl font-bold text-[#111827] mb-1.5">{card.value}</div>
              <div className={`flex items-center gap-1 text-xs ${card.isPositive ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                {card.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-5 gap-5">
        {/* 对话趋势图 */}
        <div className="col-span-3 bg-white rounded-xl border border-[#e5e7eb] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111827]">近 {timeRange} 天对话趋势</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setTimeRange("7")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeRange === "7"
                    ? "bg-[#4f46e5] text-white"
                    : "bg-[#f8f9fa] text-[#6b7280] hover:bg-[#e5e7eb]"
                }`}
              >
                本周
              </button>
              <button
                onClick={() => setTimeRange("30")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeRange === "30"
                    ? "bg-[#4f46e5] text-white"
                    : "bg-[#f8f9fa] text-[#6b7280] hover:bg-[#e5e7eb]"
                }`}
              >
                本月
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats?.dailyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(val) => val.slice(5)}
                stroke="#e5e7eb"
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} stroke="#e5e7eb" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: "#4f46e5", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 来源分布 */}
        <div className="col-span-2 bg-white rounded-xl border border-[#e5e7eb] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">对话来源分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats?.sourceDistribution || []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {(stats?.sourceDistribution || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {(stats?.sourceDistribution || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近对话 */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#111827]">最近对话</h3>
          <a
            href="/admin/conversations"
            className="text-xs text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1 transition-colors"
          >
            查看全部
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-2">
          {(stats?.recentSessions || []).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#f8f9fa] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center text-xs font-semibold text-[#4f46e5]">
                  {session.visitorName?.charAt(0) || "访"}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">{session.visitorName}</p>
                  <p className="text-xs text-[#6b7280]">
                    {session.messageCount} 条消息
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs ${
                    session.status === "active"
                      ? "bg-[#ecfdf5] text-[#10b981]"
                      : session.status === "pending_human"
                      ? "bg-[#fef3c7] text-[#92400e]"
                      : session.status === "human_handling"
                      ? "bg-[#e0e7ff] text-[#4f46e5]"
                      : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      session.status === "active"
                        ? "bg-[#10b981]"
                        : session.status === "pending_human"
                        ? "bg-[#f59e0b]"
                        : session.status === "human_handling"
                        ? "bg-[#4f46e5]"
                        : "bg-[#6b7280]"
                    }`}
                  />
                  {session.status === "active"
                    ? "进行中"
                    : session.status === "ended"
                    ? "已结束"
                    : session.status === "pending_human"
                    ? "待人工"
                    : "人工处理中"}
                </span>
                <span className="text-xs text-[#9ca3af]">
                  {new Date(session.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          ))}

          {(!stats?.recentSessions || stats.recentSessions.length === 0) && (
            <div className="text-center py-8 text-sm text-[#9ca3af]">
              暂无对话记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
