import React, { useRef, useEffect } from 'react';
import { MapPin, Activity, Send, BookOpen, Download } from 'lucide-react';
import { Character, TravelState, TravelEvent } from '../types';

interface TravelingPageProps {
  character: Character;
  travelState: TravelState;
  events: TravelEvent[];
  userMessage: string;
  setUserMessage: (val: string) => void;
  sendUserMessage: () => void;
  isWaitingResponse: boolean;
  generateDailyDiary: () => void;
}

const TravelingPage: React.FC<TravelingPageProps> = ({
  travelState,
  events,
  userMessage,
  setUserMessage,
  sendUserMessage,
  isWaitingResponse,
  generateDailyDiary
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const isFinished = travelState.isFinished;

  const exportEvents = () => {
    const content = events.map(e => `[${new Date(e.timestamp).toLocaleString()}] ${e.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey_signals_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* 当前状态卡片 */}
      <div className="card bg-white">
        <div className="section-title">
          <Activity size={18} /> 当前信标
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-black mt-1" size={20} />
            <div className="flex-1">
              <div className="label-small">当前坐标 (Location)</div>
              <div className="font-black text-lg leading-tight">{travelState.currentLocation || '信号搜索中...'}</div>
              {travelState.specificLocation && (
                <div className="text-[10px] font-bold uppercase text-gray-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                  {travelState.specificLocation}
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-100 p-4 border-l-8 border-black shadow-[4px_4px_0px_#ddd]">
            <div className="label-small">实时动态 (Activity)</div>
            <div className="text-sm font-bold italic mb-2">“{travelState.currentActivity || '正在连接链路...'}”</div>
          </div>
        </div>
      </div>

      {/* 手动干预 */}
      {!isFinished && (
        <div className="card bg-white border-t-8 border-black shadow-[4px_4px_0px_#ddd]">
          <div className="section-title">手动干预 / Manual Intervention</div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="发送指令干预化身的行动..."
                className="input-brutalist mb-0"
                style={{ flex: 1, width: 'auto' }}
                disabled={isWaitingResponse}
                onKeyDown={(e) => e.key === 'Enter' && sendUserMessage()}
              />
              <button
                onClick={sendUserMessage}
                disabled={isWaitingResponse || !userMessage.trim()}
                className="btn-black shadow-none mb-0"
                style={{ width: '3rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
              >
                <Send size={18} />
              </button>
            </div>

            <div className="mt-2">
              <button
                onClick={generateDailyDiary}
                disabled={isWaitingResponse}
                className="w-full btn-black py-3 text-xs bg-white text-black hover:bg-black hover:text-white flex items-center justify-center gap-2 transition-all border-2 border-black"
              >
                <BookOpen size={16} /> 存档今日轨迹
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 事件流 - 整合为一个大框 */}
      <div className="card flex flex-col h-[500px] bg-white border-4 p-0 overflow-hidden">
        <div className="section-title flex justify-between items-center px-4 py-2 border-b-4 border-black bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">事件流 (Signals Logging)</div>
          <button
            onClick={exportEvents}
            className="p-1 hover:bg-gray-100 border-2 border-black rounded transition-colors"
            title="导出 MD 存档"
          >
            <Download size={14} />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"
        >
          {events.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-black uppercase text-[10px] tracking-widest">等待信号接入...</div>
          ) : (
            <div className="space-y-12">
              {events.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-tighter">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="h-[1px] flex-1 bg-gray-200"></span>
                    {event.type === 'user_intervention' && (
                      <span className="text-[8px] font-black uppercase border border-black px-1">Intervention</span>
                    )}
                  </div>
                  <div className={`text-sm font-bold leading-relaxed whitespace-pre-wrap ${event.type === 'user_intervention' ? 'pl-4 border-l-4 border-black italic text-gray-500' : 'text-gray-800'}`}>
                    {event.content}
                  </div>
                  {event.userMessage && (
                    <div className="mt-3 text-[10px] bg-gray-50 p-2 border border-black border-dashed font-black opacity-60">
                      用户干预指令: {event.userMessage}
                    </div>
                  )}
                </div>
              ))}
              <div className="h-20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelingPage;