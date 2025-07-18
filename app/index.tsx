import { IconSymbol } from '@/components/ui/IconSymbol';
import { getIslamicDate } from '@/utils/islamicUtils';
import { getCurrentPrayerStatus, prayerTimes } from '@/utils/prayerUtils';
import { getRandomQuote, Quote } from '@/utils/quoteUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const backgroundImages = {
    'abu-dabhi': require('@/assets/images/abu-dabhi.jpg'),
    'abu-dabhi-2': require('@/assets/images/abu-dabhi-2.jpg'),
    'turkey': require('@/assets/images/turkey.jpg'),
};

export default function AdzanTVScreen() {
    const router = useRouter();
    const [selectedBackground, setSelectedBackground] = useState<keyof typeof backgroundImages>('abu-dabhi');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerStatus, setPrayerStatus] = useState(getCurrentPrayerStatus(new Date()));
    const [currentQuote, setCurrentQuote] = useState<Quote>(getRandomQuote());
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
        // Load saved background preference
        const loadBackground = async () => {
            try {
                const saved = await AsyncStorage.getItem('selectedBackground');
                if (saved && saved in backgroundImages) {
                    setSelectedBackground(saved as keyof typeof backgroundImages);
                }
            } catch (error) {
                console.error('Error loading background:', error);
            }
        };
        loadBackground();

        // Update time every second
        const timer = setInterval(() => {
            const newTime = new Date();
            setCurrentTime(newTime);
            setPrayerStatus(getCurrentPrayerStatus(newTime));
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

    // Reload background when returning from settings
    useFocusEffect(
        React.useCallback(() => {
            const loadBackground = async () => {
                try {
                    const saved = await AsyncStorage.getItem('selectedBackground');
                    if (saved && saved in backgroundImages) {
                        setSelectedBackground(saved as keyof typeof backgroundImages);
                    }
                } catch (error) {
                    console.error('Error loading background:', error);
                }
            };
            loadBackground();
        }, [])
    );

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSettingsPress = () => {
        router.push('/settings');
    };

    return (
        <ImageBackground
            source={backgroundImages[selectedBackground]}
            style={styles.container}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Header with 3 sections */}
                <View style={styles.header}>
                    {/* Left section - Islamic Date */}
                    <View style={styles.leftSection}>
                        <Text style={styles.timeMain}>{formatTime(currentTime)}</Text>
                    </View>

                    {/* Center section - Mosque Info */}
                    <View style={styles.centerSection}>
                        <Text style={styles.mosqueName}>MASJID AL-HIDAYAH</Text>
                        <Text style={styles.mosqueAddress}>Jl. Merdeka No. 123, Jakarta Pusat</Text>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={handleSettingsPress}
                        >
                            <IconSymbol name="gearshape.fill" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Right section - Time */}
                    <View style={styles.rightSection}>

                        <Text style={styles.islamicDateMain}>{getIslamicDate(currentTime)}</Text>
                        <Text style={styles.dateSubtext}>{formatDate(currentTime)}</Text>


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
                        <View style={styles.prayerTimesList}>
                            {prayerTimes.map((prayer, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.prayerTimeItem,
                                        prayerStatus.current?.name === prayer.name && styles.currentPrayerItem
                                    ]}
                                >
                                    <View style={styles.prayerNameContainer}>
                                        <Text style={[
                                            styles.prayerName,
                                            prayerStatus.current?.name === prayer.name && styles.currentPrayerText
                                        ]}>
                                            {prayer.name}
                                        </Text>
                                        <Text style={[
                                            styles.prayerArabic,
                                            prayerStatus.current?.name === prayer.name && styles.currentPrayerText
                                        ]}>
                                            {prayer.arabicName}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.prayerTime,
                                        prayerStatus.current?.name === prayer.name && styles.currentPrayerText
                                    ]}>
                                        {prayer.time}
                                    </Text>
                                </View>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dateSubtext: {
        fontSize: 12,
        color: '#fff',
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },

    // Center section styles
    centerSection: {
        flex: 2,
        alignItems: 'center',
        position: 'relative',
    },
    mosqueName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    mosqueAddress: {
        fontSize: 14,
        color: '#ddd',
        marginTop: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    settingsButton: {
        position: 'absolute',
        top: -5,
        right: -40,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
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
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },


    // Remove old header styles and keep the rest
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 60,
    },
    quoteContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 20,
        padding: 30,
        maxWidth: '90%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    quoteCategoryBadge: {
        backgroundColor: 'rgba(44, 95, 45, 0.9)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        marginBottom: 20,
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
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    quoteTranslationContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
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
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    quoteSource: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 20,
    },
    prayerTimesContainer: {
        flex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        padding: 15,
    },
    prayerTimesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    prayerTimesList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    prayerTimeItem: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        minWidth: 60,
    },
    currentPrayerItem: {
        backgroundColor: 'rgba(44, 95, 45, 0.7)',
    },
    prayerNameContainer: {
        alignItems: 'center',
    },
    prayerName: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        textAlign: 'center',
    },
    prayerArabic: {
        fontSize: 10,
        color: '#ddd',
        marginTop: 2,
        textAlign: 'center',
    },
    currentPrayerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    prayerTime: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 4,
        textAlign: 'center',
    },
    nextPrayerContainer: {
        flex: 1,
        backgroundColor: 'rgba(44, 95, 45, 0.9)',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextPrayerTitle: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
    },
    nextPrayerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
        textAlign: 'center',
    },
    nextPrayerTime: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    nextPrayerCountdown: {
        fontSize: 12,
        color: '#fff',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
