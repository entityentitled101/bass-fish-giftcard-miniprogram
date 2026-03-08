import React, { useState } from 'react';
import { SocialContact } from '../types';
import { Users, Heart, Star, MessageSquare, ChevronRight, Smile, BookOpen } from 'lucide-react';

interface SocialPageProps {
    contacts: SocialContact[];
}

const RatingDisplay: React.FC<{ level: number, type?: 'friend' | 'romantic' }> = ({ level, type }) => {
    const Icon = type === 'romantic' ? Heart : Star;
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Icon
                    key={i}
                    size={14}
                    className={`${i < level ? 'text-black' : 'text-gray-200'}`}
                    fill={i < level ? "currentColor" : "none"}
                />
            ))}
        </div>
    );
};

const SocialPage: React.FC<SocialPageProps> = ({ contacts }) => {
    const [selectedContact, setSelectedContact] = useState<SocialContact | null>(null);

    const activeContacts = contacts.filter(c => !c.archived);
    const archivedContacts = contacts.filter(c => c.archived);

    if (selectedContact) {
        return (
            <div className="page-container animate-in fade-in slide-in-from-right-4">
                <button
                    onClick={() => setSelectedContact(null)}
                    className="flex items-center gap-2 mb-6 font-black text-xs uppercase underline hover:opacity-60 transition-all"
                >
                    <ChevronRight size={16} className="rotate-180" /> 返回关系网 / BACK
                </button>

                <div className="card overflow-hidden">
                    <div className="p-8 border-b-4 border-black bg-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="brutalist-title text-4xl mb-1">{selectedContact.name}</h2>
                                <p className="text-xs font-black uppercase text-gray-400 tracking-widest">{selectedContact.relationship_status || '未知关系'}</p>
                            </div>
                            <RatingDisplay
                                level={selectedContact.current_dynamics?.attraction_level || 0}
                                type={selectedContact.relationType}
                            />
                        </div>

                        <p className="text-sm font-bold leading-relaxed italic text-gray-700">
                            “ {selectedContact.personality || '那个在旅途中留下印记的人。'} ”
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-0">
                        <div className="p-6 border-b-4 border-black bg-gray-50">
                            <h4 className="flex items-center gap-2 font-black text-xs uppercase mb-4">
                                <Smile size={14} /> 印象观测 (Observation)
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <div className="label-small">外貌描述</div>
                                        <div className="text-xs font-bold leading-relaxed">{selectedContact.physical?.appearance || '平和的泰国面孔'}</div>
                                    </div>
                                    <div className="flex gap-4">
                                        {selectedContact.physical?.skin && (
                                            <div>
                                                <div className="label-small">肤色</div>
                                                <div className="text-[10px] font-bold">{selectedContact.physical.skin}</div>
                                            </div>
                                        )}
                                        {selectedContact.physical?.hair && (
                                            <div>
                                                <div className="label-small">发型</div>
                                                <div className="text-[10px] font-bold">{selectedContact.physical.hair}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="label-small">标志特征</div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedContact.physical?.distinctive_features?.map((f, i) => (
                                                <span key={i} className="text-[9px] bg-white border border-black px-1 font-bold">#{f}</span>
                                            )) || <span className="text-[9px] text-gray-400">暂无捕捉</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="label-small">职业 / 背景</div>
                                        <div className="text-xs font-bold">{selectedContact.basic_info?.occupation || '旅途中的旅人'}</div>
                                    </div>
                                    <div>
                                        <div className="label-small">体态 / 身高</div>
                                        <div className="text-[10px] font-bold">{selectedContact.physical?.build || '匀称'} {selectedContact.physical?.height && `(${selectedContact.physical.height})`}</div>
                                    </div>
                                    <div>
                                        <div className="label-small">常用穿着</div>
                                        <div className="text-xs font-bold leading-tight">{selectedContact.physical?.clothing || '休闲旅行装束'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedContact.background && (
                            <div className="p-6 bg-white border-b-4 border-black">
                                <h4 className="flex items-center gap-2 font-black text-xs uppercase mb-2">
                                    <BookOpen size={14} /> 背景叙事 (Narrative)
                                </h4>
                                <p className="text-xs font-bold leading-relaxed text-gray-600">
                                    {selectedContact.background}
                                </p>
                            </div>
                        )}

                        <div className="p-6 bg-gray-50">
                            <h4 className="flex items-center gap-2 font-black text-xs uppercase mb-4">
                                <MessageSquare size={14} /> 历次交集 (Log)
                            </h4>
                            <div className="space-y-6">
                                {selectedContact.interactions.map((interaction, i) => (
                                    <div key={i} className="border-l-4 border-black pl-4">
                                        <span className="text-[9px] font-black opacity-30 block mb-1">{interaction.date}</span>
                                        <p className="text-xs font-bold mb-2 leading-tight">{interaction.context}</p>
                                        <div className="space-y-1">
                                            {interaction.key_moments.map((moment, j) => (
                                                <div key={j} className="flex gap-2 items-start text-xs font-bold text-gray-500">
                                                    <span className="mt-1.5 w-1 h-1 bg-black shrink-0"></span>
                                                    <span>{moment}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {interaction.revelation && (
                                            <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200 font-bold italic text-xs text-black">
                                                “ {interaction.revelation} ”
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container flex flex-col gap-20 pb-40 animate-in fade-in slide-in-from-bottom-4">
            <section>
                <div className="section-title">
                    <Users size={18} /> 活跃关系网 / Active Signals
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {activeContacts.length === 0 ? (
                        <div className="p-10 border-4 border-dashed border-gray-200 text-center font-black text-gray-300 uppercase text-xs">
                            目前还没有建立深刻的关系
                        </div>
                    ) : (
                        activeContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className="card group hover:bg-black hover:text-white transition-all cursor-pointer mb-0"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-xl leading-none uppercase tracking-tighter">{contact.name}</h4>
                                            <RatingDisplay
                                                level={contact.current_dynamics?.attraction_level || 0}
                                                type={contact.relationType}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold opacity-60 uppercase">{contact.relationship_status || '未知'}</p>
                                    </div>
                                    <ChevronRight size={24} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {archivedContacts.length > 0 && (
                <section className="mt-20 pt-20 border-t-4 border-black border-dashed">
                    <div className="section-title border-gray-200 text-gray-400 mb-6">
                        <MessageSquare size={18} /> 历史共鸣 / Archives
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {archivedContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className="flex justify-between items-center p-6 border-2 border-black bg-gray-50 grayscale opacity-60 hover:opacity-100 cursor-pointer transition-all hover:bg-white"
                            >
                                <span className="font-black text-xs uppercase italic">{contact.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase opacity-50">{(contact.last_contact || '').split('T')[0]}</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SocialPage;
