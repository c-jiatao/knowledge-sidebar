const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const KnowledgeSync = require('./sync-knowledge');
const config = require('./config');

const app = express();
const PORT = config.server.port;
const HOST = config.server.host;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 创建知识库同步实例
const knowledgeSync = new KnowledgeSync();

// API路由

// 搜索知识库
app.post('/api/search', async (req, res) => {
  try {
    const { query, maxResults = 10, minSimilarity = 0.3 } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: '搜索关键词不能为空'
      });
    }

    const searchResult = knowledgeSync.knowledgeSearch.search(query, {
      maxResults: parseInt(maxResults),
      minSimilarity: parseFloat(minSimilarity),
      includeAnswer: true
    });

    res.json({
      success: true,
      data: searchResult
    });

  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      error: '搜索失败，请稍后重试'
    });
  }
});

// 获取热门问题
app.get('/api/hot-questions', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const hotQuestions = knowledgeSync.knowledgeSearch.getHotQuestions(limit);
    
    res.json({
      success: true,
      data: hotQuestions
    });
  } catch (error) {
    console.error('获取热门问题失败:', error);
    res.status(500).json({
      success: false,
      error: '获取热门问题失败'
    });
  }
});

// 获取知识库统计信息
app.get('/api/statistics', (req, res) => {
  try {
    const stats = knowledgeSync.getStatus();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取统计信息失败'
    });
  }
});

// 手动同步知识库
app.post('/api/sync', async (req, res) => {
  try {
    const syncResult = await knowledgeSync.manualSync();
    
    res.json({
      success: true,
      data: syncResult
    });
  } catch (error) {
    console.error('手动同步失败:', error);
    res.status(500).json({
      success: false,
      error: '手动同步失败'
    });
  }
});

// 测试七鱼API连接
app.get('/api/test-connection', async (req, res) => {
  try {
    const testResult = await knowledgeSync.qiyuAPI.testConnection();
    
    res.json({
      success: true,
      data: testResult
    });
  } catch (error) {
    console.error('测试连接失败:', error);
    res.status(500).json({
      success: false,
      error: '测试连接失败'
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 前端页面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化知识库同步
    await knowledgeSync.initialize();
    
    // 启动HTTP服务器
    app.listen(PORT, HOST, () => {
      console.log(`🚀 企业微信知识库侧边栏工具已启动`);
      console.log(`📍 服务地址: http://${HOST}:${PORT}`);
      console.log(`📚 知识库数据: ${knowledgeSync.knowledgeSearch.getKnowledgeData().count} 条记录`);
      console.log(`⏰ 下次同步时间: ${knowledgeSync.getStatus().nextSync}`);
      console.log(`\n📖 API文档:`);
      console.log(`   POST /api/search - 搜索知识库`);
      console.log(`   GET  /api/hot-questions - 获取热门问题`);
      console.log(`   GET  /api/statistics - 获取统计信息`);
      console.log(`   POST /api/sync - 手动同步知识库`);
      console.log(`   GET  /api/test-connection - 测试七鱼API连接`);
      console.log(`   GET  /api/health - 健康检查`);
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer();
