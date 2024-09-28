// components/tabs/inbox.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';

type Match = {
    id: string;
    name: string;
    avatar_url: string;
};

export default function Inbox() {
    // const [matches, setMatches] = useState<Match[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    // const navigation = useNavigation();
    // const session = useAuth();

    // useEffect(() => {
    //     if (session?.user) {
    //         fetchMatches();
    //     }
    // }, [session]);

    // const fetchMatches = async () => {
    //     try {
    //         setLoading(true);
    //         const { data, error } = await supabase
    //             .from('matches')
    //             .select(`
    //                 id,
    //                 matched_at,
    //                 profiles_test!matches_user2_id_fkey (
    //                     id,
    //                     name,
    //                     avatar_url
    //                 )
    //                 `)
    //             .eq('user1_id', session?.user.id)

    //         //.not('matched_at', 'is', null);

    //         if (error) throw error;

    //         setMatches(data.map((match: any) => ({
    //             id: match.profiles_test.id,
    //             name: match.profiles_test.name,
    //             avatar_url: match.profiles_test.avatar_url,
    //             matched_at: match.matched_at
    //         })));
    //     } catch (error) {
    //         console.error('Error fetching matches:', error);
    //         setError(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const renderMatch = ({ item }: { item: Match }) => (
    //     <Pressable
    //         style={styles.matchItem}
    //         onPress={() => navigation.navigate('Chat', { matchId: item.id, matchName: item.name })}
    //     >
    //         <Text style={styles.matchName}>{item.name}</Text>
    //     </Pressable>
    // );

    // if (loading) {
    //     return (
    //         <SafeAreaView style={defaultStyles.SafeAreaView}>
    //             <View style={styles.centerContainer}>
    //                 <ActivityIndicator size="large" />
    //             </View>
    //         </SafeAreaView>
    //     );
    // }

    // if (error) {
    //     return (
    //         <SafeAreaView style={defaultStyles.SafeAreaView}>
    //             <View style={styles.centerContainer}>
    //                 <Text style={styles.errorText}>Error: {error}</Text>
    //             </View>
    //         </SafeAreaView>
    //     );
    // }

    // return (
    //     <SafeAreaView style={defaultStyles.SafeAreaView}>
    //         <View style={defaultStyles.innerContainer}>
    //             <Text style={defaultStyles.h2}>Inbox</Text>
    //             {matches.length > 0 ? (
    //                 <FlatList
    //                     data={matches}
    //                     renderItem={renderMatch}
    //                     keyExtractor={(item) => item.id}
    //                 />
    //             ) : (
    //                 <Text style={styles.noMatchesText}>No matches yet</Text>
    //             )}
    //         </View>
    //     </SafeAreaView>
    // );
}

const styles = StyleSheet.create({
    matchItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.tertiary,
    },
    matchName: {
        fontSize: 16,
        fontFamily: 'BodySemiBold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    noMatchesText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});