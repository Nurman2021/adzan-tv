export interface PrayerTime {
    name: string;
    time: string;
    arabicName: string;
    audioFile?: string;
    endTime?: string;
    isInfoOnly?: boolean; // Untuk menandai waktu yang hanya informasi (seperti Syuruk)
}

export const prayerTimes: PrayerTime[] = [
    {
        name: 'Subuh',
        time: '05:01',
        arabicName: 'الفجر',
        audioFile: 'adzan_subuh.mp3',
        endTime: '06:09'
    },
    {
        name: 'Syuruk',
        time: '06:09',
        arabicName: 'الشروق',
        isInfoOnly: true // Tidak memicu adzan, hanya informasi
    },
    {
        name: 'Dzuhur',
        time: '12:10',
        arabicName: 'الظهر',
        audioFile: 'adzan.mp3'
    },
    {
        name: 'Ashar',
        time: '15:33',
        arabicName: 'العصر',
        audioFile: 'adzan.mp3'
    },
    {
        name: 'Maghrib',
        time: '18:07',
        arabicName: 'المغرب',
        audioFile: 'adzan.mp3'
    },
    {
        name: 'Isya',
        time: '19:19',
        arabicName: 'العشاء',
        audioFile: 'adzan.mp3'
    },
];

// Data tambahan untuk informasi
export const additionalTimes = {
    syuruk: '06:09',
};

export const getCurrentPrayerStatus = (currentTime: Date): {
    current: PrayerTime | null;
    next: PrayerTime | null;
    countdown: string;
    shouldPlayAdzan: boolean;
} => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const currentSeconds = currentTime.getSeconds();

    const timesInMinutes = prayerTimes.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        return { ...prayer, totalMinutes: hours * 60 + minutes };
    });

    // Filter hanya waktu sholat yang memerlukan adzan (bukan info only)
    const prayerTimesForAdzan = timesInMinutes.filter(prayer => !prayer.isInfoOnly);

    let current: PrayerTime | null = null;
    let next: (PrayerTime & { totalMinutes: number }) | null = null;
    let shouldPlayAdzan = false;

    // Check if we should play adzan (hanya untuk waktu sholat, bukan syuruk)
    for (const prayer of prayerTimesForAdzan) {
        if (now === prayer.totalMinutes && currentSeconds <= 5) {
            shouldPlayAdzan = true;
            break;
        }
    }

    // Logic untuk menentukan current dan next prayer
    for (let i = 0; i < timesInMinutes.length; i++) {
        const prayer = timesInMinutes[i];
        const nextPrayer = timesInMinutes[i + 1];

        if (now >= prayer.totalMinutes && (nextPrayer ? now < nextPrayer.totalMinutes : true)) {
            current = prayer;

            // Jika current adalah Syuruk, set current ke null (periode istirahat)
            if (prayer.name === 'Syuruk') {
                current = null;
                // Next prayer adalah Dzuhur
                next = timesInMinutes.find(p => p.name === 'Dzuhur') || null;
            } else {
                // Next prayer adalah prayer berikutnya atau Subuh hari berikutnya
                next = nextPrayer || timesInMinutes[0];
            }
            break;
        }
    }

    // Jika sebelum Subuh (waktu dini hari)
    if (!current && now < timesInMinutes[0].totalMinutes) {
        next = timesInMinutes[0]; // Subuh
    }

    // Calculate countdown
    let countdown = '';
    if (next) {
        let minutesUntilNext = next.totalMinutes - now;
        if (minutesUntilNext < 0) {
            minutesUntilNext += 24 * 60; // Add 24 hours if next prayer is tomorrow
        }

        const hours = Math.floor(minutesUntilNext / 60);
        const minutes = minutesUntilNext % 60;

        if (hours > 0) {
            countdown = `${hours} jam ${minutes} menit lagi`;
        } else {
            countdown = `${minutes} menit lagi`;
        }
    }

    return { current, next, countdown, shouldPlayAdzan };
};

// Fungsi utility untuk mendapatkan info syuruk
export const getSyurukInfo = (): string => {
    return additionalTimes.syuruk;
};

// Fungsi untuk mengecek apakah masih dalam waktu sholat Subuh
export const isSubuhTimeValid = (currentTime: Date): boolean => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const subuhStart = 5 * 60 + 1; // 05:01
    const syuruk = 6 * 60 + 9; // 06:09

    return now >= subuhStart && now < syuruk;
};

// Fungsi untuk mengecek apakah sedang dalam periode istirahat (setelah Syuruk sebelum Dzuhur)
export const isRestPeriod = (currentTime: Date): boolean => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const syuruk = 6 * 60 + 9; // 06:09
    const dzuhur = 12 * 60 + 10; // 12:10

    return now >= syuruk && now < dzuhur;
};
