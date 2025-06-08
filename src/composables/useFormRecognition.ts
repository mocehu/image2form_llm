import { ref, reactive, computed } from 'vue';
import { useModelStore } from '@/stores/modelStore';

// 定义表单字段接口
interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  pattern?: string;
  options?: Array<{ value: string, label: string }>;
  fields?: FormField[];
  rows?: number;
}

// 定义表单数据接口
interface FormData {
  title?: string;
  formTitle?: string;
  groups?: Array<{
    title: string;
    fields: FormField[];
  }>;
  fields?: FormField[];
}

// 定义响应数据接口
interface ApiResponse {
  choices?: Array<{
    delta: {
      content?: string;
      reasoning_content?: string;
    }
  }>;
}

// 定义思考块接口
interface ThinkingBlock {
  type: 'thinking';
  content: string;
}

// 定义结果接口
interface RecognizeResult {
  success?: boolean;
  error?: string;
  data?: FormData;
}

export function useFormRecognition() {
  const modelStore = useModelStore();

  // Form recognition state
  const imageUrl = ref<string>('');
  const formData = ref<FormData | null>(null);
  const formModel = reactive<Record<string, any>>({});
  const loading = ref<boolean>(false);
  const progress = ref<number>(0);
  const progressStage = ref<number>(0);
  const statusMessage = ref<string>('等待上传图片');
  const responseStream = ref<Array<string | ThinkingBlock>>([]);
  const isProcessingResponse = ref<boolean>(false);
  const autoScroll = ref<boolean>(true);
  const successMessage = ref<string>('');

  // System prompt for form recognition
  const systemPrompt = `当处理**任意表格**时，需自动识别「申请报告/意见/审批类功能区块」（依据**标题含"申请报告"意见"审批"说明"**等关键词，或**合并单元格形成的大区块结构**），并按以下规则为每个识别到的区块**新增"核心意见内容"多行文本域**，确保线上填写流程与纸质表"先填大区块意见、后填细分项"的逻辑一致：  


### 一、分组识别规则（模型自动判断）  
扫描表格所有功能分区，满足以下任一条件即判定为「意见类分组」：  
1. 区块标题（合并单元格文字）包含 **"申请报告""意见""审批""说明""论证""依据"** 等关键词；  
2. 区块内存在"需详细阐述/说明/论证"的填写指引（如"可另附页""需写清依据"）。  


### 二、新增字段标准（强制模板化配置）  
对每个识别到的「意见类分组」，**在分组内\`fields\`数组最顶部新增1个多行文本域**，字段属性需严格遵循：  

| 配置项       | 取值规则（场景自适应）                                                                 |  
|--------------|----------------------------------------------------------------------------------------|  
| \`name\`       | 驼峰命名，由「分组核心关键词 + Opinion」组成<br>（例：申请报告→\`reportOpinion\`；教学办意见→\`officeOpinion\`） |  
| \`label\`      | 由「分组标题 + 意见内容」组成<br>（例：申请报告→\`申请报告意见内容\`；教学办意见→\`教学办意见内容\`）             |  
| \`type\`       | 字段类型：单行文本→text，纯数字→number并添加min/max，多选勾选
| \`label\`      | 由「分组标题 + 意见内容」组成<br>（例：申请报告→\`申请报告意见内容\`；教学办意见→\`教学办意见内容\`）             |  
| \`type\`       | 字段类型：单行文本→text，纯数字→number并添加min/max，多选勾选→checkbox，多行文本→textarea，日期→date，电子签章→signature。                                                        |  
| \`required\`   | 若分组属「申请/审批核心环节」→\`true\`；若属「辅助说明」→\`false\`（默认\`true\`，除非表格明确标记"选填"）         |  
| \`rows\`       | 核心申请类分组（如"申请报告"）→\`4\`（承载详细内容）；<br>审批/意见类分组→\`3\`（承载结论）；<br>通用类→\`3\`        |  
| \`placeholder\`| 引导语需包含「详细阐述/填写意见/说明依据/含理由」等场景化描述<br>（例：申请报告→\`请详细阐述申请核心内容、预算逻辑\`；<br>教学办→\`请填写审批意见（含同意/调整/驳回理由）\`） |  


### 三、位置与结构规则  
1. **新增字段位置**：需插入到分组的\`fields\`数组**最顶部**，原有字段（如"课程名称"批准金额"）依次后移，保证"先填大区块意见、后填细分项"的填写顺序；  
2. **原有逻辑保留**：其他字段的\`type\`/\`required\`/\`pattern\`/\`placeholder\`等配置**保持不变**，仅新增该多行文本域；  
3. **多分组兼容**：若表格含多个「意见类分组」（如"申请报告"+教学办意见"+学院意见"），需**对每个分组单独执行新增逻辑**，互不干扰。  


### 四、输出约束（JSON语法+示例参考）  
输出需为**合法JSON**，新增字段需嵌套在对应\`group\`的\`fields\`数组内。以「学校课程教学活动经费申请表」为例，增强后关键部分参考：  

\`\`\`json
{
  "formTitle": "学校课程教学活动经费申请表",
  "fields": [
    // ... 其他字段 ...
    {
      "name": "applicationReport",
      "label": "申请报告内容",
      "type": "group",
      "fields": [
        {
          "name": "reportOpinion",
          "label": "申请报告意见内容",
          "type": "textarea",
          "required": true,
          "rows": 4,
          "placeholder": "请详细阐述申请报告的核心内容、预算科目划分及测算依据"
        },
        { "name": "courseName", "label": "课程名称", "type": "text", "required": true },
        { "name": "teacher", "label": "授课教师", "type": "text", "required": true },
        // ... 原有字段依次后移 ...
      ]
    },
    {
      "name": "teachingOfficeOpinion",
      "label": "教学办意见",
      "type": "group",
      "fields": [
        {
          "name": "officeOpinion",
          "label": "教学办意见内容",
          "type": "textarea",
          "required": true,
          "rows": 3,
          "placeholder": "请填写教学办对经费申请的审批意见（含同意/调整/驳回理由）"
        },
        { "name": "approvedAmount", "label": "批准金额", "type": "number", "required": true },
        // ... 原有字段依次后移 ...
      ]
    },
    // ... 其他字段 ...
  ]
}
\`\`\`  


### 五、通用性覆盖场景  
对**任意表格**（如项目审批表、活动申请表、报销单、科研立项表等），需自动完成：  
1. 精准识别所有「意见类分组」（基于标题关键词+结构特征）；  
2. 为每个分组生成符合场景的"核心意见文本域"（命名、\`rows\`、\`placeholder\`随分组类型自适应）；  
3. 保证新增字段位置、交互属性与表格整体逻辑无缝融合，前端渲染后完全还原纸质表体验。`;

  // Test data for development
  const testFormData: FormData = {
    "formTitle": "中南财经政法大学场地使用申报表",
    "fields": [
      {
        "name": "applyDate",
        "label": "申报时间",
        "type": "date"
      },
      {
        "name": "applyUnit",
        "label": "申请单位",
        "type": "text",
        "required": true
      },
      {
        "name": "principal",
        "label": "负责人",
        "type": "text",
        "required": true
      },
      {
        "name": "contactPhone",
        "label": "联系电话",
        "type": "text",
        "required": true
      },
      {
        "name": "activityName",
        "label": "活动名称",
        "type": "text",
        "required": true
      },
      {
        "name": "applyVenue",
        "label": "申请场地",
        "type": "text",
        "required": true
      },
      {
        "name": "useTime",
        "label": "使用时间",
        "type": "date",
        "required": true
      },
      {
        "name": "waterElectricDemand",
        "label": "水电需求（勾选）",
        "type": "group",
        "fields": [
          {
            "name": "electricity",
            "label": "电",
            "type": "checkbox"
          },
          {
            "name": "water",
            "label": "水",
            "type": "checkbox"
          },
          {
            "name": "otherRequirements",
            "label": "其它要求",
            "type": "text"
          }
        ]
      },
      {
        "name": "applyReasonAndYouthLeagueCommitteeOpinion",
        "label": "申请事由及分团委意见",
        "type": "group",
        "fields": [
          {
            "name": "reasonOpinion",
            "label": "申请事由及分团委意见内容",
            "type": "textarea",
            "required": true,
            "rows": 4,
            "placeholder": "请详细阐述申请事由及分团委意见、含活动必要性等理由"
          },
          {
            "name": "youthLeagueCommitteePrincipalSignature",
            "label": "负责人签字",
            "type": "text"
          },
          {
            "name": "youthLeagueCommitteeSeal",
            "label": "(分团委盖章)",
            "type": "signature"
          },
          {
            "name": "youthLeagueCommitteeSignatureDate",
            "label": "签字日期",
            "type": "date"
          }
        ]
      },
      {
        "name": "schoolYouthLeagueCommitteeApprovalOpinion",
        "label": "校团委审批意见",
        "type": "group",
        "fields": [
          {
            "name": "schoolYouthLeagueCommitteeOpinion",
            "label": "校团委审批意见内容",
            "type": "textarea",
            "required": true,
            "rows": 3,
            "placeholder": "请填写校团委对场地申请的审批意见（含同意/调整/驳回理由）"
          },
          {
            "name": "schoolYouthLeagueCommitteePrincipalSignature",
            "label": "负责人签字（盖章）",
            "type": "signature"
          },
          {
            "name": "schoolYouthLeagueCommitteeSignatureDate",
            "label": "签字日期",
            "type": "date"
          }
        ]
      },
      {
        "name": "securityDepartmentApprovalOpinion",
        "label": "保卫处审批意见",
        "type": "group",
        "fields": [
          {
            "name": "securityDepartmentOpinion",
            "label": "保卫处审批意见内容",
            "type": "textarea",
            "required": true,
            "rows": 3,
            "placeholder": "请填写保卫处对场地申请的审批意见（含同意/调整/驳回理由）"
          },
          {
            "name": "securityDepartmentPrincipalSignature",
            "label": "负责人签字（盖章）",
            "type": "signature"
          },
          {
            "name": "securityDepartmentSignatureDate",
            "label": "签字日期",
            "type": "date"
          }
        ]
      },
      {
        "name": "logisticsSupportDepartmentApprovalOpinion",
        "label": "后勤保障部审批意见(选填)",
        "type": "group",
        "fields": [
          {
            "name": "logisticsDepartmentOpinion",
            "label": "后勤保障部审批意见内容",
            "type": "textarea",
            "required": false,
            "rows": 3,
            "placeholder": "请填写后勤保障部对场地申请的审批意见（含同意/调整/驳回理由）"
          },
          {
            "name": "logisticsDepartmentPrincipalSignature",
            "label": "负责人签字（盖章）",
            "type": "signature"
          },
          {
            "name": "logisticsDepartmentSignatureDate",
            "label": "签字日期",
            "type": "date"
          }
        ]
      }
    ]
  };

  // Initialize form model
  const initFormModel = (fields: FormField[] | undefined): void => {
    if (!fields) return;

    fields.forEach(field => {
      if (field.type === 'group' && Array.isArray(field.fields)) {
        // Process group fields
        initFormModel(field.fields);
      } else {
        // Initialize individual field
        if (field.type === 'checkbox') {
          formModel[field.name] = false;
        } else if (field.type === 'number') {
          formModel[field.name] = field.min || 0;
        } else {
          formModel[field.name] = '';
        }
      }
    });
  };

  // Reset form
  const resetForm = (): void => {
    imageUrl.value = '';
    formData.value = null;

    // Clear form model
    Object.keys(formModel).forEach(key => {
      delete formModel[key];
    });

    responseStream.value = [];
    statusMessage.value = '表单数据已重置';
    // 不在此处设置成功消息，交由调用方处理
  };

  // Use test data for development
  const useTestData = (): void => {
    formData.value = testFormData;

    // 初始化模型数据
    if (testFormData.groups) {
      testFormData.groups.forEach(group => {
        if (group.fields) {
          initFormModel(group.fields);
        }
      });
    }

    if (testFormData.fields) {
      initFormModel(testFormData.fields);
    }

    responseStream.value = ['> 使用测试数据初始化表单...'];
    statusMessage.value = '测试数据加载完成';
    // 不在此处设置成功消息，交由调用方处理
  };

  // Handle file upload
  const handleFileUpload = (file: File): { success?: boolean, error?: string } => {
    if (!file) return { error: '未选择文件' };

    // Validate file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      return { error: '只支持 JPG 或 PNG 格式的图片' };
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      return { error: '图片大小不能超过 5MB' };
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && event.target.result) {
        imageUrl.value = event.target.result as string;
        // 不在此处设置成功消息，交由调用方处理
      }
    };
    reader.readAsDataURL(file);

    return { success: true };
  };

  // Handle drop upload
  const handleDrop = (e: DragEvent): { success?: boolean, error?: string } | false => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        return handleFileUpload(file);
      }
    }
    return false;
  };

  // Recognize form from image
  const recognizeForm = async (apiConfig: { endpoint: string, apiKey: string, model: string, customModel: string }): Promise<RecognizeResult> => {
    if (!apiConfig.endpoint || !apiConfig.apiKey) {
      return { error: '请填写API地址和密钥' };
    }

    if (!imageUrl.value) {
      return { error: '请先上传图片' };
    }

    loading.value = true;
    progress.value = 0;
    progressStage.value = 0;
    statusMessage.value = '正在初始化...';
    responseStream.value = [];
    formData.value = null;
    isProcessingResponse.value = false;

    // Get image base64 data
    const base64Data = imageUrl.value.split(',')[1];

    // Check if current model is a thinking model
    const isThinkingModel = modelStore.isSelectedModelThinking;

    // Construct request body
    const requestBody = {
      model: apiConfig.model === 'custom' ? apiConfig.customModel : apiConfig.model,
      messages: [{
        role: "system",
        content: systemPrompt
      }, {
        role: "user",
        content: [{
          type: "text",
          text: "分析图片中的表单结构，并按上述规范生成JSON"
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64Data}` }
        }]
      }],
      stream: true
    };

    // Progress related variables
    let progressIncrementTimer: number | null = null;
    let lastProgressUpdate = Date.now();
    let thinkingCount = 0;

    // Update progress function
    const updateProgress = (stage: number, forceValue: number | null = null): void => {
      progressStage.value = stage;
      const now = Date.now();

      // Set progress range based on stage
      let minProgress = 0;
      let maxProgress = 100;

      switch (stage) {
        case 0: // Initialization
          minProgress = 0;
          maxProgress = 5;
          statusMessage.value = '正在初始化...';
          break;
        case 1: // Connecting
          minProgress = 5;
          maxProgress = 15;
          statusMessage.value = '正在连接API...';
          break;
        case 2: // Receiving data
          minProgress = 15;
          maxProgress = isThinkingModel ? 75 : 85;
          statusMessage.value = isThinkingModel ? '思考分析中...' : '接收数据中...';
          break;
        case 3: // Processing data
          minProgress = isThinkingModel ? 75 : 85;
          maxProgress = 95;
          statusMessage.value = '解析表单结构...';
          break;
        case 4: // Complete
          minProgress = 95;
          maxProgress = 100;
          statusMessage.value = '任务完成';
          break;
        default:
          // 默认值，确保变量总是被赋值
          minProgress = 0;
          maxProgress = 100;
          statusMessage.value = '处理中...';
          break;
      }

      // If there's a forced value, set it directly
      if (forceValue !== null) {
        progress.value = forceValue;
        return;
      }

      // If in thinking stage, adjust progress based on thinking count
      if (stage === 2 && isThinkingModel && thinkingCount > 0) {
        const thinkingProgress = Math.min(15 + thinkingCount * 3, 60);
        progress.value = thinkingProgress;
        return;
      }

      // Calculate progress for current stage
      const timeDiff = now - lastProgressUpdate;
      if (timeDiff > 300) {
        const increment = Math.min(1, (maxProgress - progress.value) * 0.1);
        if (progress.value < maxProgress) {
          progress.value = Math.min(progress.value + increment, maxProgress);
        }
        lastProgressUpdate = now;
      }
    };

    // Start progress update timer
    progressIncrementTimer = window.setInterval(() => {
      updateProgress(progressStage.value);
    }, 300);

    // Initial stage
    updateProgress(0);

    try {
      // Connection stage
      updateProgress(1);
      statusMessage.value = '发送API请求...';
      responseStream.value.push('> 连接到API服务器...');

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

      // Data receiving stage
      updateProgress(2);
      statusMessage.value = '接收流式响应...';
      responseStream.value.push('> 信息: 开始接收流式响应');
      isProcessingResponse.value = true;

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let jsonResponse = '';
      let isThinking = false;
      let thinkingContent = '';
      let lastThinkingUpdate = Date.now();
      let chunkCount = 0;
      let currentThinkingBlock: ThinkingBlock | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        chunkCount++;

        // Update progress on data reception
        if (chunkCount % 3 === 0) {
          updateProgress(2);
        }

        // Process streaming data
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed: ApiResponse = JSON.parse(data);

              // Handle thinking content
              if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.reasoning_content) {
                const reasoning = parsed.choices[0].delta.reasoning_content;

                // Increment thinking count for progress estimation
                const now = Date.now();
                if (!isThinking || now - lastThinkingUpdate > 1000) {
                  thinkingCount++;
                  lastThinkingUpdate = now;
                  updateProgress(2);
                }

                // Create new thinking block on first thinking
                if (!isThinking) {
                  isThinking = true;
                  thinkingContent = reasoning;
                  currentThinkingBlock = {
                    type: 'thinking',
                    content: reasoning
                  };
                  responseStream.value.push(currentThinkingBlock);
                } else {
                  // Accumulate thinking content
                  thinkingContent += reasoning;

                  // Update current thinking block
                  if (currentThinkingBlock) {
                    currentThinkingBlock.content = thinkingContent;
                    // Force Vue to update view
                    responseStream.value = [...responseStream.value];
                  }
                }
                continue;
              } else if (isThinking && parsed.choices &&
                (!parsed.choices[0].delta.reasoning_content ||
                  parsed.choices[0].delta.reasoning_content === '')) {
                // End of thinking
                isThinking = false;
                thinkingContent = '';
                currentThinkingBlock = null;
              }

              // Handle normal content
              if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                jsonResponse += content;

                // Format JSON fragment display
                if (content.includes('{') || content.includes('}') || content.includes('[') || content.includes(']')) {
                  responseStream.value.push(content);
                } else {
                  // Try to merge short text to last line
                  const lastItem = responseStream.value[responseStream.value.length - 1];
                  if (responseStream.value.length > 0 &&
                    typeof lastItem === 'string' &&
                    !lastItem.startsWith('>') &&
                    !lastItem.startsWith('✅') &&
                    !lastItem.startsWith('❌') &&
                    lastItem.length < 80) {
                    responseStream.value[responseStream.value.length - 1] = lastItem + content;
                  } else {
                    responseStream.value.push(content);
                  }
                }
              }
            } catch (e) {
              responseStream.value.push('> 信息: 解析响应数据时出现问题');
              console.error('解析响应数据错误', e);
            }
          }
        }
      }

      // Data processing stage
      updateProgress(3);
      statusMessage.value = '解析表单数据...';
      responseStream.value.push('> 信息: 流式传输完成，解析表单数据中');
      isProcessingResponse.value = false;

      try {
        // Extract JSON part
        let jsonStr = jsonResponse.trim();

        // Handle possible code block format
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const parsedData = JSON.parse(jsonStr) as FormData;
        formData.value = parsedData;

        // Initialize form model
        initFormModel(parsedData.fields);

        // Complete stage
        updateProgress(4, 100);
        statusMessage.value = '表单识别完成！';
        responseStream.value.push('✅ 表单识别成功');

        // 不在此处设置成功消息，交由调用方处理

        return { success: true, data: parsedData };
      } catch (e: any) {
        const errorMsg = `解析表单数据失败: ${e.message}`;
        responseStream.value.push(`❌ ${errorMsg}`);
        console.error('解析表单数据失败', e);
        return { error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = `API请求错误: ${error.message}`;
      statusMessage.value = `发生错误: ${error.message}`;
      responseStream.value.push(`❌ ${errorMsg}`);
      console.error('API请求错误', error);
      return { error: errorMsg };
    } finally {
      // Clean up progress update timer
      if (progressIncrementTimer) {
        clearInterval(progressIncrementTimer);
      }

      isProcessingResponse.value = false;
      setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  };

  // Clear response stream
  const clearResponseStream = (): void => {
    responseStream.value = [];
  };

  // Copy JSON data to clipboard
  const copyJsonData = (): boolean => {
    if (!formData.value) return false;

    const jsonString = JSON.stringify(formData.value, null, 2);
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        return true;
      })
      .catch(err => {
        console.error('复制失败:', err);
        return false;
      });

    return true;
  };

  // Toggle auto-scroll functionality
  const toggleAutoScroll = (): void => {
    autoScroll.value = !autoScroll.value;
  };

  // Formatted JSON for display
  const formattedJson = computed((): string => {
    if (!formData.value) return '';

    const jsonStr = JSON.stringify(formData.value, null, 2);
    return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'json-value';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
  });

  // 清除成功消息
  const clearSuccessMessage = (delay = 3000) => {
    setTimeout(() => {
      successMessage.value = '';
    }, delay);
  };

  return {
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
    formattedJson,
    handleFileUpload,
    handleDrop,
    recognizeForm,
    resetForm,
    useTestData,
    clearResponseStream,
    copyJsonData,
    toggleAutoScroll,
    initFormModel,
    successMessage
  };
} 