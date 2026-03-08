import { ApiConfig } from '../types';
import { cleanJSONResponse } from '../utils/helpers';

// 默认API配置
const DEFAULT_API_CONFIG: ApiConfig = {
  provider: 'doubao',
  apiKey: import.meta.env.VITE_DOUBAO_API_KEY || ''
};

// 存储当前API配置
let currentApiConfig: ApiConfig = DEFAULT_API_CONFIG;

// 设置API配置
export const setApiConfig = (config: ApiConfig): void => {
  currentApiConfig = { ...config };
  // 保存到localStorage
  localStorage.setItem('avatarJourneyApiConfig', JSON.stringify(currentApiConfig));
};

// 获取API配置
export const getApiConfig = (): ApiConfig => {
  // 从localStorage读取配置
  const savedConfig = localStorage.getItem('avatarJourneyApiConfig');
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (error) {
      console.error('解析API配置失败:', error);
    }
  }
  return currentApiConfig;
};

// 调用豆包文本 API
const callDoubaoAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_DOUBAO_TEXT_ENDPOINT || 'ep-20251217180550-v2fht',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`豆包 API调用失败: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.choices[0].message.content;

    if (expectJSON) {
      responseText = cleanJSONResponse(responseText);
      return JSON.parse(responseText);
    }

    return responseText;
  } catch (error) {
    console.error('豆包 API调用错误:', error);
    throw error;
  }
};

// 调用豆包图像生成 API
export const callDoubaoImageAPI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_DOUBAO_IMAGE_ENDPOINT || 'ep-20251213154023-g2ttz',
        prompt: prompt,
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "1024x1024" // 豆包默认或者常用的尺寸
      })
    });

    if (!response.ok) {
      throw new Error(`豆包图像 API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('豆包图像 API调用错误:', error);
    throw error;
  }
};

// 调用Claude API
const callClaudeAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': currentApiConfig.apiKey || ''
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API调用失败: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.content[0].text;

    if (expectJSON) {
      responseText = cleanJSONResponse(responseText);
      return JSON.parse(responseText);
    }

    return responseText;
  } catch (error) {
    console.error('Claude API调用错误:', error);
    throw error;
  }
};

// 调用智谱GLM API
const callZhipuGLMAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiConfig.apiKey || ''}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`智谱GLM API调用失败: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.choices[0].message.content;

    if (expectJSON) {
      responseText = cleanJSONResponse(responseText);
      return JSON.parse(responseText);
    }

    return responseText;
  } catch (error) {
    console.error('智谱GLM API调用错误:', error);
    throw error;
  }
};

// 统一的API调用函数
export const callAIAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  // 确保使用最新的配置
  currentApiConfig = getApiConfig();

  try {
    switch (currentApiConfig.provider) {
      case 'doubao':
        return await callDoubaoAPI(prompt, expectJSON);
      case 'claude':
        return await callClaudeAPI(prompt, expectJSON);
      case 'zhipu':
        return await callZhipuGLMAPI(prompt, expectJSON);
      default:
        return await callDoubaoAPI(prompt, expectJSON); // 默认使用豆包
    }
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
};

// 初始化API配置
export const initializeApiConfig = (): void => {
  const savedConfig = localStorage.getItem('avatarJourneyApiConfig');
  if (savedConfig) {
    try {
      currentApiConfig = JSON.parse(savedConfig);
    } catch (error) {
      console.error('初始化API配置失败:', error);
    }
  }
};