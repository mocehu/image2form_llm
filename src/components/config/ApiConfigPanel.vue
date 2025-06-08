<script setup>
import { ref, computed } from 'vue';
import { useModelStore } from '@/stores/modelStore';

const props = defineProps({
  apiConfig: {
    type: Object,
    required: true
  },
  apiError: {
    type: String,
    default: ''
  },
  apiSuccess: {
    type: String,
    default: ''
  },
  testingApi: {
    type: Boolean,
    default: false
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle', 'test-connection', 'save']);

const modelStore = useModelStore();
const showModelDialog = ref(false);
const showCustomModelInput = ref(false);
const isThinkingModelChecked = ref(false);
const newCustomModel = ref({
  name: '',
  type: '',
  icon: 'C',
  id: ''
});
const editingCustomModelIndex = ref(-1);

// 计算属性：判断选中的模型是否为思考型模型
const isSelectedModelThinking = computed(() => {
  return modelStore.isModelThinking(props.apiConfig.model);
});

// 获取选中的模型名称
const selectedModelName = computed(() => {
  return modelStore.getModelName(props.apiConfig.model);
});

// 获取选中的模型图标
const selectedModelIcon = computed(() => {
  return modelStore.getModelIcon(props.apiConfig.model);
});

function openModelDialog() {
  showModelDialog.value = true;
}

function closeModelDialog() {
  showModelDialog.value = false;
  showCustomModelInput.value = false;
}

function selectModel(modelId) {
  modelStore.setSelectedModel(modelId);
  props.apiConfig.model = modelId;
  closeModelDialog();
}

function toggleThinkingType(e) {
  isThinkingModelChecked.value = e.target.checked;
  newCustomModel.value.type = isThinkingModelChecked.value ? 'thinking' : '';
}

function addCustomModel() {
  if (!newCustomModel.value.name) return;

  if (editingCustomModelIndex.value >= 0) {
    modelStore.updateCustomModel(editingCustomModelIndex.value, { ...newCustomModel.value });
  } else {
    modelStore.addCustomModel({ ...newCustomModel.value });
  }

  resetCustomModelForm();
  showCustomModelInput.value = false;
}

function editCustomModel(index) {
  const model = modelStore.customModels[index];
  editingCustomModelIndex.value = index;

  newCustomModel.value = { ...model };
  isThinkingModelChecked.value = model.type === 'thinking';

  showCustomModelInput.value = true;
}

function deleteCustomModel(index) {
  modelStore.deleteCustomModel(index);
}

function resetCustomModelForm() {
  newCustomModel.value = {
    name: '',
    type: '',
    icon: 'C',
    id: ''
  };
  isThinkingModelChecked.value = false;
  editingCustomModelIndex.value = -1;
}
</script>

<template>
  <div class="api-config-panel vision-card">
    <div class="panel-header" @click="emit('toggle')">
      <div class="panel-title">
        <div class="panel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </div>
        <h3>API与模型配置</h3>
      </div>
      <div class="toggle-icon" :class="{ collapsed: isCollapsed }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div class="panel-body" v-show="!isCollapsed">
      <div class="form-row">
        <label class="form-label">API 密钥</label>
        <div class="form-input-group">
          <input type="password" class="vision-input" v-model="apiConfig.apiKey" placeholder="API KEY">
          <button class="vision-btn" @click="emit('test-connection')" :disabled="testingApi || !apiConfig.apiKey">
            <span v-if="testingApi">测试中...</span>
            <span v-else>测试连接</span>
          </button>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">API 地址</label>
        <input type="text" class="vision-input" v-model="apiConfig.endpoint"
          placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions">
      </div>

      <div class="form-row">
        <label class="form-label">模型</label>
        <div class="model-selector">
          <div class="selected-model">
            <div class="model-icon">{{ selectedModelIcon }}</div>
            <div class="model-info">
              <div class="model-name">
                {{ selectedModelName }}
                <span v-if="isSelectedModelThinking" class="model-tag thinking">思考模型</span>
              </div>
            </div>
          </div>
          <button class="vision-btn" @click="openModelDialog">
            选择模型
          </button>
        </div>
      </div>

      <div v-if="apiError" class="api-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ apiError }}</span>
      </div>

      <div v-if="apiSuccess" class="api-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ apiSuccess }}</span>
      </div>

      <div class="form-actions">
        <button class="vision-btn vision-btn-primary" @click="emit('save')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          保存配置
        </button>
      </div>
    </div>

    <!-- 模型选择对话框 -->
    <teleport to="body">
      <div v-if="showModelDialog" class="model-dialog-overlay" @click="closeModelDialog">
        <div class="model-dialog" @click.stop>
          <div class="dialog-header">
            <h3>选择模型</h3>
            <button class="close-btn" @click="closeModelDialog">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="dialog-body">
            <!-- 豆包视觉语言模型组 -->
            <div class="model-group">
              <div class="model-group-title">豆包视觉语言模型</div>
              <div v-for="model in modelStore.visionModels" :key="model.id" class="model-option"
                :class="{ selected: apiConfig.model === model.id }" @click="selectModel(model.id)">
                <div class="model-icon">{{ model.icon }}</div>
                <div class="model-details">
                  <div class="model-name">{{ model.name }}</div>
                  <div v-if="model.description" class="model-description">{{ model.description }}</div>
                </div>
              </div>
            </div>

            <!-- 思考模型组 -->
            <div class="model-group">
              <div class="model-group-title">豆包多模态深度思考模型</div>
              <div v-for="model in modelStore.thinkingModels" :key="model.id" class="model-option"
                :class="{ selected: apiConfig.model === model.id }" @click="selectModel(model.id)">
                <div class="model-icon">{{ model.icon }}</div>
                <div class="model-details">
                  <div class="model-name">
                    {{ model.name }}
                    <span class="model-tag thinking">思考模型</span>
                  </div>
                  <div v-if="model.description" class="model-description">{{ model.description }}</div>
                </div>
              </div>
            </div>

            <!-- 自定义模型组 -->
            <div class="model-group">
              <div class="model-group-title">自定义模型</div>

              <!-- 已保存的自定义模型列表 -->
              <div v-if="modelStore.customModels.length > 0">
                <div v-for="(model, index) in modelStore.customModels" :key="index" class="model-option"
                  :class="{ selected: apiConfig.model === model.id }" @click="selectModel(model.id)">
                  <div class="model-icon">{{ model.icon || 'C' }}</div>
                  <div class="model-details">
                    <div class="model-name">
                      {{ model.name }}
                      <span v-if="model.type === 'thinking'" class="model-tag thinking">思考模型</span>
                    </div>
                  </div>

                  <div class="custom-model-actions">
                    <button class="custom-model-action" @click.stop="editCustomModel(index)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button class="custom-model-action" @click.stop="deleteCustomModel(index)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 添加新模型按钮 -->
              <div class="model-option add-model" @click="showCustomModelInput = true">
                <div class="model-icon">+</div>
                <div class="model-details">
                  <div class="model-name">添加自定义模型</div>
                  <div class="model-description">输入自定义模型名称</div>
                </div>
              </div>

              <!-- 自定义模型输入表单 -->
              <div v-if="showCustomModelInput" class="custom-model-input">
                <input type="text" class="vision-input" v-model="newCustomModel.name" placeholder="输入自定义模型名称" />

                <div class="checkbox-wrapper">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="isThinkingModelChecked" @change="toggleThinkingType" />
                    <span>深度思考模型</span>
                  </label>
                </div>

                <button class="vision-btn vision-btn-primary" @click="addCustomModel()"
                  :disabled="!newCustomModel.name">
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.api-config-panel {
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  background: rgba(var(--vp-primary-rgb), 0.05);
  border-bottom: 1px solid var(--vp-border);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--vp-primary-rgb), 0.1);
  color: var(--vp-primary);
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.collapsed {
  transform: rotate(-180deg);
}

.panel-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-text-secondary);
}

