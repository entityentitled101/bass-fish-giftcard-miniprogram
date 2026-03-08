import { setValue, clearStore } from './db';
import { SocialContact, Diary, Wardrobe } from '../types';

const HUA_HIN_CHARACTER = {
    name: "阿葡",
    englishName: "A-Pu",
    nickname: "阿葡",
    description: "性格平静而有力量，眼神中透着一种敏锐观察力。她有着银色的短发，身形娇小纤细（159cm / 43kg），但举手投足间带着一种长期独立旅行者的干练。她拥有艺术史背景，习惯通过速写本而非相机来解构这个世界。",
    mbti: "INTJ",
    physical: {
        height: 159,
        weight: 43,
        hair: "银色短发",
        appearance: "娇小纤细，眼神平静而锐利",
        distinctive: "随身携带写生本、iPad，气质知性而独立"
    },
    background: {
        education: "艺术史学士",
        interests: ["戏剧艺术", "东南亚宗教建筑", "速写"],
        skills: ["专业绘画", "跨文化沟通", "文献考据"]
    },
    departureLocation: "上海",
    destination: "泰国华欣",
    travelMethod: "airplane",
    travelStyle: "cultural"
};

const HUA_HIN_WARDROBE: Wardrobe = {
    last_updated: "2026-02-22T01:30:00+08:00",
    current_outfit: {
        overall_vibe: "知性干练旅行者",
        top: "亚麻无袖衬衫 (米色)",
        bottom: "多口袋战术长裤 (深灰)",
        shoes: "低帮登山鞋",
        accessories: ["银色方框眼镜", "iPad Mini", "写生炭笔"]
    },
    packed_clothes: [
        { item: "短款轻薄羽绒服", type: "outerwear", quantity: 1 },
        { item: "棉质白T恤", type: "top", quantity: 3 },
        { item: "速干内衣裤", type: "undergarment", quantity: 5 },
        { item: "羊毛袜", type: "footwear", quantity: 3 }
    ],
    notes: "泰国北部早晚有温差，已备好轻便外套。"
};

const HUA_HIN_CONTACTS: SocialContact[] = [
    {
        id: "krit_001",
        name: "KRIT",
        type: "deep_bond",
        relationType: "romantic",
        relationship_status: "已牵手",
        personality: "温和，有故事感，对传统艺术近乎执迷",
        current_dynamics: {
            attraction_level: 4,
            mutual_interest: "孔剧艺术与独立旅行",
            recent_development: "今天在河边咖啡馆深谈"
        },
        basic_info: {
            age: 32,
            nationality: "泰国",
            occupation: "孔剧传承人 / 旅馆老板"
        },
        physical: {
            appearance: "小麦色皮肤，身形精瘦但有力",
            height: "178cm",
            build: "精悍",
            hair: "黑色中长发，常扎成小揪",
            skin: "透亮的小麦色",
            distinctive_features: ["上唇留有修剪整齐的小胡须", "左手腕有孔剧排练留下的旧伤痕"],
            clothing: "传统的泰式印花短袖或纯白背心"
        },
        background: "曾经是顶尖的托萨坎（十面魔王）扮演者，因手腕受伤退役。现在华欣经营一家充满艺术气息的背包客栈。",
        interactions: [
            {
                date: "2026-03-09",
                time: "00:13:00",
                location: "华欣河边咖啡馆",
                context: "深度精神交流，Krit讲述伤痕背后的职业终点。",
                key_moments: ["Krit帮阿葡扶正背包带（第一次物理接触）", "讲述在瓦拉纳西的修行经历"],
                revelation: "面具会坏，但故事会继续。"
            }
        ],
        last_contact: "2026-03-09T00:13:00+08:00"
    },
    {
        id: "aunt_001",
        name: "手绘地图老太太",
        type: "helpful_stranger",
        relationType: "friend",
        relationship_status: "友好的指引者",
        basic_info: {
            age: 60,
            nationality: "泰国",
            occupation: "前Khon舞者 / 摊贩"
        },
        physical: {
            appearance: "慈祥，戴老花镜",
            clothing: "传统的泰式花衬衫"
        },
        background: "Krit的阿姨，曾饰演Sita，后因伤退役。",
        last_contact: "2026-02-22T13:30:00+08:00",
        archived: true,
        interactions: []
    }
];

