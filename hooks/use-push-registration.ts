import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/auth-store';
import { registerPushDevice } from '@/api/push';

/**
 * 로그인된 상태에서 Expo push token을 얻어 서버에 등록합니다.
 * accessToken이 생기는 순간(로그인/회원가입 직후) 자동으로 실행됩니다.
 */
export function usePushRegistration() {
    const accessToken = useAuthStore(s => s.accessToken);

    useEffect(() => {
        if (!accessToken) return;
        registerDevice();
    }, [accessToken]);
}

async function registerDevice() {
    // 실기기가 아니면 Expo push token을 발급받을 수 없음
    if (!Device.isDevice) return;

    // TODO 실습 8-1
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: '기본 알림',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#0095F6',
        });
    }

    // TODO 실습 4-1
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        const { status: requested } =
            await Notifications.requestPermissionsAsync();
        status = requested;
    }
    if (status !== 'granted') return;

    // TODO 실습 4-2
    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerPushDevice(token.data);
}
