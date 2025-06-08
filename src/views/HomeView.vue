<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import FeatureGrid from '@/components/common/FeatureGrid.vue';
import ApiConfigPanel from '@/components/config/ApiConfigPanel.vue';
import ImageUploader from '@/components/form/ImageUploader.vue';
import ProcessingPanel from '@/components/processing/ProcessingPanel.vue';
import FormResultPanel from '@/components/form/FormResultPanel.vue';
import FooterSection from '@/components/common/FooterSection.vue';

import { useApiConfig } from '@/composables/useApiConfig';
import { useFormRecognition } from '@/composables/useFormRecognition';

// API配置管理
const { apiConfig, apiError, apiSuccess, testingApi, testApiConnection, saveApiConfig, clearSuccessMessage } = useApiConfig();

// 表单识别管理
const {
  imageUrl,
  formData,
  formModel,
  loading,
  progress,
  progressStage,
  statusMessage,
  responseStream,
  isProcessingResponse,
  autoScroll,
  handleFileUpload,
  handleDrop,
  recognizeForm,
  resetForm,
  useTestData,
  clearResponseStream,
  toggleAutoScroll,
  successMessage
} = useFormRecognition();

// 启动表单识别
const startRecognition = async () => {
  const result = await recognizeForm(apiConfig);
  if (result.error) {
    // 处理错误
    console.error(result.error);
  } else if (result.success) {
    // 设置成功消息
    successMessage.value = '表单识别成功！';
    clearSuccessMessage(3000);
  }
};

// 处理图片上传
const handleImageUpload = (file: File) => {
  const result = handleFileUpload(file);
  if (result.error) {
    // 处理错误
    console.error(result.error);
  } else if (result.success) {
    // 设置成功消息
    successMessage.value = '图片上传成功！';
    clearSuccessMessage(3000);
  }
};

// 控制面板的展开/收起状态
const configCollapsed = ref(false);
const toggleConfigPanel = () => {
  configCollapsed.value = !configCollapsed.value;
};

// 处理API测试连接
const handleTestConnection = async () => {
  const success = await testApiConnection();
  if (success) {
    clearSuccessMessage(3000); // 3秒后清除成功提示
  }
};

// 处理保存配置
const handleSaveConfig = () => {
  const success = saveApiConfig();
  if (success) {
    clearSuccessMessage(3000); // 3秒后清除成功提示
  }
};

// 处理使用测试数据
const handleUseTestData = () => {
  useTestData();
  successMessage.value = '测试数据加载成功！';
  clearSuccessMessage(3000);
};

// 处理重置表单
const handleResetForm = () => {
  resetForm();
  successMessage.value = '表单已成功重置！';
  clearSuccessMessage(3000);
};

// 处理拖拽上传
const handleDropEvent = (e: DragEvent) => {
  const result = handleDrop(e);
  if (result && result.success) {
    // 设置成功消息
    successMessage.value = '图片上传成功！';
    clearSuccessMessage(3000);
  } else if (result && result.error) {
    // 处理错误
    console.error(result.error);
  }
};
</script>

<template>
  <div class="home-view">
    <PageHeader title="Image2Form AI✨" description="上传表单图片，多模态大模型将自动识别表单结构并返回结果渲染为可交互的Ant Design表单组件，支持流式API和自定义模型配置" />

    <div class="content-container scale-in">
      <FeatureGrid />

      <ApiConfigPanel :api-config="apiConfig" :api-error="apiError" :api-success="apiSuccess" :testing-api="testingApi"
        :is-collapsed="configCollapsed" @toggle="toggleConfigPanel" @test-connection="handleTestConnection"
        @save="handleSaveConfig" />

      <ImageUploader :image-url="imageUrl" :loading="loading" :success-message="successMessage"
        @recognize="startRecognition" @use-test-data="handleUseTestData" @reset="handleResetForm"
        @upload="handleImageUpload" @drop="handleDropEvent" />

      <ProcessingPanel :loading="loading" :progress="progress" :progress-stage="progressStage"
        :status-message="statusMessage" :response-stream="responseStream" :form-data="formData"
        :is-processing-response="isProcessingResponse" v-model:auto-scroll="autoScroll"
        @clear-response-stream="clearResponseStream" />

      <FormResultPanel v-if="formData" :form-data="formData" />

      <FooterSection />
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.content-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
}

@media (max-width: 768px) {
  .content-container {
    padding: 0 1rem 1rem;
    gap: 1.5rem;
  }
}
</style>
