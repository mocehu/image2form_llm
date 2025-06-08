<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { theme as antTheme } from 'ant-design-vue';
import { ref, computed, watch, onMounted } from 'vue';
import ThemeToggle from './components/common/ThemeToggle.vue';

// 主题状态
const isDarkMode = ref(true);

// 监听主题变化
const initTheme = () => {
  // 检查HTML标签的data-theme属性
  const htmlTheme = document.documentElement.getAttribute('data-theme');
  isDarkMode.value = htmlTheme === 'dark' || htmlTheme === null;
};

// 从CSS变量获取颜色
const getCssVariable = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

// 转换rgba为十六进制色值
const rgbaToHex = (rgba: string) => {
  // 简单处理，假设是rgba(r,g,b,a)格式
  const values = rgba.replace('rgba(', '').replace(')', '').split(',');
  if (values.length >= 3) {
    const r = parseInt(values[0]);
    const g = parseInt(values[1]);
    const b = parseInt(values[2]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return rgba;
};

// Ant Design主题配置
const themeConfig = computed(() => ({
  algorithm: isDarkMode.value ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  token: {
    colorPrimary: rgbaToHex(getCssVariable('--vp-primary')),
    colorBgBase: isDarkMode.value ? '#141414' : '#ffffff',
    colorTextBase: isDarkMode.value ? '#fff' : '#000',
    colorBorder: isDarkMode.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    borderRadius: parseInt(getCssVariable('--vp-radius-md')),
    colorSuccess: rgbaToHex(getCssVariable('--vp-success')),
    colorWarning: rgbaToHex(getCssVariable('--vp-warning')),
    colorError: rgbaToHex(getCssVariable('--vp-danger')),
    colorInfo: rgbaToHex(getCssVariable('--vp-primary')),
    boxShadow: isDarkMode.value
      ? '0 6px 16px -8px rgba(0,0,0,0.32), 0 9px 28px 0 rgba(0,0,0,0.2), 0 12px 48px 16px rgba(0,0,0,0.12)'
      : '0 6px 16px -8px rgba(0,0,0,0.08), 0 9px 28px 0 rgba(0,0,0,0.05), 0 12px 48px 16px rgba(0,0,0,0.03)',
  },
  components: {
    Card: {
      colorBgContainer: isDarkMode.value ? 'rgba(28, 28, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
      boxShadow: isDarkMode.value
        ? '0 1px 2px -2px rgba(0, 0, 0, 0.3), 0 3px 6px 0 rgba(0, 0, 0, 0.25), 0 5px 12px 4px rgba(0, 0, 0, 0.2)'
        : '0 1px 2px -2px rgba(0, 0, 0, 0.06), 0 3px 6px 0 rgba(0, 0, 0, 0.05), 0 5px 12px 4px rgba(0, 0, 0, 0.04)',
    },
    Modal: {
      colorBgElevated: isDarkMode.value ? 'rgba(28, 28, 30, 1)' : 'rgba(255, 255, 255, 1)',
      boxShadow: isDarkMode.value
        ? '0 6px 16px -8px rgba(0,0,0,0.48), 0 9px 28px 0 rgba(0,0,0,0.3), 0 12px 48px 16px rgba(0,0,0,0.2)'
        : '0 6px 16px -8px rgba(0,0,0,0.12), 0 9px 28px 0 rgba(0,0,0,0.08), 0 12px 48px 16px rgba(0,0,0,0.05)',
    },
    Checkbox: {
      colorText: isDarkMode.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorBgContainer: 'transparent'
    },
    Radio: {
      colorText: isDarkMode.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorBgContainer: 'transparent'
    },
    Input: {
      colorTextPlaceholder: isDarkMode.value ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
      colorBgContainer: isDarkMode.value ? 'rgba(28, 28, 30, 0.7)' : 'rgba(248, 248, 250, 0.7)',
      colorBorder: isDarkMode.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    InputNumber: {
      colorTextPlaceholder: isDarkMode.value ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
      colorBgContainer: isDarkMode.value ? 'rgba(28, 28, 30, 0.7)' : 'rgba(248, 248, 250, 0.7)',
      colorBorder: isDarkMode.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    Select: {
      colorTextPlaceholder: isDarkMode.value ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
      colorBgContainer: isDarkMode.value ? 'rgba(28, 28, 30, 0.7)' : 'rgba(248, 248, 250, 0.7)',
      colorBorder: isDarkMode.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      colorBgElevated: isDarkMode.value ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    },
    DatePicker: {
      colorTextPlaceholder: isDarkMode.value ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
      colorBgContainer: isDarkMode.value ? 'rgba(28, 28, 30, 0.7)' : 'rgba(248, 248, 250, 0.7)',
      colorBorder: isDarkMode.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      colorBgElevated: isDarkMode.value ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    },
    Button: {
      colorBgContainer: isDarkMode.value ? 'rgba(58, 58, 60, 0.6)' : 'rgba(238, 238, 240, 0.6)',
      colorBgContainerHover: isDarkMode.value ? 'rgba(68, 68, 70, 0.7)' : 'rgba(228, 228, 230, 0.7)',
    },
    Table: {
      colorBgContainer: isDarkMode.value ? 'rgba(28, 28, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
      colorFillAlter: isDarkMode.value ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    },
    Tabs: {
      colorBgContainer: 'transparent',
    },
    Empty: {
      colorTextDisabled: isDarkMode.value ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
    },
    Message: {
      colorBgElevated: isDarkMode.value ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      colorText: isDarkMode.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
    },
  }
}));

// 监听document的data-theme属性变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-theme') {
      initTheme();
    }
  });
});

onMounted(() => {
  initTheme();

  // 监听document的data-theme属性变化
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 组件卸载时停止监听
  return () => {
    observer.disconnect();
  };
});
</script>

<template>
  <a-config-provider :theme="themeConfig">
    <div class="vision-app">
      <RouterView />
      <ThemeToggle />
    </div>
  </a-config-provider>
</template>

<style>
.vision-app {
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: var(--vp-background);
  color: var(--vp-text);
  overflow-x: hidden;
}

.vision-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
