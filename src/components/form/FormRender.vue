<template>
  <div class="form-render">
    <a-form layout="vertical" :model="formValues">
      <div class="form-body">
        <!-- 处理旧版分组结构 -->
        <template v-if="formData.groups && formData.groups.length">
          <template v-for="(group, groupIndex) in formData.groups" :key="groupIndex">
            <div class="form-group">
              <div class="group-title">{{ group.title || `分组 ${groupIndex + 1}` }}</div>
              <div class="group-fields">
                <template v-for="(field, fieldIndex) in group.fields" :key="`${groupIndex}-${fieldIndex}`">
                  <FormField :field="field" :form-values="formValues" @start-signature="startSignature"
                    @clear-signature="clearSignature" />
                </template>
              </div>
            </div>
          </template>
        </template>

        <!-- 处理新版表单结构，支持字段中的type=group类型 -->
        <template v-if="formData.fields && formData.fields.length">
          <!-- 普通独立字段 -->
          <template v-for="(field, index) in nonGroupFields" :key="`field-${index}`">
            <FormField :field="field" :form-values="formValues" @start-signature="startSignature"
              @clear-signature="clearSignature" />
          </template>

          <!-- 处理group类型字段 -->
          <template v-for="(group, groupIndex) in groupFields" :key="`group-${groupIndex}`">
            <div class="form-group">
              <div class="group-title">{{ group.label || `分组 ${groupIndex + 1}` }}</div>
              <div class="group-fields">
                <template v-for="(field, fieldIndex) in group.fields" :key="`${group.name}-${fieldIndex}`">
                  <FormField :field="field" :form-values="formValues" @start-signature="startSignature"
                    @clear-signature="clearSignature" />
                </template>
              </div>
            </div>
          </template>
        </template>
      </div>
    </a-form>

    <!-- 签名对话框 -->
    <SignatureDialog v-model:open="signatureDialogVisible" :field-name="currentSignatureField"
      :field-label="getFieldLabel(currentSignatureField)" :initial-value="formValues[currentSignatureField]"
      @save="handleSignatureSave" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import SignatureDialog from './SignatureDialog.vue';
import FormField from './FormField.vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  }
});

// 表单数据存储
const formValues = reactive({});

// 签名对话框控制
const signatureDialogVisible = ref(false);
const currentSignatureField = ref('');

// 分离出普通字段和分组字段
const groupFields = computed(() => {
  if (!props.formData.fields) return [];
  return props.formData.fields.filter(field => field.type === 'group');
});

const nonGroupFields = computed(() => {
  if (!props.formData.fields) return [];
  return props.formData.fields.filter(field => field.type !== 'group');
});

// 初始化表单数据
const initFormValues = () => {
  // 清空现有数据
  Object.keys(formValues).forEach(key => {
    delete formValues[key];
  });

  // 初始化旧版分组中的字段
  if (props.formData.groups) {
    props.formData.groups.forEach(group => {
      if (group.fields) {
        initFieldValues(group.fields);
      }
    });
  }

  // 初始化新版表单字段
  if (props.formData.fields) {
    // 初始化普通字段
    initFieldValues(nonGroupFields.value);

    // 初始化分组字段
    groupFields.value.forEach(group => {
      if (group.fields) {
        initFieldValues(group.fields);
      }
    });
  }
};

// 初始化字段值
const initFieldValues = (fields) => {
  fields.forEach(field => {
    if (field.type === 'checkbox') {
      formValues[field.name] = false;
    } else if (field.type === 'number') {
      formValues[field.name] = field.min || 0;
    } else {
      formValues[field.name] = '';
    }
  });
};

// 签名功能实现
const startSignature = (fieldName) => {
  currentSignatureField.value = fieldName;
  signatureDialogVisible.value = true;
};

// 处理签名保存
const handleSignatureSave = (data) => {
  if (data && data.fieldName && data.value) {
    formValues[data.fieldName] = data.value;
  }
};

// 清除签名
const clearSignature = (fieldName) => {
  if (fieldName && formValues[fieldName]) {
    formValues[fieldName] = '';
    message.success('签名已清除');
  }
};

// 监听formData变化重新初始化
watch(() => props.formData, () => {
  initFormValues();
}, { deep: true });

// 组件挂载时初始化表单
onMounted(() => {
  initFormValues();
});

// 获取字段的标签
const getFieldLabel = (fieldName) => {
  let label = '签名';

  // 在旧版分组中查找
  if (props.formData.groups) {
    props.formData.groups.forEach(group => {
      if (group.fields) {
        const field = group.fields.find(f => f.name === fieldName);
        if (field) {
          label = field.label;
        }
      }
    });
  }

  // 在新版字段中查找
  if (props.formData.fields) {
    // 在普通字段中查找
    const field = nonGroupFields.value.find(f => f.name === fieldName);
    if (field) {
      label = field.label;
    }

    // 在分组字段中查找
    groupFields.value.forEach(group => {
      if (group.fields) {
        const field = group.fields.find(f => f.name === fieldName);
        if (field) {
          label = field.label;
        }
      }
    });
  }

  return label;
};
</script>

<style scoped>
.form-render {
  width: 100%;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  background: rgba(var(--vp-primary-rgb), 0.05);
  border-radius: var(--vp-radius-md);
  padding: 1.25rem;
  border: 1px solid var(--vp-border);
}

.group-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-text);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--vp-border);
}

.group-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-group {
    padding: 1rem;
  }

  .group-title {
    font-size: 1rem;
  }
}
</style>