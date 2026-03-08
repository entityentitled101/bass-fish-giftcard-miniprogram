import React, { useState, useEffect } from 'react';
import { User, MapPin, BookOpen, Settings, Activity, Info, HelpCircle, Shirt, Users } from 'lucide-react';
import SetupPage from './components/SetupPage';
import TravelingPage from './components/TravelingPage';
import DiaryPage from './components/DiaryPage';
import SettingsPage from './components/SettingsPage';
import StatsPage from './components/StatsPage';
import WardrobePage from './components/WardrobePage';
import SocialPage from './components/SocialPage';
import { Character, TravelState, TravelEvent, Diary, TravelMethodOption, TravelStyleOption, PopularLocation, Wardrobe, SocialContact } from './types';
import { initializeApiConfig } from './services/apiService';
import { loadCharacter, saveCharacter, loadTravelState, saveTravelState, loadEvents, saveEvents, loadDiaries, saveDiaries, clearAllData, loadWardrobe, saveWardrobe, loadSocialContacts } from './services/storageService';
import { checkAndMigrate } from './services/migrationService';
import { startJourney as startJourneyService, generateNextEvent as generateNextEventService, processUserMessage as processUserMessageService, generateDailyDiary as generateDailyDiaryService, scheduleNextEvent, catchUpJourney } from './services/eventGenerator';
import { formatDate } from './utils/helpers';

