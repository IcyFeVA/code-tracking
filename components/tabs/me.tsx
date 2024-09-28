import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { StyleSheet, View, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Button } from 'react-native-ui-lib'
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '@/components/Avatar'


export default function Me() {
    const session = useAuth();
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        if (session?.user) getProfile()
    }, [session])

    async function getProfile() {
        console.log('getProfile')
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const { data, error, status } = await supabase
                .from('profiles_test')
                .select('*')
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }
            console.log("🚀 ~ getProfile ~ data:", data)
            if (data) {
                setName(data.name)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({
        name,
        avatar_url,
    }: {
        name: string
        avatar_url: string
    }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                name,
                avatar_url,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles_test').upsert(updates)

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.inner}>
                    <ScrollView style={styles.container}>
                        <View>
                            <Avatar
                                size={80}
                                url={avatarUrl}
                                onUpload={(url: string) => {
                                    setAvatarUrl(url)
                                    updateProfile({ name, avatar_url: url })
                                }}
                            />
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            {/* <Input label="Email" value={session?.user?.email} disabled /> */}
                        </View>
                        <View style={styles.verticallySpaced}>
                            {/* <Input label="Name" value={name || ''} onChangeText={(text) => setName(text)} /> */}
                        </View>
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <Button
                                // title={loading ? 'Loading ...' : 'Update'}
                                onPress={() => updateProfile({ name, avatar_url: avatarUrl })}
                                disabled={loading}
                            />
                        </View>
                        <View style={styles.verticallySpaced}>
                            {/* <Button title="Sign Out" onPress={() => supabase.auth.signOut()} /> */}
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})