<script setup>
const features = [
  {
    icon: '🤖',
    title: '智能识别',
    description: '基于多模态AI模型，准确识别各类表单结构'
  },
  {
    icon: '🪄',
    title: '一键上传',
    description: '支持拖放或点击上传表单图片'
  },
  {
    icon: '🚀',
    title: '实时渲染',
    description: '即时生成可交互的Ant Design表单'
  },
  {
    icon: '✒️',
    title: '电子签名',
    description: '支持在识别表单中添加电子签名'
  }
];
</script>

<template>
  <div class="feature-grid">
    <div v-for="(feature, index) in features" :key="index" class="feature-card fade-in-up"
      :style="{ animationDelay: `${index * 100}ms` }">
      <div class="feature-icon-wrapper">
        <div class="feature-icon float">{{ feature.icon }}</div>
      </div>
      <h3 class="feature-title">{{ feature.title }}</h3>
      <p class="feature-desc">{{ feature.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  border-radius: var(--vp-radius-xl);
  background: var(--vp-card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--vp-border);
  text-align: center;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.feature-card:hover {
  transform: translateY(-10px);
  background: var(--vp-card-bg-hover);
  box-shadow: var(--vp-shadow-hover);
  border-color: rgba(var(--vp-primary-rgb), 0.3);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg,
      rgba(var(--vp-primary-rgb), 0.2),
      rgba(var(--vp-secondary-rgb), 0.2));
  box-shadow:
    0 10px 15px -3px rgba(var(--vp-primary-rgb), 0.15),
    0 0 0 1px rgba(var(--vp-primary-rgb), 0.1);
}

.feature-icon {
  font-size: 2.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--vp-text);
  background: linear-gradient(90deg, var(--vp-primary), var(--vp-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.feature-desc {
  color: var(--vp-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>