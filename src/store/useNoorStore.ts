import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CalculationMethod,
  CityLocation,
  DaySholatLog,
  Madhab,
  PrayerClockStatus,
  PrayerTimes,
  SedekahRecord,
  SholatSlot,
  SholatStatusType,
  KhatamPlan,
  SuhoorConfig,
} from '../types';
import { getPrayerTimesForCity, calculateQibla } from '../utils/prayerCalculator';
import { getDefaultKhatamPlan, getSurahAndJuzForPage } from '../data/khatamData';
import {
  PrayerNotificationPayload,
  sendPrayerNotification,
  getNotificationPermission,
  requestNotificationPermission,
} from '../services/notificationService';
import {
  saveSholatLogToIDB,
  getAllSholatLogsFromIDB,
  cachePrayerScheduleToIDB,
  precacheMonthPrayerTimes,
  saveSedekahRecordsToIDB,
  getAllSedekahRecordsFromIDB,
  getStorageStats,
  StorageStats,
  isIndexedDBAvailable,
  getKhatamPlanFromIDB,
  saveKhatamPlanToIDB,
  getSuhoorConfigFromIDB,
  saveSuhoorConfigToIDB,
} from '../services/db';

const SHOLAT_STORAGE_KEY = 'noorsync_sholat_tracker_v2';
const SEDEKAH_STORAGE_KEY = 'noorsync_sedekah_tracker_v2';

