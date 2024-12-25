import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mmarjzhissgpyfwxudqd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tYXJqemhpc3NncHlmd3h1ZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0Mzg2MTUsImV4cCI6MjAzMzAxNDYxNX0.9GLFl6ZosXtNoL61uFx3L1nUc5ENRSWRnhS-LTDb6SA"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})