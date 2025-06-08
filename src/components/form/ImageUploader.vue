<script setup>
import { ref } from 'vue';

const props = defineProps({
  imageUrl: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  successMessage: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['recognize', 'use-test-data', 'reset', 'upload', 'drop']);

// 触发文件选择
const triggerFileInput = () => {
  document.getElementById('fileInput').click();
};

// 处理文件上传
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    // 验证文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('只支持 JPG 或 PNG 格式的图片');
      return;
    }

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      emit('upload', file);
    };
    reader.readAsDataURL(file);
  }
};

// 处理拖拽上传
const handleDrop = (e) => {
  e.preventDefault();
  if (props.loading) return;

  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      emit('drop', e);
    }
  }
};

const isDragging = ref(false);

// 处理拖拽样式
const handleDragOver = (e) => {
  e.preventDefault();
  if (!props.loading) {
    isDragging.value = true;
  }
};

const handleDragLeave = () => {
  isDragging.value = false;
};
</script>

<template>
  <div class="image-uploader vision-card">
    <div class="panel-header">
      <div class="panel-title">
        <div class="panel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <h3>表单图片上传</h3>
      </div>
    </div>

    <div class="panel-body">
      <div class="upload-area" :class="{ 'dragging': isDragging, 'disabled': loading }"
        @click="!loading && triggerFileInput()" @dragover="handleDragOver" @dragleave="handleDragLeave"
        @drop="handleDrop">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <div class="upload-text">{{ loading ? '正在处理中...' : '点击或拖拽图片到此处上传' }}</div>
        <div class="upload-hint">支持 JPG, PNG 格式，建议尺寸小于 5MB</div>
        <input type="file" id="fileInput" accept="image/*" style="display: none" @change="handleFileUpload">
      </div>

      <div v-if="imageUrl" class="image-preview-container">
        <img :src="imageUrl" class="image-preview" alt="预览图片">
        <div class="image-overlay" :class="{ 'dragging': isDragging, 'disabled': loading }"
          @click="!loading && triggerFileInput()" @dragover="handleDragOver" @dragleave="handleDragLeave"
          @drop="handleDrop">
          <div class="overlay-content">
            <div class="overlay-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div class="overlay-text">{{ loading ? '处理中...' : '点击或拖拽新图片替换' }}</div>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="success-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <div class="actions">
        <button class="vision-btn vision-btn-primary" :disabled="!imageUrl || loading" @click="emit('recognize')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          识别表单结构
        </button>
        <button class="vision-btn" @click="emit('use-test-data')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          使用测试数据
        </button>
        <button class="vision-btn" @click="emit('reset')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
          </svg>
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  overflow: hidden;
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

.upload-area {
  border: 2px dashed var(--vp-border);
  border-radius: var(--vp-radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(var(--vp-primary-rgb), 0.05), transparent 70%);
  z-index: 0;
}

.upload-area.dragging {
  border-color: var(--vp-primary);
  background: rgba(var(--vp-primary-rgb), 0.05);
}

.upload-area.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-icon {
  margin-bottom: 1.5rem;
  color: var(--vp-primary);
  position: relative;
  z-index: 1;
}

.upload-text {
  font-size: 1.1rem;
  color: var(--vp-text);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.upload-hint {
  color: var(--vp-text-muted);
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--vp-radius-lg);
  border: 1px solid var(--vp-border);
  position: relative;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--vp-radius-md);
  box-shadow: var(--vp-shadow);
  z-index: 1;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--vp-radius-md);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.image-overlay:hover {
  opacity: 1;
}

.image-overlay.dragging {
  opacity: 1;
  background: rgba(var(--vp-primary-rgb), 0.6);
}

.image-overlay.disabled {
  cursor: not-allowed;
}

.overlay-content {
  text-align: center;
  color: white;
  padding: 1rem;
}

.overlay-icon {
  margin-bottom: 0.75rem;
  color: white;
}

.overlay-text {
  font-size: 1.1rem;
  color: white;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-end;
}

.success-message {
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
  }

  .upload-area {
    padding: 2rem 1rem;
  }
}
</style>