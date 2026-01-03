#!/usr/bin/env node

/**
 * Cloudflare 构建脚本
 * 读取 wrangler.jsonc 中的 vars，设置为环境变量，然后执行 Next.js 构建
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 读取 wrangler.jsonc 文件
const wranglerPath = path.join(__dirname, '..', 'wrangler.jsonc');
const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');

// 简单的 JSONC 解析：去除注释
function parseJSONC(content) {
  let cleaned = content;
  let inString = false;
  let escapeNext = false;
  let result = [];
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    
    if (escapeNext) {
      result.push(char);
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escapeNext = true;
      result.push(char);
      continue;
    }
    
    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      result.push(char);
      continue;
    }
    
    if (!inString) {
      // 检查单行注释
      if (char === '/' && content[i + 1] === '/') {
        // 跳过到行尾
        while (i < content.length && content[i] !== '\n') {
          i++;
        }
        if (content[i] === '\n') {
          result.push('\n');
        }
        continue;
      }
      
      // 检查多行注释
      if (char === '/' && content[i + 1] === '*') {
        // 跳过注释内容
        i += 2;
        while (i < content.length - 1) {
          if (content[i] === '*' && content[i + 1] === '/') {
            i += 1;
            break;
          }
          i++;
        }
        continue;
      }
    }
    
    result.push(char);
  }
  
  return JSON.parse(result.join(''));
}

try {
  const wranglerConfig = parseJSONC(wranglerContent);
  const vars = wranglerConfig.vars || {};

  // 将 vars 设置为环境变量
  const env = { ...process.env };
  for (const [key, value] of Object.entries(vars)) {
    env[key] = String(value);
  }

  // 构建命令
  const buildCommand = process.argv.slice(2).join(' ') || 'next build';
  const commands = buildCommand.split(' && ');

  console.log(`\n📦 从 wrangler.jsonc 读取到 ${Object.keys(vars).length} 个环境变量:`);
  Object.keys(vars).slice(0, 5).forEach(key => {
    console.log(`   ${key}=${String(vars[key]).substring(0, 50)}`);
  });
  if (Object.keys(vars).length > 5) {
    console.log(`   ... 还有 ${Object.keys(vars).length - 5} 个变量`);
  }
  console.log('');

  // 执行命令
  function runCommand(index) {
    if (index >= commands.length) {
      process.exit(0);
      return;
    }

    const command = commands[index].trim();
    
    console.log(`🔨 执行构建命令: ${command}\n`);

    // 在 Windows 上使用 cmd，在 Unix 上使用 sh
    const isWindows = process.platform === 'win32';
    
    let child;
    if (isWindows) {
      // Windows: 使用 PowerShell 或 cmd
      const [cmd, ...args] = command.split(/\s+/);
      child = spawn(cmd, args, {
        env,
        stdio: 'inherit',
        cwd: process.cwd(),
        shell: true, // 使用系统默认 shell
      });
    } else {
      // Unix: 使用 sh
      child = spawn('/bin/sh', ['-c', command], {
        env,
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    }

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ 命令执行失败: ${command} (退出码: ${code})`);
        process.exit(code);
      } else {
        runCommand(index + 1);
      }
    });

    child.on('error', (err) => {
      console.error(`\n❌ 执行命令时出错: ${err.message}`);
      process.exit(1);
    });
  }

  runCommand(0);
} catch (error) {
  console.error('❌ 解析 wrangler.jsonc 失败:', error.message);
  process.exit(1);
}
