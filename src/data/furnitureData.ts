import { FurnitureItem, ShowroomConfig } from '../types/furniture';
import { SHOWROOM_ASSETS } from '../assets/showroomImages';
import userShowroomData from './userShowroomData.json';

// Showroom config backed by userShowroomData
export const DEFAULT_CONFIG: ShowroomConfig = {
  ...userShowroomData.config,
  introBackgroundUrl: userShowroomData.config.introBackgroundUrl || SHOWROOM_ASSETS.facade,
  heroBackgroundUrl: userShowroomData.config.heroBackgroundUrl || SHOWROOM_ASSETS.heroSuite,
  showroomBackgroundUrl: userShowroomData.config.showroomBackgroundUrl || SHOWROOM_ASSETS.facade,
  chairsCoverUrl: userShowroomData.config.chairsCoverUrl || SHOWROOM_ASSETS.cognacChair,
  desksCoverUrl: userShowroomData.config.desksCoverUrl || SHOWROOM_ASSETS.desksCollection,
} as ShowroomConfig;

// Curated furniture items backed by userShowroomData
export const INITIAL_FURNITURE_ITEMS: FurnitureItem[] = userShowroomData.items as FurnitureItem[];

import { idbSet, safeLocalStorageSet } from '../utils/storageUtils';

// Storage keys
export const STORAGE_KEY_ITEMS = 'almex_furniture_items_v1';
export const STORAGE_KEY_CONFIG = 'almex_furniture_config_v1';

export function loadSavedFurnitureItems(): FurnitureItem[] {
  if (typeof window === 'undefined') return INITIAL_FURNITURE_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (item: FurnitureItem) =>
            ![
              'chair-02',
              'chair-08',
              'chair-10',
              'chair-11',
              'desk-02',
              'desk-08',
              'desk-10',
              'desk-11',
            ].includes(item.id)
        );
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved furniture items from localStorage:', e);
  }
  return INITIAL_FURNITURE_ITEMS;
}

export function saveFurnitureItems(items: FurnitureItem[]): void {
  if (typeof window === 'undefined') return;

  // 1. Always persist to IndexedDB (asynchronous, multi-gigabyte capacity, no quota crash)
  idbSet(STORAGE_KEY_ITEMS, items).catch(() => {});

  // 2. Safely attempt localStorage persistence
  const serialized = JSON.stringify(items);
  const success = safeLocalStorageSet(STORAGE_KEY_ITEMS, serialized);

  // 3. If quota exceeded due to large data URLs, store lightweight metadata version in localStorage
  if (!success) {
    try {
      const lightweightItems = items.map((it) => {
        // If image is a massive data URL, avoid bloat in localStorage
        if (typeof it.imageUrl === 'string' && it.imageUrl.startsWith('data:') && it.imageUrl.length > 50000) {
          const fallback = INITIAL_FURNITURE_ITEMS.find((init) => init.id === it.id);
          return {
            ...it,
            imageUrl: fallback ? fallback.imageUrl : '',
          };
        }
        return it;
      });
      safeLocalStorageSet(STORAGE_KEY_ITEMS, JSON.stringify(lightweightItems));
    } catch {
      // Non-blocking
    }
  }
}

export function loadSavedConfig(): ShowroomConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleaned = { ...DEFAULT_CONFIG };
      for (const k of Object.keys(DEFAULT_CONFIG) as (keyof ShowroomConfig)[]) {
        if (
          parsed[k] &&
          typeof parsed[k] === 'string' &&
          !parsed[k].startsWith('/src/') &&
          !parsed[k].includes('179033') &&
          !parsed[k].includes('C6HCnuWt') &&
          !parsed[k].includes('zTUrx6u5') &&
          !parsed[k].includes('grOyTOpj')
        ) {
          cleaned[k] = parsed[k];
        }
      }
      return cleaned;
    }
  } catch (e) {
    console.warn('Failed to parse saved config from localStorage:', e);
  }
  return DEFAULT_CONFIG;
}

export function saveShowroomConfig(config: ShowroomConfig): void {
  if (typeof window === 'undefined') return;

  // 1. Always persist to IndexedDB
  idbSet(STORAGE_KEY_CONFIG, config).catch(() => {});

  // 2. Safely attempt localStorage persistence
  const serialized = JSON.stringify(config);
  const success = safeLocalStorageSet(STORAGE_KEY_CONFIG, serialized);

  // 3. If quota exceeded, strip massive data URLs for localStorage copy
  if (!success) {
    try {
      const lightweightConfig: ShowroomConfig = { ...config };
      (['introBackgroundUrl', 'heroBackgroundUrl', 'showroomBackgroundUrl', 'chairsCoverUrl', 'desksCoverUrl'] as const).forEach((key) => {
        const val = lightweightConfig[key];
        if (typeof val === 'string' && val.startsWith('data:') && val.length > 50000) {
          lightweightConfig[key] = DEFAULT_CONFIG[key];
        }
      });
      safeLocalStorageSet(STORAGE_KEY_CONFIG, JSON.stringify(lightweightConfig));
    } catch {
      // Non-blocking
    }
  }
}
