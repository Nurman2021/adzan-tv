import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export class AdzanAudioManager {
    private static instance: AdzanAudioManager;
    private sound: Audio.Sound | null = null;
    private isPlaying = false;

    private constructor() { }

    public static getInstance(): AdzanAudioManager {
        if (!AdzanAudioManager.instance) {
            AdzanAudioManager.instance = new AdzanAudioManager();
        }
        return AdzanAudioManager.instance;
    }

    public async initializeAudio() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }

    public async isAdzanEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem('adzanAudioEnabled');
            return enabled === 'true';
        } catch (error) {
            console.error('Error checking adzan enabled status:', error);
            return false;
        }
    }

    public async playAdzan(audioFile: string, prayerName: string) {
        try {
            const isEnabled = await this.isAdzanEnabled();
            if (!isEnabled) {
                console.log('Adzan audio is disabled');
                return;
            }

            if (this.isPlaying) {
                console.log('Adzan is already playing');
                return;
            }

            // Stop any currently playing sound
            await this.stopAdzan();

            console.log(`Playing adzan for ${prayerName}`);

            // Load the appropriate audio file
            const audioSource = audioFile === 'adzan_subuh.mp3'
                ? require('@/assets/audio/adzan_subuh.mp3')  // You'll need to add this file
                : require('@/assets/audio/adzan.mp3');       // You'll need to add this file

            const { sound } = await Audio.Sound.createAsync(audioSource, {
                shouldPlay: true,
                isLooping: false,
                volume: 1.0,
            });

            this.sound = sound;
            this.isPlaying = true;

            // Set up completion handler
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    this.isPlaying = false;
                    this.stopAdzan();
                }
            });

        } catch (error) {
            console.error('Error playing adzan:', error);
            this.isPlaying = false;
        }
    }

    public async stopAdzan() {
        try {
            if (this.sound) {
                await this.sound.unloadAsync();
                this.sound = null;
            }
            this.isPlaying = false;
        } catch (error) {
            console.error('Error stopping adzan:', error);
        }
    }

    public getIsPlaying(): boolean {
        return this.isPlaying;
    }
}

export const adzanAudio = AdzanAudioManager.getInstance();