import { useState, useCallback } from 'react';
import { api } from '@/api/supabaseApi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/providers/AppProvider';

export const useProfile = () => {
  const session = useAuth();
  const [profileDetails, setProfileDetails] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentUserProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
        const data = await api.getCurrentUserProfile(session.user.id);
        //console.log('Fetched Current User Profile:', data);
        setCurrentUserProfile(data);
    } catch (err) {
        console.error('Error fetching current user profile:', err);
        setError(err);
    } finally {
        setLoading(false);
    }
  }, [session]);

  const fetchProfileDetails = useCallback(async (userId: string) => {
    if (!userId) return null;
    try {
        const { data, error } = await supabase
            .from('profile_details')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`No profile details found for user ${userId}`);
                return null; // Return null instead of throwing an error
            }
            throw error;
        }
        return data;
    } catch (err) {
        console.error('Error fetching profile details:', err);
        return null; // Return null on error
    }
}, []);

  return { profileDetails, loading, error, fetchProfileDetails, fetchCurrentUserProfile, currentUserProfile };
};

export const usePotentialMatches = () => {
  const session = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { searchFilters } = useAppContext();

  const fetchMatches = useCallback(async (limit = 10) => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_potential_matches', {
        user_id: session.user.id,
        limit_count: limit,
      });
      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchFilteredMatches = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      // go through the searchFilters and if they are null, remove them
      // const removeNullFilters = Object.fromEntries(Object.entries(searchFilters).filter(([key, value]) => value !== null && value !== undefined && value !== '' && value !== [] && value == NaN));

      const { data, error } = await supabase.rpc('get_filtered_matches', {
        user_id: session.user.id,
        limit_count: 10,
        looking_for: 1,
        // smoking_status_filter : 2,
        // drinking_status_filter : 2,
      });
      if (error) {
        if (error.code === 'PGRST202') {
          console.log(`No potential matches found`);
          setMatches([]);
          return null;
        } 
        throw error;
      }
      console.log("Filtered matches data:", data);
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
      } else {
        console.log("No matches found or invalid data format");
        setMatches([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const recordAction = useCallback(async (matchedUserId: string, action: 'like' | 'dislike') => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase.rpc('handle_match_action', {
        acting_user_id: session.user.id,
        target_user_id: matchedUserId,
        match_action: action === 'like' ? 1 : 0,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [session]);

  const createInteraction = async (otherUserId: string, action: string, mode: number) => {
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: existingInteraction, error: fetchError } = await supabase
      .from('interactions')
      .select()
      .eq('user_id', currentUser.user.id)
      .eq('other_user_id', otherUserId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existingInteraction) {
      const { data, error } = await supabase
        .from('interactions')
        .update({
          is_liked: action === 'like' ? 1 : 0,
          interaction_mode: mode
        })
        .eq('id', existingInteraction.id)
        .select();

      if (error) throw error;
      return data[0];
    } else {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          user_id: currentUser.user.id,
          other_user_id: otherUserId,
          is_liked: action === 'like' ? 1 : 0,
          interaction_mode: mode
        })
        .select();

      if (error) throw error;
      return data[0];
    }
  };

  return {
    matches,
    loading,
    error,
    fetchMatches,
    fetchFilteredMatches,
    recordAction,
    createInteraction,
  };
};
