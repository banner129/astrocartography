// 代理配置初始化
// 支持 Node.js 18+ 的 undici fetch 代理
if (typeof window === 'undefined') {
  const proxyUrl = process.env.GLOBAL_AGENT_HTTP_PROXY || process.env.GLOBAL_AGENT_HTTPS_PROXY || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  
  if (proxyUrl) {
    try {
      // 使用 undici 的 ProxyAgent（Node.js 18+）
      const { ProxyAgent } = require('undici');
      const { setGlobalDispatcher } = require('undici');
      
      const proxyAgent = new ProxyAgent(proxyUrl);
      setGlobalDispatcher(proxyAgent);
      
      console.log('✅ Undici 代理已启用:', {
        proxy: proxyUrl,
        http: process.env.GLOBAL_AGENT_HTTP_PROXY,
        https: process.env.GLOBAL_AGENT_HTTPS_PROXY,
      });
      
      // 测试代理是否真的工作
      setTimeout(async () => {
        try {
          const testUrl = 'https://www.google.com';
          const response = await fetch(testUrl, { 
            signal: AbortSignal.timeout(5000) // 5秒超时
          });
          if (response.ok) {
            console.log('✅ 代理测试成功: 可以访问 Google');
          } else {
            console.warn('⚠️ 代理测试: 响应状态码', response.status);
          }
        } catch (e: any) {
          console.warn('⚠️ 代理测试失败:', e.message);
        }
      }, 1000);
    } catch (e: any) {
      // 如果 undici 不可用，回退到 global-agent
      try {
        require('global-agent/bootstrap');
        console.log('✅ Global-agent 代理已启用 (回退方案):', {
          http: process.env.GLOBAL_AGENT_HTTP_PROXY,
          https: process.env.GLOBAL_AGENT_HTTPS_PROXY,
        });
      } catch (e2: any) {
        console.warn('⚠️ 代理初始化失败:', e2.message);
      }
    }
  }
}

