<template>
  <div class="processing-panel vision-card">

    <div class="panel-header">
      <div class="panel-title">
        <div class="panel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 2v5h5"></path>
            <path d="M7 18a4.67 4.67 0 0 0-2 8"></path>
            <path d="M7 18h12a2 2 0 0 0 2-2V7.67A2.67 2.67 0 0 0 18.33 5H15"></path>
            <path d="M7 18V7a2 2 0 0 1 2-2h1"></path>
            <path d="M14 18v-2"></path>
            <path d="M18 18v-3"></path>
            <path d="M10 18v-1"></path>
          </svg>
        </div>
        <h3>识别进度</h3>
      </div>
      <div class="processing-status">
        <span class="processing-status-icon" :class="{ active: loading, completed: !loading && formData }"></span>
        <span>{{ statusMessage }}</span>
      </div>
    </div>

    <div class="panel-body">
      <div v-if="loading" class="processing-progress">
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-info">
          <div class="progress-percentage">{{ progress }}% 完成</div>
          <div class="progress-stage">{{ progressStageName }}</div>
        </div>
      </div>

      <div v-if="loading" class="processing-stages">
        <div v-for="(stage, index) in stages" :key="index" class="stage-item"
          :class="{ active: progressStage >= index }">
          <div class="stage-dot" :class="{ active: progressStage === index, completed: progressStage > index }">
            <IconCheck v-if="progressStage > index" />
            <template v-else>{{ index + 1 }}</template>
          </div>
          <div class="stage-label" :class="{ active: progressStage === index }">{{ stage }}</div>
        </div>
      </div>

      <div class="processing-message">
        <div class="message-icon">
          <IconInfo v-if="!loading" />
          <IconUpload v-else />
        </div>
        <div>
          <div v-if="loading && isThinkingModel">
            使用深度思考模型分析表单，系统正在进行更深入的理解和处理，这可能需要更长时间，但会带来更准确的结果。
          </div>
          <div v-else-if="loading">正在分析表单结构，识别各个字段类型及其关系，并生成可交互的表单组件。</div>
          <div v-else>表单结构识别完成，以下是处理过程中的思考内容和操作记录。您可以在下方查看结果。</div>
        </div>
      </div>

      <div class="output-container">
        <div class="output-header">
          <div class="output-title">
            <IconPencil />
            思考与处理过程
          </div>
          <div class="output-actions">
            <button class="output-action" @click="toggleAutoScroll" :title="autoScroll ? '关闭自动滚动' : '开启自动滚动'">
              <IconScroll />
            </button>
            <button class="output-action" @click="clearResponseStream" title="清空输出">
              <IconTrash />
            </button>
          </div>
        </div>
        <div class="response-stream" ref="responseStreamContainer">
          <div v-for="(line, index) in responseStream" :key="index" class="stream-line">
            <template v-if="typeof line === 'object' && line.type === 'thinking'">
              <div class="stream-thinking-block">
                <div class="thinking-title">思考过程</div>
                <div class="thinking-content">
                  <div v-for="(step, stepIndex) in line.content.split('\n\n').filter(s => s.trim())" :key="stepIndex"
                    class="thinking-content-step">
                    {{ step }}
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="typeof line === 'string' && line.startsWith('> 思考:')">
              <span class="stream-content stream-thinking">
                {{ line.replace(/^> 思考:/, '').trim() }}
              </span>
            </template>
            <template v-else-if="typeof line === 'string' && line.startsWith('> 信息:')">
              <span class="stream-content stream-info">
                {{ line.replace(/^> 信息:/, '').trim() }}
              </span>
            </template>
            <template v-else-if="typeof line === 'string' && line.startsWith('>')">
              <span class="stream-prefix">></span>
              <span class="stream-content">{{ line.replace(/^>\s*/, '') }}</span>
            </template>
            <template v-else-if="typeof line === 'string' && line.startsWith('✅')">
              <span class="stream-prefix">✅</span>
              <span class="stream-content">{{ line.replace(/^✅\s*/, '') }}</span>
            </template>
            <template v-else-if="typeof line === 'string' && line.startsWith('❌')">
              <span class="stream-prefix">❌</span>
              <span class="stream-content">{{ line.replace(/^❌\s*/, '') }}</span>
            </template>
            <template v-else>
              <span class="stream-content">{{ line }}</span>
            </template>
          </div>
          <div v-if="isProcessingResponse" class="stream-line">
            <span class="stream-content">
              <span class="stream-highlight">处理中</span>
              <span class="thinking-animation">
                <span class="thinking-dot"></span>
                <span class="thinking-dot"></span>
                <span class="thinking-dot"></span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted } from 'vue';
