export const getIslamicDate = (date: Date): string => {
    // This is a simplified Islamic calendar calculation
    // In production, you'd use a proper Islamic calendar library
    const months = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];

    // Approximate calculation - in production use a proper library
    const islamicYear = 1445; // This would be calculated properly
    const islamicMonth = Math.floor(Math.random() * 12); // Placeholder
    const islamicDay = Math.floor(Math.random() * 29) + 1; // Placeholder

    return `${islamicDay} ${months[islamicMonth]} ${islamicYear} H`;
};

export const getNextPrayerAnnouncement = (nextPrayer: string): string => {
    const announcements = {
        'Subuh': 'Waktu Subuh akan segera tiba',
        'Dzuhur': 'Waktu Dzuhur akan segera tiba',
        'Ashar': 'Waktu Ashar akan segera tiba',
        'Maghrib': 'Waktu Maghrib akan segera tiba',
        'Isya': 'Waktu Isya akan segera tiba',
    };

    return announcements[nextPrayer as keyof typeof announcements] || 'Bersiaplah untuk sholat';
};