const App: React.FC = () => {
  // 应用状态
  const [currentPage, setCurrentPage] = useState<string>('setup');
  const [character, setCharacter] = useState<Character>({
    name: '',
    description: '',
    departureLocation: '',
    destination: '',
    travelMethod: '',
    travelStyle: ''
  });
  const [travelState, setTravelState] = useState<TravelState>({
    isActive: false,
    currentLocation: '',
    currentActivity: '',
    lastUpdate: null,
    nextEventTime: null,
    stats: { joy: 100, experience: 0, discovery: 0 }
  });
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [wardrobe, setWardrobe] = useState<Wardrobe | undefined>(undefined);
  const [socialContacts, setSocialContacts] = useState<SocialContact[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isWaitingResponse, setIsWaitingResponse] = useState<boolean>(false);

  // 预设选项
  const popularLocations: PopularLocation[] = [
    '北京', '上海', '成都', '西安', '杭州', '南京',
    '东京', '首尔', '曼谷', '新加坡', '巴黎', '伦敦',
    '纽约', '洛杉矶', '悉尼', '罗马'
  ];

  const travelMethods: TravelMethodOption[] = [
    { id: 'driving', name: '自驾游', desc: '开车自由行，灵活安排路线' },
    { id: 'walking', name: '徒步旅行', desc: '步行探索，深度体验当地' },
    { id: 'public', name: '公共交通', desc: '火车、巴士等公共交通' },
    { id: 'backpacking', name: '背包客', desc: '经济实惠的背包旅行' },
    { id: 'luxury', name: '豪华旅行', desc: '舒适享受的高端旅行' }
  ];

  const travelStyles: TravelStyleOption[] = [
    { id: 'adventure', name: '探险型', desc: '寻找刺激和新奇体验' },
    { id: 'leisure', name: '休闲型', desc: '放松身心，慢节奏游览' },
    { id: 'cultural', name: '文化体验型', desc: '深入了解当地文化历史' },
    { id: 'foodie', name: '美食寻访型', desc: '品尝各地特色美食' }
  ];

  // 定时器ID
  const [nextEventTimer, setNextEventTimer] = useState<number | null>(null);

  // 生成日记的辅助函数
  const captureDiary = async (date: string, evts: TravelEvent[], currentCharacter: Character) => {
    try {
      console.log(`正在自动捕获 ${date} 的日记...`);
      const diary = await generateDailyDiaryService(currentCharacter, date, evts);
      setDiaries(prev => {
        if (prev.some(d => d.date === date)) return prev;
        return [...prev, diary];
      });
      return diary;
    } catch (e) {
      console.error(`自动日记捕获失败 (${date}):`, e);
      return null;
    }
  };

  // 初始化应用 (Async IndexDB)
  useEffect(() => {
    const initApp = async () => {
      initializeApiConfig();
      // 首次启动迁移华欣版数据
      await checkAndMigrate();

      const loadedChar = await loadCharacter();
      const loadedState = await loadTravelState();
      const loadedEvents = await loadEvents();
      const loadedDiaries = await loadDiaries();
      const loadedWardrobe = await loadWardrobe();
      const loadedContacts = await loadSocialContacts();

      if (loadedChar && loadedChar.name) setCharacter(loadedChar);
      if (loadedState && loadedState.isActive) setTravelState(loadedState);
      if (loadedEvents) setEvents(loadedEvents);
      if (loadedDiaries) setDiaries(loadedDiaries);
      if (loadedWardrobe) setWardrobe(loadedWardrobe);
      if (loadedContacts) setSocialContacts(loadedContacts);

      if (loadedState && loadedState.isActive) {
        setCurrentPage('traveling');

        const now = new Date();
        const lastUpdate = loadedState.lastUpdate ? new Date(loadedState.lastUpdate) : now;
        const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        // 补全由于离线错过的日记
        if (hoursPassed > 12) {
          const lastDate = new Date(lastUpdate);
          const currentDate = new Date(now);
          // 循环检查每一天是否需要生成日记
          const tempDate = new Date(lastDate);
          tempDate.setHours(0, 0, 0, 0);
          while (tempDate < currentDate) {
            const dateStr = formatDate(tempDate);
            if (!loadedDiaries.some(d => d.date === dateStr)) {
              await captureDiary(dateStr, loadedEvents, loadedChar);
            }
            tempDate.setDate(tempDate.getDate() + 1);
          }
        }

        if (hoursPassed > 4) {
          setIsWaitingResponse(true);
          try {
            const { catchUpEvent, updatedTravelState } = await catchUpJourney(
              loadedChar, loadedState, hoursPassed
            );
            setEvents(prev => [...prev, catchUpEvent]);
            setTravelState(updatedTravelState);

            if (updatedTravelState.isActive && updatedTravelState.nextEventTime) {
              const timerId = scheduleNextEvent(resultNextHours(updatedTravelState.nextEventTime), () => generateNextEvent());
              setNextEventTimer(timerId);
            }
          } catch (e) {
            console.error('补全失败:', e);
          } finally {
            setIsWaitingResponse(false);
          }
        } else if (loadedState.nextEventTime) {
          const timerId = scheduleNextEvent(resultNextHours(loadedState.nextEventTime), () => generateNextEvent());
          setNextEventTimer(timerId);
        }
      }
    };
    initApp();

    return () => { if (nextEventTimer !== null) clearTimeout(nextEventTimer); };
  }, []);

  // 5分钟巡检：检查是否到达下一次事件的时间点 (自主动作模式)
  useEffect(() => {
    const interval = setInterval(() => {
      if (travelState.isActive && travelState.nextEventTime && !isWaitingResponse) {
        const now = new Date();
        const nextTime = new Date(travelState.nextEventTime);
        if (now >= nextTime) {
          console.log('巡检发现到达预定更新点，触发自主更新...');
          generateNextEvent();
        }
      }
    }, 1000 * 60 * 5); // 5分钟巡检一次
    return () => clearInterval(interval);
  }, [travelState.isActive, travelState.nextEventTime, isWaitingResponse]);

  // 自动监测日期变化，生成日记 (每小时检查一次)
  useEffect(() => {
    const interval = setInterval(() => {
      if (travelState.isActive) {
        const now = new Date();
        const yestStr = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

        if (!diaries.some(d => d.date === yestStr)) {
          captureDiary(yestStr, events, character);
        }
      }
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [travelState.isActive, diaries.length, events.length]);
  const resultNextHours = (nextTime: Date) => {
    const hours = (new Date(nextTime).getTime() - Date.now()) / (3600 * 1000);
    return Math.max(0, hours);
  };

  const asyncSave = async (fn: any, data: any) => {
    try { await fn(data); } catch (e) { console.error('存储失败', e); }
  };

  // 自动存储
  useEffect(() => { if (character.name) asyncSave(saveCharacter, character); }, [character]);
  useEffect(() => { if (travelState.isActive !== undefined) asyncSave(saveTravelState, travelState); }, [travelState]);
  useEffect(() => { if (events.length > 0) asyncSave(saveEvents, events); }, [events]);
  useEffect(() => { if (diaries.length > 0) asyncSave(saveDiaries, diaries); }, [diaries]);
  useEffect(() => { if (wardrobe) asyncSave(saveWardrobe, wardrobe); }, [wardrobe]);

  // 开始旅行
  const startJourney = async () => {
    if (!character.name || !character.departureLocation || !character.destination) {
      alert('请填写完整的角色信息和旅行配置');
      return;
    }

    setIsWaitingResponse(true);
    try {
      const { newEvent, travelState: newTravelState } = await startJourneyService(character, travelMethods, travelStyles);
      setEvents([newEvent]);
      setTravelState(newTravelState);
      setCurrentPage('traveling');

      if (nextEventTimer !== null) clearTimeout(nextEventTimer);
      const timerId = scheduleNextEvent(resultNextHours(newTravelState.nextEventTime!), () => { generateNextEvent(); });
      setNextEventTimer(timerId);
    } catch (error) {
      alert('开始旅行时出错，请重试');
      console.error(error);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  // 生成下次事件
  const generateNextEvent = async () => {
    setTravelState(current => {
      if (!current.isActive) return current;
      (async () => {
        try {
          const latestEvents = await loadEvents();
          const { newEvent, updatedTravelState } = await generateNextEventService(character, current, latestEvents);
          setEvents(prev => [...prev, newEvent]);
          setTravelState(updatedTravelState);
          if (!newEvent.needsUserInput && updatedTravelState.isActive) {
            if (nextEventTimer !== null) clearTimeout(nextEventTimer);
            const timerId = scheduleNextEvent(resultNextHours(updatedTravelState.nextEventTime!), () => { generateNextEvent(); });
            setNextEventTimer(timerId);
          }
        } catch (error) {
          console.error('生成事件时出错:', error);
          const timerId = window.setTimeout(() => generateNextEvent(), 30 * 60 * 1000);
          setNextEventTimer(timerId);
        }
      })();
      return current;
    });
  };

  const sendUserMessage = async () => {
    if (!userMessage.trim() || isWaitingResponse) return;
    setIsWaitingResponse(true);
    try {
      const { newEvent, updatedTravelState } = await processUserMessageService(character, travelState, userMessage);
      setEvents(prev => [...prev, newEvent]);
      setTravelState(updatedTravelState);
      setUserMessage('');
      if (nextEventTimer !== null) clearTimeout(nextEventTimer);
      if (updatedTravelState.isActive) {
        const timerId = scheduleNextEvent(resultNextHours(updatedTravelState.nextEventTime!), () => { generateNextEvent(); });
        setNextEventTimer(timerId);
      }
    } catch (error) {
      alert('发送消息时出错，请重试');
      console.error(error);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  const generateDailyDiaryManual = async () => {
    const today = formatDate(new Date());
    if (diaries.some(d => d.date === today)) {
      alert('今日已有记录，请查看日历。');
      return;
    }
    setIsWaitingResponse(true);
    await captureDiary(today, events, character);
    setIsWaitingResponse(false);
  };

  const resetAllData = async () => {
    if (nextEventTimer !== null) { clearTimeout(nextEventTimer); setNextEventTimer(null); }
    await clearAllData();
    setCharacter({ name: '', description: '', departureLocation: '', destination: '', travelMethod: '', travelStyle: '' });
    setTravelState({ isActive: false, currentLocation: '', currentActivity: '', lastUpdate: null, nextEventTime: null, stats: { joy: 100, experience: 0, discovery: 0 } });
    setEvents([]); setDiaries([]); setWardrobe(undefined); setSocialContacts([]); setUserMessage(''); setCurrentPage('setup');
    localStorage.removeItem('hua_hin_migrated_version');
  };

  const renderMobileNav = () => (
    <nav className="nav-bar">
      <div className={`nav-item ${currentPage === 'setup' ? 'active' : ''}`} onClick={() => setCurrentPage('setup')}>
        <User size={20} />
        <span>角色</span>
      </div>
      <div className={`nav-item ${currentPage === 'traveling' ? 'active' : ''}`} onClick={() => setCurrentPage('traveling')}>
        <MapPin size={20} />
        <span>旅行中</span>
      </div>
      <div className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`} onClick={() => setCurrentPage('stats')}>
        <Activity size={20} />
        <span>数值</span>
      </div>
      <div className={`nav-item ${currentPage === 'diary' ? 'active' : ''}`} onClick={() => setCurrentPage('diary')}>
        <BookOpen size={20} />
        <span>日记</span>
      </div>
      <div className={`nav-item ${currentPage === 'wardrobe' ? 'active' : ''}`} onClick={() => setCurrentPage('wardrobe')}>
        <Shirt size={20} />
        <span>衣柜</span>
      </div>
      <div className={`nav-item ${currentPage === 'social' ? 'active' : ''}`} onClick={() => setCurrentPage('social')}>
        <Users size={20} />
        <span>关系</span>
      </div>
      <div className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`} onClick={() => setCurrentPage('settings')}>
        <Settings size={20} />
        <span>设置</span>
      </div>
    </nav>
  );

  return (
    <div className="app-container">
      <section className="intro-side">
        <h1 className="main-title">AVATAR<br />JOURNEY</h1>
        <p className="intro-text">
          欢迎来到这个安静的角落。在这里，生活不再只是枯燥的日程，而是一场关于相遇、直觉与风息的漫长告白。化身会在你忙碌或睡去时，于万里之外的真实纬度上替你前行，捕捉那些被日常漏掉的细碎诗意。这是一场跨越时区的平行生活实验，献给每一个渴望远方的灵魂。
        </p>
        <div className="space-y-4">
          <div className="feature-box">
            <h3 className="flex items-center gap-2 mb-2"><HelpCircle size={20} /> 什么是 Avatar Journey?</h3>
            <p className="text-sm">这是一个运行在浏览器中的半自主旅行模拟器。你设定起点与终点，AI 化身将代替你踏上旅程，经历真实的交通延误、天气变化与人文奇遇。</p>
          </div>
          <div className="feature-box">
            <h3 className="flex items-center gap-2 mb-2"><Info size={20} /> 智能同步 & 离线补全</h3>
            <p className="text-sm">系统与真实世界时间挂钩。当你离线时，化身依然在前行。再次打开时，你将收到这段时间的“补全日志”与一张胶片质感的“随机抓拍”。</p>
          </div>
        </div>
      </section>

      <section className="phone-side">
        <div className="iphone-frame">
          <div className="iphone-notch"></div>
          <div className="iphone-screen">
            <header className="mobile-header">
              <h2 className="brutalist-title text-xl">
                {currentPage === 'setup' && '角色档案设定'}
                {currentPage === 'traveling' && '实时历程'}
                {currentPage === 'stats' && '观测终端'}
                {currentPage === 'diary' && '旅行档案室'}
                {currentPage === 'wardrobe' && '私人衣橱'}
                {currentPage === 'social' && '人际共鸣网'}
                {currentPage === 'settings' && '系统管理'}
              </h2>
            </header>

            <main className="flex-1 overflow-y-auto">
              {currentPage === 'setup' && (
                <SetupPage
                  character={character}
                  setCharacter={setCharacter}
                  popularLocations={popularLocations}
                  travelMethods={travelMethods}
                  travelStyles={travelStyles}
                  startJourney={startJourney}
                  isWaitingResponse={isWaitingResponse}
                  travelState={travelState}
                />
              )}
              {currentPage === 'traveling' && (
                <TravelingPage
                  character={character}
                  travelState={travelState}
                  events={events}
                  userMessage={userMessage}
                  setUserMessage={setUserMessage}
                  sendUserMessage={sendUserMessage}
                  isWaitingResponse={isWaitingResponse}
                  generateDailyDiary={generateDailyDiaryManual}
                />
              )}
              {currentPage === 'stats' && <StatsPage travelState={travelState} />}
              {currentPage === 'diary' && <DiaryPage character={character} diaries={diaries} />}
              {currentPage === 'wardrobe' && <WardrobePage wardrobe={wardrobe} />}
              {currentPage === 'social' && <SocialPage contacts={socialContacts} />}
              {currentPage === 'settings' && <SettingsPage resetAllData={resetAllData} />}
            </main>
            {renderMobileNav()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;