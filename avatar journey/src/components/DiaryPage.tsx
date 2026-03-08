import React, { useState } from 'react';
import { BookOpen, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Character, Diary } from '../types';

interface DiaryPageProps {
  character: Character;
  diaries: Diary[];
}

const DiaryPage: React.FC<DiaryPageProps> = ({ diaries }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    diaries.length > 0 ? diaries[diaries.length - 1].date : new Date().toISOString().split('T')[0]
  );

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
                <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-dashed border-gray-100">
                  {selectedDiary.keyEvents.map((tag, idx) => (
                    <span key={idx} className="text-[9px] font-black uppercase bg-gray-100 border border-black px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;