import { getDb } from "../api/queries/connection";
import { knowledgeCategories, knowledgeBase, aiSettings, systemSettings } from "./schema";

async function seed() {
  const db = getDb();

  // 初始化知识库分类
  const categories = [
    { name: "常见问题", description: "客户最常咨询的问题", sortOrder: 1 },
    { name: "产品介绍", description: "产品相关信息", sortOrder: 2 },
    { name: "价格方案", description: "定价和套餐信息", sortOrder: 3 },
    { name: "售后政策", description: "售后服务相关", sortOrder: 4 },
  ];

  for (const cat of categories) {
    await db.insert(knowledgeCategories).values(cat);
  }

  // 初始化知识库条目
  const knowledgeItems = [
    {
      categoryId: 1,
      question: "你们的工作时间是什么？",
      answer: "我们的客服团队工作时间为周一至周五 9:00-18:00，节假日除外。AI 智能客服全天 24 小时在线为您服务。",
      keywords: "工作时间,上班时间,客服时间,几点上班",
    },
    {
      categoryId: 1,
      question: "如何联系你们的客服？",
      answer: "您可以通过以下方式联系我们：1）使用网站右下角的 AI 智能客服；2）发送邮件至 support@example.com；3）拨打客服热线 400-XXX-XXXX。",
      keywords: "联系,客服,电话,邮箱,怎么联系",
    },
    {
      categoryId: 2,
      question: "你们提供哪些产品？",
      answer: "我们提供以下产品：基础版（适合小型企业）、专业版（适合中型企业）、企业版（适合大型企业，支持定制）。每个版本都包含 AI 智能客服、知识库管理、数据分析等核心功能。",
      keywords: "产品,有什么,提供什么,服务",
    },
    {
      categoryId: 2,
      question: "产品支持哪些平台？",
      answer: "我们的产品支持多种平台接入，包括：网站嵌入、微信小程序、钉钉、企业微信、飞书等。一次配置，多处使用。",
      keywords: "平台,支持,微信,小程序,接入",
    },
    {
      categoryId: 3,
      question: "产品的价格是多少？",
      answer: "我们的定价方案如下：基础版 ¥99/月，专业版 ¥299/月，企业版需要定制报价。年付可享受 8 折优惠。所有版本都提供 14 天免费试用。",
      keywords: "价格,多少钱,费用,定价,收费,怎么卖",
    },
    {
      categoryId: 3,
      question: "有免费试用吗？",
      answer: "有的！我们提供 14 天全功能免费试用，无需绑定信用卡。试用期间您可以体验所有功能，满意后再决定是否购买。",
      keywords: "免费,试用,体验,不要钱",
    },
    {
      categoryId: 4,
      question: "如何申请退款？",
      answer: "我们提供 7 天无理由退款保障。如需退款，请联系人工客服提交申请，我们会在 3-5 个工作日内处理完毕，款项将原路退回。",
      keywords: "退款,退货,退钱,怎么退",
    },
    {
      categoryId: 4,
      question: "遇到技术问题怎么办？",
      answer: "如果您遇到技术问题，可以通过以下方式获得帮助：1）咨询 AI 智能客服获取常见解决方案；2）查看帮助文档；3）提交工单给我们的技术团队；4）紧急问题请直接拨打技术支持热线。",
      keywords: "技术,问题,故障,bug,报错",
    },
  ];

  for (const item of knowledgeItems) {
    await db.insert(knowledgeBase).values(item);
  }

  // 初始化 AI 设置
  await db.insert(aiSettings).values({
    aiName: "智能客服",
    welcomeMessage: "您好！我是您的智能客服助手，有什么可以帮助您的吗？",
    transferKeywords: "人工,客服,转人工,人工客服,人工服务",
    temperature: 0.7,
    maxResponseLength: 200,
    responseLanguage: "auto",
    matchThreshold: 0.6,
    unknownReplyTemplate: "抱歉，我暂时无法回答这个问题，建议您联系人工客服。",
    autoEndMinutes: 30,
  });

  // 初始化系统设置
  await db.insert(systemSettings).values({
    siteName: "AI智能客服系统",
    workStartTime: "09:00",
    workEndTime: "18:00",
    timezone: "Asia/Shanghai",
    themeColor: "#4f46e5",
    chatPosition: "right",
    chatWindowSize: "standard",
    notifyNewChat: "yes",
    notifyHumanTransfer: "yes",
    notifyMethod: "in_app",
  });

  console.log("Seed data inserted successfully!");
}

seed().catch(console.error);
