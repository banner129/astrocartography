# 登录功能移植指南

## 📦 需要安装的包

```bash
# 核心认证包
pnpm add next-auth@5.0.0-beta.30

# 代理支持（中国网络必需）
pnpm add undici@7.16.0
pnpm add -D global-agent@3.0.0

# Google One Tap（可选）
pnpm add google-one-tap@1.0.6
```

## 📁 需要添加/修改的文件

### 新增文件

1. **`src/lib/proxy.ts`** - 代理配置初始化
2. **`src/auth/index.ts`** - NextAuth 导出
3. **`src/auth/config.ts`** - NextAuth 配置（包含 providers、callbacks）
4. **`src/auth/handler.ts`** - 登录处理逻辑
5. **`src/auth/session.tsx`** - Session Provider 组件
6. **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth API 路由

### 修改文件

1. **`src/app/[locale]/layout.tsx`**
   - 导入 `NextAuthSessionProvider`
   - 包裹 `AppContextProvider`

2. **`src/contexts/app.tsx`**
   - 导入 `useSession` from `next-auth/react`
   - 添加 session 状态管理

3. **`package.json`**
   - 添加 `dev:proxy` 脚本

## 🚀 启动命令

### 普通启动（可直接访问 Google）
```bash
pnpm dev
```

### 使用代理启动（中国网络）
```powershell
# PowerShell
$env:GLOBAL_AGENT_HTTP_PROXY="http://127.0.0.1:7889"
$env:GLOBAL_AGENT_HTTPS_PROXY="http://127.0.0.1:7889"
$env:GLOBAL_AGENT_NO_PROXY="localhost,127.0.0.1"
pnpm dev
```

或使用快捷命令（需先配置 `package.json`）：
```bash
pnpm dev:proxy
```

## ⚙️ 环境变量配置

在 `.env.local` 中添加：

```bash
# 认证开关
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true

# Google OAuth
AUTH_GOOGLE_ID=你的_Client_ID
AUTH_GOOGLE_SECRET=你的_Client_Secret
NEXT_PUBLIC_AUTH_GOOGLE_ID=你的_Client_ID  # 与上面相同

# Google One Tap（可选）
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED=true

# 应用 URL
NEXT_PUBLIC_WEB_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
```

## 🔑 关键配置说明

1. **`src/auth/config.ts`** 顶部必须导入代理：
   ```typescript
   import "@/lib/proxy";
   ```

2. **`src/lib/proxy.ts`** 自动检测代理环境变量，无需手动调用

3. **`package.json` 脚本**：
   ```json
   "dev:proxy": "cross-env GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:7889 GLOBAL_AGENT_HTTPS_PROXY=http://127.0.0.1:7889 GLOBAL_AGENT_NO_PROXY=localhost,127.0.0.1 NODE_NO_WARNINGS=1 next dev --turbopack"
   ```
   注意：端口 `7889` 需根据实际代理软件修改

## ✅ 检查清单

- [ ] 安装所有依赖包
- [ ] 添加所有新文件
- [ ] 修改布局文件添加 `NextAuthSessionProvider`
- [ ] 修改 `app.tsx` 添加 session 管理
- [ ] 配置环境变量
- [ ] 配置 Google OAuth（Google Cloud Console）
- [ ] 测试登录流程

