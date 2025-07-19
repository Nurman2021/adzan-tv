import { IconSymbol } from '@/components/ui/IconSymbol';
import { adzanAudio } from '@/utils/audioUtils';
import { getIslamicDate } from '@/utils/islamicUtils';
import { getCurrentPrayerStatus, getSyurukInfo, isSubuhTimeValid, isRestPeriod, prayerTimes } from '@/utils/prayerUtils';
import { getRandomQuote, Quote } from '@/utils/quoteUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ImageSourcePropType
} from 'react-native';

const backgroundImages: Record<string, ImageSourcePropType> = {
    'abu-dabhi': require('@/assets/images/abu-dabhi.jpg'),
    'abu-dabhi-2': require('@/assets/images/abu-dabhi-2.jpg'),
    'turkey': require('@/assets/images/turkey.jpg'),
};

export default function AdzanTVScreen(): React.JSX.Element {
    const router = useRouter();
    const [selectedBackground, setSelectedBackground] = useState<keyof typeof backgroundImages>('abu-dabhi');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerStatus, setPrayerStatus] = useState(getCurrentPrayerStatus(new Date()));
    const [currentQuote, setCurrentQuote] = useState<Quote>(getRandomQuote());
    const [fadeIn, setFadeIn] = useState(true);
    const [mosqueName, setMosqueName] = useState('MASJID AL-HIDAYAH');
    const [mosqueAddress, setMosqueAddress] = useState('Jl. Merdeka No. 123, Jakarta Pusat');
    const [isAdzanPlaying, setIsAdzanPlaying] = useState(false);
    const [showSyurukInfo, setShowSyurukInfo] = useState(false);

    // Ref to track if adzan has been played for current prayer time
    const lastAdzanTime = useRef<string>('');

    useEffect(() => {
        // Initialize audio system
        adzanAudio.initializeAudio();

        // Load saved preferences
        const loadSettings = async (): Promise<void> => {
            try {
                const savedBackground = await AsyncStorage.getItem('selectedBackground');
                const savedMosqueName = await AsyncStorage.getItem('mosqueName');
                const savedMosqueAddress = await AsyncStorage.getItem('mosqueAddress');

                if (savedBackground && savedBackground in backgroundImages) {
                    setSelectedBackground(savedBackground as keyof typeof backgroundImages);
                }
                if (savedMosqueName) {
                    setMosqueName(savedMosqueName);
                }
                if (savedMosqueAddress) {
                    setMosqueAddress(savedMosqueAddress);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        loadSettings();

        // Update time every second
        const timer = setInterval(() => {
            const newTime = new Date();
            setCurrentTime(newTime);
            const newPrayerStatus = getCurrentPrayerStatus(newTime);
            setPrayerStatus(newPrayerStatus);

            // Check if we should play adzan
            if (newPrayerStatus.shouldPlayAdzan && newPrayerStatus.current) {
                const currentTimeString = `${newTime.getHours()}:${newTime.getMinutes()}`;

                // Only play adzan once per prayer time
                if (lastAdzanTime.current !== currentTimeString) {
                    lastAdzanTime.current = currentTimeString;
                    playAdzanForPrayer(newPrayerStatus.current);
                }
            }

            // Update playing status
            setIsAdzanPlaying(adzanAudio.getIsPlaying());
        }, 1000);

        // Update quote every 25 minutes (1500000 ms)
        const quoteTimer = setInterval(() => {
            // Add fade effect
            setFadeIn(false);
            setTimeout(() => {
                setCurrentQuote(getRandomQuote());
                setFadeIn(true);
            }, 500); // Half second for fade transition
        }, 1500000); // 25 minutes

        return () => {
            clearInterval(timer);
            clearInterval(quoteTimer);
        };
    }, []);

    const playAdzanForPrayer = async (prayer: any): Promise<void> => {
        try {
            console.log(`Playing adzan for ${prayer.name}`);
            await adzanAudio.playAdzan(prayer.audioFile || 'adzan.mp3', prayer.name);

            // Show notification that adzan is playing
            Alert.alert(
                '🕌 Waktu Sholat',
                `Telah masuk waktu sholat ${prayer.name}`,
                [
                    { text: 'Matikan Audio', onPress: () => adzanAudio.stopAdzan() },
                    { text: 'OK', style: 'default' }
                ],
                { cancelable: true }
            );
        } catch (error) {
            console.error('Error playing adzan:', error);
        }
    };

    // Reload settings when returning from settings page
    useFocusEffect(
        React.useCallback(() => {
            const loadSettings = async (): Promise<void> => {
                try {
                    const savedBackground = await AsyncStorage.getItem('selectedBackground');
                    const savedMosqueName = await AsyncStorage.getItem('mosqueName');
                    const savedMosqueAddress = await AsyncStorage.getItem('mosqueAddress');

                    if (savedBackground && savedBackground in backgroundImages) {
                        setSelectedBackground(savedBackground as keyof typeof backgroundImages);
                    }
                    if (savedMosqueName) {
                        setMosqueName(savedMosqueName);
                    }
                    if (savedMosqueAddress) {
                        setMosqueAddress(savedMosqueAddress);
                    }
                } catch (error) {
                    console.error('Error loading settings:', error);
                }
            };
            loadSettings();
        }, [])
    );

    const formatTime = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSettingsPress = (): void => {
        router.push('/settings');
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={backgroundImages[selectedBackground]}
                style={styles.backgroundImage}
                resizeMode="cover"
                imageStyle={styles.backgroundImageStyle}
            >
                {/* Dark overlay untuk memberikan kontras yang lebih baik */}
                <View style={styles.overlay} />

                <SafeAreaView style={styles.safeArea}>
                    {/* Header with 3 sections */}
                    <View style={styles.header}>
                        {/* Left section - Islamic Date */}
                        <View style={styles.leftSection}>
                            <Text style={styles.islamicDateMain}>{getIslamicDate(currentTime)}</Text>
                            <Text style={styles.dateSubtext}>{formatDate(currentTime)}</Text>
                        </View>

                        {/* Center section - Mosque Info */}
                        <View style={styles.centerSection}>
                            <Text style={styles.mosqueName}>{mosqueName}</Text>
                            <Text style={styles.mosqueAddress}>{mosqueAddress}</Text>
                            {isAdzanPlaying && (
                                <View style={styles.adzanIndicator}>
                                    <Text style={styles.adzanIndicatorText}>🔊 Adzan sedang diputar</Text>
                                </View>
                            )}
                        </View>

                        {/* Right section - Time */}
                        <View style={styles.rightSection}>
                            <Text style={styles.timeMain}>{formatTime(currentTime)}</Text>
                            <TouchableOpacity
                                style={styles.settingsButton}
                                onPress={handleSettingsPress}
                            >
                                <IconSymbol name="gearshape.fill" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Main content - Quotes/Hadist */}
                    <View style={styles.content}>
                        <View style={[styles.quoteContainer, { opacity: fadeIn ? 1 : 0.3 }]}>
                            <View style={styles.quoteCategoryBadge}>
                                <Text style={styles.quoteCategoryText}>
                                    {currentQuote.category === 'ibadah' ? '🕌 IBADAH' : '📚 ILMU'}
                                </Text>
                            </View>

                            <Text style={styles.quoteArabic}>{currentQuote.arabic}</Text>

                            <View style={styles.quoteTranslationContainer}>
                                <Text style={styles.quoteTranslation}>"{currentQuote.translation}"</Text>
                            </View>

                            <Text style={styles.quoteSource}>- {currentQuote.source} -</Text>
                        </View>
                    </View>

                    {/* Bottom bar with prayer times and next prayer */}
                    <View style={styles.bottomBar}>
                        {/* Prayer times section */}
                        <View style={styles.prayerTimesContainer}>
                            <Text style={styles.prayerTimesTitle}>Jadwal Sholat</Text>
                            
                            {/* Info untuk periode istirahat */}
                            {isRestPeriod(currentTime) && (
                                <Text style={styles.restPeriodInfo}>
                                    ⏰ Periode Istirahat - Menunggu Dzuhur
                                </Text>
                            )}
                            
                            <View style={styles.prayerTimesList}>
                                {prayerTimes.map((prayer, index) => (
                                    <React.Fragment key={index}>
                                        <View
                                            style={[
                                                styles.prayerTimeItem,
                                                prayerStatus.current?.name === prayer.name && styles.currentPrayerItem,
                                                prayer.isInfoOnly && styles.infoPrayerItem // Style khusus untuk Syuruk
                                            ]}
                                        >
                                            <View style={styles.prayerNameContainer}>
                                                <Text style={[
                                                    styles.prayerName,
                                                    prayerStatus.current?.name === prayer.name && styles.currentPrayerText,
                                                    prayer.isInfoOnly && styles.infoPrayerText
                                                ]}>
                                                    {prayer.name}
                                                </Text>
                                                <Text style={[
                                                    styles.prayerArabic,
                                                    prayerStatus.current?.name === prayer.name && styles.currentPrayerText,
                                                    prayer.isInfoOnly && styles.infoPrayerText
                                                ]}>
                                                    {prayer.arabicName}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.prayerTime,
                                                prayerStatus.current?.name === prayer.name && styles.currentPrayerText,
                                                prayer.isInfoOnly && styles.infoPrayerText
                                            ]}>
                                                {prayer.time}
                                            </Text>
                                        </View>

                                        {/* Divider - tidak ditampilkan setelah item terakhir */}
                                        {index < prayerTimes.length - 1 && (
                                            <View style={styles.prayerDivider} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>

                        {/* Next prayer indicator */}
                        {prayerStatus.next && (
                            <View style={styles.nextPrayerContainer}>
                                <Text style={styles.nextPrayerTitle}>Sholat Berikutnya</Text>
                                <Text style={styles.nextPrayerName}>{prayerStatus.next.name}</Text>
                                <Text style={styles.nextPrayerTime}>{prayerStatus.next.time}</Text>
                                <Text style={styles.nextPrayerCountdown}>{prayerStatus.countdown}</Text>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    backgroundImageStyle: {
        opacity: 0.6,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 30,
    },

    // Left section styles
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    islamicDateMain: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    dateSubtext: {
        fontSize: 12,
        color: '#fff',
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    // Center section styles
    centerSection: {
        flex: 2,
        alignItems: 'center',
    },
    mosqueName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6,
    },
    mosqueAddress: {
        fontSize: 14,
        color: '#fff',
        marginTop: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    adzanIndicator: {
        backgroundColor: 'rgba(25, 118, 210, 0.95)', // Blue color
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    adzanIndicatorText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Right section styles
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
    },
    timeMain: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6,
    },
    settingsButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 8,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    // Content styles
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 60,
    },
    quoteContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderRadius: 20,
        padding: 30,
        maxWidth: '90%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    quoteCategoryBadge: {
        backgroundColor: 'rgba(13, 71, 161, 0.95)', // Navy blue color
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    quoteCategoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    quoteArabic: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    quoteTranslationContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.4)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.4)',
        paddingVertical: 15,
        marginVertical: 15,
        width: '100%',
    },
    quoteTranslation: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 26,
        fontStyle: 'italic',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    quoteSource: {
        fontSize: 14,
        color: '#ddd',
        textAlign: 'center',
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 20,
    },
    prayerTimesContainer: {
        flex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    prayerTimesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    restPeriodInfo: {
        fontSize: 12,
        color: '#FFD700',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    syurukInfo: {
        fontSize: 12,
        color: '#FFD700',
        marginBottom: 10,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    prayerTimesList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Menambahkan alignment untuk divider
        flexWrap: 'wrap',
        gap: 0, // Menghilangkan gap karena kita pakai divider
    },
    prayerTimeItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12, // Sedikit menambah padding horizontal
        borderRadius: 8,
        minWidth: 60,
        flex: 1, // Membuat setiap item mengambil space yang sama
    },
    prayerDivider: {
        width: 1,
        height: 40, // Tinggi divider
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Warna divider semi-transparan
        marginHorizontal: 4, // Space di kiri dan kanan divider
        alignSelf: 'center',
    },
    currentPrayerItem: {
        backgroundColor: 'rgba(25, 118, 210, 0.8)', // Blue color for current prayer
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    infoPrayerItem: {
        backgroundColor: 'rgba(255, 193, 7, 0.8)', // Yellow color for info-only prayers
    },
    prayerNameContainer: {
        alignItems: 'center',
    },
    prayerName: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    prayerArabic: {
        fontSize: 10,
        color: '#ddd',
        marginTop: 2,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    currentPrayerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    infoPrayerText: {
        color: '#000',
        fontWeight: 'bold',
    },
    prayerTime: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    nextPrayerContainer: {
        flex: 1,
        backgroundColor: 'rgba(13, 71, 161, 0.95)', // Navy blue color
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    nextPrayerTitle: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    nextPrayerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    nextPrayerTime: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    nextPrayerCountdown: {
        fontSize: 12,
        color: '#fff',
        fontStyle: 'italic',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
