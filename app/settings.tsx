import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    }, []);

    const handleBackgroundSelect = async (backgroundKey: keyof typeof backgroundImages) => {
        try {
            await AsyncStorage.setItem('selectedBackground', backgroundKey);
            setSelectedBackground(backgroundKey);
            Alert.alert('Berhasil', 'Background berhasil diubah!');
        } catch (error) {
            console.error('Error saving background:', error);
            Alert.alert('Error', 'Gagal menyimpan pengaturan background');
        }
    };

    const handleSaveAndReturn = () => {
        router.back();
    };

    return (
        <ScrollView style={styles.container}>
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Adzan TV v1.0.0</Text>
                    <Text style={styles.infoText}>Aplikasi untuk menampilkan jadwal sholat</Text>
                    <Text style={styles.infoText}>dengan tampilan TV yang menarik</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAndReturn}>
                <Text style={styles.saveButtonText}>Kembali ke Layar Utama</Text>
            </TouchableOpacity>
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
        borderColor: '#2C5F2D',
        backgroundColor: '#f0f8f0',
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
        borderColor: '#2C5F2D',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2C5F2D',
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
    saveButton: {
        backgroundColor: '#2C5F2D',
        margin: 15,
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
