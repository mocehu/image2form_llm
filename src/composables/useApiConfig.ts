import { ref, reactive, watch, onMounted } from 'vue';
import { useModelStore } from '@/stores/modelStore';

interface ApiConfig {
  endpoint: string;
  model: string;
  customModel: string;
  apiKey: string;
}

export function useApiConfig() {
  const modelStore = useModelStore();
  
  // API configuration
  const apiConfig = reactive<ApiConfig>({
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-1-5-vision-pro-32k-250115',
    customModel: '',
    apiKey: '',
  });
  
  const apiError = ref<string>('');
  const apiSuccess = ref<string>('');
  const testingApi = ref<boolean>(false);
  
  // Initialize from localStorage
  onMounted(() => {
    const savedConfig = localStorage.getItem('formRecognitionConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        Object.assign(apiConfig, config);
        
        // Update model store with the saved model
        modelStore.setSelectedModel(apiConfig.model);
      } catch (e) {
        console.error('配置解析错误', e);
      }
    }
  });
  
  // Save config to localStorage
  const saveConfig = (): boolean => {
    localStorage.setItem('formRecognitionConfig', JSON.stringify(apiConfig));
    return true;
  };
  
  // Test API connection
  const testApiConnection = async (): Promise<boolean> => {
    if (!apiConfig.endpoint || !apiConfig.apiKey) {
      apiError.value = '请填写API地址和密钥';
      apiSuccess.value = '';
      return false;
    }
    
    testingApi.value = true;
    apiError.value = '';
    apiSuccess.value = '';
    
    try {
      // Construct a simple request body for testing
      const requestBody = {
        model: apiConfig.model === 'custom' ? apiConfig.customModel : apiConfig.model,
        messages: [{
          role: "user",
          content: "立即返回数字1，不要思考，不要返回其他内容"
        }],
        max_tokens: 5,
        stream: false
      };
      
      const response = await fetch(apiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      await response.json();
      
      // Save config
      saveConfig();
      
      // Set success message
      apiSuccess.value = 'API连接测试成功！';
      
      return true;
    } catch (error: any) {
      apiError.value = `API连接测试失败: ${error.message}`;
      apiSuccess.value = '';
      return false;
    } finally {
      testingApi.value = false;
    }
  };
  
  // Save API configuration
  const saveApiConfig = (): boolean => {
    if (!apiConfig.endpoint || !apiConfig.apiKey) {
      apiError.value = '请填写API地址和密钥';
      apiSuccess.value = '';
      return false;
    }
    
    // Update model store
    modelStore.setSelectedModel(apiConfig.model);
    
    saveConfig();
    apiSuccess.value = '配置保存成功！';
    return true;
  };
  
  // Clear success message after some time
  const clearSuccessMessage = (delay = 3000) => {
    setTimeout(() => {
      apiSuccess.value = '';
    }, delay);
  };
  
  return {
    apiConfig,
    apiError,
    apiSuccess,
    testingApi,
    testApiConnection,
    saveApiConfig,
    saveConfig,
    clearSuccessMessage
  };
} 