# Minecraft-Speed-Proxy-Web

Minecraft-Speed-Proxy 的 Web 管理前端（基于 Vue3 实现）

> ⚠️ 本项目仍在持续开发中，核心功能已基本完成。如有需要，请自行克隆使用。

## 项目简介

本项目是 [Minecraft-Speed-Proxy](https://github.com/AllesUgo/Minecraft-Speed-Proxy) 服务的 Web 管理界面，提供代理管理、用户管理、白名单/黑名单设置、在线统计、系统配置等完整功能。

前端采用 Vue3 + Vite 技术栈构建，需要配合 Minecraft-Speed-Proxy 后端服务才能正常运行。

欢迎提交 Issue 和 PR。

## 使用方法

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/minecraft-speed-proxy-web.git
cd minecraft-speed-proxy-web
```

### 2. 启动开发环境

```bash
npm run dev
```

### 3. 服务端 API 地址配置

前端默认请求地址为 `http://127.0.0.1:8081`，如需连接其他服务端，请修改 `src/utils/axios.js` 文件中的：

```js
const API_BASE_URL = "http://127.0.0.1:8081";
```

为你的实际服务端地址。

## 技术栈

- Vue 3
- Vite
- ECharts
- Axios
- Vue Router
