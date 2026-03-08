// 定义应用中使用的所有类型

// 角色信息类型
export interface Character {
  name: string;
  englishName?: string;
  nickname?: string;
  description: string;
  mbti?: string;
  physical?: {
    height?: number;
    weight?: number;
    build?: string;
    hair?: string;
    appearance?: string;
    distinctive?: string;
  };
  background?: {
    education?: string;
    interests?: string[];
    skills?: string[];
  };
  personality?: {
    general?: string;
    curiosity?: string;
    social?: string;
    romance_preference?: string;
  };
  equipment?: {
    core_item?: string;
    tech?: string[];
  };
  departureLocation: string;
  destination: string;
  travelMethod: string;
  travelStyle: string;
}

// 衣柜类型
export interface Wardrobe {
  last_updated: string;
  current_outfit: {
    top: string;
    mid?: string;
    bottom: string;
    shoes: string;
    accessories: string[];
    overall_vibe: string;
  };
  packed_clothes: Array<{
    item: string;
    quantity: number;
    type: string;
  }>;
  notes?: string;
}

// 社交关系类型
export interface SocialContact {
  id: string;
  name: string;
  name_thai?: string;
  type: string;
  relationType?: 'friend' | 'romantic';
  relationship_status: string;
  basic_info: {
    age?: number;
    nationality?: string;
    occupation?: string;
    languages?: string[];
  };
  physical?: {
    height?: string;
    build?: string;
    skin?: string;
    hair?: string;
    eyes?: string;
    appearance?: string;
    clothing?: string;
    distinctive_features?: string[];
  };
  personality?: string;
  background?: string;
  current_dynamics?: {
    attraction_level?: number;
    mutual_interest?: string;
    next_meeting?: string;
    recent_development?: string;
  };
  interactions: Array<{
    date: string;
    time: string;
    location: string;
    context: string;
    key_moments: string[];
    revelation?: string;
  }>;
  notes?: string;
  last_contact: string;
  archived?: boolean;
}

// 旅行状态类型
export interface TravelState {
  isActive: boolean;
  currentLocation: string;
  specificLocation?: string;
  currentActivity: string;
  lastUpdate: Date | null;
  nextEventTime: Date | null;
  stats: {
    joy: number;
    experience: number;
    discovery: number;
    energy?: number;
    health?: number;
    mood?: number;
    money_cny?: number;
    money_local?: number;
  };
  isFinished?: boolean;
}

// 事件类型
export interface TravelEvent {
  id: number;
  timestamp: Date;
  type: 'journey_start' | 'travel_event' | 'user_intervention' | 'social_interaction';
  content: string;
  needsUserInput: boolean;
  userMessage?: string;
}

// 日记类型
export interface Diary {
  id: number;
  date: string;
  title: string;
  content: string;
  keyEvents: string[];
  imageUrl?: string;
}

// 旅行方式选项类型
export interface TravelMethodOption {
  id: string;
  name: string;
  desc: string;
}

// 旅行风格选项类型
export interface TravelStyleOption {
  id: string;
  name: string;
  desc: string;
}

// 预设位置类型
export type PopularLocation = string;

// 应用状态类型
export interface AppState {
  currentPage: string;
  character: Character;
  travelState: TravelState;
  wardrobe?: Wardrobe;
  socialContacts: SocialContact[];
  events: TravelEvent[];
  diaries: Diary[];
  userMessage: string;
  isWaitingResponse: boolean;
}

// API提供商类型
export type ApiProvider = 'doubao' | 'claude' | 'gemini';

// API配置类型
export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
}

// 导航项类型
export interface NavigationItem {
  id: string;
  name: string;
  icon: any; // 兼容 React.ElementType
}

// AI响应事件类型
export interface AIEventResponse {
  currentLocation: string;
  currentActivity: string;
  eventDescription: string;
  nextEventTime: number;
  needsUserInput: boolean;
  statChanges?: {
    joy?: number;
    experience?: number;
    discovery?: number;
    energy?: number;
    mood?: number;
  };
  socialUpdate?: Partial<SocialContact>;
  isFinished?: boolean;
}

// AI日记响应类型
export interface AIDiaryResponse {
  title: string;
  content: string;
  keyEvents: string[];
}