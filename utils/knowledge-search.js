class KnowledgeSearch {
  constructor() {
    this.knowledgeData = [];
    this.lastUpdateTime = 0;
  }

  // 更新知识库数据
  updateKnowledgeData(data) {
    this.knowledgeData = data;
    this.lastUpdateTime = Date.now();
    console.log(`知识库数据已更新，共 ${data.length} 条记录`);
  }

  // 获取知识库数据
  getKnowledgeData() {
    return {
      data: this.knowledgeData,
      lastUpdate: this.lastUpdateTime,
      count: this.knowledgeData.length
    };
  }

  // 计算字符串相似度（原生实现）
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // 使用编辑距离算法计算相似度
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    // 初始化矩阵
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // 填充矩阵
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // 删除
          matrix[i][j - 1] + 1,      // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }
    
    // 计算相似度
    const maxLen = Math.max(len1, len2);
    const distance = matrix[len1][len2];
    return 1 - (distance / maxLen);
  }

  // 智能搜索匹配
  search(query, options = {}) {
    if (!query || !query.trim()) {
      return {
        results: [],
        total: 0,
        query: query
      };
    }

    const {
      maxResults = 10,
      minSimilarity = 0.3,
      includeAnswer = true
    } = options;

    query = query.trim().toLowerCase();
    
    // 分词处理（简单按空格分词）
    const queryWords = query.split(/\s+/).filter(word => word.length > 0);
    
    const results = [];

    for (const item of this.knowledgeData) {
      if (!item.question || !item.answer) continue;

      const question = item.question.toLowerCase();
      const answer = item.answer;
      
      let score = 0;
      let matchType = 'none';

      // 1. 完全匹配（最高优先级）
      if (question === query) {
        score = 1.0;
        matchType = 'exact';
      }
      // 2. 包含匹配
      else if (question.includes(query) || query.includes(question)) {
        score = 0.9;
        matchType = 'contains';
      }
      // 3. 分词匹配
      else if (queryWords.length > 1) {
        let wordMatchCount = 0;
        for (const word of queryWords) {
          if (word.length > 1 && question.includes(word)) {
            wordMatchCount++;
          }
        }
        if (wordMatchCount > 0) {
          score = 0.6 + (wordMatchCount / queryWords.length) * 0.3;
          matchType = 'word_match';
        }
      }
      // 4. 相似度匹配
      else {
        const similarity = this.calculateSimilarity(query, question);
        if (similarity >= minSimilarity) {
          score = similarity;
          matchType = 'similarity';
        }
      }

      if (score > 0) {
        results.push({
          id: item.id,
          question: item.question,
          answer: includeAnswer ? answer : undefined,
          score: score,
          matchType: matchType,
          highlight: this.highlightKeywords(item.question, queryWords)
        });
      }
    }

    // 按分数排序
    results.sort((a, b) => b.score - a.score);

    // 限制结果数量
    const limitedResults = results.slice(0, maxResults);

    return {
      results: limitedResults,
      total: results.length,
      query: query,
      searchTime: Date.now()
    };
  }

  // 关键词高亮
  highlightKeywords(text, keywords) {
    if (!keywords || keywords.length === 0) return text;
    
    let highlightedText = text;
    for (const keyword of keywords) {
      if (keyword.length > 1) {
        const regex = new RegExp(`(${keyword})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
      }
    }
    return highlightedText;
  }

  // 获取热门问题
  getHotQuestions(limit = 5) {
    // 这里可以根据实际需求实现热门问题逻辑
    // 暂时返回前几条数据
    return this.knowledgeData.slice(0, limit).map(item => ({
      id: item.id,
      question: item.question
    }));
  }

  // 获取知识库统计信息
  getStatistics() {
    return {
      totalQuestions: this.knowledgeData.length,
      lastUpdate: this.lastUpdateTime,
      lastUpdateFormatted: new Date(this.lastUpdateTime).toLocaleString('zh-CN'),
      categories: this.getCategories()
    };
  }

  // 获取分类统计
  getCategories() {
    const categories = {};
    for (const item of this.knowledgeData) {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
    }
    return categories;
  }
}

module.exports = KnowledgeSearch;
