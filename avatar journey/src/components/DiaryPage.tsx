import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Map as MapIcon } from 'lucide-react';
import { Character, Diary, TravelEvent } from '../types';

interface DiaryPageProps {
  character: Character;
  diaries: Diary[];
  events: TravelEvent[];
}

declare const L: any;

const DiaryPage: React.FC<DiaryPageProps> = ({ diaries, events }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    diaries.length > 0 ? diaries[diaries.length - 1].date : new Date().toISOString().split('T')[0]
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const diaryEntries = diaries.reduce((acc, d) => {
    acc[d.date] = d;
    return acc;
  }, {} as Record<string, Diary>);

  const selectedDiary = diaryEntries[selectedDate];

  // 渲染当日地图
  useEffect(() => {
    if (!selectedDiary || !mapContainerRef.current || typeof L === 'undefined') return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // 过滤当日带坐标的事件
    const dayPoints = events
      .filter(e => {
        const eDate = e.timestamp instanceof Date ? e.timestamp.toISOString().split('T')[0] : String(e.timestamp).split('T')[0];
        return eDate === selectedDate && e.locationCoords;
      })
      .map(e => [e.locationCoords!.lat, e.locationCoords!.lng] as [number, number]);

    if (dayPoints.length === 0) return;

    const center = dayPoints[dayPoints.length - 1];
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView(center, 14);

    leafletMapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // 绘制当日虚线轨迹
    if (dayPoints.length > 1) {
      L.polyline(dayPoints, {
        color: 'black',
        weight: 3,
        opacity: 0.6,
        dashArray: '5, 10'
      }).addTo(map);
    }

    // 事件点标记
    dayPoints.forEach((p, idx) => {
      L.circleMarker(p, {
        radius: idx === dayPoints.length - 1 ? 6 : 4,
        fillColor: idx === dayPoints.length - 1 ? "black" : "#666",
        color: "white",
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [selectedDate, selectedDiary, events.length]);

  return (
    <div className="page-container space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="hover:opacity-50"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} />
              <span className="font-black text-sm">{viewYear} / {viewMonth + 1}</span>
            </div>
            <button onClick={handleNextMonth} className="hover:opacity-50"><ChevronRight size={16} /></button>
          </div>
          <div className="label-small text-[9px] opacity-40 italic">Mnemonic Archive</div>
        </div>

        <div className="calendar-grid">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-[9px] font-black text-center mb-1">{d}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasData = !!diaryEntries[dateStr];
            const isActive = selectedDate === dateStr;

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`calendar-day ${isActive ? 'active' : ''} ${hasData ? 'has-data' : ''} hover:bg-black hover:text-white transition-all`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {!selectedDiary ? (
        <div className="card border-dashed border-4 bg-gray-50 flex flex-col items-center justify-center py-16 opacity-40">
          <BookOpen size={40} className="mb-4" />
          <p className="font-black uppercase text-[10px] text-center">
            {selectedDate} <br />
            NO SIGNAL CAPTURED
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-2">
          <div className="card p-0 overflow-hidden border-4">
            <div className="border-b-4 border-black p-4 bg-white flex justify-between items-center">
              <div>
                <div className="label-small text-black">LOG_SEQUENCE</div>
                <span className="font-black text-xs">{selectedDiary.date}</span>
              </div>
              <span className="font-black text-[9px] uppercase bg-black text-white px-2 py-1">ARCHIVED_LOG</span>
            </div>

            {selectedDiary.imageUrl && (
              <div className="border-b-4 border-black bg-black h-48 overflow-hidden">
                <img
                  src={selectedDiary.imageUrl}
                  alt={selectedDiary.title}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                />
              </div>
            )}

            <div className="p-6">
              <h2 className="font-black text-2xl uppercase mb-4 leading-tight tracking-tighter">
                {selectedDiary.title}
              </h2>
              <p className="text-sm font-bold leading-relaxed mb-6 text-gray-700 whitespace-pre-wrap">
                {selectedDiary.content}
              </p>

              {selectedDiary.keyEvents && (
                <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-dashed border-gray-100 mb-6">
                  {selectedDiary.keyEvents.map((tag, idx) => (
                    <span key={idx} className="text-[9px] font-black uppercase bg-gray-100 border border-black px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 当日轨迹地图 */}
              <div className="border-4 border-black relative overflow-hidden">
                <div className="absolute top-2 left-2 z-[1000] bg-black text-white px-2 py-0.5 font-black text-[8px] uppercase tracking-tighter shadow-[2px_2px_0px_white] flex items-center gap-1">
                  <MapIcon size={10} /> DAY_TRAJECTORY
                </div>
                <div
                  ref={mapContainerRef}
                  className="w-full h-48 bg-gray-50"
                  style={{ filter: 'grayscale(100%) brightness(0.9)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;