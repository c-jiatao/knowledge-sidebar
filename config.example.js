module.exports = {
  // 七鱼客服系统配置
  qiyu: {
    appKey: "YOUR_QIYU_APP_KEY", // 请替换为您的七鱼AppKey
    appSecret: "YOUR_QIYU_APP_SECRET", // 请替换为您的七鱼AppSecret
    apiUrl: "https://qiyukf.com/openapi/robot/data/knowledge"
  },
  
  // 企业微信配置
  wework: {
    agentId: "YOUR_WEWORK_AGENT_ID", // 请替换为您的企业微信应用AgentId
    secret: "YOUR_WEWORK_SECRET", // 请替换为您的企业微信应用Secret
    corpId: "YOUR_WEWORK_CORP_ID" // 请替换为您的企业微信企业ID
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  
  // 知识库同步配置
  sync: {
    interval: '0 * * * *', // 每小时同步一次 (cron格式)
    batchSize: 1000, // 每次请求的数据量
    cacheTimeout: 40 * 60 * 1000 // 缓存超时时间 (40分钟)
  }
};

/*
配置说明：

1. 七鱼配置获取方法：
   - 登录七鱼管理后台
   - 进入"设置" -> "API设置"
   - 获取AppKey和AppSecret

2. 企业微信配置获取方法：
   - 登录企业微信管理后台
   - 进入"应用管理" -> "应用"
   - 创建或选择应用，获取AgentId和Secret
   - 企业ID在"我的企业"页面查看

3. 同步频率配置：
   - '0 * * * *'    每小时同步
   - '*/30 * * * *' 每30分钟同步
   - '0 */2 * * *'  每2小时同步

4. 缓存配置：
   - cacheTimeout: 数据缓存时间，建议40分钟
   - batchSize: 每次API请求的数据量，建议1000

使用步骤：
1. 复制此文件为 config.js
2. 填入您的实际配置信息
3. 保存文件
4. 启动服务
*/
