import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  BookOpen,
} from "lucide-react";

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    categoryId: "",
    keywords: "",
  });

  const utils = trpc.useUtils();

  const { data: categories } = trpc.knowledge.listCategories.useQuery();
  const { data: knowledgeData, isLoading } = trpc.knowledge.listKnowledge.useQuery({
    categoryId: activeCategory || undefined,
    search: search || undefined,
  });

  const createMutation = trpc.knowledge.createKnowledge.useMutation({
    onSuccess: () => {
      utils.knowledge.listKnowledge.invalidate();
      closeModal();
    },
  });

  const updateMutation = trpc.knowledge.updateKnowledge.useMutation({
    onSuccess: () => {
      utils.knowledge.listKnowledge.invalidate();
      closeModal();
    },
  });

  const deleteMutation = trpc.knowledge.deleteKnowledge.useMutation({
    onSuccess: () => {
      utils.knowledge.listKnowledge.invalidate();
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ question: "", answer: "", categoryId: "", keywords: "" });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ question: "", answer: "", categoryId: "", keywords: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: { id: number; question: string; answer: string; categoryId: number | null; keywords: string | null }) => {
    setEditingId(item.id);
    setFormData({
      question: item.question,
      answer: item.answer,
      categoryId: item.categoryId?.toString() || "",
      keywords: item.keywords || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        question: formData.question,
        answer: formData.answer,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        keywords: formData.keywords,
      });
    } else {
      createMutation.mutate({
        question: formData.question,
        answer: formData.answer,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        keywords: formData.keywords,
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">知识库</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">管理 AI 客服的知识内容</p>
        </div>
        <button
          onClick={openCreateModal}
          className="h-9 px-4 bg-[#4f46e5] text-white text-sm rounded-md hover:bg-[#4338ca] flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加知识
        </button>
      </div>

      {/* 分类标签 + 搜索 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeCategory === null
                ? "bg-[#4f46e5] text-white"
                : "bg-[#f8f9fa] text-[#6b7280] hover:bg-[#e5e7eb]"
            }`}
          >
            全部
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#4f46e5] text-white"
                  : "bg-[#f8f9fa] text-[#6b7280] hover:bg-[#e5e7eb]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索问题"
            className="w-full h-9 pl-9 pr-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
          />
        </div>
      </div>

      {/* 知识条目列表 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#9ca3af]" />
            <p className="text-sm text-[#9ca3af]">加载中...</p>
          </div>
        ) : knowledgeData?.items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e5e7eb]">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#e5e7eb]" />
            <p className="text-sm text-[#9ca3af]">暂无知识条目</p>
            <button
              onClick={openCreateModal}
              className="mt-2 text-sm text-[#4f46e5] hover:text-[#4338ca] transition-colors"
            >
              添加第一条知识
            </button>
          </div>
        ) : (
          knowledgeData?.items.map((item) => {
            const category = categories?.find((c) => c.id === item.categoryId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:border-[#d1d5db] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    {category && (
                      <span className="px-2.5 py-0.5 bg-[#e0e7ff] text-[#4f46e5] text-xs rounded-full">
                        {category.name}
                      </span>
                    )}
                    {!category && item.categoryId && (
                      <span className="px-2.5 py-0.5 bg-[#f3f4f6] text-[#6b7280] text-xs rounded-full">
                        未分类
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("确定要删除这条知识吗？")) {
                          deleteMutation.mutate({ id: item.id });
                        }
                      }}
                      className="p-1.5 rounded-md hover:bg-[#fef2f2] text-[#9ca3af] hover:text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-[#111827] mb-1">{item.question}</h4>
                <p className="text-sm text-[#6b7280] line-clamp-2">{item.answer}</p>
                {item.keywords && (
                  <p className="text-xs text-[#9ca3af] mt-2">关键词: {item.keywords}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 新建/编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
              <h3 className="text-base font-semibold text-[#111827]">
                {editingId ? "编辑知识" : "新建知识"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md hover:bg-[#f8f9fa] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  问题 <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="输入客户可能问的问题"
                  required
                  className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">
                  答案 <span className="text-[#ef4444]">*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="输入 AI 应该给出的回答"
                  required
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">分类</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] bg-white"
                >
                  <option value="">选择分类</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1.5">关键词</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="如：价格,费用,多少钱（用逗号分隔）"
                  className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-md focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#e5e7eb]">
              <button
                type="button"
                onClick={closeModal}
                className="h-9 px-4 text-sm border border-[#e5e7eb] rounded-md hover:bg-[#f8f9fa] text-[#111827] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-9 px-4 bg-[#4f46e5] text-white text-sm rounded-md hover:bg-[#4338ca] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