const DEFAULT_SLOTS: SholatSlot[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDefaultDayLog(): DaySholatLog {
  return {
    Fajr: { completed: true, timestamp: '04:55', type: 'jamaah' },
    Dhuhr: { completed: true, timestamp: '12:15', type: 'munfarid' },
    Asr: { completed: true, timestamp: '15:25', type: 'jamaah' },
    Maghrib: { completed: false, type: 'munfarid' },
    Isha: { completed: false, type: 'munfarid' },
  };
}

export function useNoorStore() {
  // Master Clock: synchronized with Date.now() and visibilitychange
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Location & Method
  const [city, setCity] = useState<string>('Jakarta');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.2088,
    lng: 106.8456,
  });
  const [calcMethod, setCalcMethod] = useState<CalculationMethod>('kemenag');
  const [madhab, setMadhab] = useState<Madhab>('shafi');
  const [useIhtiyat, setUseIhtiyat] = useState<boolean>(true); // +2 min Kemenag safety buffer

  // Audio & Haptics
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  // Sholat Tracker logs: Record<dateKey, DaySholatLog>
  const [sholatLogs, setSholatLogs] = useState<Record<string, DaySholatLog>>(() => {
    try {
      const saved = localStorage.getItem(SHOLAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return { [getTodayDateKey()]: getDefaultDayLog() };
  });

  // Sedekah Subuh logs
  const [sedekahRecords, setSedekahRecords] = useState<SedekahRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SEDEKAH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      { id: 's-1', date: '2026-09-15', amount: 5000 },
      { id: 's-2', date: '2026-09-16', amount: 10000 },
      { id: 's-3', date: '2026-09-17', amount: 5000 },
      { id: 's-4', date: '2026-09-18', amount: 5000 },
    ];
  });

  // 1. Minimalist Khatam & Reading Habit State
  const [khatamPlan, setKhatamPlan] = useState<KhatamPlan>(() => {
    try {
      const saved = localStorage.getItem('noorsync_khatam_plan_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultKhatamPlan();
  });

  // 2. Suhoor & Imsak Engine State
  const [suhoorConfig, setSuhoorConfig] = useState<SuhoorConfig>(() => {
    try {
      const saved = localStorage.getItem('noorsync_suhoor_config_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      imsakLeadMinutes: 10,
      wakeLeadMinutes: 45,
      gentleChimeEnabled: true,
      recitationAudioEnabled: true,
      activeFastingDays: ['senin', 'kamis', 'ayyamul_bidh'],
    };
  });

  // IndexedDB Storage Stats & Sync
  const [storageStats, setStorageStats] = useState<StorageStats>({
    isSupported: isIndexedDBAvailable(),
    sholatLogsCount: 0,
    prayerSchedulesCount: 0,
    sedekahCount: 0,
  });
  const [isIndexedDBReady, setIsIndexedDBReady] = useState<boolean>(false);

  // Initialize IndexedDB, load historical logs & pre-cache 30 days of prayer times
  useEffect(() => {
    let isMounted = true;
    async function initStorage() {
      if (!isIndexedDBAvailable()) return;
      try {
        // 1. Load sholat logs from IDB
        const idbLogs = await getAllSholatLogsFromIDB();
        if (isMounted && Object.keys(idbLogs).length > 0) {
          setSholatLogs((prev) => ({
            ...idbLogs,
            ...prev,
          }));
        }

        // 2. Load sedekah records from IDB
        const idbSedekah = await getAllSedekahRecordsFromIDB();
        if (isMounted && idbSedekah.length > 0) {
          setSedekahRecords(idbSedekah);
        }

        // 3. Load Khatam Plan from IDB
        const idbKhatam = await getKhatamPlanFromIDB();
        if (isMounted && idbKhatam) {
          setKhatamPlan(idbKhatam);
        }

        // 4. Load Suhoor Config from IDB
        const idbSuhoor = await getSuhoorConfigFromIDB();
        if (isMounted && idbSuhoor) {
          setSuhoorConfig(idbSuhoor);
        }

        // 5. Precache 30 days of prayer schedules into IndexedDB
        await precacheMonthPrayerTimes(city, coords.lat, coords.lng, calcMethod, madhab, 30);

        // 6. Update stats
        const stats = await getStorageStats();
        if (isMounted) {
          setStorageStats(stats);
          setIsIndexedDBReady(true);
        }
      } catch (err) {
        console.warn('IndexedDB initial sync error:', err);
      }
    }

    initStorage();
    return () => {
      isMounted = false;
    };
  }, [city, coords.lat, coords.lng, calcMethod, madhab]);

  // Save logs to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(SHOLAT_STORAGE_KEY, JSON.stringify(sholatLogs));
    } catch (e) {
      console.warn(e);
    }
  }, [sholatLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(SEDEKAH_STORAGE_KEY, JSON.stringify(sedekahRecords));
    } catch (e) {
      console.warn(e);
    }
  }, [sedekahRecords]);

  // Master Clock loop with visibilitychange handler to prevent background tab drift
  useEffect(() => {
    const handleSync = () => {
      setCurrentTime(new Date(Date.now()));
    };

    const interval = setInterval(handleSync, 1000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Compute base prayer times
  const rawTimes = getPrayerTimesForCity(city, coords.lat, coords.lng, calcMethod, madhab);

  // Apply Kemenag +2 min ihtiyat if enabled
  const prayerTimes: PrayerTimes = useIhtiyat
    ? {
        ...rawTimes,
        Fajr: addMinutes(rawTimes.Fajr, 2),
        Dhuhr: addMinutes(rawTimes.Dhuhr, 2),
        Asr: addMinutes(rawTimes.Asr, 2),
        Maghrib: addMinutes(rawTimes.Maghrib, 2),
        Isha: addMinutes(rawTimes.Isha, 2),
      }
    : rawTimes;

  const qiblaInfo = calculateQibla(coords.lat, coords.lng);

  // Calculate current stage, next prayer, and clock status (adzan / iqamah / normal)
  const clockDetails = computeClockDetails(prayerTimes, currentTime);

  // Sholat Tracker operations
  const todayKey = getTodayDateKey();
  const todayLog: DaySholatLog = sholatLogs[todayKey] || getDefaultDayLog();

  // Cache current day's prayer schedule to IndexedDB whenever prayerTimes or city updates
  useEffect(() => {
    cachePrayerScheduleToIDB(city, todayKey, prayerTimes);
  }, [city, todayKey, prayerTimes]);

  const toggleSholat = useCallback((slot: SholatSlot, forceType?: SholatStatusType) => {
    setSholatLogs((prev) => {
      const currentDay = prev[todayKey] || getDefaultDayLog();
      const currentEntry = currentDay[slot];
      const nextCompleted = forceType ? true : !currentEntry.completed;
      const nowTimeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const updatedDayLog: DaySholatLog = {
        ...currentDay,
        [slot]: {
          completed: nextCompleted,
          timestamp: nextCompleted ? nowTimeStr : undefined,
          type: forceType || currentEntry.type || 'jamaah',
        },
      };

      // Persist to IndexedDB asynchronously
      saveSholatLogToIDB({ date: todayKey, slots: updatedDayLog }).then(() => {
        getStorageStats().then(setStorageStats).catch(() => {});
      }).catch(() => {});

      return {
        ...prev,
        [todayKey]: updatedDayLog,
      };
    });
  }, [todayKey]);

  // Add Sedekah record & persist to IndexedDB
  const logSedekah = useCallback((amount: number) => {
    const newRecord: SedekahRecord = {
      id: `sedekah-${Date.now()}`,
      date: todayKey,
      amount,
    };
    setSedekahRecords((prev) => {
      const updated = [...prev, newRecord];
      saveSedekahRecordsToIDB(updated).then(() => {
        getStorageStats().then(setStorageStats).catch(() => {});
      }).catch(() => {});
      return updated;
    });
  }, [todayKey]);

  // Khatam Reading Habit actions
  const updateKhatamPlan = useCallback((newPlan: KhatamPlan) => {
    setKhatamPlan(newPlan);
    try {
      localStorage.setItem('noorsync_khatam_plan_v1', JSON.stringify(newPlan));
    } catch {}
    saveKhatamPlanToIDB(newPlan).catch(() => {});
  }, []);

  const incrementKhatamPage = useCallback((pages: number) => {
    setKhatamPlan((prev) => {
      const today = getTodayDateKey();
      const newPage = Math.min(604, Math.max(1, prev.currentPage + pages));
      const { surah, juz } = getSurahAndJuzForPage(newPage);
      const updatedLog = { ...prev.dailyLog };
      updatedLog[today] = (updatedLog[today] || 0) + pages;

      const updated: KhatamPlan = {
        ...prev,
        currentPage: newPage,
        currentSurah: surah,
        currentJuz: juz,
        lastReadDate: today,
        dailyLog: updatedLog,
      };

      try {
        localStorage.setItem('noorsync_khatam_plan_v1', JSON.stringify(updated));
      } catch {}
      saveKhatamPlanToIDB(updated).catch(() => {});
      return updated;
    });
  }, []);

  // Suhoor & Imsak Engine actions
  const updateSuhoorConfig = useCallback((newConfig: SuhoorConfig) => {
    setSuhoorConfig(newConfig);
    try {
      localStorage.setItem('noorsync_suhoor_config_v1', JSON.stringify(newConfig));
    } catch {}
    saveSuhoorConfigToIDB(newConfig).catch(() => {});
  }, []);

  // Manual Trigger to re-cache 30 days of prayer times & sync state to IndexedDB
  const syncOfflineData = useCallback(async () => {
    const precachedDays = await precacheMonthPrayerTimes(
      city,
      coords.lat,
      coords.lng,
      calcMethod,
      madhab,
      30
    );
    if (sholatLogs[todayKey]) {
      await saveSholatLogToIDB({ date: todayKey, slots: sholatLogs[todayKey] });
    }
    const stats = await getStorageStats();
    setStorageStats(stats);
    return { precachedDays, stats };
  }, [city, coords.lat, coords.lng, calcMethod, madhab, sholatLogs, todayKey]);

  // Local Notification Alert State
  const [activeNotification, setActiveNotification] = useState<PrayerNotificationPayload | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const notifiedPrayersRef = useRef<Set<string>>(new Set());

  // Check initial notification permission on client
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  // Browser-based notification listener when prayer enters Adzan time
  useEffect(() => {
    if (clockDetails.status === 'adzan' && clockDetails.activeAdzanPrayer) {
      const slot = clockDetails.activeAdzanPrayer;
      const key = `${todayKey}-${slot}`;

      if (!notifiedPrayersRef.current.has(key)) {
        notifiedPrayersRef.current.add(key);

        const payload: PrayerNotificationPayload = {
          prayerName: slot,
          prayerArabic: clockDetails.nextPrayerArabic,
          prayerTime: clockDetails.nextPrayerTime,
          cityName: city,
          audioAlerts,
          isTest: false,
        };

        sendPrayerNotification(payload);
        setActiveNotification(payload);
      }
    }
  }, [
    clockDetails.status,
    clockDetails.activeAdzanPrayer,
    todayKey,
    city,
    audioAlerts,
    clockDetails.nextPrayerArabic,
    clockDetails.nextPrayerTime,
  ]);

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    const res = await requestNotificationPermission();
    setNotificationPermission(res);
    return res;
  }, []);

  const triggerTestNotification = useCallback(() => {
    const payload: PrayerNotificationPayload = {
      prayerName: clockDetails.nextPrayerName || 'Maghrib',
      prayerArabic: clockDetails.nextPrayerArabic || 'المغرب',
      prayerTime: clockDetails.nextPrayerTime || '18:02',
      cityName: city,
      audioAlerts,
      isTest: true,
    };

    sendPrayerNotification(payload);
    setActiveNotification(payload);
  }, [clockDetails.nextPrayerName, clockDetails.nextPrayerArabic, clockDetails.nextPrayerTime, city, audioAlerts]);

  return {
    currentTime,
    city,
    setCity,
    coords,
    setCoords,
    calcMethod,
    setCalcMethod,
    madhab,
    setMadhab,
    useIhtiyat,
    setUseIhtiyat,
    audioAlerts,
    setAudioAlerts,
    hapticEnabled,
    setHapticEnabled,
    prayerTimes,
    qiblaInfo,
    clockDetails,
    todayLog,
    toggleSholat,
    sholatLogs,
    sedekahRecords,
    logSedekah,
    activeNotification,
    dismissNotification,
    triggerTestNotification,
    requestBrowserPermission,
    notificationPermission,
    storageStats,
    isIndexedDBReady,
    syncOfflineData,
    khatamPlan,
    incrementKhatamPage,
    updateKhatamPlan,
    suhoorConfig,
    updateSuhoorConfig,
  };
}

