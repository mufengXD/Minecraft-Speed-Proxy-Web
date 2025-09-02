<template>
    <div class="motd-maker">
        <h1>MOTD 制作工具</h1>
        
        <div class="motd-container">
            <div class="current-motd">
                <h3>当前 MOTD</h3>
                <button @click="getCurrentMOTD" class="fetch-btn">获取当前 MOTD</button>
                <div v-if="currentMOTDData" class="motd-display">
                    <p><strong>服务器信息：</strong></p>
                    <div class="server-info">
                        <p><span class="label">版本：</span>{{ getServerVersion() }}</p>
                        <p><span class="label">协议：</span>{{ getServerProtocol() }}</p>
                        <p><span class="label">在线玩家：</span>{{ getOnlinePlayers() }}/{{ getMaxPlayers() }}</p>
                        <p><span class="label">示例玩家：</span>{{ getSamplePlayersCount() }}个</p>
                        <p><span class="label">图标：</span>{{ getFaviconStatus() }}</p>
                    </div>
                    <p><strong>当前 MOTD：</strong></p>
                    <div class="motd-preview">{{ getMOTDText() }}</div>
                    
                    <!-- 显示示例玩家列表（如果有） -->
                    <div v-if="currentMOTDData.players && currentMOTDData.players.sample && currentMOTDData.players.sample.length > 0" class="sample-players-display">
                        <p><strong>示例玩家列表：</strong></p>
                        <div class="sample-players-list">
                            <div v-for="(player, index) in currentMOTDData.players.sample" :key="index" class="sample-player">
                                <span class="player-name">{{ player.name || '未知玩家' }}</span>
                                <span class="player-id">({{ player.id || '无ID' }})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="motd-editor">
                <h3>MOTD 编辑器</h3>
                
                <!-- 调试信息显示 -->
                <div v-if="true" class="debug-info">
                    <details>
                        <summary style="cursor: pointer; color: #7f8c8d; font-size: 12px;">🔧 调试信息（点击展开）</summary>
                        <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; max-height: 200px; overflow-y: auto; margin-top: 5px;">{{ JSON.stringify(motdForm, null, 2) }}</pre>
                    </details>
                </div>
                
                <form @submit.prevent="setMOTD" class="motd-form">
                    <div class="form-group">
                        <label for="version-name">版本名称：</label>
                        <input type="text" id="version-name" v-model="motdForm.version.name" placeholder="例如: 1.8.9" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="version-protocol">协议版本：</label>
                        <input type="number" id="version-protocol" v-model.number="motdForm.version.protocol" placeholder="例如: 47">
                        <small class="help-text">可选：留空将使用默认协议版本</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="players-max">最大玩家数：</label>
                        <input type="number" id="players-max" v-model.number="motdForm.players.max" placeholder="例如: 100">
                        <small class="help-text">可选：留空将使用服务器默认设置</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="players-online">当前在线数：</label>
                        <input type="number" id="players-online" v-model.number="motdForm.players.online" placeholder="例如: 10">
                        <small class="help-text">可选：留空将显示实际在线人数</small>
                    </div>
                    
                    <div class="form-group">
                        <label>示例玩家列表：</label>
                        <div class="sample-players">
                            <div v-for="(player, index) in motdForm.players.sample" :key="index" class="player-item">
                                <input type="text" v-model="player.name" placeholder="玩家名称" class="player-name">
                                <input type="text" v-model="player.id" placeholder="玩家ID" class="player-id">
                                <button type="button" @click="removeSamplePlayer(index)" class="remove-btn">×</button>
                            </div>
                            <button type="button" @click="addSamplePlayer" class="add-btn">添加示例玩家</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="motd-text">MOTD 描述：</label>
                        <textarea id="motd-text" v-model="motdForm.description.text" placeholder="输入服务器描述文本" rows="3" required></textarea>
                        <small class="help-text">支持 Minecraft 颜色代码，例如: §a绿色文字 §b蓝色文字</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="favicon">Favicon (Base64)：</label>
                        <textarea id="favicon" v-model="motdForm.favicon" placeholder="可选：输入Base64编码的图标数据" rows="2"></textarea>
                        <small class="help-text">可选：64x64像素的PNG图片，转换为Base64格式</small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" @click="previewMOTD" class="preview-btn">预览</button>
                        <button type="submit" class="submit-btn" :disabled="isSubmitting">
                            {{ isSubmitting ? '设置中...' : '设置 MOTD' }}
                        </button>
                        <button type="button" @click="resetForm" class="reset-btn">重置</button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- 预览弹窗 -->
        <div v-if="showPreview" class="preview-modal" @click="closePreview">
            <div class="preview-content" @click.stop>
                <h3>MOTD 预览</h3>
                <div class="preview-motd">
                    <div class="server-entry">
                        <div class="server-icon">
                            <div v-if="motdForm.favicon" class="favicon" :style="{ backgroundImage: `url(${motdForm.favicon})` }"></div>
                            <div v-else class="default-icon">?</div>
                        </div>
                        <div class="server-details">
                            <div class="server-name">{{ motdForm.description.text }}</div>
                            <div class="server-status">{{ motdForm.players.online }}/{{ motdForm.players.max }} 玩家在线</div>
                            <div class="server-version">{{ motdForm.version.name }}</div>
                        </div>
                    </div>
                </div>
                <button @click="closePreview" class="close-preview-btn">关闭预览</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from '@/utils/axios.js'
