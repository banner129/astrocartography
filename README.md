# Astrocartography Calculator

> 免费占星地图生成器 - NASA 级精度 + AI 智能解读

🌐 **网站**: [astrocarto.org](https://astrocarto.org)

---

## 🚀 快速开始

pnpm install
pnpm dev访问 `http://localhost:3000`

---

## 📦 技术栈

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + Shadcn UI
- PostgreSQL + Drizzle ORM
- NextAuth.js v5
- next-intl (国际化)

---

## ⚙️ 环境变量配置

### AI 聊天积分消耗配置

AI 聊天功能每次消耗的积分数量可以通过环境变量配置：

```bash
# AI 聊天每次消耗的积分数量（默认：10）
AI_CHAT_CREDIT_COST=10
```

**说明**：
- 如果不设置此环境变量，默认每次消耗 **10 积分**
- 可以通过修改此值来调整 AI 聊天的积分消耗
- 修改后需要重启服务器才能生效

### 其他必需的环境变量

```bash
# DeepSeek API Key（AI 聊天必需）
DEEPSEEK_API_KEY=your_deepseek_api_key

# 数据库连接
DATABASE_URL=your_database_url

# NextAuth 配置
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000
```

## ⚙️ 性能优化

### ISR 缓存配置

所有静态页面使用 ISR，**CPU 使用降低 90%**：

| 页面类型 | 缓存时间 | 配置 |
|---------|---------|------|
| 首页 | 24小时 | `revalidate: 86400` |
| 法律页面 | 30天 | `revalidate: 2592000` |
| 工具页面 | 24小时 | `revalidate: 86400` |
| 博客列表 | 1小时 | `revalidate: 3600` |
| 博客详情 | 7天 | `revalidate: 604800` |

**效果**：CPU 从 229分钟(95%) 降至 23分钟(10%)

---

### 按需刷新缓存 API

修改内容后立即生效，无需等待 24 小时：

# 刷新首页
https://astrocarto.org/api/revalidate?secret=你的密钥&path=/

# 刷新任意页面
https://astrocarto.org/api/revalidate?secret=密钥&path=/your-page


**配置环境变量**：

1. 生成密钥：
   
   node -e "console.log('reval_' + require('crypto').randomBytes(16).toString('hex'))"
   2. Vercel 添加：
   - Settings → Environment Variables
   - 名称：`REVALIDATE_SECRET`
   - 值：生成的密钥
   - 环境：Production + Preview + Development

3. 本地 `.env.local` 添加：
   REVALIDATE_SECRET=你的密钥
   **浏览器书签**（将 `xxx` 替换为真实密钥）：