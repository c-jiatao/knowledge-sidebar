class KnowledgeSearchApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadInitialData();
    }

    init() {
        // 获取DOM元素
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsList = document.getElementById('resultsList');
        this.resultsCount = document.getElementById('resultsCount');
        this.loading = document.getElementById('loading');
        this.emptyState = document.getElementById('emptyState');
        this.noResults = document.getElementById('noResults');
        this.hotList = document.getElementById('hotList');
        this.status = document.getElementById('status');
        this.totalCount = document.getElementById('totalCount');
        this.lastUpdate = document.getElementById('lastUpdate');
        this.resultModal = document.getElementById('resultModal');
        this.closeModal = document.getElementById('closeModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalQuestion = document.getElementById('modalQuestion');
        this.modalAnswer = document.getElementById('modalAnswer');
        this.sendBtn = document.getElementById('sendBtn');
        this.pasteBtn = document.getElementById('pasteBtn');

        // 状态管理
        this.currentQuery = '';
        this.searchTimeout = null;
        this.currentResult = null; // 当前显示的结果
    }

    bindEvents() {
        // 搜索按钮点击事件
        this.searchBtn.addEventListener('click', () => this.performSearch());

        // 搜索框回车事件
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // 搜索框输入事件（实时搜索）
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // 关闭模态框事件
        this.closeModal.addEventListener('click', () => this.closeResultModal());

        // 点击模态框背景关闭
        this.resultModal.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.closeResultModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeResultModal();
            }
        });

        // 发送按钮事件
        this.sendBtn.addEventListener('click', () => this.sendToWeWork());

        // 粘贴按钮事件
        this.pasteBtn.addEventListener('click', () => this.copyToClipboard());

        // 发送按钮事件
        this.sendBtn.addEventListener('click', () => this.sendToWeWork());

        // 粘贴按钮事件
        this.pasteBtn.addEventListener('click', () => this.copyToClipboard());
    }

    // 处理搜索输入
    handleSearchInput(value) {
        this.currentQuery = value.trim();
        
        // 清除之前的搜索
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // 如果输入为空，显示空状态
        if (!this.currentQuery) {
            this.showEmptyState();
            return;
        }

        // 延迟搜索，避免频繁请求
        this.searchTimeout = setTimeout(() => {
            if (this.currentQuery.length >= 2) {
                this.performSearch();
            }
        }, 500);
    }

    // 执行搜索
    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showEmptyState();
            return;
        }

        this.currentQuery = query;
        this.showLoading();

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    maxResults: 20,
                    minSimilarity: 0.3
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displaySearchResults(result.data);
            } else {
                this.showError(result.error || '搜索失败');
            }
        } catch (error) {
            console.error('搜索请求失败:', error);
            this.showError('网络错误，请稍后重试');
        }
    }

    // 显示搜索结果
    displaySearchResults(searchData) {
        const { results, total, query } = searchData;

        if (total === 0) {
            this.showNoResults();
            return;
        }

        // 更新结果计数
        this.resultsCount.textContent = `${total} 条结果`;

        // 清空之前的结果
        this.resultsList.innerHTML = '';

        // 渲染搜索结果
        results.forEach(result => {
            const resultElement = this.createResultElement(result);
            this.resultsList.appendChild(resultElement);
        });

        // 显示结果区域
        this.resultsSection.style.display = 'block';
        this.hideLoading();
        this.hideEmptyState();
        this.hideNoResults();
    }

    // 创建单个结果元素
    createResultElement(result) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        resultDiv.innerHTML = `
            <div class="result-question">${result.highlight || result.question}</div>
            <div class="result-answer">${this.truncateText(result.answer, 150)}</div>
            <div class="result-meta">
                <span class="result-score">${Math.round(result.score * 100)}%</span>
                <span class="result-type">${this.getMatchTypeText(result.matchType)}</span>
            </div>
        `;

        // 点击查看详情
        resultDiv.addEventListener('click', () => {
            this.showResultDetail(result);
        });

        return resultDiv;
    }

    // 显示结果详情
    showResultDetail(result) {
        this.currentResult = result; // 保存当前结果
        this.modalTitle.textContent = '问题详情';
        this.modalQuestion.textContent = result.question;
        this.modalAnswer.innerHTML = this.formatAnswer(result.answer);
        this.resultModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // 关闭结果详情
    closeResultModal() {
        this.resultModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentResult = null;
    }

    // 发送到企业微信
    sendToWeWork() {
        if (!this.currentResult) return;
        
        try {
            // 构建发送内容
            const content = this.buildWeWorkContent(this.currentResult);
            
            // 这里可以集成企业微信API发送消息
            // 暂时使用提示信息
            this.showNotification('发送功能需要集成企业微信API', 'info');
            
            // 关闭模态框
            this.closeResultModal();
            
        } catch (error) {
            console.error('发送失败:', error);
            this.showNotification('发送失败，请稍后重试', 'error');
        }
    }

    // 复制到剪贴板
    async copyToClipboard() {
        if (!this.currentResult) return;
        
        try {
            // 构建复制内容（包含富文本）
            const content = this.buildCopyContent(this.currentResult);
            
            // 尝试复制富文本内容到剪贴板
            if (navigator.clipboard && navigator.clipboard.write) {
                try {
                    // 创建包含HTML的Blob
                    const htmlBlob = new Blob([content.html], { type: 'text/html' });
                    const textBlob = new Blob([content.text], { type: 'text/plain' });
                    
                    // 创建ClipboardItem
                    const clipboardItem = new ClipboardItem({
                        'text/html': htmlBlob,
                        'text/plain': textBlob
                    });
                    
                    await navigator.clipboard.write([clipboardItem]);
                    this.showNotification('已复制富文本内容到剪贴板', 'success');
                } catch (clipboardError) {
                    console.log('ClipboardItem API 失败，尝试传统方法:', clipboardError);
                    // 如果ClipboardItem失败，尝试传统方法
                    await this.traditionalCopy(content);
                }
            } else {
                // 降级方案：使用传统方法
                await this.traditionalCopy(content);
            }
            
            // 关闭模态框
            this.closeResultModal();
            
        } catch (error) {
            console.error('复制失败:', error);
            // 最后的降级方案：手动复制
            this.fallbackCopy(this.currentResult);
        }
    }

    // 构建企业微信发送内容
    buildWeWorkContent(result) {
        let content = `问题：${result.question}\n\n答案：`;
        
        // 移除HTML标签，保留纯文本
        const plainText = this.stripHtmlTags(result.answer);
        content += plainText;
        
        return content;
    }

    // 构建复制内容
    buildCopyContent(result) {
        // 构建纯文本版本
        const textContent = `问题：${result.question}\n\n答案：${this.stripHtmlTags(result.answer)}`;
        
        // 构建HTML版本（保持富文本格式，确保图片能正确复制）
        const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
                <h3 style="color: #495057; margin-bottom: 16px; font-size: 18px;">问题：</h3>
                <p style="margin-bottom: 16px; font-weight: 500; font-size: 16px;">${result.question}</p>
                <h3 style="color: #495057; margin-bottom: 16px; font-size: 18px;">答案：</h3>
                <div style="margin-bottom: 16px; font-size: 15px;">${this.processImagesForCopy(result.answer)}</div>
            </div>
        `;
        
        return {
            text: textContent,
            html: htmlContent
        };
    }

    // 处理图片，确保能正确复制
    processImagesForCopy(html) {
        if (!html) return html;
        
        // 处理相对路径的图片，转换为绝对路径
        let processedHtml = html.replace(
            /<img([^>]*)src=["']([^"']+)["']([^>]*)>/gi,
            (match, before, src, after) => {
                // 如果是相对路径，转换为绝对路径
                if (src.startsWith('/') || src.startsWith('./') || !src.startsWith('http')) {
                    const absoluteSrc = src.startsWith('/') ? window.location.origin + src : window.location.origin + '/' + src;
                    return `<img${before}src="${absoluteSrc}"${after}>`;
                }
                return match;
            }
        );
        
        // 确保图片有合适的样式
        processedHtml = processedHtml.replace(
            /<img([^>]*)>/gi,
            '<img$1 style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;">'
        );
        
        return processedHtml;
    }

    // 移除HTML标签
    stripHtmlTags(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // 传统复制方法（对微信等应用更兼容）
    async traditionalCopy(content) {
        try {
            // 创建临时div元素来复制富文本
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.innerHTML = content.html;
            document.body.appendChild(tempDiv);
            
            // 选择内容
            const range = document.createRange();
            range.selectNodeContents(tempDiv);
            
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // 尝试复制
            const success = document.execCommand('copy');
            
            // 清理
            selection.removeAllRanges();
            document.body.removeChild(tempDiv);
            
            if (success) {
                this.showNotification('已复制富文本内容到剪贴板', 'success');
            } else {
                // 如果execCommand失败，尝试writeText
                await navigator.clipboard.writeText(content.text);
                this.showNotification('已复制文本内容到剪贴板', 'info');
            }
            
        } catch (error) {
            console.error('传统复制方法失败:', error);
            // 最后的降级方案
            this.fallbackCopy(this.currentResult);
        }
    }

    // 降级复制方案
    fallbackCopy(result) {
        try {
            // 创建临时文本区域
            const textArea = document.createElement('textarea');
            textArea.value = `问题：${result.question}\n\n答案：${this.stripHtmlTags(result.answer)}`;
            document.body.appendChild(textArea);
            
            // 选择并复制
            textArea.select();
            document.execCommand('copy');
            
            // 清理
            document.body.removeChild(textArea);
            
            this.showNotification('已复制文本内容到剪贴板', 'success');
            
        } catch (error) {
            console.error('降级复制也失败了:', error);
            this.showNotification('复制失败，请手动复制', 'error');
        }
    }

    // 格式化答案内容
    formatAnswer(answer) {
        if (!answer) return '<p>暂无答案</p>';
        
        // 直接返回HTML内容，让浏览器渲染
        // 这样可以保持原有的格式和图片
        return answer;
    }

    // 获取匹配类型文本
    getMatchTypeText(matchType) {
        const typeMap = {
            'exact': '完全匹配',
            'contains': '包含匹配',
            'word_match': '分词匹配',
            'similarity': '相似度匹配'
        };
        return typeMap[matchType] || '未知类型';
    }

    // 截断文本
    truncateText(text, maxLength) {
        if (!text) return '';
        
        // 移除HTML标签
        const plainText = this.stripHtmlTags(text);
        
        if (plainText.length <= maxLength) return plainText;
        return plainText.substring(0, maxLength) + '...';
    }

    // 加载初始数据
    async loadInitialData() {
        try {
            // 加载热门问题
            await this.loadHotQuestions();
            
            // 加载统计信息
            await this.loadStatistics();
            
            // 测试连接状态
            await this.checkConnectionStatus();
            
        } catch (error) {
            console.error('加载初始数据失败:', error);
        }
    }

    // 加载热门问题
    async loadHotQuestions() {
        try {
            const response = await fetch('/api/hot-questions?limit=6');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                this.renderHotQuestions(result.data);
            }
        } catch (error) {
            console.error('加载热门问题失败:', error);
        }
    }

    // 渲染热门问题
    renderHotQuestions(hotQuestions) {
        this.hotList.innerHTML = '';
        
        hotQuestions.forEach(question => {
            const hotItem = document.createElement('div');
            hotItem.className = 'hot-item';
            hotItem.textContent = question.question;
            hotItem.title = question.question;
            
            hotItem.addEventListener('click', () => {
                this.searchInput.value = question.question;
                this.performSearch();
            });
            
            this.hotList.appendChild(hotItem);
        });
    }

    // 加载统计信息
    async loadStatistics() {
        try {
            const response = await fetch('/api/statistics');
            const result = await response.json();

            if (result.success) {
                this.updateStatistics(result.data);
            }
        } catch (error) {
            console.error('加载统计信息失败:', error);
        }
    }

    // 更新统计信息
    updateStatistics(stats) {
        this.totalCount.textContent = stats.totalQuestions || 0;
        
        if (stats.lastUpdateFormatted) {
            this.lastUpdate.textContent = stats.lastUpdateFormatted;
        }
    }

    // 检查连接状态
    async checkConnectionStatus() {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();

            if (result.success) {
                this.updateConnectionStatus(true);
            } else {
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.error('检查连接状态失败:', error);
            this.updateConnectionStatus(false);
        }
    }

    // 更新连接状态
    updateConnectionStatus(connected) {
        const statusDot = this.status.querySelector('.status-dot');
        const statusText = this.status.querySelector('span');

        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = '已连接';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = '连接失败';
        }
    }

    // 显示加载状态
    showLoading() {
        this.loading.style.display = 'flex';
        this.hideEmptyState();
        this.hideNoResults();
        this.resultsSection.style.display = 'none';
    }

    // 隐藏加载状态
    hideLoading() {
        this.loading.style.display = 'none';
    }

    // 显示空状态
    showEmptyState() {
        this.emptyState.style.display = 'flex';
        this.hideLoading();
        this.hideNoResults();
        this.resultsSection.style.display = 'none';
    }

    // 隐藏空状态
    hideEmptyState() {
        this.emptyState.style.display = 'none';
    }

    // 显示无结果状态
    showNoResults() {
        this.noResults.style.display = 'flex';
        this.hideLoading();
        this.hideEmptyState();
        this.resultsSection.style.display = 'none';
    }

    // 隐藏无结果状态
    hideNoResults() {
        this.noResults.style.display = 'none';
    }

    // 显示错误信息
    showError(message) {
        this.hideLoading();
        this.showNotification(message, 'error');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new KnowledgeSearchApp();
});
