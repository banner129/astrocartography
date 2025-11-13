# Astrocartography Calculator

> 免费占星地图生成器 - NASA 级精度 + AI 智能解读

🌐 **网站**: [astrocartography.net](https://astrocartography.net)

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
https://astrocartography.net/api/revalidate?secret=你的密钥&path=/

# 刷新任意页面
https://astrocartography.net/api/revalidate?secret=密钥&path=/your-page


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