export const getCachedData = (key: string, defaultVal: any) => {
  if (typeof window !== 'undefined') {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch(e) {}
  }
  return defaultVal;
};
