import ChatWidget from "@/components/ChatWidget";
import { Link } from "react-router";
import {
  MessageSquare,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Globe,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 智能回复",
    description: "基于知识库和先进 AI 模型，自动理解访客问题并给出精准回答，24小时不间断服务。",
  },
  {
    icon: Clock,
    title: "即时响应",
    description: "平均响应时间低于 1.2 秒，让访客无需等待即可获得满意的答复。",
  },
  {
    icon: Globe,
    title: "多场景覆盖",
    description: "支持产品咨询、售后服务、技术支持等多种业务场景，灵活适配企业需求。",
  },
  {
    icon: BarChart3,
    title: "数据分析",
    description: "实时监控对话数据，提供详细的统计报表，帮助企业洞察客户需求。",
  },
  {
    icon: Shield,
    title: "人工接管",
    description: "AI 无法处理的问题自动转接人工客服，确保每个问题都得到妥善解决。",
  },
  {
    icon: Zap,
    title: "简单部署",
    description: "一行代码即可嵌入企业网站，无需复杂配置，快速上线智能客服。",
  },
];

const highlights = [
  "支持自定义知识库，AI 回答更贴合企业业务",
  "智能转人工机制，复杂问题无缝交接",
  "完整的对话记录与满意度评价",
  "可视化数据统计与分析面板",
  "支持多平台接入，一次配置处处使用",
  "企业级安全保障，数据隐私无忧",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="h-16 border-b border-[#e5e7eb] flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-[#111827]">AI 智能客服</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-sm text-[#6b7280] hover:text-[#4f46e5] transition-colors hidden sm:block">
            功能特性
          </a>
          <a href="#highlights" className="text-sm text-[#6b7280] hover:text-[#4f46e5] transition-colors hidden sm:block">
            核心优势
          </a>
          <Link
            to="/admin/dashboard"
            className="h-9 px-4 bg-[#4f46e5] text-white text-sm rounded-md hover:bg-[#4338ca] flex items-center gap-1.5 transition-colors"
          >
            管理后台
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e0e7ff] text-[#4f46e5] text-xs font-medium rounded-full mb-6">
                <Zap className="w-3 h-3" />
                企业级 AI 客服解决方案
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-[#111827] leading-tight mb-4">
                让 AI 成为您的
                <span className="text-[#4f46e5]">超级客服</span>
              </h1>
              <p className="text-lg text-[#6b7280] leading-relaxed mb-8">
                基于知识库的智能对话系统，自动回复访客问题，支持人工接管，
                提供完整的数据分析和对话管理功能。
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to="/admin/dashboard"
                  className="h-11 px-6 bg-[#4f46e5] text-white text-sm font-medium rounded-lg hover:bg-[#4338ca] flex items-center gap-2 transition-colors"
                >
                  免费体验
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="h-11 px-6 border border-[#e5e7eb] text-[#111827] text-sm font-medium rounded-lg hover:bg-[#f8f9fa] flex items-center gap-2 transition-colors"
                >
                  了解更多
                </a>
              </div>

              <div className="flex items-center gap-6 mt-10 text-sm text-[#6b7280]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10b981]" />
                  无需信用卡
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10b981]" />
                  一键部署
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#10b981]" />
                  永久免费
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-[#e5e7eb]">
                {/* 模拟聊天界面 */}
                <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
                  <div className="h-12 border-b border-[#e5e7eb] flex items-center px-4 gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#e0e7ff] flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-[#4f46e5]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">智能客服</div>
                      <div className="text-[10px] text-[#10b981]">在线</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 h-48">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e0e7ff] flex items-center justify-center flex-shrink-0">
                        <Brain className="w-3 h-3 text-[#4f46e5]" />
                      </div>
                      <div className="bg-[#eef2ff] rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-[#111827]">
                        您好！我是您的智能客服助手，有什么可以帮助您的吗？
                      </div>
                    </div>
                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-[#f3f4f6] rounded-2xl rounded-br-sm px-3 py-2 text-sm text-[#111827]">
                        你们的产品价格是多少？
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#e0e7ff] flex items-center justify-center flex-shrink-0">
                        <Brain className="w-3 h-3 text-[#4f46e5]" />
                      </div>
                      <div className="bg-[#eef2ff] rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-[#111827]">
                        我们的基础版每月 ¥99，专业版每月 ¥299，企业版可以定制方案~
                      </div>
                    </div>
                  </div>
                  <div className="h-12 border-t border-[#e5e7eb] flex items-center px-4">
                    <div className="flex-1 h-8 bg-[#f8f9fa] rounded-md" />
                    <div className="w-8 h-8 rounded-full bg-[#4f46e5] ml-2 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#111827] mb-3">功能特性</h2>
            <p className="text-[#6b7280] max-w-xl mx-auto">
              一站式智能客服解决方案，从自动回复到数据分析，全面提升客户服务效率
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl border border-[#e5e7eb] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#e0e7ff] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#4f46e5]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111827] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 核心优势 */}
      <section id="highlights" className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#111827] mb-6">
                为什么选择我们的
                <br />
                <span className="text-[#4f46e5]">AI 智能客服</span>
              </h2>
              <div className="space-y-4">
                {highlights.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#ecfdf5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-[#10b981]" />
                    </div>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/admin/dashboard"
                  className="h-11 px-6 bg-[#4f46e5] text-white text-sm font-medium rounded-lg hover:bg-[#4338ca] inline-flex items-center gap-2 transition-colors"
                >
                  立即开始使用
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-[#e5e7eb]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] text-center">
                  <div className="text-3xl font-bold text-[#4f46e5] mb-1">87%</div>
                  <div className="text-xs text-[#6b7280]">AI 问题解决率</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] text-center">
                  <div className="text-3xl font-bold text-[#10b981] mb-1">1.2s</div>
                  <div className="text-xs text-[#6b7280]">平均响应时间</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] text-center">
                  <div className="text-3xl font-bold text-[#f59e0b] mb-1">24/7</div>
                  <div className="text-xs text-[#6b7280]">全天候在线</div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] text-center">
                  <div className="text-3xl font-bold text-[#8b5cf6] mb-1">100%</div>
                  <div className="text-xs text-[#6b7280]">满意度保障</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 px-6 lg:px-12 bg-[#f8f9fa]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#111827] mb-4">
            准备好提升您的客户服务了吗？
          </h2>
          <p className="text-[#6b7280] mb-8">
            立即部署 AI 智能客服，让每一通访客咨询都能得到及时、专业的回应
          </p>
          <Link
            to="/admin/dashboard"
            className="h-12 px-8 bg-[#4f46e5] text-white text-base font-medium rounded-lg hover:bg-[#4338ca] inline-flex items-center gap-2 transition-colors"
          >
            免费开始使用
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#4f46e5] flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-[#111827]">AI 智能客服系统</span>
          </div>
          <p className="text-xs text-[#9ca3af]"> 企业级 AI 客服解决方案</p>
        </div>
      </footer>

      {/* 聊天组件 */}
      <ChatWidget />
    </div>
  );
}
