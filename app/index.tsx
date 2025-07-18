import { IconSymbol } from '@/components/ui/IconSymbol';
import { getIslamicDate } from '@/utils/islamicUtils';
import { getCurrentPrayerStatus, prayerTimes } from '@/utils/prayerUtils';
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

        return () => clearInterval(timer);
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
            second: '2-digit',
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
                {/* Header with settings icon */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={handleSettingsPress}
                    >
                        <IconSymbol name="gearshape.fill" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Main content */}
                <View style={styles.content}>
                    {/* Time display */}
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
                        <Text style={styles.islamicDateText}>{getIslamicDate(currentTime)}</Text>
                    </View>

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
        justifyContent: 'flex-end',
        padding: 20,
    },
    settingsButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        padding: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    timeContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    timeText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    dateText: {
        fontSize: 24,
        color: '#fff',
        marginTop: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    islamicDateText: {
        fontSize: 18,
        color: '#fff',
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    prayerTimesContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        minWidth: 300,
    },
    prayerTimesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 15,
    },
    prayerTimesList: {
        gap: 10,
    },
    prayerTimeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 5,
    },
    currentPrayerItem: {
        backgroundColor: 'rgba(44, 95, 45, 0.7)',
    },
    prayerNameContainer: {
        flex: 1,
    },
    prayerName: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '500',
    },
    prayerArabic: {
        fontSize: 12,
        color: '#ddd',
        marginTop: 2,
    },
    currentPrayerText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    prayerTime: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    nextPrayerContainer: {
        backgroundColor: 'rgba(44, 95, 45, 0.9)',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        minWidth: 250,
    },
    nextPrayerTitle: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    nextPrayerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    nextPrayerTime: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    nextPrayerCountdown: {
        fontSize: 14,
        color: '#fff',
        fontStyle: 'italic',
    },
});
