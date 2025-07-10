export const LocalStorage = {
  get: <T = string>(key: string): T | null => {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return item ? (JSON.parse(item) as T) : null;
  },

  set: <T = string>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
