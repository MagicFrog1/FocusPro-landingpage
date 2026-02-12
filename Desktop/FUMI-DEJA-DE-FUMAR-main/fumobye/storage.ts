import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fumobye:v1';

export async function loadJSON<T>(fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(value: T): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}

export async function clearStorage(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}