// Helpers
function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  let total = h * 60 + m + mins;
  if (total >= 1440) total -= 1440;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export interface ClockDetails {
  status: PrayerClockStatus;
  nextPrayerName: SholatSlot;
  nextPrayerArabic: string;
  nextPrayerTime: string;
  activeAdzanPrayer: SholatSlot | null;
  iqamahEndTimeStr: string | null;
  diffSeconds: number;
  countdownHours: string;
  countdownMins: string;
  countdownSecs: string;
  isUrgent5Min: boolean;
  currentHorizonStage: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  progressPercentage: number;
}

const ARABIC_NAMES: Record<SholatSlot, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

function computeClockDetails(prayerTimes: PrayerTimes, now: Date): ClockDetails {
  const slots: SholatSlot[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // 1. Check if any prayer is currently having Adzan (within 3 mins) or Iqamah DND (within 15 mins)
  for (const slot of slots) {
    const [h, m] = prayerTimes[slot].split(':').map(Number);
    const pDate = new Date(now);
    pDate.setHours(h, m, 0, 0);

    const elapsedSecs = Math.floor((now.getTime() - pDate.getTime()) / 1000);

    // Active Adzan: 0 to 180 seconds (3 mins)
    if (elapsedSecs >= 0 && elapsedSecs < 180) {
      return {
        status: 'adzan',
        nextPrayerName: slot,
        nextPrayerArabic: ARABIC_NAMES[slot],
        nextPrayerTime: prayerTimes[slot],
        activeAdzanPrayer: slot,
        iqamahEndTimeStr: null,
        diffSeconds: 0,
        countdownHours: '00',
        countdownMins: '00',
        countdownSecs: '00',
        isUrgent5Min: true,
        currentHorizonStage: slot.toLowerCase() as any,
        progressPercentage: 100,
      };
    }

    // Iqamah Grace Period (DND): 180 to 900 seconds (15 mins post-adzan)
    if (elapsedSecs >= 180 && elapsedSecs < 900) {
      const iqamahEnd = new Date(pDate.getTime() + 15 * 60 * 1000);
      const endStr = iqamahEnd.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return {
        status: 'iqamah_dnd',
        nextPrayerName: slot,
        nextPrayerArabic: ARABIC_NAMES[slot],
        nextPrayerTime: prayerTimes[slot],
        activeAdzanPrayer: null,
        iqamahEndTimeStr: endStr,
        diffSeconds: 0,
        countdownHours: '00',
        countdownMins: '00',
        countdownSecs: '00',
        isUrgent5Min: false,
        currentHorizonStage: slot.toLowerCase() as any,
        progressPercentage: 100,
      };
    }
  }

  // 2. Normal countdown to next prayer
  for (const slot of slots) {
    const [h, m] = prayerTimes[slot].split(':').map(Number);
    const pDate = new Date(now);
    pDate.setHours(h, m, 0, 0);

    const diff = Math.floor((pDate.getTime() - now.getTime()) / 1000);
    if (diff > 0) {
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      const isUrgent = diff <= 300; // 5 minutes

      return {
        status: 'normal',
        nextPrayerName: slot,
        nextPrayerArabic: ARABIC_NAMES[slot],
        nextPrayerTime: prayerTimes[slot],
        activeAdzanPrayer: null,
        iqamahEndTimeStr: null,
        diffSeconds: diff,
        countdownHours: hours,
        countdownMins: mins,
        countdownSecs: secs,
        isUrgent5Min: isUrgent,
        currentHorizonStage: slot.toLowerCase() as any,
        progressPercentage: Math.max(5, Math.min(95, 100 - (diff / 18000) * 100)),
      };
    }
  }

  // Tomorrow's Fajr
  const [fh, fm] = prayerTimes.Fajr.split(':').map(Number);
  const tomorrowFajr = new Date(now);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  tomorrowFajr.setHours(fh, fm, 0, 0);
  const diffTomorrow = Math.floor((tomorrowFajr.getTime() - now.getTime()) / 1000);

  return {
    status: 'normal',
    nextPrayerName: 'Fajr',
    nextPrayerArabic: ARABIC_NAMES['Fajr'],
    nextPrayerTime: prayerTimes.Fajr,
    activeAdzanPrayer: null,
    iqamahEndTimeStr: null,
    diffSeconds: diffTomorrow,
    countdownHours: String(Math.floor(diffTomorrow / 3600)).padStart(2, '0'),
    countdownMins: String(Math.floor((diffTomorrow % 3600) / 60)).padStart(2, '0'),
    countdownSecs: String(diffTomorrow % 60).padStart(2, '0'),
    isUrgent5Min: diffTomorrow <= 300,
    currentHorizonStage: 'isha',
    progressPercentage: 20,
  };
}