import { useModelStore } from '@/stores/modelStore';
import IconProcessing from '@/components/icons/IconProcessing.vue';
import IconCheckmark from '@/components/icons/IconCheckmark.vue';
import IconCheck from '@/components/icons/IconCheck.vue';
import IconInfo from '@/components/icons/IconInfo.vue';
import IconUpload from '@/components/icons/IconUpload.vue';
import IconPencil from '@/components/icons/IconPencil.vue';
import IconScroll from '@/components/icons/IconScroll.vue';
import IconTrash from '@/components/icons/IconTrash.vue';

const props = defineProps({
  loading: Boolean,
  formData: Object,
  progress: Number,
  progressStage: Number,
  statusMessage: String,
  responseStream: Array,
  isProcessingResponse: Boolean,
  successMessage: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:autoScroll', 'clearResponseStream']);

const modelStore = useModelStore();
const autoScroll = ref(true);
const responseStreamContainer = ref(null);

// Array of stage names
const stages = ['准备中', '连接中', '接收数据中', '处理数据中', '完成'];

// Computed property to get the current stage name
const progressStageName = computed(() => {
  const stage = props.progressStage >= 0 && props.progressStage < stages.length
    ? stages[props.progressStage]
    : '处理中';

  // Change name if using thinking model
  if (props.progressStage === 2 && isThinkingModel.value) {
    return '思考分析中';
  }

  return stage;
});

// Check if the selected model is a thinking model
const isThinkingModel = computed(() => {
  return modelStore.isSelectedModelThinking;
});

// Method to toggle auto-scroll
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value;
  emit('update:autoScroll', autoScroll.value);
};

// Method to clear response stream
const clearResponseStream = () => {
  emit('clearResponseStream');
};

// Watch response stream changes to auto-scroll to bottom
watch(() => props.responseStream, () => {
  if (autoScroll.value && responseStreamContainer.value) {
    nextTick(() => {
      responseStreamContainer.value.scrollTop = responseStreamContainer.value.scrollHeight;
    });
  }
}, { deep: true });

// Initialize scrolling behavior
onMounted(() => {
  if (responseStreamContainer.value) {
    responseStreamContainer.value.scrollTop = responseStreamContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
.processing-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
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

.panel-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.processing-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 30px;
  background: rgba(var(--vp-primary-rgb), 0.05);
  color: var(--vp-text-secondary);
}

.processing-status-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  background-color: var(--vp-primary);
}

.processing-status-icon.active::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background-color: var(--vp-primary);
  opacity: 0.3;
  animation: pulse 1.5s infinite;
}

.processing-status-icon.completed {
  background-color: var(--vp-success);
}

.processing-status-icon.completed::after {
  background-color: var(--vp-success);
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }

  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

.processing-progress {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.progress-track {
  height: 8px;
  width: 100%;
  background-color: rgba(var(--vp-primary-rgb), 0.05);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: var(--vp-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.progress-percentage {
  font-weight: 600;
  color: var(--vp-text);
}

.progress-stage {
  color: var(--vp-text-secondary);
}

.processing-stages {
  display: flex;
  justify-content: space-between;
  margin: 0.625rem 0;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  z-index: 1;
}

.stage-item:not(:first-child)::before {
  content: '';
  position: absolute;
  top: 16px;
  left: -49%;
  width: 100%;
  height: 2px;
  background-color: rgba(var(--vp-primary-rgb), 0.1);
  z-index: -1;
}

.stage-item.active:not(:first-child)::before {
  background-color: var(--vp-primary);
}

.stage-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(var(--vp-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--vp-text-secondary);
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stage-dot.active {
  background-color: rgba(var(--vp-primary-rgb), 0.2);
  color: var(--vp-primary);
  border-color: var(--vp-primary);
}

.stage-dot.completed {
  background-color: var(--vp-primary);
  color: #fff;
}

.stage-label {
  font-size: 0.85rem;
  color: var(--vp-text-secondary);
  text-align: center;
  transition: all 0.3s ease;
}

.stage-label.active {
  color: var(--vp-primary);
  font-weight: 600;
}

.processing-message {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--vp-radius-md);
  background-color: rgba(var(--vp-primary-rgb), 0.05);
  align-items: center;
}

.message-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--vp-radius-md);
  background-color: rgba(var(--vp-primary-rgb), 0.1);
  color: var(--vp-primary);
}

.output-container {
  display: flex;
  flex-direction: column;
  border-radius: var(--vp-radius-md);
  overflow: hidden;
  border: 1px solid var(--vp-border);
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(var(--vp-primary-rgb), 0.05);
  border-bottom: 1px solid var(--vp-border);
}

.output-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-text);
}

