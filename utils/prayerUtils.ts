export interface PrayerTime {
    name: string;
    time: string;
    arabicName: string;
}

export const prayerTimes: PrayerTime[] = [
    { name: 'Subuh', time: '04:45', arabicName: 'الفجر' },
    { name: 'Dzuhur', time: '12:15', arabicName: 'الظهر' },
    { name: 'Ashar', time: '15:30', arabicName: 'العصر' },
    { name: 'Maghrib', time: '18:45', arabicName: 'المغرب' },
    { name: 'Isya', time: '20:00', arabicName: 'العشاء' },
];

export const getCurrentPrayerStatus = (currentTime: Date): {
    current: PrayerTime | null;
    next: PrayerTime | null;
    countdown: string;
} => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    const timesInMinutes = prayerTimes.map(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        return { ...prayer, totalMinutes: hours * 60 + minutes };
    });

    // Find current and next prayer
    let current: PrayerTime | null = null;
    let next: (PrayerTime & { totalMinutes: number }) | null = null;

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

    return { current, next, countdown };
};
