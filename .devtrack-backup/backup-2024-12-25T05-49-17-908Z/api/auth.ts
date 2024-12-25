import { supabase } from '@/lib/supabase';

export async function fetchStreamToken(userId: string): Promise<string> {
  try {
    console.log("Fetching Stream token for user:", userId);
    const { data, error } = await supabase.functions.invoke('generate-stream-token', {
      body: { user: { id: userId } },
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }
    if (!data || !data.token) {
      console.error("No token received. Data:", data);
      throw new Error('No token received');
    }

    console.log("Stream token fetched successfully");
    return data.token;
  } catch (error) {
    console.error('Error fetching Stream token:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', await error.response.text());
    }
    throw error;
  }
}


/*
usage in component:


import { fetchStreamToken } from '@/api/auth';

// In your component or hook
useEffect(() => {
  const getStreamToken = async () => {
    try {
      const token = await fetchStreamToken(userId);
      console.log("Received token:", token);
      // Use the token here
    } catch (error) {
      console.error("Error getting stream token:", error);
    }
  };

  getStreamToken();
}, [userId]);
*/