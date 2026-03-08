import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, BookOpen, Send, Settings } from 'lucide-react';

const AvatarJourney = () => {
  // 应用状态管理
  const [currentPage, setCurrentPage] = useState('setup'); // setup, traveling, diary, settings
  const [character, setCharacter] = useState({
    name: '',
    description: '',
    departureLocation: '',
    destination: '',
    travelMethod: '',
    travelStyle: ''
  });
  
  const [travelState, setTravelState] = useState({
    isActive: false,
    currentLocation: '',
    currentActivity: '',
    lastUpdate: null,
    nextEventTime: null
  });
  
  const [events, setEvents] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);

  // 预设选项
  const popularLocations = [
    '北京', '上海', '成都', '西安', '杭州', '南京', 
    '东京', '首尔', '曼谷', '新加坡', '巴黎', '伦敦',
    '纽约', '洛杉矶', '悉尼', '罗马'
  ];

  const travelMethods = [
    { id: 'driving', name: '自驾游', desc: '开车自由行，灵活安排路线' },
    { id: 'walking', name: '徒步旅行', desc: '步行探索，深度体验当地' },
    { id: 'public', name: '公共交通', desc: '火车、巴士等公共交通' },
    { id: 'backpacking', name: '背包客', desc: '经济实惠的背包旅行' },
    { id: 'luxury', name: '豪华旅行', desc: '舒适享受的高端旅行' }
  ];

  const travelStyles = [
    { id: 'adventure', name: '探险型', desc: '寻找刺激和新奇体验' },
    { id: 'leisure', name: '休闲型', desc: '放松身心，慢节奏游览' },
    { id: 'cultural', name: '文化体验型', desc: '深入了解当地文化历史' },
    { id: 'foodie', name: '美食寻访型', desc: '品尝各地特色美食' }
  ];

  // Claude API 调用函数
  const callClaudeAPI = async (prompt, expectJSON = false) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }
      
      const data = await response.json();
      let responseText = data.content[0].text;
      
      if (expectJSON) {
        responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(responseText);
      }
      
      return responseText;
    } catch (error) {
      console.error("Claude API调用错误:", error);
      throw error;
    }
  };

  // 开始旅行
  const startJourney = async () => {
    if (!character.name || !character.departureLocation || !character.destination) {
      alert('请填写完整的角色信息和旅行配置');
      return;
    }

    setIsWaitingResponse(true);
    try {
      const prompt = `
你是一个虚拟旅行游戏的AI助手，负责为用户的虚拟角色生成真实的旅行体验。

角色设定：
- 姓名：${character.name}
- 性格描述：${character.description}
- 出发地：${character.departureLocation}
- 目的地：${character.destination}
- 旅行方式：${travelMethods.find(m => m.id === character.travelMethod)?.name}
- 旅行风格：${travelStyles.find(s => s.id === character.travelStyle)?.name}

现在是2025年9月13日12点，角色刚开始这次旅行。请生成第一个旅行事件，并估算下次更新的时间。

请以JSON格式回复，包含以下字段：
{
  "currentLocation": "当前位置（详细地点）",
  "currentActivity": "当前正在做的事情",
  "eventDescription": "这次事件的详细描述（200字左右）",
  "nextEventTime": "下次事件预计发生的时间（小时后，如1.5表示1.5小时后）",
  "needsUserInput": false
}

要求：
1. 生成合理真实的旅行体验
2. 考虑旅行方式和从出发地到目的地的实际情况
3. 事件要有趣且符合角色设定
4. 时间估算要合理（通常0.5-3小时之间）
`;

      const result = await callClaudeAPI(prompt, true);
      
      const newEvent = {
        id: Date.now(),
        timestamp: new Date(),
        type: 'journey_start',
        content: result.eventDescription,
        needsUserInput: result.needsUserInput || false
      };

      setEvents([newEvent]);
      setTravelState({
        isActive: true,
        currentLocation: result.currentLocation,
        currentActivity: result.currentActivity,
        lastUpdate: new Date(),
        nextEventTime: new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000)
      });
      
      setCurrentPage('traveling');
      
      // 设置下次事件的定时器
      scheduleNextEvent(result.nextEventTime);
      
    } catch (error) {
      alert('开始旅行时出错，请重试');
      console.error(error);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  // 调度下次事件
  const scheduleNextEvent = (hoursLater) => {
    const delay = hoursLater * 60 * 60 * 1000; // 转换为毫秒
    setTimeout(() => {
      generateNextEvent();
    }, delay);
  };

  // 生成下次事件
  const generateNextEvent = async () => {
    if (!travelState.isActive) return;

    try {
      const recentEvents = events.slice(-3).map(e => `${e.content}`).join('\n');
      const recentDiaries = diaries.slice(-2).map(d => `${d.date}: ${d.content}`).join('\n');
      
      const prompt = `
继续${character.name}的旅行故事。

角色设定：
- 姓名：${character.name}
- 性格：${character.description}
- 旅行方式：${travelMethods.find(m => m.id === character.travelMethod)?.name}
- 从${character.departureLocation}到${character.destination}

当前状态：
- 当前位置：${travelState.currentLocation}
- 当前活动：${travelState.currentActivity}
- 当前时间：${new Date().toLocaleString()}

最近事件：
${recentEvents}

最近日记：
${recentDiaries}

请生成下一个旅行事件，要求：
1. 符合时间和地点的逻辑
2. 考虑旅行者的自然需求（休息、吃饭等）
3. 适当加入随机遇遇或有趣发现
4. 保持故事连贯性

请以JSON格式回复：
{
  "currentLocation": "更新后的当前位置",
  "currentActivity": "当前正在做的事情",
  "eventDescription": "事件详细描述（200字左右）",
  "nextEventTime": "下次事件预计时间（小时后）",
  "needsUserInput": true/false
}

如果是需要用户决策的情况（如遇到有趣的人或选择），设置needsUserInput为true。
`;

      const result = await callClaudeAPI(prompt, true);
      
      const newEvent = {
        id: Date.now(),
        timestamp: new Date(),
        type: 'travel_event',
        content: result.eventDescription,
        needsUserInput: result.needsUserInput || false
      };

      setEvents(prev => [...prev, newEvent]);
      setTravelState(prev => ({
        ...prev,
        currentLocation: result.currentLocation,
        currentActivity: result.currentActivity,
        lastUpdate: new Date(),
        nextEventTime: new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000)
      }));

      // 如果不需要用户输入，继续调度下次事件
      if (!result.needsUserInput) {
        scheduleNextEvent(result.nextEventTime);
      }
      
    } catch (error) {
      console.error('生成事件时出错:', error);
      // 出错时设置一个默认的重试时间
      setTimeout(() => generateNextEvent(), 30 * 60 * 1000); // 30分钟后重试
    }
  };

  // 用户发送消息干预
  const sendUserMessage = async () => {
    if (!userMessage.trim() || isWaitingResponse) return;

    setIsWaitingResponse(true);
    try {
      const recentEvents = events.slice(-2).map(e => e.content).join('\n');
      
      const prompt = `
${character.name}正在旅行中。

当前状态：
- 位置：${travelState.currentLocation}
- 活动：${travelState.currentActivity}

最近发生的事：
${recentEvents}

用户发来消息想要干预角色的行动："${userMessage}"

请根据用户的建议，生成角色接下来的行动和遇到的情况。

请以JSON格式回复：
{
  "currentLocation": "位置（可能有变化）",
  "currentActivity": "根据用户建议调整的新活动",
  "eventDescription": "根据用户建议发生的新情况（200字左右）",
  "nextEventTime": "下次自动事件的时间（小时后）",
  "needsUserInput": false
}
`;

      const result = await callClaudeAPI(prompt, true);
      
      const newEvent = {
        id: Date.now(),
        timestamp: new Date(),
        type: 'user_intervention',
        content: result.eventDescription,
        needsUserInput: false,
        userMessage: userMessage
      };

      setEvents(prev => [...prev, newEvent]);
      setTravelState(prev => ({
        ...prev,
        currentLocation: result.currentLocation,
        currentActivity: result.currentActivity,
        lastUpdate: new Date(),
        nextEventTime: new Date(Date.now() + result.nextEventTime * 60 * 60 * 1000)
      }));

      setUserMessage('');
      scheduleNextEvent(result.nextEventTime);
      
    } catch (error) {
      alert('发送消息时出错，请重试');
      console.error(error);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  // 生成每日日记
  const generateDailyDiary = async (date, dayEvents) => {
    try {
      const eventsText = dayEvents.map(e => e.content).join('\n');
      
      const prompt = `
为${character.name}的旅行写一篇日记。

日期：${date}
当天发生的事件：
${eventsText}

请以自然的第一人称视角，用大约200字总结这一天的旅行经历，突出最有趣或印象深刻的部分。

请以JSON格式回复：
{
  "title": "日记标题（简短有趣）",
  "content": "日记正文（约200字）",
  "keyEvents": ["关键事件1", "关键事件2", "关键事件3"]
}
`;

      const result = await callClaudeAPI(prompt, true);
      
      const newDiary = {
        id: Date.now(),
        date: date,
        title: result.title,
        content: result.content,
        keyEvents: result.keyEvents || []
      };

      setDiaries(prev => [...prev, newDiary]);
      
    } catch (error) {
      console.error('生成日记时出错:', error);
    }
  };

  // 页面渲染组件
  const renderSetupPage = () => (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Avatar Journey</h1>
        <p className="text-gray-600">创建你的虚拟化身，开始一段奇妙的旅程</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User className="w-5 h-5" />
          角色设定
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">角色姓名</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => setCharacter(prev => ({...prev, name: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="给你的虚拟角色起个名字"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">角色描述</label>
          <textarea
            value={character.description}
            onChange={(e) => setCharacter(prev => ({...prev, description: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="描述角色的性格、兴趣爱好、背景等"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          旅行配置
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出发地</label>
            <input
              type="text"
              value={character.departureLocation}
              onChange={(e) => setCharacter(prev => ({...prev, departureLocation: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="选择出发城市"
              list="locations"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input
              type="text"
              value={character.destination}
              onChange={(e) => setCharacter(prev => ({...prev, destination: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="选择目的地城市"
              list="locations"
            />
          </div>
        </div>

        <datalist id="locations">
          {popularLocations.map(location => (
            <option key={location} value={location} />
          ))}
        </datalist>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">旅行方式</label>
          <div className="grid grid-cols-1 gap-2">
            {travelMethods.map(method => (
              <label key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="travelMethod"
                  value={method.id}
                  checked={character.travelMethod === method.id}
                  onChange={(e) => setCharacter(prev => ({...prev, travelMethod: e.target.value}))}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">旅行风格</label>
          <div className="grid grid-cols-2 gap-2">
            {travelStyles.map(style => (
              <label key={style.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="travelStyle"
                  value={style.id}
                  checked={character.travelStyle === style.id}
                  onChange={(e) => setCharacter(prev => ({...prev, travelStyle: e.target.value}))}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-sm">{style.name}</div>
                  <div className="text-xs text-gray-500">{style.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={startJourney}
          disabled={isWaitingResponse}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isWaitingResponse ? '正在准备旅程...' : '开始旅程'}
        </button>
      </div>
    </div>
  );

  const renderTravelingPage = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          {character.name} 的旅程
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">当前位置</h3>
            <p className="text-blue-600">{travelState.currentLocation}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">正在进行</h3>
            <p className="text-green-600">{travelState.currentActivity}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-800">最后更新</h3>
            <p className="text-orange-600">
              {travelState.lastUpdate ? new Date(travelState.lastUpdate).toLocaleString() : ''}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">旅行记录</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                  {event.needsUserInput && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      等待选择
                    </span>
                  )}
                </div>
                {event.userMessage && (
                  <div className="text-sm text-blue-600 mb-2">
                    💬 你的指示: {event.userMessage}
                  </div>
                )}
                <p className="text-gray-700">{event.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="font-semibold">与 {character.name} 对话</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendUserMessage()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="给角色发送建议或指示..."
              disabled={isWaitingResponse}
            />
            <button
              onClick={sendUserMessage}
              disabled={isWaitingResponse || !userMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            你可以建议角色的下一步行动，比如"去当地市场看看"或"和那个人继续聊天"
          </p>
        </div>
      </div>
    </div>
  );

  const renderDiaryPage = () => (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <BookOpen className="w-6 h-6" />
        {character.name} 的旅行日记
      </h2>
      
      {diaries.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>还没有日记记录</p>
          <p className="text-sm">开始旅行后会自动生成每日日记</p>
        </div>
      ) : (
        <div className="space-y-6">
          {diaries.map(diary => (
            <div key={diary.id} className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">{diary.date}</h3>
              <h4 className="text-md font-medium text-blue-600 mb-3">{diary.title}</h4>
              <p className="text-gray-700 leading-relaxed mb-4">{diary.content}</p>
              {diary.keyEvents && diary.keyEvents.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">关键事件：</h5>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {diary.keyEvents.map((event, index) => (
                      <li key={index}>• {event}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 导航栏
  const navigation = [
    { id: 'setup', name: '角色设定', icon: User },
    { id: 'traveling', name: '旅行中', icon: MapPin },
    { id: 'diary', name: '旅行日记', icon: BookOpen },
    { id: 'settings', name: '设置', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    currentPage === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="py-6">
        {currentPage === 'setup' && renderSetupPage()}
        {currentPage === 'traveling' && renderTravelingPage()}
        {currentPage === 'diary' && renderDiaryPage()}
        {currentPage === 'settings' && (
          <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">设置</h2>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <p className="text-gray-600">设置页面开发中...</p>
              <button
                onClick={() => {
                  if (confirm('确定要重置所有数据吗？')) {
                    setCharacter({
                      name: '',
                      description: '',
                      departureLocation: '',
                      destination: '',
                      travelMethod: '',
                      travelStyle: ''
                    });
                    setTravelState({
                      isActive: false,
                      currentLocation: '',
                      currentActivity: '',
                      lastUpdate: null,
                      nextEventTime: null
                    });
                    setEvents([]);
                    setDiaries([]);
                    setCurrentPage('setup');
                  }
                }}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                重置所有数据
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AvatarJourney;