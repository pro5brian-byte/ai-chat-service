import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  MessageCircle,
  X,
  Minimize2,
  Send,
  Loader2,
  User,
  Bot,
  RefreshCw,
} from "lucide-react";

interface ChatMessage {
  id: number;
  sender: "visitor" | "ai" | "human";
  content: string;
  createdAt: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorId, setVisitorId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiName, setAiName] = useState("智能客服");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // 获取欢迎语
  const { data: welcomeData } = trpc.chat.getWelcomeMessage.useQuery();

  // 获取已有会话消息
  const { data: sessionData } = trpc.chat.getSessionMessages.useQuery(
    { visitorId },
    { enabled: !!visitorId }
  );

  // 发送消息
  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setVisitorId(data.visitorId);
      if (data.aiResponse) {
        const aiMsg: ChatMessage = {
          id: Date.now(),
          sender: "ai",
          content: data.aiResponse,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
      setIsLoading(false);
      utils.chat.getSessionMessages.invalidate({ visitorId: data.visitorId });
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  // 开始新会话
  const newSessionMutation = trpc.chat.startNewSession.useMutation({
    onSuccess: (data) => {
      setVisitorId(data.visitorId);
      setMessages([]);
      setAiName(data.aiName);
      // 添加欢迎语
      if (data.welcomeMessage) {
        const welcomeMsg: ChatMessage = {
          id: Date.now(),
          sender: "ai",
          content: data.welcomeMessage,
          createdAt: new Date(),
        };
        setMessages([welcomeMsg]);
      }
    },
  });

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 加载已有消息
  useEffect(() => {
    if (sessionData?.messages) {
      const loadedMessages = sessionData.messages.map((m) => ({
        id: m.id,
        sender: m.sender as "visitor" | "ai" | "human",
        content: m.content,
        createdAt: new Date(m.createdAt),
      }));
      setMessages(loadedMessages);
    }
  }, [sessionData]);

  // 首次打开时加载欢迎语
  useEffect(() => {
    if (isOpen && messages.length === 0 && !visitorId) {
      if (welcomeData) {
        setAiName(welcomeData.aiName);
        const welcomeMsg: ChatMessage = {
          id: Date.now(),
          sender: "ai",
          content: welcomeData.welcomeMessage,
          createdAt: new Date(),
        };
        setMessages([welcomeMsg]);
      }
    }
  }, [isOpen, welcomeData]);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;

    const visitorMsg: ChatMessage = {
      id: Date.now(),
      sender: "visitor",
      content: message.trim(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, visitorMsg]);
    setIsLoading(true);

    sendMutation.mutate({
      visitorId: visitorId || undefined,
      message: message.trim(),
      source: "首页",
    });

    setMessage("");
  };

  const handleNewSession = () => {
    if (visitorId) {
      newSessionMutation.mutate({ visitorId });
    } else {
      const newId = "v_" + Math.random().toString(36).substring(2, 15);
      setVisitorId(newId);
      if (welcomeData) {
        setAiName(welcomeData.aiName);
        const welcomeMsg: ChatMessage = {
          id: Date.now(),
          sender: "ai",
          content: welcomeData.welcomeMessage,
          createdAt: new Date(),
        };
        setMessages([welcomeMsg]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 浮动气泡按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#4f46e5] text-white flex items-center justify-center shadow-lg hover:bg-[#4338ca] transition-all hover:scale-105"
          style={{ boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl flex flex-col overflow-hidden"
          style={{
            width: "380px",
            height: "560px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* 标题栏 */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#4f46e5]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#111827]">{aiName}</div>
                <div className="text-xs text-[#10b981]">在线</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewSession}
                className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                title="新对话"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 消息区 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-[#e0e7ff] flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-[#4f46e5]" />
                </div>
                <p className="text-sm font-medium text-[#111827]">{aiName}</p>
                <p className="text-xs text-[#6b7280] mt-1">随时为您解答问题</p>
              </div>
            )}

            {messages.map((msg) => (
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
                    className={`px-4 py-2.5 text-sm ${
                      msg.sender === "visitor"
                        ? "bg-[#f3f4f6] rounded-2xl rounded-br-sm text-[#111827]"
                        : msg.sender === "human"
                        ? "bg-[#ecfdf5] rounded-2xl rounded-bl-sm text-[#111827]"
                        : "bg-[#eef2ff] rounded-2xl rounded-bl-sm text-[#111827]"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] text-[#9ca3af] mt-1">
                      {msg.createdAt.toLocaleTimeString("zh-CN", {
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

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className="w-6 h-6 rounded-full bg-[#e0e7ff] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#4f46e5]" />
                  </div>
                  <div className="bg-[#eef2ff] rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="h-16 border-t border-[#e5e7eb] px-4 py-2 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入您的问题..."
              className="flex-1 h-9 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
