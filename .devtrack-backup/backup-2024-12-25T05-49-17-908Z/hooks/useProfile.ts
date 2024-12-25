// src/hooks/useProfile.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';

export const useProfile = (session: Session | null) => {
    const [onboardingDone, setOnboardingDone] = useState<boolean>(false);

    useEffect(() => {
        if (session) {
            const getProfile = async () => {
                try {
                    const { data } = await supabase
                        .from('profiles_test')
                        .select('name')
                        .eq('id', session?.user.id)
                        .single();

                        if(data) {
                            console.log('database data received', data)
                            setOnboardingDone(data?.name != null);
                        }
                    
                } catch (error: any) { 
                    Alert.alert(error.message);
                }
            };

            getProfile();
        }
    }, [session]);

    return onboardingDone;
};
