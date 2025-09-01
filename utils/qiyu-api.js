const crypto = require('crypto');
const axios = require('axios');
const config = require('../config');

class QiyuAPI {
  constructor() {
    this.appKey = config.qiyu.appKey;
    this.appSecret = config.qiyu.appSecret;
    this.apiUrl = config.qiyu.apiUrl;
  }

  // 生成MD5哈希
  generateMD5(str) {
    return crypto.createHash('md5').update(str).digest('hex').toLowerCase();
  }

  // 生成SHA1校验和
  generateSHA1(str) {
    return crypto.createHash('sha1').update(str).digest('hex').toLowerCase();
  }

  // 获取所有知识库数据
  async fetchAllKnowledge() {
    let allData = [];
    let mid = 0;
    let isEnd = 0;
    const size = config.sync.batchSize;

    console.log('开始同步七鱼知识库数据...');

    while (isEnd === 0) {
      const requestBody = { mid, size };
      const jsonString = JSON.stringify(requestBody);
      const md5 = this.generateMD5(jsonString);
      const timestamp = Math.floor(Date.now() / 1000);
      const checksumstr = this.appSecret + md5 + timestamp;
      const checksum = this.generateSHA1(checksumstr);

      try {
        const response = await axios.post(
          `${this.apiUrl}?appKey=${this.appKey}&time=${timestamp}&checksum=${checksum}`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'charset': 'UTF-8'
            }
          }
        );

        let message;
        if (typeof response.data.message === 'string') {
          try {
            message = JSON.parse(response.data.message);
          } catch (e) {
            console.error('解析响应数据失败:', response.data.message);
            break;
          }
        } else {
          message = response.data.message;
        }

        if (message && message.data) {
          allData = allData.concat(message.data);
          isEnd = message.isEnd;
          
          if (message.data.length > 0) {
            mid = message.data[message.data.length - 1].id;
          } else {
            break;
          }
        } else {
          console.error('响应数据格式异常:', message);
          break;
        }

        console.log(`已获取 ${allData.length} 条知识库数据...`);

      } catch (error) {
        console.error('请求七鱼API失败:', error.message);
        throw new Error(`请求七鱼API失败: ${error.message}`);
      }
    }

    console.log(`知识库同步完成，共获取 ${allData.length} 条数据`);
    return allData;
  }

  // 测试API连接
  async testConnection() {
    try {
      const testData = await this.fetchAllKnowledge();
      return {
        success: true,
        count: testData.length,
        message: '连接成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '连接失败'
      };
    }
  }
}

module.exports = QiyuAPI;
