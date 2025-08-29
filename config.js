module.exports = {
  // 七鱼客服系统配置
  qiyu: {
    appKey: "b8b10a3f09b6274e59423ba63638d17d", // 请替换为您的七鱼AppKey
    appSecret: "9B2A089C8C9945E6AE4EC2ED71E2F8F2", // 请替换为您的七鱼AppSecret
    apiUrl: "https://qiyukf.com/openapi/robot/data/knowledge"
  },
  
  // 企业微信配置
  wework: {
    agentId: "1000016", // 请替换为您的企业微信应用AgentId
    secret: "YGD9QXnMgol6i6j5O_0SFGzkyYgncBtLvYqkCMgXgCk", // 请替换为您的企业微信应用Secret
    corpId: "ww7323379bd8d6a893" // 请替换为您的企业微信企业ID
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
