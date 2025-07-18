export interface Quote {
    id: number;
    arabic: string;
    translation: string;
    source: string;
    category: 'ibadah' | 'ilmu';
}

export const islamicQuotes: Quote[] = [
    {
        id: 1,
        arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
        translation: "Menuntut ilmu adalah kewajiban bagi setiap muslim",
        source: "HR. Ibnu Majah",
        category: 'ilmu'
    },
    {
        id: 2,
        arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        translation: "Sesungguhnya segala amal perbuatan itu tergantung pada niatnya",
        source: "HR. Bukhari Muslim",
        category: 'ibadah'
    },
    {
        id: 3,
        arabic: "مَنْ طَلَبَ الْعِلْمَ لِوَجْهِ اللَّهِ لَمْ يُصِبْ مِنْهُ بَابًا إِلَّا ازْدَادَ هُدًى وَتُقًى وَزُهْدًا",
        translation: "Barang siapa menuntut ilmu karena Allah, maka tidaklah ia memperoleh satu pintu ilmu melainkan ia bertambah petunjuk, takwa, dan zuhud",
        source: "HR. Darimi",
        category: 'ilmu'
    },
    {
        id: 4,
        arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
        translation: "Bersuci adalah separuh dari iman",
        source: "HR. Muslim",
        category: 'ibadah'
    },
    {
        id: 5,
        arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ",
        translation: "Bacalah dengan nama Tuhanmu yang menciptakan",
        source: "QS. Al-Alaq: 1",
        category: 'ilmu'
    },
    {
        id: 6,
        arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
        translation: "Dan dirikanlah sholat, tunaikanlah zakat dan rukuklah beserta orang-orang yang rukuk",
        source: "QS. Al-Baqarah: 43",
        category: 'ibadah'
    },
    {
        id: 7,
        arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
        translation: "Dan katakanlah: Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan",
        source: "QS. Taha: 114",
        category: 'ilmu'
    },
    {
        id: 8,
        arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
        translation: "Sesungguhnya sholat itu mencegah dari perbuatan keji dan mungkar",
        source: "QS. Al-Ankabut: 45",
        category: 'ibadah'
    },
    {
        id: 9,
        arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
        translation: "Allah akan meninggikan orang-orang yang beriman di antaramu dan orang-orang yang diberi ilmu pengetahuan beberapa derajat",
        source: "QS. Al-Mujadilah: 11",
        category: 'ilmu'
    },
    {
        id: 10,
        arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
        translation: "Dan tidaklah Aku menciptakan jin dan manusia kecuali agar mereka beribadah kepada-Ku",
        source: "QS. Adz-Dzariyat: 56",
        category: 'ibadah'
    },
    {
        id: 11,
        arabic: "مَنْ عَمِلَ بِمَا عَلِمَ أَوْرَثَهُ اللَّهُ عِلْمَ مَا لَمْ يَعْلَمْ",
        translation: "Barang siapa mengamalkan ilmu yang diketahuinya, maka Allah akan mewariskan kepadanya ilmu yang belum diketahuinya",
        source: "HR. Abu Nu'aim",
        category: 'ilmu'
    },
    {
        id: 12,
        arabic: "الدُّعَاءُ مُخُّ الْعِبَادَةِ",
        translation: "Doa adalah intinya ibadah",
        source: "HR. Tirmidzi",
        category: 'ibadah'
    }
];

export function getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * islamicQuotes.length);
    return islamicQuotes[randomIndex];
}

export function getQuoteByCategory(category: 'ibadah' | 'ilmu'): Quote {
    const filteredQuotes = islamicQuotes.filter(quote => quote.category === category);
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
}