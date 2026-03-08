import React from 'react';
import { Wardrobe } from '../types';
import { Shirt, Briefcase, Info } from 'lucide-react';

interface WardrobePageProps {
    wardrobe?: Wardrobe;
}

const WardrobePage: React.FC<WardrobePageProps> = ({ wardrobe }) => {
    if (!wardrobe) {
        return (
            <div className="p-6 text-center">
                <div className="brutalist-card p-4 bg-gray-100 border-2 border-black">
                    <p>衣柜尚未整理。在旅行中获取新的穿搭建议吧。</p>
                </div>
            </div>
        );
    }

    const { current_outfit, packed_clothes, notes } = wardrobe;

    return (
        <div className="flex flex-col gap-6 p-4 animate-in fade-in slide-in-from-bottom-4">
            {/* 当前穿搭 */}
            <section>
                <h3 className="flex items-center gap-2 mb-3 font-bold text-lg border-b-2 border-black pb-1">
                    <Shirt size={20} /> 当前穿搭 - {current_outfit.overall_vibe}
                </h3>
                <div className="brutalist-card bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <ul className="space-y-2">
                        <li className="flex justify-between">
                            <span className="font-bold">上装:</span>
                            <span>{current_outfit.top}</span>
                        </li>
                        {current_outfit.mid && (
                            <li className="flex justify-between">
                                <span className="font-bold">中层:</span>
                                <span>{current_outfit.mid}</span>
                            </li>
                        )}
                        <li className="flex justify-between">
                            <span className="font-bold">下装:</span>
                            <span>{current_outfit.bottom}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="font-bold">鞋履:</span>
                            <span>{current_outfit.shoes}</span>
                        </li>
                        {current_outfit.accessories.length > 0 && (
                            <li className="mt-2 pt-2 border-t border-dashed border-gray-400">
                                <span className="font-bold block mb-1">配饰:</span>
                                <div className="flex flex-wrap gap-2">
                                    {current_outfit.accessories.map((acc, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-black text-white text-xs">
                                            {acc}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </section>

            {/* 行李清单 */}
            <section>
                <h3 className="flex items-center gap-2 mb-3 font-bold text-lg border-b-2 border-black pb-1">
                    <Briefcase size={20} /> 背包清单
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {packed_clothes.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-2 border-black bg-white hover:bg-gray-50 transition-colors">
                            <span className="font-medium">{item.item}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs px-1 border border-black uppercase">{item.type}</span>
                                <span className="font-bold italic">x{item.quantity}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 备注 */}
            {notes && (
                <section className="mt-2">
                    <div className="brutalist-card bg-yellow-100 border-2 border-black p-3 flex gap-3 items-start italic text-sm">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p>{notes}</p>
                    </div>
                </section>
            )}
        </div>
    );
};

export default WardrobePage;
