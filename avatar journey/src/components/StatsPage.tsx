import React from 'react';
import { TravelState } from '../types';
import { Heart, Zap, ShieldAlert, Info, Battery, Activity, Coins } from 'lucide-react';

interface StatsPageProps {
    travelState: TravelState;
}

const StatsPage: React.FC<StatsPageProps> = ({ travelState }) => {
    const stats = travelState?.stats;

    if (!stats) {
        return <div className="p-6 text-center opacity-50 font-black uppercase text-xs">正在校准同步信号...</div>;
    }

    const StatItem = ({ label, value, icon: Icon, subLabel, colorClass, unit = "%" }: any) => (
        <div className="stat-container">
            <div className="stat-label-row">
                <div className="flex items-center gap-2">
                    <Icon size={18} />
                    <span className="list-item-title text-sm">{label}</span>
                </div>
                <span className="stat-value font-black">{Math.round(value)}{unit}</span>
            </div>
            <div className="stat-bar-outer">
                <div
                    className={`stat-bar-inner ${colorClass}`}
                    style={{ width: `${Math.min(100, Math.round(value))}%` }}
                />
            </div>
            <div className="text-[10px] font-black uppercase text-gray-400 mt-1">{subLabel}</div>
        </div>
    );

    return (
        <div className="page-container space-y-6 pb-10">
            <div className="card">
                <div className="section-title">
                    <Activity size={18} /> 数值观测终端
                </div>

                <div className="space-y-6 pt-4">
                    {/* 核心状态 */}
                    <div className="grid grid-cols-1 gap-6">
                        <StatItem
                            label="心情 / MOOD"
                            subLabel="Vitality & Emotional State"
                            value={stats.mood ?? stats.joy}
                            icon={Heart}
                            colorClass="bg-black"
                        />
                        <StatItem
                            label="能量 / ENERGY"
                            subLabel="Physical Reserve"
                            value={stats.energy ?? 100}
                            icon={Battery}
                            colorClass="bg-black"
                        />
                        <StatItem
                            label="经验 / EXP"
                            subLabel="Skill & Knowledge Growth"
                            value={stats.experience}
                            icon={Zap}
                            colorClass="bg-black"
                        />
                    </div>

                    {/* 资产情况 */}
                    {(stats.money_cny !== undefined || stats.money_local !== undefined) && (
                        <div className="mt-4 p-3 border-2 border-black bg-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins size={16} />
                                <span className="font-black text-xs uppercase">资产储备 / ASSETS</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span>人民币 (CNY):</span>
                                <span className="text-lg">¥{stats.money_cny ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold mt-1">
                                <span>泰铢 (THB):</span>
                                <span className="text-lg">฿{stats.money_local ?? 0}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card bg-gray-50 border-gray-300">
                <div className="flex items-start gap-3">
                    <Info size={20} className="mt-1" />
                    <div>
                        <div className="font-black text-xs uppercase mb-1">华欣架构同步说明</div>
                        <p className="text-[10px] leading-relaxed text-gray-600">
                            <b>能量</b>：长途跋涉或深度互动会消耗能量，休息可缓慢恢复。<br />
                            <b>双币系统</b>：自动监测并管理货币兑换，真实演算旅行支出。<br />
                            <b>关系积淀</b>：部分数值增长来源于“人际共鸣”中解锁的深度剧情。
                        </p>
                    </div>
                </div>
            </div>

            <div className="card bg-black text-white border-none shadow-[8px_8px_0px_#ddd]">
                <div className="flex items-start gap-4">
                    <ShieldAlert className="text-white" size={24} />
                    <div>
                        <h3 className="font-black uppercase text-xs mb-1">系统日志：时空记忆已融合</h3>
                        <p className="text-[9px] opacity-70 leading-relaxed">
                            化身“阿葡”的既往记忆已成功导入。当前的曼谷/华欣历程将持续影响上述数值的周期性演变。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