.form-input-group {
  display: flex;
  gap: 0.75rem;
}

.form-input-group .vision-input {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.model-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--vp-radius-md);
  background: var(--vp-input-bg);
  border: 1px solid var(--vp-border);
}

.selected-model {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.model-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--vp-primary-rgb), 0.2);
  color: var(--vp-text);
  font-weight: 600;
  font-size: 1rem;
}

.model-info {
  display: flex;
  flex-direction: column;
}

.model-name {
  font-weight: 500;
  color: var(--vp-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-tag {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgba(var(--vp-primary-rgb), 0.1);
  color: var(--vp-primary);
}

.model-tag.thinking {
  background: rgba(var(--vp-warning-rgb), 0.1);
  color: var(--vp-warning);
}

.api-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--vp-radius-md);
  background: rgba(var(--vp-danger-rgb), 0.1);
  color: var(--vp-danger);
  font-size: 0.9rem;
}

.api-success {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--vp-radius-md);
  background: rgba(var(--vp-success-rgb), 0.1);
  color: var(--vp-success);
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
}

/* 模型选择对话框 */
.model-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(30px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.model-dialog {
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  background: var(--vp-card-bg);
  border-radius: var(--vp-radius-xl);
  border: 1px solid var(--vp-border);
  box-shadow: var(--vp-shadow);
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: rgba(var(--vp-primary-rgb), 0.05);
  border-bottom: 1px solid var(--vp-border);
}


.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--vp-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--vp-text);
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(80vh - 4.5rem);
  scrollbar-width: thin;
  scrollbar-color: var(--vp-scrollbar-thumb) var(--vp-scrollbar-track);
}

.dialog-body::-webkit-scrollbar {
  width: 6px;
}

.dialog-body::-webkit-scrollbar-track {
  background: var(--vp-scrollbar-track);
  border-radius: 3px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background-color: var(--vp-scrollbar-thumb);
  border-radius: 3px;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background-color: var(--vp-scrollbar-thumb-hover);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.model-group {
  margin-bottom: 1.5rem;
}

.model-group-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-text-secondary);
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--vp-radius-sm);
}

.model-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--vp-radius-md);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.model-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.model-option.selected {
  background: rgba(var(--vp-primary-rgb), 0.1);
  border: 1px solid rgba(var(--vp-primary-rgb), 0.2);
}

.model-details {
  margin-left: 1rem;
  flex: 1;
}

.model-description {
  font-size: 0.85rem;
  color: var(--vp-text-muted);
  margin-top: 0.25rem;
}

.custom-model-actions {
  display: flex;
  gap: 0.5rem;
}

.custom-model-action {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--vp-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-model-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--vp-text);
}

.model-option.add-model {
  border: 1px dashed var(--vp-border);
}

.custom-model-input {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--vp-radius-md);
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .form-input-group {
    flex-direction: column;
  }

  .model-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>