import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const backgroundImages = {
    'abu-dabhi': {
        source: require('@/assets/images/abu-dabhi.jpg'),
        name: 'Abu Dhabi',
        description: 'Masjid di Abu Dhabi'
    },
    'abu-dabhi-2': {
        source: require('@/assets/images/abu-dabhi-2.jpg'),
        name: 'Abu Dhabi 2',
        description: 'Masjid di Abu Dhabi (Variasi 2)'
    },
    'turkey': {
        source: require('@/assets/images/turkey.jpg'),
        name: 'Turkey',
        description: 'Masjid di Turki'
    },
};

export default function SettingsScreen() {
    const router = useRouter();
    const [selectedBackground, setSelectedBackground] = useState<keyof typeof backgroundImages>('abu-dabhi');
    const [mosqueName, setMosqueName] = useState('MASJID AL-HIDAYAH');
    const [mosqueAddress, setMosqueAddress] = useState('Jl. Merdeka No. 123, Jakarta Pusat');
    const [adzanAudioEnabled, setAdzanAudioEnabled] = useState(true);

    useEffect(() => {
        // Load saved preferences
        const loadSettings = async () => {
            try {
                const savedBackground = await AsyncStorage.getItem('selectedBackground');
                const savedMosqueName = await AsyncStorage.getItem('mosqueName');
                const savedMosqueAddress = await AsyncStorage.getItem('mosqueAddress');
                const savedAdzanAudio = await AsyncStorage.getItem('adzanAudioEnabled');

                if (savedBackground && savedBackground in backgroundImages) {
                    setSelectedBackground(savedBackground as keyof typeof backgroundImages);
                }
                if (savedMosqueName) {
                    setMosqueName(savedMosqueName);
                }
                if (savedMosqueAddress) {
                    setMosqueAddress(savedMosqueAddress);
                }
                if (savedAdzanAudio !== null) {
                    setAdzanAudioEnabled(savedAdzanAudio === 'true');
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);

    const handleBackgroundSelect = async (backgroundKey: keyof typeof backgroundImages) => {
        try {
            await AsyncStorage.setItem('selectedBackground', backgroundKey);
            setSelectedBackground(backgroundKey);
        } catch (error) {
            console.error('Error saving background:', error);
            Alert.alert('Error', 'Gagal menyimpan pengaturan background');
        }
    };

    const handleAdzanAudioToggle = async (value: boolean) => {
        try {
            await AsyncStorage.setItem('adzanAudioEnabled', value.toString());
            setAdzanAudioEnabled(value);
        } catch (error) {
            console.error('Error saving adzan audio setting:', error);
            Alert.alert('Error', 'Gagal menyimpan pengaturan audio adzan');
        }
    };

    const handleSaveSettings = async () => {
        try {
            await AsyncStorage.setItem('mosqueName', mosqueName);
            await AsyncStorage.setItem('mosqueAddress', mosqueAddress);
            await AsyncStorage.setItem('adzanAudioEnabled', adzanAudioEnabled.toString());
            Alert.alert('Berhasil', 'Pengaturan berhasil disimpan!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Gagal menyimpan pengaturan');
        }
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Pengaturan',
            'Apakah Anda yakin ingin mengembalikan pengaturan ke default?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setMosqueName('MASJID AL-HIDAYAH');
                        setMosqueAddress('Jl. Merdeka No. 123, Jakarta Pusat');
                        setSelectedBackground('abu-dabhi');
                        setAdzanAudioEnabled(true);
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Mosque Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informasi Masjid</Text>
                <Text style={styles.sectionDescription}>
                    Masukkan nama dan alamat masjid yang akan ditampilkan di layar utama
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nama Masjid</Text>
                    <TextInput
                        style={styles.textInput}
                        value={mosqueName}
                        onChangeText={setMosqueName}
                        placeholder="Contoh: MASJID AL-HIDAYAH"
                        placeholderTextColor="#999"
                        maxLength={50}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Alamat Masjid</Text>
                    <TextInput
                        style={styles.textInput}
                        value={mosqueAddress}
                        onChangeText={setMosqueAddress}
                        placeholder="Contoh: Jl. Merdeka No. 123, Jakarta Pusat"
                        placeholderTextColor="#999"
                        maxLength={100}
                        multiline
                        numberOfLines={2}
                    />
                </View>
            </View>

            {/* Audio Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pengaturan Audio</Text>
                <Text style={styles.sectionDescription}>
                    Atur apakah audio adzan akan diputar saat masuk waktu sholat
                </Text>

                <View style={styles.switchContainer}>
                    <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>Aktifkan Audio Adzan</Text>
                        <Text style={styles.switchDescription}>
                            Audio adzan akan diputar otomatis saat masuk waktu sholat.
                            Adzan Subuh menggunakan lantunan khusus.
                        </Text>
                    </View>
                    <Switch
                        value={adzanAudioEnabled}
                        onValueChange={handleAdzanAudioToggle}
                        trackColor={{ false: '#ccc', true: '#1976D2' }} // Blue color
                        thumbColor={adzanAudioEnabled ? '#fff' : '#f4f3f4'}
                        style={styles.switch}
                    />
                </View>

                {adzanAudioEnabled && (
                    <View style={styles.audioInfo}>
                        <Text style={styles.audioInfoText}>
                            📢 Audio adzan akan diputar saat:
                        </Text>
                        <Text style={styles.audioInfoItem}>• Subuh: Menggunakan adzan khusus subuh</Text>
                        <Text style={styles.audioInfoItem}>• Dzuhur, Ashar, Maghrib, Isya: Menggunakan adzan standar</Text>
                    </View>
                )}
            </View>

            {/* Background Selection Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilih Background</Text>
                <Text style={styles.sectionDescription}>
                    Pilih background yang akan ditampilkan pada layar utama Adzan TV
                </Text>

                <View style={styles.backgroundOptions}>
                    {Object.entries(backgroundImages).map(([key, image]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.backgroundOption,
                                selectedBackground === key && styles.selectedOption
                            ]}
                            onPress={() => handleBackgroundSelect(key as keyof typeof backgroundImages)}
                        >
                            <Image source={image.source} style={styles.backgroundPreview} />
                            <View style={styles.optionInfo}>
                                <View style={styles.radioContainer}>
                                    <View style={[
                                        styles.radioButton,
                                        selectedBackground === key && styles.radioButtonSelected
                                    ]}>
                                        {selectedBackground === key && <View style={styles.radioButtonInner} />}
                                    </View>
                                    <Text style={styles.optionTitle}>{image.name}</Text>
                                </View>
                                <Text style={styles.optionDescription}>{image.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* App Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Adzan TV v1.0.0</Text>
                    <Text style={styles.infoText}>Aplikasi untuk menampilkan jadwal sholat</Text>
                    <Text style={styles.infoText}>dengan tampilan TV yang menarik</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset ke Default</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                    <Text style={styles.saveButtonText}>Simpan & Kembali</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        backgroundColor: '#fff',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    switchInfo: {
        flex: 1,
        marginRight: 15,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    switchDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    switch: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    audioInfo: {
        backgroundColor: '#E3F2FD', // Light blue background
        padding: 15,
        borderRadius: 8,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#1976D2', // Blue color
    },
    audioInfoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0D47A1', // Navy blue color
        marginBottom: 8,
    },
    audioInfoItem: {
        fontSize: 13,
        color: '#555',
        marginBottom: 3,
        marginLeft: 5,
    },
    backgroundOptions: {
        gap: 15,
    },
    backgroundOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    selectedOption: {
        borderColor: '#1976D2', // Blue color
        backgroundColor: '#E3F2FD', // Light blue background
    },
    backgroundPreview: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
    },
    optionInfo: {
        flex: 1,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        borderColor: '#1976D2', // Blue color
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1976D2', // Blue color
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    optionDescription: {
        fontSize: 14,
        color: '#666',
        marginLeft: 30,
    },
    infoContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        margin: 15,
        gap: 10,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#0D47A1', // Navy blue color
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
