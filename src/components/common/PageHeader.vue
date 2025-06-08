<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <header class="page-header">
    <div class="header-content">
      <h1 class="header-title">{{ title }}</h1>
      <p v-if="description" class="header-description">{{ description }}</p>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  padding: 3rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(var(--vp-primary-rgb), 0.1), transparent 70%);
  z-index: -1;
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding: 0 2rem;
}

.header-title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--vp-primary), var(--vp-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 1.5rem;
  animation: fadeInDown 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.header-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--vp-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }

  .header-content {
    padding: 0 1rem;
  }

  .header-title {
    font-size: 2.5rem;
  }

  .header-description {
    font-size: 1.1rem;
  }
}
</style>