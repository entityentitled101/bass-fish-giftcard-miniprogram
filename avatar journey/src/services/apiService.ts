import { ApiConfig } from '../types';
import { cleanJSONResponse } from '../utils/helpers';

// 默认API配置
const DEFAULT_API_CONFIG: ApiConfig = {
  provider: 'gemini',
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
};

// 存储当前API配置
let currentApiConfig: ApiConfig = DEFAULT_API_CONFIG;

// 获取当前API配置
export const getApiConfig = (): ApiConfig => {
  // 1. 尝试从 localStorage 读取手动配置的配置项
  const savedConfig = localStorage.getItem('avatarJourneyApiConfig');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      // 如果手动配置了 apiKey 且不为空，则优先使用
      if (parsed.apiKey && parsed.apiKey.trim() !== '') {
        return parsed;
      }
    } catch (error) {
      console.error('解析API配置失败:', error);
    }
  }

  // 2. 如果没有手动配置或 apiKey 为空，返回包含环境变量的默认配置
  return {
    ...DEFAULT_API_CONFIG,
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
  };
};

// 设置API配置
export const setApiConfig = (config: ApiConfig): void => {
  currentApiConfig = { ...config };
  // 保存到localStorage
  localStorage.setItem('avatarJourneyApiConfig', JSON.stringify(currentApiConfig));
};

// 调用 Gemini API (Google)
const callGeminiAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  try {
    const config = getApiConfig();
    const apiKey = config.apiKey || import.meta.env.VITE_GEMINI_API_KEY;

    // 使用 Gemini 1.5 Flash 模型，性能好且稳定
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API 调用失败: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (expectJSON) {
      responseText = cleanJSONResponse(responseText);
      return JSON.parse(responseText);
    }

    return responseText;
  } catch (error) {
    console.error('Gemini API 调用错误:', error);
    throw error;
  }
};

// 调用豆包文本 API
const callDoubaoAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  try {
    const config = getApiConfig();
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
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
    const config = getApiConfig();
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_DOUBAO_IMAGE_ENDPOINT || 'ep-20251213154023-g2ttz',
        prompt: prompt,
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "1024x1024"
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
    const config = getApiConfig();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey || ''
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

// 统一的API调用函数
export const callAIAPI = async (prompt: string, expectJSON: boolean = false): Promise<any> => {
  const config = getApiConfig();

  try {
    switch (config.provider) {
      case 'gemini':
        return await callGeminiAPI(prompt, expectJSON);
      case 'doubao':
        return await callDoubaoAPI(prompt, expectJSON);
      case 'claude':
        return await callClaudeAPI(prompt, expectJSON);
      default:
        return await callGeminiAPI(prompt, expectJSON); // 默认使用 Gemini
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
      currentApiConfig = DEFAULT_API_CONFIG;
    }
  } else {
    currentApiConfig = DEFAULT_API_CONFIG;
  }
};