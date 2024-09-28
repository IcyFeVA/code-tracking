import { useState, useCallback } from 'react';
import { api } from '@/api/supabaseApi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

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
        console.log('Fetched Current User Profile:', data);
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

  const fetchDiveMatches = useCallback(async (limit = 10) => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_potential_dive_matches', {
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

  return { matches, loading, error, fetchMatches, fetchDiveMatches, recordAction };
};