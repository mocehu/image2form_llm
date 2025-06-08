import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 定义模型接口
interface Model {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type?: string;
}

// 定义模型分组接口
interface PredefinedModels {
  [key: string]: Model[];
}

export const useModelStore = defineStore('model', () => {
  // State
  const selectedModel = ref<string>('doubao-1-5-vision-pro-32k-250115');
  const customModels = ref<Model[]>([]);
  
  // Predefined models
  const predefinedModels: PredefinedModels = {
    '豆包视觉语言模型': [
      {
        id: 'doubao-1-5-vision-pro-32k-250115',
        name: 'doubao-1.5-vision-pro-32k-250115',
        description: '推荐模型',
        icon: 'VP'
      },
      {
        id: 'doubao-1.5-vision-pro-250328',
        name: 'doubao-1.5-vision-pro-250328',
        description: '推荐模型',
        icon: 'VP'
      },
      {
        id: 'doubao-1.5-vision-lite-250315',
        name: 'doubao-1.5-vision-lite-250315',
        icon: 'VL'
      },
      {
        id: 'doubao-vision-lite-32k-241015',
        name: 'doubao-vision-lite-32k-241015',
        icon: 'VL'
      },
      {
        id: 'doubao-vision-pro-32k-241028',
        name: 'doubao-vision-pro-32k-241028',
        icon: 'VP'
      }
    ],
    '豆包多模态深度思考模型': [
      {
        id: 'doubao-1-5-thinking-vision-pro-250428',
        name: 'doubao-1-5-thinking-vision-pro-250428',
        icon: 'TP',
        type: 'thinking'
      },
      {
        id: "doubao-1-5-thinking-pro-m-250428",
        name: "doubao-1-5-thinking-pro-m-250428",
        icon: "TP",
        type: 'thinking'
      }
    ]
  };
  
  // Initialize custom models from localStorage
  const initCustomModels = (): void => {
    const savedModels = localStorage.getItem('customModels');
    if (savedModels) {
      try {
        customModels.value = JSON.parse(savedModels);
      } catch (e) {
        console.error('Failed to parse custom models:', e);
      }
    }
  };
  
  // Save custom models to localStorage
  const saveCustomModels = (): void => {
    localStorage.setItem('customModels', JSON.stringify(customModels.value));
  };
  
  // Add a new custom model
  const addCustomModel = (model: Model): string => {
    if (!model.id) {
      model.id = 'custom_' + Date.now();
    }
    customModels.value.push(model);
    saveCustomModels();
    return model.id;
  };
  
  // Update an existing custom model
  const updateCustomModel = (index: number, model: Model): boolean => {
    if (index >= 0 && index < customModels.value.length) {
      customModels.value[index] = { ...model };
      saveCustomModels();
      return true;
    }
    return false;
  };
  
  // Delete a custom model
  const deleteCustomModel = (index: number): boolean => {
    if (index >= 0 && index < customModels.value.length) {
      const modelId = customModels.value[index].id;
      customModels.value.splice(index, 1);
      saveCustomModels();
      
      // If current model is deleted, switch to default
      if (selectedModel.value === modelId) {
        selectedModel.value = 'doubao-1-5-vision-pro-32k-250115';
      }
      
      return true;
    }
    return false;
  };
  
  // Set the selected model
  const setSelectedModel = (modelId: string): void => {
    selectedModel.value = modelId;
  };
  
  // Get all models (predefined + custom)
  const allModels = computed((): Model[] => {
    const models: Model[] = [];
    
    // Add predefined models
    Object.keys(predefinedModels).forEach(group => {
      predefinedModels[group].forEach(model => {
        models.push(model);
      });
    });
    
    // Add custom models
    customModels.value.forEach(model => {
      models.push(model);
    });
    
    return models;
  });
  
  // Get all vision models
  const visionModels = computed((): Model[] => {
    return predefinedModels['豆包视觉语言模型'] || [];
  });
  
  // Get all thinking models
  const thinkingModels = computed((): Model[] => {
    return predefinedModels['豆包多模态深度思考模型'] || [];
  });
  
  // Get model name by id
  const getModelName = (modelId: string): string => {
    const model = allModels.value.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };
  
  // Get model icon by id
  const getModelIcon = (modelId: string): string => {
    const model = allModels.value.find(m => m.id === modelId);
    return model ? model.icon || 'C' : 'C';
  };
  
  // Check if model is a thinking model by id
  const isModelThinking = (modelId: string): boolean => {
    const model = allModels.value.find(m => m.id === modelId);
    return !!(model && model.type === 'thinking');
  };
  
  // Check if the selected model is a thinking model
  const isSelectedModelThinking = computed((): boolean => {
    // Find the selected model in all models
    const model = allModels.value.find(m => m.id === selectedModel.value);
    return !!(model && model.type === 'thinking');
  });
  
  // Get selected model name
  const selectedModelName = computed((): string => {
    const model = allModels.value.find(m => m.id === selectedModel.value);
    return model ? model.name : selectedModel.value;
  });
  
  // Get selected model icon
  const selectedModelIcon = computed((): string => {
    const model = allModels.value.find(m => m.id === selectedModel.value);
    return model ? model.icon || 'C' : 'C';
  });
  
  // Initialize custom models on store creation
  initCustomModels();
  
  return {
    selectedModel,
    customModels,
    predefinedModels,
    visionModels,
    thinkingModels,
    isSelectedModelThinking,
    selectedModelName,
    selectedModelIcon,
    setSelectedModel,
    addCustomModel,
    updateCustomModel,
    deleteCustomModel,
    initCustomModels,
    getModelName,
    getModelIcon,
    isModelThinking
  };
}); 