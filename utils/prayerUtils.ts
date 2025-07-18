export interface PrayerTime {
    name: string;
    time: string;
    arabicName: string;
    audioFile?: string;
}

export const prayerTimes: PrayerTime[] = [
    { name: 'Subuh', time: '04:45', arabicName: 'الفجر', audioFile: 'adzan_subuh.mp3' },
    { name: 'Dzuhur', time: '12:15', arabicName: 'الظهر', audioFile: 'adzan.mp3' },
    { name: 'Ashar', time: '15:30', arabicName: 'العصر', audioFile: 'adzan.mp3' },
    { name: 'Maghrib', time: '18:45', arabicName: 'المغرب', audioFile: 'adzan.mp3' },
    { name: 'Isya', time: '20:00', arabicName: 'العشاء', audioFile: 'adzan.mp3' },
];

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

    // Find current and next prayer
    let current: PrayerTime | null = null;
    let next: (PrayerTime & { totalMinutes: number }) | null = null;
    let shouldPlayAdzan = false;

    // Check if we should play adzan (at exact prayer time with seconds 0-5)
    for (const prayer of timesInMinutes) {
        if (now === prayer.totalMinutes && currentSeconds <= 5) {
            shouldPlayAdzan = true;
            break;
        }
    }

    for (let i = 0; i < timesInMinutes.length; i++) {
        const prayer = timesInMinutes[i];
        const nextPrayer = timesInMinutes[i + 1];

        if (now >= prayer.totalMinutes && (nextPrayer ? now < nextPrayer.totalMinutes : true)) {
            current = prayer;
            next = nextPrayer || timesInMinutes[0]; // Next day's first prayer
            break;
        }
    }

    // If before first prayer of the day
    if (!current) {
        next = timesInMinutes[0];
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
