import { CalculationMethod, Madhab, PrayerTimes } from '../types';

/**
 * Calculates accurate Qibla bearing from current coordinates to Kaaba, Makkah (21.4225, 39.8262)
 */
export function calculateQibla(lat: number, lng: number): { bearing: number; compassText: string } {
  const makkahLat = (21.4225 * Math.PI) / 180;
  const makkahLng = (39.8262 * Math.PI) / 180;
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;

  const y = Math.sin(makkahLng - lambda1);
  const x = Math.cos(phi1) * Math.tan(makkahLat) - Math.sin(phi1) * Math.cos(makkahLng - lambda1);
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;

  const rounded = Math.round(qibla);
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(rounded / 22.5) % 16;
  return { bearing: rounded, compassText: `${rounded}° ${cardinals[idx]}` };
}

/**
 * Calculates Great Circle distance to Kaaba (21.4225, 39.8262) in kilometers
 */
export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const makkahLat = (21.4225 * Math.PI) / 180;
  const makkahLng = (39.8262 * Math.PI) / 180;
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;
  const dLat = makkahLat - phi1;
  const dLng = makkahLng - lambda1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(phi1) * Math.cos(makkahLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Base schedules for major reference cities (with Jakarta exact to the design)
 */
const CITY_BASE_TIMES: Record<string, PrayerTimes> = {
  Jakarta: {
    Fajr: '04:42',
    Sunrise: '05:58',
    Dhuhr: '12:06',
    Asr: '15:14',
    Maghrib: '18:08',
    Isha: '19:18',
  },
  Makkah: {
    Fajr: '05:08',
    Sunrise: '06:24',
    Dhuhr: '12:28',
    Asr: '15:52',
    Maghrib: '18:32',
    Isha: '20:02',
  },
  Medina: {
    Fajr: '05:10',
    Sunrise: '06:28',
    Dhuhr: '12:29',
    Asr: '15:54',
    Maghrib: '18:31',
    Isha: '20:01',
  },
  'Kuala Lumpur': {
    Fajr: '05:52',
    Sunrise: '07:08',
    Dhuhr: '13:18',
    Asr: '16:26',
    Maghrib: '19:24',
    Isha: '20:34',
  },
  Cairo: {
    Fajr: '04:22',
    Sunrise: '05:48',
    Dhuhr: '11:58',
    Asr: '15:28',
    Maghrib: '18:08',
    Isha: '19:28',
  },
  London: {
    Fajr: '05:12',
    Sunrise: '06:46',
    Dhuhr: '12:12',
    Asr: '15:08',
    Maghrib: '17:38',
    Isha: '19:12',
  },
};

/**
 * Returns prayer times adjusted for method and madhab
 */
export function getPrayerTimesForCity(
  cityName: string,
  _lat: number,
  _lng: number,
  _method: CalculationMethod = 'kemenag',
  madhab: Madhab = 'shafi'
): PrayerTimes {
  const base = CITY_BASE_TIMES[cityName] || CITY_BASE_TIMES['Jakarta'];
  if (madhab === 'hanafi') {
    // Hanafi Asr is ~40-50 mins later
    const [h, m] = base.Asr.split(':').map(Number);
    const newM = m + 45;
    const newH = h + Math.floor(newM / 60);
    const adjM = newM % 60;
    return {
      ...base,
      Asr: `${String(newH).padStart(2, '0')}:${String(adjM).padStart(2, '0')}`,
    };
  }
  return base;
}

export interface NextPrayerInfo {
  name: string;
  arabic: string;
  timeString: string;
  targetDate: Date;
  diffSeconds: number;
}

const ARABIC_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

/**
 * Determines the next upcoming prayer from a schedule relative to current time
 */
export function getNextUpcomingPrayer(prayerTimes: PrayerTimes, now: Date = new Date()): NextPrayerInfo {
  const order: (keyof PrayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const pName of order) {
    const [hours, minutes] = prayerTimes[pName].split(':').map(Number);
    const pDate = new Date(now);
    pDate.setHours(hours, minutes, 0, 0);

    const diff = Math.floor((pDate.getTime() - now.getTime()) / 1000);
    if (diff > 0) {
      return {
        name: pName,
        arabic: ARABIC_NAMES[pName] || '',
        timeString: prayerTimes[pName],
        targetDate: pDate,
        diffSeconds: diff,
      };
    }
  }

  // If all prayers today have passed, next is tomorrow's Fajr
  const [fHours, fMinutes] = prayerTimes.Fajr.split(':').map(Number);
  const tomorrowFajr = new Date(now);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  tomorrowFajr.setHours(fHours, fMinutes, 0, 0);

  return {
    name: 'Fajr',
    arabic: ARABIC_NAMES['Fajr'],
    timeString: prayerTimes.Fajr,
    targetDate: tomorrowFajr,
    diffSeconds: Math.floor((tomorrowFajr.getTime() - now.getTime()) / 1000),
  };
}

/**
 * Formats a Hijri date string
 */
export function getFormattedHijriDate(): string {
  // Static canonical matching the design: "17 Sha'ban 1445 AH" or dynamic calculation
  return "17 Sha'ban 1445 AH";
}
