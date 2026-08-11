import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

type NetworkBand = "fast" | "slow" | "offline" | "unknown";

interface CacheEntry {
  data: unknown;
  storedAt: number;
  expiresAt: number;
}

const STORAGE_KEY = "@cache/entries";

const TTL_BY_BAND: Record<NetworkBand, number> = {
  fast: 2 * 60 * 1000,
  slow: 5 * 60 * 1000,
  offline: 30 * 60 * 1000,
  unknown: 5 * 60 * 1000,
};

let currentBand: NetworkBand = "unknown";
let initialized = false;

const memoryCache = new Map<string, CacheEntry>();

const getCurrentBand = (): NetworkBand => currentBand;

const persistToStorage = async () => {
  try {
    const serialized = JSON.stringify(Object.fromEntries(memoryCache.entries()));
    await AsyncStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Failed to persist cache:", err);
  }
};

const loadFromStorage = async () => {
  if (initialized) return;
  initialized = true;

  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    if (!serialized) return;
    const parsed = JSON.parse(serialized);
    for (const [key, entry] of Object.entries(parsed)) {
      memoryCache.set(key, entry as CacheEntry);
    }
  } catch (err) {
    console.error("Failed to load cache from storage:", err);
  }
};

const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
};

NetInfo.addEventListener((state) => {
  const reachable = state.isConnected && state.isInternetReachable;
  if (reachable === false) {
    currentBand = "offline";
    return;
  }
  if (state.type === "wifi" || state.type === "ethernet") {
    currentBand = "fast";
  } else if (state.type === "cellular") {
    currentBand = "slow";
  } else {
    currentBand = "unknown";
  }
});

export const cacheService = {
  init: async () => {
    await loadFromStorage();
    NetInfo.fetch().then((state) => {
      const reachable = state.isConnected && state.isInternetReachable;
      if (reachable === false) {
        currentBand = "offline";
      } else if (state.type === "wifi" || state.type === "ethernet") {
        currentBand = "fast";
      } else if (state.type === "cellular") {
        currentBand = "slow";
      } else {
        currentBand = "unknown";
      }
    });
  },

  get: <T>(key: string): T | null => {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  },

  isFresh: (key: string): boolean => {
    const entry = memoryCache.get(key);
    if (!entry) return false;
    return entry.expiresAt > Date.now();
  },

  set: async (key: string, data: unknown) => {
    const now = Date.now();
    const ttl = TTL_BY_BAND[getCurrentBand()];
    memoryCache.set(key, { data, storedAt: now, expiresAt: now + ttl });
    await persistToStorage();
  },

  setWithTtl: async (key: string, data: unknown, ttl: number) => {
    const now = Date.now();
    memoryCache.set(key, { data, storedAt: now, expiresAt: now + ttl });
    await persistToStorage();
  },

  invalidate: async (prefix: string) => {
    let changed = false;
    for (const key of Array.from(memoryCache.keys())) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
        changed = true;
      }
    }
    if (changed) await persistToStorage();
  },

  clearAll: async () => {
    memoryCache.clear();
    await persistToStorage();
  },

  getCurrentBand,

  cleanupExpiredEntries,
};
