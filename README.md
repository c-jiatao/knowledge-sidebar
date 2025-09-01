# 企业微信知识库侧边栏工具

一个基于七鱼客服系统的企业微信侧边栏知识库搜索工具，支持智能搜索、实时同步和美观的界面展示。

## 功能特性

- 🔍 **智能搜索**: 支持关键词搜索、分词匹配、相似度匹配等多种搜索方式
- 📚 **知识库同步**: 每小时自动从七鱼系统同步最新知识库数据
- 🎨 **美观界面**: 现代化设计，支持响应式布局
- 📱 **企业微信集成**: 专为企业微信侧边栏优化
- ⚡ **实时搜索**: 支持实时搜索建议和结果展示
- 🔄 **自动更新**: 定时同步，确保数据最新

## 技术架构

- **后端**: Node.js + Express
- **前端**: 原生JavaScript + CSS3
- **数据同步**: 七鱼API + 本地缓存
- **搜索算法**: 多级匹配 + 相似度计算
- **定时任务**: node-cron

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置参数

编辑 `config.js` 文件，填入您的配置信息：

```javascript
module.exports = {
  // 七鱼客服系统配置
  qiyu: {
    appKey: "YOUR_QIYU_APP_KEY",        // 七鱼AppKey
    appSecret: "YOUR_QIYU_APP_SECRET",  // 七鱼AppSecret
    apiUrl: "https://qiyukf.com/openapi/robot/data/knowledge"
  },
  
  // 企业微信配置
  wework: {
    agentId: "YOUR_WEWORK_AGENT_ID",    // 企业微信应用AgentId
    secret: "YOUR_WEWORK_SECRET",       // 企业微信应用Secret
    corpId: "YOUR_WEWORK_CORP_ID"      // 企业微信企业ID
  }
};
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 仅同步知识库
npm run sync
```

### 4. 访问应用

打开浏览器访问: `http://localhost:3000`

## API接口

### 搜索知识库
```
POST /api/search
Content-Type: application/json

{
  "query": "搜索关键词",
  "maxResults": 10,
  "minSimilarity": 0.3
}
```

### 获取热门问题
```
GET /api/hot-questions?limit=5
```

### 获取统计信息
```
GET /api/statistics
```

### 手动同步知识库
```
POST /api/sync
```

### 测试七鱼API连接
```
GET /api/test-connection
```

### 健康检查
```
GET /api/health
```

## 部署说明

### 企业微信侧边栏集成

1. 在企业微信管理后台创建应用
2. 获取应用的AgentId和Secret
3. 配置可信域名为您的服务器地址
4. 在侧边栏配置中添加应用链接

### 服务器部署

推荐使用PM2进行进程管理：

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "knowledge-sidebar"

# 设置开机自启
pm2 startup
pm2 save
```

### Docker部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 配置说明

### 同步频率配置

在 `config.js` 中修改 `sync.interval` 参数：

```javascript
sync: {
  interval: '0 * * * *',        // 每小时同步 (cron格式)
  // interval: '*/30 * * * *',  // 每30分钟同步
  // interval: '0 */2 * * *',   // 每2小时同步
}
```

### 缓存配置

```javascript
sync: {
  cacheTimeout: 40 * 60 * 1000,  // 缓存超时时间 (40分钟)
  batchSize: 1000                 // 每次API请求的数据量
}
```

## 开发说明

### 项目结构

```
wework-knowledge-sidebar/
├── config.js              # 配置文件
├── server.js              # 主服务器文件
├── sync-knowledge.js      # 知识库同步脚本
├── utils/                 # 工具类
│   ├── qiyu-api.js       # 七鱼API封装
│   └── knowledge-search.js # 搜索算法实现
├── public/                # 前端文件
│   ├── index.html        # 主页面
│   ├── styles.css        # 样式文件
│   └── app.js            # 前端逻辑
├── data/                  # 数据存储目录
└── package.json           # 项目依赖
```

### 扩展开发

#### 添加新的搜索算法

在 `utils/knowledge-search.js` 中添加新的匹配逻辑：

```javascript
// 添加新的匹配类型
if (newMatchCondition) {
  score = newScore;
  matchType = 'new_match_type';
}
```

#### 自定义界面样式

修改 `public/styles.css` 文件，支持主题定制：

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #f8f9fa;
}
```

## 常见问题

### Q: 七鱼API连接失败怎么办？
A: 检查以下几点：
1. 确认AppKey和AppSecret是否正确
2. 检查网络连接和防火墙设置
3. 验证七鱼账号权限

### Q: 搜索结果显示不准确？
A: 可以调整搜索参数：
1. 降低 `minSimilarity` 阈值
2. 增加 `maxResults` 数量
3. 优化搜索关键词

### Q: 如何提高搜索性能？
A: 建议：
1. 使用SSD存储提高I/O性能
2. 增加服务器内存
3. 优化搜索算法

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持基础搜索功能
- 集成七鱼API
- 实现定时同步

## 许可证

MIT License

## 技术支持

如有问题，请提交Issue或联系开发团队。
