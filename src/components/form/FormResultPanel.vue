<template>
  <div class="form-result-panel">
    <div class="vision-card">
      <div class="panel-header">
        <div class="panel-title">
          <div class="panel-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>结构预览</h3>
        </div>
        <div class="view-toggle">
          <button :class="['toggle-btn', { active: viewMode === 'form' }]" @click="viewMode = 'form'" title="表单视图">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="9"></rect>
              <rect x="14" y="7" width="3" height="5"></rect>
            </svg>
            表单
          </button>
          <button :class="['toggle-btn', { active: viewMode === 'json' }]" @click="viewMode = 'json'" title="JSON视图">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            JSON
          </button>
        </div>
        <div class="card-actions">
          <button class="action-button" @click="copyFormAsJson" title="复制为JSON">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-button" @click="copyFormAsHtml" title="复制为HTML">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="panel-body">
        <div v-if="copyStatus" :class="['copy-status', { success: copyStatus.type === 'success' }]">
          {{ copyStatus.message }}
        </div>

        <div class="card-content">
          <div v-if="formData?.title || formData?.formTitle" class="form-main-title">
            {{ formData?.formTitle || formData?.title }}
          </div>

          <div v-if="viewMode === 'form'" class="form-container">
            <FormRender v-if="formData" :form-data="formData" :is-preview="true" />
            <div v-else class="no-data-message">暂无表单数据。请上传表单图片或使用测试数据。</div>
          </div>

          <div v-else-if="viewMode === 'json'" class="json-container">
            <pre v-if="formData" class="json-content"><code v-html="formattedJson"></code></pre>
            <div v-else class="no-data-message">暂无表单数据。请上传表单图片或使用测试数据。</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FormRender from '@/components/form/FormRender.vue';

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['upload-request', 'use-test-data']);

const copyStatus = ref(null);
const viewMode = ref('form'); // 'form' 或 'json'

// 格式化JSON，高亮语法
const formattedJson = computed(() => {
  if (!props.formData) return '';

  const jsonStr = JSON.stringify(props.formData, null, 2);
  return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'json-value';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
});

const copyFormAsJson = () => {
  const jsonStr = JSON.stringify(props.formData, null, 2);
  navigator.clipboard.writeText(jsonStr)
    .then(() => {
      copyStatus.value = { type: 'success', message: '复制成功' };
      setTimeout(() => {
        copyStatus.value = null;
      }, 2000);
    })
    .catch(() => {
      copyStatus.value = { type: 'error', message: '复制失败' };
      setTimeout(() => {
        copyStatus.value = null;
      }, 2000);
    });
};

const copyFormAsHtml = () => {
  // 获取表单HTML结构并复制
  const formContainer = document.querySelector('.form-container');
  if (formContainer) {
    const htmlContent = formContainer.innerHTML;
    navigator.clipboard.writeText(htmlContent)
      .then(() => {
        copyStatus.value = { type: 'success', message: 'HTML复制成功' };
        setTimeout(() => {
          copyStatus.value = null;
        }, 2000);
      })
      .catch(() => {
        copyStatus.value = { type: 'error', message: 'HTML复制失败' };
        setTimeout(() => {
          copyStatus.value = null;
        }, 2000);
      });
  } else {
    copyStatus.value = { type: 'error', message: '未找到表单内容' };
    setTimeout(() => {
      copyStatus.value = null;
    }, 2000);
  }
};
</script>

<style scoped>
.form-result-panel {
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
  border-radius: var(--vp-radius-xl) var(--vp-radius-xl) 0 0;
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
  transition: all 0.3s ease;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  margin-right: 0.5rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--vp-border);
  background: var(--vp-input-bg);
  color: var(--vp-text-secondary);
  border-radius: var(--vp-radius-md);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: rgba(var(--vp-primary-rgb), 0.1);
  color: var(--vp-primary);
  border-color: rgba(var(--vp-primary-rgb), 0.2);
}

.toggle-btn:hover {
  background: rgba(var(--vp-primary-rgb), 0.05);
  color: var(--vp-primary);
}

.panel-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  background-color: var(--vp-card-bg);
  border-radius: 0 0 var(--vp-radius-xl) var(--vp-radius-xl);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: rgba(var(--vp-primary-rgb), 0.05);
  border: none;
  color: var(--vp-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.action-button:hover {
  background-color: rgba(var(--vp-primary-rgb), 0.1);
  color: var(--vp-primary);
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(var(--vp-primary-rgb), 0.2);
}

.copy-status {
  position: absolute;
  top: -1rem;
  right: 0;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  background-color: var(--vp-danger);
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  animation: fadeInOut 2s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.copy-status.success {
  background-color: var(--vp-success);
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  20% {
    opacity: 1;
    transform: translateY(0);
  }

  80% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.form-main-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--vp-text);
  margin-bottom: 1.5rem;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--vp-border);
  background: var(--vp-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-container {
  background-color: var(--vp-input-bg);
  border-radius: var(--vp-radius-md);
  padding: 1.5rem;
  border: 1px solid var(--vp-border);
  transition: all 0.3s ease;
}

.form-container:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: rgba(var(--vp-primary-rgb), 0.2);
}

.no-data-message {
  text-align: center;
  padding: 3rem;
  color: var(--vp-text-secondary);
  background: rgba(var(--vp-primary-rgb), 0.05);
  border-radius: var(--vp-radius-md);
  border: 1px dashed var(--vp-border);
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-data-message::before {
  content: '📋';
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.json-container {
  background-color: var(--vp-input-bg);
  border-radius: var(--vp-radius-md);
  padding: 1.5rem;
  border: 1px solid var(--vp-border);
  transition: all 0.3s ease;
  position: relative;
  overflow: auto;
  max-height: 500px;
}

.json-content {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

.json-key {
  color: #905;
  font-weight: 600;
}

.json-string {
  color: #690;
}

.json-boolean {
  color: #07a;
}

.json-null {
  color: #999;
}

.json-value {
  color: #07a;
}

@media (max-width: 768px) {
  .panel-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 1rem;
  }

  .panel-body {
    padding: 1rem;
  }

  .form-main-title {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .view-toggle {
    order: 3;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    justify-content: center;
  }

  .toggle-btn {
    flex: 1;
    justify-content: center;
  }

  .form-container {
    padding: 1rem;
  }

  .json-container {
    padding: 1rem;
  }

  .no-data-message {
    padding: 2rem 1rem;
  }
}
</style>