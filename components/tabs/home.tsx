import { supabase } from '@/lib/supabase';
import React from 'react';
import { View, Text, Button, StatusBar } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
    const session = useAuth();
    let showOnboarding = useProfile(session);

    if (showOnboarding) {
        // router.replace('/onboarding')
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View>
                <StatusBar backgroundColor="white" barStyle="dark-content" />
                <Text>Home Screen</Text>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>
        </SafeAreaView>
    );
}