/**
 * IndexedDB Local Persistence Engine for NoorSync
 * Provides reliable, offline-first storage for:
 * 1. Sholat tracking logs (daily completion, jamaah vs munfarid)
 * 2. Pre-calculated multi-day prayer schedules for offline lookahead
 * 3. Sedekah Subuh records
 * 4. User configuration & prayer calculation preferences
 */

import {
  PrayerTimes,
  SholatDailyLog,
  DaySholatLog,
  CalculationMethod,
  Madhab,
  SedekahRecord,
  KhatamPlan,
  ReflectionItem,
  SuhoorConfig,
} from '../types';
import { getPrayerTimesForCity } from '../utils/prayerCalculator';

const DB_NAME = 'NoorSync_Offline_DB_v1';
const DB_VERSION = 2;

export interface CachedPrayerDay {
  id: string; // `${cityName}_${dateKey}`
  cityName: string;
  dateKey: string; // YYYY-MM-DD
  times: PrayerTimes;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

/**
 * Open or initialize the IndexedDB database
 */
export function openNoorDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbInitPromise) return dbInitPromise;

  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  dbInitPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: Sholat Daily Logs (keyed by date e.g. '2026-09-18')
        if (!db.objectStoreNames.contains('sholat_logs')) {
          const sholatStore = db.createObjectStore('sholat_logs', { keyPath: 'date' });
          sholatStore.createIndex('by_date', 'date', { unique: true });
        }

        // Store 2: Pre-calculated prayer times for offline retrieval
        if (!db.objectStoreNames.contains('prayer_schedules')) {
          const scheduleStore = db.createObjectStore('prayer_schedules', { keyPath: 'id' });
          scheduleStore.createIndex('by_city', 'cityName', { unique: false });
          scheduleStore.createIndex('by_date', 'dateKey', { unique: false });
        }

        // Store 3: Sedekah subuh micro-habit logs
        if (!db.objectStoreNames.contains('sedekah_records')) {
          const sedekahStore = db.createObjectStore('sedekah_records', { keyPath: 'id' });
          sedekahStore.createIndex('by_date', 'date', { unique: false });
        }

        // Store 4: App settings and sync metadata
        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings', { keyPath: 'key' });
        }

        // Store 5: Minimalist Quran Khatam Reading Habit & Bookmarks
        if (!db.objectStoreNames.contains('khatam_plan')) {
          db.createObjectStore('khatam_plan', { keyPath: 'id' });
        }

        // Store 6: Personal Dua & Istikharah Reflection Vault
        if (!db.objectStoreNames.contains('dua_reflections')) {
          const reflectionsStore = db.createObjectStore('dua_reflections', { keyPath: 'id' });
          reflectionsStore.createIndex('by_status', 'status', { unique: false });
          reflectionsStore.createIndex('by_category', 'category', { unique: false });
          reflectionsStore.createIndex('by_date', 'createdAt', { unique: false });
        }

        // Store 7: Suhoor & Imsak Engine Settings
        if (!db.objectStoreNames.contains('suhoor_settings')) {
          db.createObjectStore('suhoor_settings', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    } catch (err) {
      reject(err);
    }
  });

  return dbInitPromise;
}

/* =========================================================================
 * SHOLAT LOGS PERSISTENCE
 * ========================================================================= */

export async function saveSholatLogToIDB(log: SholatDailyLog): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sholat_logs', 'readwrite');
      const store = tx.objectStore('sholat_logs');
      const request = store.put({
        ...log,
        savedAt: Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed saving sholat log to IndexedDB:', err);
  }
}

export async function getSholatLogFromIDB(dateKey: string): Promise<SholatDailyLog | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sholat_logs', 'readonly');
      const store = tx.objectStore('sholat_logs');
      const request = store.get(dateKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed getting sholat log from IndexedDB:', err);
    return null;
  }
}

export async function getAllSholatLogsFromIDB(): Promise<Record<string, DaySholatLog>> {
  if (!isIndexedDBAvailable()) return {};
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sholat_logs', 'readonly');
      const store = tx.objectStore('sholat_logs');
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result as SholatDailyLog[];
        const map: Record<string, DaySholatLog> = {};
        for (const item of records) {
          if (item && item.date && item.slots) {
            map[item.date] = item.slots;
          }
        }
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed getting all sholat logs from IndexedDB:', err);
    return {};
  }
}