import logManager from '@/utils/logManager.js'

export default {
    name: 'MOTDMaker',
    data() {
        return {
            currentMOTDData: null,
            isSubmitting: false,
            showPreview: false,
            motdForm: {
                version: {
                    name: '',
                    protocol: null
                },
                players: {
                    max: null,
                    online: null,
                    sample: []
                },
                description: {
                    text: ''
                },
                favicon: ''
            }
        }
    },
    methods: {
        async getCurrentMOTD() {
            try {
                console.log('正在获取当前 MOTD...');
                const response = await axios.get('/api/get_motd');
                console.log('MOTD API 响应:', response);
                console.log('MOTD 数据:', response.data);
                
                if (response.data && response.data.motd) {
                    // 存储完整的响应数据
                    this.currentMOTDData = response.data.motd;
                    console.log('解析后的 MOTD 数据:', this.currentMOTDData);
                    
                    // 填充表单数据 - 传递 motd 对象而不是整个 response.data
                    this.fillFormFromCurrentMOTD(response.data.motd);
                    
                    // 使用全局日志管理器显示成功消息
                    logManager.success('MOTD 数据获取成功，已填充到编辑器！');
                } else if (response.data) {
                    // 如果没有 motd 字段，但有数据，直接使用 response.data
                    console.log('使用 response.data 作为 MOTD 数据');
                    this.currentMOTDData = response.data;
                    this.fillFormFromCurrentMOTD(response.data);
                    
                    logManager.success('MOTD 数据获取成功，已填充到编辑器！');
                } else {
                    console.warn('API 返回空数据');
                    logManager.warning('API 返回空数据，请检查服务器状态');
                }
            } catch (error) {
                console.error('获取 MOTD 失败:', error);
                console.error('错误详情:', error.response);
                
                logManager.error(error.response?.data?.message || '获取 MOTD 失败，请检查网络连接和服务器状态');
            }
        },
        
        fillFormFromCurrentMOTD(data) {
            console.log('开始填充表单，数据:', data);
            
            // 创建新的表单对象，初始值为空
            const newForm = {
                version: {
                    name: '',
                    protocol: null
                },
                players: {
                    max: null,
                    online: null,
                    sample: []
                },
                description: {
                    text: ''
                },
                favicon: ''
            };
            
            // 填充版本信息 - 只有当后端有数据时才填充
            if (data.version) {
                if (data.version.name) {
                    newForm.version.name = data.version.name;
                }
                if (data.version.protocol !== undefined && data.version.protocol !== null) {
                    newForm.version.protocol = parseInt(data.version.protocol);
                }
                console.log('填充版本信息:', newForm.version);
            }
            
            // 填充玩家信息 - 只有当后端有数据时才填充
            if (data.players) {
                if (data.players.max !== undefined && data.players.max !== null) {
                    newForm.players.max = parseInt(data.players.max);
                }
                if (data.players.online !== undefined && data.players.online !== null) {
                    newForm.players.online = parseInt(data.players.online);
                }
                
                // 填充示例玩家列表
                if (data.players.sample && Array.isArray(data.players.sample)) {
                    newForm.players.sample = data.players.sample.map(player => ({
                        name: player.name || '',
                        id: player.id || ''
                    }));
                    console.log('填充示例玩家:', newForm.players.sample);
                }
                console.log('填充玩家信息:', newForm.players);
            }
            
            // 填充描述信息 - 只有当后端有数据时才填充
            if (data.description) {
                // 处理不同的描述格式
                if (typeof data.description === 'string') {
                    newForm.description.text = data.description;
                } else if (data.description.text) {
                    newForm.description.text = data.description.text;
                } else if (data.description.extra) {
                    // 处理复杂的Minecraft文本组件格式
                    newForm.description.text = this.extractTextFromComponent(data.description);
                }
                console.log('填充描述信息:', newForm.description);
            }
            
            // 填充图标信息 - 只有当后端有数据时才填充
            if (data.favicon && data.favicon.trim()) {
                // 确保favicon格式正确
                if (data.favicon.startsWith('data:image/')) {
                    newForm.favicon = data.favicon;
                } else {
                    newForm.favicon = `data:image/png;base64,${data.favicon}`;
                }
                console.log('填充图标信息成功');
            } else {
                console.log('无图标信息，保持为空');
            }
            
            // 使用整体赋值确保Vue响应性
            this.motdForm = newForm;
            console.log('表单填充完成:', this.motdForm);
            
            // 强制更新视图
            this.$forceUpdate();
        },
        
        // 辅助方法：从Minecraft文本组件中提取纯文本
        extractTextFromComponent(component) {
            if (typeof component === 'string') {
                return component;
            }
            
            let text = component.text || '';
            if (component.extra && Array.isArray(component.extra)) {
                component.extra.forEach(extra => {
                    text += this.extractTextFromComponent(extra);
                });
            }
            
            return text;
        },
        
        async setMOTD() {
            this.isSubmitting = true;
            
            try {
                console.log('正在设置 MOTD...', this.motdForm);
                
                // 构建提交数据，只包含非空字段
                const submitData = {};
                
                // 处理版本信息
                const versionData = {};
                if (this.motdForm.version.name && this.motdForm.version.name.trim()) {
                    versionData.name = this.motdForm.version.name.trim();
                }
                if (this.motdForm.version.protocol !== null && this.motdForm.version.protocol !== undefined && this.motdForm.version.protocol !== '') {
                    versionData.protocol = this.motdForm.version.protocol;
                }
                // 只有当版本对象有内容时才添加到提交数据中
                if (Object.keys(versionData).length > 0) {
                    submitData.version = versionData;
                }
                
                // 处理玩家信息
                const playersData = {};
                if (this.motdForm.players.max !== null && this.motdForm.players.max !== undefined && this.motdForm.players.max !== '') {
                    playersData.max = this.motdForm.players.max;
                }
                if (this.motdForm.players.online !== null && this.motdForm.players.online !== undefined && this.motdForm.players.online !== '') {
                    playersData.online = this.motdForm.players.online;
                }
                // 处理示例玩家列表（过滤掉空的玩家条目）
                const validSamplePlayers = (this.motdForm.players.sample || []).filter(player => 
                    (player.name && player.name.trim()) || (player.id && player.id.trim())
                );
                if (validSamplePlayers.length > 0) {
                    playersData.sample = validSamplePlayers.map(player => ({
                        ...(player.name && player.name.trim() && { name: player.name.trim() }),
                        ...(player.id && player.id.trim() && { id: player.id.trim() })
                    }));
                }
                // 只有当玩家对象有内容时才添加到提交数据中
                if (Object.keys(playersData).length > 0) {
                    submitData.players = playersData;
                }
                
                // 处理描述信息
                if (this.motdForm.description.text && this.motdForm.description.text.trim()) {
                    submitData.description = {
                        text: this.motdForm.description.text.trim()
                    };
                }
                
                // 处理图标信息
                if (this.motdForm.favicon && this.motdForm.favicon.trim()) {
                    submitData.favicon = this.motdForm.favicon.trim();
                }
                
                console.log('清理后的提交数据:', submitData);
                
                // 检查是否有任何数据要提交
                if (Object.keys(submitData).length === 0) {
                    logManager.warning('请至少填写一个字段再提交');
                    return;
                }
                
                const response = await axios.post('/api/set_motd', {
                    motd: submitData
                });
                
                console.log('设置 MOTD 响应:', response);
                console.log('设置结果:', response.data);
                
                logManager.success('MOTD 设置成功！');
                
                // 设置成功后重新获取当前 MOTD
                setTimeout(() => {
                    this.getCurrentMOTD();
                }, 1000);
                
            } catch (error) {
                console.error('设置 MOTD 失败:', error);
                console.error('错误详情:', error.response);
                
                logManager.error(error.response?.data?.message || '设置失败，请检查参数');
            } finally {
                this.isSubmitting = false;
            }
        },
        
        addSamplePlayer() {
            this.motdForm.players.sample.push({
                name: '',
                id: ''
            });
        },
        
        removeSamplePlayer(index) {
            this.motdForm.players.sample.splice(index, 1);
        },
        
        previewMOTD() {
            this.showPreview = true;
        },
        
        closePreview() {
            this.showPreview = false;
        },
        
        resetForm() {
            this.motdForm = {
                version: {
                    name: '',
                    protocol: null
                },
                players: {
                    max: null,
                    online: null,
                    sample: []
                },
                description: {
                    text: ''
                },
                favicon: ''
            };
            
            logManager.info('表单已重置为空值');
        },
        
        // 辅助方法用于安全地获取服务器信息
        getServerVersion() {
            if (!this.currentMOTDData || !this.currentMOTDData.version) {
                console.log('版本信息不存在');
                return '未知';
            }
            return this.currentMOTDData.version.name || '未知';
        },
        
        getServerProtocol() {
            if (!this.currentMOTDData || !this.currentMOTDData.version) {
                console.log('协议信息不存在');
                return '未知';
            }
            return this.currentMOTDData.version.protocol || '未知';
        },
        
        getOnlinePlayers() {
            if (!this.currentMOTDData || !this.currentMOTDData.players) {
                console.log('玩家信息不存在');
                return 0;
            }
            return this.currentMOTDData.players.online || 0;
        },
        
        getMaxPlayers() {
            if (!this.currentMOTDData || !this.currentMOTDData.players) {
                console.log('最大玩家数信息不存在');
                return 0;
            }
            return this.currentMOTDData.players.max || 0;
        },
        
        getSamplePlayersCount() {
            if (!this.currentMOTDData || !this.currentMOTDData.players || !this.currentMOTDData.players.sample) {
                return 0;
            }
            return this.currentMOTDData.players.sample.length;
        },
        
        getFaviconStatus() {
            if (!this.currentMOTDData) {
                return '未设置';
            }
            return this.currentMOTDData.favicon ? '已设置' : '未设置';
        },
        
        getMOTDText() {
            if (!this.currentMOTDData || !this.currentMOTDData.description) {
                console.log('MOTD描述信息不存在');
                return '无描述';
            }
            return this.currentMOTDData.description.text || '无描述';
        }
    },
    
    mounted() {
        // 组件加载时自动获取一次当前 MOTD
        this.getCurrentMOTD();
        
        // 测试日志管理器是否工作
        console.log('MOTD_maker mounted, testing logManager...');
        setTimeout(() => {
            logManager.info('MOTD 制作工具已加载');
        }, 1000);
    }
}
</script>

