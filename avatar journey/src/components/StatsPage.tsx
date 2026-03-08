import React, { useEffect, useRef } from 'react';
import { TravelState, TravelEvent } from '../types';
import { Heart, Zap, Info, Battery, Activity, Coins, Map as MapIcon } from 'lucide-react';

interface StatsPageProps {
    travelState: TravelState;
    events: TravelEvent[];
}

// 声明全局 L 以防止 TS 报错
declare const L: any;

const StatsPage: React.FC<StatsPageProps> = ({ travelState, events }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const stats = travelState?.stats;

    useEffect(() => {
        if (!mapRef.current || typeof L === 'undefined') return;

        if (leafletMap.current) {
            leafletMap.current.remove();
        }

        const points = events
            .filter(e => e.locationCoords)
            .map(e => [e.locationCoords!.lat, e.locationCoords!.lng] as [number, number]);

        const currentPos = travelState.locationCoords || (points.length > 0 ? { lat: points[points.length - 1][0], lng: points[points.length - 1][1] } : null);

        const center = currentPos ? [currentPos.lat, currentPos.lng] : [12.5684, 99.9577];
        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: false
        }).setView(center, 15);

        leafletMap.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(map);

        if (points.length > 1) {
            L.polyline(points, {
                color: 'black',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 8'
            }).addTo(map);
        }

        if (currentPos) {
            const circle = L.circleMarker([currentPos.lat, currentPos.lng], {
                radius: 8,
                fillColor: "black",
                color: "white",
                weight: 3,
                opacity: 1,
                fillOpacity: 1
            }).addTo(map);
            circle.bindPopup(`<b style="font-family: inherit;">当前时空坐标</b><br/>${travelState.currentLocation}`).openPopup();
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, [travelState.locationCoords, events.length]);

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

            {/* 地图页 */}
            <div className="card p-0 overflow-hidden border-4 border-black relative">
                <div className="absolute top-4 left-4 z-[1000] bg-black text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_white] flex items-center gap-2">
                    <MapIcon size={12} /> 地图轨迹 / TRAJECTORY
                </div>
                <div
                    ref={mapRef}
                    className="w-full h-[300px] bg-gray-200"
                    style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.9)' }}
                />
            </div>

            <div className="card bg-gray-50 border-gray-300">
                <div className="flex items-start gap-3">
                    <Info size={20} className="mt-1" />
                    <div>
                        <div className="font-black text-xs uppercase mb-1">数值说明</div>
                        <p className="text-[10px] leading-relaxed text-gray-600">
                            <b>能量</b>：长途跋涉或深度互动会消耗能量，休息可缓慢恢复。<br />
                            <b>双币系统</b>：自动监测并管理货币兑换，真实演算旅行支出。<br />
                            <b>经纬轨迹</b>：由终端自动捕捉的虚拟定位信号，实时生成时空轨迹线。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
