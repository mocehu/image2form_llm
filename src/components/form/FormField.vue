<template>
    <!-- 文本输入框 -->
    <a-form-item v-if="field.type === 'text'" :label="field.label" :required="field.required">
        <a-input v-model:value="formValues[field.name]" :placeholder="field.placeholder || '请输入'" />
    </a-form-item>

    <!-- 多行文本框 -->
    <a-form-item v-else-if="field.type === 'textarea'" :label="field.label" :required="field.required">
        <a-textarea v-model:value="formValues[field.name]" :placeholder="field.placeholder || '请输入'"
            :rows="field.rows || 4" />
    </a-form-item>

    <!-- 数字输入框 -->
    <a-form-item v-else-if="field.type === 'number'" :label="field.label" :required="field.required">
        <a-input-number v-model:value="formValues[field.name]" :placeholder="field.placeholder || '请输入数字'"
            :min="field.min" :max="field.max" style="width: 100%" />
    </a-form-item>

    <!-- 日期选择器 -->
    <a-form-item v-else-if="field.type === 'date'" :label="field.label" :required="field.required">
        <a-date-picker v-model:value="formValues[field.name]" style="width: 100%" />
    </a-form-item>

    <!-- 复选框 -->
    <a-form-item v-else-if="field.type === 'checkbox'" :required="field.required">
        <a-checkbox v-model:checked="formValues[field.name]">{{ field.label }}</a-checkbox>
    </a-form-item>

    <!-- 单选框组 -->
    <a-form-item v-else-if="field.type === 'radio'" :label="field.label" :required="field.required">
        <a-radio-group v-model:value="formValues[field.name]">
            <a-radio v-for="(option, optionIndex) in field.options" :key="optionIndex" :value="option.value">
                {{ option.label }}
            </a-radio>
        </a-radio-group>
    </a-form-item>

    <!-- 下拉选择框 -->
    <a-form-item v-else-if="field.type === 'select'" :label="field.label" :required="field.required">
        <a-select v-model:value="formValues[field.name]" :placeholder="field.placeholder || '请选择'">
            <a-select-option v-for="(option, optionIndex) in field.options" :key="optionIndex" :value="option.value">
                {{ option.label }}
            </a-select-option>
        </a-select>
    </a-form-item>

    <!-- 签名区域 -->
    <a-form-item v-else-if="field.type === 'signature'" :label="field.label" :required="field.required">
        <a-card class="signature-card" :bodyStyle="{ padding: '8px' }" size="small" :bordered="true">
            <template v-if="!formValues[field.name]">
                <div class="empty-signature" @click="startSignature(field.name)">
                    <a-empty image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        :image-style="{ height: '60px' }" description="点击添加签名">
                        <a-button type="primary">
                            <template #icon><edit-outlined /></template>
                            添加签名
                        </a-button>
                    </a-empty>
                </div>
            </template>
            <template v-else>
                <div class="signature-preview">
                    <div class="preview-image">
                        <img :src="formValues[field.name]" alt="签名" />
                    </div>
                    <div class="signature-actions">
                        <a-space>
                            <a-button type="primary" @click="startSignature(field.name)">
                                <template #icon><edit-outlined /></template>
                                修改
                            </a-button>
                            <a-button danger @click="clearSignature(field.name)">
                                <template #icon><delete-outlined /></template>
                                清除
                            </a-button>
                        </a-space>
                    </div>
                </div>
            </template>
        </a-card>
    </a-form-item>

    <!-- 默认文本显示 -->
    <a-form-item v-else :label="field.label" :required="field.required">
        <a-input :placeholder="'未识别的字段类型: ' + field.type" disabled />
    </a-form-item>
</template>

<script setup>
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    formValues: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['start-signature', 'clear-signature']);

const startSignature = (fieldName) => {
    emit('start-signature', fieldName);
};

const clearSignature = (fieldName) => {
    emit('clear-signature', fieldName);
};
</script>

<style scoped>
.signature-card {
    border-radius: var(--vp-radius-sm);
    background-color: var(--vp-card-bg);
    border: 1px solid var(--vp-border);
}

.empty-signature {
    cursor: pointer;
    padding: 16px 0;
    transition: all 0.3s;
}

.empty-signature:hover {
    background-color: rgba(var(--vp-primary-rgb), 0.05);
}

.signature-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
}

.preview-image {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 8px;
    background-color: var(--vp-input-bg);
    border: 1px solid var(--vp-border);
    border-radius: var(--vp-radius-sm);
}

.preview-image img {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
}

.signature-actions {
    margin-top: 8px;
}

:root {
    --vp-image-brightness: 1;
}

[data-theme='dark'] {
    --vp-image-brightness: 0.8;
}
</style>