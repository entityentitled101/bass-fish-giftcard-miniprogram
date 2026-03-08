import { callAIAPI, callDoubaoImageAPI } from './apiService';
import { Character, TravelState, TravelEvent, Diary, AIEventResponse, AIDiaryResponse } from '../types';
import { getEventsByDate, generateId } from '../utils/helpers';

// 基础文本风格要求
const SYSTEM_STYLE_INSTRUCTION = `
写作风格指南：
1. 平实自然：像普通的个人游记或朋友圈文案，不要写成抒情散文或过于煽情的文学作品。
2. 真实记录：重点描述“在哪里”、“看到了什么”、“做了什么”。不需要每次都刻意安排与人互动，可以多描写风景、当地氛围、交通状况或角色的一点小感悟。
3. 避免过度中心化：不要让全世界都围着主角转，展现旅程中平凡而真实的一面。
4. 语言精炼：用富有生活气息的语言，避免陈词滥调和过度华丽的修辞。
`;

// 开始旅行
export const startJourney = async (
  character: Character,
  travelMethods: any[],
  travelStyles: any[]
): Promise<{ newEvent: TravelEvent; travelState: TravelState }> => {
  try {
    const prompt = `
你是一个虚拟旅行游戏的AI助手，负责为用户的虚拟角色生成真实的旅行体验。
${SYSTEM_STYLE_INSTRUCTION}

角色设定：
- 姓名：${character.name}
- 性格：${character.description}
- 出发地：${character.departureLocation}
- 目的地：${character.destination}
- 旅行方式：${travelMethods.find(m => m.id === character.travelMethod)?.name}
- 旅行风格：${travelStyles.find(s => s.id === character.travelStyle)?.name}

现在旅程正式开始。请生成第一个旅行事件，说明角色出发的情况。

请以JSON格式回复：
{
  "currentLocation": "出发地及具体场景",
  "currentActivity": "正在进行的初始动作",
  "eventDescription": "出发时的平实记录（200字左右）",
  "nextEventTime": "下次更新所需小时数（0.5-2之间）",
  "needsUserInput": false
}
`;

    const result = await callAIAPI(prompt, true) as AIEventResponse;

    const newEvent: TravelEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'journey_start',
      content: result.eventDescription,
      needsUserInput: result.needsUserInput || false
    };

    const travelState: TravelState = {
      isActive: true,
      currentLocation: result.currentLocation,
      currentActivity: result.currentActivity,
      lastUpdate: new Date(),
      nextEventTime: new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000),
      stats: {
        joy: 100, // 初始心情满格
        experience: 0,
        discovery: 0
      }
    };

    return { newEvent, travelState };
  } catch (error) {
    console.error('开始旅行时出错:', error);
    throw error;
  }
};