<style scoped>
.motd-maker {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    min-height: calc(100vh - 120px); /* 确保有足够的高度来显示内容 */
}

.motd-maker h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
}

.motd-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 30px;
    align-items: start; /* 防止高度拉伸 */
}

.current-motd,
.motd-editor {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    height: fit-content; /* 根据内容调整高度 */
}

.current-motd h3,
.motd-editor h3 {
    color: #34495e;
    margin-bottom: 15px;
    border-bottom: 2px solid #3498db;
    padding-bottom: 5px;
}

.fetch-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
}

.fetch-btn:hover {
    background: #2980b9;
}

.motd-display {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 5px;
    border-left: 4px solid #3498db;
}

.server-info {
    margin-bottom: 15px;
}

.server-info p {
    margin: 5px 0;
    font-size: 14px;
}

.label {
    font-weight: bold;
    color: #2c3e50;
}

.motd-preview {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 10px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    margin-top: 10px;
    min-height: 40px;
    word-wrap: break-word;
}

/* 示例玩家显示 */
.sample-players-display {
    margin-top: 15px;
    padding: 10px;
    background: #f1f2f6;
    border-radius: 5px;
    border-left: 4px solid #27ae60;
}

.sample-players-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.sample-player {
    background: #fff;
    padding: 5px 10px;
    border-radius: 15px;
    border: 1px solid #ddd;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.sample-player .player-name {
    font-weight: bold;
    color: #2c3e50;
}

