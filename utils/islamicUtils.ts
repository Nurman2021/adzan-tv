interface HijriDate {
    day: number;
    month: number;
    year: number;
    monthName: string;
    dayName: string;
}

const hijriMonths = [
    'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir',
    'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
    'Ramadhan', 'Syawwal', 'Dzul Qa\'dah', 'Dzul Hijjah'
];

const hijriDayNames = [
    'Al-Ahad', 'Al-Ithnayn', 'Ath-Thulatha', 'Al-Arba\'a',
    'Al-Khamis', 'Al-Jumu\'ah', 'As-Sabt'
];

// Konstanta untuk konversi
const HIJRI_EPOCH = 1948439.5; // Julian day untuk 1 Muharram 1 H (16 Juli 622 M)
const HIJRI_YEAR_LENGTH = 354.367; // Rata-rata hari dalam tahun Hijriyah

function gregorianToJulian(year: number, month: number, day: number): number {
    let a = Math.floor((14 - month) / 12);
    let y = year - a;
    let m = month + 12 * a - 3;

    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
}

function julianToHijri(jd: number): HijriDate {
    // Konversi Julian Day ke tanggal Hijriyah
    let daysSinceEpoch = jd - HIJRI_EPOCH;
    let hijriYear = Math.floor(daysSinceEpoch / HIJRI_YEAR_LENGTH) + 1;

    // Hitung ulang untuk mendapatkan tahun yang tepat
    let yearStart = HIJRI_EPOCH + (hijriYear - 1) * HIJRI_YEAR_LENGTH;
    let daysInYear = daysSinceEpoch - (hijriYear - 1) * HIJRI_YEAR_LENGTH;

    if (daysInYear < 0) {
        hijriYear--;
        daysInYear += HIJRI_YEAR_LENGTH;
    }

    // Hitung bulan dan tanggal
    let hijriMonth = 1;
    let remainingDays = Math.floor(daysInYear);

    // Siklus bulan Hijriyah (29-30 hari bergantian dengan penyesuaian)
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

    // Tahun kabisat Hijriyah (tahun ke-2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 dalam siklus 30 tahun)
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    let isLeapYear = leapYears.includes((hijriYear - 1) % 30 + 1);

    if (isLeapYear) {
        monthLengths[11] = 30; // Dzul Hijjah menjadi 30 hari di tahun kabisat
    }

    for (let i = 0; i < 12; i++) {
        if (remainingDays < monthLengths[i]) {
            hijriMonth = i + 1;
            break;
        }
        remainingDays -= monthLengths[i];
    }

    let hijriDay = remainingDays + 1;

    // Pastikan nilai dalam batas yang wajar
    if (hijriDay < 1) hijriDay = 1;
    if (hijriDay > 30) hijriDay = 30;
    if (hijriMonth < 1) hijriMonth = 1;
    if (hijriMonth > 12) hijriMonth = 12;

    return {
        day: Math.floor(hijriDay),
        month: hijriMonth,
        year: Math.floor(hijriYear),
        monthName: hijriMonths[hijriMonth - 1],
        dayName: hijriDayNames[new Date().getDay()]
    };
}

export function getIslamicDate(date: Date): string {
    try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const julianDay = gregorianToJulian(year, month, day);
        const hijriDate = julianToHijri(julianDay);

        return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} H`;
    } catch (error) {
        console.error('Error converting to Islamic date:', error);
        // Fallback sederhana jika terjadi error
        const year = date.getFullYear();
        const hijriYear = year - 579; // Perkiraan kasar
        const monthIndex = date.getMonth();
        const day = date.getDate();

        return `${day} ${hijriMonths[monthIndex]} ${hijriYear} H`;
    }
}

export function getIslamicDateWithDay(date: Date): string {
    try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const julianDay = gregorianToJulian(year, month, day);
        const hijriDate = julianToHijri(julianDay);

        return `${hijriDate.dayName}, ${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} H`;
    } catch (error) {
        console.error('Error converting to Islamic date with day:', error);
        return getIslamicDate(date);
    }
}

// Untuk testing dan debugging
export function getDetailedIslamicDate(date: Date): HijriDate {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const julianDay = gregorianToJulian(year, month, day);
    return julianToHijri(julianDay);
}