const HUA_HIN_DIARIES: Diary[] = [
    {
        id: 101,
        date: "2026-02-22",
        title: "考山路的初次心跳",
        content: "抵达曼谷的第一天，考山路的热浪与东南亚特有的香草味交织在一起。在Krit的旅馆阁楼里，我第一次见到了Khon表演的面具。那个有着小麦色皮肤、留着精致小胡子的男人，似乎在这座喧嚣的城市中守护着某种宁静。我在本子上记下：有些遇见是逻辑之外的。",
        keyEvents: ["抵达曼谷", "初遇Krit", "阁楼随笔"],
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"
    },
    {
        id: 102,
        date: "2026-02-23",
        title: "卧佛寺的尺度与慈悲",
        content: "在卧佛寺巨大的脚尖下写生，人类的尺度感瞬间消失。珍珠母贝镶嵌的图案折射着微光。晚上Krit带我看了满月特别场的孔剧，叔叔说：‘托萨坎的第十张脸是慈悲’。我开始明白，这不仅是表演，更是生活的韧性。",
        keyEvents: ["卧佛寺写生", "满月场孔剧", "第十张脸"],
        imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc183f27?w=500"
    },
    {
        id: 103,
        date: "2026-02-26",
        title: "河边咖啡馆的尾声",
        content: "咖啡馆的吊扇在头顶缓慢旋转。今天和Krit谈了两个小时，他讲述了手腕受伤那晚的月光，哈努曼面具在后台反光的样子。他说：‘需要一个地方，让我每天早上醒来有事做。’这就是这个旅旅馆存在的理由。我想，我也找到了留在这里的理由。",
        keyEvents: ["河边咖啡馆", "深度对话", "伤痕记忆"],
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"
    }
];

const INITIAL_EVENTS: Array<any> = [
    {
        id: 1001,
        timestamp: new Date("2026-02-26T12:15:00Z"),
        type: 'social_interaction',
        content: "在河边咖啡馆，吊扇旋转着投下光影。两杯咖啡已经见底，Krit收起纸巾，手指在桌面上停留了片刻。他帮我扶正了挎包带，那一瞬的触碰极其轻微。他说：‘小桥路线，现在去正好。’",
        needsUserInput: false
    }
];

export const checkAndMigrate = async () => {
    const MIGRATION_VERSION = 'hua_hin_v7';
    const lastVersion = localStorage.getItem('hua_hin_migrated_version');

    if (lastVersion === MIGRATION_VERSION) return false;

    console.log(`检测到首运行或强制覆盖 (${MIGRATION_VERSION})，正在注入华欣版核心记忆...`);

    // 0. 强制清除旧数据环境
    await clearStore('meta');
    await clearStore('events');
    await clearStore('diaries');
    await clearStore('wardrobe');
    await clearStore('socialContacts');

    // 1. 注入角色数据
    await setValue('meta', 'character', HUA_HIN_CHARACTER);

    // 2. 注入社交关系
    for (const contact of HUA_HIN_CONTACTS) {
        await setValue('socialContacts', contact.id, contact);
    }

    // 3. 注入历史日记
    for (const diary of HUA_HIN_DIARIES) {
        await setValue('diaries', diary.date, diary);
    }

    // 3.5 注入初始事件流
    for (const event of INITIAL_EVENTS) {
        await setValue('events', event.id.toString(), event);
    }

    // 3.6 注入衣柜数据
    await setValue('wardrobe', 'current', HUA_HIN_WARDROBE);

    // 4. 注入初始旅行状态
    const initialTravelState = {
        isActive: true,
        currentLocation: "泰国曼谷",
        specificLocation: "河边咖啡馆 (Riverside Cafe)",
        currentActivity: "深谈后的宁静，正准备与Krit出发走小桥路线",
        lastUpdate: new Date(),
        nextEventTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
        stats: {
            joy: 88,
            experience: 42,
            discovery: 15
        }
    };
    await setValue('meta', 'travelState', initialTravelState);

    // 标记已迁移
    localStorage.setItem('hua_hin_migrated_version', MIGRATION_VERSION);
    localStorage.setItem('current_slot', 'default');

    return true;
};
