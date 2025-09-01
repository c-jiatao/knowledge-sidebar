const QiyuAPI = require('./utils/qiyu-api');
const KnowledgeSearch = require('./utils/knowledge-search');
const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const config = require('./config');

class KnowledgeSync {
  constructor() {
    this.qiyuAPI = new QiyuAPI();
    this.knowledgeSearch = new KnowledgeSearch();
    this.dataFile = path.join(__dirname, 'data', 'knowledge.json');
    this.ensureDataDirectory();
  }

  // 确保数据目录存在
  async ensureDataDirectory() {
    const dataDir = path.dirname(this.dataFile);
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
      console.log('创建数据目录:', dataDir);
    }
  }

  // 保存知识库数据到本地文件
  async saveKnowledgeData(data) {
    try {
      const saveData = {
        timestamp: Date.now(),
        data: data,
        count: data.length
      };
      
      await fs.writeFile(this.dataFile, JSON.stringify(saveData, null, 2), 'utf8');
      console.log(`知识库数据已保存到本地文件: ${this.dataFile}`);
      return true;
    } catch (error) {
      console.error('保存知识库数据失败:', error);
      return false;
    }
  }

  // 从本地文件加载知识库数据
  async loadKnowledgeData() {
    try {
      const fileContent = await fs.readFile(this.dataFile, 'utf8');
      const savedData = JSON.parse(fileContent);
      
      // 检查数据是否过期
      const now = Date.now();
      const isExpired = (now - savedData.timestamp) > config.sync.cacheTimeout;
      
      if (isExpired) {
        console.log('本地缓存数据已过期，需要重新同步');
        return null;
      }
      
      console.log(`从本地文件加载知识库数据，共 ${savedData.count} 条记录`);
      return savedData.data;
    } catch (error) {
      console.log('本地文件不存在或读取失败，需要重新同步');
      return null;
    }
  }

  // 同步知识库数据
  async syncKnowledge() {
    try {
      console.log('开始同步知识库数据...');
      
      // 从七鱼API获取数据
      const knowledgeData = await this.qiyuAPI.fetchAllKnowledge();
      
      if (!knowledgeData || knowledgeData.length === 0) {
        throw new Error('未获取到知识库数据');
      }
      
      // 保存到本地文件
      const saveSuccess = await this.saveKnowledgeData(knowledgeData);
      if (!saveSuccess) {
        throw new Error('保存本地数据失败');
      }
      
      // 更新搜索实例
      this.knowledgeSearch.updateKnowledgeData(knowledgeData);
      
      console.log(`知识库同步完成，共获取 ${knowledgeData.length} 条数据`);
      return {
        success: true,
        count: knowledgeData.length,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('知识库同步失败:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // 初始化知识库数据
  async initialize() {
    console.log('初始化知识库数据...');
    
    // 尝试从本地文件加载数据
    let localData = await this.loadKnowledgeData();
    
    if (localData) {
      // 使用本地缓存数据
      this.knowledgeSearch.updateKnowledgeData(localData);
      console.log('使用本地缓存数据初始化完成');
    } else {
      // 执行首次同步
      const syncResult = await this.syncKnowledge();
      if (!syncResult.success) {
        console.error('首次同步失败，请检查配置和网络连接');
        process.exit(1);
      }
    }
    
    // 启动定时同步任务
    this.startScheduledSync();
    
    console.log('知识库初始化完成');
  }

  // 启动定时同步任务
  startScheduledSync() {
    console.log(`启动定时同步任务，执行频率: ${config.sync.interval}`);
    
    cron.schedule(config.sync.interval, async () => {
      console.log('执行定时同步任务...');
      await this.syncKnowledge();
    });
  }

  // 手动同步
  async manualSync() {
    console.log('执行手动同步...');
    return await this.syncKnowledge();
  }

  // 获取当前状态
  getStatus() {
    const stats = this.knowledgeSearch.getStatistics();
    return {
      ...stats,
      nextSync: this.getNextSyncTime()
    };
  }

  // 获取下次同步时间
  getNextSyncTime() {
    // 这里可以根据cron表达式计算下次执行时间
    // 简化处理，返回当前时间加1小时
    const next = new Date(Date.now() + 60 * 60 * 1000);
    return next.toLocaleString('zh-CN');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const sync = new KnowledgeSync();
  
  // 处理命令行参数
  const args = process.argv.slice(2);
  
  if (args.includes('--manual')) {
    // 手动同步
    sync.manualSync().then(result => {
      console.log('手动同步结果:', result);
      process.exit(result.success ? 0 : 1);
    });
  } else if (args.includes('--init')) {
    // 初始化
    sync.initialize().then(() => {
      console.log('初始化完成');
      process.exit(0);
    }).catch(error => {
      console.error('初始化失败:', error);
      process.exit(1);
    });
  } else {
    // 默认初始化
    sync.initialize().then(() => {
      console.log('知识库同步服务已启动');
      console.log('按 Ctrl+C 停止服务');
      
      // 保持进程运行
      process.on('SIGINT', () => {
        console.log('\n正在停止服务...');
        process.exit(0);
      });
    }).catch(error => {
      console.error('启动失败:', error);
      process.exit(1);
    });
  }
}

module.exports = KnowledgeSync;