.sample-player .player-id {
    color: #7f8c8d;
    font-size: 11px;
}

/* 表单样式 */
.motd-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #2c3e50;
}

.form-group input,
.form-group textarea {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3498db;
}

.help-text {
    color: #7f8c8d;
    font-size: 12px;
    margin-top: 5px;
}

/* 示例玩家列表 */
.sample-players {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.player-item {
    display: flex;
    gap: 10px;
    align-items: center;
}

.player-name,
.player-id {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.remove-btn {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
}

.add-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    align-self: flex-start;
}

/* 表单操作按钮 */
.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
}

.preview-btn,
.submit-btn,
.reset-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s;
}

.preview-btn {
    background: #f39c12;
    color: white;
}

.preview-btn:hover {
    background: #e67e22;
}

.submit-btn {
    background: #27ae60;
    color: white;
}

.submit-btn:hover:not(:disabled) {
    background: #219a52;
}

.submit-btn:disabled {
    background: #95a5a6;
    cursor: not-allowed;
}

.reset-btn {
    background: #95a5a6;
    color: white;
}

.reset-btn:hover {
    background: #7f8c8d;
}

/* 预览弹窗 */
.preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.preview-content {
    background: white;
    border-radius: 10px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.preview-content h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.server-entry {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.server-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.favicon {
    width: 64px;
    height: 64px;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
}

.default-icon {
    width: 64px;
    height: 64px;
    background: #7f8c8d;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    border-radius: 4px;
}

.server-details {
    flex: 1;
    min-width: 0;
}

.server-name {
    font-weight: bold;
    font-size: 16px;
    color: #2c3e50;
    margin-bottom: 5px;
    word-wrap: break-word;
}

.server-status {
    color: #27ae60;
    font-size: 14px;
    margin-bottom: 3px;
}

.server-version {
    color: #7f8c8d;
    font-size: 12px;
}

.close-preview-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
    float: right;
}

@media (max-width: 1024px) {
    .motd-container {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}

@media (max-width: 768px) {
    .motd-maker {
        padding: 15px;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .player-item {
        flex-direction: column;
        align-items: stretch;
    }
    
    .preview-content {
        width: 95%;
        margin: 10px;
        padding: 15px;
    }
}
</style>