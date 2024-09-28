import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const [matchNotifications, setMatchNotifications] = useState([]);
    const notificationListener = useRef();
    const responseListener = useRef();
    const session = useAuth();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    useEffect(() => {
        let subscription;

        const setupMatchNotifications = async () => {
            if (session?.user.id) {
                // Initial fetch of unread notifications
                const { data, error } = await supabase
                    .rpc('get_unread_match_notifications', { user_id: session.user.id });

                if (data) {
                    setMatchNotifications(data);
                    console.log('Initial match notifications:', data);
                }

                // Set up realtime subscription
                subscription = supabase
                    .channel('match_notifications')
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'match_notifications',
                            filter: `user_id=eq.${session.user.id}`,
                        },
                        (payload) => {
                            console.log('New match notification:', payload);
                            setMatchNotifications(prevNotifications => [...prevNotifications, payload.new]);
                        }
                    )
                    .subscribe();
            }
        };

        setupMatchNotifications();

        // Cleanup function
        return () => {
            if (subscription) {
                supabase.removeChannel(subscription);
            }
        };
    }, [session?.user.id]);

    return { expoPushToken, notification, matchNotifications };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
    } else {
        console.log('Must use physical device for Push Notifications');
    }
    console.log('token', token)
    // Store the token in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { error } = await supabase
            .from('profiles_test')
            .update({ push_token: token })
            .eq('id', user.id);

        if (error) {
            console.error('Error storing push token:', error);
        }
    }

    return token;
}