.output-actions {
  display: flex;
  gap: 0.25rem;
}

.output-action {
  width: 28px;
  height: 28px;
  border-radius: var(--vp-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--vp-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.output-action:hover {
  background-color: rgba(var(--vp-primary-rgb), 0.1);
  color: var(--vp-primary);
}

.response-stream {
  height: auto;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(var(--vp-c-bg-soft-rgb), 0.5);
  scrollbar-width: thin;
  scrollbar-color: var(--vp-scrollbar-thumb) var(--vp-scrollbar-track);
}

.response-stream::-webkit-scrollbar {
  width: 6px;
}

.response-stream::-webkit-scrollbar-track {
  background-color: var(--vp-scrollbar-track);
}

.response-stream::-webkit-scrollbar-thumb {
  background-color: var(--vp-scrollbar-thumb);
  border-radius: 3px;
}

.response-stream::-webkit-scrollbar-thumb:hover {
  background-color: var(--vp-scrollbar-thumb-hover);
}

.stream-line {
  margin-bottom: 0.5rem;
  display: flex;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--vp-text);
}

.stream-prefix {
  padding-right: 0.5rem;
  color: var(--vp-text-secondary);
  flex-shrink: 0;
}

.stream-content {
  flex: 1;
  word-break: break-word;
}

.stream-highlight {
  color: var(--vp-primary);
  font-weight: 600;
}

.stream-thinking {
  color: var(--vp-success);
  font-style: italic;
}

.stream-info {
  color: var(--vp-info);
}

.stream-thinking-block {
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(var(--vp-success-rgb), 0.05);
  border-radius: var(--vp-radius-sm);
  border-left: 3px solid var(--vp-success);
  margin-bottom: 0.5rem;
}

.thinking-title {
  font-weight: 600;
  color: var(--vp-success);
  margin-bottom: 0.5rem;
}

.thinking-content {
  color: var(--vp-text);
  font-size: 0.85rem;
  line-height: 1.5;
}

.thinking-content-step {
  margin-bottom: 0.5rem;
}

.thinking-animation {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
}

.thinking-dot {
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  margin: 0 2px;
  opacity: 0.6;
  animation: dotPulse 1.5s infinite;
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes dotPulse {

  0%,
  100% {
    transform: scale(0.6);
    opacity: 0.6;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .processing-stages {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .stage-item {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  .stage-item:not(:first-child)::before {
    display: none;
  }

  .stage-dot {
    margin-bottom: 0;
  }
}
</style>