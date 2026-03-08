import React, { useState, useEffect } from 'react';
import { User, MapPin, Lock, Archive } from 'lucide-react';
import { Character, TravelMethodOption, TravelStyleOption, PopularLocation, TravelState } from '../types';
import { validateCharacter } from '../utils/helpers';
import { getSlots, createArchive, clearAndStartNew, SaveSlot } from '../services/saveService';

interface SetupPageProps {
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  popularLocations: PopularLocation[];
  travelMethods: TravelMethodOption[];
  travelStyles: TravelStyleOption[];
  startJourney: () => void;
  isWaitingResponse: boolean;
  travelState: TravelState;
}

const SetupPage: React.FC<SetupPageProps> = ({
  character,
  setCharacter,
  popularLocations,
  travelMethods,
  travelStyles,
  startJourney,
  isWaitingResponse,
  travelState
}) => {
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const isLocked = travelState?.isActive || travelState?.isFinished;

  useEffect(() => {
    setSlots(getSlots());
  }, []);

  const handleInputChange = (field: keyof Character, value: string) => {
    if (isLocked) return;
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const handlePhysicalChange = (field: string, value: any) => {
    if (isLocked) return;
    setCharacter(prev => ({
      ...prev,
      physical: { ...prev.physical, [field]: value }
    }));
  };

  const handleArchiveAndNew = async () => {
    if (window.confirm('确立新档案将封存当前的旅程记录。是否确认将当前进度归档并开始新的旅行探索？')) {
      await createArchive(character.name || '未命名旅人');
      await clearAndStartNew();
      window.location.reload();
    }
  };

  return (
    <div className="page-container space-y-6 pb-20">
      {/* 存档与历程管理 */}
      <div className="card border-dashed border-gray-400 bg-gray-50">
        <div className="flex justify-between items-start mb-0">
          <div>
            <h3 className="card-title text-gray-400 mb-0">存档管理 / SLOTS</h3>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-tighter">Current: {character.name || 'Default'}</p>
          </div>
          <button
            onClick={handleArchiveAndNew}
            className="px-3 py-1 bg-white border-2 border-black text-[10px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            开启新历程
          </button>
        </div>

        {slots.length > 0 && (
          <div className="space-y-2 mt-4">
            {slots.map(slot => (
              <div key={slot.id} className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <div>
                  <div className="font-black text-[10px] uppercase">{slot.name}</div>
                  <div className="text-[8px] opacity-40">{slot.description}</div>
                </div>
                <button className="text-[9px] font-black underline opacity-40 hover:opacity-100 italic">回溯</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLocked && (
        <div className="card bg-black text-white flex items-center gap-3 animate-pulse">
          <Lock size={18} />
          <div className="font-black uppercase text-[10px] tracking-widest">ARCHIVE_LOCKED / 历程锁定中</div>
        </div>
      )}

      {/* 角色核心档案 */}
      <div className="card">
        <h3 className="card-title select-none">
          <User className="w-5 h-5" />
          身份信标设定 / IDENTITY
        </h3>

        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-small">姓名 (Name)</label>
              <input
                type="text"
                value={character.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-brutalist"
                placeholder="化身名称"
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="label-small">发色 (Hair)</label>
              <input
                type="text"
                value={character.physical?.hair || ''}
                onChange={(e) => handlePhysicalChange('hair', e.target.value)}
                className="input-brutalist"
                placeholder="如：银色短发"
                disabled={isLocked}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-small">身高 (Height)</label>
              <input
                type="number"
                value={character.physical?.height || ''}
                onChange={(e) => handlePhysicalChange('height', parseInt(e.target.value))}
                className="input-brutalist"
                placeholder="cm"
                disabled={isLocked}
              />
            </div>
            <div>
              <label className="label-small">体重 (Weight)</label>
              <input
                type="number"
                value={character.physical?.weight || ''}
                onChange={(e) => handlePhysicalChange('weight', parseInt(e.target.value))}
                className="input-brutalist"
                placeholder="kg"
                disabled={isLocked}
              />
            </div>
          </div>

          <div>
            <label className="label-small">生物性/外貌自述 (Appearance Description)</label>
            <textarea
              placeholder="描述角色的外貌特征、气质等..."
              className="input-brutalist"
              value={character.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              disabled={isLocked}
            />
          </div>
        </div>
      </div>

      {/* 航线规划 */}
      <div className="card">
        <h3 className="card-title">
          <MapPin className="w-5 h-5" />
          全境航线规划 / ROUTE
        </h3>

        <div className="grid grid-cols-2 gap-4 pt-2 mb-6">
          <div>
            <label className="label-small">出发地</label>
            <input
              type="text"
              value={character.departureLocation || ''}
              onChange={(e) => handleInputChange('departureLocation', e.target.value)}
              className="input-brutalist"
              placeholder="起点"
              list="locations"
              disabled={isLocked}
            />
          </div>
          <div>
            <label className="label-small">目的地</label>
            <input
              type="text"
              value={character.destination || ''}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className="input-brutalist"
              placeholder="终点"
              list="locations"
              disabled={isLocked}
            />
          </div>
        </div>

        <datalist id="locations">
          {popularLocations.map(location => (
            <option key={location} value={location} />
          ))}
        </datalist>

        <div className="mb-6">
          <div className="section-title">旅行方式 / Methodology</div>
          <div className="flex flex-col gap-2">
            {travelMethods.map(method => (
              <label
                key={method.id}
                className={`flex items-start gap-4 p-3 border-2 border-black cursor-pointer transition-all ${character.travelMethod === method.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="travelMethod"
                  value={method.id}
                  checked={character.travelMethod === method.id}
                  onChange={(e) => handleInputChange('travelMethod', e.target.value)}
                  className="hidden"
                  disabled={isLocked}
                />
                <div className="flex-1">
                  <div className="font-black text-xs uppercase">{method.name}</div>
                  <div className={`text-[10px] leading-tight ${character.travelMethod === method.id ? 'opacity-60' : 'opacity-40'}`}>
                    {method.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="section-title">旅行风格 / Aesthetic Style</div>
          <div className="grid grid-cols-2 gap-3">
            {travelStyles.map(style => (
              <label
                key={style.id}
                className={`flex items-center justify-center p-4 border-2 border-black cursor-pointer text-center transition-all ${character.travelStyle === style.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                <input
                  type="radio"
                  name="travelStyle"
                  value={style.id}
                  checked={character.travelStyle === style.id}
                  onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                  className="hidden"
                  disabled={isLocked}
                />
                <span className="font-black text-xs">{style.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {!isLocked && (
        <button
          onClick={startJourney}
          disabled={isWaitingResponse || !validateCharacter(character)}
          className="btn-black w-full py-4 text-sm tracking-[0.2em] font-black uppercase"
        >
          {isWaitingResponse ? 'Establishing Link...' : '确立档案并启动旅程 v1.1'}
        </button>
      )}
    </div>
  );
};

export default SetupPage;