// 生成下次事件
export const generateNextEvent = async (
  character: Character,
  travelState: TravelState,
  events: TravelEvent[]
): Promise<{ newEvent: TravelEvent; updatedTravelState: TravelState }> => {
  if (!travelState.isActive) {
    throw new Error('旅行未激活');
  }

  try {
    const recentEvents = events.slice(-3).map(e => `${e.content}`).join('\n');

    const prompt = `
继续${character.name}的旅行故事。
${SYSTEM_STYLE_INSTRUCTION}

当前状态：
- 当前位置：${travelState.currentLocation}
- 当前活动：${travelState.currentActivity}
- 属性：心情 ${travelState.stats?.joy}, 经验 ${travelState.stats?.experience}, 探索度 ${travelState.stats?.discovery}

最近历程：
${recentEvents}

请生成下一个旅行事件。要求：
1. 写实记录接下来的所见所闻。
2. 只有在逻辑上确实解锁了新地点或完成了挑战时才触发数值变化。
3. 如果到达了目的地 ${character.destination}，请设置 isFinished 为 true。

请以JSON格式回复：
{
  "currentLocation": "更新后的位置",
  "currentActivity": "正在做的事情",
  "eventDescription": "事件平实记录（200字左右）",
  "nextEventTime": "下次事件预计时间（小时后）",
  "needsUserInput": false,
  "statChanges": {
    "joy": 0, (心情变化，正负值，通常在 -5 到 +5 之间)
    "experience": 0, (经验值，只有克服难关或进行深入活动时加分，通常 1-3)
    "discovery": 0 (探索度，只有到达新地点或发现独特景致时加 1)
  },
  "isFinished": false
}
`;

    const result = await callAIAPI(prompt, true) as AIEventResponse;

    const newEvent: TravelEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'travel_event',
      content: result.eventDescription,
      needsUserInput: result.needsUserInput || false
    };

    const changes = result.statChanges || { joy: 0, experience: 0, discovery: 0 };
    const currentStats = travelState.stats || { joy: 100, experience: 0, discovery: 0 };

    const updatedTravelState: TravelState = {
      ...travelState,
      currentLocation: result.currentLocation,
      currentActivity: result.currentActivity,
      lastUpdate: new Date(),
      nextEventTime: result.isFinished ? null : new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000),
      isFinished: result.isFinished || false,
      isActive: !result.isFinished,
      stats: {
        joy: Math.min(100, Math.max(0, currentStats.joy + (changes.joy || 0))),
        experience: Math.min(100, currentStats.experience + (changes.experience || 0)),
        discovery: Math.min(100, currentStats.discovery + (changes.discovery || 0))
      }
    };

    return { newEvent, updatedTravelState };
  } catch (error) {
    console.error('生成事件时出错:', error);
    throw error;
  }
};

export const processUserMessage = async (
  character: Character,
  travelState: TravelState,
  userMessage: string
): Promise<{ newEvent: TravelEvent; updatedTravelState: TravelState }> => {
  try {

    const prompt = `
${character.name}正在旅行。用户下达干预指令："${userMessage}"
${SYSTEM_STYLE_INSTRUCTION}

当前状态：
- 位置：${travelState.currentLocation}
- 活动：${travelState.currentActivity}

请生成角色对该指令的反应及其后的平实历程。

请以JSON格式回复：
{
  "currentLocation": "可能更新的位置",
  "currentActivity": "根据指令调整的活动",
  "eventDescription": "角色的反应及行动记录（200字左右）",
  "nextEventTime": "下次自动事件的时间（小时后）",
  "statChanges": {
    "joy": 1,
    "experience": 1
  }
}
`;

    const result = await callAIAPI(prompt, true) as AIEventResponse;

    const newEvent: TravelEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'user_intervention',
      content: result.eventDescription,
      needsUserInput: false,
      userMessage: userMessage
    };

    const changes = result.statChanges || { joy: 0, experience: 0, discovery: 0 };
    const currentStats = travelState.stats || { joy: 100, experience: 0, discovery: 0 };

    const updatedTravelState: TravelState = {
      ...travelState,
      currentLocation: result.currentLocation,
      currentActivity: result.currentActivity,
      lastUpdate: new Date(),
      nextEventTime: new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000),
      stats: {
        joy: Math.min(100, Math.max(0, currentStats.joy + (changes.joy || 0))),
        experience: Math.min(100, currentStats.experience + (changes.experience || 0)),
        discovery: Math.min(100, currentStats.discovery + (changes.discovery || 0))
      }
    };

    return { newEvent, updatedTravelState };
  } catch (error) {
    console.error('处理用户消息时出错:', error);
    throw error;
  }
};

