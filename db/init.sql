-- =====================================================
-- AI智能客服系统 - 数据库初始化脚本
-- 数据库: TiDB Cloud (MySQL兼容)
-- 使用方法: 登录 TiDB Cloud → SQL Editor → 粘贴执行
-- =====================================================

-- -----------------------------------------------------
-- 1. 用户表 (OAuth认证 + 管理员)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  unionId VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(320),
  avatar TEXT,
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  lastSignInAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- -----------------------------------------------------
-- 2. 聊天会话表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  visitor_id VARCHAR(64) NOT NULL,
  visitor_name VARCHAR(255) DEFAULT '访客',
  source VARCHAR(255) DEFAULT '首页',
  device VARCHAR(255),
  ip_address VARCHAR(64),
  status ENUM('active', 'ended', 'pending_human', 'human_handling') DEFAULT 'active' NOT NULL,
  satisfaction INT,
  message_count INT DEFAULT 0,
  ai_resolved ENUM('yes', 'no', 'unknown') DEFAULT 'unknown',
  assigned_to INT UNSIGNED,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visitor (visitor_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- -----------------------------------------------------
-- 3. 聊天消息表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  session_id INT UNSIGNED NOT NULL,
  sender ENUM('visitor', 'ai', 'human') NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_session (session_id),
  INDEX idx_created (created_at)
);

-- -----------------------------------------------------
-- 4. 知识库分类表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_categories (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 5. 知识库条目表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  category_id INT UNSIGNED,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  keywords VARCHAR(500),
  hit_count INT DEFAULT 0,
  is_active ENUM('yes', 'no') DEFAULT 'yes' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT INDEX ft_question (question),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 6. AI设置表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_settings (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  ai_name VARCHAR(100) DEFAULT '智能客服',
  welcome_message VARCHAR(1000) DEFAULT '您好！我是您的智能客服助手，有什么可以帮助您的吗？',
  transfer_keywords VARCHAR(500) DEFAULT '人工,客服,转人工,人工客服',
  temperature FLOAT DEFAULT 0.7,
  max_response_length INT DEFAULT 500,
  response_language VARCHAR(20) DEFAULT 'auto',
  match_threshold FLOAT DEFAULT 0.6,
  unknown_reply_template VARCHAR(1000) DEFAULT '抱歉，我暂时无法回答这个问题，建议您联系人工客服。',
  auto_end_minutes INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 7. 系统设置表
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
  id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(255) DEFAULT 'AI智能客服系统',
  site_logo TEXT,
  work_start_time VARCHAR(10) DEFAULT '09:00',
  work_end_time VARCHAR(10) DEFAULT '18:00',
  timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
  theme_color VARCHAR(20) DEFAULT '#4f46e5',
  chat_position ENUM('left', 'right') DEFAULT 'right',
  chat_window_size ENUM('compact', 'standard', 'large') DEFAULT 'standard',
  notify_new_chat ENUM('yes', 'no') DEFAULT 'yes',
  notify_human_transfer ENUM('yes', 'no') DEFAULT 'yes',
  notify_method ENUM('email', 'in_app', 'both') DEFAULT 'in_app',
  notify_email VARCHAR(320),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 插入默认数据
-- =====================================================

-- 默认AI设置（只插入一条）
INSERT IGNORE INTO ai_settings (id) VALUES (1);

-- 默认系统设置（只插入一条）
INSERT IGNORE INTO system_settings (id) VALUES (1);

-- 示例知识库分类
INSERT IGNORE INTO knowledge_categories (id, name, description, sort_order) VALUES
(1, '产品咨询', '关于产品功能、价格、版本的常见问题', 1),
(2, '使用帮助', '产品使用教程和操作指南', 2),
(3, '售后服务', '退换货、维修、投诉等售后问题', 3),
(4, '账户问题', '注册、登录、密码等账户相关问题', 4);

-- 示例知识库问答（可根据实际业务修改）
INSERT IGNORE INTO knowledge_base (category_id, question, answer, keywords) VALUES
(1, '你们的产品有哪些功能？', '我们的产品提供智能客服、知识库管理、数据分析、人工转接等核心功能。支持多渠道接入，包括网站、小程序、APP等。', '功能,产品,有哪些'),
(1, '产品价格是多少？', '我们提供多种套餐选择：\n- 基础版：免费（含100次/月对话额度）\n- 专业版：¥299/月（不限对话次数+知识库管理）\n- 企业版：¥999/月（全功能+优先技术支持）\n具体可联系销售获取定制方案。', '价格,多少钱,费用,套餐'),
(1, '有免费试用吗？', '有的！我们提供14天全功能免费试用，无需绑定信用卡。试用期间可体验所有专业版功能。', '免费,试用,体验'),
(2, '如何快速上手使用？', '推荐按以下步骤：\n1. 完成基础设置（AI名称、欢迎语等）\n2. 导入知识库文档\n3. 将客服组件嵌入网站\n4. 测试对话效果\n5. 根据数据报告优化\n详细教程请查看帮助中心。', '上手,使用,教程,入门'),
(2, '支持哪些网站平台？', '我们的客服组件支持所有网站平台：\n- HTML/静态网站\n- WordPress\n- Shopify\n- 企业官网\n- Vue/React/Angular项目\n只需复制一段嵌入代码即可。', '支持,平台,网站,WordPress,Shopify'),
(3, '如何申请售后服务？', '如需售后服务，请：\n1. 在本客服窗口描述您的问题\n2. 或发送邮件至 support@example.com\n3. 或拨打客服热线：400-XXX-XXXX\n\n我们会在24小时内响应。', '售后,服务,申请,退换'),
(3, '退款政策是什么？', '我们提供7天无理由退款保障。专业版和企业版用户在购买后7天内，如对产品不满意可申请全额退款。退款将在3-5个工作日原路返回。', '退款,政策,退钱'),
(4, '忘记密码怎么办？', '您可以通过以下方式重置密码：\n1. 点击登录页的"忘记密码"\n2. 输入注册邮箱\n3. 查收重置邮件并按提示操作\n如未收到邮件，请检查垃圾邮件箱。', '密码,忘记,重置'),
(4, '如何修改账户信息？', '登录后进入"个人设置"页面，可修改：\n- 用户名\n- 邮箱地址\n- 头像\n- 通知偏好\n部分信息修改后需要重新验证。', '账户,修改,信息,设置');

-- =====================================================
-- 完成提示
-- =====================================================
-- 所有表和默认数据已创建完成！
-- 你现在可以：
-- 1. 在 Vercel 上配置环境变量
-- 2. 重新部署项目
-- 3. 访问管理后台开始配置知识库
-- =====================================================