/* =========================================================================
 * OFFLINE PRAYER SCHEDULE CACHE & 30-DAY PRECOMPUTATION
 * ========================================================================= */

export async function cachePrayerScheduleToIDB(
  cityName: string,
  dateKey: string,
  times: PrayerTimes
): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('prayer_schedules', 'readwrite');
      const store = tx.objectStore('prayer_schedules');
      const item: CachedPrayerDay = {
        id: `${cityName}_${dateKey}`,
        cityName,
        dateKey,
        times,
        timestamp: Date.now(),
      };
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed caching prayer schedule to IndexedDB:', err);
  }
}

export async function getCachedPrayerScheduleFromIDB(
  cityName: string,
  dateKey: string
): Promise<PrayerTimes | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('prayer_schedules', 'readonly');
      const store = tx.objectStore('prayer_schedules');
      const request = store.get(`${cityName}_${dateKey}`);
      request.onsuccess = () => {
        const res = request.result as CachedPrayerDay | undefined;
        resolve(res ? res.times : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed reading cached prayer schedule from IndexedDB:', err);
    return null;
  }
}

/**
 * Pre-computes and caches 30 days of upcoming prayer times for offline lookahead
 */
export async function precacheMonthPrayerTimes(
  cityName: string,
  lat: number,
  lng: number,
  method: CalculationMethod = 'kemenag',
  madhab: Madhab = 'shafi',
  daysAhead = 30
): Promise<number> {
  if (!isIndexedDBAvailable()) return 0;

  try {
    const db = await openNoorDB();
    const tx = db.transaction('prayer_schedules', 'readwrite');
    const store = tx.objectStore('prayer_schedules');

    const today = new Date();
    let count = 0;

    for (let i = 0; i < daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateKey = targetDate.toISOString().split('T')[0];

      const times = getPrayerTimesForCity(cityName, lat, lng, method, madhab);

      const entry: CachedPrayerDay = {
        id: `${cityName}_${dateKey}`,
        cityName,
        dateKey,
        times,
        timestamp: Date.now(),
      };

      store.put(entry);
      count++;
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(count);
      tx.onerror = () => resolve(count);
    });
  } catch (err) {
    console.warn('Error precaching prayer times to IndexedDB:', err);
    return 0;
  }
}

/* =========================================================================
 * SEDEKAH RECORDS PERSISTENCE
 * ========================================================================= */

export async function saveSedekahRecordsToIDB(records: SedekahRecord[]): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    const tx = db.transaction('sedekah_records', 'readwrite');
    const store = tx.objectStore('sedekah_records');
    for (const record of records) {
      store.put(record);
    }
  } catch (err) {
    console.warn('Failed saving sedekah records to IndexedDB:', err);
  }
}

export async function getAllSedekahRecordsFromIDB(): Promise<SedekahRecord[]> {
  if (!isIndexedDBAvailable()) return [];
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sedekah_records', 'readonly');
      const store = tx.objectStore('sedekah_records');
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as SedekahRecord[]) || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed getting sedekah records from IndexedDB:', err);
    return [];
  }
}

/* =========================================================================
 * APP SETTINGS STORE
 * ========================================================================= */

export async function saveSettingToIDB(key: string, value: any): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    const tx = db.transaction('app_settings', 'readwrite');
    tx.objectStore('app_settings').put({ key, value, updatedAt: Date.now() });
  } catch (err) {
    console.warn(`Failed saving setting ${key} to IndexedDB:`, err);
  }
}

export async function getSettingFromIDB<T>(key: string, defaultValue: T): Promise<T> {
  if (!isIndexedDBAvailable()) return defaultValue;
  try {
    const db = await openNoorDB();
    return new Promise((resolve) => {
      const tx = db.transaction('app_settings', 'readonly');
      const request = tx.objectStore('app_settings').get(key);
      request.onsuccess = () => {
        if (request.result && request.result.value !== undefined) {
          resolve(request.result.value as T);
        } else {
          resolve(defaultValue);
        }
      };
      request.onerror = () => resolve(defaultValue);
    });
  } catch (err) {
    return defaultValue;
  }
}

/* =========================================================================
 * STORAGE METRICS & DIAGNOSTICS
 * ========================================================================= */

