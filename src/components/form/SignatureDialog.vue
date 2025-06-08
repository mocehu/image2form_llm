<template>
    <a-modal v-model:open="open" :title="fieldLabel + '签名'" :footer="null" :maskClosable="false" width="500px" centered>
        <a-typography-paragraph>
            请在下方区域手写签名，系统将自动捕捉您的签名并添加到表单中。
        </a-typography-paragraph>

        <div style="margin: 16px 0 24px 0;">
            <canvas ref="canvasRef"
                style="width: 100%; height: 200px; border: 1px solid #d9d9d9; border-radius: 2px; cursor: crosshair; touch-action: none;"
                @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"
                @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="stopDrawing"></canvas>
            <div style="text-align: center; margin-top: 8px; color: #999;">请在框内签名</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <a-button @click="clearCanvas">清除</a-button>
            <a-button @click="handleCancel">取消</a-button>
            <a-button type="primary" :disabled="!hasSignature" @click="saveSignature">保存</a-button>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    fieldName: {
        type: String,
        default: ''
    },
    fieldLabel: {
        type: String,
        default: '签名'
    },
    initialValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:open', 'save']);

// 模态框可见性
const open = ref(props.open);

// 监听props变化
watch(() => props.open, (newVal) => {
    open.value = newVal;
    if (newVal) {
        // 当对话框显示时，初始化画布
        setTimeout(initCanvas, 100);
    }
});

// 监听内部状态变化
watch(() => open.value, (newVal) => {
    emit('update:open', newVal);
});

// 画布引用
const canvasRef = ref(null);
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
const hasSignature = ref(false);

// 初始化画布
const initCanvas = () => {
    if (!canvasRef.value) return;

    const canvas = canvasRef.value;
    const rect = canvas.getBoundingClientRect();

    // 设置画布实际尺寸，与显示尺寸相同，避免缩放问题
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx = canvas.getContext('2d');

    // 清除画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 设置线条样式
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 如果有初始值，则加载初始签名
    if (props.initialValue) {
        loadInitialSignature();
    } else {
        hasSignature.value = false;
    }
};

// 加载初始签名
const loadInitialSignature = () => {
    if (!ctx || !props.initialValue) return;

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        hasSignature.value = true;
    };
    img.src = props.initialValue;
};

// 开始绘制
const startDrawing = (e) => {
    e.preventDefault();
    isDrawing = true;
    hasSignature.value = true;

    const coords = getPointerPosition(e);
    lastX = coords.x;
    lastY = coords.y;
};

// 绘制
const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getPointerPosition(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastX = coords.x;
    lastY = coords.y;
};

// 停止绘制
const stopDrawing = () => {
    isDrawing = false;
};

// 处理触摸开始事件
const handleTouchStart = (e) => {
    startDrawing(e);
};

// 处理触摸移动事件
const handleTouchMove = (e) => {
    draw(e);
};

// 获取指针位置（鼠标或触摸）
const getPointerPosition = (e) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const scaleX = canvasRef.value.width / rect.width;
    const scaleY = canvasRef.value.height / rect.height;

    if (e.type.startsWith('touch')) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    } else {
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
};

// 清除画布
const clearCanvas = () => {
    if (ctx && canvasRef.value) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
        hasSignature.value = false;
    }
};

// 保存签名
const saveSignature = () => {
    if (!hasSignature.value) return;
    const dataUrl = canvasRef.value.toDataURL();
    emit('save', {
        fieldName: props.fieldName,
        value: dataUrl
    });
    open.value = false;
};

// 取消签名
const handleCancel = () => {
    open.value = false;
};

// 组件挂载时初始化
onMounted(() => {
    // 处理窗口大小变化
    window.addEventListener('resize', initCanvas);

    return () => {
        window.removeEventListener('resize', initCanvas);
    };
});
</script>