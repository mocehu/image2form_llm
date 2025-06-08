<template>
    <div class="theme-toggle-container" :class="{ 'expanded': isExpanded }">
        <div class="toggle-button" @click="toggleExpand">
            <div class="toggle-icon">
                <BulbOutlined />
            </div>
        </div>
        <div class="toggle-panel">
            <div class="panel-header">外观</div>
            <div class="theme-options">
                <div class="theme-option" :class="{ 'active': !isDarkMode }" @click="setTheme(false)">
                    <div class="option-icon light">
                        <BulbFilled />
                    </div>
                    <div class="option-label">浅色</div>
                </div>
                <div class="theme-option" :class="{ 'active': isDarkMode }" @click="setTheme(true)">
                    <div class="option-icon dark">
                        <BulbOutlined />
                    </div>
                    <div class="option-label">深色</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BulbOutlined, BulbFilled } from '@ant-design/icons-vue';

// 主题状态
const isDarkMode = ref(true);
const isExpanded = ref(false);

// 展开/收起面板
const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};

// 设置主题
const setTheme = (isDark) => {
    isDarkMode.value = isDark;

    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }

    // 点击选择主题后自动收起面板
    setTimeout(() => {
        isExpanded.value = false;
    }, 300);
};

// 点击外部关闭面板
const handleClickOutside = (event) => {
    const container = document.querySelector('.theme-toggle-container');
    if (container && !container.contains(event.target) && isExpanded.value) {
        isExpanded.value = false;
    }
};

// 组件挂载时初始化主题
onMounted(() => {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        // 使用保存的主题设置
        setTheme(savedTheme === 'dark');
    } else {
        // 检查系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark);

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches);
            }
        });
    }

    // 添加点击外部关闭面板的事件监听
    document.addEventListener('click', handleClickOutside);

    // 组件卸载时移除事件监听
    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
});
</script>

<style scoped>
.theme-toggle-container {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    display: flex;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toggle-button {
    width: 48px;
    height: 48px;
    background: var(--vp-card-bg);
    border: 1px solid var(--vp-border);
    border-right: none;
    border-radius: 24px 0 0 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: var(--vp-shadow);
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toggle-button:hover {
    background: var(--vp-card-bg-hover);
    transform: translateX(-5px);
}

.toggle-icon {
    font-size: 20px;
    color: var(--vp-text-secondary);
    transition: all 0.3s ease;
}

.toggle-button:hover .toggle-icon {
    color: var(--vp-primary);
}

.toggle-panel {
    width: 0;
    height: 200px;
    background: var(--vp-card-bg);
    border: 1px solid var(--vp-border);
    border-right: none;
    border-radius: 12px 0 0 12px;
    overflow: hidden;
    opacity: 0;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: var(--vp-shadow);
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.expanded .toggle-panel {
    width: 200px;
    opacity: 1;
}

.panel-header {
    font-size: 16px;
    font-weight: 500;
    color: var(--vp-text);
    margin: 20px 0 16px;
    text-align: center;
}

.theme-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 16px;
}

.theme-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.theme-option:hover {
    background: rgba(var(--vp-primary-rgb), 0.1);
}

.theme-option.active {
    background: rgba(var(--vp-primary-rgb), 0.15);
}

.option-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.option-icon.light {
    background: rgba(255, 255, 255, 0.9);
    color: rgba(0, 0, 0, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-icon.dark {
    background: rgba(30, 30, 32, 0.9);
    color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.option-label {
    font-size: 14px;
    color: var(--vp-text);
}

/* 移动设备适配 */
@media (max-width: 768px) {
    .theme-toggle-container {
        top: auto;
        bottom: 80px;
        right: 0;
    }

    .toggle-button {
        width: 42px;
        height: 42px;
        border-radius: 21px 0 0 21px;
    }

    .toggle-icon {
        font-size: 18px;
    }

    .toggle-panel {
        height: 180px;
    }

    .expanded .toggle-panel {
        width: 180px;
    }
}
</style>