export interface StorageStats {
  isSupported: boolean;
  sholatLogsCount: number;
  prayerSchedulesCount: number;
  sedekahCount: number;
  reflectionsCount?: number;
  khatamPagesRead?: number;
  lastPrecachedCity?: string;
}

export async function getStorageStats(): Promise<StorageStats> {
  if (!isIndexedDBAvailable()) {
    return {
      isSupported: false,
      sholatLogsCount: 0,
      prayerSchedulesCount: 0,
      sedekahCount: 0,
      reflectionsCount: 0,
      khatamPagesRead: 0,
    };
  }

  try {
    const db = await openNoorDB();
    return new Promise((resolve) => {
      const stores = ['sholat_logs', 'prayer_schedules', 'sedekah_records'];
      if (db.objectStoreNames.contains('dua_reflections')) {
        stores.push('dua_reflections');
      }
      const tx = db.transaction(stores, 'readonly');
      const sholatReq = tx.objectStore('sholat_logs').count();
      const scheduleReq = tx.objectStore('prayer_schedules').count();
      const sedekahReq = tx.objectStore('sedekah_records').count();
      const reflectionsReq = db.objectStoreNames.contains('dua_reflections')
        ? tx.objectStore('dua_reflections').count()
        : null;

      tx.oncomplete = () => {
        resolve({
          isSupported: true,
          sholatLogsCount: sholatReq.result || 0,
          prayerSchedulesCount: scheduleReq.result || 0,
          sedekahCount: sedekahReq.result || 0,
          reflectionsCount: reflectionsReq ? reflectionsReq.result || 0 : 0,
        });
      };

      tx.onerror = () => {
        resolve({
          isSupported: true,
          sholatLogsCount: 0,
          prayerSchedulesCount: 0,
          sedekahCount: 0,
          reflectionsCount: 0,
        });
      };
    });
  } catch {
    return {
      isSupported: true,
      sholatLogsCount: 0,
      prayerSchedulesCount: 0,
      sedekahCount: 0,
      reflectionsCount: 0,
    };
  }
}

/* =========================================================================
 * 5. KHATAM & READING HABIT PERSISTENCE (QURANLY-INSPIRED)
 * ========================================================================= */

export async function saveKhatamPlanToIDB(plan: KhatamPlan): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('khatam_plan', 'readwrite');
      tx.objectStore('khatam_plan').put(plan);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB saveKhatamPlan error:', err);
  }
}

export async function getKhatamPlanFromIDB(): Promise<KhatamPlan | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('khatam_plan', 'readonly');
      const req = tx.objectStore('khatam_plan').get('default_khatam_plan');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IDB getKhatamPlan error:', err);
    return null;
  }
}

/* =========================================================================
 * 6. PERSONAL DUA & ISTIKHARAH REFLECTION VAULT PERSISTENCE
 * ========================================================================= */

export async function saveReflectionToIDB(item: ReflectionItem): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('dua_reflections', 'readwrite');
      tx.objectStore('dua_reflections').put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB saveReflection error:', err);
  }
}

export async function getAllReflectionsFromIDB(): Promise<ReflectionItem[]> {
  if (!isIndexedDBAvailable()) return [];
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('dua_reflections', 'readonly');
      const req = tx.objectStore('dua_reflections').getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        // sort by newest
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IDB getAllReflections error:', err);
    return [];
  }
}

export async function deleteReflectionFromIDB(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('dua_reflections', 'readwrite');
      tx.objectStore('dua_reflections').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB deleteReflection error:', err);
  }
}

/* =========================================================================
 * 7. SUHOOR & IMSAK ENGINE PERSISTENCE
 * ========================================================================= */

export async function saveSuhoorConfigToIDB(config: SuhoorConfig): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('suhoor_settings', 'readwrite');
      tx.objectStore('suhoor_settings').put({ id: 'active_config', ...config });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB saveSuhoorConfig error:', err);
  }
}

export async function getSuhoorConfigFromIDB(): Promise<SuhoorConfig | null> {
  if (!isIndexedDBAvailable()) return null;
  try {
    const db = await openNoorDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('suhoor_settings', 'readonly');
      const req = tx.objectStore('suhoor_settings').get('active_config');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IDB getSuhoorConfig error:', err);
    return null;
  }
}