// 生成每日日记
export const generateDailyDiary = async (
  character: Character,
  date: string,
  events: TravelEvent[]
): Promise<Diary> => {
  try {
    const dayEvents = getEventsByDate(events, new Date(date));
    const eventsText = dayEvents.map(e => e.content).join('\n');

    const prompt = `
为${character.name}的旅行编写一份日期为 ${date} 的总结日志。
${SYSTEM_STYLE_INSTRUCTION}

当天的所有碎碎念记录：
${eventsText}

请以第一人称视角对这一天进行总结。语气要像真实的旅行日记，不要过于矫情，实事求是地叙述这一天的整体感觉。

请以JSON格式回复：
{
  "title": "日记标题（简约实记）",
  "content": "日记总结正文（约200字）",
  "keyEvents": ["地点或事件标签1", "标签2"]
}
`;

    const result = await callAIAPI(prompt, true) as AIDiaryResponse;

    // 生成日记图片
    let imageUrl = '';
    try {
      const imagePrompt = `Real travel photography: ${result.title}, ${result.keyEvents[0] || character.destination}, authentic atmosphere, unedited, casual iPhone snapshot, natural lighting, realistic textures, travel mood.`;
      imageUrl = await callDoubaoImageAPI(imagePrompt);
    } catch (e) {
      console.error('生成日记图片失败:', e);
    }

    const newDiary: Diary = {
      id: generateId(),
      date: date,
      title: result.title,
      content: result.content,
      keyEvents: result.keyEvents || [],
      imageUrl: imageUrl
    };

    return newDiary;
  } catch (error) {
    console.error('生成日记时出错:', error);
    throw error;
  }
};

// 补全由于离线错过的旅程
export const catchUpJourney = async (
  character: Character,
  travelState: TravelState,
  hoursPassed: number
): Promise<{ catchUpEvent: TravelEvent; updatedTravelState: TravelState }> => {
  try {
    const prompt = `
${character.name}正在从${character.departureLocation}前往${character.destination}。
离线期间已经过去了 ${hoursPassed.toFixed(1)} 小时。
${SYSTEM_STYLE_INSTRUCTION}

请生成一个“旅程跨度汇总”，平实地记录化身在失联期间跨越的距离和经历。
如果时间跨度很大（如超过48小时），角色可能已经非常接近目的地。

请以JSON格式回复：
{
  "currentLocation": "新到达的位置",
  "currentActivity": "当前正在做的事",
  "eventDescription": "离线期间的经历汇总（平实风格，300字左右）",
  "nextEventTime": "下次自动事件的时间（小时后）",
  "statChanges": {
    "joy": 2,
    "experience": 5,
    "discovery": 3
  },
  "isFinished": false
}
`;

    const result = await callAIAPI(prompt, true) as AIEventResponse;

    const catchUpEvent: TravelEvent = {
      id: generateId(),
      timestamp: new Date(),
      type: 'travel_event',
      content: `[系统补全] 数据链路重连成功。在过去的 ${hoursPassed.toFixed(1)} 小时内：\n${result.eventDescription}`,
      needsUserInput: false
    };

    const changes = result.statChanges || { joy: 0, experience: 0, discovery: 0 };
    const currentStats = travelState.stats || { joy: 100, experience: 0, discovery: 0 };

    const updatedTravelState: TravelState = {
      ...travelState,
      currentLocation: result.currentLocation,
      currentActivity: result.currentActivity,
      lastUpdate: new Date(),
      nextEventTime: result.isFinished ? null : new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000),
      isFinished: result.isFinished || false,
      isActive: !result.isFinished,
      stats: {
        joy: Math.min(100, Math.max(0, currentStats.joy + (changes.joy || 0))),
        experience: Math.min(100, currentStats.experience + (changes.experience || 0)),
        discovery: Math.min(100, currentStats.discovery + (changes.discovery || 0))
      }
    };

    return { catchUpEvent, updatedTravelState };
  } catch (error) {
    console.error('补全旅程时出错:', error);
    throw error;
  }
};

// 调度下次事件
export const scheduleNextEvent = (
  hoursLater: number,
  callback: () => void
): number => {
  const delay = Math.max(0, hoursLater * 60 * 60 * 1000);
  return window.setTimeout(callback, delay);
};