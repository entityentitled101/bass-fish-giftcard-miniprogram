// 通用辅助函数

// 格式化日期时间
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 格式化日期为 YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 验证角色信息是否完整
export const validateCharacter = (character: any): boolean => {
  return !!(character.name && character.departureLocation && character.destination);
};

// 计算下次事件的时间
export const calculateNextEventTime = (hoursLater: number): Date => {
  return new Date(Date.now() + hoursLater * 60 * 60 * 1000);
};

// 生成唯一ID
export const generateId = (): number => {
  return Date.now();
};

// 过滤出某一天的事件
export const getEventsByDate = (events: any[], targetDate: Date): any[] => {
  const targetDateStr = formatDate(targetDate);
  return events.filter(event => {
    const eventDateStr = formatDate(new Date(event.timestamp));
    return eventDateStr === targetDateStr;
  });
};

// 延迟执行函数
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 清理JSON字符串中的代码块标记
export const cleanJSONResponse = (response: string): string => {
  return response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
};